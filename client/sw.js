self.addEventListener("push", (e) => {
  const data = e.data.json();

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
    })
  );

  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "pushNotification" });
    });
  });
});
