import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {connectDB} from './db/connectDB.js';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth.route.js'

dotenv.config();

const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());
const __dirname = path.resolve();

const port = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(port, () => {
    connectDB();
    console.log(`Server is running on port ${port}`);
});