-- Keep this migration idempotent because existing deployments may have been
-- provisioned with `prisma db push` instead of a migration history.
ALTER TABLE "Member"
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER;

CREATE TABLE IF NOT EXISTS "waiting_list" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "batch" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiting_list_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "waiting_list_email_key"
ON "waiting_list"("email");
