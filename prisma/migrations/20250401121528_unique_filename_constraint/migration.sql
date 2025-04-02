/*
  Warnings:

  - A unique constraint covering the columns `[filename,user_id,folder_id]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "share_links" ALTER COLUMN "expires_at" SET DEFAULT (now() + interval '24 hours');

-- CreateIndex
CREATE UNIQUE INDEX "files_filename_user_id_folder_id_key" ON "files"("filename", "user_id", "folder_id");
