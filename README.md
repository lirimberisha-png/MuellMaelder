# MüllMälder – Phase 2.4

## Fix
Die drei Menüpunkte unten sind jetzt echte Navigation.

- Start: zeigt nächste Abfuhr und Folgetermine
- Kalender: zeigt die Termine aus der 2026-Datenbasis
- Einstellungen: enthält erste Einstellungen für Benachrichtigung, Uhrzeit und Gebiet

## Test
1. Alten Server mit Ctrl+C stoppen
2. ZIP entpacken
3. Ordner öffnen
4. cmd in Explorer-Adressleiste
5. Start:
   python -m http.server 8000 --bind 127.0.0.1
6. Browser:
   http://127.0.0.1:8000
7. Falls nötig Ctrl+F5

8. hallöchen
