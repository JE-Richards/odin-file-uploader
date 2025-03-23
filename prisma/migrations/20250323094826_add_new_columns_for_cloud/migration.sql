/*
  Warnings:

  - A unique constraint covering the columns `[cloud_id]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cloud_id` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `format` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "cloud_id" TEXT NOT NULL,
ADD COLUMN     "format" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER;

-- AlterTable
ALTER TABLE "share_links" ALTER COLUMN "expires_at" SET DEFAULT (now() + interval '24 hours');

-- CreateIndex
CREATE UNIQUE INDEX "files_cloud_id_key" ON "files"("cloud_id");
