
/***
 * 初始化编辑区原\译文句段
 * 获取项目参数、获取目标span等
 * author: zy
***/

/*
 * 防止jquery ajax重复提交，
 * 多次提交同一个方法只保留最后一个。
 */
var pendingRequests = {};
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    // var key = options.url;
    var key = originalOptions.url+JSON.stringify(originalOptions.data);
    var complete = options.complete;
    if (!pendingRequests[key]) {
        pendingRequests[key] = jqXHR;
    } else {
        // jqXHR.abort(); //放弃后触发的提交
        pendingRequests[key].abort(); // 放弃前触发的提交
    }
    options.complete = function (jqXHR, textStatus) {
        pendingRequests[key] = null;
        if (jQuery.isFunction(complete)) {
            complete.apply(this, arguments);
        }
    };
});
// 获取必要参数保存
var projectID = "";
var UserID = "";
var fileID = "";
var UserName = "";
var iconType = "1";
if (sessionStorage.getItem('dataListCAT')) {
    var arrList = JSON.parse(sessionStorage.getItem('dataListCAT'));
    //修改
    let dataListLocal = [];
    let isPush = false;
    for (let i = 0; i < arrList.length; i++) {
        for (let j = i+1; j < arrList.length; j++) {
            if (arrList[i].Fileid != arrList[j].Fileid){
                isPush = true;
            }else {
                arrList[i].Packid = arrList[i].Packid.concat(arrList[j].Packid);
                arrList.splice(j,1);
                j--
            }
        }
        isPush?dataListLocal.push(arrList[i]):dataListLocal = arrList;
    }
    dataConfig.dataList = dataListLocal;
    //修改结束
    projectID = dataListLocal[0].Projectid;
    dataConfig.ProjectID = dataListLocal[0].Projectid;
    UserID = dataListLocal[0].UserID;
    UserName = dataListLocal[0].UserName;
    iconType = dataListLocal[0].SysFrom;
    dataConfig.userID = dataListLocal[0].UserID;
    dataConfig.userName = dataListLocal[0].UserName;
    dataConfig.NowLink = dataListLocal[0].NowLink;
    dataConfig.createdTime = dataListLocal[0].ProjectCreatedTime;
} else {
    // window.location.href = '/errorPage';
}
$(document.getElementById('iconTitle')).attr('href', '/images/LanCat.ico');
$(document.getElementById('logoImg')).attr('src', '/images/login_lancat.png');
var fileArr = [];
for (let i = 0; i < dataConfig.dataList.length; i++) {
    fileArr.push(dataConfig.dataList[i].Fileid)
};
fileID = fileArr.join(',');
// 隐藏跳转句段 和单句查找替换
var link = $('script.current').attr('data-link');
if (link === 'ES') {
    $('.jumpSentence').addClass('add_hidden');
}
if (dataConfig.dataList.length > 1) {
    $('.jumpSentence').addClass('add_hidden');
    $('#excFindBtn').addClass('add_hidden');
    $('#excBtn').addClass('add_hidden');
}
// 获取状态判断是否可以评价(用户是否为兼职)
$.ajax({
    method: "get",
    // url: urls.qaUrl + "/isfreelancer?" + "userCode=" + UserID,
    url: urls.chatRoomId + "/pm/evaluate/isFreeLancer?" + "staffNum=" + UserID,
    dataType: "json",
    contentType: "application/json;charset=utf-8",
    success: function (data) {
        if (data.success) {
            if (!data.data) {
                dataConfig.isfreelancer = true;
                $('._evaluate').addClass('add_hidden');
            } else {
                dataConfig.isfreelancer = false;
                $('._evaluate').removeClass('add_hidden');
            }
        }
    }
});
//操作提示
function tipOperation() {
    var ele =
        "<div class='tipOperation' style='position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 10000;width: 100%;height: 100%;padding-top: 180px;background: rgba(0, 0, 0, 0.3)'>" +
        "<div class='tipOperationBox'>" +
        "<p class='tipOperationTitle' style='text-align: center'>温馨提示（翻译注意事项）<a href='javascript:void(0);' class='am-close am-close-spin tipOperationBoxClose' data-am-modal-close>&times;</a></p>" +
        "<div>" +
        "<p class='tipOperationTitleLittle'>1、译文如何提交入库？</p>" +
        "<p class='tipOperationTitleContent'>当前句段翻译完成后，按下组合键“Ctrl+回车”即可保存译文。</p>" +
        "</div>" +
        "<div>" +
        "<p class='tipOperationTitleLittle'>2、如何添加译文样式？</p>" +
        "<p class='tipOperationTitleContent'>鼠标左键，选中需要调整样式的译文字符，然后鼠标移至原文框指定区域，点击鼠标左键点击原文突出的背景样式即可完成译文样式的添加或调整。</p>" +
        "</div>" +
        "<div>" +
        "<p class='tipOperationTitleLittle'>3、句段中图标的含义及添加方法？</p>" +
        "<p class='tipOperationTitleContent'>图例：<img src='/images/tipOperation/icon1.png' alt=''>&nbsp;&nbsp;<img src='/images/tipOperation/icon2.png' alt=''>&nbsp;&nbsp;<img src='/images/tipOperation/icon3.png' alt=''>&nbsp;&nbsp;<img src='/images/tipOperation/tag-1-01.png' alt=''>&nbsp;&nbsp;<img src='/images/tipOperation/tag-1-02.png' alt=''>等</p>" +
        "<p class='tipOperationTitleContent'>含义：为句段占位符，用于标识文件中的提取的特殊元素</p>" +
        "<p class='tipOperationTitleContent'>使用方法：将鼠标焦点放置在译文框指定位置，然后鼠标左键直接点击原文框中的对应图标即可完成添加。且改图标需全部添加且图标顺序保证与原文一致。</p>" +
        "<p class='tipOperationTitleContent'>示例及操作范例：<img src='/images/tipOperation/icon4.png' alt=''></p>" +
        "</div>" +
        "<div>" +
        "<p class='tipOperationTitleLittle'>4、快捷操作方式有哪些？</p>" +
        "<p class='tipOperationTitleContent'>详情稍后请参考页面顶部“帮助”栏具体介绍，建议用户能熟练运用。</p>" +
        "</div>" +
        "<div style='text-align: center;margin: 30px 0 0 0;'>" +
        "<button type='button' class='am-btn am-btn-primary normal-btn notTipAain' style='width: 100px;height: 40px;'>不再提示</button>" +
        "<button type='button' class='am-btn am-btn-primary normal-btn tipOperationSubmit' style='width: 100px;height: 40px;margin-left: 120px;'>已阅读</button>" +
        "</div>" +
        "</div>" +
        "</div>";
    // 是否展示提示操作
    if (localStorage.getItem('isShowTip')) {
        dataConfig.isShowTipOperation = false;
        $(".tipOperation").remove();
    } else {
        dataConfig.isShowTipOperation = true;
        $(document.body).append(ele);
    }
    $('.tipOperationBoxClose').on('click', function () {
        dataConfig.isShowTipOperation = false;
        $(".tipOperation").remove();
    });
    $('.notTipAain').on('click', function () {
        dataConfig.isShowTipOperation = false;
        localStorage.setItem('isShowTip', '1');
        $(".tipOperation").remove();
    });
    $('.tipOperationSubmit').on('click', function () {
        dataConfig.isShowTipOperation = false;
        $(".tipOperation").remove();
    });
}

// 储存token
if (window.name) {
    sessionStorage.setItem('tokenPM', window.name)
    if (sessionStorage.getItem('tokenPM')) {
        dataConfig.tokenPM = sessionStorage.getItem('tokenPM')
    }
    window.name = ''
} else {
    if (sessionStorage.getItem('token')){
        dataConfig.tokenPM = sessionStorage.getItem('token').split(' ')[1];
    }
}

// 获取聊天室ID
function getChatRoomID (type) {
    $.ajax({
        method: "get",
        url: urls.chatRoomId + "/pm/pmChat/getProjectRoomId",
        dataType: "json",
        data: {
            projectId: projectID
        },
        contentType: "application/json;charset=utf-8",
        headers: {"authorization": 'bearer ' + dataConfig.tokenPM},
        success: function (data) {
            if (data.success) {
                dataConfig.chatRoomId = data.data;
                if (data.data) {
                    getMessageNum();
                    openWS();
                } else {
                    if (type == 'two') {
                        $.Alert('当前项目暂无聊天室！');
                    }
                }
            }
        },
        error : function(xhr,textStatus,errorThrown){
            if (xhr.status == 401) {
                $.Alert("登录失效，若需继续使用聊天室，请关闭当前系统并重新登录进入编辑器！");
            } else{
                console.log(xhr, textStatus, errorThrown);
            }
        }
    });
};
if (dataConfig.tokenPM) {
    getChatRoomID('one');
};
// 获取未读消息数
function getMessageNum () {
    $.ajax({
        method: "get",
        url: urls.chatRoomId + "/chat/chatRoom/roomList?sys=pangu&token=" + dataConfig.tokenPM + "&roomId=" + dataConfig.chatRoomId,
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            if (data.success) {
                if (data.data.length > 0) {
                    dataConfig.msgNum = data.data[0].notReadNum;
                    dataConfig.msgNum > 0 && $('.unreadMsgNum').html(dataConfig.msgNum).css('display','block');
                    if (data.data[0].noticeIs){
                        $(".chatRoom").addClass('shake-hard');//聊天室抖动
                        $(".chatRoomMsg").css('display','block');
                    }
                }
            }
        }
    });
}

/* 角色权限相关 */
if (sessionStorage.getItem('getUserAuth')){
    let dataArr = JSON.parse(sessionStorage.getItem('getUserAuth'));
    dataArr.length > 0 && setUserAuth(dataArr);
}else {
    $.ajax({
        type: 'get',
        url: urls.editUrl + '/ParameterSet/GetUserAuth?Link=' + $("script.current").attr("data-link") + '&UserID=' + UserID + '&ProjectID=' + projectID,
        dataType: 'json',
        success: function (res) {
            if (res.success) {
                sessionStorage.setItem('getUserAuth',JSON.stringify(res.data));
                if (res.data && res.data.length > 0){
                    setUserAuth(res.data);
                }
            }
        }
    });
}
function setUserAuth(arr){
    arr.forEach(item => {
        if (item && item.AreaButtonList && item.AreaButtonList.length > 0) {
            item.AreaButtonList.forEach(item1 => {
                if (!item1.IsVisiable) {
                    item1.ClassID === 'setMatch' && $('.' + item1.ClassID).parents('div.btn-cell').remove();
                    $('.' + item1.ClassID)[0] && $($('.' + item1.ClassID)[0]).remove();
                    $('#' + item1.ClassID)[0] && $($('#' + item1.ClassID)[0]).remove();
                }
                if (item1.ClassID == 'MT-F3search' && !item1.IsVisiable) {
                    dataConfig.isMTshow = false
                }
                if (item1.ClassID === 'delete-remark' && !item1.IsVisiable) {
                    dataConfig.isDeleteRemark = false
                }
                // 用来判断是否可以使用LanMT机翻参考
                if (item1.ClassID === 'LanMT-reference' && !item1.IsVisiable) {
                    $('.mtTrans-btn,.mtTrans').remove();
                }
            });
        }
    });
    $('div.start>.btn-cell').toArray().forEach(item => {
        $(item).find('button').length < 1 && $(item).remove();
    });
}

/* 初始化获取通用参数 */
$.ajax({
    type: "get",
    url: urls.editUrl + "/ParameterSet/ProjParm?ProjectID=" + projectID + "&UserID=" + UserID + "&UserName=" + UserName + "&Link=" + ($('script.current').attr('data-link')),
    dataType: "json",
    success: function (data) {
        if (data && data.success) {

            // dataConfig.PackID = utils.queryParam("packid").split(',');
            dataConfig.reverseIds = data.data.DataBaseId_TM_Reverse;//反选库ID
            dataConfig.originalEdit = data.data.originalEdit;//原文是否可编辑
            dataConfig.TermProtection = data.data.TermProtection;//术语保护
            dataConfig.userName = data.data.UserName;
            dataConfig.userID = data.data.UserID;
            dataConfig.FileID = data.data.FileID;
            dataConfig.LangTypePair = data.data.LangTypePair;
            dataConfig.sourceLan = data.data.LangTypePair.slice(0, 4);
            dataConfig.targetLan = data.data.LangTypePair.slice(4);
            dataConfig.ProjectID = data.data.ProjectID;
            dataConfig.Field = data.data.Field;
            dataConfig.ImportID_TB = data.data.ImportID_TB;
            dataConfig.ImportID_TM = data.data.ImportID_TM;
            dataConfig.percentge = data.data.MatchingRate;
            dataConfig.isDTPevaluate = data.data.PerEditStyle.DtpVisualEditMainArea;
            !dataConfig.originalEdit && $('.edit-btn').css('display','none');
            dataConfig.DataBaseId_TM = data.data.DataBaseId_TM.filter((item) => {
                return typeof +item === "number" && item;
            });
            dataConfig.DataBaseId_TB = data.data.DataBaseId_TB.filter((item) => {
                return typeof +item === "number" && item;
            });
            dataConfig.MTtype = data.data.MachineTranslationFlag;
            $(".source_title").html(dataConfig.sourceLan);
            $(".target_title").html(dataConfig.targetLan);
            $("#language-pair").find('option').eq(0).val(dataConfig.sourceLan + dataConfig.targetLan);
            $("#language-pair").find('option').eq(1).val(dataConfig.targetLan + dataConfig.sourceLan);
            $("#language-pair").find('option').eq(0).html(dataConfig.sourceLan + " -> " + dataConfig.targetLan);
            $("#language-pair").find('option').eq(1).html(dataConfig.targetLan + " -> " + dataConfig.sourceLan);
            //显示登陆人
            $('.userName').html(`${data.data.UserName}`);
            console.log('SetView init', data.data)
            new SetView().init(data.data.PerEditStyle);
            if (dataConfig.isDTPevaluate) {
                // 获取项目DTP人员
                $.ajax({
                    method: "get",
                    // url: urls.qaUrl + "/getprojectdtp" + "?projectId=" + projectID,
                    url: urls.chatRoomId + "/pm/DTPTask/getDtpPm?projectId=" + projectID,
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        if (data.success && Object.keys(data.data).length > 0) {
                            dataConfig.userNameDTP = data.data.staffName;
                            dataConfig.userIdDTP = data.data.staffNum
                        }
                    }
                });
            }
        }
    },
    error: function () {
        console.log('初始化数据加载失败，请重试')
        $.Alert("初始化数据加载失败，请重试");
    }
});
/***
   * 获取某个节点的span父节点
   * @param domEle：节点
   * @returns span父节点
   */
function getClassSpan(domEle) {
    var result = domEle;
    while (result && !(result.tagName && result.tagName == "SPAN")) {
        result = result.parentNode;
    }
    return $(result);
};

//初始化tr.table-row列表，绑定事件
var initDom = function () {

    var oninputTimer = null;
    var selectedList = document.querySelectorAll("td.s-no");

    //选中tr
    (function () {

        KeyUp();
        document.body.onkeydown = function (event) {
            var e = event || window.event;
            if (e.ctrlKey) {
                KeyDown();
            }
            if (e.shiftKey) {
                ToSelected();
            }
        };
        document.body.onkeyup = function (event) {
            KeyUp();
            $('#edition-area').off('click');
        }

    })();
    //译文添加oninput事件
    (function () {
        $("div.edition-target").off('input').on("input", function () {
            var _this = this;
            window.clearTimeout(oninputTimer);
            oninputTimer = window.setTimeout(function () {
                var num = $(_this).parents('tr').attr('data-no');
                var fid = $(_this).parents('tr').attr('data-fid');
                var pid = $(_this).parents('tr').attr('data-pid');
                var txt = _this.innerText;
                var changeSts = new ChangeConfirmStatus();
                // dealQaObj.spellingCheck(txt, num, fid, pid);
                dealQaObj.pauseSend(txt, num, fid, pid);
                changeSts.single(_this);
                changeSts = null;
                oninputTimer = null;
            }, 50);
        });
    })();
    //输入内容时，判断原文是否只存在一种格式
    let inputEnglish = true;
    void function () {
        $('div.edition-target').off("keydown").on("keydown", function (event) {
            var e = window.event || event;
            var sourceDivCnts = $(this).parents('tr').find('div.edition-source').clone().contents(),
                targetDiv = $(this).parents('tr').find('div.edition-target');
            if (targetDiv.find('.tagWrap').length > 0) {
				return;
			}
			if(e.altKey || e.keyCode === _keyCode._enter){
				return;
			}
			if ($(this).text().trim() === '' && e.keyCode !== _keyCode._tab){
			    $(this).html(initOnlyOneStyle(this, sourceDivCnts));
            }
        });
    }();
    $('div.edition-target').on('compositionstart',function () {
        if ($(this).text().slice(-1) === ' ') {
            inputEnglish = false;
        }
    })
    // 绑定拼音类文本输入事件
    $('div.edition-target').on('compositionend',function () {
        // 中文输入结束时触发
        // 分两种情况去除空格
        if ($(this).text().slice(-1) === ' '){
            let ele = $(this).find('span.fontText');
            if (ele[1]){
                ele[1].remove();
            }else if (ele.text().length > 1){
                //文本替换去除空格，再将光标移至末尾
                ele.text(ele.text().slice(0,ele.text().length-1));
                let sel = window.getSelection();
                let range = document.createRange();
                range.selectNodeContents(ele[0]);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            inputEnglish = true;
        }
    })

    //Enter键保存原文
    void function () {
        $('div.edition-source').off("keydown").on("keydown", function (event) {
            var e = window.event || event;
            var $parNode = $(this).parents('tr'),
                $tar = $parNode.find(".edition-target"),
                $pid = $tar.attr("data-pid"),
                $fid = $tar.attr("data-fid"),
                $wid = $tar.attr("data-wid");
            if (e.keyCode === _keyCode._enter) {
                e.preventDefault();
               // 格式化内容
                dataConfig.newRangy.formatTarget($(this));
               // if (this.innerText.trim() == "") {
                   // $.Alert("原文为空");
                   // return false;
               // } else {
                    dealTranObj.confirmSource($(this), $pid, $wid, $fid);
               // }
                return false;
            }
        });
    }();
    /* 方法：初始化加载
         * 复制背景、字体颜色，鼠标左键插入
         * @param type: 类型
         * @param id: id
         * @param num: 序号
      */
    (function () {
        var eles = $('div.edition-source').find('.fontColor,.fontHighBg,.fontSize,.fontStyle,.fontBold,.fontItatic,.fontUnder,.fontSupscript,.fontSubscript');
        for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            ele.onmousedown = function (event) {
                var e = event || window.event,
                    _this = this;
                if (e.which !== 3 && (!$(_this).parents('tr').hasClass('locked') || !$(_this).parents('tr').hasClass('repeated'))) {
                    var $ele = $(_this),
                        $parentTr = $ele.parents('tr'),
                        $targetEle = $parentTr.find('.edition-target');
                    operateText.copyStyleEntry(_this);
                }
            }
        }
    })();
    /***
      * 句段号绑定事件
      * @ keydown
      * @ keyup
      * @ toselected
    */
    function KeyDown() {
        for (let i = 0, len = selectedList.length; i < len; i++) {
            var el = selectedList[i];
            el.onclick = function () {
                var $tarRow = $("tr.table-row"),
                    $tar = $(this).parent();
                $tarRow.removeClass("active");
                $tar.hasClass("selected") ? $tar.removeClass("selected") : $tar.addClass("selected");
            }
        }
    }
    function KeyUp() {
        for (let i = 0, len = selectedList.length; i < len; i++) {
            var el = selectedList[i];
            el.onclick = function () {
                var $tarRow = $("tr.table-row"),
                    $tar = $(this).parent();
                $tarRow.removeClass("active selected");
                $tar.addClass("selected");
            }
        }
    }
    function ToSelected() {
        var startTr, endTr, targetTr,
            startTrNo, endTrNo, targetTrNo,
            selectedList = $('tr.table-row.selected'),
            targetTable = $('#edition-area');
        if (selectedList.length >= 1) {
            targetTable.off('click').on('click', function (event) {
                var e = event || window.event;
                if (e.target.parentNode.classList.contains("selected")) {
                    startTr = selectedList[selectedList.length - 1];
                    startTrNo = +$(startTr).find('td.s-no').text();
                    endTr = selectedList[0];
                    endTrNo = +$(endTr).find('td.s-no').text();
                    targetTr = e.target.parentNode;
                    targetTrNo = +$(targetTr).find('td.s-no').text();
                    $(selectedList).addClass('selected');
                    if (targetTrNo > startTrNo) {
                        $(startTr).addClass('selected');
                        $(startTr).nextUntil(targetTr).addClass('selected');
                        $(targetTr).addClass('selected');
                    } else if (targetTrNo < endTrNo) {
                        $(endTr).addClass('selected');
                        $(targetTr).nextUntil(endTr).addClass('selected');
                        $(targetTr).addClass('selected');
                    }
                }
            });
        }
    }
    //查找原文只包含一种可视化标签的句段
    function initOnlyOneStyle(_this, contents) {
        let node, newNode;
        for (let i = 0; i < contents.length; i++) {
            var _node = contents[i];
            if ($(_node).attr('data-fs')){
                let str = $(_node).attr('data-fs').indexOf('Wingdings');
                if (!$(_node).hasClass('tagWrap') && str === -1) {
                    newNode = $(_node).clone();
                    break;
                }
            }else if (!$(_node).hasClass('tagWrap')) {
                newNode = $(_node).clone();
                break;
            }
        }
        if (newNode){
            node = newNode.clone();
            // node = newNode.clone().css('font-family','');
            node.text(' ');
        }
        setTimeout(()=>{
            // 分两种情况去除空格
            if ($(_this).text().slice(-1) === ' '){
                let ele = $(_this).find('span.fontText');
                if (ele.length > 1 && ele[ele.length-1]){
                    ele[ele.length-1].remove();
                }else if (ele.text().length > 1 && inputEnglish){
                    //文本替换去除空格，再将光标移至末尾
                    ele.text(ele.text().slice(0,ele.text().length-1));
                    let sel = window.getSelection();
                    let range = document.createRange();
                    range.selectNodeContents(ele[0]);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        },100);
        return node;
    }
};

//建立websocket获取聊天消息数量
function openWS () {
    var url = urls.chatWS + "/chat/web/pangu/" + dataConfig.tokenPM;
    //回调函数
    //一些对浏览器的兼容已经在插件里面完成
    var websocket = new ReconnectingWebSocket(url);
    // var websocket = new WebSocket(url);
    //连接发生错误的回调方法
    websocket.onerror = function () {
        console.log("websocket.error");
    };
    //连接成功建立的回调方法
    websocket.onopen = function (event) {
        console.log("onopen");
    }
    //接收到消息的回调方法
    websocket.onmessage = function (event) {
        var wsData = JSON.parse(event.data);
        if (wsData.toId == dataConfig.chatRoomId && wsData.fromId !== dataConfig.userID) {
            if (wsData.contentType === 'text' || wsData.contentType === 'file' || wsData.contentType === 'pic' || wsData.contentType === 'sys') {
                dataConfig.msgNum += 1;
                $('.unreadMsgNum').html(dataConfig.msgNum).css('display','block');
                if (wsData.noticeIs){
                    $(".chatRoom").addClass('shake-hard');//聊天室抖动
                    $(".chatRoomMsg").css('display','block');
                }
            }
        }
    }
    //连接关闭的回调方法
    websocket.onclose = function () {
        websocket.close();
    }
    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        websocket.close();
    }
    // return websocket;
}
// 离开页面告诉系统在线时长
// Date.prototype.Format = function (fmt) { // author: meizz
//     var o = {
//         "M+": this.getMonth() + 1, // 月份
//         "d+": this.getDate(), // 日
//         "h+": this.getHours(), // 小时
//         "m+": this.getMinutes(), // 分
//         "s+": this.getSeconds(), // 秒
//         "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
//         "S": this.getMilliseconds() // 毫秒
//     };
//     if (/(y+)/.test(fmt))
//         fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//     for (var k in o)
//         if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//     return fmt;
// };
// var startTimeView;
// startTimeView = new Date();//用户上线时间\
// var timeS = new Date().Format("yyyy-MM-dd hh:mm:ss");
// var endTimeView;
// var timeE;
// var visit_time = 0;
// var packidUnload;
// var fileidUnload;
// for (let i = 0; i < dataConfig.dataList.length; i++) {
//     packidUnload = dataConfig.dataList[i].Packid;
//     fileidUnload = dataConfig.dataList[i].Fileid;
// };
// window.onbeforeunload = function(){
//     endTimeView = new Date(); //用户退出时间
//     timeE = new Date().Format("yyyy-MM-dd hh:mm:ss");
//     visit_time = endTimeView.getTime() - startTimeView.getTime();
//     visit_time = Math.ceil(visit_time / 1000); //取的是秒并且化整
//     var params = {
//         UserID: UserID,
//         UserName: UserName,
//         ProjectID: projectID,
//         FileIDList: fileidUnload,
//         PackIDList: packidUnload,
//         OnlineTime: visit_time + 's',
//         OnlineTimeStart: timeS,
//         OnlineTimeEnd: timeE
//     };
//     $.ajax({
//         method: "post",
//         url: urls.editUrl + "/ParameterSet/EditOnloadMsg",
//         data: params,
//         dataType: "json",
//         beforeSend: function() {},
//         success: function (data) {
//             // console.log(data);
//         },
//         error:function(result){
//             // console.log(result);
//         },
//         complete:function(){
//             // console.log(123);
//         }
//     });
// };
