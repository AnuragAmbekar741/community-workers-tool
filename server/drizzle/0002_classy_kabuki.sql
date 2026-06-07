CREATE TABLE "sessions" (
	"session_id" varchar(32) PRIMARY KEY NOT NULL,
	"worker_id" varchar(32) NOT NULL,
	"session_date" date NOT NULL,
	"village" varchar(32) NOT NULL,
	"topic" varchar(64) NOT NULL,
	"topic_other" text,
	"duration_min" integer NOT NULL,
	"n_women" integer NOT NULL,
	"n_men" integer NOT NULL,
	"n_girls" integer NOT NULL,
	"n_boys" integer NOT NULL,
	"n_elders" integer NOT NULL,
	"n_others" integer NOT NULL,
	"total_reached" integer NOT NULL,
	"key_issues" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_worker_id_users_system_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."users"("system_id") ON DELETE no action ON UPDATE no action;