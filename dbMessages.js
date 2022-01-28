import mongoose from "mongoose";

const wechatSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

export default mongoose.model("messagecontent", wechatSchema);
