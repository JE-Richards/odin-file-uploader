/*
  Warnings:

  - You are about to drop the `_FileToFolder` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FileToFolder" DROP CONSTRAINT "_FileToFolder_A_fkey";

-- DropForeignKey
ALTER TABLE "_FileToFolder" DROP CONSTRAINT "_FileToFolder_B_fkey";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "folder_id" TEXT;

-- AlterTable
ALTER TABLE "share_links" ALTER COLUMN "expires_at" SET DEFAULT (now() + interval '24 hours');

-- DropTable
DROP TABLE "_FileToFolder";

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
