CREATE TABLE "workers" (
	"system_id" varchar(32) PRIMARY KEY NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"supervisor_id" varchar(32),
	"worker_role" varchar(32) NOT NULL,
	"education" varchar(32) NOT NULL,
	"district" varchar(64) NOT NULL,
	"villages" text[] NOT NULL,
	"consent_given" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_system_id_users_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."users"("system_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_supervisor_id_users_system_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("system_id") ON DELETE no action ON UPDATE no action;