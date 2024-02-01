let db;

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ExampleDb", 4);

    request.onerror = (event) => {
      console.log(event);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log(db);

      db.onerror = (event) => {
        console.error(`Database error: ${event.target.errorCode}`);
      };
      resolve();
    };

    request.onupgradeneeded = (event) => {
      console.log("upgrade needed firing");
      const db = event.target.result;
      console.log(db);

      if (!db.objectStoreNames.contains("focusState")) {
        const objectStore = db.createObjectStore("focusState", {
          keyPath: "id",
        });

        objectStore.transaction.oncomplete = (event) => {
          const focusStateStore = db
            .transaction(["focusState"], "readwrite")
            .objectStore("focusState");
          focusStateStore.add({ id: 1, isFocused: true });
        };
      }
    };
  });
};

const userFocus = {
  focused: false,
};

self.addEventListener("activate", () => {
  userFocus.focused = true;
});

self.addEventListener("push", async (e) => {
  const data = e.data.json();

  console.log("sw ", userFocus.focused);
  if (!userFocus.focused) {
    self.registration.showNotification(data.title, {
      body: data.body,
    });
  }

  // e.waitUntil(
  //   self.registration.showNotification(data.title, {
  //     body: data.body,
  //   })
});

self.addEventListener("message", (event) => {
  console.log("message received");

  if (event.data && event.data.type === "focusState") {
    userFocus.focused = event.data.isFocused;
  }
});

// self.addEventListener("push", async (e) => {
//   const data = e.data.json();

//   if (!db) {
//     await openDatabase();
//   }

//   const transaction = db.transaction(["focusState"]);
//   const objectStore = transaction.objectStore("focusState");
//   const request = objectStore.get(1);

//   request.onerror = (event) => {
//     console.log(event.target.error);
//   };

//   request.onsuccess = (event) => {
//     const result = event.target.result;
//     console.log(result);
//     if (result && !result.isFocused) {
//       self.registration.showNotification(data.title, {
//         body: data.body,
//       });
//     }
//   };
// });

// self.addEventListener("message", async (event) => {
//   console.log("message received");
//   console.log(event.data);
//   console.log(event.data.type);

//   if (!db) {
//     await openDatabase();
//   }

//   console.log(db);

//   if (event.data && event.data.type === "focusState" && db) {
//     console.log("changing focus from sw");
//     const isFocused = event.data.isFocused;

//     const objectStore = db
//       .transaction(["focusState"], "readwrite")
//       .objectStore("focusState");

//     const request = objectStore.get(1);

//     request.onerror = (event) => {
//       console.error(event.target.error);
//     };

//     request.onsuccess = (event) => {
//       const data = event.target.result;
//       if (!data) {
//         const request = objectStore.add({ id: 1, isFocused: isFocused });

//         request.onsuccess = (event) => {
//           console.log("successfully added new data");
//         };

//         request.onerror = (event) => {
//           console.error(event.target.error);
//         };
//       } else {
//         data.isFocused = isFocused;

//         const requestUpdate = objectStore.put(data);

//         requestUpdate.onsuccess = (event) => {
//           console.log("successfully updated existing data");
//         };

//         requestUpdate.onerror = (event) => {
//           console.error(event.target.error);
//         };
//       }
//     };
//   }
// });
