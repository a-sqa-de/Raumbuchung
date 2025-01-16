// Funktion: Zeitformat anpassen (HH:MM)
function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Funktion: Unterschied in Tagen berechnen
function getDayDifference(dateStr) {
  const today = new Date();
  const eventDate = new Date(dateStr);

  const differenceInTime = eventDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);

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

  const timeDifference = nextEventTime - now;

  if (timeDifference > 0) {
    const totalSeconds = Math.floor(timeDifference / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    currentTimeContainer.textContent = `Nächstes Meeting in: ${hours} Stunden & ${minutes} Minuten`;
  } else {
    currentTimeContainer.textContent = "";
  }
}

// Funktion: Events aktualisieren
async function updateMeetings() {
  try {
    const response = await fetch("buchungen.json");
    if (!response.ok) {
      throw new Error("Fehler beim Laden der JSON-Daten");
    }

    const bookings = await response.json();
    const now = new Date();

    const currentEvent = bookings.find(
      (booking) => new Date(booking.start.dateTime) <= now && new Date(booking.end.dateTime) > now
    );

    const futureEvents = bookings
      .filter((booking) => new Date(booking.start.dateTime) > now)
      .sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

    const currentEventContainer = document.getElementById("current-meeting");
    const futureEventsContainer = document.getElementById("future-meetings");

    // Aktuelles Ereignis anzeigen
    if (currentEvent) {
      currentEventContainer.querySelector("#current-title").textContent =
        truncateTitle(currentEvent.subject);
      currentEventContainer.querySelector("#current-organizer").textContent =
        `${currentEvent.organizer.emailAddress.name}`;
      currentEventContainer.querySelector("#current-time").textContent = `${formatTime(
        currentEvent.start.dateTime
      )} - ${formatTime(currentEvent.end.dateTime)}`;

      // Teilnehmerliste für aktuelles Ereignis
      const currentAttendees = createAttendeeList(currentEvent.attendees);
      let attendeesContainer = currentEventContainer.querySelector("#current-attendees");

      if (!attendeesContainer) {
        attendeesContainer = document.createElement("div");
        attendeesContainer.id = "current-attendees";
        currentEventContainer.appendChild(attendeesContainer);
      }

      attendeesContainer.textContent = currentAttendees;

      currentEventContainer.classList.remove("hidden");
    } else {
      currentEventContainer.querySelector("#current-title").textContent = "Aktuell kein Meeting";
      currentEventContainer.querySelector("#current-time").textContent = "";
      currentEventContainer.classList.remove("hidden");

      if (futureEvents.length > 0) {
        const nextEvent = futureEvents[0];
        const nextEventStartTime = nextEvent.start.dateTime;

        updateCountdown(nextEventStartTime);
        setInterval(() => updateCountdown(nextEventStartTime), 60000);
      }
    }

    // Zukünftige Ereignisse anzeigen
    if (futureEvents.length === 0) {
      futureEventsContainer.style.display = "none";
    } else {
      futureEventsContainer.style.display = "block";
    }

    futureEventsContainer.innerHTML = "";

    futureEvents.slice(0, 3).forEach((event, index) => {
      const card = document.createElement("div");
      card.classList.add("event-card");

      const cardWidth = 100 - index * 10;
      card.style.width = `${cardWidth - 30}%`;
      card.style.height = `${cardWidth + 5}%`;
      card.style.margin = "10px auto";

      const dayDisplay = getDayDisplay(event.start.dateTime);

      const attendeeList = createAttendeeList(event.attendees);

      card.innerHTML = `
        <div>${dayDisplay}</div>
        <div><strong>${truncateTitle(event.subject)}</strong></div>
        <div>${event.organizer.emailAddress.name}</div>
        <div>${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}</div>
        <div>${attendeeList}</div>
      `;

      futureEventsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Daten:", error);
  }
}

// Funktion: Titel abkürzen
function truncateTitle(title) {
  return title.length > 55 ? `${title.substring(0, 52)}...` : title;
}

// Funktion: Teilnehmerliste erstellen
function createAttendeeList(attendees) {
  if (!attendees || attendees.length === 0) return "Keine Teilnehmer angelegt";

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.emailAddress.name !== "Konferenzraum 01" &&
      attendee.emailAddress.name !== "Präsenzkalender"
  );

  const displayedAttendees = filteredAttendees.slice(0, 2);
  const attendeeNames = displayedAttendees
    .map((attendee) => attendee.emailAddress.name)
    .join(", ");

  const remainingCount = filteredAttendees.length - displayedAttendees.length;

  return remainingCount > 0
    ? `mit ${attendeeNames}, +${remainingCount} weitere`
    : attendeeNames || "Keine Teilnehmer angelegt";
}

updateMeetings();
setInterval(updateMeetings, 10000);
