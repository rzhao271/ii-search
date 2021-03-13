// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path');

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  await mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
    const webContents = mainWindow.webContents;
    const mainFrame = mainWindow.webContents.mainFrame;

    const enableFrameSearch = true;
    if (channel === 'search') {
      const [searchText, frameName, firstSearch] = args;
      const frame = mainFrame.framesInSubtree.find(frame => frame.name === frameName);
      if (enableFrameSearch) {
        const opts = { frame: frame, findNext: firstSearch };
        webContents.findInPage(searchText, opts);
      } else {
        webContents.findInPage(searchText, { findNext: firstSearch });
      }
    } else if (channel === 'search-stop') {
      webContents.stopFindInPage('keepSelection');
      // const [frameName] = args;
      // const frame = mainFrame.frames.find(frame => frame.name === frameName);
      // if (enableFrameSearch) {
      //   webContents.on('found-in-page', (e) => {
      //     const foundFrame = e.frame;
      //     const [pid, rid] = [foundFrame.processId, foundFrame.routingId];
      //     if (pid === frame.processId && rid === frame.routingId) {
      //       webContents.stopFindInPage('keepSelection');
      //     }
      //   });
      //   const opts = { frame: frame };
      //   webContents.findInPage(searchText);
      // } else {
      //   // webContents.on('found-in-page', (e) => {
      //   //     webContents.stopFindInPage('keepSelection');
      //   // });
      //   webContents.stopFindInPage('keepSelection');searchText, { findNext: firstSearch });
      // }
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.