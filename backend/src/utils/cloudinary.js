const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const hasCloudinaryConfig = Boolean(cloudName && apiKey && apiSecret);

exports.uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!hasCloudinaryConfig) {
      const missing = [];
      if (!cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
      if (!apiKey) missing.push("CLOUDINARY_API_KEY");
      if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

      const error = new Error(
        `Cloudinary configuration is incomplete. Missing: ${missing.join(", ")}`
      );
      error.code = "CLOUDINARY_CONFIG_ERROR";
      return reject(error);
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
