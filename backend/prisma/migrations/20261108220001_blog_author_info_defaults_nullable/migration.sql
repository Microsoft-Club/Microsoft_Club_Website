-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "timezone" TEXT;

ALTER TABLE "Blog"
  ADD COLUMN IF NOT EXISTS "authorImage" TEXT,
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;

ALTER TABLE "Blog"
  ALTER COLUMN "instagramUrl" DROP DEFAULT,
  ALTER COLUMN "instagramUrl" DROP NOT NULL,
  ALTER COLUMN "linkedinUrl" DROP DEFAULT,
  ALTER COLUMN "linkedinUrl" DROP NOT NULL;

UPDATE "Blog"
SET
  "authorImage" = COALESCE("authorImage", '/blog-author-placeholder.svg'),
  "instagramUrl" = CASE
    WHEN "instagramUrl" = 'https://www.instagram.com/' THEN NULL
    ELSE "instagramUrl"
  END,
  "linkedinUrl" = CASE
    WHEN "linkedinUrl" = 'https://www.linkedin.com/' THEN NULL
    ELSE "linkedinUrl"
  END;

ALTER TABLE "Blog"
  ALTER COLUMN "authorImage" SET DEFAULT '/blog-author-placeholder.svg',
  ALTER COLUMN "authorImage" SET NOT NULL;