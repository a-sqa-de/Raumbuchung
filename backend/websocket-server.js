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

const getStartOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const monday = new Date(now);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; 
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
};

const getEndOfMonth = () => {
  const today = new Date();
  today.setMonth(today.getMonth() + 1); // Nächster Monat
  today.setDate(0); // Letzter Tag des aktuellen Monats
  today.setHours(23, 59, 59, 999);
  return today.toISOString();
};

const fetchCalendarData = async () => {
  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const startOfWeekISO = getStartOfWeek();
    const endOfMonthISO = getEndOfMonth();

    // Filter für Einzel- und Serientermine
    const filter = `type eq 'seriesMaster' or start/dateTime ge '${startOfWeekISO}'`;
    let endpoint = `https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events?$filter=${encodeURIComponent(filter)}&$top=100`;

    let events = [];

    // Abrufen aller regulären und Serien-Master-Termine
    while (endpoint) {
      const response = await axios.get(endpoint, { headers });
      events = events.concat(response.data.value);
      endpoint = response.data['@odata.nextLink'] || null; 
    }

    // Falls Serientermine (`seriesMaster`) existieren, rufe ihre `instances`-API mit Zeitfenster ab
    let allInstances = [];
    for (let event of events) {
      if (event.type === "seriesMaster") {
        let instanceEndpoint = `https://graph.microsoft.com/v1.0/users/0a4ce4b2-277d-4eb2-9455-4f60a3d2d47c/calendar/events/${event.id}/instances?startDateTime=${encodeURIComponent(startOfWeekISO)}&endDateTime=${encodeURIComponent(endOfMonthISO)}`;
        
        while (instanceEndpoint) {
          const instanceResponse = await axios.get(instanceEndpoint, { headers });
          allInstances = allInstances.concat(instanceResponse.data.value);
          instanceEndpoint = instanceResponse.data['@odata.nextLink'] || null;
        }
      }
    }

    // Kombiniere Einzeltermine + Serientermin-Instanzen
    return events.concat(allInstances);
    
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalenderdaten:', error.response?.data || error.message);
    throw error;
  }
};

// Funktion zum Speichern der Kalenderdaten in einer JSON-Datei
const saveCalendarData = async () => {
  try {
    const events = await fetchCalendarData();
    const filePath = path.join(__dirname, '../Frontend/bookings.json');

    // Schreibe die aktualisierten Daten in die Datei
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    console.log('Kalenderdaten erfolgreich gespeichert.');

    // Benachrichtige den Client über die neuen Daten
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'events-data', data: events }));
        console.log('Aktualisierte Daten an Client gesendet.');
      }
    });
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
    console.log("Client hat Verbindung geschlossen.");
  });

  ws.on("error", (error) => {
    console.error("WebSocket-Fehler:", error);
  });
});

saveCalendarData();
setInterval(saveCalendarData, 5 * 60 * 1000) // 5 * 60 Sekunden * 1000 Millisekunden = 5 Minuten
