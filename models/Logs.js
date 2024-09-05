import mongoose from "mongoose";
const LogsSchema = new mongoose.Schema({
  _id: String,
  url: String,
  date: Date,
  ip: String,
});

const Logs = mongoose.model("Logs", LogsSchema);

export const logs = Logs;
