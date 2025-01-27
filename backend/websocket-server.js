require('dotenv').config();
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getAccessToken } = require('./tokenManager');

const PORT = 5500;
const GRAPH_API_ENDPOINT = `https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/events`;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`WebSocket-Server läuft auf ws://localhost:${PORT}`);
});

const createEventInGraph = async (eventData) => {
  const token = await getAccessToken();
  if (!token) throw new Error("Token fehlt.");

  const payload = {
    subject: eventData.title,
    start: {
      dateTime: eventData.start,
      timeZone: "W. Europe Standard Time",
    },
    end: {
      dateTime: eventData.end,
      timeZone: "W. Europe Standard Time",
    },
    attendees: eventData.attendees || [],
    body: {
      contentType: "HTML",
      content: "Event erstellt mit lokaler Zeit und Zeitzone.",
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

wss.on("connection", (ws, req) => {
  console.log(`Neuer Client verbunden: ${req.socket.remoteAddress}`);

  const filePath = path.join(__dirname, '../Frontend/bookings.json');
  if (fs.existsSync(filePath)) {
    const initialData = fs.readFileSync(filePath, 'utf-8');
    ws.send(JSON.stringify({ type: "initial", data: JSON.parse(initialData) }));
  } else {
    ws.send(JSON.stringify({ type: "initial", data: [] }));
  }

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      switch (parsedMessage.type) {
        case "create-event":
          if (!parsedMessage.data.start || !parsedMessage.data.end) {
            ws.send(JSON.stringify({ type: "error", message: "Start- oder Endzeit fehlt." }));
            return;
          }

          const createdEvent = await createEventInGraph(parsedMessage.data);
          ws.send(JSON.stringify({ type: "event-created", data: createdEvent }));
          console.log("Event erfolgreich erstellt:", createdEvent);
          break;

        case "fetch-events":
          const events = fs.existsSync(filePath)
            ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            : [];
          ws.send(JSON.stringify({ type: "events-data", data: events }));
          console.log("Kalenderdaten an den Client gesendet.");
          break;

        default:
          ws.send(JSON.stringify({ type: "error", message: "Unbekannter Nachrichtentyp." }));
          console.error("Unbekannter Nachrichtentyp:", parsedMessage.type);
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Nachricht:", error.message);
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.response?.data?.error?.message || error.message,
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client hat die Verbindung geschlossen.");
  });

  ws.on("error", (error) => {
    console.error("WebSocket-Fehler:", error);
  });
});

setInterval(saveCalendarData, 1 * 60 * 1000) // 5 * 60 Sekunden * 1000 Milkisekunden = 5 Minuten
