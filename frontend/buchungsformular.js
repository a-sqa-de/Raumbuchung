// WebSocket-Variable global initialisieren
let ws;

function initializeWebSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log("WebSocket ist bereits verbunden oder wird verbunden.");
    return;
  }

  ws = new WebSocket('ws://localhost:5500');
  console.log('WebSocket initialisiert:', ws);

  ws.onopen = () => {
    console.log('WebSocket-Verbindung hergestellt');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'event-created') {
      alert('Termin erfolgreich erstellt');
    } else if (message.type === 'error') {
      alert(`Fehler: ${message.message}`);
    } else if (message.type === 'initial') {
      console.log('Initialdaten empfangen:', message.data);
    } else {
      console.log('Unbekannte Nachricht vom Server:', message);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket-Fehler:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket-Verbindung geschlossen');
  };
}

function createForm() {
  console.log("createForm aufgerufen");

  const formContainer = document.getElementById("form-container");

  if (!formContainer) {
    console.error("Formular-Container fehlt.");
    return;
  }

  // Verhindern, dass mehrfach das Formular erstellt wird
  if (formContainer.querySelector(".booking-form")) {
    console.warn("Formular bereits erstellt, überspringe Erstellung.");
    return;
  }

  // Formular erstellen
  const form = document.createElement("form");
  form.className = "booking-form";

  // Titel-Feld
  const titleField = createInputField("Titel", "titel", "Wie heißt dein Event?");
  form.appendChild(titleField);

  // Teilnehmer-Feld
  const attendeesField = createInputField(
    "Teilnehmer",
    "attendees",
    "z.B. m.mustermann, m mustermann usw."
  );
  form.appendChild(attendeesField);

  // Zeit-Feld für Startzeit und Endzeit
  const timeContainer = document.createElement("div");
  timeContainer.className = "field-container";

  const timeLabel = document.createElement("label");
  timeLabel.textContent = "Start- und Endzeit auswählen:";
  timeContainer.appendChild(timeLabel);

  const hiddenStartInput = document.createElement("input");
  hiddenStartInput.type = "hidden";
  hiddenStartInput.id = "selected-start-time";
  hiddenStartInput.name = "start-time";

  const hiddenEndInput = document.createElement("input");
  hiddenEndInput.type = "hidden";
  hiddenEndInput.id = "selected-end-time";
  hiddenEndInput.name = "end-time";

  timeContainer.appendChild(hiddenStartInput);
  timeContainer.appendChild(hiddenEndInput);

  const availableTimesContainer = document.createElement("div");
  availableTimesContainer.id = "available-times";
  availableTimesContainer.className = "time-grid";
  timeContainer.appendChild(availableTimesContainer);

  form.appendChild(timeContainer);

  // Submit-Button
  const submitButton = document.createElement("button");
  submitButton.className = "submit-button";
  submitButton.type = "submit";
  submitButton.textContent = "Termin eintragen";
  form.appendChild(submitButton);

  // Form in den Container einfügen
  formContainer.innerHTML = ""; // Vorherigen Inhalt löschen
  formContainer.appendChild(form);

  // Zeiten laden
  loadAvailableTimes(availableTimesContainer, hiddenStartInput, hiddenEndInput);

  // Formular-Submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("titel").value;
    const rawAttendees = document.getElementById("attendees").value;
    const startTime = document.getElementById("selected-start-time").value;
    const endTime = document.getElementById("selected-end-time").value;

    if (!title || !startTime || !endTime) {
      alert("Bitte alle Felder ausfüllen!");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const startDateTime = `${today}T${startTime}:00`;
    const endDateTime = `${today}T${endTime}:00`;

    const attendees = rawAttendees.split(",").map((name) => ({
      type: "required",
      emailAddress: {
        name: name.trim(),
        address: `${name.trim().replace(/\s+/g, ".").toLowerCase()}@a-sqa.de`,
      },
    }));

    const eventData = {
      title,
      start: startDateTime,
      end: endDateTime,
      attendees,
    };

    if (ws.readyState === WebSocket.OPEN) {
      console.log("Daten an WebSocket:", eventData);
      ws.send(JSON.stringify({ type: "create-event", data: eventData }));
    } else {
      alert("WebSocket-Verbindung nicht offen. Bitte erneut versuchen.");
    }
  });
}

// Hilfsfunktion zum Erstellen eines Eingabefelds
function createInputField(labelText, id, placeholder = "", readonly = false) {
  const fieldContainer = document.createElement("div");
  fieldContainer.className = "field-container";

  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = id;

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.readOnly = readonly;

  fieldContainer.appendChild(label);
  fieldContainer.appendChild(input);
  return fieldContainer;
}

// Lade verfügbare Zeiten
async function loadAvailableTimes(container, startInput, endInput) {
  try {
    const response = await fetch("bookings.json");
    if (!response.ok) throw new Error("Fehler beim Laden der Buchungen");

    const bookings = await response.json();
    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(18, 0, 0, 0);

    container.innerHTML = ""; // Vorherigen Inhalt löschen

    const availableTimes = [];
    while (now <= endOfDay) {
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const currentTime = new Date(now);

      const isBlocked = bookings.some((booking) => {
        const bookingStart = new Date(booking.start.dateTime);
        const bookingEnd = new Date(booking.end.dateTime);

        // Künstlich um 1 Stunde nach hinten versetzen
        bookingStart.setHours(bookingStart.getHours() + 1);
        bookingEnd.setHours(bookingEnd.getHours() + 1);

        return currentTime >= bookingStart && currentTime < bookingEnd;
      });

      availableTimes.push({ timeString, currentTime, isBlocked });
      now.setMinutes(now.getMinutes() + 15);
    }

    availableTimes.forEach(({ timeString, currentTime, isBlocked }) => {
      const card = document.createElement("div");
      card.className = "time-card";
      if (isBlocked) card.classList.add("blocked");
      card.textContent = timeString;

      card.addEventListener("click", () => {
        if (isBlocked) {
          alert("Diese Zeit ist bereits belegt.");
          return;
        }

        if (card.classList.contains("selected")) {
          card.classList.remove("selected");
          if (startInput.value === timeString) startInput.value = "";
          if (endInput.value === timeString) endInput.value = "";
        } else {
          if (!startInput.value) {
            startInput.value = timeString;
            card.classList.add("selected");
          } else if (!endInput.value) {
            const selectedStart = new Date(
              availableTimes.find((t) => t.timeString === startInput.value).currentTime
            );

            if (currentTime <= selectedStart) {
              alert("Die Endzeit muss nach der Startzeit liegen!");
              return;
            }

            endInput.value = timeString;
            card.classList.add("selected");
          } else {
            alert(
              "Start- und Endzeit sind bereits gesetzt. Deaktivieren Sie eine Zeit, um eine neue auszuwählen."
            );
          }
        }
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Laden der verfügbaren Zeiten:", error);
  }
}

// Initialisierungen
initializeWebSocket();
createForm();
