import mongoose from "mongoose";
import logTypes from "../enums/log-types.js";

const LogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(logTypes),
    required: true,
  },
  log: {
    type: String,
    required: true,//Stringified Json
    trim: true,
  },
}, {
  timestamps: true,
});

const Log = mongoose.model("Log", LogSchema);
export { Log };
