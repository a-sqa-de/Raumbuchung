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
                      hour: "2-digit",
                      minute: "2-digit",
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

          const bookings = await response.json();

          const calendarEvents = bookings.map((booking) => ({
              title: booking.subject,
              start: booking.start.dateTime,
              end: booking.end.dateTime,
          }));

          if (calendar) {
              calendar.removeAllEvents();
              calendar.addEventSource(calendarEvents);
          }

          updateCardView(bookings);
      } catch (error) {
          console.error("Fehler beim Verarbeiten der Daten:", error);
      }
  }

  function updateCardView(bookings) {
      const cardContainer = document.getElementById("card-container");
      cardContainer.innerHTML = "";

      bookings.forEach((booking) => {
          const card = document.createElement("div");
          card.classList.add("booking-card");

          const title = booking.subject || "Kein Titel";
          const organizer = booking.organizer?.emailAddress?.name || "Unbekannter Organisator";
          const startTime = formatTime(booking.start.dateTime);
          const endTime = formatTime(booking.end.dateTime);

          card.innerHTML = `
              <div><strong>${title}</strong></div>
              <div>${organizer}</div>
              <div>${startTime} - ${endTime}</div>
          `;

          cardContainer.appendChild(card);
      });
  }

  function formatTime(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Initialisiere das Layout beim Laden der Seite
  initializeLayout();

  // Lädt alle Meetings und aktualisiert diese jede Minute
  loadAndDisplayMeetings();
  setInterval(loadAndDisplayMeetings, 5000); // Aktualisierung alle 30 Sekunden
});
