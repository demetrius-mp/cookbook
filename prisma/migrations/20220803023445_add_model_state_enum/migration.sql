-- CreateEnum
CREATE TYPE "STATE" AS ENUM ('VISIBLE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "state" "STATE" NOT NULL DEFAULT 'VISIBLE';

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "state" "STATE" NOT NULL DEFAULT 'VISIBLE';