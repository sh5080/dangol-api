/*
  Warnings:

  - The primary key for the `Restaurant` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "BusinessHour" DROP CONSTRAINT "BusinessHour_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantTag" DROP CONSTRAINT "RestaurantTag_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "UserRestaurantFavorite" DROP CONSTRAINT "UserRestaurantFavorite_restaurantId_fkey";

-- AlterTable
ALTER TABLE "BusinessHour" ALTER COLUMN "restaurantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Restaurant_id_seq";

-- AlterTable
ALTER TABLE "RestaurantTag" ALTER COLUMN "restaurantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserRestaurantFavorite" ALTER COLUMN "restaurantId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "RestaurantTag" ADD CONSTRAINT "RestaurantTag_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessHour" ADD CONSTRAINT "BusinessHour_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRestaurantFavorite" ADD CONSTRAINT "UserRestaurantFavorite_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
