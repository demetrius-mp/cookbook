/*
  Warnings:

  - You are about to drop the `SharedRecipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersOnSharedRecipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "STATE" ADD VALUE 'PRIVATE';
ALTER TYPE "STATE" ADD VALUE 'PUBLIC';

-- DropForeignKey
ALTER TABLE "SharedRecipe" DROP CONSTRAINT "SharedRecipe_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "SharedRecipe" DROP CONSTRAINT "SharedRecipe_sharingUserId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnSharedRecipes" DROP CONSTRAINT "UsersOnSharedRecipes_sharedRecipeSharingUserId_sharedRecip_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnSharedRecipes" DROP CONSTRAINT "UsersOnSharedRecipes_userId_fkey";

-- DropTable
DROP TABLE "SharedRecipe";

-- DropTable
DROP TABLE "UsersOnSharedRecipes";
