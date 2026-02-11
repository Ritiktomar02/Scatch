import { v2 as cloudinary } from "cloudinary";

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Cloudinary configured successfully!");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error configuring Cloudinary:", error);
    } else {
      console.error("Cloudinary connection failed");
    }

    process.exit(1);
  }
};

export default cloudinaryConnect;