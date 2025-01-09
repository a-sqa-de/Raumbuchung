// Funktion, um das Formular zu erstellen und einzufügen
function createForm() {
    const body = document.body;
  
    // Hauptcontainer für das Formular erstellen
    const formContainer = document.createElement("div");
    formContainer.className = "form-container";
  
    // Hinweistext
    const hintText = document.createElement("p");
    hintText.className = "hint-text";
    hintText.textContent = "Das Formular ist noch ohne Nutzen!";
    formContainer.appendChild(hintText);
  
    // Formular erstellen
    const form = document.createElement("form");
    form.className = "booking-form";
    form.action = "create_event.php";
    form.method = "POST";
  
    // Felder für das Formular
    const fields = [
      { label: "Organisator/-in", id: "creator", name: "creator", type: "text", placeholder: "Dein Name", required: true },
      { label: "Titel", id: "titel", name: "titel", type: "text", placeholder: "Wie heißt dein Event?", required: true },
      { label: "Inhalt (optional)", id: "inhalt", name: "inhalt", type: "text", placeholder: "Worum geht es?", required: false },
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
  
    // Datum-Feld
    const dateDiv = document.createElement("div");
    dateDiv.className = "field-container";
  
    const dateLabel = document.createElement("label");
    dateLabel.htmlFor = "datum";
    dateLabel.textContent = "Datum";
    dateDiv.appendChild(dateLabel);
  
    const dateInput = document.createElement("input");
    dateInput.type = "text"; // Flatpickr benötigt type="text"
    dateInput.id = "datum";
    dateInput.name = "datum";
    dateInput.required = true;
  
    dateDiv.appendChild(dateInput);
    form.appendChild(dateDiv);
  
    const timeDiv = document.createElement("div");
    timeDiv.className = "field-container";
    
    const timeLabel = document.createElement("label");
    timeLabel.htmlFor = "zeit";
    timeLabel.textContent = "Startzeit";
    timeDiv.appendChild(timeLabel);
    
    const timeSelect = document.createElement("select");
    timeSelect.id = "zeit";
    timeSelect.name = "zeit";
    timeSelect.required = true;
    
    // Funktion zum Runden der aktuellen Zeit auf den nächsten 15-Minuten-Schritt
    function getCurrentRoundedTime() {
      const now = new Date();
      const minutes = now.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15; // Runden auf den nächsten 15-Minuten-Schritt
      if (roundedMinutes === 60) {
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
      } else {
        now.setMinutes(roundedMinutes);
      }
      const formattedHour = String(now.getHours()).padStart(2, "0");
      const formattedMinute = String(now.getMinutes()).padStart(2, "0");
      return `${formattedHour}:${formattedMinute}`;
    }
    
    // Berechnung der aktuellen, gerundeten Zeit
    const currentRoundedTime = getCurrentRoundedTime();
    
    // Zeiten im 15-Minuten-Takt hinzufügen
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = String(hour).padStart(2, "0");
        const formattedMinute = String(minute).padStart(2, "0");
        const timeValue = `${formattedHour}:${formattedMinute}`;
        
        const option = document.createElement("option");
        option.value = timeValue;
        option.textContent = timeValue;
    
        // Standardmäßig die aktuelle, gerundete Zeit auswählen
        if (timeValue === currentRoundedTime) {
          option.selected = true;
        }
        timeSelect.appendChild(option);
      }
    }
    
    timeDiv.appendChild(timeSelect);
    form.appendChild(timeDiv);
  
    // Dropdown für Dauer
    const durationDiv = document.createElement("div");
    durationDiv.className = "field-container";
  
    const durationLabel = document.createElement("label");
    durationLabel.htmlFor = "dauer";
    durationLabel.textContent = "Dauer";
    durationDiv.appendChild(durationLabel);
  
    const durationSelect = document.createElement("select");
    durationSelect.id = "dauer";
    durationSelect.name = "dauer";
    durationSelect.required = true;
  
    const durations = [
      { value: "0", text: "0 Minuten" },
      { value: "15", text: "15 Minuten" },
      { value: "30", text: "30 Minuten" },
      { value: "60", text: "1 Stunde" },
      { value: "90", text: "1 1/2 Stunden" },
      { value: "120", text: "2 Stunden" },
      { value: "150", text: "2 1/2 Stunden" },
      { value: "180", text: "3 Stunden" },
      { value: "210", text: "3 1/2 Stunden" },
      { value: "240", text: "4 Stunden" },
      { value: "270", text: "4 1/2 Stunden" },
      { value: "300", text: "5 Stunden" },
      { value: "330", text: "5 1/2 Stunden" },
      { value: "360", text: "6 Stunden" },
    ];
  
    durations.forEach((duration) => {
      const option = document.createElement("option");
      option.value = duration.value;
      option.textContent = duration.text;
      durationSelect.appendChild(option);
    });
  
    durationDiv.appendChild(durationSelect);
    form.appendChild(durationDiv);
  
    // Endzeit-Feld (nicht editierbar)
    const endTimeDiv = document.createElement("div");
    endTimeDiv.className = "field-container";
  
    const endTimeLabel = document.createElement("label");
    endTimeLabel.htmlFor = "endzeit";
    endTimeLabel.textContent = "Das geht dann bis";
    endTimeDiv.appendChild(endTimeLabel);
  
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "text";
    endTimeInput.id = "endzeit";
    endTimeInput.name = "endzeit";
    endTimeInput.placeholder = currentRoundedTime;
    endTimeInput.readOnly = true;
  
    endTimeDiv.appendChild(endTimeInput);
    form.appendChild(endTimeDiv);
  
    // Berechnung der Endzeit bei Änderung von Startzeit oder Dauer
    timeSelect.addEventListener("change", calculateEndTime);
    durationSelect.addEventListener("change", calculateEndTime);
  
    function calculateEndTime() {
      const startTime = timeSelect.value;
      const duration = parseInt(durationSelect.value, 10);
  
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
  
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const formattedEndTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
  
        endTimeInput.value = formattedEndTime;
      }
    }
  
    // Submit-Button
    const submitButton = document.createElement("button");
    submitButton.className = "submit-button";
    submitButton.type = "submit";
    submitButton.textContent = "Termin eintragen";
    form.appendChild(submitButton);
  
    formContainer.appendChild(form);
    body.appendChild(formContainer);
  
    // Flatpickr aktivieren
    flatpickr("#datum", {
      dateFormat: "d-m-20y",
      defaultDate: "today",
      minDate: "today",
      locale: "de",
    });
  }
  
  createForm();
  