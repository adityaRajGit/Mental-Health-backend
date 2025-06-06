import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dozt3gyta",
  api_key: process.env.CLOUDINARY_API_KEY || "825823493643948",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "YNwNavMk6BPuunT9XerbuXRrtsY",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    // allowedFormats: ["jpg", "jpeg", "png"],
    format: async (req, file) => 'jpg', // supports promises as well
        public_id: (req, file) => file.originalname,
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

module.exports = { cloudinary, storage };