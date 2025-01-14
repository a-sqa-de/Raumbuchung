const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Sende initiale Kalenderdaten
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket!', calendarData: [] }));

  // Simuliere dynamische Datenaktualisierung
  setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    ws.send(JSON.stringify({ message: 'Updated time', currentTime }));
  }, 10000); // Alle 10 Sekunden aktualisieren

  ws.on('close', () => console.log('Client disconnected'));
});

