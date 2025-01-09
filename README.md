# Raumbuchung
Eine Webandwendung zum Buchen von Konferenzräumen

Features:
    - GUI für schnellen Überblick über Buchungen
    - JSON als Ausgangslage für Eventübersicht lesbar
    - Sortierung der Events nach chronologischer Reihenfolge (Starttermin)
    - Toogle Button für Wechsel auf Kalenderansicht
    - Lokal ausführbar - dank HTML!


Bekannte Fehler:
    GUI
    - Kehrt man von der Kalenderansicht auf die Kartenansicht zurück, verändert sich die Ansicht der "Future-Event" Karten
        -> Der Abstand zur "Current-EVent" Karte wird größer
    - Die Button "Raum buchen" und Terminansicht" sind noch keine richtigen BUtton
        -> AKtuell muss man noch auf den Link klicken
    - Lokalisierung vom Framework "FullCalender" funktioniert nicht
        -> "today" heißt nicht "heute"
    - Formular passt sich "Landscape"-Ansicht noch nicht an
