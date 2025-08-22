CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" UUID PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role_id" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20) NOT NULL,
	"route" varchar(20)
);
--> statement-breakpoint
-- CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior');

CREATE TABLE IF NOT EXISTS "jobseekers_profile" (
	"id" UUID PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"profile_name" varchar(100),
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"resume_url" varchar(255) NOT NULL,
	"bio" text,
	"skills" text,
	"experience" experience_level NOT NULL,
	"desired_salary" integer
);

CREATE TABLE IF NOT EXISTS "job_posts" (
	"id" UUID PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"job_title" varchar(128),
	"job_description" text,
	"job_requirements" text,
	"perks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "job_posts_candidate" (
	"id" UUID PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"job_post_id" UUID
);

--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;