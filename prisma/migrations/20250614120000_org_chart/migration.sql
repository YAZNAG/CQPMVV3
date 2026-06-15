-- CreateEnum
CREATE TYPE "OrgChartNodeStyle" AS ENUM ('LEADERSHIP', 'DEPARTMENT_WHITE', 'DEPARTMENT_BLUE', 'DEPARTMENT_ORANGE', 'UNIT');
-- CreateEnum
CREATE TYPE "OrgChartNodeAccent" AS ENUM ('NONE', 'PINK', 'GREEN', 'PURPLE', 'YELLOW', 'TEAL', 'SKY');
-- CreateEnum
CREATE TYPE "OrgChartNodeIcon" AS ENUM ('USER', 'USERS', 'WRENCH', 'BUILDING', 'SHIP', 'GRADUATION_CAP', 'SHIELD', 'BOOK', 'BOX', 'NONE');

-- CreateTable
CREATE TABLE "org_chart_nodes" (
    "id" TEXT NOT NULL,
    "titleFr" VARCHAR(255) NOT NULL,
    "titleAr" VARCHAR(255) NOT NULL,
    "parentId" TEXT,
    "style" "OrgChartNodeStyle" NOT NULL DEFAULT 'DEPARTMENT_WHITE',
    "accent" "OrgChartNodeAccent" NOT NULL DEFAULT 'NONE',
    "icon" "OrgChartNodeIcon" NOT NULL DEFAULT 'USER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "org_chart_nodes_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "orgChartPageTitleFr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "orgChartPageTitleAr" VARCHAR(255);
ALTER TABLE "site_settings" ADD COLUMN "orgChartPageSubtitleFr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "orgChartPageSubtitleAr" VARCHAR(500);
ALTER TABLE "site_settings" ADD COLUMN "orgChartPublished" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "org_chart_nodes_parentId_order_idx" ON "org_chart_nodes"("parentId", "order");
CREATE INDEX "org_chart_nodes_isPublished_order_idx" ON "org_chart_nodes"("isPublished", "order");
CREATE INDEX "org_chart_nodes_deletedAt_idx" ON "org_chart_nodes"("deletedAt");

-- AddForeignKey
ALTER TABLE "org_chart_nodes" ADD CONSTRAINT "org_chart_nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "org_chart_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
