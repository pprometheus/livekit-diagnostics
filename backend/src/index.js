import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import tokenRoutes from "./routes/token.routes.js";
import { PORT } from "./config/config.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/token", tokenRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
