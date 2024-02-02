const userFocus = {
  focused: false,
};

self.addEventListener("push", async (e) => {
  const data = e.data.json();

  console.log("push from sw");

  const notifications = await self.registration.getNotifications();

  console.log(notifications);
  console.log(data);

  self.registration.showNotification(data.title, {
    body: data.body,
  });

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "message", body: data.body });
    });
  });
});

self.addEventListener("message", (event) => {
  console.log("message received");

  if (event.data && event.data.type === "focusState") {
    userFocus.focused = event.data.isFocused;
  }
});
