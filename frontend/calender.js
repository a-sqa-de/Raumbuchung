document.addEventListener("DOMContentLoaded", () => {
  const toggleViewButton = document.getElementById("toggle-view");
  const cardView = document.getElementById("card-view");
  const calendarView = document.getElementById("calendar-view");
  const calendarEl = document.getElementById("calendar");

  let isCalendarView = false;
  let calendar;

  function initializeLayout() {
    cardView.style.display = "block";
    calendarView.style.display = "none";
  }

  toggleViewButton.addEventListener("click", () => {
    isCalendarView = !isCalendarView;

    if (isCalendarView) {
      // Zeigt die Kalenderansicht und deaktiviert die Kartenansicht
      cardView.style.display = "none";
      calendarView.style.display = "block";
      toggleViewButton.textContent = "Dashboard";

      // Initialisiert den Kalender nur einmal
      if (!calendar) {
        calendar = new FullCalendar.Calendar(calendarEl, {
          contentHeight: "auto",
          initialView: "dayGridWeek",
          locale: "de",
          firstDay: 1,
          hiddenDays: [0, 6],
          headerToolbar: {
            left: "",
            center: "title",
          },
          eventTimeFormat: {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          },
          buttonText: {
            today: "Heute",
          },
          events: [],
        });
      }

      calendar.render();

      // Lade Meetings für die Kalenderansicht
      loadAndDisplayMeetings();
    } else {
      // Zeigt die Kartenansicht und deaktiviert die Kalenderansicht
      calendarView.style.display = "none";
      cardView.style.display = "block";
      toggleViewButton.textContent = "Wochenansicht";
    }
  });

  // Funktion zum Konvertieren der Zeit in die Berlin-Zeitzone
  function convertToBerlinTime(utcTime) {
    const date = new Date(utcTime);

    // Dynamisch die Zeitzone von Berlin anwenden
    const berlinOffset = new Date().getTimezoneOffset() === -120 ? 2 : 1; // Sommer-/Winterzeit
    date.setHours(date.getHours() + berlinOffset);

    return date.toISOString();
  }

  async function loadAndDisplayMeetings() {
    try {
      const response = await fetch("bookings.json");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der JSON-Daten");
      }

      const bookings = await response.json();

      // Bereite Events für den Kalender vor
      const calendarEvents = bookings.map((booking) => ({
        title: booking.subject,
        start: convertToBerlinTime(booking.start.dateTime),
        end: convertToBerlinTime(booking.end.dateTime),
      }));

      // Events dem Kalender hinzufügen
      if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(calendarEvents);
      }
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Daten:", error);
    }
  }

  initializeLayout();
});
