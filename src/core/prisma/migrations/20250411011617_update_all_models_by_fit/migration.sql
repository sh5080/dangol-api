/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `authProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AuthProvider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRestaurantFavorite` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessLicenseImageUrl` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessLicenseNumber` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserAgreementCategory" AS ENUM ('PERSONAL_INFO_COLLECTION', 'PERSONAL_INFO_USE');

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_authProviderId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_eventId_fkey";

-- DropForeignKey
ALTER TABLE "UserEvent" DROP CONSTRAINT "UserEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserRestaurantFavorite" DROP CONSTRAINT "UserRestaurantFavorite_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "UserRestaurantFavorite" DROP CONSTRAINT "UserRestaurantFavorite_userId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "imageUrl",
ADD COLUMN     "businessLicenseImageUrl" TEXT NOT NULL,
ADD COLUMN     "businessLicenseNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProviderId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "AuthProvider";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "UserEvent";

-- DropTable
DROP TABLE "UserPermission";

-- DropTable
DROP TABLE "UserProfile";

-- DropTable
DROP TABLE "UserRestaurantFavorite";

-- CreateTable
CREATE TABLE "UserAgreement" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "UserAgreementCategory" NOT NULL,
    "isAgreed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAgreement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAgreement" ADD CONSTRAINT "UserAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
