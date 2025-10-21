import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle"; // Check path correctness
import {
  jobPostsCandidate,
  jobseekersProfile,
  jobPosts,
  users,
} from "@/lib/db/schema"; // Check path correctness
import { eq, and, inArray, SQL } from "drizzle-orm"; // Added SQL type for where conditions
// import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";
import type { JobStatus } from "@/lib/db/schema";
import { RECRUITER_ROLE_ID, JOBSEEKER_ROLE_ID } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");

    // Parse status filter (can be comma-separated)
    let statusFilter: JobStatus[] | undefined;
    if (statusParam) {
      statusFilter = statusParam.split(",") as JobStatus[];
    }

    // Get user to check role
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = currentUser[0];

    // Build the base query
    const baseApplicationsQuery = db
      .select({
        application: jobPostsCandidate,
        profile: jobseekersProfile,
        jobPost: jobPosts,
        recruiter: {
          id: users.id,
          name: users.name,
          email: users.email,
          roleId: users.roleId,
        },
      })
      .from(jobPostsCandidate)
      .innerJoin(
        jobseekersProfile,
        eq(jobPostsCandidate.profileId, jobseekersProfile.id)
      )
      .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id))
      .innerJoin(users, eq(jobPosts.userId, users.id));

    // Array to hold all dynamic where conditions
    const whereConditions: (SQL | undefined)[] = [];

    // Filter based on role
    if (user.roleId === RECRUITER_ROLE_ID) {
      // Recruiter - only show their job posts
      whereConditions.push(eq(jobPosts.userId, session.user.id));
    } else if (user.roleId === JOBSEEKER_ROLE_ID) {
      // Candidate - only show their applications
      const candidateProfile = await db
        .select()
        .from(jobseekersProfile)
        .where(eq(jobseekersProfile.userId, session.user.id))
        .limit(1);

      if (candidateProfile.length === 0) {
        // If candidate has no profile, return empty array immediately
        return NextResponse.json([]);
      }

      whereConditions.push(
        eq(jobPostsCandidate.profileId, candidateProfile[0].id)
      );
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Apply status filter if provided
    if (statusFilter && statusFilter.length > 0) {
      whereConditions.push(inArray(jobPostsCandidate.status, statusFilter));
    }

    // Combine all conditions using `and` and execute the query
    // The `and()` function automatically filters out undefined values.
    if (whereConditions.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const applications = await baseApplicationsQuery.where(
      and(...whereConditions)
    );

    // Transform to match expected interface
    const response = applications.map((app) => ({
      application: app.application,
      profile: app.profile,
      jobPost: app.jobPost,
      recruiter: app.recruiter,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
