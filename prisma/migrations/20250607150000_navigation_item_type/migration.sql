-- CreateEnum
CREATE TYPE "NavigationItemType" AS ENUM ('LINK', 'BUTTON');

-- AlterTable
ALTER TABLE "navigation_items" ADD COLUMN "itemType" "NavigationItemType" NOT NULL DEFAULT 'LINK';
