ALTER TABLE "Blog"
  ALTER COLUMN "authorImage" SET DEFAULT '/blog-author-placeholder.svg',
  ALTER COLUMN "instagramUrl" DROP DEFAULT,
  ALTER COLUMN "instagramUrl" DROP NOT NULL,
  ALTER COLUMN "linkedinUrl" DROP DEFAULT,
  ALTER COLUMN "linkedinUrl" DROP NOT NULL;