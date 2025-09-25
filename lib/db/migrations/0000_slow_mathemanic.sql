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
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"jobseekers_id" uuid NOT NULL,
	"jobseekers_profile_id" uuid NOT NULL,
	"job_post_id" uuid NOT NULL
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
	"company_name" varchar(128),
	"company_profile" text,
	"job_title" varchar(128),
	"job_location" varchar(128),
	"job_description" text,
	"job_requirements" text,
	"perks" text,
	"job_subcategories_id" uuid,
	"core_skills" text,
	"nice_to_have_skills" text,
	"screening_questions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "job_posts_candidate" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"job_post_id" uuid,
	"reasoning" text,
	"similarity_score" integer,
	"similarity_score_bio" integer,
	"similarity_score_skills" integer,
	"similarity_score_screening" integer,
	"status" "job_status" DEFAULT 'shortlisted',
	"screening_answers" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "unique_application" UNIQUE("profile_id","job_post_id")
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
	"nationality" varchar(50),
	"visa_status" varchar(20),
	"age" integer,
	"resume_url" varchar(255) NOT NULL,
	"bio" text,
	"skills" text,
	"experience" "experience_level" NOT NULL,
	"desired_salary" integer,
	"job_subcategories_id" uuid,
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
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL
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
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_jobseekers_id_users_id_fk" FOREIGN KEY ("jobseekers_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_jobseekers_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("jobseekers_profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts" ADD CONSTRAINT "job_posts_job_subcategories_id_job_subcategories_id_fk" FOREIGN KEY ("job_subcategories_id") REFERENCES "public"."job_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posts_candidate" ADD CONSTRAINT "job_posts_candidate_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_subcategories" ADD CONSTRAINT "job_subcategories_category_id_job_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."job_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_education" ADD CONSTRAINT "jobseekers_education_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile" ADD CONSTRAINT "jobseekers_profile_job_subcategories_id_job_subcategories_id_fk" FOREIGN KEY ("job_subcategories_id") REFERENCES "public"."job_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_work_experience" ADD CONSTRAINT "jobseekers_work_experience_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_posts_user_id" ON "job_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_job_subcategories_id" ON "job_posts" USING btree ("job_subcategories_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_profile_id" ON "job_posts_candidate" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_job_post_id" ON "job_posts_candidate" USING btree ("job_post_id");--> statement-breakpoint
CREATE INDEX "idx_job_posts_candidate_status" ON "job_posts_candidate" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_job_subcategories_category_id" ON "job_subcategories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_education_profile_id" ON "jobseekers_education" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_user_id" ON "jobseekers_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_job_subcategories_id" ON "jobseekers_profile" USING btree ("job_subcategories_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_work_experience_profile_id" ON "jobseekers_work_experience" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role_id" ON "users" USING btree ("role_id");