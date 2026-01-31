// Electron entrypoint shim.
// The web app uses Vite + index.html; this file exists purely so electron-builder
// has a stable main entry when packaging the desktop app.

import "./electron/index.js";
