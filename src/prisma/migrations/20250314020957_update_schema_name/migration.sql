/*
  Warnings:

  - You are about to drop the column `avatar` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `UserProfile` table. All the data in the column will be lost.
  - Added the required column `class` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserProfile` DROP COLUMN `avatar`,
    DROP COLUMN `bio`,
    DROP COLUMN `education`,
    ADD COLUMN `class` VARCHAR(191) NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `introduction` VARCHAR(191) NULL;
