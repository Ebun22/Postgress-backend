/*
  Warnings:

  - You are about to drop the column `quantity` on the `RecipeProducts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecipeProducts" DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "ShippingPrice" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ShippingPrice_pkey" PRIMARY KEY ("id")
);
