const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Chỉ cho phép video (mp4, webm, ogg)
const videoFileFilter = (req, file, cb) => {
  console.log('[UploadVideo Filter] File mimetype:', file.mimetype);
  console.log('[UploadVideo Filter] File originalname:', file.originalname);

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.mp4', '.webm', '.ogg'];
  const extname = allowedExts.includes(ext);

  // Accept common video mimetypes
  const allowedMimes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/octet-stream' // Some browsers send this for mp4
  ];
  const mimetype = allowedMimes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('video/');

  console.log('[UploadVideo Filter] extname valid:', extname, 'ext:', ext);
  console.log('[UploadVideo Filter] mimetype valid:', mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file video (mp4, webm, ogg)'));
  }
};

const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: videoFileFilter,
});

// Middleware optional - không bắt buộc có file
const uploadVideoOptional = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: videoFileFilter,
}).single('video');

module.exports = { uploadVideo, uploadVideoOptional };

