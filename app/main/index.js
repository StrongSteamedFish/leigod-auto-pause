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

ipcMain.on('stopAutoPuaseFirst',(e)=>{
  dialog.showMessageBox(e.sender.getOwnerBrowserWindow(), {
    type:'info',
    title:'雷神自动暂停',
    message:'请先关闭自动暂停再打开设置页面！'
  })
})

const createSettingWindow = (mainWindow) => {
  const settingWindow = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    width: 550,
    height: 350,
    resizable :false,
    icon : path.resolve(__dirname, '../icon.ico'),
    title: '设置',
    webPreferences:{
      nodeIntegration:true,
      contextIsolation:false
    }
  });
  if(isDev){
    settingWindow.loadURL('http://localhost:8080/setting.html');
    settingWindow.webContents.openDevTools();
  }else{
    settingWindow.loadFile(path.resolve(__dirname,'../renderer/pages/setting.html'));
  }
  settingWindow.menuBarVisible = false;
}

ipcMain.on('setting',(e)=>{
  createSettingWindow(e.sender.getOwnerBrowserWindow());
})

ipcMain.handle('chooseFile',(e)=>{
  let program = dialog.showOpenDialogSync(e.sender.getOwnerBrowserWindow(), {
    title:'选择要监听的可执行文件',
    filters:[
      {name:'可执行文件',extensions:['exe']}
    ],
    properties:['openFile', 'showHiddenFiles']
  });
  if(program){
    return path.basename(program[0]);
  }else{
    return false;
  }
})

ipcMain.on('closeSettingWindows',(e)=>{
  e.sender.getOwnerBrowserWindow().close();
})

ipcMain.on('setLeigodPath',(e)=>{
  let program = dialog.showOpenDialogSync(e.sender.getOwnerBrowserWindow(), {
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

const setDefaultConfig = () => {
  store.set("sleepTime", store.get("sleepTime") || 1);
  store.set("updateCircleTime", store.get("updateCircleTime") || 20);
  store.set("listenList", store.get("listenList") || []);
}

const createWindow = () => {
  setDefaultConfig();
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
    mainWindow.loadURL('http://localhost:8080/index.html');
    mainWindow.webContents.openDevTools();
  }else{
    mainWindow.loadFile(path.resolve(__dirname,'../renderer/pages/index.html'));
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