/*
  Warnings:

  - You are about to drop the column `state` on the `Item` table. All the data in the column will be lost.
  - The primary key for the `ItemsOnRecipes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ItemsOnRecipes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemsOnRecipes" DROP CONSTRAINT "ItemsOnRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnLikedRecipes" DROP CONSTRAINT "UsersOnLikedRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnLikedRecipes" DROP CONSTRAINT "UsersOnLikedRecipes_userId_fkey";

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "state";

-- AlterTable
ALTER TABLE "ItemsOnRecipes" DROP CONSTRAINT "ItemsOnRecipes_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ItemsOnRecipes_pkey" PRIMARY KEY ("recipeId", "itemId");

-- AddForeignKey
ALTER TABLE "ItemsOnRecipes" ADD CONSTRAINT "ItemsOnRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnLikedRecipes" ADD CONSTRAINT "UsersOnLikedRecipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnLikedRecipes" ADD CONSTRAINT "UsersOnLikedRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
