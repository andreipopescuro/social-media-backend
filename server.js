import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
const app = express();
dotenv.config();

const PORT = process.env.POTRT || 5000;
dbConnect();

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
