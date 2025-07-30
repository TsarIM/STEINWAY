import express from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes/router.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dotenv from "dotenv";
import "./db/redisClient.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '21mb' }));
app.use(express.urlencoded({ extended: true, limit: '21mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use("/api/recordings", router);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
