const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storageAudio = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "portfolio_assets",
    resource_type: "video",
    allowed_formats: ["mp3", "wav", "mp4", "mov", "mkv"],
  },
});
const uploadAudio = multer({ storage: storageAudio });

const storageImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "marquee_logos", // Tách riêng folder trên Cloudinary cho dễ quản lý
    resource_type: "image", // Định dạng là hình ảnh
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"], // Chấp nhận các định dạng ảnh phổ biến
  },
});
const uploadImage = multer({ storage: storageImage });

const storageCardProject = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "card_projects",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
});
const uploadCardProject = multer({ storage: storageCardProject });

module.exports = { cloudinary, uploadAudio, uploadImage, uploadCardProject };
