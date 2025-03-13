/*
  Warnings:

  - You are about to drop the column `affiliation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userClass` on the `User` table. All the data in the column will be lost.
  - Added the required column `authProviderId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_id_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `affiliation`,
    DROP COLUMN `userClass`,
    ADD COLUMN `authProviderId` INTEGER NOT NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AuthProvider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `AuthProvider_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `interests` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `affiliation` VARCHAR(191) NOT NULL,
    `education` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `UserProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_authProviderId_fkey` FOREIGN KEY (`authProviderId`) REFERENCES `AuthProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
