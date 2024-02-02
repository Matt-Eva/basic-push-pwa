const publicVapidKey =
  "BHNo9UH99n13_rysw87bs0zMGxQLKAw_OJ-JmlS11Enm2vcon4WYkF3HNeAsfTPbpYtw_PBpNiqiWSqObvlfuJI";

const registerServiceWorker = async () => {
  try {
    const register = await navigator.serviceWorker.register("./sw.js", {
      scope: "/",
    });

    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKey,
    });

    navigator.serviceWorker.controller.postMessage({
      type: "focusState",
      isFocused: true,
    });

    if (subscription) {
      const res = await fetch("/subscribe", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("message received");
      if (event.data) {
        console.log(event.data.type);
        document.body.append(event.data.body);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

if ("serviceWorker" in navigator && Notification.permission === "granted") {
  registerServiceWorker();
}

const socket = io();
const form = document.getElementById("form");
const messageContainer = document.getElementById("message-container");
const activateNotificationButton = document.getElementById(
  "activate-notifications"
);

socket.on("message", (arg) => {
  const p = document.createElement("p");
  p.textContent = arg;
  messageContainer.append(p);
});

document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.getNotifications().then((notifications) => {
          for (let i = 0; i < notifications.length; i += 1) {
            notifications[i].close();
          }
        });
      })
      .then(() => {
        navigator.serviceWorker.controller.postMessage({
          type: "focusState",
          isFocused: true,
        });
      });
  } else {
    document.body.append("I was hidden!");
    await navigator.serviceWorker.ready;
    navigator.serviceWorker.controller.postMessage({
      type: "focusState",
      isFocused: false,
    });
  }
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

activateNotificationButton.addEventListener("click", async () => {
  const result = await Notification.requestPermission();
  if (result === "granted") {
    registerServiceWorker();
    alert("notification permission granted");
  }
});

// navigator.serviceWorker.addEventListener("message", (event) => {
//   console.log("message event");
//   console.log(document.hidden);
//   if (!document.hidden) {
//     if (event.data && event.data.type === "pushNotification") {
//       console.log(event.data);
//       // Handle the push notification event as needed
//       navigator.serviceWorker.ready.then((reg) => {
//         reg.getNotifications().then((notifications) => {
//           for (let i = 0; i < notifications.length; i += 1) {
//             console.log("iterating notifications");
//             notifications[i].close();
//           }
//         });
//       });
//       // You can trigger any action in response to the push event here
//     }
//   }
// });

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
