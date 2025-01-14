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
    return `(in ${dayDifference} Tagen)`;
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
    const hours = String(Math.floor((timeDifference / (1000 * 60 * 60)) % 24)).padStart(2, "0");
    const minutes = String(Math.floor((timeDifference / (1000 * 60)) % 60)).padStart(2, "0");
    const seconds = String(Math.floor((timeDifference / 1000) % 60)).padStart(2, "0");

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

    const graphData = await response.json();
    const bookings = graphData.value;

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
      currentEventContainer.querySelector("#current-organizer").textContent = `${currentEvent.organizer.name}`;
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
        setInterval(() => updateCountdown(nextEventStartTime), 1000); // Jede Sekunde aktualisieren
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
        <div><strong>${event.subject || "Kein Titel"}</strong> </div>
        <div>${event.organizer.name}</div>
        <div>${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}</div>
        <div>${dayDisplay}</div>
      `;

      // Karte in den Container einfügen
      futureEventsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Daten:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleViewButton = document.getElementById("toggle-view");
  const cardView = document.getElementById("card-view");
  const calendarView = document.getElementById("calendar-view");
  const calendarEl = document.getElementById("calendar");

  let isCalendarView = false;
  let calendar;

  // Funktion zur Initialisierung der Ansichten
  function initializeLayout() {
    cardView.style.display = "block";
    calendarView.style.display = "none";
  }

  // Funktion zur Korrektur von Layout-Problemen
  function resetLayout() {
    cardView.style.display = "block"; // Sicherstellen, dass Kartenansicht sichtbar bleibt
    cardView.style.height = "auto";
    cardView.offsetHeight; // Reflow erzwingen
  }

  toggleViewButton.addEventListener("click", () => {
    isCalendarView = !isCalendarView;

    if (isCalendarView) {
      cardView.style.display = "none"; // Versteckt die Kartenansicht
      calendarView.style.display = "block"; // Zeigt die Kalenderansicht
      toggleViewButton.textContent = "Dashboard";

      if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
          contentHeight: "auto",
          initialView: "dayGridWeek",
          locale: "de",
          firstDay: 1,
          hiddenDays: [0, 6], // Sonntag (0) und Samstag (6) werden ausgeblendet
          headerToolbar: {
            left: "",
            center: "title",
          },
          eventTimeFormat: { // Zeitformat anpassen
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 24-Stunden-Format
          },
          buttonText: { // Anpassung der Button-Texte
            today: "Heute"
          },
          events: [],
        });
      }

      calendar.render();
    } else {
      calendarView.style.display = "none"; // Versteckt die Kalenderansicht
      cardView.style.display = "block"; // Zeigt die Kartenansicht
      toggleViewButton.textContent = "Wochenansicht";

      // Korrigiere Layout nach dem Wechsel
      resetLayout();
    }
  });

  async function loadAndDisplayMeetings() {
    try {
      const response = await fetch("buchungen.json");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der JSON-Daten");
      }

      const graphData = await response.json();
      const bookings = graphData.value;

      const calendarEvents = bookings.map((booking) => ({
        title: booking.subject,
        start: booking.start.dateTime,
        end: booking.end.dateTime,
      }));

      if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(calendarEvents);
      }

      updateMeetings(bookings);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Daten:", error);
    }
  }

  // Initialisiere das Layout beim Laden der Seite
  initializeLayout();

  //Lädt alle Meetings und aktualisiert diese jede Sekunde
  loadAndDisplayMeetings();
  setInterval(loadAndDisplayMeetings, 1000);
});

updateMeetings();

setInterval(updateMeetings, 1000);