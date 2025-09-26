CREATE TABLE "job_post_subcategories" (
	"job_post_id" uuid NOT NULL,
	"subcategory_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_post_subcategories_job_post_id_subcategory_id_pk" PRIMARY KEY("job_post_id","subcategory_id")
);
--> statement-breakpoint
CREATE TABLE "jobseekers_profile_subcategories" (
	"profile_id" uuid NOT NULL,
	"subcategory_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobseekers_profile_subcategories_profile_id_subcategory_id_pk" PRIMARY KEY("profile_id","subcategory_id")
);
--> statement-breakpoint
ALTER TABLE "job_posts" DROP CONSTRAINT "job_posts_job_subcategories_id_job_subcategories_id_fk";
--> statement-breakpoint
ALTER TABLE "jobseekers_profile" DROP CONSTRAINT "jobseekers_profile_job_subcategories_id_job_subcategories_id_fk";
--> statement-breakpoint
DROP INDEX "idx_job_posts_job_subcategories_id";--> statement-breakpoint
DROP INDEX "idx_jobseekers_profile_job_subcategories_id";--> statement-breakpoint
ALTER TABLE "job_subcategories" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_post_subcategories" ADD CONSTRAINT "job_post_subcategories_job_post_id_job_posts_id_fk" FOREIGN KEY ("job_post_id") REFERENCES "public"."job_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_post_subcategories" ADD CONSTRAINT "job_post_subcategories_subcategory_id_job_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."job_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile_subcategories" ADD CONSTRAINT "jobseekers_profile_subcategories_profile_id_jobseekers_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."jobseekers_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobseekers_profile_subcategories" ADD CONSTRAINT "jobseekers_profile_subcategories_subcategory_id_job_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."job_subcategories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_post_subcategories_job_post" ON "job_post_subcategories" USING btree ("job_post_id");--> statement-breakpoint
CREATE INDEX "idx_job_post_subcategories_subcategory" ON "job_post_subcategories" USING btree ("subcategory_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_subcategories_profile" ON "jobseekers_profile_subcategories" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "idx_jobseekers_profile_subcategories_subcategory" ON "jobseekers_profile_subcategories" USING btree ("subcategory_id");--> statement-breakpoint
ALTER TABLE "job_posts" DROP COLUMN "job_subcategories_id";--> statement-breakpoint
ALTER TABLE "jobseekers_profile" DROP COLUMN "job_subcategories_id";