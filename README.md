# Terminator Backend

**More documentation you can find in our [documentation repository](https://github.com/terminator-bsdgg/documentation)**

Folgende **Programme / Packages** werden benötigt:

-   NodeJS 1.16.5 & npm
-   Microsoft SQL Server

## Repositorys herunterladen und Verzeichnis erstellen

```bash
cd /home/ && mkdir terminator && cd terminator

git clone https://github.com/terminator-bsdgg/backend.git
git clone https://github.com/terminator-bsdgg/website.git

cd backend && npm install

echo "Please edit config.json in backend folder."
```

Nun kann das Backend über die **Startdatei** ausgeführt werden `./start.sh`. Wenn das Backend als Prozesse benötigt wird, kann man die `start.sh` wiefolgt **abändern**:

```bash
#!/usr/bin/env sh

screen -S terminator_backend -d -m node ./server.js
```

## Autor

-   **Paul Jongmans** - [Profile](https://github.com/paul-jongmans)
