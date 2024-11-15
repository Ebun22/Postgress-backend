/*
  Warnings:

  - You are about to drop the column `richDescription` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "richDescription";

-- DropTable
DROP TABLE "Category";
