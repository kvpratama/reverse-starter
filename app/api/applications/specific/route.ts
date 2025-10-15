import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  jobPostsCandidate,
  jobseekersProfile,
  jobPosts,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const jobPostId = searchParams.get("jobPostId");

    if (!profileId || !jobPostId) {
      return NextResponse.json(
        { error: "profileId and jobPostId are required" },
        { status: 400 }
      );
    }

    console.log(`jobPostId: ${jobPostId}`);
    console.log("session.user.id:", session.user.id);
    console.log("search param profileId:", profileId);

    // Fetch the specific application
    const application = await db
      .select({
        application: jobPostsCandidate,
        profile: jobseekersProfile,
        jobPost: jobPosts,
        recruiter: users,
      })
      .from(jobPostsCandidate)
      .innerJoin(
        jobseekersProfile,
        eq(jobPostsCandidate.profileId, jobseekersProfile.id)
      )
      .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id))
      .innerJoin(users, eq(jobPosts.userId, users.id))
      .where(
        and(
          eq(jobPostsCandidate.profileId, profileId),
          eq(jobPostsCandidate.jobPostId, jobPostId)
        )
      )
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the user has access to this application
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = currentUser[0];
    const app = application[0];

    // Check access rights
    const isRecruiterOwner =
      user.roleId === 2 && app.jobPost.userId === user.id;
    const isCandidateOwner =
      user.roleId === 1 && app.profile.userId === user.id;
    if (!isRecruiterOwner && !isCandidateOwner) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error fetching specific application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
