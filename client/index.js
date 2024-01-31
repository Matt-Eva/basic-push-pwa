const publicVapidKey =
  "BHNo9UH99n13_rysw87bs0zMGxQLKAw_OJ-JmlS11Enm2vcon4WYkF3HNeAsfTPbpYtw_PBpNiqiWSqObvlfuJI";

const registerServiceWorker = async () => {
  const register = await navigator.serviceWorker.register("./sw.js", {
    scope: "/",
  });

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicVapidKey,
  });

  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

if ("serviceWorker" in navigator) {
  registerServiceWorker();
}

const socket = io();
const form = document.getElementById("form");
const messageContainer = document.getElementById("message-container");
console.log(form);

socket.on("message", (arg) => {
  console.log(arg);
  const p = document.createElement("p");
  p.textContent = arg;
  messageContainer.append(p);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = e.target.textInput.value;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  const socketArg = {
    subscription,
    message,
  };
  socket.emit("message", socketArg);
});

const isPageVisible = () => {
  return !document.hidden;
};

const clearNotifications = () => {
  if ("clearNotifications" in window.Notification) {
    console.log("clearing");
    window.Notification.clear();
  }
};

document.addEventListener("visibilitychange", function () {
  if (isPageVisible()) {
    // Page is now visible, clear notifications
    clearNotifications();
  }
});
