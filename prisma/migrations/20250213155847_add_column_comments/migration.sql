-- AlterTable
ALTER TABLE "share_links" ALTER COLUMN "expires_at" SET DEFAULT (now() + interval '24 hours');

-- =========================
-- ADD COMMENTS TO TABLES MATCHING THE SCHEMA AST COMMENTS
-- =========================
-- 1. COMMENTS FOR USERS TABLE
-- =========================
COMMENT ON COLUMN users.id IS 'Primary key for the users table. Uniquely identifies each user.';
COMMENT ON COLUMN users.username IS 'Username for this user. Username must be unique.';
COMMENT ON COLUMN users.email IS 'Email address for this user. Email must be unique to each user.';
COMMENT ON COLUMN users.password IS 'Encrypted password for the user. This should be securely hashed.';
COMMENT ON COLUMN users.created_at IS 'Timestamp for when the user was created.';

-- =========================
-- 2. COMMENTS FOR FILES TABLE
-- =========================
COMMENT ON COLUMN files.id IS 'Primary key for the files table. Uniquely identifies each file.';
COMMENT ON COLUMN files.filename IS 'Original filename of the uploaded file.';
COMMENT ON COLUMN files.url IS 'URL for the file hosted on a cloud storage solution.';
COMMENT ON COLUMN files.uploaded_at IS 'Timestamp for when the file was uploaded.';

-- =========================
-- 3. COMMENTS FOR FOLDERS TABLE
-- =========================
COMMENT ON COLUMN folders.id IS 'Primary key for the folders table. Uniquely identifies each folder.';
COMMENT ON COLUMN folders.name IS 'Name of the folder.';
COMMENT ON COLUMN folders.user_id IS 'User ID of the folder owner.';
COMMENT ON COLUMN folders.parent_folder_id IS 'ID of the parent folder, allowing for nested folders (nullable for root folders).';

-- =========================
-- 4. COMMENTS FOR SHARED FILES TABLE
-- =========================
COMMENT ON COLUMN share_files.id IS 'Primary key for the shared files table. Uniquely identifies each shared file entry.';
COMMENT ON COLUMN share_files.permission IS 'Permission level granted to the recipient for the shared file (READ or EDIT).';
COMMENT ON COLUMN share_files.shared_at IS 'Timestamp of when the file was shared.';
COMMENT ON COLUMN share_files.expires_at IS 'Optional expiration date for the shared file access.';
COMMENT ON COLUMN share_files.file_id IS 'ID of the shared file.';
COMMENT ON COLUMN share_files.shared_with_user_id IS 'ID of the user receiving the shared file.';

-- =========================
-- 5. COMMENTS FOR SHARED FOLDERS TABLE
-- =========================
COMMENT ON COLUMN share_folders.id IS 'Primary key for the shared folders table. Uniquely identifies each shared folder entry.';
COMMENT ON COLUMN share_folders.permission IS 'Permission level granted to the recipient for the shared folder (READ or EDIT).';
COMMENT ON COLUMN share_folders.shared_at IS 'Timestamp of when the folder was shared.';
COMMENT ON COLUMN share_folders.expires_at IS 'Optional expiration date for the shared folder access.';
COMMENT ON COLUMN share_folders.folder_id IS 'ID of the shared folder.';
COMMENT ON COLUMN share_folders.shared_with_user_id IS 'ID of the user receiving the shared folder.';

-- =========================
-- 6. COMMENTS FOR SHARE LINKS TABLE
-- =========================
COMMENT ON COLUMN share_links.id IS 'Primary key for the share links table. Uniquely identifies each share link entry.';
COMMENT ON COLUMN share_links.url IS 'Publicly accessible URL for the shared file or folder.';
COMMENT ON COLUMN share_links.created_at IS 'Timestamp for when the share link was created.';
COMMENT ON COLUMN share_links.expires_at IS 'Expiration timestamp for the share link (default: 24 hours after creation).';
COMMENT ON COLUMN share_links.file_id IS 'ID of the file being shared (nullable if shared folder).';
COMMENT ON COLUMN share_links.folder_id IS 'ID of the folder being shared (nullable if shared file).';
COMMENT ON COLUMN share_links.created_by_user_id IS 'ID of the user who created the share link.';
