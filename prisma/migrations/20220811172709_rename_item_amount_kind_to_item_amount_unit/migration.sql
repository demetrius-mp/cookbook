/*
  Warnings:

  - You are about to drop the column `amountKind` on the `Item` table. All the data in the column will be lost.
  - Added the required column `amountUnit` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "amountKind",
ADD COLUMN     "amountUnit" TEXT NOT NULL;
