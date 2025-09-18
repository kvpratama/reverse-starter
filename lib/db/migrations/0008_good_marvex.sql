ALTER TABLE "job_posts_candidate" ALTER COLUMN "similarity_score" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ALTER COLUMN "similarity_score_bio" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ALTER COLUMN "similarity_score_skills" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD COLUMN "reasoning" text;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD COLUMN "similarity_score_screening" integer;