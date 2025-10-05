import express from "express";
import dotenv from "dotenv";
import mongoose  from "mongoose";
import cors from "cors";
import path from "path";
import connectDB  from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import { app, server} from "./lib/socket.js";
const __dirname = path.resolve();

const app = express();
const PORT = 5000 || process.env.PORT;
dotenv.config({
    path: "./.env"
});


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


// Create a Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);


if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
