CREATE TABLE "users" (
	"system_id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"gender" varchar(32) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"organisation" varchar(32),
	"role" varchar(32) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
