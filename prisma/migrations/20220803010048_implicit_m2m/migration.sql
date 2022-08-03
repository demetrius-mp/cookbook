/*
  Warnings:

  - You are about to drop the `RecipeItemsOnRecipes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeItemsOnRecipes" DROP CONSTRAINT "RecipeItemsOnRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipeItemsOnRecipes" DROP CONSTRAINT "RecipeItemsOnRecipes_recipeItemId_fkey";

-- DropTable
DROP TABLE "RecipeItemsOnRecipes";

-- CreateTable
CREATE TABLE "_RecipeToRecipeItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RecipeToRecipeItem_AB_unique" ON "_RecipeToRecipeItem"("A", "B");

-- CreateIndex
CREATE INDEX "_RecipeToRecipeItem_B_index" ON "_RecipeToRecipeItem"("B");

-- AddForeignKey
ALTER TABLE "_RecipeToRecipeItem" ADD CONSTRAINT "_RecipeToRecipeItem_A_fkey" FOREIGN KEY ("A") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RecipeToRecipeItem" ADD CONSTRAINT "_RecipeToRecipeItem_B_fkey" FOREIGN KEY ("B") REFERENCES "RecipeItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
