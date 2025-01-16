// Funktion, um das Formular zu erstellen und einzufügen
function createForm() {
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
      const selectedDuration = durationSelect.value;
      if (selectedDuration === "0") {
        event.preventDefault();
        const errormessagedauer = document.createElement("div");
        errormessagedauer.style.position = "fixed";
        errormessagedauer.style.top = "50%";
        errormessagedauer.style.left = "50%";
        errormessagedauer.style.transform = "translate(-50%, -50%)";
        errormessagedauer.style.padding = "20px";
        errormessagedauer.style.backgroundColor = "white";
        errormessagedauer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        errormessagedauer.style.zIndex = "1000";
    
        const message = document.createElement("p");
        message.textContent = "Bitte wähle eine Dauer größer als 0 Minuten aus.";
        errormessagedauer.appendChild(message);
    
        const closeButton = document.createElement("button");
        closeButton.textContent = "Schließen";
        closeButton.addEventListener("click", () => {
          errormessagedauer.remove();
        });
        errormessagedauer.appendChild(closeButton);
    
        document.body.appendChild(errormessagedauer);
      }
    });
  
    // Felder und darin liegende Texte (Placeholder)
    const fields = [
      { label: "Titel", id: "titel", name: "titel", type: "text", placeholder: "Wie heißt dein Event?", required: true },
      { label: "Organisator*in", id: "creator", name: "creator", type: "text", placeholder: "Dein Name", required: true },
      { label: "Teilnehmer*innen", id: "subscriber", name: "subscriber", type: "text", placeholder: "Wer ist alles dabei?", required: false },
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
  
    const dateDiv = document.createElement("div");
    dateDiv.className = "field-container";
  
    const dateLabel = document.createElement("label");
    dateLabel.htmlFor = "datum";
    dateLabel.textContent = "Datum";
    dateDiv.appendChild(dateLabel);
  
    //Framework "Flatpickr" für DropDown von Datumsangabe
    const dateInput = document.createElement("input");
    dateInput.type = "text"; // Flatpickr benötigt type="text". Ist so vorgegeben
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
      const roundedMinutes = Math.ceil(minutes / 15) * 15; // Hier wird auf den nächsten 15-Minuten-Schritt gerundet
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
    for (let hour = 8; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        // Stop die Schleife, wenn Stunde 18 und Minute > 45
        if (hour === 18 && minute > 0) break;
    
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
  
    // Container für Dropdown für Dauer
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
  
    //Werte zum Auswählen von Dauer
    const durations = [
      { value: "0", text: "0 Minuten" },
      { value: "15", text: "15 Minuten" },
      { value: "30", text: "30 Minuten" },
      { value: "45", text: "45 Minuten" },
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
      { value: "330", text: "6 1/2 Stunden" },
      { value: "360", text: "7 Stunden" },
      { value: "330", text: "7 1/2 Stunden" },
      { value: "360", text: "8 Stunden" },
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
    endTimeLabel.innerHTML = 'Endzeit <span style="font-weight:normal">(wird autom. berechnet)</span>';
    endTimeDiv.appendChild(endTimeLabel);
  
    const endTimeInput = document.createElement("input");
    endTimeInput.type = "text";
    endTimeInput.id = "endzeit";
    endTimeInput.name = "endzeit";
    endTimeInput.placeholder = currentRoundedTime; //Anzeige für autom. berechneten "Endpunkt" 
    endTimeInput.readOnly = true;
  
    endTimeDiv.appendChild(endTimeInput);
    form.appendChild(endTimeDiv);
  
    // Berechnung der Endzeit bei Änderung von Startzeit oder Dauer
    timeSelect.addEventListener("change", calculateEndTime);
    durationSelect.addEventListener("change", calculateEndTime);
  
    //Berechnet die Endzeit
    function calculateEndTime() {
      const startTime = timeSelect.value;
      const duration = parseInt(durationSelect.value, 10);
  
      if (startTime && duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
  
        const endDate = new Date(startDate.getTime() + duration * 60000);
        const formatEndTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
  
        endTimeInput.value = formatEndTime;
      }
    }
  
    // Submit-Button "Termin Eintragen"
    const submitButton = document.createElement("button");
    submitButton.className = "submit-button";
    submitButton.type = "submit";
    submitButton.textContent = "Termin eintragen";
    form.appendChild(submitButton);
  
    formContainer.appendChild(form);
    body.appendChild(formContainer);
  
    // Flatpickr aktivieren
    flatpickr("#datum", {
      dateFormat: "d.m.y",
      defaultDate: "today",
      minDate: "today",
      locale: "de",
    });
  }
  
  createForm();
  