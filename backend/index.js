import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db-connection.js";
import cloudinaryConnect from "./config/cloudinary-connection.js";
import userRoute from "./routes/userRoute.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


app.use("/user",userRoute)

app.get("/", (req, res) => {
  res.send("Server is running");
});

const startServer = async () => {
  await connectDB();
  cloudinaryConnect();

  app.listen(PORT, () => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Server running on port ${PORT}`);
    }
  });
};

startServer();