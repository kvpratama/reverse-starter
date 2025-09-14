ALTER TABLE "job_posts" ADD COLUMN "company_name" varchar(128);--> statement-breakpoint
ALTER TABLE "job_posts" ADD COLUMN "company_profile" text;--> statement-breakpoint
ALTER TABLE "job_posts" ADD COLUMN "job_location" varchar(128);