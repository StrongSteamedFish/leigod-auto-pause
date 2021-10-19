const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const Store = require('electron-store')

const store = new Store();

ipcMain.on('saveinfo', (e, name, info)=>{
  store.set(name, info);
})

ipcMain.handle('getinfo', (e, name)=>{
  return store.get(name);
})

ipcMain.on('setting',(e)=>{
  let program = dialog.showOpenDialogSync({
    title:'选择要监听的可执行文件',
    filters:[
      {name:'可执行文件',extensions:['exe']}
    ],
    properties:['openFile', 'showHiddenFiles']
  });
  if(program){
    let programName = path.basename(program[0]);
    let listenList = store.get('listenList');
    if (listenList && listenList.indexOf(programName) == -1){
      listenList.push(programName);
      store.set('listenList',listenList);
    }else{
      store.set('listenList',listenList || [programName]);
    }
  }
})

ipcMain.on('setLeigodPath',(e)=>{
  let program = dialog.showOpenDialogSync({
    title:'选择雷神加速器执行文件',
    defaultPath:'C:\\Program Files (x86)\\LeiGod_Acc\\leigod.exe',
    filters:[
      {name:'可执行文件',extensions:['exe']}
    ],
    properties:['openFile', 'showHiddenFiles']
  });
  if(program){
    store.set('leigodPath', path.join(program[0]));
  }
})

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 550,
    resizable :false,
    icon : path.resolve(__dirname, '../icon.ico'),
    title: '雷神自动暂停',
    webPreferences:{
      nodeIntegration:true,
      contextIsolation:false
    }
  });
  if(isDev){
    mainWindow.loadURL('http://localhost:8080/');
    mainWindow.webContents.openDevTools();
  }else{
    mainWindow.loadFile(path.resolve(__dirname,'../renderer/pages/index/index.html'));
  }
  mainWindow.menuBarVisible = false;
  app.setAppUserModelId("雷神自动暂停");
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});