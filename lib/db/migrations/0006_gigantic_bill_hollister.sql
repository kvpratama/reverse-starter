ALTER TABLE "job_posts_candidate" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ALTER COLUMN "status" SET DEFAULT 'shortlisted'::text;--> statement-breakpoint
DROP TYPE "public"."job_status";--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('applied', 'contacted', 'interview_invited', 'interview_scheduled', 'interviewed', 'shortlisted', 'offer', 'hired', 'rejected');--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ALTER COLUMN "status" SET DEFAULT 'shortlisted'::"public"."job_status";--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ALTER COLUMN "status" SET DATA TYPE "public"."job_status" USING "status"::"public"."job_status";