const bookings = [
    {
      creator: "Max Mustermann",
      startTime: "2025-01-08T08:00:00",
      endTime: "2025-01-08T08:15:00",
    },
    {
      creator: "Anna Müller",
      startTime: "2025-01-08T08:15:00",
      endTime: "2025-01-08T08:30:00",
    },
    {
      creator: "John Doe",
      startTime: "2025-01-08T08:35:00",
      endTime: "2025-01-08T08:45:00",
    },
    {
      creator: "Jane Smith",
      startTime: "2025-01-08T10:45:00",
      endTime: "2025-01-08T11:00:00",
    },
    {
      creator: "Jane ffghf",
      startTime: "2025-01-07T11:03:00",
      endTime: "2025-01-07T11:10:00",
      titel: "Ballsport",
    },
    {
      creator: "Lulu",
      startTime: "2025-01-07T11:15:00",
      endTime: "2025-01-07T11:00:00",
      titel: "Ballsport",
    },
    {
      creator: "Jane ffghf",
      startTime: "2025-01-08T15:00:00",
      endTime: "2025-01-08T16:00:00",
      titel: "Ballsport",
    },
  ];
  
  // Funktion: Zeitformat anpassen (HH:MM)
  function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  // Funktion: Datum formatieren
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { dateStyle: "short" });
  }
  
  // Funktion: Events aktualisieren
function updateEvents() {

  // Aktuelles Datum/Zeit
  const now = new Date();
  
  // 1. Aktuelles Event bestimmen
  const currentEvent = bookings.find(
    (booking) => new Date(booking.startTime) <= now && new Date(booking.endTime) > now
  );
  
  // 2. Zukünftige Events filtern und sortieren (absteigend nach Startzeit)
  const futureEvents = bookings
    .filter((booking) => new Date(booking.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  
  // HTML-Container auswählen
  const currentEventContainer = document.getElementById("current-event");
  const futureEventsContainer = document.getElementById("future-events");
  
 // 3. Aktuelles Event anzeigen
if (currentEvent) {
  currentEventContainer.querySelector("#current-creator").textContent = currentEvent.creator;
  currentEventContainer.querySelector(
    "#current-time"
  ).textContent = `${formatTime(currentEvent.startTime)} - ${formatTime(currentEvent.endTime)}`;
  currentEventContainer.classList.remove("hidden");
} else {
  // Wenn kein aktuelles Event vorhanden ist, "Der Raum ist frei" anzeigen
  currentEventContainer.querySelector("#current-creator").textContent = "Kein Event vorhanden";
  currentEventContainer.querySelector("#current-time").textContent = "";
  currentEventContainer.classList.remove("hidden");
}
  
  // 4. Zukünftige Events anzeigen (maximal 4)
  futureEventsContainer.innerHTML = "";

  //5. Schleife für Anzahl der Ergebnisse
  futureEvents.slice(0, 4).forEach((event, index) => {
    const card = document.createElement("div");
  
    // Karte gestalten (zentriert, kleiner werdend)
    card.classList.add("event-card");
    const cardWidth = 100 - index * 10; // Dynamische Breite
    card.style.width = `${cardWidth-10}%`;
    card.style.margin = "0 auto"; // Zentrierung
  
    // Karteninhalt
    card.innerHTML = `
      <div class="event-creator">${event.creator || "Unbekannt"}</div>
      <div>${formatDate(event.startTime)} ${formatTime(event.startTime)} - ${formatTime(event.endTime)}</div>
    `;
  
    // Karte in den Container einfügen
    futureEventsContainer.appendChild(card);
  }
)

// Funktion: Letzte Aktualisierung anzeigen
function updateLastUpdated() {
  const now = new Date(); // Aktueller Zeitpunkt
  const lastUpdatedContainer = document.getElementById("last-updated"); // HTML-Container auswählen

  // Überprüfen, ob der Container existiert
  if (lastUpdatedContainer) {
    lastUpdatedContainer.textContent = `Letzte Aktualisierung: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
  } else {
    console.error("Container für 'last-updated' nicht gefunden!");
  }
}

// Test: Rufe die Funktion direkt auf
updateLastUpdated();

// Test: Aktualisierung alle 30 Sekunden die Angabe der letzten Aktualisierung
setInterval(updateLastUpdated, 15000);

}

// Initialer Aufruf der Funktion
updateEvents();

// Führt alle 30 Sekunden das Script neu aus (autom. Reload der Seite)
setInterval(updateEvents, 15000);
  