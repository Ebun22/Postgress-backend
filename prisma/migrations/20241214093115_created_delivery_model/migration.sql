/*
  Warnings:

  - You are about to drop the column `attributes` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `ShippingPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "attributes",
ADD COLUMN     "variant" JSONB;

-- DropTable
DROP TABLE "ShippingPrice";

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);
