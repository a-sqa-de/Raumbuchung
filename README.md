# Raumbuchung
Eine kleine Webandwendung zum Buchen von Konferenzräumen, welche über einen WebSocket funktioniert. Sofern die .env Datei hinterlegt ist, authorisiert das Tool "Konferenzraum01" und holt sich den passenden Token ab. Dieser wird automatisiert weitergeleitet um die Kalenderdaten auszulesen und in der "buchungen.json" abspeichert.

## Features
- GUI für schnellen Überblick über Raumbuchungen
- API Anbindung zur Aktualisierung von JSON-Datei via WebSocket
- API Anbindung zum anlegen neuer Termine via Formular
- JSON als Ausgangslage für Meetingübersicht lesbar
- Sortierung der Events nach chronologischer Reihenfolge (Starttermin)
- Countdown bis zum nächsten Meeting in Kartenansicht
- Toogle Button für Wechsel auf Kalenderansicht und zurück
- Lokal ausführbar - dank HTML!

## Benötigte Nodes
### dotenv
- npm install dotenv    
Wird benötigt, um sensible Daten geheim zu halten.

### ws 
- npm install ws        
Wird benötigt, um einen lokalen Server zu starten. 

### axios
- npm install axios    
Wird für die POST und GET Abfragen an MS Graph benötigt.

Die nodes müssen in der Ordnerstruktur "Backend" installiert werden. die .env ist bei dem Admin / Entwickler anzufragen und muss ebenfalls im Backendordner hinterlegt werden.

## Server starten
Mit dem Befehl "node websocket-server.js" startet man den Server. WICHTIG! Man muss zum Pfad des "Backend" Ordners wechseln. Nutzue hierfür "cd "Speicherort der Webanwendung".\Backend

### Fixed
GUI
- Die Buttons "Raum buchen" und Terminansicht" sind noch keine richtigen Button.
Aktuell muss man noch auf den Link klicken
- Lokalisierung vom Framework "FullCalender" funktioniert nicht
"today" heißt nicht "heute"

## Bekannte Fehler
GUI
- Formular passt sich "Landscape"-Ansicht noch nicht an
- Aktuelles Meeting wird derzeit fehlerhaft dargestellt
