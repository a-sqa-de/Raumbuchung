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
