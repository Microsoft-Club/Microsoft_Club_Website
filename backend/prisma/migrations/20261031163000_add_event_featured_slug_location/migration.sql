-- AlterTable
ALTER TABLE "Event" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Event" ADD COLUMN "slug" TEXT;
ALTER TABLE "Event" ADD COLUMN "location" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
