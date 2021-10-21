# 雷神自动暂停

## 声明

基于Electron构建，所以占的空间比较大（大概100多M）

本人没有系统学过任何变成语言，全靠网上找教程自学瞎搞，写这个工具完全是出于个人兴趣。有什么BUG本人概不负责。

## 介绍

1.0.0版本，实现了基础功能。很多点击反馈效果和鼠标悬浮提示还没做。

- 点齿轮选择需要监听的游戏进程
- 第一次点击“启动雷神加速器”自动弹出选择雷神加速器路径界面。

1.1.0版本，添加了设置界面，点击齿轮进入（代替1.0.0版本的直接选择监听的游戏）

- 自动暂停监听列表
    - 点击“+”号可以展开添加标签：
        - 可以直接输入想要监听的游戏的进程名称(`xxx.exe`)，输入玩后点击“√”确认。
        - 也可以点击文件夹图标按钮打开文件选择页面直接选择要监听的游戏进程。
        - 点击“x”关闭添加标签
    - 点击已添加标签的“x”可以移除已经添加的标签
- 扫描周期
    - 软件每过设定秒数就会扫描一次正在允许的程序，检测是否有被监听的游戏启动。该值越小软件监听到游戏的启动越灵敏。默认值：1。
- 监听游戏退出超时
    - 软件在监听到游戏退出后最多等待该设定秒数后才会暂停雷神加速器。该值越大加速器自动暂停的时间就越晚于游戏关闭的时刻（你可以在这个时间切换另一个被监听的游戏而不会导致加速器被暂停）。默认值：20。

## 后续计划

- 大量点击反馈和视觉反馈
- 点击齿轮打开一个设置界面，在该界面能够：

    - ~~显示目前已经监听的游戏列表~~
    - ~~向监听列表添加游戏~~
    - 设置雷神加速器的路径
    - ~~设置监听循环时间~~
    - ~~设置更新时间周期~~
    - 打开和关闭通知功能