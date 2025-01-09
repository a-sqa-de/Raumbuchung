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
  } else {
    return "(vergangenes Event)"; // Optional für vergangene Events
  }
}

// Funktion: Events aktualisieren
async function updateEvents() {
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
    const currentEventContainer = document.getElementById("current-event");
    const futureEventsContainer = document.getElementById("future-events");

    // 3. Aktuelles Event anzeigen
    if (currentEvent) {
      currentEventContainer.querySelector("#current-creator").textContent = `Titel: ${currentEvent.subject}`;
      currentEventContainer.querySelector(
        "#current-organizer"
      ).textContent = `Organisator: ${currentEvent.organizer.name}`;
      currentEventContainer.querySelector(
        "#current-time"
      ).textContent = `Zeit: ${formatTime(currentEvent.start.dateTime)} - ${formatTime(currentEvent.end.dateTime)}`;
      currentEventContainer.classList.remove("hidden");
    } else {
      currentEventContainer.querySelector("#current-creator").textContent = "Derzeit kein Event vorhanden";
      currentEventContainer.querySelector("#current-time").textContent = "";
      currentEventContainer.classList.remove("hidden");
    }

    // 4. Zukünftige Events anzeigen (maximal 4)
    futureEventsContainer.innerHTML = "";

    futureEvents.slice(0, 4).forEach((event, index) => {
      const card = document.createElement("div");

      // Karte gestalten (zentriert, kleiner werdend)
      card.classList.add("event-card");
      const cardWidth = 100 - index * 10; // Dynamische Breite
      card.style.width = `${cardWidth - 40}%`;
      card.style.height = `${cardWidth + 10}%`;
      card.style.margin = "0 auto";

      // Tagesanzeige
      const dayDisplay = getDayDisplay(event.start.dateTime);

      // Karteninhalt
      card.innerHTML = `
        <div><strong>Titel:</strong> ${event.subject || "Kein Titel"}</div>
        <div><strong>Organisator:</strong> ${event.organizer.name}</div>
        <div><strong>Zeit:</strong> ${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)} ${dayDisplay}</div>
      `;

      // Karte in den Container einfügen
      futureEventsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Daten:", error);
  }
}

// Funktion: Letzte Aktualisierung anzeigen
function updateLastUpdated() {
  const now = new Date();
  const lastUpdatedContainer = document.getElementById("last-updated");

  if (lastUpdatedContainer) {
    lastUpdatedContainer.textContent = `Letzte Aktualisierung: ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  } else {
    console.error("Container für 'last-updated' nicht gefunden!");
  }
}

// Funktion: Letzte Aktualisierung anzeigen
function updateLastUpdated() {
  const now = new Date();
  const lastUpdatedContainer = document.getElementById("last-updated");

  if (lastUpdatedContainer) {
    lastUpdatedContainer.textContent = `Letzte Aktualisierung: ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  } else {
    console.error("Container für 'last-updated' nicht gefunden!");
  }
}

// Funktion: Letzte Aktualisierung anzeigen
function updateLastUpdated() {
  const now = new Date();
  const lastUpdatedContainer = document.getElementById("last-updated");

  if (lastUpdatedContainer) {
    lastUpdatedContainer.textContent = `Letzte Aktualisierung: ${now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}`;
  } else {
    console.error("Container für 'last-updated' nicht gefunden!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Elemente auswählen
  const toggleViewButton = document.getElementById("toggle-view");
  const cardView = document.getElementById("card-view");
  const calendarView = document.getElementById("calendar-view");
  const calendarEl = document.getElementById("calendar");

  let isCalendarView = false;
  let calendar;

  // Umschaltlogik für Ansichten
  toggleViewButton.addEventListener("click", () => {
    isCalendarView = !isCalendarView;

    if (isCalendarView) {
      // Kalenderansicht aktivieren
      cardView.style.display = "none";
      calendarView.style.display = "block";
      toggleViewButton.textContent = "Wechsle zur Kartenansicht";
      
      // Kalender initialisieren, wenn noch nicht geschehen
      if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
          contentHeight: "auto",
          initialView: "dayGridWeek",
          locale: "de", //<--- Lokalisierung, klappt nur irgendwie nicht...
          headerToolbar: {
            left: "", //eigentlich steht hier "prev,next today", doppelt aber, wenn "right:" deaktiviert ist. Daher leer!
            center: "title",
            // Anzeige für "right:" fehlerhaft wenn man zwischen day,week,month Ansichten wechselt - daher auskommentiert
            /*right: "dayGridMonth,timeGridWeek,timeGridDay",*/ 
          },
          events: [], // Events später hinzufügen
        });
      }
      
      
      calendar.render();
    } else {
      // Kartenansicht aktivieren
      calendarView.style.display = "none";
      cardView.style.display = "block";
      toggleViewButton.textContent = "Wechsle zur Kalenderansicht";
    }
  });

  // Funktion zum Laden und Anzeigen der Events
  async function loadAndDisplayEvents() {
    try {
      const response = await fetch("buchungen.json");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der JSON-Daten");
      }

      const graphData = await response.json();
      const bookings = graphData.value;

      // Events für den Kalender formatieren
      const calendarEvents = bookings.map(booking => ({
        title: booking.subject,
        start: booking.start.dateTime,
        end: booking.end.dateTime
      }));

      // Wenn der Kalender initialisiert ist, Events hinzufügen
      if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(calendarEvents);
      }

      // Kartenansicht aktualisieren
      updateEvents(bookings);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Daten:", error);
    }
  }

  // Initialer Aufruf der Funktionen
  loadAndDisplayEvents();

  // Periodische Aktualisierung
  setInterval(loadAndDisplayEvents, 1000);
});


// Initialer Aufruf der Funktionen
updateEvents();
updateLastUpdated();

// Periodische Aktualisierung
setInterval(updateEvents, 15000);
setInterval(updateLastUpdated, 15000);
