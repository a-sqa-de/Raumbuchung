// Funktion: Zeitformat anpassen (HH:MM)
function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Funktion: Unterschied in Tagen berechnen
function getDayDifference(dateStr) {
  const today = new Date();
  const eventDate = new Date(dateStr);

  // Unterschied in Millisekunden
  const differenceInTime = eventDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);

  // Unterschied in Tagen berechnen
  return Math.round(differenceInTime / (1000 * 60 * 60 * 24));
}

// Funktion: Anzeige für die Tagesdifferenz
function getDayDisplay(dateStr) {
  const dayDifference = getDayDifference(dateStr);

  if (dayDifference === 0) {
    return "";
  } else if (dayDifference === 1) {
    return "(morgen)";
  } else if (dayDifference > 1) {
    return `<em>in ${dayDifference} Tagen</em>`;
  } 
}

// Funktion: Countdown-Update
function updateCountdown(nextEventStartTime) {
  const now = new Date();
  const nextEventTime = new Date(nextEventStartTime);
  const currentTimeContainer = document.querySelector("#current-time");

  if (!currentTimeContainer) return;

  // Berechne verbleibende Zeit
  const timeDifference = nextEventTime - now;

  if (timeDifference > 0) {
    const totalSeconds = Math.floor(timeDifference / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    currentTimeContainer.textContent = `Nächstes Meeting in: ${hours} Stunden & ${minutes} Minuten`;
  } else {
    currentTimeContainer.textContent = ""; // Countdown wird versteckt, wenn Zeit abgelaufen ist
  }
}

// Funktion: Events aktualisieren
async function updateMeetings() {
  try {
    // JSON-Daten laden
    const response = await fetch("buchungen.json");
    if (!response.ok) {
      throw new Error("Fehler beim Laden der JSON-Daten");
    }

    const bookings = await response.json();

    // Aktuelles Datum/Zeit
    const now = new Date();

    // 1. Aktuelles Event bestimmen
    const currentEvent = bookings.find(
      (booking) => new Date(booking.start.dateTime) <= now && new Date(booking.end.dateTime) > now
    );

    // 2. Zukünftige Events filtern und sortieren (nach Startzeit)
    const futureEvents = bookings
      .filter((booking) => new Date(booking.start.dateTime) > now)
      .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

    // HTML-Container auswählen
    const currentEventContainer = document.getElementById("current-meeting");
    const futureEventsContainer = document.getElementById("future-meetings");

    // 3. Aktuelles Event anzeigen
    if (currentEvent) {
      currentEventContainer.querySelector("#current-title").textContent = `${currentEvent.subject}`;
      currentEventContainer.querySelector("#current-organizer").textContent = `${currentEvent.organizer.emailAddress.name}`;
      currentEventContainer.querySelector("#current-time").textContent = `${formatTime(currentEvent.start.dateTime)} 
        - ${formatTime(currentEvent.end.dateTime)}`;
      currentEventContainer.classList.remove("hidden");
    } else {
      currentEventContainer.querySelector("#current-title").textContent = "Aktuell kein Meeting";
      currentEventContainer.querySelector("#current-time").textContent = "";
      currentEventContainer.classList.remove("hidden");

      // Countdown für das nächste Event anzeigen, falls vorhanden
      if (futureEvents.length > 0) {
        const nextEvent = futureEvents[0];
        const nextEventStartTime = nextEvent.start.dateTime;

        updateCountdown(nextEventStartTime);
        setInterval(() => updateCountdown(nextEventStartTime), 60000); // aktualisiert den Zähler für Countdown jede Minute
      }
    }

    if (futureEvents.length === 0) {
      futureEventsContainer.style.display = "none";
    } else {
      futureEventsContainer.style.display = "block";
    }

    // 4. Zukünftige Events anzeigen (maximal 4)
    futureEventsContainer.innerHTML = "";

    futureEvents.slice(0, 3).forEach((event, index) => {
      const card = document.createElement("div");

      // Karte gestalten (zentriert, kleiner werdend)
      card.classList.add("event-card");
      const cardWidth = 100 - index * 10; // Dynamische Breite
      card.style.width = `${cardWidth - 30}%`;
      card.style.height = `${cardWidth + 5}%`;
      card.style.margin = "10px auto";

      // Tagesanzeige
      const dayDisplay = getDayDisplay(event.start.dateTime);

      // Karteninhalt
      card.innerHTML = `
        <div>${dayDisplay}</div>
        <div><strong>${event.subject || "Kein Titel"}</strong> </div>
        <div>${event.organizer.emailAddress.name}</div>
        <div>${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}</div>
      `;

      // Karte in den Container einfügen
      futureEventsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Daten:", error);
  }
}

updateMeetings();

setInterval(updateMeetings, 30000);
