require("dotenv").config();
const express = require("express");
const webPush = require("web-push");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 4000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

webPush.setVapidDetails(vapidSubject, publicKey, privateKey);

const subscriptions = [];

io.on("connect", (socket) => {
  console.log("connected");
  socket.on("message", (arg) => {
    const message = arg.message;
    const subscription = arg.subscription;

    socket.emit("message", message);

    const payload = JSON.stringify({
      title: "New Message",
      body: message,
    });

    subscriptions.forEach(async (sub) => {
      await webPush.sendNotification(sub, payload).catch(console.error);
      console.log("pushing");
    });
  });
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  if (subscription) {
    console.log(subscription);
    const existingSub = subscriptions.find(
      (sub) => sub.endpoint === subscription.endpoint
    );
    if (!existingSub) {
      subscriptions.push(subscription);
    }
    res.status(201).send({ message: "success" });
  } else {
    console.log("no subscription");
    res.status(422).send({ message: "failure" });
  }
});

app.get("/test", (req, res) => {
  res.status(200).send({ message: "hello world!" });
});

server.listen(port, () => {
  console.log("Server started on " + port);
});
