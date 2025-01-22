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
  const token = await getAccessToken();
  if (!token) throw new Error("Token fehlt.");

  const payload = {
    subject: eventData.title,
    start: {
      dateTime: eventData.start, // Lokale Zeit im ISO 8601-Format
      timeZone: "W. Europe Standard Time", // Aktuelle Zeitzone
    },
    end: {
      dateTime: eventData.end, // Lokale Zeit im ISO 8601-Format
      timeZone: "W. Europe Standard Time", // Aktuelle Zeitzone
    },
    originalStartTimeZone: "W. Europe Standard Time", // Original-Zeitzone
    originalEndTimeZone: "W. Europe Standard Time",   // Original-Zeitzone
    attendees: eventData.attendees || [],
    body: {
      contentType: "HTML",
      content: "Event erstellt mit Originalzeit in W. Europe Standard Time.",
    },
    allowNewTimeProposals: true,
  };

  const response = await axios.post(GRAPH_API_ENDPOINT, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

wss.on("connection", (ws) => {
  console.log("Neuer Client verbunden.");

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "create-event") {
        const eventData = parsedMessage.data;

        if (!eventData.start || !eventData.end) {
          ws.send(JSON.stringify({ type: "error", message: "Start- oder Endzeit fehlt." }));
          return;
        }

        const createdEvent = await createEventInGraph(eventData);

        // Sende nur einmal eine Erfolgsmeldung zurück
        ws.send(JSON.stringify({ type: "event-created", data: createdEvent }));
      } else {
        ws.send(JSON.stringify({ type: "error", message: "Unbekannter Nachrichtentyp." }));
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.response?.data?.error?.message || error.message || "Fehler beim Erstellen des Events.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client hat die Verbindung geschlossen.");
  });
});



// Funktion zum Abrufen von Kalenderdaten aus Microsoft Graph
const fetchCalendarData = async () => {
  try {
    const token = await getAccessToken(); // Zugriffstoken abrufen
    const headers = { Authorization: `Bearer ${token}` };

    let events = [];
    let endpoint = 'https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events';

    while (endpoint) {
      const response = await axios.get(endpoint, { headers });
      events = events.concat(response.data.value);
      endpoint = response.data['@odata.nextLink'] || null; // Nächste Seite abrufen, falls vorhanden
    }

    return events;
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalenderdaten:', error.response?.data || error.message);
    throw error;
  }
};

// Funktion zum Speichern der Kalenderdaten in einer JSON-Datei
const timeZoneBerlin = (dateTime) => {
  const date = new Date(dateTime);

  // Konvertiere die UTC-Zeit in die Berlin-Zeit
  const options = { timeZone: 'Europe/Berlin', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  const formatter = new Intl.DateTimeFormat('de-DE', options);
  
  // Extrahiere die umgestellte Zeit und baue eine ISO-Zeit daraus
  const parts = formatter.formatToParts(date);
  const adjustedDate = new Date(
    `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}T${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`
  );

  return adjustedDate.toISOString();
};

const saveCalendarData = async () => {
  try {
    const events = await fetchCalendarData();

    const adjustedEvents = events.map(event => ({
      ...event,
      start: { ...event.start, dateTime: timeZoneBerlin(event.start.dateTime) },
      end: { ...event.end, dateTime: timeZoneBerlin(event.end.dateTime) },
    }));

    const filePath = path.join(__dirname, '../Frontend/bookings.json');
    fs.writeFileSync(filePath, JSON.stringify(adjustedEvents, null, 2));
    console.log('Kalenderdaten erfolgreich gespeichert.');
  } catch (error) {
    console.error('Fehler beim Speichern der Kalenderdaten:', error.message);
  }
};


// WebSocket-Verbindung behandeln
wss.on('connection', ws => {
  console.log('Neuer Client verbunden.');

  // Initialdaten beim Verbinden senden
  const filePath = path.join(__dirname, '../Frontend/bookings.json');
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
setInterval(saveCalendarData, 1 * 60 * 1000);

// Beim Start einmal Daten abrufen und speichern
saveCalendarData();
