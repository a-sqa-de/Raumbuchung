// WebSocket-Verbindung herstellen
const ws = new WebSocket('ws://localhost:5500');
console.log('WebSocket initialisiert:', ws); // Prüfen, ob der WebSocket initialisiert ist

ws.onopen = () => {
  console.log('WebSocket-Verbindung hergestellt');

  ws.onopen = () => {
    console.log('WebSocket-Verbindung hergestellt');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket-Fehler:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket-Verbindung geschlossen');
  };
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'event-created') {
    // Erfolgreiche Erstellung des Termins
    alert('Termin erfolgreich erstellt');
  } else if (message.type === 'error') {
    // Fehler bei der Termin-Erstellung
    alert(`Fehler: ${message.message}`);
  } else {
    console.log('Unbekannte Nachricht vom Server:', message);
  }
};

ws.onerror = (error) => {
  console.error('WebSocket-Fehler:', error);
};

// Erstellt das Formular
function createForm() {
  const formContainer = document.getElementById("form-container");

  // Formular erstellen
  const form = document.createElement("form");
  form.className = "booking-form";

  // Titel-Feld
  const titleField = createInputField("Titel", "titel", "Wie heißt dein Event?");
  form.appendChild(titleField);

  // Organisator-Feld
  const organizerField = createInputField("Organisator*in", "organizer", "Dein Name");
  form.appendChild(organizerField);

  // Aktuelles Datum-Feld
  const dateField = createInputField("Aktuelles Datum", "current-date", "", true);

  // Aktuelles Datum im deutschen Format (tt.mm.jjjj)
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;
  dateField.querySelector("input").value = formattedDate;
  form.appendChild(dateField);

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
    const organizer = document.getElementById("organizer").value;
    const currentDate = document.getElementById("current-date").value;
    const startTime = hiddenStartInput.value;
    const endTime = hiddenEndInput.value;
  
    if (!startTime || !endTime) {
      alert("Bitte Start- und Endzeit auswählen!");
      return;
    }
  
    const eventData = {
      title,

      date: currentDate,
      start: startTime,
      end: endTime,
    };
  
    if (ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: "create-event", data: eventData });
      console.log('Daten werden gesendet:', message); // Log vor dem Senden
      try {
        ws.send(message);
        console.log('Nachricht gesendet'); // Log nach dem Senden
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
      }
    } else {
      console.error('WebSocket nicht verfügbar. Status:', ws.readyState);
    }});
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
  input.required = !readonly;
  input.readOnly = readonly;

  fieldContainer.appendChild(label);
  fieldContainer.appendChild(input);
  return fieldContainer;
}

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
      const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const currentTime = new Date(now);

      const isBlocked = bookings.some((booking) => {
        const bookingStart = new Date(booking.start.dateTime);
        const bookingEnd = new Date(booking.end.dateTime);
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
          // Karte deaktivieren
          card.classList.remove("selected");
          if (startInput.value === timeString) startInput.value = "";
          if (endInput.value === timeString) endInput.value = "";
        } else {
          if (!startInput.value) {
            // Setze Startzeit
            startInput.value = timeString;
            card.classList.add("selected");
          } else if (!endInput.value) {
            const selectedStart = new Date(
              availableTimes.find((t) => t.timeString === startInput.value).currentTime
            );

            // Prüfen, ob der Zeitraum zwischen Start- und Endzeit frei ist
            const isPeriodBlocked = bookings.some((booking) => {
              const bookingStart = new Date(booking.start.dateTime);
              const bookingEnd = new Date(booking.end.dateTime);
              return selectedStart < bookingEnd && currentTime > bookingStart;
            });

            if (currentTime <= selectedStart) {
              alert("Die Endzeit muss nach der Startzeit liegen!");
              return;
            }

            if (isPeriodBlocked) {
              alert("Der gewählte Zeitraum überschneidet sich mit einem bestehenden Termin.");
              return;
            }

            // Setze Endzeit
            endInput.value = timeString;
            card.classList.add("selected");
          }
        }
      });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler beim Laden der verfügbaren Zeiten:", error);
  }
}



createForm();
