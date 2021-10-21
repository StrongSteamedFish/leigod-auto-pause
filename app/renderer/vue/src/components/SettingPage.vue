<template>
    <div id="container">
        <div class="setting_item_card col">
            <p class="setting_title">自动暂停监听列表</p>
            <!-- <p class="setting_tips">开启自动暂停功能后，软件会在监听列表中的软件全部退出时自动暂停雷神加速器计时</p> -->
            <div class="listen_list_box">
                <span v-for="(item, i) in listenList" :key="item" class="listen_list_label">
                    <span class="label_text">{{item}}</span>
                    <button @click="deleteSelf(i)" class="label_bnt">
                        <img class="label_bnt_img" src="../assets/close.png" alt="close">
                    </button>
                </span>
                <span class="listen_list_label">
                    <button @click="addItem" class="label_bnt" v-if="!wantAddItem">
                        <img class="label_bnt_img" src="../assets/add.png" alt="add">
                    </button>
                    <span class="label_text label_input_span" v-if="wantAddItem">
                        <div class="label_input" contenteditable="true" id="label_input"></div>
                    </span>
                    <button @click="chooseFile" class="label_bnt" v-if="wantAddItem">
                        <img class="label_bnt_img" src="../assets/file.png" alt="choosefile">
                    </button>
                    <button @click="confirmAddItem" class="label_bnt" v-if="wantAddItem">
                        <img class="label_bnt_img" src="../assets/confirm.png" alt="confirm">
                    </button>
                    <button @click="cancelAddItem" class="label_bnt" v-if="wantAddItem">
                        <img class="label_bnt_img" src="../assets/close.png" alt="cancel">
                    </button>
                </span>
            </div>
        </div>
        <div class="setting_item_card row">
            <p class="setting_title">扫描周期(单位:秒)</p>
            <div class="time">
                <button @click="subSleepTime">
                    <img class="label_bnt_img" src="../assets/sub.png" alt="sub">
                </button>
                <input type="text" v-model="sleepTime">
                <button @click="addSleepTime">
                    <img class="label_bnt_img" src="../assets/add.png" alt="add">
                </button>
            </div>
            <!-- <p class="setting_tips">软件在每设定秒数后扫描是否有被监听的游戏启动，该值越小软件监听到游戏启动越快。默认值：1</p> -->
        </div>
        <div class="setting_item_card row">
            <p class="setting_title">监听游戏退出超时(单位:秒)</p>
            <div class="time">
                <button @click="subUpdateTime">
                    <img class="label_bnt_img" src="../assets/sub.png" alt="sub">
                </button>
                <input type="text" v-model="updateCircleTime">
                <button @click="addUpdateTime">
                    <img class="label_bnt_img" src="../assets/add.png" alt="add">
                </button>
            </div>
            <!-- <p class="setting_tips">软件会在被监听的游戏全部退出最多该设定秒数后暂停雷神加速器计时该值越大，允许玩家临时退出或切换被监听游戏的时间就越长。默认值25。</p> -->
        </div>
        <div class="button_box">
            <button @click="confirm" class="setting_bnt yes">确定</button>
            <button @click="cancel" class="setting_bnt no">取消</button>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = window.require('electron');

// 读取和写入本地储存的方法
async function getStorage(name){
    return await ipcRenderer.invoke('getinfo',name);
}
function setStorage(name, info){
    ipcRenderer.send('saveinfo',name,info);
}

export default {
    name:'SettingPage',
    data(){
        return {
            listenList:[],
            updateCircleTime:20,
            sleepTime:1,
            wantAddItem:false
        }
    },
    methods:{
        addSleepTime(){
            this.sleepTime = parseInt(this.sleepTime);
            this.sleepTime += 1;
        },
        subSleepTime(){
            this.sleepTime = parseInt(this.sleepTime);
            this.sleepTime -= 1;
        },
        addUpdateTime(){
            this.updateCircleTime = parseInt(this.updateCircleTime);
            if(this.updateCircleTime < 120){
                this.updateCircleTime += 1;
            }
        },
        subUpdateTime(){
            this.updateCircleTime = parseInt(this.updateCircleTime);
            if(this.updateCircleTime > 5){
                this.updateCircleTime -= 1;
            }
        },
        deleteSelf(index){
            this.listenList.splice(index, 1);
        },
        addItem(){
            this.wantAddItem = true;
        },
        async chooseFile(){
            let filename = await ipcRenderer.invoke('chooseFile');
            if(filename){
                document.getElementById('label_input').innerHTML = filename;
                this.confirmAddItem();
            }
        },
        confirmAddItem(){
            let programName = document.getElementById('label_input').innerHTML;
            if(programName && this.listenList.indexOf(programName) == -1){
                this.listenList.push(programName);
            }
            this.cancelAddItem();
        },
        cancelAddItem(){
            this.wantAddItem = false;
            this.programName = '';
        },
        confirm(){
            setStorage('sleepTime', this.sleepTime);
            setStorage('updateCircleTime', this.updateCircleTime);
            let list = [];
            this.listenList.forEach((i)=>{
                list.push(i);
            })
            setStorage('listenList', list);
            this.cancel();
        },
        cancel(){
            ipcRenderer.send('closeSettingWindows');
        }
    },
    watch:{
        sleepTime(newValue, oldValue){
            if(!/^[1-9]\d*$/.test(newValue) || newValue > 120){
                this.sleepTime = oldValue;
            }
        },
        updateCircleTime(newValue, oldValue){
            if(!/^[1-9]\d*$/.test(newValue) || newValue > 120 || newValue < 5){
                this.sleepTime = oldValue;
            }
        }
    },
    async created(){
        this.listenList = await getStorage('listenList');
        this.updateCircleTime = await getStorage('updateCircleTime');
        this.sleepTime = await getStorage('sleepTime');
    }
}
</script>

<style scoped>
#container{
    margin: 10px 20px;
    display: flex;
    flex-flow: column;
}
.setting_item_card{
    width: 100%;
    box-sizing: border-box;
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    background: white;
    box-shadow: 2px 2px 5px #ccc;
}

.setting_item_card:hover{
    box-shadow: 2px 2px 5px #aaa;
}
.row{
    align-items: center;
}
.col{
    flex-flow: column;
}

.button_box{
    width: 100%;
    text-align: right;
}

.setting_title{
    font-size: 18px;
    color: #666;
    letter-spacing: 0.1em;
}

.listen_list_box{
    margin-top: 10px;
}

.listen_list_label{
    display: inline-block;
    height: 30px;
    border-radius: 15px;
    background: linear-gradient(to right, #FF8854, #F6A926);
    margin: 0px 10px 10px 0;
    color: #fff;
}

.label_text{
    vertical-align: middle;
    margin-left: 15px;
    font-size: 16px;
}

.label_input_span{
    display: inline-block;
}

.label_input{
    height: auto;
    font-size: 16px;
    outline: none;
    border: none;
    min-width: 40px;
    background: none;
    color: white;
    width: 100%;
    border-bottom: 1px solid white;
}

.label_bnt{
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    cursor: pointer;
    margin: 5px;
    vertical-align: middle;
}
.label_bnt_img{
    width: 100%;
    height: 100%;
}
.time{
    width: 30%;
    height: 30px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time button{
    outline: none;
    border: none;
    border-radius: 15px;
    background: linear-gradient(to right, #FF8854, #F6A926);
    cursor: pointer;
    width: 30px;
    height: 30px;
    padding: 5px;
}
.time input{
    font-size: 18px;
    width: 45px;
    height: 24px;
    text-align: center;
    outline: none;
}

.setting_bnt{
    width: 120px;
    height: 36px;
    border-radius: 18px;
    margin-left: 10px;
    border: none;
    background: white;
    color: black;
    font-size: 16px;
    box-shadow: 2px 2px 5px gray;
}

.setting_bnt:hover{
    background: linear-gradient(to right, #FF8854, #F6A926);
    color: white;
    cursor: pointer;
}

</style>