import { app, BrowserWindow, ipcMain, session } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Fastify from "fastify";
import { startServer } from "./server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  } else {
    mainWindow.loadFile(join(app.getAppPath(), "renderer", "index.html"));
  }
}

app.whenReady().then(async () => {
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["script-src 'self'"],
      },
    });
  });

  try {
    await startServer();
  } catch (err) {
    console.error("Erreur au démarrage du serveur Fastify :", err);
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      try {
        await startServer();
      } catch (err) {
        console.error("Erreur au redémarrage du serveur Fastify :", err);
      }
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("message", (event, message) => {
  console.log(message);
});