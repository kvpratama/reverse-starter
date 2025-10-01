import { getJobCategoriesData } from "@/lib/db/queries";
import CreateNewProfile from "@/components/dashboard/CreateNewProfile";

export default async function NewProfilePage() {
  const jobCategoriesData = await getJobCategoriesData();

  return <CreateNewProfile jobCategoriesData={jobCategoriesData} />;
}
