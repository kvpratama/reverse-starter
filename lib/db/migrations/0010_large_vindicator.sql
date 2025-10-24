ALTER TYPE "public"."interview_status" ADD VALUE 'pending' BEFORE 'scheduled';--> statement-breakpoint
ALTER TABLE "interview_invitations" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."interview_status";--> statement-breakpoint
ALTER TABLE "interview_invitations" ALTER COLUMN "status" SET DATA TYPE "public"."interview_status" USING "status"::"public"."interview_status";