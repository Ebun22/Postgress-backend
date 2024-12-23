-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT false;
