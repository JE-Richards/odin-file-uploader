const { Router } = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const { ensureUserAuth } = require("../middleware/authMiddleware");

// Multer set up
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    const acceptedExtensions = [
      ".mp3",
      ".mp4",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".pdf",
      ".txt",
    ];
    const fileExtensions =
      "." + file.originalname.split(".").pop().toLowerCase();
    if (!acceptedExtensions.includes(fileExtensions)) {
      return cb(new Error(`File "${file.originalname}" has an invalid type.`));
    }
    cb(null, true);
  },
});

const uploadRouter = () => {
  const router = new Router();

  router.get("/", ensureUserAuth, uploadController.getUploadPage);
  router.post(
    "/",
    ensureUserAuth,
    upload.array("file"),
    uploadController.postUpload
  );

  return router;
};

module.exports = uploadRouter;
