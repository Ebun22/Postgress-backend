/*
  Warnings:

  - Made the column `price` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stockQuantity` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "stockQuantity" SET NOT NULL;
