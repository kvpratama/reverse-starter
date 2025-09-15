import { NextRequest, NextResponse } from "next/server";
import { getJobseekerProfileById, getUser } from "@/lib/db/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const profile = await getJobseekerProfileById(id, user.id);
    if (!profile)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ profile });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
