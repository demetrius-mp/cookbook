-- CreateEnum
CREATE TYPE "STATE" AS ENUM ('VISIBLE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePictureUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "amountKind" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "state" "STATE" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" "STATE" NOT NULL DEFAULT 'VISIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedRecipe" (
    "sharingUserId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "SharedRecipe_pkey" PRIMARY KEY ("sharingUserId","recipeId")
);

-- CreateTable
CREATE TABLE "UsersOnSharedRecipes" (
    "userId" TEXT NOT NULL,
    "sharedRecipeSharingUserId" TEXT NOT NULL,
    "sharedRecipeRecipeId" TEXT NOT NULL,

    CONSTRAINT "UsersOnSharedRecipes_pkey" PRIMARY KEY ("userId","sharedRecipeRecipeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOnRecipes" ADD CONSTRAINT "ItemsOnRecipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOnRecipes" ADD CONSTRAINT "ItemsOnRecipes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedRecipe" ADD CONSTRAINT "SharedRecipe_sharingUserId_fkey" FOREIGN KEY ("sharingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedRecipe" ADD CONSTRAINT "SharedRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnSharedRecipes" ADD CONSTRAINT "UsersOnSharedRecipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnSharedRecipes" ADD CONSTRAINT "UsersOnSharedRecipes_sharedRecipeSharingUserId_sharedRecip_fkey" FOREIGN KEY ("sharedRecipeSharingUserId", "sharedRecipeRecipeId") REFERENCES "SharedRecipe"("sharingUserId", "recipeId") ON DELETE RESTRICT ON UPDATE CASCADE;
