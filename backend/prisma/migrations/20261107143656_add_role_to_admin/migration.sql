-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('Logikal', 'Marketing', 'Inductions', 'General');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'General';
