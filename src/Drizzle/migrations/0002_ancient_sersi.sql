ALTER TABLE "customer" ADD COLUMN "VerificationCode" varchar(10);--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "IsVerified" boolean DEFAULT false;