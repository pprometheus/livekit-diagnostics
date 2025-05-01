import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import tokenRoutes from "./routes/token.routes.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/token", tokenRoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
