CREATE TYPE "public"."experience_level" AS ENUM('entry', 'mid', 'senior');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('applied', 'interview', 'offer', 'rejected', 'hired', 'contacted', 'shortlisted');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45)
);
--> statement-breakpoint
CREATE TABLE "job_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"job_title" varchar(128),
	"job_description" text,
	"job_requirements" text,
	"perks" text,
	"job_role_id" uuid,
	"core_skills" text,
	"nice_to_have_skills" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_posts_candidate" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"job_post_id" uuid,
	"similarity_score" double precision,
	"similarity_score_bio" double precision,
	"similarity_score_skills" double precision,
	"status" "job_status" DEFAULT 'shortlisted',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "unique_application" UNIQUE("profile_id","job_post_id")
);
--> statement-breakpoint
CREATE TABLE "job_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"subcategory_id" uuid,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_subcategories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"category_id" uuid,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobseekers_education" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"start_date" varchar(100),
	"end_date" varchar(100),
	"degree" varchar(100),
	"institution" varchar(100),
	"field_of_study" varchar(100),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "jobseekers_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"profile_name" varchar(100),
	"name" varchar(100),
	"email" varchar(255) NOT NULL,
	"resume_url" varchar(255) NOT NULL,
	"bio" text,
	"skills" text,
	"experience" "experience_level" NOT NULL,
	"desired_salary" integer,
	"job_role_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "jobseekers_work_experience" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"start_date" varchar(100),
	"end_date" varchar(100),
	"position" varchar(100),
	"company" varchar(100),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" varchar(20) NOT NULL,
	"route" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
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
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_job_role_id_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."job_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_roles" ADD CONSTRAINT "job_roles_subcategory_id_job_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."job_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_subcategories" ADD CONSTRAINT "job_subcategories_category_id_job_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."job_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_education" ADD CONSTRAINT "jobseekers_education_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_job_role_id_job_roles_id_fk" FOREIGN KEY ("job_role_id") REFERENCES "public"."job_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_work_experience" ADD CONSTRAINT "jobseekers_work_experience_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_posts_user_id" ON "job_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_job_role_id" ON "job_posts" USING btree ("job_role_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_profile_id" ON "job_posts_candidate" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_job_post_id" ON "job_posts_candidate" USING btree ("job_post_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_status" ON "job_posts_candidate" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_roles_subcategory_id" ON "job_roles" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "idx_job_subcategories_category_id" ON "job_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_education_profile_id" ON "jobseekers_education" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_user_id" ON "jobseekers_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_job_role_id" ON "jobseekers_profile" USING btree ("job_role_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_work_experience_profile_id" ON "jobseekers_work_experience" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" USING btree ("role_id");