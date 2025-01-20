require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAccessToken } = require('./tokenManager'); // Zugriffstoken abrufen

const PORT = 5500; // Port für den WebSocket-Server

// Microsoft Graph API-Endpunkte
const GRAPH_API_ENDPOINT = `https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/events`;
const CALENDAR_EVENTS_ENDPOINT = `https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events`;

// Start WebSocket-Server
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket-Server läuft auf ws://localhost:${PORT}`);
});

// Funktion zum Erstellen eines Termins in Microsoft Graph
const createEventInGraph = async (eventData) => {
  try {
    const token = await getAccessToken(); // Zugriffstoken abrufen

    console.log('Daten an Graph API:', {
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      organizer: eventData.organizer,
      date: eventData.date,
    });

    const response = await axios.post(
      GRAPH_API_ENDPOINT,
      {
        subject: eventData.title,
        start: {
          dateTime: eventData.start,
          timeZone: 'W. Europe Standard Time',
        },
        end: {
          dateTime: eventData.end,
          timeZone: 'W. Europe Standard Time',
        },
        body: {
          contentType: 'HTML',
          content: `Organisator: ${eventData.organizer}<br>Datum: ${eventData.date}`,
        },
        isOrganizer: false, // Setze isOrganizer auf false
        sensitivity: 'normal', // Setze sensitivity auf normal
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Termin erfolgreich in Microsoft Graph erstellt:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fehler beim Erstellen des Termins:', error.response?.data || error.message);
    throw error;
  }
};

// Funktion zum Abrufen von Kalenderdaten aus Microsoft Graph
const fetchCalendarData = async () => {
  try {
    const token = await getAccessToken(); // Zugriffstoken abrufen

    const response = await axios.get(CALENDAR_EVENTS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Kalenderdaten erfolgreich abgerufen:', response.data.value);
    return response.data.value;
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalenderdaten:', error.response?.data || error.message);
    throw error;
  }
};

// Funktion zum Speichern der Kalenderdaten in einer JSON-Datei
const saveCalendarData = async () => {
  try {
    const events = await fetchCalendarData();
    const filePath = path.join(__dirname, '../Frontend/buchungen.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    console.log('Kalenderdaten erfolgreich gespeichert.');
  } catch (error) {
    console.error('Fehler beim Speichern der Kalenderdaten:', error.message);
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

  ws.on('message', async (message) => {
    console.log('Nachricht vom Client empfangen:', message);
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.type) {
        case 'create-event':
          console.log('Event-Daten zur Verarbeitung:', parsedMessage.data);

          // Termin in Microsoft Graph erstellen
          const createdEvent = await createEventInGraph(parsedMessage.data);

          // Erfolgsmeldung an den Client senden
          ws.send(
            JSON.stringify({
              type: 'event-created',
              data: createdEvent,
            })
          );

          console.log('Erfolgsmeldung an den Client gesendet.');
          break;

        case 'fetch-events':
          console.log('Anfrage: Kalenderdaten abrufen');

          // Kalenderdaten abrufen und an den Client senden
          const events = await fetchCalendarData();
          ws.send(
            JSON.stringify({
              type: 'events-data',
              data: events,
            })
          );

          console.log('Kalenderdaten an den Client gesendet.');
          break;

        default:
          console.error('Unbekannter Nachrichtentyp:', parsedMessage.type);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Unbekannter Nachrichtentyp.',
            })
          );
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten der Nachricht:', error.message);

      ws.send(
        JSON.stringify({
          type: 'error',
          message: error.response?.data?.error?.message || 'Fehler beim Verarbeiten der Nachricht.',
        })
      );
    }
  });

  ws.on('close', () => {
    console.log('Client hat die Verbindung geschlossen.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket-Fehler:', error);
  });
});

// Kalenderdaten alle 2 Minuten abrufen und speichern
setInterval(saveCalendarData, 2 * 60 * 1000);

// Beim Start einmal Daten abrufen und speichern
saveCalendarData();
