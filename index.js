import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db-connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Server is running");
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    if (process.env.NODE_ENV === "development") {
      console.log(`Server running on port PORT`);
    }
  });
};

startServer();