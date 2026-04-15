const multer = require('multer');

// Store file in memory as buffer (not saved to disk, sent directly to Cloudinary)
const storage = multer.memoryStorage();

// Allow only PDF and image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false); // Reject file
  }
};

// Configure multer with storage, 10MB size limit, and file type filter
const upload = multer({
  storage,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter
});

module.exports = upload;