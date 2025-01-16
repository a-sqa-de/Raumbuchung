require('dotenv').config();
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { getAccessToken } = require('./tokenManager');
const axios = require('axios');

const PORT = 4000; // Port für den WebSocket-Server

// Start WebSocket-Server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket-Server läuft auf ws://localhost:${PORT}`);
});

// MS Graph-Daten abrufen und an Clients senden
const fetchAndBroadcastData = async () => {
  try {
    // Access Token abrufen
    const token = await getAccessToken();

    // Daten von MS Graph (z. B. Kalender-Ereignisse) abrufen
    const response = await axios.get('https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const buchungen = response.data.value;

    // Daten in buchungen.json speichern
    const filePath = path.join(__dirname, '../Frontend/buchungen.json');
    fs.writeFileSync(filePath, JSON.stringify(buchungen, null, 2));

    console.log('Neue Daten von MS Graph abgerufen und gespeichert.');

    // Daten an alle verbundenen Clients senden
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'update', data: buchungen }));
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Daten von MS Graph:', error.message);
  }
};

// WebSocket-Verbindung behandeln
wss.on('connection', ws => {
  console.log('Neuer Client verbunden.');

  // Initialdaten beim Verbinden senden
  const filePath = path.join(__dirname, '../Frontend/buchungen.json');
  if (fs.existsSync(filePath)) {
    const initialData = fs.readFileSync(filePath, 'utf-8');
    ws.send(JSON.stringify({ type: 'initial', data: JSON.parse(initialData) }));
  } else {
    ws.send(JSON.stringify({ type: 'initial', data: [] }));
  }
});

// Daten alle 5 Minuten aktualisieren
setInterval(fetchAndBroadcastData, 5 * 60 * 1000);

// Beim Start einmal Daten abrufen
fetchAndBroadcastData();


