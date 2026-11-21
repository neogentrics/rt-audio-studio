'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rt', {
  info: () => ipcRenderer.invoke('rt:info'),
  micAccess: () => ipcRenderer.invoke('rt:mic-access'),
  start: (opts) => ipcRenderer.invoke('rt:start', opts),
  samples: (floats) => ipcRenderer.send('rt:samples', floats),
  stop: (summary, keep) => ipcRenderer.invoke('rt:stop', summary, keep),
  onStopped: (cb) => ipcRenderer.on('rt:stopped', (_e, why) => cb(why)),
});
