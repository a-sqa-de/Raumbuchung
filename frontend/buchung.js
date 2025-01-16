// Funktion, um das Formular zu erstellen und einzufügen
async function createForm() {
  const body = document.body;

  // Hauptcontainer für das Formular erstellen
  const formContainer = document.createElement("div");
  formContainer.className = "form-container";

  // Formular erstellen
  const form = document.createElement("form");
  form.className = "booking-form";
  form.action = "create_event.php";
  form.method = "POST";

  form.addEventListener("submit", (event) => {
    const selectedTime = document.getElementById("selected-time").value;
    if (!selectedTime) {
      event.preventDefault();
      alert("Bitte wähle eine Startzeit aus.");
    }
  });

  // Felder und ihre Platzhalter
  const fields = [
    { label: "Titel", id: "titel", name: "titel", type: "text", placeholder: "Wie heißt dein Event?", required: true },
    { label: "Organisator", id: "organizer", name: "organizer", type: "text", placeholder: "Name des Organisators", required: true },
  ];

  fields.forEach((field) => {
    const fieldContainer = document.createElement("div");
    fieldContainer.className = "field-container";

    const label = document.createElement("label");
    label.htmlFor = field.id;
    label.textContent = field.label;

    const input = document.createElement("input");
    input.type = field.type;
    input.id = field.id;
    input.name = field.name;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.required) input.required = true;

    fieldContainer.appendChild(label);
    fieldContainer.appendChild(input);
    form.appendChild(fieldContainer);
  });

  // Startzeiten als Karten anzeigen
  const timeContainer = document.createElement("div");
  timeContainer.className = "time-container";

  const timeLabel = document.createElement("label");
  timeLabel.textContent = "Startzeit auswählen:";
  timeLabel.htmlFor = "available-times";
  timeContainer.appendChild(timeLabel);

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.id = "selected-time";
  hiddenInput.name = "zeit";
  timeContainer.appendChild(hiddenInput);

  const availableTimesContainer = document.createElement("div");
  availableTimesContainer.id = "available-times";
  availableTimesContainer.className = "time-grid";
  timeContainer.appendChild(availableTimesContainer);

  form.appendChild(timeContainer);

  // Dauer-Auswahl hinzufügen
  const durationContainer = document.createElement("div");
  durationContainer.className = "field-container";

  const durationLabel = document.createElement("label");
  durationLabel.textContent = "Dauer (Minuten):";
  durationContainer.appendChild(durationLabel);

  const durationSelect = document.createElement("select");
  durationSelect.id = "dauer";
  durationSelect.name = "dauer";
  [15, 30, 45, 60, 90, 120].forEach((duration) => {
    const option = document.createElement("option");
    option.value = duration;
    option.textContent = `${duration} Minuten`;
    durationSelect.appendChild(option);
  });

  durationSelect.addEventListener("change", () => {
    const startTime = hiddenInput.value;
    if (startTime) {
      updateEndTime(startTime, durationSelect.value);
    }
    loadAvailableTimes(); // Verfügbare Zeiten neu laden
  });

  durationContainer.appendChild(durationSelect);
  form.appendChild(durationContainer);

  // Endzeit-Feld hinzufügen
  const endTimeContainer = document.createElement("div");
  endTimeContainer.className = "field-container";

  const endTimeLabel = document.createElement("label");
  endTimeLabel.textContent = "Endzeit:";
  endTimeContainer.appendChild(endTimeLabel);

  const endTimeInput = document.createElement("input");
  endTimeInput.type = "text";
  endTimeInput.id = "endzeit";
  endTimeInput.name = "endzeit";
  endTimeInput.readOnly = true;
  endTimeContainer.appendChild(endTimeInput);
  form.appendChild(endTimeContainer);

  // Funktion zur Berechnung der Endzeit
  function updateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + duration * 60000);
    endTimeInput.value = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  // Funktion zur Ermittlung der verfügbaren Startzeiten
  async function loadAvailableTimes() {
    try {
      const response = await fetch("buchungen.json");
      if (!response.ok) throw new Error("Fehler beim Laden der Buchungen");

      const bookings = await response.json();
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0); // Aufrunden auf den nächsten 15-Minuten-Block
      const endOfDay = new Date();
      endOfDay.setHours(18, 0, 0, 0);

      availableTimesContainer.innerHTML = ""; // Bestehende Buttons löschen

      while (now <= endOfDay) {
        const timeString = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes()
          .toString()
          .padStart(2, "0")}`;
        const nextTime = new Date(now.getTime() + durationSelect.value * 60000);

        // Konfliktprüfung mit bestehenden Buchungen
        const hasConflict = bookings.some((booking) => {
          const bookingStart = new Date(booking.start.dateTime);
          const bookingEnd = new Date(booking.end.dateTime);
          return now < bookingEnd && nextTime > bookingStart;
        });

        if (!hasConflict) {
          const card = document.createElement("div");
          card.className = "time-card";
          card.textContent = timeString;

          card.addEventListener("click", () => {
            // Entferne die Markierung von allen Karten
            document.querySelectorAll(".time-card").forEach((btn) => btn.classList.remove("selected"));

            // Markiere die ausgewählte Karte
            card.classList.add("selected");

            // Speichere den Wert im versteckten Input
            hiddenInput.value = timeString;

            // Aktualisiere die Endzeit basierend auf der gewählten Startzeit und Dauer
            updateEndTime(timeString, durationSelect.value);
          });

          availableTimesContainer.appendChild(card);
        }

        now.setMinutes(now.getMinutes() + 15); // Erhöhe um 15 Minuten
      }
    } catch (error) {
      console.error("Fehler beim Laden der verfügbaren Zeiten:", error);
    }
  }

  durationSelect.addEventListener("change", loadAvailableTimes);
  await loadAvailableTimes(); // Initiale Ladezeit

  // Submit-Button hinzufügen
  const submitButton = document.createElement("button");
  submitButton.className = "submit-button";
  submitButton.type = "submit";
  submitButton.textContent = "Termin eintragen";
  form.appendChild(submitButton);

  formContainer.appendChild(form);
  body.appendChild(formContainer);

  // Styles hinzufügen
  const style = document.createElement("style");
  style.textContent = `
    .time-container {
      margin-bottom: 20px;
    }
    .time-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
    }
    .time-card {
      background: #f9f9f9;
      border: 1px solid #ccc;
      border-radius: 5px;
      padding: 10px;
      text-align: center;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
    }
    .time-card.selected {
      background-color: #007bff;
      color: white;
      border-color: #0056b3;
      transform: scale(1.05);
    }
    .time-card:hover {
      background-color: #e0e0e0;
      transform: scale(1.03);
    }
  `;
  document.head.appendChild(style);
}

createForm();
