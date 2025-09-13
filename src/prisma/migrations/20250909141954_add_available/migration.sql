/*
  Warnings:

  - Changed the type of `available` on the `Service` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "available",
ADD COLUMN     "available" BOOLEAN NOT NULL;
