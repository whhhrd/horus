self.addEventListener('notificationclick', function(event) {
    if (event.action === "accept") {
        self.clients.matchAll().then(all => all.forEach(client => {
            client.postMessage("accept");
        }));
    } else {
        self.clients.matchAll().then(all => all.forEach(client => {
            client.postMessage("focus");
        }));
    }
    event.notification.close();
})