CREATE TYPE "public"."interview_status" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('phone_screen', 'technical', 'behavioral', 'final_round', 'hr_round', 'team_meet');--> statement-breakpoint
CREATE TABLE "interview_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"candidate_profile_id" uuid NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"status" "interview_status" DEFAULT 'scheduled' NOT NULL,
	"meeting_link" varchar(500),
	"meeting_password" varchar(100),
	"location" varchar(255),
	"candidate_notes" text,
	"recruiter_notes" text,
	"reminder_sent" boolean DEFAULT false NOT NULL,
	"reminder_sent_at" timestamp,
	"recruiter_feedback" text,
	"candidate_feedback" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "interview_reschedule_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"previous_date" timestamp NOT NULL,
	"new_date" timestamp NOT NULL,
	"reason" text,
	"rescheduled_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiter_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_application_id_job_posts_candidate_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_posts_candidate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_bookings" ADD CONSTRAINT "interview_bookings_candidate_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("candidate_profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_reschedule_history" ADD CONSTRAINT "interview_reschedule_history_booking_id_interview_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."interview_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_reschedule_history" ADD CONSTRAINT "interview_reschedule_history_rescheduled_by_users_id_fk" FOREIGN KEY ("rescheduled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiter_availability" ADD CONSTRAINT "recruiter_availability_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_interview_bookings_application_id" ON "interview_bookings" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "idx_interview_bookings_recruiter_id" ON "interview_bookings" USING btree ("recruiter_id");--> statement-breakpoint
CREATE INDEX "idx_interview_bookings_candidate_profile_id" ON "interview_bookings" USING btree ("candidate_profile_id");--> statement-breakpoint
CREATE INDEX "idx_interview_bookings_scheduled_date" ON "interview_bookings" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_interview_bookings_status" ON "interview_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_interview_reschedule_history_booking_id" ON "interview_reschedule_history" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_recruiter_availability_recruiter_id" ON "recruiter_availability" USING btree ("recruiter_id");--> statement-breakpoint
CREATE INDEX "idx_recruiter_availability_day" ON "recruiter_availability" USING btree ("day_of_week");