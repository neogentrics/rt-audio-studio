'use strict';
// RT Audio Studio, step zero: an empty window, so the app builds and starts on all three systems while the risky
// parts are proved underneath it.
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

function open() {
  const win = new BrowserWindow({
    width: 960,
    height: 640,
    title: 'RT Audio Studio',
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false },
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  if (process.env.RTAS_SMOKE) win.webContents.once('did-finish-load', () => { console.log('rtas: window loaded'); app.quit(); });
}

app.whenReady().then(open);
app.on('window-all-closed', () => app.quit());
