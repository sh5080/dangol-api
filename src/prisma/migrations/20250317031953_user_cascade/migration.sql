-- DropForeignKey
ALTER TABLE `UserEvent` DROP FOREIGN KEY `UserEvent_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserProfile` DROP FOREIGN KEY `UserProfile_userId_fkey`;

-- DropIndex
DROP INDEX `UserEvent_userId_fkey` ON `UserEvent`;

-- AddForeignKey
ALTER TABLE `UserProfile` ADD CONSTRAINT `UserProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserEvent` ADD CONSTRAINT `UserEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
