/*
  Warnings:

  - You are about to drop the `_RecipeToRecipeItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RecipeToRecipeItem" DROP CONSTRAINT "_RecipeToRecipeItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_RecipeToRecipeItem" DROP CONSTRAINT "_RecipeToRecipeItem_B_fkey";

-- DropTable
DROP TABLE "_RecipeToRecipeItem";

-- CreateTable
CREATE TABLE "RecipeItemsOnRecipes" (
    "recipeId" TEXT NOT NULL,
    "recipeItemId" TEXT NOT NULL,

    CONSTRAINT "RecipeItemsOnRecipes_pkey" PRIMARY KEY ("recipeId","recipeItemId")
);

-- AddForeignKey
ALTER TABLE "RecipeItemsOnRecipes" ADD CONSTRAINT "RecipeItemsOnRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeItemsOnRecipes" ADD CONSTRAINT "RecipeItemsOnRecipes_recipeItemId_fkey" FOREIGN KEY ("recipeItemId") REFERENCES "RecipeItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
