ALTER TABLE "Blog"
  ADD COLUMN IF NOT EXISTS "authorImage" TEXT,
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT;

UPDATE "Blog"
SET
  "authorImage" = COALESCE("authorImage", '/blog-author-placeholder.svg'),
  "instagramUrl" = COALESCE("instagramUrl", 'https://www.instagram.com/'),
  "linkedinUrl" = COALESCE("linkedinUrl", 'https://www.linkedin.com/');

ALTER TABLE "Blog"
  ALTER COLUMN "authorImage" SET DEFAULT '/blog-author-placeholder.svg',
  ALTER COLUMN "authorImage" SET NOT NULL,
  ALTER COLUMN "instagramUrl" SET DEFAULT 'https://www.instagram.com/',
  ALTER COLUMN "instagramUrl" SET NOT NULL,
  ALTER COLUMN "linkedinUrl" SET DEFAULT 'https://www.linkedin.com/',
  ALTER COLUMN "linkedinUrl" SET NOT NULL;