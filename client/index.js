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
