/*
  Warnings:

  - You are about to drop the `RecipeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecipeItemsOnRecipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeItem" DROP CONSTRAINT "RecipeItem_itemId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeItemsOnRecipes" DROP CONSTRAINT "RecipeItemsOnRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeItemsOnRecipes" DROP CONSTRAINT "RecipeItemsOnRecipes_recipeItemId_fkey";

-- DropTable
DROP TABLE "RecipeItem";

-- DropTable
DROP TABLE "RecipeItemsOnRecipes";

-- CreateTable
CREATE TABLE "ItemsOnRecipes" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemsOnRecipes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemsOnRecipes" ADD CONSTRAINT "ItemsOnRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOnRecipes" ADD CONSTRAINT "ItemsOnRecipes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
