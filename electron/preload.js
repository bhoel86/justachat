// Preload script - runs before web content loads
// Can expose specific Node.js APIs to the renderer if needed

import { contextBridge } from "electron";

// Expose a safe API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
