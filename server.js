import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send({ success: true, message: "Welcome to the Emoji Server" });
});



app.listen(PORT, () =>
    console.log(`Example app listening at http://localhost:${PORT}`)
);