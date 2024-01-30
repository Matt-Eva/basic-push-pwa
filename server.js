require("dotenv").config();
const express = require("express");
const app = express();
const webPush = require("web-push");
const path = require("path");
const port = 4000;

app.use(express.json());

app.use(express.static(path.join(__dirname, "client")));

const vapidKeys = webPush.generateVAPIDKeys();
const vapidSubject = process.env.VAPID_SUBJECT;

console.log(vapidKeys);

webPush.setVapidDetails(
  vapidSubject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  res.status(201);
  const payload = JSON.stringify({
    title: "Hello world",
    body: "This is your first push notification",
  });

  webPush.sendNotification(subscription, payload).catch(console.error);
});

app.listen(port, () => {
  console.log("Server started on " + port);
});
