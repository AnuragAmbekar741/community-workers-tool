ALTER TABLE "sessions" RENAME COLUMN "village" TO "district";
--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "district" SET DATA TYPE varchar(64);
