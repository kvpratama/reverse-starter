CREATE TABLE "interview_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"job_post_id" uuid NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"interview_type" varchar(50) NOT NULL,
	"date_time_slots" text NOT NULL,
	"meeting_link" varchar(500),
	"notes" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"confirmed_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_invitations" ADD CONSTRAINT "interview_invitations_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_invitations" ADD CONSTRAINT "interview_invitations_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_invitations" ADD CONSTRAINT "interview_invitations_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;