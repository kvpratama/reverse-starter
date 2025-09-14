ALTER TABLE "conversations" RENAME COLUMN "jobseeker_id" TO "jobseekers_profile_id";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_jobseeker_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_jobseekers_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("jobseekers_profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE no action ON UPDATE no action;