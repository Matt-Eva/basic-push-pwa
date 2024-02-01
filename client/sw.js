const userFocus = {
  focused: false,
};

self.addEventListener("push", async (e) => {
  const data = e.data.json();

  const notifications = await self.registration.getNotifications();

  console.log(notifications);
  console.log(data);

  if (!userFocus.focused) {
    self.registration.showNotification(data.title, {
      body: data.body,
    });
  }
});

self.addEventListener("message", (event) => {
  console.log("message received");

  if (event.data && event.data.type === "focusState") {
    userFocus.focused = event.data.isFocused;
  }
});
