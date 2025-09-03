import { Suspense } from "react";
import { Login } from "../login";
import { db } from "@/lib/db/drizzle";
import { roles } from "@/lib/db/schema";

export default async function SignUpPage() {
  const role = await db.select().from(roles);
  return (
    <Suspense>
      <Login mode="signup" roles={role} />
    </Suspense>
  );
}
