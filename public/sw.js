self.addEventListener('push', (event) => {
  let payload = { title: 'Umbrella Farmácia', body: 'Nova notificação' };

  try {
    if (event.data) payload = event.data.json();
  } catch {
    payload.body = event.data?.text() || payload.body;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/nav-logo.svg'
    })
  );
});
