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

socket.on("message", (arg) => {
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

document.addEventListener("visibilitychange", async () => {
  console.log("changing visibility");
  if (!document.hidden) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.getNotifications().then((notifications) => {
        for (let i = 0; i < notifications.length; i += 1) {
          notifications[i].close();
        }
      });
    });

    navigator.serviceWorker.controller.postMessage({
      type: "focusState",
      isFocused: true,
    });
  } else {
    await navigator.serviceWorker.ready;
    navigator.serviceWorker.controller.postMessage({
      type: "focusState",
      isFocused: false,
    });
  }
});

navigator.serviceWorker.addEventListener("message", (event) => {
  console.log("message event");
  console.log(document.hidden);
  if (!document.hidden) {
    if (event.data && event.data.type === "pushNotification") {
      console.log(event.data);
      count += 1;
      // Handle the push notification event as needed
      console.log("Received push notification from service worker" + count);
      navigator.serviceWorker.ready.then((reg) => {
        reg.getNotifications().then((notifications) => {
          for (let i = 0; i < notifications.length; i += 1) {
            console.log("iterating notifications");
            notifications[i].close();
          }
        });
      });
      // You can trigger any action in response to the push event here
    }
  }
});

// window.addEventListener("blur", async () => {
//   console.log("blurred");
//   await navigator.serviceWorker.ready;
//   if (document.hidden) {
//     navigator.serviceWorker.controller.postMessage({
//       type: "focusState",
//       isFocused: false,
//     });
//   }
// });

// window.addEventListener("focus", async () => {
//   console.log("focused");
//   navigator.serviceWorker.ready.then((reg) => {
//     reg.getNotifications().then((notifications) => {
//       for (let i = 0; i < notifications.length; i += 1) {
//         notifications[i].close();
//       }
//     });
//   });

//   navigator.serviceWorker.controller.postMessage({
//     type: "focusState",
//     isFocused: true,
//   });
// });
