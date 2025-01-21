# Raumbuchung
Eine kleine Webandwendung zum Buchen von Konferenzräumen, welche über einen WebSocket funktioniert.     
Sofern die .env Datei korrekt hinterlegt ist, authorisiert das Tool derzeit "Konferenzraum01" nach dem starten des WebSockets voll automatisch und holt sich den passenden Token ab. Dieser wird automatisiert an MS Graph weitergeleitet um die Kalenderdaten des Raums auszulesen und in der "bookings.json" abspeichert.

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

## Installation
1. Es ist notwendig, dass das System "nodes" verarbeiten kann. Bitte erkundige dich wie du diese installierst, da die Installation dafür nach Betriebssystem variiert.
2. Die folgenden nodes müssen im Ordner "Backend" installiert bzw. hinterlegt werden. Navigiere hierzu in das passende Unterverzeichnis des Projektes, bis am Ende
```bash
./backend
```
steht.   
3. Installiere die folgenden nodes mit dem jeweiligen Bashbefehl

### dotenv
```bash
npm install dotenv
```
Anmerkung: Wird benötigt, da das Projekt mit einer.env Datei arbeitet. Diese bleibt anschließend "geheim" und wird nicht mit GitHub synchronisiert. Mehr dazu in einem späteren Schrit.

### ws
```bash
npm install ws 
```     
Anmerkung: Wird benötigt, um einen lokalen Server bzw. den WebSocket zu starten. Dieser wird benötigt, um "POST" und "GET" Befehle an MS Graph zu kommunizieren. Außerdem ermöglicht es die "buchungen.json" zu verändern bzw. zu überschreiben.

### axios
```bash
npm install axios 
```
Anmerkung: Wird für die POST und GET Anfragen an MS Graph benötigt. Ohne diese Bibliopthek können die entsprechenden Befehle nicht verarbeitet oder geändert werden.


## Fixed

### GUI
- Die Buttons "Raum buchen" und Terminansicht" sind noch keine richtigen Button.    
Aktuell muss man noch auf den Link klicken
- Lokalisierung vom Framework "FullCalender" funktioniert nicht 
"today" heißt nicht "heute"
- Aktuelles Meeting wird derzeit fehlerhaft dargestellt 
Container wurden durch Änderungen falsch deklariert
- Dashboard zeigt UTC Zeit statt MEZ/MESZ an
- Countdown rechnet weiter mit UTC


### Bekannte Fehler

## GUI
- Formular passt sich "Landscape"-Ansicht noch nicht an
- Inputfield "Organisator/-in" noch ohne Funktion
