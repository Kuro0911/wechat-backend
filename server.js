import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1339296",
  key: "ca483be98c5f58141de1",
  secret: "8146d901abef776a653f",
  cluster: "ap2",
  useTLS: true,
});

app.use(express.json());
app.use(cors());

const connect_url =
  "mongodb+srv://Kuro:ao7Jq6QRDrZnSDj8@cluster0.p3xln.mongodb.net/WechatDB?retryWrites=true&w=majority";
mongoose.connect(connect_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("ok report");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType == "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
      });
    } else {
      console.log("error in pusher");
    }
  });
});

app.get("/", (req, res) => res.status(200).send("Heloo world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.listen(port, () => console.log(`Listening on local host:${port}`));
