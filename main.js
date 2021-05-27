// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView} = require('electron')
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

  // const view = new BrowserView({
  //   webPreferences: {
  //     nodeIntegration: true,
  //     contextIsolation: true,
  //     preload: path.join(__dirname, 'preload.js')
  //   }
  // })
  // mainWindow.setBrowserView(view)
  // view.setBounds({ x: 0, y: 0, width: 300, height: 300 })

  // and load the index.html of the app.
  await mainWindow.loadFile('index.html')
  // await view.webContents.loadFile('searchbox.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  let registered = false;

  // view.webContents.on('ipc-message', (event, channel, ...args) => {
  //   const mainFrame = mainWindow.webContents.mainFrame;
  //   if (channel === 'search') {
  //     const [searchText, frameName, firstSearch] = args;
  //     const frame = mainFrame.framesInSubtree.find(frame => frame.name === frameName);
  //     frame.findInFrame(searchText, { findNext: firstSearch });
  //   } else if (channel === 'search-stop') {
  //     const [frameName] = args;
  //     const frame = mainFrame.frames.find(frame => frame.name === frameName);
  //     frame.stopFindInFrame('clearSelection');
  //   }
  // });

  mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
    const webContents = mainWindow.webContents;
    const mainFrame = mainWindow.webContents.mainFrame;

    const enableFrameSearch = true;
    if (channel === 'search') {
      const [searchText, frameName, firstSearch] = args;
      const frame = mainFrame.framesInSubtree.find(frame => frame.name === frameName);
      if (!registered) {
        frame.on('found-in-frame', (ev, res) => {
          console.log("found-in-frame: " + res.activeMatchOrdinal + "/" + res.matches);
        });
        webContents.on('found-in-page', (ev, res) => {
          console.log(res.activeMatchOrdinal);
        });
        registered = true;
      }
      if (enableFrameSearch) {
        frame.findInFrame(searchText, { findNext: firstSearch });
      } else {
        webContents.findInPage(searchText, { findNext: firstSearch });
      }
    } else if (channel === 'search-stop') {
      const [frameName] = args;
      const frame = mainFrame.frames.find(frame => frame.name === frameName);
      if (enableFrameSearch) {
        frame.stopFindInFrame('clearSelection');
      } else {
        webContents.stopFindInPage('clearSelection');
      }
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
