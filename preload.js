const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "api", {
        searchFrameInternal: (searchText, iframeName, firstSearch) => {
            ipcRenderer.send('search', searchText, iframeName, firstSearch);
        },
        searchFrameInternalStop: (iframeName) => {
            ipcRenderer.send('search-stop');
        }
    }
);