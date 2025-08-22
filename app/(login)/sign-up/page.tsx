import { Suspense } from "react";
import { Login } from "../login";
import { db } from "@/lib/db/drizzle";
import { role } from "@/lib/db/schema";

export default async function SignUpPage() {
  const roles = await db.select().from(role);
  return (
    <Suspense>
      <Login mode="signup" roles={roles} />
    </Suspense>
  );
}
