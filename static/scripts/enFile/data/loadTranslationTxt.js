/*
 * 该js文件用于加载页面数据
 * 定义loadPage对象，主要加载翻译文本内容
 * author: zy
*/
var loadPage = (function ($) {

    var iconFunc = null;
    var pageType = "";

    function query(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    //判断加载页面类型
    !(function () {
        const current = document.querySelector('script.current');
        if (current.dataset.page == 'yy') {
            pageType = "TTrans";
            iconFunc = loadIcons_yy;
        } else if (current.dataset.page == 'sj') {
            pageType = "TCheck";
            iconFunc = loadIcons_sj;
        } else if (current.dataset.page == 'qa') {
            pageType = "TQA";
            iconFunc = loadIcons_qa;
        } else if (current.dataset.page == 'pm') {
            pageType = "TPM";
            iconFunc = loadIcons_pm;
        } else if (current.dataset.page == 'es') {
            pageType = "TES";
            iconFunc = loadIcons_yy;
        }
    })();

    /*
      * 返回页面加载图标类型
    */
    //*** pm ***
    function loadIcons_pm(param) {
        var { confirm, confirmTitle, confirmIcon } = {};
        switch (param) {
            case 0: confirm = "", confirmTitle = "Untranslated"; confirmIcon = icons.yy_no; break;
            case 1: confirm = "", confirmTitle = "Translated"; confirmIcon = icons.yy; break;
            case 2: confirm = "", confirmTitle = "Pending review", confirmIcon = icons.sh_no; break;
            case 3: confirm = "", confirmTitle = "Reviewed", confirmIcon = icons.sh; break;
            case 4: confirm = "", confirmTitle = "Pending QA", confirmIcon = icons.qa_no; break;
            case 5: confirm = "", confirmTitle = "QA completed", confirmIcon = icons.qa; break;
            case -1: confirm = "", confirmTitle = "Being revised by PM", confirmIcon = icons.pm_no; break;
            case -2: confirm = "ok", confirmTitle = "Reviewed by PM", confirmIcon = icons.pm; break;
        }
        return {
            confirm,
            confirmTitle,
            confirmIcon
        }
    }
    //*** qa ***
    function loadIcons_qa(param) {
        var { confirm, confirmTitle, confirmIcon } = {};
        switch (param) {
            case 0: confirm = "", confirmTitle = "Untranslated"; confirmIcon = icons.yy_no; break;
            case 1: confirm = "", confirmTitle = "Translated"; confirmIcon = icons.yy; break;
            case 2: confirm = "", confirmTitle = "Pending review", confirmIcon = icons.sh_no; break;
            case 3: confirm = "", confirmTitle = "Reviewed", confirmIcon = icons.sh; break;
            case 4: confirm = "", confirmTitle = "Pending QA", confirmIcon = icons.qa_no; break;
            case 5: confirm = "ok", confirmTitle = "QA completed", confirmIcon = icons.qa; break;
            case -1: confirm = "ok", confirmTitle = "Being revised by PM", confirmIcon = icons.pm_no; break;
            case -2: confirm = "ok", confirmTitle = "Reviewed by PM", confirmIcon = icons.pm; break;
        }
        return {
            confirm,
            confirmTitle,
            confirmIcon
        }
    }
    //*** sj ***
    function loadIcons_sj(param) {
        var { confirm, confirmTitle, confirmIcon } = {};
        switch (param) {
            case 0: confirm = "", confirmTitle = "Untranslated"; confirmIcon = icons.yy_no; break;
            case 1: confirm = "", confirmTitle = "Translated"; confirmIcon = icons.yy; break;
            case 2: confirm = "", confirmTitle = "Pending review", confirmIcon = icons.sh_no; break;
            case 3: confirm = "ok", confirmTitle = "Reviewed", confirmIcon = icons.sh; break;
            case 4: confirm = "ok", confirmTitle = "Pending QA", confirmIcon = icons.qa_no; break;
            case 5: confirm = "ok", confirmTitle = "QA completed", confirmIcon = icons.qa; break;
            case -1: confirm = "ok", confirmTitle = "Being revised by PM", confirmIcon = icons.pm_no; break;
            case -2: confirm = "ok", confirmTitle = "Reviewed by PM", confirmIcon = icons.pm; break;
        }
        return {
            confirm,
            confirmTitle,
            confirmIcon
        }
    }
    //*** yy ***
    function loadIcons_yy(param) {
        var { confirm, confirmTitle, confirmIcon } = {};
        switch (param) {
            case 0: confirm = "", confirmTitle = "Untranslated"; confirmIcon = icons.yy_no; break;
            case 1: confirm = "ok", confirmTitle = "Translated"; confirmIcon = icons.yy; break;
            case 2: confirm = "ok", confirmTitle = "Pending review", confirmIcon = icons.sh_no; break;
            case 3: confirm = "ok", confirmTitle = "Reviewed", confirmIcon = icons.sh; break;
            case 4: confirm = "ok", confirmTitle = "Pending QA", confirmIcon = icons.qa_no; break;
            case 5: confirm = "ok", confirmTitle = "QA completed", confirmIcon = icons.qa; break;
            case -1: confirm = "ok", confirmTitle = "Being revised by PM", confirmIcon = icons.pm_no; break;
            case -2: confirm = "ok", confirmTitle = "Reviewed by PM", confirmIcon = icons.pm; break;
        }
        return {
            confirm,
            confirmTitle,
            confirmIcon
        }
    }

    //初始化预加载所有页数
    function initAllPage(totalPage,isOne = 2) {
        var html = "";
        for (var i = isOne; i <= totalPage; i++) {
            if (i === 1){
                html += `<tr class="init-row" data-page="${i}">
                                        <td class="init" style="width: 50px;height: ${25.5*localParam.pageSize}px!important;"></td>
                                        <td class="init-row-source" style="font-size: 60px;vertical-align:middle;text-align: center;">第${i}页</td>
                                        <td style="font-size: 60px;vertical-align:middle;text-align: center;">第${i}页</td>
                                        <td style="width: 36px;"></td>
                                        <td style="width: 36px;"></td>
                                        <td style="width: 46px;"></td>
                                       </tr>`;
            }else {
                html += `<tr class="init-row" data-page="${i}">
                    <td class="init" style="height: ${25.5*localParam.pageSize}px!important;" colspan=6 >第${i}页</td>
                    </tr>`;
            }
        }
        $("#edition-area").append(html);
    }
    //筛选句段数据
    function filterQA(ids, fids, isAll) {
        if (isAll.length === 0) {
            loadPage.initPage();
            return;
        }
        var list = [];
        var obj = {};
            obj.ProjectID = dataConfig.ProjectID;
            obj.FileID = fids.toString();
            obj.UserID = dataConfig.UserID;
            obj.FilterSen = ids.toString();
            obj.Link = $('script.current').attr('data-link');
		list.push(obj);
        $.ajax({
            type: "post",
            url: urls.editUrl + "/File/SomeSenSel",
            dataType: "json",
            data: { JsonStr: JSON.stringify(list) },
            beforeSend: function () {
                $.LoadTips('Segment filtering');
            },
            success: function (json) {
                if (json && json.length >= 0) {
                    $("#edition-area").empty();
                    localParam.allPageNum = Math.ceil(json.length / localParam.pageSize);
                    loadEachPage(json, 1, localParam.pageSize);
                    initAllPage(localParam.allPageNum);
                    $(".trans_container").mCustomScrollbar('scrollTo', 0);
                }
            },
            complete: function () {
                $(".init-page-modal").remove();
                $(".loading-modal").remove();
                $(".my-loading").remove();
            }
        });
    }
    //初始化获取数据
    function initPage(jumpId, fid,tr) {
        localParam.isGetContent =false;
        localParam.getContentMethod = 1;
        var list = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = {};
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.OrderStr = "1";
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                list.push(obj);
            }
        }
        $.ajax({
            type: "post",
            url: urls.editUrl + "/" + pageType +"/Index?size=" + localParam.pageSize + "&index=" + localParam.pageNum,
            dataType: "json",
            data: JSON.stringify(list),
            contentType: "application/json;charset=utf-8",
            success: function (json) {
                $(".my-loading").remove();
                if (json.msgInEnglish === 'Tasks Have Been Altered, Refresh Your Task List And Open A New Editor Home Page Is Recommended'){
                    $.Confirm('Tasks Have Been Altered, Refresh Your Task List And Open A New Editor Home Page Is Recommended');
                    $('#my-confirm').modal({
                        onConfirm: function (e) {
                            window.opener=null;
                            window.close();
                        },
                        onCancel: function (e) {
                            packChange()// 任务包发生变化记录操作
                        },
                        closeViaDimmer:false
                    });
                }
                if (json.success && json.data.total > 20000){
                    $.Confirm('The number of sentences shall not exceed 20,000.');
                    $(".am-modal-btn[data-am-modal-cancel]").attr('style','display:none!important');
                    $('#my-confirm').modal({
                        onConfirm: function (e) {
                            window.opener=null;
                            window.close();
                        },
                        closeViaDimmer:false
                    });
                    return;
                }
                if (json.success && json.data.records.length >= 0) {
                    localParam.allPageNum = json.data.pages;
                    if (localParam.isFirst) {
                        $("#edition-area").empty();
                        //存在不首先加载第一页数据的情况，先加载各页码
                        initAllPage(localParam.allPageNum,1);//初始化预加载所有页数
                        loadEachPage(json.data.records, localParam.pageNum, localParam.pageSize,$("tr.init-row[data-page='"+ json.data.current +"']"));//加载每页

                        // $(".trans_container").mCustomScrollbar('scrollTo', 0);
                        dealTranObj.getProgress();//获取翻译进度
                        if (dataConfig.isShowTipOperation) {
                            tipOperation(); // 操作提示
                        }
                        localParam.isFirst = false;
                    } else {
                        loadEachPage(json.data.records, localParam.pageNum, localParam.pageSize, tr);//加载每页
                    }
                    jumpId && classOperation.jumpToPosition(jumpId, fid);//跳转到指定句段
                }else {
                    $.Tips(json.msgInEnglish);
                }
            },
            complete: function () {
                localParam.isGetContent =true;
                $(".init-page-modal").remove();
                $(".loading-modal").remove();
            },
            error: function (error) {
                $(".my-loading").remove();
                $.Alert("Loading failed, please try again");
            }
        });
    }
    //任务包发生变化
    function packChange() {
        let list = [{
            ProjectID:dataConfig.ProjectID,
            UserID:dataConfig.userID,
            UserName:dataConfig.userName,
            Link:dataConfig.NowLink,
            FileIds:[],
            PackIds:[]
        }];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            list[0].FileIds.push(dataConfig.dataList[i].Fileid);
            list[0].PackIds.push(dataConfig.dataList[i].Packid.toString());
        }
        $.ajax({
            type: "post",
            url: urls.editUrl +"/stay-in-log",
            dataType: "json",
            data: JSON.stringify(list),
            contentType: "application/json;charset=utf-8",
            success: function (res) {

            }
        })
    }
    //加载每页
    function loadEachPage(list, pageNum, eachPage, insertEl = $("#edition-area")) {
        if (list && list.length > 0) {
            var htmlArr = [], i,
                data = { data: list },
                _length = data.data.length;
            for (let no = 0; no < _length; no++) {
                i = no;
                var confirmType = iconFunc(data.data[i].IsConfirm);
                var { _isconfirm, _isconfirmTitle, _isconfirmIcon } = { _isconfirmIcon: "" };
                _isconfirm = confirmType.confirm;
                _isconfirmTitle = confirmType.confirmTitle;
                _isconfirmIcon = confirmType.confirmIcon;
                confirmType = null;
                var { _islock, _islockTitle, _locked, _isedit } = {},
                    _title = "",
                    _nolock = '<i></i>',
                    _noper = '<font>' + data.data[i].MatchingRateTM + '%</font>';
                if (data.data[i].IsLock) {
                    if (data.data[i].IsRepeat == "0" || data.data[i].IsRepeat == "3") {//0正常,1文件重复,2文件重复,3库重复,4非译去重
                        [_islock, _islockTitle, _locked, _isedit] = ["ok", "Locked", "locked", "false"]
                    } else {
                        [_islock, _locked, _isedit, _islockTitle, _isconfirmTitle, _isconfirmIcon, _nolock, _noper] = ["ok", "repeated", "false", "", "", "", "", ""];
                        if (data.data[i].IsRepeat == "1" || data.data[i].IsRepeat == "2") {
                            // _title = "title=" + data.data[i].RepeatFromFileName;
                            let str = 'Duplicate project. Associate location：《' + data.data[i].RepeatFromFileName + '》No.' + data.data[i].RepeatFromFileSentence;
                            str = str.replace(/ /g,'&#32;'); // 防止有空格使title属性显示不全
                            _title = "title=" + str;
                        } else if (data.data[i].IsRepeat == "4") {
                            _title = "title=" + 'Non-translatable';
                        }
                    }
                } else {
                    [_islock, _islockTitle, _locked, _isedit] = ["", "Unlocked", "", "true"]
                }
                var [_remark, _remarkTitle] = ["", ""];
                switch (data.data[i].RemarkStatus) {
                    case 0: _remark = ""; _remarkTitle = "No notes"; break;
                    case 1: _remark = "unsolve"; _remarkTitle = "View notes"; break;
                    case 2: _remark = "solve"; _remarkTitle = "Export as comments"; break;
                    default: _remark = ""; _remarkTitle = "No notes";
                }
                var oriTxt = "", traTxt = "", remarkTxt = "",
                    oriPams = data.data[i].Original,
                    traPams = data.data[i].Translate;
                var searchOri = localParam.searchOringin,
                    searchTra = localParam.searchTrans;
                var createStyleFunc = dealTextObj.listToStyleString,
                    remarkFunc = baseFnObj.triangle;
                var termStr = "";
                var _fileName = "";
                if (data.data[i].TermList && data.data[i].TermList.length > 0) {
                    var t1 = "", t2 = "";
                    data.data[i].TermList.forEach((item) => {
                        // 转义特殊符号
                        item.rText = item.rText.trim().replace(/</g, '&lt;');
                        item.rText = item.rText.trim().replace(/>/g, '&gt;');
                        // item.rText = item.rText.trim().replace(/'/g, '&#39;');
                        // item.rText = item.rText.trim().replace(/"/g, '&quto;');
                        item.tText = item.tText.trim().replace(/</g, '&lt;');
                        item.tText = item.tText.trim().replace(/>/g, '&gt;');
                        // item.tText = item.tText.trim().replace(/'/g, '&#39;');
                        // item.tText = item.tText.trim().replace(/"/g, '&quto;');

                        t1 += item.rText.trim().replace(/\s+/g, "*") + "|";
                        t2 += item.tText.trim().replace(/\s+/g, "*") + "|";
                    });
                    t1 = t1.slice(0, -1);
                    t2 = t2.slice(0, -1);
                    termStr = "data-term=" + t1 + ";" + t2;
                }
                if (data.data[i].FileName) {
                    _fileName = data.data[i].FileName;
                    _fileName = _fileName.trim().replace(/</g, '&lt;');
                    _fileName = _fileName.trim().replace(/>/g, '&gt;');
                }
                oriTxt = oriPams && oriPams.length > 0 ? createStyleFunc(oriPams, '', { txtAddBg: searchOri }, data.data[i].TermList) : '<span class="fontText">' + data.data[i].OriginalPlainText + '</span>';
                traTxt = traPams && traPams.length > 0 ? createStyleFunc(traPams, '', { txtAddBg: searchTra }) : '<span class="fontText"></span>';
                remarkTxt = remarkFunc(_remarkTitle, data.data[i].RemarkStatus, data.data[i].RemarkMessage);
                // 评价模块
                var strEva = '';
                // var link = $('script.current').attr('data-link');
                // if (data.data[i].ExistQAReview) {
                //     strEva = `<div class="evaluateTip"
                //             onclick="event.stopPropagation();dealQaObj.showEvaluateData(this)"
                //             title="Click to view evaluation"
                //             data-wid="${data.data[i].SentenceId}"
                //              data-pid="${data.data[i].PackID}"
                //              data-fid="${data.data[i].FileID}">
                //         </div>`
                // } else {
                //     strEva = ''
                // };
                var strPopupEvaTar = '';
                var strPopupEvaSou = '';
                // if (link !== 'ES' && link !== 'T') {
                //     strPopupEvaTar = `<div class="evaluatePopupTip"
                //             onclick="event.stopPropagation();dealQaObj.openEvaluatePopup(this)"
                //             title="Click to evaluate">
                //         </div>`;
                //     strPopupEvaSou = `<div class="evaluatePopupTip"
                //             onclick="event.stopPropagation();dealQaObj.openEvaluatePopup(this)"
                //             title="Click to evaluate">
                //         </div>`;
                // }
                // if (link === 'T') {
                //      strPopupEvaSou = `<div class="evaluatePopupTip"
                //             onclick="event.stopPropagation();dealQaObj.openEvaluatePopup(this)"
                //             title="Click to evaluate">
                //         </div>`
                //     strPopupEvaTar = ''
                // }
                if (dataConfig.isfreelancer)  {
                    strEva = '';
                    strPopupEvaSou = '';
                    strPopupEvaTar = '';
                }
                htmlArr.push(`<tr class="table-row ${_locked}" data-caps="1" 
                                  data-page="${pageNum}"
                                  data-sign="${data.data[i].SentenceId}"
                                  data-xlid="${data.data[i].id}"
                                  data-no="${data.data[i].SentenceId}" 
                                  data-pid="${data.data[i].PackID}" 
                                  data-fid="${data.data[i].FileID}" 
                                  data-join="${data.data[i].ParagrapTypeValue}" 
                                  data-true="${_isconfirm}" 
                                  data-num="${0}" 
                                  data-fname="${_fileName}" 
                                  ${_title}>
                                    <td class="s-no ${_remark}" 
                                        title="${_fileName}">${data.data[i].SentenceId}${remarkTxt}</td>
                                    <td class="source-text active-text">
                                        <div class="edition-source" ${termStr}>${oriTxt}</div>
                                        ${strPopupEvaSou}
                                    </td>
                                    <td class="target-text active-text">
                                        <div class="edition-target"
                                             contenteditable="${_isedit}" 
                                             data-sign="${data.data[i].SentenceId}"
                                             data-xlid="${data.data[i].id}"
                                             data-wid="${data.data[i].SentenceId}" 
                                             data-pid="${data.data[i].PackID}" 
                                             data-fid="${data.data[i].FileID}" 
                                             data-tm="${data.data[i].MatchingRateTM}" 
                                             onblur="loadPage.triggerBlur(this)">${traTxt}</div>
                                             ${strEva}
                                             ${strPopupEvaTar}
                                    </td>
                                    <td class="set-width confirm"
                                        title="${_isconfirmTitle}" 
                                        data-iscon="${data.data[i].IsConfirm}">${_isconfirmIcon}</td>
                                    <td class="set-width lock ${_islock}" 
                                        data-islock="${data.data[i].IsLock}" 
                                        title="${_islockTitle}" 
                                        onclick="dealTranObj.lockSentence(this)">${_nolock}</td>
                                    <td class="set-width status">${_noper}</td>
                                    <td class="termHiddenContainer" style="display:none;width:0px;">${JSON.stringify(data.data[i].TermList)}</td>
                                 </tr>`);
            }
            insertEl[0].id
                ? insertEl.append(htmlArr.join(''))
                : (
                    insertEl.before(htmlArr.join('')),
                    insertEl.remove()
                );
            // 删除多余数据  减少浏览器渲染内存  2页为限
            if ($('tr.table-row').length > localParam.pageSize*2){
                let tabHight = 0,str = '';
                for (let i = 1; i <= localParam.allPageNum; i++) {
                    if(i > pageNum + 1 || i < pageNum - 1) {
                        if ($(`tr.table-row[data-page=${i}]`)[0]){
                            for (let j = 0; j < $(`tr.table-row[data-page=${i}]`).length; j++) {
                                tabHight +=  $(`tr.table-row[data-page=${i}]`).eq(j).height();
                            }
                            if (i === 1){
                                str = `<tr class="init-row" data-page="${i}">
                                        <td style="height: ${tabHight}px!important;width: 50px;"></td>
                                        <td class="init-row-source" style="font-size: 60px;vertical-align:middle;text-align: center;">第${i}页</td>
                                        <td style="font-size: 60px;vertical-align:middle;text-align: center;">第${i}页</td>
                                        <td style="width: 36px;"></td>
                                        <td style="width: 36px;"></td>
                                        <td style="width: 46px;"></td>
                                       </tr>`;
                            }else {
                                str = `<tr class="init-row" data-page="${i}">
                                        <td class="init" style="height: ${tabHight}px!important;" colspan="6">第${i}页</td>
                                       </tr>`;
                            }
                            $(`tr.table-row[data-page=${i}]`).eq(0).before(str);
                            $(`tr.table-row[data-page=${i}]`).remove();
                        }
                    }
                }
            }
            initDom();
        } else {
            $.Tips('No data');
        }
        localParam.isGetContent =true;
        $(".zeZhao").remove();
    }
    // 不一致句段预览数据处理
    function handleDataFnc (list, pageNum, eachPage) {
        var htmlArr = [], i,
            data = { data: list };
        var [_init, _length] = [(pageNum - 1) * eachPage, eachPage];
        _length = eachPage;
        for (let no = 0; no < _length; no++) {
            i = _init;
            var confirmType = iconFunc(data.data[i].IsConfirm);
            var { _isconfirm, _isconfirmTitle, _isconfirmIcon } = { _isconfirmIcon: "" };
            _isconfirm = confirmType.confirm;
            _isconfirmTitle = confirmType.confirmTitle;
            _isconfirmIcon = confirmType.confirmIcon;
            confirmType = null;
            var { _islock, _islockTitle, _locked, _isedit } = {},
                _title = "",
                _nolock = '<i style="cursor: auto;"></i>',
                _noper = '<font>' + data.data[i].MatchingRateTM + '%</font>';
            if (data.data[i].IsLock) {
                if (data.data[i].IsRepeat == "0" || data.data[i].IsRepeat == "3") {//0正常,1文件重复,2文件重复,3库重复,4非译去重
                    [_islock, _islockTitle, _locked, _isedit] = ["ok", "Locked", "locked", "false"]
                } else {
                    [_islock, _locked, _isedit, _islockTitle, _isconfirmTitle, _isconfirmIcon, _nolock, _noper] = ["ok", "repeated", "false", "", "", "", "", ""];
                    if (data.data[i].IsRepeat == "1" || data.data[i].IsRepeat == "2") {
                        // _title = "title=" + data.data[i].RepeatFromFileName;
                        let str = 'Duplicate project. Associate location：《' + data.data[i].RepeatFromFileName + '》No.' + data.data[i].RepeatFromFileSentence;
                        str = str.replace(/ /g,'&#32;'); // 防止有空格使title属性显示不全
                        _title = "title=" + str;
                    } else if (data.data[i].IsRepeat == "4") {
                        _title = "title=" + 'Non-translatable';
                    }
                }
            } else {
                [_islock, _islockTitle, _locked, _isedit] = ["", "Unlocked", "", "true"]
            }
            var [_remark, _remarkTitle] = ["", ""];
            switch (data.data[i].RemarkStatus) {
                case 0: _remark = ""; _remarkTitle = "No notes"; break;
                case 1: _remark = "unsolve"; _remarkTitle = "View notes"; break;
                case 2: _remark = "solve"; _remarkTitle = "Export as comments"; break;
                default: _remark = ""; _remarkTitle = "No notes";
            }
            var oriTxt = "", traTxt = "", remarkTxt = "",
                oriPams = data.data[i].Original,
                traPams = data.data[i].Translate;
            var searchOri = localParam.searchOringin,
                searchTra = localParam.searchTrans;
            var createStyleFunc = dealTextObj.listToStyleString,
                remarkFunc = baseFnObj.triangle;
            var termStr = "";
            if (data.data[i].TermList && data.data[i].TermList.length > 0) {
                var t1 = "", t2 = "";
                data.data[i].TermList.forEach((item) => {
                    t1 += item.rText.trim().replace(/\s+/g, "*") + "|";
                    t2 += item.tText.trim().replace(/\s+/g, "*") + "|";
                });
                t1 = t1.slice(0, -1);
                t2 = t2.slice(0, -1);
                termStr = "data-term=" + t1 + ";" + t2;
            }
            oriTxt = oriPams && oriPams.length > 0 ? createStyleFunc(oriPams, '', { txtAddBg: searchOri }, data.data[i].TermList) : '<span class="fontText">' + data.data[i].OriginalPlainText + '</span>';
            traTxt = traPams && traPams.length > 0 ? createStyleFunc(traPams, '', { txtAddBg: searchTra }) : '<span class="fontText"></span>';
            remarkTxt = remarkFunc(_remarkTitle, data.data[i].RemarkStatus, data.data[i].RemarkMessage);
            htmlArr.push(`<tr class="inconsistent ${_locked}" data-caps="1" 
                                  data-page="${pageNum}"
                                  data-sign="${data.data[i].SenSerialNum}"
                                  data-xlid="${data.data[i].id}"
                                  data-no="${data.data[i].SentenceId}" 
                                  data-pid="${data.data[i].PackID}" 
                                  data-fid="${data.data[i].FileID}" 
                                  data-join="${data.data[i].ParagrapTypeValue}" 
                                  data-true="${_isconfirm}" 
                                  data-num="${0}" 
                                  ${_title}>
                                    <td class="s-no" 
                                        style="width: 55px;"
                                        title="${data.data[i].ParagrapgLocation}">${data.data[i].SentenceId}</td>
                                    <td title="${data.data[i].FileName}" style="width:108px;max-width:108px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;">${data.data[i].FileName}</td>
                                    <td class="source-text active-text">
                                        <div class="edition-source" ${termStr}>${oriTxt}</div>
                                    </td>
                                    <td class="target-text active-text">
                                        <div class="edition-target"
                                             data-sign="${data.data[i].SenSerialNum}"
                                             data-xlid="${data.data[i].id}"
                                             data-wid="${data.data[i].SentenceId}" 
                                             data-pid="${data.data[i].PackID}" 
                                             data-fid="${data.data[i].FileID}" 
                                             data-tm="${data.data[i].MatchingRateTM}" >${traTxt}</div>
                                    </td>
                                    <td class="set-width"
                                        title="${_isconfirmTitle}" 
                                        data-iscon="${data.data[i].IsConfirm}">${_isconfirmIcon}</td>
                                    <td class="set-width lock ${_islock}" 
                                        data-islock="${data.data[i].IsLock}" 
                                        title="${_islockTitle}">${_nolock}</td>
                                    <td class="set-width status">${_noper}</td>
                                    <td class="termHiddenContainer" style="display:none;width:0px;">${JSON.stringify(data.data[i].TermList)}</td>
                                 </tr>`);
            _init++;
        }
        $("#atypismSen").append(htmlArr.join(''));
    }
    //更多搜索
    function filterPage(_this,tr) {
        localParam.isGetContent =false;
        var [_islock, _isremark, _iscommit, _isnumber, _isall, _isMatch, _isSource, _isStatus, _isTB] = [[], [], [], [], '', '', [], [], []];
        var options = $(".filter_radio");
        for (var i = 0; i < options.length; i++) {
            var goal = options[i].getAttribute("name"),
                val = options[i].value;
            if (options[i].checked) {
                switch (goal) {
                    case "filterCommit": _iscommit.push(val); break;
                    case "filterLock": _islock.push(val); break;
                    case "filterRemark": _isremark.push(val); break;
                    case "filterNumber": _isnumber.push(val); break;
                    case "filterAll": _isall = val; break;
                    case "filterMatching": _isMatch = val; break;
                    case "filterSource": _isSource.push(val); break;
                    case "filterStatus": _isStatus.push(val); break;
                    case "filterTB": _isTB.push(val); break;
                }
            }
        }
        var list = [];
        var MatchValueMix = $('input[name=matchStar]');
        var MatchValueMax = $('input[name=matchEnd]');
        if (_isMatch == 'true') {
            //修改
            if (Number(MatchValueMix.val()) < 75 || Number(MatchValueMax.val()) < 75) {
                $.Alert('Match rate needs to be above 75%, please reset！');
                return;
            }
            if (Number(MatchValueMix.val()) > 102 || Number(MatchValueMax.val()) > 102) {
                $.Alert('Match rate needs to be below 100%, please reset！');
                return;
            }
            if (Number(MatchValueMix.val()) > Number(MatchValueMax.val())) {
                $.Alert('Match rate needs to be 75% to 102% from left to right, please reset！');
                return;
            }
        }
        if (_isStatus.indexOf('3') > -1) {
            _isStatus.push('0')
        }
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = {};
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.IsLock = _islock;
                obj.IsHaveRemark = _isremark;
                obj.IsCommit = _iscommit;
                obj.IsOnlyNumber = _isnumber;
                obj.OpenFileWays = _isall === "true";
                obj.OrderStr = "1";
                obj.IsMatchScore = _isMatch === "true";
                obj.HaveTerm = _isTB;
                obj.TransContextFrom = _isSource;
                obj.SourceRepeatFrom = _isStatus;
                obj.MatchValueMix = MatchValueMix.val();
                obj.MatchValueMax = MatchValueMax.val();
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                list.push(obj);
            }
        };
        $.ajax({
            method: "post",
            url: urls.editUrl + "/" + pageType +"/Filter?size=" + localParam.pageSize + "&index=" + localParam.pageNum,
            dataType: "json",
            data: JSON.stringify(list),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                if (localParam.isFirst){
                    $(_this).html('Filtering<i class="am-icon-spinner am-icon-spin"></i>');
                    $(_this).attr("disabled", true);
                }
            },
            complete: function () {
                localParam.isGetContent =true;
                $(".my-loading").remove();
                if (localParam.isFirst){
                    localParam.isFirst = false;
                    $(_this).html('Confirm');
                    $(_this).removeAttr("disabled");
                    $(_this).next().click();
                }
            },
            success: function (json) {
                if (json.data){
                    if (localParam.isFirst){
                        $("#edition-area").empty();
                        localParam.allPageNum = json.data.pages;
                        loadEachPage(json.data.records, localParam.pageNum, localParam.pageSize);
                        initAllPage(localParam.allPageNum);
                        $(".trans_container").mCustomScrollbar('scrollTo', 0);
                    }else {
                        loadEachPage(json.data.records, localParam.pageNum, localParam.pageSize,tr);
                    }
                }else {
                    $("#edition-area").empty();
                    $.Tips("No eligible data");
                }
            },
            error: function (error) {
                $.Alert("Loading failed, please try again");
            }
        });
    }
    //跳转到其他页的句段/未提交句段
    function jumpToPagePosition(senId, fid,ele,confirm) {
        localParam.isGetContent =false;

        var [_islock, _isremark, _iscommit, _isnumber, _isall, _isMatch, _isSource, _isStatus, _isTB] = [[], [], [], [], '', '', [], [], []];
        var options = $(".filter_radio");
        for (var i = 0; i < options.length; i++) {
            var goal = options[i].getAttribute("name"),
                val = options[i].value;
            if (options[i].checked) {
                switch (goal) {
                    case "filterCommit": _iscommit.push(val); break;
                    case "filterLock": _islock.push(val); break;
                    case "filterRemark": _isremark.push(val); break;
                    case "filterNumber": _isnumber.push(val); break;
                    case "filterAll": _isall = val; break;
                    case "filterMatching": _isMatch = val; break;
                    case "filterSource": _isSource.push(val); break;
                    case "filterStatus": _isStatus.push(val); break;
                    case "filterTB": _isTB.push(val); break;
                }
            }
        }
        var MatchValueMix = Number($('input[name=matchStar]').val());
        var MatchValueMax = Number($('input[name=matchEnd]').val());
        if (_isMatch == 'true') {
            if (MatchValueMix < 75 || MatchValueMax < 75) {
                $.Alert('匹配率需设置75%以上，请重新设置！');
                return;
            }
            if (MatchValueMix > 102 || MatchValueMax > 102) {
                $.Alert('匹配率需设置102%以下，请重新设置！');
                return;
            }
            if (MatchValueMix > MatchValueMax) {
                $.Alert('匹配率需从左至右设置75%-102%以内，请重新设置！');
                return;
            }
        }
        if (_isStatus.indexOf('3') > -1) {
            _isStatus.push('0')
        }
        let list = {
            FileId:fid,
            SentenceId:senId,
            Link:$('script.current').attr('data-link'),
            UserId:dataConfig.userID,
            ProjectCreatedTime:dataConfig.createdTime,
            Filter:[],
            NonFilter:[],
            Search:{},
            Status:localParam.getContentMethod <4 ? localParam.getContentMethod : 3
        };
        // 筛选参数
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                let obj = {};
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.IsLock = _islock;
                obj.IsHaveRemark = _isremark;
                obj.IsCommit = _iscommit;
                obj.IsOnlyNumber = _isnumber;
                obj.OpenFileWays = _isall === "true";
                obj.OrderStr = "1";
                obj.IsMatchScore = _isMatch === "true";
                obj.HaveTerm = _isTB;
                obj.TransContextFrom = _isSource;
                obj.SourceRepeatFrom = _isStatus;
                obj.MatchValueMix = MatchValueMix;
                obj.MatchValueMax = MatchValueMax;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                list.Filter.push(obj);
            }
        }
        // 查找参数
        var fileArr = [],packArr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            fileArr.push(dataConfig.dataList[i].Fileid);
            for (let j = 0; j < packid.length; j++) {
                packArr.push(packid[j]);
            }
        }
        list.Search = {
            FileID: fileArr,
            OrderStr: '1',
            IsCapsLock: $("#caseSensitive").prop('checked'),
            IsWholeWord: $("#wholeWord").prop('checked'),
            Link: $('script.current').attr('data-link'),
            PackID: packArr,
            ProjectCreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            SelectSourceStr: $("#filterSource").val(),
            SelectTransStr: $("#filterTarget").val(),
            UserID: dataConfig.userID,
            WordID: ''
        };
        // 初始加载参数
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                let obj = {};
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.OrderStr = "1";
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                list.NonFilter.push(obj);
            }
        }
        let url = urls.editUrl + "/Skip2Sentence?size=" + localParam.pageSize;
        if (confirm){//跳转到其他页未提交句段
            url = urls.editUrl + "/FindNextScript?size=" + localParam.pageSize;
        }
        $.ajax({
            method: "post",
            url: url,
            dataType: "json",
            data: JSON.stringify(list),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                $.LoadTips('Redirecting...');
            },
            complete: function () {
                localParam.isGetContent =true;
                $('.my-loading').remove();
            },
            success: function (res) {
                if (res.data){
                    localParam.pageNum = res.data.current;
                    let currentTr = $("tr.init-row[data-page='"+ res.data.current +"']");
                    if (currentTr.length > 0){//未加载该页
                        loadEachPage(res.data.records, localParam.pageNum, localParam.pageSize,currentTr);//加载每页
                    }
                    if (confirm){
                        let trs = $("tr.table-row[data-page = '" + localParam.pageNum + "']").not('tr.repeated,tr.locked');
                        let joinTips = `<div class="joinTips" title="Segments can be merged" onclick="dealTranObj.joinFrameSentence()">
                                        <i class="am-icon-arrows-v"></i>
                                     </div>`;
                        for (var m = 0, len = trs.length; m < len; m++){
                            var tr = trs.eq(m);
                            if (tr.attr('data-true') === "") {
                                var scrollToPosi = tr.position().top > $('#mCSB_1').height() / 2.5
                                    ? tr.position().top - $('#mCSB_1').height() / 2.5 : tr;
                                tr.addClass("active").siblings().removeClass("active selected");
                                $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                                tr.find(".edition-target").focus().mousedown().mouseup();
                                $(".joinTips").remove();
                                if (tr.attr("data-join") === "true" && !(tr.hasClass("locked") || tr.hasClass("repeated"))) {
                                    tr.find("td.source-text").append(joinTips);
                                }
                                break;
                            }
                        }
                    }else {
                        let trs = $("tr.table-row");
                        for (let i = 0; i < trs.length; i++) {
                            let tr = trs[i],
                                jumpNoF = $(tr).attr('data-fid'),
                                jumpNo = $(tr).attr('data-sign');
                            if (dataConfig.dataList.length === 1) {
                                if (+senId === +jumpNo) {
                                    var scrollToPosi = $(tr).position().top > $('#mCSB_1').height() / 2.5
                                        ? ($(tr).position().top - $('#mCSB_1').height() / 2.5) : $(tr);
                                    $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                                    $(tr).addClass("active").siblings().removeClass("active selected");
                                    !ele && $(tr).find('div.edition-target').mousedown().mouseup().focus();
                                    $("div.joinTips").remove();
                                    if ($(tr).attr("data-join") === "true" && !($(tr).hasClass("locked") || $(tr).hasClass("repeated"))) {
                                        $(tr).find("td.source-text").append(`<div class="joinTips" title="Click to merge" onclick="dealTranObj.joinFrameSentence()">
                                                                <i class="am-icon-arrows-v"></i>
                                                            </div>`);
                                    }
                                    try {
                                        ele && utils.markQaResult(tr, ele);
                                    } catch (e) {
                                        console.log(e);
                                    }
                                    break;
                                }
                            } else {
                                if ((+senId === +jumpNo) && (jumpNoF === fid)) {
                                    var scrollToPosi = $(tr).position().top > $('#mCSB_1').height() / 2.5
                                        ? ($(tr).position().top - $('#mCSB_1').height() / 2.5) : $(tr);
                                    $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                                    $(tr).addClass("active").siblings().removeClass("active selected");
                                    !ele && $(tr).find('div.edition-target').mousedown().mouseup().focus();
                                    $("div.joinTips").remove();
                                    if ($(tr).attr("data-join") === "true" && !($(tr).hasClass("locked") || $(tr).hasClass("repeated"))) {
                                        $(tr).find("td.source-text").append(`<div class="joinTips" title="Click to merge" onclick="dealTranObj.joinFrameSentence()">
                                                                <i class="am-icon-arrows-v"></i>
                                                            </div>`);
                                    }
                                    try {
                                        ele && utils.markQaResult(tr, ele);
                                    } catch (e) {
                                        console.log(e);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }else {
                    $.Alert(res.msg);
                }
            },
            error: function (error) {
                error.responseJSON && $.Alert("Loading failed, please try again");
            }
        });
    }
    // 匹配率筛选区间选项
    function showFilterMatching (_this) {
        _this.value == 'true' ? $('#filterMatching').css("display", "inline-block") : $("#filterMatching").css("display", "none")
    }
    // 清空筛选条件
    function emptyFilter() {
        var options = $(".filter_radio");
        for (let i = 0; i < options.length; i++) {
            if (options[i].getAttribute("name") === 'filterAll') {
                options.splice(i, 1);
                i--;
            }
            if (options[i].getAttribute("name") === 'filterMatching') {
                options.splice(i, 1);
                i--;
            }
        }
        options.prop("checked", false);
        $("input[name='filterAll'][value='false']").prop('checked', true);
        $("input[name='filterMatching'][value='false']").prop('checked', true);
        $("#filterMatching").css("display", "none");
    }
    //拆分、合并句段
    function splitAndMerge(options) {
        // options = options || {};
        // options.url = options.url;
        // options.param = options.param;
        // options.btntype = options.btntype;
        // options.tar = options.tar;
        $.ajax({
            type: 'post',
            url: options.url,
            dataType: 'json',
            data: JSON.stringify(options.param),
            contentType: "application/json;charset=utf-8",
            complete: function () {},
            success: function (result) {
                // var data = { data: result.data };
                $(".my-loading").remove();
                if (result.success) {
                    $.LoadTips(`${options.btntype === 'S' ? 'Split successful' : 'Merge successful'}，Refreshing`);
                    window.setTimeout(() => {
                        // localParam.pageNum = 1;
                        localParam.isFirst = true;
                        var num = result.data;
                        // options.btntype === 'S' ? num = $(options.tar).attr('data-no') : num = +$(options.tar).attr('data-no') - 1
                        loadPage.initPage(num, $(options.tar).attr('data-fid'),$(options.tar));
                    }, 500);
                    initDom();
                } else {
                    $.Alert(result.msgInEnglish);
                }
            },
            error: function () {
                $(".my-loading").remove();
                $.Alert('Operation failed, please try again');
            }
        })
    }
    //原、译文框失去焦点，触发事件
    function triggerBlur(_this) {
        if (event && event.relatedTarget && event.relatedTarget.className === 'trans') {
			return false;
		}
        //提交
        if (_this.classList.contains("edition-target") && !$('#character-modal').hasClass('am-modal-active')) {
            //格式化内容
            setTimeout(function () {
                $(_this).attr('contenteditable',"false");
                dataConfig.newRangy && dataConfig.newRangy.formatTarget($(_this));
                $(_this).attr('contenteditable',"true");
                //译文未改变不发请求
                if (!$.isEmptyObject(dataConfig.sentence.ele) && dataConfig.sentence.ele['s'+$(_this).attr('data-xlid')]){
                    let oldEle = dataConfig.sentence.ele['s'+$(_this).attr('data-xlid')];
                    let  currentEle = getHashCode(JSON.stringify(dealTextObj.styleStringToList($(_this))));
                    if (oldEle === currentEle){
                        console.log('译文未改变，不发请求');
                        return
                    }
                }
                // 保存当前提交译文hash值
                dataConfig.sentence.ele['s'+$(_this).attr('data-xlid')] = getHashCode(JSON.stringify(dealTextObj.styleStringToList($(_this))));
                //按键提交，不提交草稿
                $(_this).attr("data-isDraft") !== 'false' && dealTranObj.tempTrans($(_this));
                $(_this).removeAttr("data-isDraft");
            },500);
        }
    }
    //获取字符串的 哈希值
    function getHashCode(str){
        var hash  =   1315423911,i,ch;
        for (i = str.length - 1; i >= 0; i--) {
            ch = str.charCodeAt(i);
            hash ^= ((hash << 5) + ch + (hash >> 2));
        }
        return  (hash & 0x7FFFFFFF);
    }
    return {getHashCode, jumpToPagePosition, initPage, initAllPage, loadEachPage, filterPage, splitAndMerge, filterQA, triggerBlur, query, handleDataFnc, showFilterMatching, emptyFilter }
})(jQuery);

loadPage.initPage();
