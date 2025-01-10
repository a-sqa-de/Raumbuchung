# Raumbuchung
Eine kleine Webandwendung zum Buchen von Konferenzräumen

## Features:
- GUI für schnellen Überblick über Buchungen
- JSON als Ausgangslage für Meetingübersicht lesbar
- Sortierung der Events nach chronologischer Reihenfolge (Starttermin)
- Toogle Button für Wechsel auf Kalenderansicht und zurück
- Lokal ausführbar - dank HTML!
- Countdown bis zum nächsten Meeting in Kartenansicht

## Fixed:
GUI
- Kehrt man von der Kalenderansicht auf die Kartenansicht zurück, verändert sich die Ansicht der "Future-Event" Karten,
Der Abstand zur "Current-EVent" Karte wird größer

## Bekannte Fehler:
GUI
- Die Button "Raum buchen" und Terminansicht" sind noch keine richtigen Button.
ktuell muss man noch auf den Link klicken

- Lokalisierung vom Framework "FullCalender" funktioniert nicht
"today" heißt nicht "heute"

- Formular passt sich "Landscape"-Ansicht noch nicht an
