CREATE INDEX "idx_conversations_jobseekers_id" ON "conversations" USING btree ("jobseekers_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_recruiter_id" ON "conversations" USING btree ("recruiter_id");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_sent_at" ON "messages" USING btree ("conversation_id","sent_at" desc);