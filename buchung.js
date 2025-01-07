
// Funktion, um das Formular zu erstellen und einzufügen
function createForm() {
    // Hauptcontainer für das Formular
    const body = document.body;

    // Hinweistext
    const hintText = document.createElement("p");
    hintText.style.textAlign = "center";
    hintText.style.color = "rgb(146, 0, 0)";
    hintText.textContent = "Trage hier deinen Wunschtermin ein. Keine Garantie auf einen freien Termin!";
    body.appendChild(hintText);

    // Formular erstellen
    const form = document.createElement("form");
    form.action = "create_event.php";
    form.method = "POST";

    // Manuelle Eingabe Formularfelder
    const fields = [
        { label: "Wer bist du?", id: "creator", name: "creator", type: "text", placeholder: "Dein Name", required: true },
        { label: "Titel", id: "titel", name: "titel", type: "text", placeholder: "Wie heißt dein Event?", required: true },
        { label: "Inhalt (optional)", id: "inhalt", name: "inhalt", type: "text", placeholder: "Worum geht es?", required: false },
        { label: "Datum", id: "datum", name: "datum", type: "date", placeholder: "Wann startet dein Event?", required: true },
        { label: "Zeit", id: "zeit", name: "zeit", type: "time", required: true },
    ];

    fields.forEach((field) => {
        const div = document.createElement("div");
        div.className = "formular-text";

        const label = document.createElement("label");
        label.htmlFor = field.id;
        label.textContent = field.label;

        const inputDiv = document.createElement("div");
        inputDiv.className = `eingabe-${field.name}`;

        const input = document.createElement("input");
        input.type = field.type;
        input.id = field.id;
        input.name = field.name;
        if (field.placeholder) input.placeholder = field.placeholder;
        if (field.required) input.required = true;

        inputDiv.appendChild(input);
        div.appendChild(label);
        div.appendChild(inputDiv);
        form.appendChild(div);
        form.appendChild(document.createElement("br"));
    });

    // Dropdown für Dauer
    const durationDiv = document.createElement("div");
    durationDiv.className = "formular-text";

    const durationLabel = document.createElement("label");
    durationLabel.htmlFor = "dauer";
    durationLabel.textContent = "Dauer (Minuten)";
    durationDiv.appendChild(durationLabel);
    durationDiv.appendChild(document.createElement("br"));

    const durationSelect = document.createElement("select");
    durationSelect.id = "dauer";
    durationSelect.name = "dauer";
    durationSelect.required = true;

    const durations = [
        { value: "30", text: "30 Minuten" },
        { value: "60", text: "60 Minuten" },
        { value: "90", text: "90 Minuten" },
        { value: "120", text: "120 Minuten" },
    ];

    durations.forEach((duration) => {
        const option = document.createElement("option");
        option.value = duration.value;
        option.textContent = duration.text;
        durationSelect.appendChild(option);
    });

    durationDiv.appendChild(durationSelect);
    form.appendChild(durationDiv);

    // Submit-Button
    const submitButton = document.createElement("button");
    submitButton.className = "Raum buchen";
    submitButton.title = "Raum buchen";
    submitButton.type = "submit";
    submitButton.textContent = "Raum buchen";
    form.appendChild(document.createElement("br"));
    form.appendChild(document.createElement("br"));
    form.appendChild(submitButton);

    // Formular einfügen
    body.appendChild(form);
}

// Formular erstellen und auf der Seite anzeigen
createForm();
