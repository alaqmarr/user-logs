import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import { logs } from "./models/Logs.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connection = await mongoose.connect(
  "mongodb://localhost:27017/expressMogoDb"
);
const server = express();
server.set("trust proxy", true);

server.use(express.static("public"));
server.set("view engine", "ejs");

server.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
  console.log("Request IP: " + ip);
  console.log(__dirname);

  const fileName = "logs.txt";
  const date = new Date();

  const data = new logs({
    _id: ip + "---" + date.toISOString(),
    url: req.url,
    date: date,
    ip: ip,
  });

  data.save();

  const filePath = path.join(__dirname, "public", fileName);

  fs.existsSync(filePath)
    ? fs.appendFileSync(
        filePath,
        `PATH: ("${req.url}") accessed on ${date} from ${ip}\n`
      )
    : fs.writeFileSync(
        filePath,
        `PATH: ("${req.url}") accessed on ${date} from ${ip}\n`
      );
  next();
});

server.get("/", (req, res) => {
  res.send("Hello World!");
});

server.get("/logs", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "logs.txt"));
});

server.get("/manage/delete", async (req, res) => {
  const dbEntryCount = await logs.countDocuments();
  dbEntryCount > 150 ? await logs.deleteMany({}) : null;
  res.send("Query executed successfully");
});

server.get("/dbLogs", async (req, res) => {
  const data = await logs.find();
  if (data) {
    res.json(data);
  }
});

server.get("/logs/:ip", async (req, res) => {
  const data = await logs.find({ ip: req.params.ip });
  if (data) {
    res.json(data);
  }
});

server.get("/uiLogs", async (req, res) => {
  const data = await logs.find();
  res.render("index.ejs", { data: data });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
