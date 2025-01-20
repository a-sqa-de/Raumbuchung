# Raumbuchung
Eine kleine Webandwendung zum Buchen von Konferenzräumen, welche über einen WebSocket funktioniert.     
Sofern die .env Datei korrekt hinterlegt ist, authorisiert das Tool derzeit "Konferenzraum01" nach dem starten des WebSockets voll automatisch und holt sich den passenden Token ab. Dieser wird automatisiert an MS Graph weitergeleitet um die Kalenderdaten des Raums auszulesen und in der "buchungen.json" abspeichert.

## Features
- GUI für schnellen Überblick über Raumbuchungen
- - Anzeige des Titel
- - Anzeige des gebuchten Zeitslots
- - Anzeige Organisator*in
- - Anzahl teilnehmende Personen | auf zwei begrenzt. Weitere werden durch "+x weitere" dargestellt
- Automatische Authentifizierung des Raumes
- - mit der passender .env Datei wird Token bei Microsooft Auth erfragt und gespeichert
- Dauer des Tokens wird berechnet
- - nach Ablauf des Tokens wird autom. ein neuer Token angefordert
- Automatischer Austausch von Daten mit MS Graph
- - Termine aus Raumkalender werden erhalten und in einer JSON gespeichert
- JSON Datei als Zwischenspeicher für gelesene Termine aus MS Graph
- - die JSON wird anschließend vom Script für die GUI benötigt
- Sortierung der Events nach chronologischer Reihenfolge des Starttermins
- Countdown bis zum nächsten Meeting in Kartenansicht
- Kalenderansicht über einen ToggleButton erreichbar
- Formular zum Buchen von neuen Meetings
- - Bereits belegte Zeitslots werden farblich gekennzeichnet
- Lokal ausführbar - dank HTML!

## benötigte Nodes
Die folgenden nodes, sowie die passende .env, müssen im Ordner "Backend" installiert bzw. hinterlegt werden.

### dotenv
```bash
npm install foobar
```
- - wird benötigt, um sensible Daten geheim zu halten und nicht versehentlich auf GitHiub zu posten. 

### ws 
- npm install ws        
Wird benötigt, um einen lokalen Server bzw. den WebSocket zu starten. 

### axios
- npm install axios
Wird für die POST und GET Anfragen an MS Graph benötigt.


## Fixed

### GUI
- Die Buttons "Raum buchen" und Terminansicht" sind noch keine richtigen Button.
Aktuell muss man noch auf den Link klicken
- Lokalisierung vom Framework "FullCalender" funktioniert nicht
"today" heißt nicht "heute"
- Aktuelles Meeting wird derzeit fehlerhaft dargestellt


### Bekannte Fehler

## GUI
- Formular passt sich "Landscape"-Ansicht noch nicht an
- Aktuelles Meeting wird vorzeitig ausgeblendet? | noch nicht bestätigt
