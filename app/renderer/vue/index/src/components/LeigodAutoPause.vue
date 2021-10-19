<template>
    <div id="container">
        <div id="loginpanel_box" v-show="wantlogin">
            <div class="blackmask">
                <div class="loginpanel">
                    <img class="login_logo" src="../assets/leigod.png" alt="leigod">
                    <div class="pt16 login_title">雷神自动暂停</div>
                    <div class="login_message">
                        <div class="message_box" style="border-bottom:1px solid #5a5a5a">
                            <label class="pt16 message_label" for="username">用户名</label>
                            <input class="pt16 message_input" type="text" name="username" id="username" v-model="username" placeholder="用户名/手机号">
                        </div>
                        <div class="message_box">
                            <label class="pt16 message_label" for="password">密码</label>
                            <input class="pt16 message_input" type="password" name="password" id="password" v-model="password" placeholder="密码">
                        </div>
                    </div>
                    <p class="tips">{{tips}}</p>
                    <button class="login_button pt16" @click="clickLogin">登录</button>
                    <button id="close_loginpanel" @click="hideloginpanel">关闭</button>
                </div>
            </div>
        </div>
        <div id="card">
            <div id="card_top">
                <div class="login">
                    <img v-if="islogin" class="logo"  :src=avatarUrl alt="leigod" @click="logout">
                    <div v-else class="notlogin" @click="showloginpanel">未登录</div>
                </div>
                <div class="time">
                    <span id="hour" class="time_large">{{hour}}</span>
                    <span class="time_small">时</span>
                    <span id="min" class="time_large">{{min}}</span>
                    <span class="time_small">分</span>
                    <span id="second" class="time_large">{{sec}}</span>
                    <span class="time_small">秒</span>
                    <span id="refresh" class="time_small">
                        <img class="refresh_img" @click="refreshPage" src="../assets/refresh.png" v-show="islogin" alt="refresh">
                    </span>
                </div>
                <div class="state">{{state}}</div>
            </div>
            <button id="card_bottom" class="green" @click="cardButton">{{cardbuttontext}}</button>
        </div>
        <div class="bnt1box">
            <button class="red bnt1" @click="switchAutoPause">{{autoPauseSwitchText}}</button>
            <button class="setting_bnt" @click="setting">
                <svg viewBox="0 0 1024 1024" width="100%" height="100%">
                    <path d="M967.882752 603.308032c26.207232-104.832-2.62144-173.251584-2.62144-173.251584l-100.272128-4.922368c-8.786944-31.470592-21.655552-61.147136-38.00576-88.600576l67.64544-76.797952c-55.595008-92.654592-124.363776-120.651776-124.363776-120.651776l-74.48064 67.513344c-27.746304-16.140288-57.759744-28.643328-89.506816-37.108736l-6.390784-100.893696c-104.827904-26.211328-173.251584 2.625536-173.251584 2.625536l-4.7616 96.979968c-31.289344 7.86432-61.060096 19.470336-88.580096 34.787328l-70.501376-63.904768c0 0-68.768768 27.997184-124.363776 120.651776 17.671168 20.058112 52.43904 43.088896 54.524928 72.580096 0.514048 7.28064-33.462272 93.239296-34.927616 93.313024l-90.230784 4.427776c0 0-28.828672 68.41856-2.625536 173.251584l89.423872 5.666816c8.444928 35.557376 21.997568 69.04832 39.94112 99.762176l-58.875904 64.949248c0 0 27.997184 68.768768 120.651776 124.363776l67.101696-59.101184c30.400512 18.198528 63.587328 32.063488 98.861056 40.890368l4.36224 88.844288c0 0 68.422656 28.832768 173.251584 2.625536l5.876736-92.72832c35.72224-9.469952 69.250048-24.103936 99.827712-43.199488l71.151616 62.669824c92.658688-55.590912 120.655872-124.363776 120.655872-124.363776l-64.81408-71.501824c15.968256-28.69248 27.952128-59.809792 35.791872-92.572672L967.882752 603.308032zM516.528128 735.343616c-118.956032 0-215.389184-96.433152-215.389184-215.39328 0-118.956032 96.433152-215.389184 215.389184-215.389184s215.39328 96.433152 215.39328 215.389184C731.921408 638.911488 635.48416 735.343616 516.528128 735.343616z"
                        fill="#FF6AB4"></path>
                </svg>
            </button>
        </div>
        <button class="orange bnt1" @click="startLeigod">启动雷神加速器</button>
    </div>
</template>

<script>
const { ipcRenderer } = window.require('electron');
const { execSync, exec } = window.require('child_process');
const Timer = window.require('timer.js');
const axios = window.require('axios');
const crypto = window.require('crypto');
const { existsSync } = window.require('fs');
const path = window.require('path');

const DEFAULT_SLEEP_TIME = 1;
const DEFAULT_UPDATE_CIRCLE_TIME = 20;
const DEFAULT_LISTEN_LIST = [];

// 读取和写入本地储存的方法
async function getStorage(name){
    return await ipcRenderer.invoke('getinfo',name);
}
function setStorage(name, info){
    ipcRenderer.send('saveinfo',name,info);
}

// MD5加密
function generateMD5(str){
    let hash = crypto.createHash('md5');
    return hash.update(str).digest('hex').toLowerCase();
}

// 显示提示
function showNotification(title, body){
    new Notification(title, {
            body: body
        })
}

// 延时函数
function sleep(time){
    return new Promise((resolve)=>{
        setTimeout(resolve, time);
    })
}

// header
const header = {
    "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
    "Accept":"application/json, text/javascript, */*; q=0.01",
    "Accept-Language":"zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6"
}

// Vue组件
export default {
    name: 'LeigodAutoPause',
    data(){
        return {
                username: '',
                password: '',
                hour: '0',
                min: '00',
                sec: '00',
                state: '账号未登录',
                cardbuttontext: '登录',
                islogin: false,
                wantlogin: false,
                tips:'',
                retryCount: 0,
                nowTimer: new Timer(),
                avatarUrl: '../assets/leigod.png',
                listenSwitch: false,
                nowListenerTimer: new Timer(),
                autoPauseSwitchText:'开启自动暂停'
        }
    },
    methods:{
        // 打开/关闭登录界面
        hideloginpanel(){
            this.wantlogin = false;
        },
        async showloginpanel(){
            this.wantlogin = true;
            this.username = await getStorage('username');
            this.password = await getStorage('password');
        },
        // 初始化页面
        initialization(){
            this.nowTimer.stop();
            this.username = '';
            this.password = '';
            this.updateTime(0);
            this.state = '账号未登录';
            this.cardbuttontext = '登录';
            this.islogin = false;
            this.wantlogin = false;
            this.tips = '';
            this.retryCount = 0;
            this.avatarUrl = '../assets/leigod.png';
            this.stopAutoPause();
        },
        // 更新时间
        updateTime(s){
            this.hour = Math.floor(s / 3600);
            this.min = Math.floor(s % 3600 / 60).toString().padStart(2,'0');
            this.sec = (s % 60).toString().padStart(2,'0');
        },
        // 启动计时动画
        startTimer(s){
            this.nowTimer.stop();
            let expiryTimer = new Timer({
                ontick:(ms)=>{
                    this.updateTime(Math.floor(ms/1000));
                },
                onend:()=>{
                    this.updateTime(0);
                }
            });
            expiryTimer.start(s);
            this.nowTimer = expiryTimer;
        },
        // 更新（已登录）信息
        updateInfo(info){
            let avatar = info.avatar;
            let avatar_new = info.avatar_new;
            let url = avatar_new || avatar;
            if (url && url != ''){
                this.avatarUrl = url;
            }
            let expiryTimeSamp = info.expiry_time_samp;
            let pauseStatusId = info.pause_status_id;
            if (pauseStatusId == 0){
                this.cardbuttontext = '暂停计时';
                this.state = '未暂停';
                this.updateTime(expiryTimeSamp);
                this.startTimer(expiryTimeSamp);
            }else{
                this.cardbuttontext = '恢复计时';
                this.state = '已暂停';
                this.nowTimer.stop();
                this.updateTime(expiryTimeSamp);
            }
        },
        // 刷新页面
        async refreshPage(){
            if(this.listenSwitch){
                this.autoPauseSwitchText = '关闭自动暂停';
            }else{
                this.autoPauseSwitchText = '开启自动暂停';
            }
            this.retryCount = 0;
            let account_token = await getStorage('account_token');
            let that = this;
            let data = {
                account_token:account_token,
                lang:"zh_CN"
            }
            await axios({
                method: 'post',
                url: 'https://webapi.nn.com/api/user/info',
                params: data,
                headers: header
            }).then(async res => {
                if (res.status == 200){
                    if (res.data.code == 0){
                        that.islogin = true;
                        that.updateInfo(res.data.data);
                    }else{
                        that.islogin = false;
                        that.avatarUrl = '../assets/leigod.png';
                        let res = await that.autoLogin();
                        if(res && res.code == 0){
                            console.log('自动登录成功！');
                            await that.refreshPage();
                        }else{
                            that.initialization();
                            await that.showloginpanel();
                        }
                    }
                }else{
                    console.error('获取信息失败！');
                    that.initialization();
                }
            }).catch(e => {
                console.error('获取信息失败！');
                console.error(e);
                that.initialization();
            })
        },
        // 自动登录
        async autoLogin(){
            if (this.retryCount < 3){
                this.retryCount += 1;
                let username = await getStorage('username');
                let password = await getStorage('password');
                if (username && password){
                    let res = await this.login(username, password);
                    return res;
                }
            }
            console.warn('未登录！自动登录失败！');
            return false;
        },
        // 点击登录
        async clickLogin(){
            let res = await this.login(this.username, this.password);
            if (res){
                if (res.code == 0){
                    console.log('手动登录成功！');
                    setStorage('username', this.username);
                    setStorage('password', this.password);
                    this.hideloginpanel();
                    this.refreshPage();
                }else{
                    this.tips = res.msg;
                }
            }else{
                this.tips = '登录出错！';
            }
        },
        // 登录
        async login(username, password){
            let result = false;
            let body = {
                'username':username,
                'password':generateMD5(password),
                'user_type':'0',
                'src_channel':'guanwang',
                'country_code':'86',
                'lang':'zh_CN',
                'region_code':'1',
                'account_token':'null'
            }
            await axios({
                method: 'post',
                url: "https://webapi.nn.com/api/auth/login",
                params: body,
                headers: header
            }).then(res => {
                if (res.status == 200){
                    console.log('登录');
                    if (res.data.code == 0){
                        let account_token = res.data.data.login_info.account_token;
                        setStorage('account_token',account_token);
                    }else{
                        console.warn(res.data.msg);
                    }
                    result = res.data;
                }else{
                    console.error('登录失败！');
                }
            }).catch(e => {
                console.error('登录失败！');
                console.error(e);
            })
            return result;
        },
        // 注销
        async logout(){
            let account_token = await getStorage('account_token');
            let data = {
                account_token:account_token,
                lang:"zh_CN"
            }
            await axios({
                method: 'post',
                url: 'https://webapi.nn.com/api/auth/logout',
                params: data,
                headers: header
            }).then(res => {
                if (res.status == 200){
                    console.log('登出');
                    console.log(res.data.msg);
                }else{
                    console.error('登出失败！');
                }
            }).catch(e => {
                console.error('登出失败！');
                console.error(e);
            })
            setStorage('password', '');
            this.initialization();
        },
        // 恢复&暂停计时
        async recoverTime(){
            console.log('恢复计时');
            let account_token = await getStorage('account_token');
            let that = this;
            let data = {
                account_token:account_token,
                lang:"zh_CN"
            }
            await axios({
                method: 'post',
                url: 'https://webapi.nn.com/api/user/recover',
                params: data,
                headers: header
            }).then(async res => {
                if (res.status == 200){
                    if (res.data.code != 400006){
                        showNotification('恢复计时', res.data.msg);
                        that.refreshPage();
                    }else{
                        let res = await that.autoLogin();
                        if(res && res.code == 0){
                            console.log('自动登录成功！');
                            await that.recoverTime();
                        }else{
                            showNotification('失败！','恢复计时失败！');
                            that.refreshPage();
                        }
                    }
                }else{
                    showNotification('失败！',`恢复计时失败！状态码：${res.status}`);
                    that.refreshPage();
                }
            }).catch(e => {
                showNotification('失败！','恢复计时失败！');
                console.error(e);
                that.refreshPage();
            })
        },
        async pauseTime(){
            console.log('暂停计时');
            let account_token = await getStorage('account_token');
            let that = this;
            let data = {
                account_token:account_token,
                lang:"zh_CN"
            }
            await axios({
                method: 'post',
                url: 'https://webapi.nn.com/api/user/pause',
                params: data,
                headers: header
            }).then(async res => {
                if (res.status == 200){
                    if (res.data.code != 400006){
                        showNotification('暂停计时', res.data.msg);
                        that.refreshPage();
                    }else{
                        let res = await that.autoLogin();
                        if(res && res.code == 0){
                            console.log('自动登录成功！');
                            await that.pauseTime();
                        }else{
                            showNotification('失败！','暂停计时失败！');
                            that.refreshPage();
                        }
                    }
                }else{
                    showNotification('失败！',`暂停计时失败！状态码：${res.status}`);
                    that.refreshPage();
                }
            }).catch(e => {
                showNotification('失败！','暂停计时失败！');
                console.error(e);
                that.refreshPage();
            })
        },
        // 卡片按钮
        cardButton(){
            switch (this.cardbuttontext) {
                case '登录':
                    this.showloginpanel();
                    break;
                case '恢复计时':
                    this.recoverTime();
                    break;
                case '暂停计时':
                    this.pauseTime();
                    break;
                default:
                    console.error(`功能${this.cardbuttontext}不存在，请刷新页面或重启软件重试！`);
                    break;
            }
        },
        // 判断监听的程序是否在运行
        async programIsRunning(){
            let result = [];
            let listenList = await getStorage('listenList') || DEFAULT_LISTEN_LIST;
            let programList = execSync('tasklist', {encoding:'utf8'});
            listenList.forEach(i => {
                let re = new RegExp(i, 'gi');
                let temp = Array.from(new Set(programList.match(re)));
                result = [...result,...temp];
            })
            return result.length > 0?result:false;
        },
        // 程序监听器
        async programListener(programState){
            let sleepTime = await getStorage('sleepTime') || DEFAULT_SLEEP_TIME;
            if(this.listenSwitch){
                console.log('程序监听中……');
                if(programState){
                    console.log(`==监听到程序${programState}已打开，开始监听程序退出行为==`);
                    this.programExitListener();
                }else{
                    await sleep(sleepTime * 1000);
                    this.programListener(await this.programIsRunning());
                }
            }
        },
        // 程序退出监听器
        async programExitListener(){
            let that = this;
            let programState = false;
            let updateCircleTime = await getStorage('updateCircleTime') || DEFAULT_UPDATE_CIRCLE_TIME;
            let exitListenerTimer = new Timer({
                ontick:async () => {
                    programState = await that.programIsRunning();
                    console.log('监听程序退出行为中……');
                },
                onend:async () => {
                    programState = await that.programIsRunning();
                    console.log(`${updateCircleTime}s内，所有监听程序是否退出：${!programState}`);
                    if(!programState){
                        this.pauseTime();
                    }
                    that.programListener(programState);
                }
            });
            this.nowListenerTimer = exitListenerTimer;
            exitListenerTimer.start(updateCircleTime);
        },
        // 启动自动暂停
        async startAutoPause(){
            console.log('==开始监听程序==');
            this.autoPauseSwitchText = '关闭自动暂停';
            this.listenSwitch = true;
            this.programListener(await this.programIsRunning());
        },
        // 停止自动暂停
        stopAutoPause(){
            this.listenSwitch = false;
            this.nowListenerTimer.stop();
            console.log('==停止监听程序==');
            this.autoPauseSwitchText = '开启自动暂停';
        },
        // 切换自动暂停
        switchAutoPause(){
            if(!this.islogin){
                showNotification(this.autoPauseSwitchText, '请先登录再开启该功能！')
                this.showloginpanel();
                return;
            }
            switch (this.autoPauseSwitchText) {
                case '开启自动暂停':
                    showNotification('自动暂停', this.autoPauseSwitchText);
                    this.startAutoPause();
                    break;
                case '关闭自动暂停':
                    showNotification('自动暂停', this.autoPauseSwitchText);
                    this.stopAutoPause();
                    break;
                default:
                    console.error(`功能${this.autoPauseSwitchText}不存在，请刷新页面或重启软件重试！`);
                    break;
            }
        },
        // 设置
        async setting(){
            this.stopAutoPause();
            // 打开选择文件窗口
            console.log('打开选择文件窗口');
            await ipcRenderer.send('setting');
            this.refreshPage();
        },
        // 启动雷神加速器
        async startLeigod(){
            // 从配置文件获取设置的雷神加速器地址
            let leigodPath = await getStorage('leigodPath');
            // 如果获取到了路径且路径存在
            if(leigodPath && existsSync(leigodPath)){
                let programName = path.basename(leigodPath);
                let programPath = path.join(leigodPath);
                // 启动
                let cmd = `tasklist|find /i "${programName}" || "${programPath}"`
                exec(cmd, function(err, stdout, stderr) {  
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if(stdout){
                        console.log("雷神加速器已启动，请勿重复启动！");
                        showNotification("雷神加速器已启动，请勿重复启动！", "如确实未看到雷神加速器启动，请检查任务管理器是否还有雷神加速器相关进程未退出。")
                    }
                    console.log(stdout);
                    console.log(stderr);
                })
            }else{
                console.warn("路径未设置，请先设置路径");
                showNotification("路径未设置", "请先设置雷神加速器路径");
                this.setLeigodPath();
            }
        },
        // 设置雷神加速器的路径
        setLeigodPath(){
            ipcRenderer.send('setLeigodPath');
        }
    },
    created(){
        this.refreshPage();
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
*{
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
}

.blackmask{
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
}
.loginpanel{
    width: 300px;
    height: 340px;
    border-radius: 10px;
    background: #1f1f1f;
    margin: 80px auto;
    display: flex;
    flex-flow: column;
    justify-content: space-evenly;
    align-items: center;
    color: #bbbbbb;
}
.login_logo{
    width: 80px;
    height: 80px;
}
.login_title{
    letter-spacing: 3px;
    margin: 5px 0 20px 0;
}
.login_message{
    width: 260px;
    height: 72px;
    border-radius: 5px;
    background: #3d3d3d;
    border: 1px solid #5a5a5a;
}
.message_box{
    width: 100%;
    height: 36px;
    display: flex;
    justify-content: space-between;
}
.message_label{
    width: 22%;
    display: inline-block;
    line-height: 36px;
    text-align: justify;
    padding: 0 10px;
}
.message_label::after{
    display: inline-block;
    width: 100%;
    content: "";
}
.message_input{
    width: 75%;
    background: none;
    color: #bbbbbb;
    line-height: 36px;
}
.tips{
    height: 16px;
    color: red;
}
.login_button{
    width: 260px;
    height: 36px;
    border-radius: 5px;
    color: #966423;
    background: #FDCC38;
    font-weight: 600;
}
.login_button:hover{
    background: #eea907;
    cursor: pointer;
}
.pt16{
    font-size: 16px;
}

#loginpanel_box{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
}

#close_loginpanel{
    position: absolute;
    bottom: 40px;
    font-size: 16px;
    background: none;
    color: #ebebeb;
}

button{
    border: 0;
    border-radius: 0;
    outline: none;
    cursor: pointer;
}

.bnt1{
    width: 160px;
    height: 46px;
    border-radius: 23px;
    color: white;
    font-size: 16px;
    box-shadow: 2px 2px 5px gray;
}

.bnt1box{
     position:relative;
     left:15px;
}

.setting_bnt{
    position:relative;
    left:10px;
    vertical-align:middle;
    width:30px;
    height:30px;
    background:none;
}

.red{
    background: linear-gradient(to right, #FF7D7D, #FF6AB4);
}

.red:hover{
    background: linear-gradient(to left, #FF7D7D, #FF6AB4);
}

.orange{
    background: linear-gradient(to right, #FF8854, #F6A926);
}

.orange:hover{
    background: linear-gradient(to left, #FF8854, #F6A926);
}

#container{
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-flow: column;
    justify-content: space-evenly;
    align-items: center;
}

#card{
    width: 250px;
    height: 300px;
    border-radius: 15px;
    box-shadow: 2px 2px 5px gray;
    color: #939393;
}

#card_top{
    width: 100%;
    height: 240px;
    border-radius: 15px 15px 0 0;
    background-color: white;
    text-align: center;
    position: relative;
}

#card_bottom{
    width: 100%;
    height: 60px;
    letter-spacing: 2px;
    border-radius: 0 0 15px 15px;
    color: white;
    font-size: 18px;
}

.green{
    background-color: #03CB8E;
}

.green:hover{
    background-color: #00b17c;
}

.login{
    width: 130px;
    height: 130px;
    padding: 20px 0;
    margin: 0 auto;
}

.logo,.notlogin{
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 65px;
}

.logo{
    border: #F6A926 2px solid;
}

.notlogin{
    line-height: 130px;
    font-size: 20px;
    letter-spacing: 2px;
    background: linear-gradient(to left, #FF8854, #F6A926);
    color: white;
}

.time{
    height: 32px;
    text-align: right;
    padding-right: 10px;
}

.time_large,.time_small{
    vertical-align: top;
    font-family: Arial, Helvetica, sans-serif;
}

.time_large{
    font-weight: bolder;
    font-size: 28px;
}

.time_small{
    font-size: 14px;
    margin: 0 5px;
}

#refresh{
    cursor: pointer;
    display: inline-block;
    width: 16px;
    height: 16px;
}

.refresh_img{
    width: 100%;
    height: 100%;
}

.state{
    margin: 0px 0;
}
</style>
