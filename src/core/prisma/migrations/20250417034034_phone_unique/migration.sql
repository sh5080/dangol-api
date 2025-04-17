/*
  Warnings:

  - You are about to alter the column `addressDescription` on the `Restaurant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `eventDescription` on the `Restaurant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `holiday` on the `Restaurant` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Restaurant" ALTER COLUMN "addressDescription" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "eventDescription" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "holiday" SET DATA TYPE VARCHAR(300);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
