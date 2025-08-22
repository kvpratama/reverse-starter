import { getUser } from "@/lib/db/queries";
import { getJobPostsByUser } from "@/lib/db/queries";

export default async function MyJobsPage() {
  const user = await getUser();

  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }

  const jobPosts = await getJobPostsByUser(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Jobs</h1>
      <div className="mt-4">
        {jobPosts.map((jobPost) => (
          <div key={jobPost.id} className="border p-4 my-2 rounded-md">
            <h2 className="text-xl font-semibold">{jobPost.jobTitle}</h2>
            <p className="text-gray-500">{jobPost.jobDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
}