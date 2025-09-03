-- Create ENUMs first
-- CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior');
-- CREATE TYPE job_status AS ENUM ('applied', 'interview', 'offer', 'rejected', 'hired', 'contacted', 'shortlisted');

-- Core tables
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20) NOT NULL,
	"route" varchar(20)
);

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

CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);

-- Job categorization hierarchy
CREATE TABLE IF NOT EXISTS "job_categories" (
    "id" UUID PRIMARY KEY NOT NULL,
    "name" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "job_subcategories" (
    "id" UUID PRIMARY KEY NOT NULL,
	"category_id" UUID REFERENCES "job_categories"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "job_roles" (
    "id" UUID PRIMARY KEY NOT NULL,
	"subcategory_id" UUID REFERENCES "job_subcategories"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL
);

-- Jobseeker profile and related tables
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
	"desired_salary" integer,
	"job_role_id" UUID REFERENCES "job_roles"("id"),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "jobseekers_work_experience" (
    "id" UUID PRIMARY KEY NOT NULL,
    "profile_id" UUID REFERENCES "jobseekers_profile"("id") ON DELETE CASCADE,
	"start_date" varchar(100),
    "end_date" varchar(100),
    "position" varchar(100),
    "company" varchar(100),
    "description" text
);

CREATE TABLE IF NOT EXISTS "jobseekers_education" (
    "id" UUID PRIMARY KEY NOT NULL,
    "profile_id" UUID REFERENCES "jobseekers_profile"("id") ON DELETE CASCADE,
	"start_date" varchar(100),
    "end_date" varchar(100),
    "degree" varchar(100),
    "institution" varchar(100),
    "field_of_study" varchar(100),
    "description" text
);

-- Job posts and applications
CREATE TABLE IF NOT EXISTS "job_posts" (
	"id" UUID PRIMARY KEY NOT NULL,
	"user_id" UUID,
	"job_title" varchar(128),
	"job_description" text,
	"job_requirements" text,
	"perks" text,
	"job_role_id" UUID REFERENCES "job_roles"("id"),
	"core_skills" text,
	"nice_to_have_skills" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "job_posts_candidate" (
	"id" UUID PRIMARY KEY NOT NULL,
	"profile_id" UUID,
	"job_post_id" UUID,
	"similarity_score" double precision,
	"similarity_score_bio" double precision,
	"similarity_score_skills" double precision,
	"status" job_status DEFAULT 'shortlisted',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT unique_application UNIQUE ("profile_id", "job_post_id")
);

-- Foreign key constraints
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_role_id" ON "users" ("role_id");
CREATE INDEX IF NOT EXISTS "idx_jobseekers_profile_user_id" ON "jobseekers_profile" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_jobseekers_profile_job_role_id" ON "jobseekers_profile" ("job_role_id");
CREATE INDEX IF NOT EXISTS "idx_jobseekers_work_experience_profile_id" ON "jobseekers_work_experience" ("profile_id");
CREATE INDEX IF NOT EXISTS "idx_jobseekers_education_profile_id" ON "jobseekers_education" ("profile_id");
CREATE INDEX IF NOT EXISTS "idx_job_posts_user_id" ON "job_posts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_job_posts_job_role_id" ON "job_posts" ("job_role_id");
CREATE INDEX IF NOT EXISTS "idx_job_posts_candidate_profile_id" ON "job_posts_candidate" ("profile_id");
CREATE INDEX IF NOT EXISTS "idx_job_posts_candidate_job_post_id" ON "job_posts_candidate" ("job_post_id");
CREATE INDEX IF NOT EXISTS "idx_job_posts_candidate_status" ON "job_posts_candidate" ("status");
CREATE INDEX IF NOT EXISTS "idx_job_subcategories_category_id" ON "job_subcategories" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_job_roles_subcategory_id" ON "job_roles" ("subcategory_id");