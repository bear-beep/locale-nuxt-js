/*
 * 该文件是操作对象。
 * 定义classOperation对象，主要包含顶部按钮组、自定义组、跳转句段、操作原\译文交互等。
 * 处理编辑区滚动，加载数据。
 * author: zhaoyong
*/
var classOperation = (function ($) {

    var [
        tabTimer,
        insertTimer,
        catEntryTimer,
        jumpTimer,
        scrollTimer
    ] = [null, null, null, null, null];
    var _class = "add_hidden";

    //alt+数字键插入TB，获取插入文本
    function keyCopyTb(num) {
        var type;
        var cat = document.getElementById('_trans'),
            search = document.getElementById('_search');
        cat.checked && (type = ".transList");
        search.checked && (type = ".searchList");
        var copyTr = $(type + " tr.copy-tb").eq(num),
            copyTd = copyTr.find('td').last(),
            txt = copyTd.text();
        return txt;
    }
    //快捷键ctrl+数字键复制MT、TM
    function keyCopy(num) {
        var trs = $("tr.table-row"),
            copyTr = $("tr.key-copy").eq(num),
            copyTd = copyTr.find('td.catTrans');
        //修改
        var senID = copyTd.attr('data-xlid'),
            tmPercent = copyTd.attr('data-tm'),
            nextTxt = copyTd.next().text();
        for (var i = 0, len = trs.length; i < len; i++) {
            var tr = trs[i];
            // if (tr.dataset.no === senID) {
            //修改
            if (tr.dataset.xlid === senID) {
                var changeSts = new ChangeConfirmStatus();
                var targetDiv = $(tr).find("div.edition-target"),
                    sourceDivCnts = $(tr).find('div.edition-source').clone().contents();
                var scrollToPosi = $(tr).position().top > $('#mCSB_1').height() / 2.5
                    ? $(tr).position().top - $('#mCSB_1').height() / 2.5 : $(tr);
                if (tmPercent) {
                    targetDiv.attr({ "data-mne": "true", "data-tm": tmPercent }).html(dealCatObj.fastCopyStyle(sourceDivCnts, nextTxt));
                    $(tr).find("td.status>font").html(tmPercent + "%");
                } else {
                    targetDiv.html(dealCatObj.fastCopyStyle(sourceDivCnts, nextTxt));
                    $(tr).find("td.status>font").html("0%");
                }
                targetDiv.focus();
                $(tr).addClass("active").siblings().removeClass("active selected");
                $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                changeSts.single(targetDiv);
                return false;
            }
        }
    }
    //复制术语
    function copyTermWord(_this) {
        // let txt = $(_this).prev().text();
        let txt = $($(_this).prevAll()[1]).text();
        if ($('#copyTermInput').length < 1) {
            var el = document.createElement('input');
            el.id = 'copyTermInput';
            el.style.position = 'fixed';
            el.style.top = '-999px';
            document.body.appendChild(el);
        }
        $('#copyTermInput').val(txt);
        $('#copyTermInput').select();
        document.execCommand('copy', true);
        $.Tips('复制成功');
    }
    //调用首字母大写
    function firstCaseSensitive() {
        var caps,
            ele = $("tr.table-row.active");
        ele[0].dataset.caps == 5 && ele.attr('data-caps', 1);
        caps = ele[0].dataset.caps;
        operateText.caseSensitiveEntry(caps);
        ele.attr('data-caps', ++caps);
    }
    //显示添加术语
    function showTermModal() {
        var tar = document.querySelectorAll("td.active-text");
        for (var i = 0, ele; ele = tar[i++];) {
            ele.addEventListener("mouseup", function () {
                var _this = this, word = "";
                if ($(".add-term").hasClass(_class)) return;
                if (window.getSelection) {
                    word = window.getSelection().toString()
                };
                if (word.length > 0) {
                    $(_this).hasClass("source-text") ?
                        $(".term_source").val(word) : $(".term_target").val(word);
                }
            }, false);
        }
    }
    //退稿选中句段
    function getCheckedList() {
        var options = document.querySelectorAll("tr.table-row.selected");
        var _this, wid, pid,
            optionsArr = [];
        for (var i = 0, len = options.length; i < len; i++) {
            _this = options[i];
            wid = _this.dataset.no;
            pid = _this.dataset.pi;
            optionsArr.push({ 'wid': wid, 'pid': pid });
        }
        return optionsArr;
    }
    //清除div内容
    function clearContent() {
        $('body').removeAttr('data-change');
        $(".transList>tbody").empty();
        $(".tmTrans>tbody").empty();
        $('.tmTransInfo>thead').empty();
        $(".trans_spell").empty();
        $(".catTransMT").empty();
        $(".catMtEvaluate").remove();
        !$('.update_insert').attr('data-toggle') && $(".updataList>tbody").empty();
        $('.trans-table .tmDetail').hide();
        $('.transDetail').hide();
        $('.tmtb-tab').css({ 'height': '100%' });
        $(".readList>tbody").empty();
        $('.evaluateSentence>.evaluateSen').text('评价句段：');
        $(".evaluateList").find("input").prop("checked",false);
    }
    //跳转\寻找下一句时，查找未加载页
    function findSentence(key) {
        var pageNo, ele, index = key;
        var trs = document.querySelectorAll('tr.init-row');
		if(Number.isInteger(index/localParam.pageSize)){
			pageNo = index/localParam.pageSize;
		}else{
		    pageNo = Math.ceil(index/localParam.pageSize);
		}
        for (let tr of trs) {
            let page = tr.dataset.page;
            if (pageNo == page || pageNo === page) {
                ele = tr;
                break;
            }
        }
        return [ele, pageNo];
    }
    //跳转到指定句段
    var isJump = false;
    function jumpToPosition(senId, fid, ele) {
        $.LoadTips('正在跳转...');
        var jumpNum = senId,
            iumpNumF = fid,
            flag = false;
        var trs = $("tr.table-row");
        for (var i = 0, item; item = trs[i++];) {
            var tr = item,
                jumpNoF = $(tr).attr('data-fid');
            var jumpNo = $(tr).attr('data-sign');
            // if (dataConfig.dataList.length === 1) {
            if (!fid) {
                if (+jumpNum === +jumpNo) {
                    window.setTimeout(() => {
                        var scrollToPosi = $(tr).position().top > $('#mCSB_1').height() / 2.5
                            ? ($(tr).position().top - $('#mCSB_1').height() / 2.5) : $(tr);
                        $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                        $(tr).addClass("active").siblings().removeClass("active selected");
                        !ele && $(tr).find('div.edition-target').mousedown().mouseup().focus();
                        $("div.joinTips").remove();
                        if ($(tr).attr("data-join") === "true" && !($(tr).hasClass("locked") || $(tr).hasClass("repeated"))) {
                            $(tr).find("td.source-text").append(`<div class="joinTips" title="点击可合并句段" onclick="dealTranObj.joinFrameSentence()">
                                                                <i class="am-icon-arrows-v"></i>
                                                            </div>`);
                        }
                        try {
                            ele && utils.markQaResult(tr, ele);
                        } catch (e) {
                            console.log(e);
                        }
                    }, 500);
                    flag = true;
                    isJump = true;
                    break;
                }
            } else {
                if ((+jumpNum === +jumpNo) && (jumpNoF === iumpNumF)) {
                    window.setTimeout(() => {
                        var scrollToPosi = $(tr).position().top > $('#mCSB_1').height() / 2.5
                            ? ($(tr).position().top - $('#mCSB_1').height() / 2.5) : $(tr);
                        $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                        $(tr).addClass("active").siblings().removeClass("active selected");
                        !ele && $(tr).find('div.edition-target').mousedown().mouseup().focus();
                        $("div.joinTips").remove();
                        if ($(tr).attr("data-join") === "true" && !($(tr).hasClass("locked") || $(tr).hasClass("repeated"))) {
                            $(tr).find("td.source-text").append(`<div class="joinTips" title="点击可合并句段" onclick="dealTranObj.joinFrameSentence()">
                                                                <i class="am-icon-arrows-v"></i>
                                                            </div>`);
                        }
                        try {
                            ele && utils.markQaResult(tr, ele);
                        } catch (e) {
                            console.log(e);
                        }
                    }, 500);
                    flag = true;
                    isJump = true;
                    break;
                }
            }
        }
        if (!flag) {
            if (!fid){
                fid = dataConfig.dataList[0].Fileid;
            }
            loadPage.jumpToPagePosition(senId, fid,ele); // 跳转到其他页句段
        } else {
            window.setTimeout(() => { $('.my-loading').remove() }, 1000);
        }
    }

    //跳到下一句段
    function scrollNextSentence() {
        var tagTr = $('tr.table-row.active'),
            nextTr = tagTr.nextAll('tr').not('tr.repeated,tr.locked').eq(0);
        var scrollToPosi = nextTr.position() && nextTr.position().top > $('#mCSB_1').height() / 2.5
            ? nextTr.position().top - $('#mCSB_1').height() / 2.5 : nextTr;
        var joinTips = `<div class="joinTips" title="句段可合并" onclick="dealTranObj.joinFrameSentence()">
                          <i class="am-icon-arrows-v"></i>
                        </div>`;
        nextTr.find(".edition-target").focus();
        nextTr.addClass("active").siblings().removeClass("active selected");
        $(".trans_container").mCustomScrollbar("scrollTo", scrollToPosi);
        $(".joinTips").remove();
        if (nextTr.attr("data-join") === "true" && !(nextTr.hasClass("locked") || nextTr.hasClass("repeated"))) {
            nextTr.find("td.source-text").append(joinTips);
        }
        var senid = nextTr.attr("data-sign"),
            xlid = nextTr.attr("data-xlid"),
            oriTxt = nextTr.find(".edition-source").text(),
            prevTxt = nextTr.prev().find(".edition-source").text(),
            nextTxt = nextTr.next().find(".edition-source").text();
        clearContent();
        !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory(nextTr.find(".edition-target").attr("data-wid"), nextTr.find(".edition-target").attr("data-pid"), nextTr.find(".edition-target").attr("data-fid"));
        dealTranObj.readHistory(nextTr.find(".edition-target").attr("data-wid"), nextTr.find(".edition-target").attr("data-pid"), nextTr.find(".edition-target").attr("data-fid"));
        dealCatObj.getTMofResult(senid, nextTr.find(".edition-target").attr("data-fid"), dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, oriTxt, prevTxt, nextTxt, nextTr,xlid);
        dealCatObj.getTBofResult(senid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, oriTxt);
        dealCatObj.getMTYYQofResult(senid, dataConfig.sourceLan, dataConfig.targetLan, oriTxt, nextTr.find(".edition-target").attr("data-fid"), nextTr.find(".edition-target").attr("data-wid"));
    }
    //跳转至未提交句段
    function scrollToNoConfirmSentence(trT) {
        var tag = $("tr.enterTag"),
            trs = tag.nextAll("tr.table-row").not('tr.repeated,tr.locked');
        var isAll = true;
        var flag = trs.toArray().every(item => {
            return item.dataset.true === "ok";
        });
        var joinTips = `<div class="joinTips" title="句段可合并" onclick="dealTranObj.joinFrameSentence()">
                        <i class="am-icon-arrows-v"></i>
                     </div>`;
        if (flag){
            if ($('tr.init-row').length > 0) {
                loadPage.jumpToPagePosition($(trT).attr('data-sign'), $(trT).attr('data-fid'),'','confirm');
            } else {
                trs = $("tr.table-row").not('tr.repeated,tr.locked');
                for (var m = 0, len = trs.length; m < len; m++){
                    let tr = trs.eq(m);
                    if (tr.attr('data-true') === "") {
                        let scrollToPosi = tr.position().top > $('#mCSB_1').height() / 2.5
                            ? tr.position().top - $('#mCSB_1').height() / 2.5 : tr;
                        tr.addClass("active").siblings().removeClass("active selected");
                        $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                        tr.find(".edition-target").focus().mousedown().mouseup();
                        $(".joinTips").remove();
                        if (tr.attr("data-join") === "true" && !(tr.hasClass("locked") || tr.hasClass("repeated"))) {
                            tr.find("td.source-text").append(joinTips);
                        }
                        clearContent();
                        let senid = tr.attr("data-no"),
                            xlid = tr.attr("data-xlid"),
                            oriTxt = tr.find(".edition-source").text(),
                            prevTxt = tr.prev().find(".edition-source").text(),
                            nextTxt = tr.next().find(".edition-source").text();
                        let wid = tr.find(".edition-target").attr("data-wid"),
                            fid = tr.find(".edition-target").attr("data-fid"),
                            pid = tr.find(".edition-target").attr("data-pid");
                        !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory(wid, pid, fid);
                        dealTranObj.readHistory(wid, pid, fid);
                        dealCatObj.getTMofResult(senid, fid, dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, oriTxt, prevTxt, nextTxt, tr,xlid);
                        dealCatObj.getTBofResult(senid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, oriTxt);
                        isAll = false;
                        break;
                    }
                }
                isAll && $.Alert('不存在未提交句段');
                return false;
            }
        }else {
            for (let i = 0, len = trs.length; i < len; i++) {
                let tr = trs.eq(i);
                if (tr.attr("data-true") === "") {
                    var scrollToPosi = tr.position().top > $('#mCSB_1').height() / 2.5
                        ? tr.position().top - $('#mCSB_1').height() / 2.5 : tr;
                    tr.addClass("active").siblings("tr").removeClass("active selected");
                    $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                    //获取焦点
                    tr.find(".edition-target").focus().mousedown().mouseup();
                    $(".joinTips").remove();
                    if (tr.attr("data-join") === "true" && !(tr.hasClass("locked") || tr.hasClass("repeated"))) {
                        tr.find("td.source-text").append(joinTips);
                    }
                    clearContent();
                    let senid = tr.attr("data-no"),
                        xlid = tr.attr("data-xlid"),
                        oriTxt = tr.find(".edition-source").text(),
                        prevTxt = tr.prev().find(".edition-source").text(),
                        nextTxt = tr.next().find(".edition-source").text();
                    let wid = tr.find(".edition-target").attr("data-wid"),
                        fid = tr.find(".edition-target").attr("data-fid"),
                        pid = tr.find(".edition-target").attr("data-pid");
                    !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory(wid, pid, fid);
                    dealTranObj.readHistory(wid, pid, fid);
                    dealCatObj.getTMofResult(senid, fid, dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, oriTxt, prevTxt, nextTxt, tr,xlid);
                    dealCatObj.getTBofResult(senid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, oriTxt);
                    break;
                }
            }
        }
    }


/*
 *   ****** 键盘事件 ******
*/
    //右侧Enter搜索
    document.getElementById("search_text").onkeydown = function (event) {//Enter搜索

        var e = window.event || event;
        if (e.keyCode === _keyCode._enter) {
            if (this.value.trim() === '') {
                $.Alert('请输入搜索内容');
                return;
            }
            var searchs = new partSearch(),
                param = searchs._init();
            $(".searchList>tbody").empty();
            $('.searchList').css('display', 'none');
            $('._search .tmDetail').hide();
            $('.search-result').css({ 'height': 'calc(100% - 70px)' });
            $(".search_result_total>font").html(0);
            dealCatObj.getMTofResult(param.source, param.target, param.txt, "", ".searchList>tbody");
            // // 调整显示顺序
            // switch ($('#type-pair').val()) {
            //     case 'tm':
            //         searchs.tmSearch(param, dataConfig.DataBaseId_TM).then(data => {
            //             $(".search_result_total>font").html(data);
            //         }).catch(err => {
            //             $.Alert("搜索失败，请重试");
            //         });
            //         break;
            //     case 'tb':
            //         searchs.tbSearch(param).then(data => {
            //             $(".search_result_total>font").html(data);
            //         }).catch(err => {
            //             $.Alert("搜索失败，请重试");
            //         });
            //         break;
            //     case 'tb1':
            //         searchs.tbSearchNew(param, dataConfig.DataBaseId_TB).then(data => {
            //             $(".search_result_total>font").html(data);
            //         }).catch(err => {
            //             $.Alert("搜索失败，请重试");
            //         });
            //         break;
            // }
            searchs.fileSen(param, searchs).then(data => {
                $(".search_result_total>font").html(data);
            }).catch(err => {
                $.Alert("搜索失败，请重试");
            });
            $('.searchList').show();
            searchs = null;
        }
    }
    //跳到句段
    document.getElementById('jump-to').onkeydown = function (event) {
        var e = event || window.event;
        if (e.keyCode === _keyCode._enter) {
            $('.jump_to').click();
        }
    }

    //操作复制、粘贴时，转换为文本
    $(document).on({
        "copy": function (event) {
            var e = event || window.event;
            var cpTxt = "", userSelection;
            var clipboardData = window.clipboardData; //IE
            if (!clipboardData) { //chrome
                clipboardData = e.originalEvent.clipboardData;
            }
            if (window.getSelection) {
                userSelection = window.getSelection();
            } else if (document.selection) {
                userSelection = document.selection.createRange();
            }
            cpTxt = userSelection.toString();
            clipboardData.setData('text', cpTxt);
            return false;
        }
    });

    /*
        *** 按钮快捷键集合 ***
    */
    $(document).on("keydown", function (event) {

        var e = window.event || event;
        var ele = $("tr.table-row.active"),
            eles = $("tr.table-row.active,tr.table-row.selected");
        var changeSts = new ChangeConfirmStatus();

        //返回当前活动句段
        if (e.ctrlKey && e.keyCode === _keyCode._home) {
            e.preventDefault();
            var sign = ele.attr("data-sign");
            sign && jumpToPosition(sign);
        }
        //跳到指定编号的句段
        if (e.ctrlKey && e.keyCode === _keyCode._g) {
            e.preventDefault();
            $('label[for=header-start]').click();
            $('#jump-to').focus();
        }
        //快捷键插入术语TB
        if (e.altKey && e.keyCode === _keyCode._1) {
            e.preventDefault();
            var txt = keyCopyTb(0);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._2) {
            e.preventDefault();
            var txt = keyCopyTb(1);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._3) {
            e.preventDefault();
            var txt = keyCopyTb(2);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._4) {
            e.preventDefault();
            var txt = keyCopyTb(3);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._5) {
            e.preventDefault();
            var txt = keyCopyTb(4);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._6) {
            e.preventDefault();
            var txt = keyCopyTb(5);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._7) {
            e.preventDefault();
            var txt = keyCopyTb(6);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._8) {
            e.preventDefault();
            var txt = keyCopyTb(7);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        } else if (e.altKey && e.keyCode === _keyCode._9) {
            e.preventDefault();
            var txt = keyCopyTb(8);
            dealCatObj.insertTbWord(ele[0].dataset.no, txt.trim());
        }
        //快捷键复制MT、TM
        if (e.ctrlKey && e.keyCode === _keyCode._1) {
            e.preventDefault();
            keyCopy(0);
        } else if (e.ctrlKey && e.keyCode === _keyCode._2){
            e.preventDefault();
            keyCopy(1);
        } else if (e.ctrlKey && e.keyCode === _keyCode._3) {
            e.preventDefault();
            keyCopy(2);
        } else if (e.ctrlKey && e.keyCode === _keyCode._4) {
            e.preventDefault();
            keyCopy(3);
        } else if (e.ctrlKey && e.keyCode === _keyCode._5) {
            e.preventDefault();
            keyCopy(4);
        } else if (e.ctrlKey && e.keyCode === _keyCode._6) {
            e.preventDefault();
            keyCopy(5);
        } else if (e.ctrlKey && e.keyCode === _keyCode._7) {
            e.preventDefault();
            keyCopy(6);
        } else if (e.ctrlKey && e.keyCode === _keyCode._8) {
            e.preventDefault();
            keyCopy(7);
        } else if (e.ctrlKey && e.keyCode === _keyCode._9) {
            e.preventDefault();
            keyCopy(8);
        }
        if (e.ctrlKey && e.keyCode === _keyCode._q && $('#qaRunBtn').length > 0) {//qa检查
            e.preventDefault();
            $('label._quality').click();
            $('#qaRunBtn').click();
        } else if (e.ctrlKey && e.keyCode === _keyCode._e && $('.separate-btn').length > 0) {//拆分句段
            e.preventDefault();
            var el = $('.separate-btn')[0];
            dealTranObj.splitSentence(el);
        } else if (e.ctrlKey && e.keyCode === _keyCode._j && $('.merge-btn').length > 0) {//合并句段
            e.preventDefault();
            var el = $('.merge-btn')[0];
            dealTranObj.joinSentence(el);
        } else if (e.keyCode === _keyCode._f1) { //查找原、译文
            e.preventDefault();
            $("label[for=header-replace]").click();
            $(".exc_exchange_content").focus();
            e.ctrlKey && $('#excBtn').length > 0 ? $('#excBtn').click() : $('#excFindBtn').click();
        } else if (e.keyCode === _keyCode._f2) {
            e.preventDefault();
            if (e.shiftKey){//f2+shift切换大小写
                var caps;
                ele[0].dataset.caps == 5 && ele.attr('data-caps', 1);
                caps = ele[0].dataset.caps;
                operateText.caseSensitiveEntry(caps);
                ele.attr('data-caps', ++caps);
            } else {//预览句段
                // 暂时该关闭功能
                // if (ele && ele.length > 0) {
                //     var tarEl = $('.preview-sentence'),
                //         wordID = ele.get(0).dataset.no;
                //     tarEl.hasClass('add_hidden') && tarEl.removeClass('add_hidden');
                //     dealTranObj.previewSentence(ele.attr('data-no'), ele.attr('data-fid'), ele.attr('data-pid'));
                // }
            }
        } else if (e.shiftKey && e.keyCode === _keyCode._f3) { //f3切换大小写
            e.preventDefault();
            operateText.caseSensitiveEntry();
        } else if (e.keyCode === _keyCode._f3 && $('.tabs-btn._search').length > 0) { //f3快捷键
            if (e.ctrlKey) { // ctrl+f3快捷键搜索TB
                e.preventDefault();
                if (ele && ele.length > 0) {
                    $('#type-pair').val('tb');
                    $('#type-pair').trigger('changed.selected.amui'); // 下拉组件刷新selected状态
                    var search = new partSearch();
                    search.copySearch(search, ele);
                }
            } else { // 搜索TM
                e.preventDefault();
                if (ele && ele.length > 0) {
                    $('#type-pair').val('tm');
                    $('#type-pair').trigger('changed.selected.amui'); // 下拉组件刷新selected状态
                    var search = new partSearch();
                    search.copySearch(search, ele);
                }
            }
        } else if (e.altKey && e.keyCode === _keyCode._t && $('.term-btn').length > 0) {//显示添加术语
            if (!dataConfig.ImportID_TB) {
                $.Alert('当前项目未添加更新库，无法添加术语！');
                return
            }
            e.preventDefault();
            $('div.add-term').toggleClass(_class);
            showTermModal();
            BOM.setTransHeight('term');
        } else if (e.ctrlKey && e.keyCode === _keyCode._r) {  //刷新句段
            // e.preventDefault();
            // $.LoadTips("正在刷新句段");
            // clearContent();
            // $(".tmTrans>tbody").empty();
            // $(".updataList>tbody").empty();
            // loadPage.initPage(ele.attr("data-sign"), ele.attr("data-fid"));
        } else if (e.keyCode === _keyCode._f4 && $('.edit-btn').length > 0) {//编辑原文
            if (!dataConfig.originalEdit) {
                $.Alert("当前任务不允许编辑原文！");
                return false;
            }
            e.preventDefault();
            if (ele.hasClass("locked") || ele.hasClass("repeated")) {
                $.Alert("该句段不能操作");
                return false;
            }
            $(ele).find(".edition-source").attr("contenteditable", true).focus();
        } else if (e.ctrlKey && e.which === _keyCode._delete && $('.delete-btn').length > 0) {//删除译文
            e.preventDefault();
            if (dataConfig.NowLink === 'P') {
                if (eles.length === 1) {
                    if (eles.hasClass("repeated") || eles.hasClass("locked")) {
                        $.Alert("该句段不能操作");
                        return;
                    }
                    $(eles[0]).find(".edition-target").empty();
                    $("div.trans_spell").empty();
                    eles.find('td.confirm').attr({ "title": "未翻译" });
                    eles.find('td.confirm img').attr({ "src": iconsrc.yy_no, "data-iscon": "0", "title": "未翻译" });
                    dealTranObj.batchDelTarget('one');
                } else {
                    dealTranObj.batchDelTarget();
                }
            } else {
                if (ele.hasClass("repeated") || ele.hasClass("locked")) {
                    $.Alert("该句段不能操作");
                    return;
                }
                for (var i = 0, el; el = eles[i++];) {
                    var tar = $(el);
                    if (tar.hasClass("repeated") || tar.hasClass("locked")) {
                        continue;
                    }
                    tar.find(".edition-target").empty();
                }
                $("div.trans_spell").empty();
                eles.eq(0).find(".edition-target").focus();
                changeSts.multi(eles);
                changeSts = null;
            }
        } else if (e.ctrlKey && e.which == _keyCode._insert && $('.copy-btn').length > 0) {//复制原文
            e.preventDefault();
            if (eles.length === 1) { // 单个复制
                if (eles.hasClass("repeated") || eles.hasClass("locked")) {
                    $.Alert("该句段不能操作");
                    return;
                }
                let source = $(eles[0]).find(".edition-source").html();
                $(eles[0]).find(".edition-target").html(source);
                eles.eq(0).find(".edition-target").focus();
                changeSts.multi(eles);
                changeSts = null;
            } else if (eles.length > 1) { // 批量复制
                dealTranObj.batchCopySource();
            }
        } else if ((e.keyCode == _keyCode._tab || (e.ctrlKey && e.keyCode === _keyCode._down) || (e.ctrlKey && e.keyCode === _keyCode._up)) && ele.length > 0) { //到上/下一句
            e.preventDefault();
            var $this = e.keyCode === 38 ? ele.prev("tr") : ele.next("tr");
            if ($this && $this.length < 1) return;
            var scrollToPosi = $this.position().top > $('#mCSB_1').height() / 2.5
                ? $this.position().top - $('#mCSB_1').height() / 2.5 : $this;
            $this.addClass("active").siblings().removeClass("active selected");
            $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
            $this.find(".edition-target").focus();
            $("div.joinTips").remove();
            if ($this.attr("data-join") === "true" && !($this.hasClass("locked") || $this.hasClass("repeated"))) {
                $this.find("td.source-text").append(`<div class="joinTips" title="句段可合并" onclick="dealTranObj.joinFrameSentence()">
                                                        <i class="am-icon-arrows-v"></i>
                                                    </div>`);
            }
            clearContent();
            if ($this.hasClass('locked') || $this.hasClass('repeated')) {
                // $this.prev().find(".edition-target").blur();
                // $this.next().find(".edition-target").blur();
                BOM.setTransHeight();
                return false;
            }
            //保存当前译文节点到对象，排除快速操作可能出现的问题
            if (!dataConfig.sentence.ele['s'+$this.find("div.edition-target").attr('data-xlid')]){
                dataConfig.sentence.ele['s'+$this.find("div.edition-target").attr('data-xlid')] = loadPage.getHashCode(JSON.stringify(dealTextObj.styleStringToList($this.find("div.edition-target"))));
            }
            var senid = $this.attr("data-sign"),
                xlid = $this.attr("data-xlid"),
                senidNo = $this.attr("data-no"),
                fid = $this.attr("data-fid"),
                pid = $this.attr("data-pid"),
                oriTxt = $this.find(".edition-source").text(),
                transTxt = $this.find(".edition-target").text(),
                prevTxt = $this.prev().find(".edition-source").text(),
                nextTxt = $this.next().find(".edition-source").text();
            clearTimeout(tabTimer);
            tabTimer = window.setTimeout(function () {
                switch ($("input:checked[name='navPrev']")[0].id) {
                    case '_trans'://CAT
                        dealQaObj.spellingCheck(transTxt, senidNo, fid, $this.find(".edition-target").attr("data-pid"), 'cache');
                        // dealQaObj.pauseSend(transTxt, senidNo, fid, $this.find(".edition-target").attr("data-pid"), 'cache');
                        !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory($this.find(".edition-target").attr("data-wid"), $this.find(".edition-target").attr("data-pid"), $this.find(".edition-target").attr("data-fid"));
                        dealTranObj.readHistory($this.find(".edition-target").attr("data-wid"), $this.find(".edition-target").attr("data-pid"), $this.find(".edition-target").attr("data-fid"));
                        dealCatObj.getTBofResult(senid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, oriTxt);
                        dealCatObj.getMTYYQofResult(senid, dataConfig.sourceLan, dataConfig.targetLan, oriTxt, fid, $this.find(".edition-target").attr("data-wid"));
                        break;
                    case '_evaluate'://评价
                        dealQaObj.evaluateCheck(senid, fid, pid, oriTxt, transTxt);
                        dealQaObj.getEvaluateData(senid, fid, pid);
                        break;
                    case '_remarks'://备注
                        dealTranObj.showRemarkModal(this,{fileID:fid, packID:pid, wordId:senid});
                        break;
                }
                dealCatObj.getTMofResult(senid, fid, dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, oriTxt, prevTxt, nextTxt, $this,xlid);
            }, 300);
        }
    });

/*
 *  ****** 键盘事件结束 ******
*/
/*
 *   ****** click、change、oninput事件 ******
 */
   /*
    * *** 预览原、译文 ***
    */
    $('.preview-btn,.preview-translation-btn').on('click', function () {
        if (this.classList.contains("preview-btn")) { // 预览原文
            if (dataConfig.dataList.length > 1) {
                $.Alert("多文件不支持预览原文！");
                return;
            }
            // this.dataset.ajax === 'false' && dealTranObj.previewOriginal();
            if (this.dataset.ajax === 'false') {
                dealTranObj.previewSupportOriginal();
            } else {
                $('div.preview-origin').toggle();
                BOM.setTransHeight();
            }
        } else if (this.classList.contains('preview-translation-btn')) {// 预览译文
            if (dataConfig.dataList.length > 1) {
                $.Alert("多文件不支持预览译文！");
                return;
            }
            $.LoadTips('正在生成译文');
            dealTranObj.previewTranslation();
        }
    });

    //拆分句段
    $(document).on('mousedown', '.separate-btn', function (e) {
        dealTranObj.splitSentence(this);
    });
    /*
    *  *** 按钮点击集合 ***
    */
    $(document).on("click", "#search_btn,#filterClearBtn,#allSendBtn,#preDataBtn,#moreFilterBtn,.term-btn,.refuse-btn,.edit-btn,.delete-btn,.copy-btn,.refreshBtn,.merge-btn,.term_btn,.jump_to,.copy-all-btn,.lock-btn,.corpusSearch-btn,.trans-MT,.trans-TM,.help-show", function (e) {
        var classlist = this.classList;
        var ele = $('tr.table-row.active'),
            eles = $("tr.table-row.active,tr.table-row.selected");
        var changeSts = new ChangeConfirmStatus();
        if (classlist.contains('help-show')) { //帮助
            dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','其他','帮助',baseFnObj.currentLink()]);//埋点
        } else if (classlist.contains('lock-btn')) { //批量锁定
            dealTranObj.lock();
        } else if (classlist.contains('trans-MT')) {//一键翻译或MT预翻
            dealTranObj.rootTranSource();
        } else if (classlist.contains('trans-TM')){//TM预翻
            dealTranObj.tMSource();
        }else if (this.id === "moreFilterBtn") { //筛选
            localParam.pageNum = 1;
            localParam.getContentMethod = 2;
            localParam.isFirst = true;
            loadPage.filterPage(this);
        } else if (this.id === "allSendBtn") { //全部提交
            dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','编辑器','全部提交',baseFnObj.currentLink()]);//埋点
            var list = new Array();
            var link = $('script.current').attr('data-link');
            for (let i = 0; i < dataConfig.dataList.length; i++) {
                // var packid = dataConfig.dataList[i].Packid.split(',');
                var packid = dataConfig.dataList[i].Packid;
                for (let j = 0; j < packid.length; j++) {
                    var obj = new Object();
                    obj.ProjectID = dataConfig.ProjectID;
                    obj.FileID = dataConfig.dataList[i].Fileid;
                    obj.UserID = dataConfig.userID;
                    obj.PackID = packid[j];
                    obj.FilterSen = '1';
                    list.push(obj);
                }
            };
            if (link === 'ES') {
                var url = '/FileEdu/NextNoSubSen';
                $.ajax({
                    method: "post",
                    url: urls.editUrl + url,
                    dataType: "json",
                    data: { JsonStr: JSON.stringify(list),Link: link },
                    success: function (json) {
                        if (json.success) {
                            dealTranObj.confirmPackTask(this);
                        } else {
                            $.Alert(json.msg);
                        }
                    },
                    error: function (error) {
                        error.responseJSON && $.Alert("加载失败，请重试");
                    }
                });
            } else {
                dealTranObj.confirmPackTask(this);
            }
        } else if (this.id === 'preDataBtn') {//预翻过库
            dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','编辑器','预翻过库',baseFnObj.currentLink()]);//埋点
            dealTranObj.preTranLibrary(this);
        } else if (classlist.contains("copy-all-btn")) {//复制所有原文
            dealTranObj.rootCopySource();
        } else if (classlist.contains("corpusSearch-btn")) {//语料搜索
            $('.corpusSearchBtn').click();
        } else if (classlist.contains("merge-btn")) {// 合并句段
            dealTranObj.joinSentence(this);
        } else if (classlist.contains("term-btn")) {//显示：添加术语
            if (!Number(dataConfig.ImportID_TB)) {
                $.Alert('当前项目未添加更新库，无法添加术语！');
                return
            }
            showTermModal();
            $('div.add-term').toggleClass(_class);
            BOM.setTransHeight('term');
        } else if (classlist.contains("term_btn")) {//添加：添加术语
            if ($.trim($(".term_source").val()) === ""
                || $.trim($(".term_target").val()) === "") {
                $.Alert("未填写原、译文");
                return false;
            }
            $(this).attr('disabled',true)
            dealCatObj.addTerm(this);
        } else if (classlist.contains("edit-btn")) {//编辑原文
            if (ele.hasClass("locked") || ele.hasClass("repeated")) {
                $.Alert("该句段不能操作");
                return false;
            }
            var tar = ele.find(".edition-source");
            tar.attr("contenteditable", true).focus();
        } else if (classlist.contains("delete-btn")) {//删除译文
            if (dataConfig.NowLink === 'P') {
                if (eles.length === 1) {
                    if (eles.hasClass("repeated") || eles.hasClass("locked")) {
                        $.Alert("该句段不能操作");
                        return;
                    }
                    $(eles[0]).find(".edition-target").empty();
                    $("div.trans_spell").empty();
                    eles.find('td.confirm').attr({ "title": "未翻译" });
                    eles.find('td.confirm img').attr({ "src": iconsrc.yy_no, "data-iscon": "0", "title": "未翻译" });
                    dealTranObj.batchDelTarget('one');
                } else {
                    dealTranObj.batchDelTarget();
                }
            } else {
                if (ele.hasClass("repeated") || ele.hasClass("locked")) {
                    $.Alert("该句段不能操作");
                    return;
                }
                for (var i = 0, el; el = eles[i++];) {
                    var tar = $(el);
                    if (tar.hasClass("repeated") || tar.hasClass("locked")) {
                        continue;
                    }
                    tar.find(".edition-target").empty();
                }
                $("div.trans_spell").empty();
                eles.eq(0).find(".edition-target").focus();
                changeSts.multi(eles);
                changeSts = null;
            }
        } else if (classlist.contains("copy-btn")) {//复制原文
            if (eles.length === 1) { // 单个复制
                if (eles.hasClass("repeated") || eles.hasClass("locked")) {
                    $.Alert("该句段不能操作");
                    return;
                }
                let source = $(eles[0]).find(".edition-source").html();
                $(eles[0]).find(".edition-target").html(source);
                eles.eq(0).find(".edition-target").focus();
                changeSts.multi(eles);
                changeSts = null;
            } else if (eles.length > 1) { // 批量复制
                dealTranObj.batchCopySource();
            }
        } else if (classlist.contains("refuse-btn")) {//拒绝
            var ele = $('tr.table-row.selected');
            var link = $('script.current').attr('data-link'),
                packid = ele.attr('data-pid'),
                fid = ele.attr('data-fid'),
                sign = ele.attr('data-sign'),
                senid = ele.attr('data-no');
            if (ele.length < 1) {
                $.Alert('未选中句段（请点击句段编号处）');
                return;
            }
            if (ele.length > 1) {
                $.Alert('只能选择单条句段');
                return;
            }
            if (ele.hasClass("repeated") || ele.hasClass("locked")) {
                $.Alert("该句段不能操作");
                return;
            }
            dealTranObj.refuseTask([link, packid, senid, fid, sign]);
        } else if (this.id === "filterClearBtn") { //清除筛选
            dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','查找','清除筛选',baseFnObj.currentLink()]);//埋点
            $.LoadTips("正在清除筛选条件");
            clearContent();
            $(".tmTrans>tbody").empty();
            $(".updataList>tbody").empty();
            localParam.searchOringin = "";
            localParam.searchTrans = "";
            loadPage.emptyFilter()
            localParam.pageNum = 1;
            localParam.getContentMethod = 1;
            localParam.isFirst = true;
            loadPage.initPage(ele.attr("data-no"), ele.attr("data-fid"));
        } else if (this.id === "search_btn") {//右侧搜索
            var searchs = new partSearch(),
                param = searchs._init();
            if (param.txt.trim() === '') {
                $.Alert('请输入搜索内容');
                return;
            }
            $('._search .tmDetail').hide();
            $('.search-result').css({ 'height': 'calc(100% - 70px)' });
            $(".searchList>tbody").empty();
            $('.searchList').css('display', 'none');
            $(".search_result_total>font").html(0);
            dealCatObj.getMTofResult(param.source, param.target, param.txt, "", ".searchList>tbody");
            // // 调整显示顺序
            // switch ($('#type-pair').val()) {
            //     case 'tm':
            //     searchs.tmSearch(param, dataConfig.DataBaseId_TM).then(data => {
            //         $(".search_result_total>font").html(data);
            //     }).catch(err => {
            //         $.Alert("搜索失败，请重试");
            //     });
            //     break;
            //     case 'tb':
            //     searchs.tbSearch(param).then(data => {
            //         $(".search_result_total>font").html(data);
            //     }).catch(err => {
            //         $.Alert("搜索失败，请重试");
            //     });
            //     break;
            //     case 'tb1':
            //     searchs.tbSearchNew(param, dataConfig.DataBaseId_TB).then(data => {
            //         $(".search_result_total>font").html(data);
            //     }).catch(err => {
            //         $.Alert("搜索失败，请重试");
            //     });
            //     break;
            // }
            searchs.fileSen(param, searchs).then(data => {
                $(".search_result_total>font").html(data);
            }).catch(err => {
                $.Alert("搜索失败，请重试");
            });
            $('.searchList').show();
            searchs = null;
        } else if (classlist.contains("jump_to")) {//跳转到句段
            var jumpNum = document.querySelector('.jump-to').value;
            if (jumpNum.trim() === "") {
                $.Alert("请输入句段");
                return;
            }
            window.clearTimeout(jumpTimer);
            if ($("div").hasClass('my-loading')){
                $.Alert('请勿频繁操作，跳转中');
                return
            }
            window.setTimeout(function () {
                jumpToPosition(jumpNum);
            }, 500);
        }
    });

    //开始栏各按钮添加埋点
    $("div.start").on('click','button',function () {
        let operation = $(this).attr('title') ? $(this).attr('title').split('(')[0] : '';
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','开始',operation,baseFnObj.currentLink()]);//埋点
    });

    //右边tab切换，请求对应接口
    $(".nav-tabs label").on('click',function () {
        let cur = localParam.currentTabEle;
        if (cur){
            switch (this.htmlFor) {
                case '_trans'://CAT
                    // dealQaObj.pauseSend(cur.transTxt, cur.wid, cur.fid, cur.pid, 'cache');
                    dealQaObj.spellingCheck(cur.transTxt, cur.wid, cur.fid, cur.pid, 'cache');
                    !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory(cur.wid, cur.pid, cur.fid);
                    dealTranObj.readHistory(cur.wid, cur.pid, cur.fid);
                    dealCatObj.getTBofResult(cur.wid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, cur.oriTxt);
                    dealCatObj.getMTYYQofResult(cur.wid, dataConfig.sourceLan, dataConfig.targetLan, cur.oriTxt, cur.fid, cur.wid);
                    break;
                case '_evaluate'://评价
                    dealQaObj.evaluateCheck(cur.wid, cur.fid, cur.pid, cur.oriTxt, cur.transTxt);
                    dealQaObj.getEvaluateData(cur.wid, cur.fid, cur.pid);
                    break;
                case '_remarks'://备注
                    dealTranObj.showRemarkModal(this,{fileID:cur.fid, packID:cur.pid, wordId:cur.wid});
                    break;
            }
        }
    });

    //qa检查，忽略全选
    $('input[name=allIgnoreCheck]').on('click', function (e) {
        var allCheck = $('input[name=ingoreCheck]');
        for(var i = 0, len = allCheck.length; i<len; i++){
            var el = allCheck[i];
            if(!$(el).parents('.qa-tr').hasClass('hide') && !$(el).attr('disabled')){
                $(el).prop('checked', this.checked);
            }
        }
    });
    //阻止冒泡事件：颜色、预览、提交、解锁、显示QA检查
    $(document).on('click', '.color-btn,.preview-btns,.unlock-btn,.refer-btn,.header,.tmContent,.trans-all-btn', function (e) {
        e.stopPropagation();
        var offsetLeft = $(this).offset().left;
        if($(this).hasClass('color-btn')){
            $('.color-group>ul').toggle().css('left', offsetLeft + 'px');
        }else if($(this).hasClass('preview-btns')){
            $('.preview-group>ul').toggle().css('left', offsetLeft + 'px');
        }else if($(this).hasClass('unlock-btn')){
            $('.unlock-group>ul').toggle().css('left', offsetLeft + 'px');
        }else if($(this).hasClass('refer-btn')){
            $('.refer-group>ul').toggle().css('left', offsetLeft + 'px');
        }else if($(this).hasClass('header') || $(this).hasClass('tmContent')){
            $('.color-group>ul').hide();
        }else if ($(this).hasClass('trans-all-btn')) {
            $('.trans-group>ul').toggle().css('left', offsetLeft + 'px');
        }
    });
    $('.color-group,.preview-group,.unlock-group,.refer-group,ul.qa-check-list').on('click', function (e) {
        e.stopPropagation();
    });
    $('body').on('click', function (e) {
        $('.self-background').hide();
        $('.trans-group>ul').hide();
        $('.preview-group>ul').hide();
        $('.unlock-group>ul').hide();
        $('.refer-group>ul').hide();
        $('ul.qa-check-list').hide();
        $('ul.qa-isIgnore-list').hide();
        if (!($(e.target).hasClass("qa-down-span")
            || $(e.target).parent().hasClass("qa-down-span")
            || $(e.target).parents("dl").hasClass("qa-down-list")
        )) {
            $("dl.qa-down-list").remove();
        }
    });
    // 特殊字符弹框
    $('.character-btn').on('mousedown',function (){
        $('#character-modal').modal('open');
        let arr = [['№', '©', '℗', '®', '´', '£', '€', '¥', '¢', '¤'],
            ['™', '—', '¦', '§', '•', '°', '…', '‰', '⌀', 'Δ'],
            ['+', '–', '×', '⁄', '÷', '±', '≤', '≥', '≠', '≈'],
            ['“', '”', '«', '»', '„', '‟', '‘', '’', '¿', '¡'],
            ['À', 'à', 'Ç', 'ç', 'É', 'é', 'È', 'è', 'Ê', 'Ï'],
            ['Ù', 'ù', 'Æ', 'æ', 'Œ', 'œ', '', '', '', '']];
        let htmTr = '',htmTd = '';
        arr.forEach(m => {
            htmTd = '';
            m.forEach( n => {
                htmTd += `<td><button>${n}</button></td>`
            })
            htmTr += `<tr>${htmTd}</tr>`
        })
        $('.characterList').html(htmTr);
        if (!localStorage.getItem('recentlyUsed')){
            localStorage.setItem('recentlyUsed',JSON.stringify(['','','','','','','','','','']));
        }
        let used = JSON.parse(localStorage.getItem('recentlyUsed'));
        let td = '';
        used.forEach(item => {
            td += `<td><button>${item}</button></td>`;
        })
        $('.recentlyUsed').html(td);
        // 选中插入
        $('.character-modal td button').on('mousedown',function (){
            $('.character-modal tr td button').removeClass('active');
            $(this).addClass('active');
            $('#addCharacter').removeAttr('disabled');
        });
        // 双击插入
        $('.character-modal td button').on('dblclick',function (){
            $('.character-modal tr td button').removeClass('active');
            $(this).addClass('active');
            $('#addCharacter').removeAttr('disabled').mousedown().mouseup();
        });
        $('#addCharacter').attr('disabled','disabled');
        if (localStorage.getItem('isClose'))$('.isClose').prop('checked',true);
        $('.zeBtn').off().on('mousedown',function (){
            $('.isClose').prop('checked',!$('.isClose').prop('checked'));
            if ($('.isClose').prop('checked')){
                localStorage.setItem('isClose','true');
            }else {
                localStorage.removeItem('isClose')
            }
        })
    });
    // 确认插入特殊字符
    $('#addCharacter').on('mousedown',function (){
        let ele = $('.character-modal td button.active');
        if (ele.length > 0 && ele.text().trim() !== ''){
            dealCatObj.insertCharacter(this,ele.text().trim());
            let cur = JSON.parse(localStorage.getItem('recentlyUsed'));
            cur.unshift(ele.text().trim());
            for (let i = 1; i < cur.length; i++) {
                if (cur[0] === cur[i]){
                    cur.splice(i,1);
                    break;
                }
            }
            if (cur.length > 10){
                cur.splice(-1,1)
            }
            localStorage.setItem('recentlyUsed',JSON.stringify(cur));
            let used = JSON.parse(localStorage.getItem('recentlyUsed'));
            used.forEach((item,i) => {
                $('.recentlyUsed button').eq(i).text(item)
            })
            if ($('.recentlyUsed button.active').length > 0){
                $('.character-modal button').removeClass('active');
                $('.recentlyUsed button').eq(0).addClass('active');
            }
        }else {
            $.Alert('请选择');
        }
    });
    // 特殊字符弹框关闭事件处理
    $('#character-modal').on('close.modal.amui', function(){
        let range, userSelection,targetEl;
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.rangeCount === 0)return;
        range = userSelection.getRangeAt(0);
        targetEl = $(range.endContainer);
        if (targetEl.parents('td').hasClass('active-text') && targetEl.parents('td').find('div').attr('contenteditable')){
            if (targetEl.parents('td').hasClass('source-text')){
                $('#edition-area tr.active div.edition-source').focus();
            }else {
                $('#edition-area tr.active div.edition-target').focus();
            }
        }
    });

    //QA是否忽略
    $('.qa-isIgnore').on('click', function (e) {
        e.stopPropagation();
        $('ul.qa-isIgnore-list').toggle();
    });
    $('.qa-name').on('click', function (e) {
        e.stopPropagation();
        $('ul.qa-check-list').toggle();
        $("dl.qa-down-list").remove();
    });
    $('#language-pair').on('change', function () {
        var source = this.value.slice(0, 4);
        var nm = this.dataset.nm;
        +nm > 0 && (source === dataConfig.sourceLan ? $.Tips('按原文搜索') : $.Tips('按译文搜索'));
        $(this).attr('data-nm','1');
    });

    //替换：选中提示信息
    $("button[name='exc_more_btn'],input[name='exc_options'],.exc_position").on("click", function () {
        var txtStr = "";
        var select = document.querySelector(".exc_position"),
            selTxt = select.options[select.options.selectedIndex].text;
        var checkbox = $("input[name='exc_options']");
        txtStr += selTxt + "，";
        for (var i = 0, len = checkbox.length; i < len; i++) {
            if (checkbox[i].checked) {
                txtStr += $(checkbox[i]).parent().text() + "，";
            }
        }
        $(".exc_options").removeClass("add_hidden");
        $(".exc_options>div").html(txtStr.substring(0, txtStr.length - 1));
    });
    //设置原、译文宽度变化
    $("#icon-plus,#icon-minus").on("click", function () {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','编辑器','原文列加宽/缩小',baseFnObj.currentLink()]);//埋点
        var container = document.querySelector('th.source-text'),
            now = +container.dataset.now,
            sizeList = JSON.parse(container.getAttribute('data'));
        now === 10 && (container.dataset.now = 10);
        now === 0 && (container.dataset.now = 0);
        this.id === "icon-plus" ? now++ : now--;
        if (now === -1 || now === 11) return;
        container.dataset.now = now;
        $("th.source-text, td.source-text,.init-row-source").css("width", sizeList[now] + "%");
    });
    //添加自定义颜色
    $(document).on("change", ".self-color", function () {
        var classlist = this.classList;
        var _this = this.value;
        operateText.customStyleEntry(_this, 'cl');
        $(".jscolor-btn-close").mousedown().mouseup(); // 隐藏调色盘
        $('.self-background').hide();
    });
    // 背景色
    $('.self-background button').on("click", function () {
        operateText.customStyleEntry(this.value, 'bg');
        $('.self-background').hide();
    });

/*
 * ****** click、change、input事件结束 ******
*/
    //取消右键
    // $("table.searchList,table.transList").on("contextmenu", function () {
    //     return false;
    // });
    /*
    ****** 操作原、译文句段 ******
  */
    $("table#edition-list").on("mousedown", function (event) {
        var e = event || window.event;
        var tarEle = $(e.target).parents("tr.table-row");

        //获取焦点
        if (e.target.classList.contains("target-text") || e.target.classList.contains("edition-target")) {
            if (!($(e.target).parents('tr').hasClass('locked')
                || $(e.target).parents('tr').hasClass('repeated'))) {
                // var el = $(e.target).find("div.edition-target");
                var el = $(e.target).parents('tr').find("div.edition-target");
                localParam.currentTarget = $(e.target);
                // el.focus();
            }
        }
        //点击句段添加active
        if (!tarEle.hasClass("active") && !$(e.target).hasClass("s-no")) {
            var $tarRow = $("tr.table-row"),
                $tarList = $(".edition-source");
            $tarRow.removeClass("selected active");
            tarEle.addClass("active");
            $tarList.removeAttr("contenteditable");
            $("body").attr("data-active", $.trim(tarEle.find("td.s-no").text()));
            $("div.joinTips").remove();
            if (tarEle.attr("data-join") === "true" && !(tarEle.hasClass("locked") || tarEle.hasClass("repeated"))) {
                tarEle.find("td.source-text").append(`<div class="joinTips" title="句段可合并" onclick="dealTranObj.joinFrameSentence()">
                                                        <i class="am-icon-arrows-v"></i>
                                                    </div>`);
            }
        }
        //CAT入口
        if (e.target.classList.contains("target-text") || e.target.classList.contains("edition-target") || $(e.target).parent('div').hasClass('edition-target')) {
			//判定是否填充译文
			let fill = false;
			if (!$(e.target).parents('tr').find('td.target-text').text().trim().length){
				fill = true;
			}
            var ele = e.target.classList.contains("target-text")
                ? $(e.target)
                : $(e.target).parents("td.target-text");
            if (document.body.dataset.change
                && document.body.dataset.change === $(ele).parents('tr').attr('data-no')) return;
            classOperation.clearContent();
            $('.tmTrans>tbody').empty();
            $('body').attr('data-change', $(ele).parents('tr').attr('data-no'));
            if (tarEle.hasClass('locked') || tarEle.hasClass('repeated')) {
                BOM.setTransHeight();
                return;
            }
            //保存当前译文节点到对象，排除快速操作可能出现的问题
            if (!dataConfig.sentence.ele['s'+ele.find("div.edition-target").attr('data-xlid')]){// 防止连续点击同一个替换已保存的
                dataConfig.sentence.ele['s'+ele.find("div.edition-target").attr('data-xlid')] = loadPage.getHashCode(JSON.stringify(dealTextObj.styleStringToList(ele.find("div.edition-target"))));
            }
            var oriTxt = $(ele).prev().find(".edition-source").text(),
                transTxt = $(ele).find(".edition-target").text(),
                senid = $(ele).parents("tr").attr("data-sign"),
                xlid = $(ele).parents("tr").attr("data-xlid"),
                senidNo = $(ele).parents("tr").attr("data-no"),
                prevTxt = $(ele).parent().prev().find(".edition-source").text(),
                nextTxt = $(ele).parent().next().find(".edition-source").text();
            window.clearTimeout(catEntryTimer);
            catEntryTimer = window.setTimeout(function () {
                var wid = $(ele).find(".edition-target").attr("data-wid"),
                    fid = $(ele).find(".edition-target").attr("data-fid"),
                    pid = $(ele).find(".edition-target").attr("data-pid");
                // 查询备注
                $("#addRemarkBtn").attr({'data-org':wid,'data-fid':fid,'data-pid':pid});
                localParam.currentTabEle = {pid:pid,fid:fid,wid:wid,oriTxt:oriTxt,transTxt:transTxt,
                    prevTxt:prevTxt,nextTxt:nextTxt,tr:$(ele).parents('tr'),xlid:xlid,fill:fill};//点击译文后切换右边tab用
                let isCat = true;
                !$('#_quality').prop('checked') && !$('#_evaluate').prop('checked') && (
                    $('label._trans').click(),
                    isCat = false,
                    $(ele).find(".edition-target").focus()
                );
                // 含点击和按键
                switch ($("input:checked[name='navPrev']")[0].id) {
                    case '_trans'://CAT
                        if (isCat){
                            // dealQaObj.pauseSend(transTxt, senidNo, fid, pid, 'cache');
                            dealQaObj.spellingCheck(transTxt, senidNo, fid, pid, 'cache');
                            !$('.update_insert').attr('data-toggle') && dealTranObj.updateHistory(wid, pid, fid);
                            dealTranObj.readHistory(wid, pid, fid);
                            dealCatObj.getTBofResult(senid, dataConfig.DataBaseId_TB, dataConfig.percentge, dataConfig.number, oriTxt);
                            dealCatObj.getMTYYQofResult(senid, dataConfig.sourceLan, dataConfig.targetLan, oriTxt, fid, wid);
                        }
                        break;
                    case '_evaluate'://评价
                        dealQaObj.evaluateCheck(wid, fid, pid, oriTxt, transTxt);
                        dealQaObj.getEvaluateData(wid, fid, pid);
                        break;
                    case '_remarks'://备注
                        dealTranObj.showRemarkModal(this,{fileID:fid, packID:pid, wordId:wid});
                        break;
                }
                dealCatObj.getTMofResult(senid, fid, dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, oriTxt, prevTxt, nextTxt, $(ele).parents('tr'),xlid,fill);
            }, 300);
        }
    });
    // 不一致弹窗表格点击事件
    $("table#atypism-list").on("mousedown", function (event) {
        var e = event || window.event;
        var tarEle = $(e.target).parents("tr.inconsistent"),
            fid = tarEle.attr("data-fid"),
            sid = tarEle.attr("data-no");
        classOperation.jumpToPosition(sid, fid)
    });
    /*
        * @description 初始化插入标签、标签插入，鼠标左键插入
        * @param type: 类型
        * @param id: id
        * @param num: 序号
    */
    $('table#edition-list').on('click', 'div.edition-source>.tagWrap', function (e) {
        var _this = this;
        if ($(_this).parents('tr').hasClass('locked') || $(_this).parents('tr').hasClass('repeated')) {
            return false;
        }
        if ($(_this).hasClass('end')) {
            $.Alert('请点击标签对左侧标签数字插入');
            return
        }
        window.clearTimeout(insertTimer);
        insertTimer = window.setTimeout(function () {
            var id, type;
            var parentTr = $(_this).parents('tr'),
                targetEle = parentTr.find('.edition-target');
            type = _this.className.split(' ')[1];
            id = _this.dataset.db;
            for (let j = 0; j < targetEle.contents().length; j++) {
                var node = targetEle.contents()[j];
                if (node.nodeName == 'SPAN' && $(node).hasClass('tagWrap') && $(node).attr('data-db') == id) {
                    $.Alert('此标签在译文中已存在！');
                    return false;
                }
            }
            operateText.insertTagEntry(type, parentTr, _this);
        }, 50);
    });

    /*
       ******
       ****** table#edition-list添加mousemove事件
       ******
    */
    $('table#edition-list').off('mousemove').on('mousemove', function (event) {

        var e = event || window.event;
        var ele = e.target || e.srcElement;
        $('.termContainer').remove();
        //查找Q元素（术语匹配）,复制、插入术语
        if (ele.nodeType === 1 && (ele.nodeName === 'Q' || ele.nodeName === "U" && ele.parentNode.nodeName === "Q")) {
            var termOriginWord = ele.innerText,
                termTransData = {};
            var targetEl = $(ele).parents('tr.table-row').find('td.termHiddenContainer'),
                termData = targetEl.html() && JSON.parse(targetEl.html());
            for (let i = 0, len = termData.length; i < len; i++) {
                var item = termData[i];
                if (item.rText.toLowerCase().replace(/&amp;/g,'&') === termOriginWord.toLowerCase()) {
                    termTransData = item;
                    break;
                }
            }
            if (termTransData.tText) {
                var termDiv = "";
                var txt = termTransData.tText;
                var _size = +$(ele).parents('span.fontText').css('font-size').slice(0,-2),
                    _left = $(ele).offset().left + "px",
                    _top = $(ele).offset().top + _size + 2 + "px";
                termDiv = `<div class="termContainer" style="left:${_left};top:${_top};">
                            <ul>
                                <li><span class="rtext" title="${termTransData.tText}">${termTransData.tText}</span> <span onmousedown="dealCatObj.insertTbWord('', '', this)">插入</span><span onclick="classOperation.copyTermWord(this)">复制</span></li>
                                <li class="over1">来源：<span>${termTransData.base||''}</span></li>
                                <li>类型：<span>${termTransData.remark||''}</span></li>
                                <li class="over2">备注：<span><span title="${termTransData.note}">${termTransData.note||''}</span></span></li>
                            </ul>
                          </div>`;
                $('body').append(termDiv);
            }
        }

        var parent, parentNext, parentPrev, tagNodes;
        var _id, _no;
        $(ele).parents('tbody').find('span.tagWrap').removeAttr('style');
        if (ele.nodeType === 1 && ele.nodeName === 'IMG' && ele.classList.contains('tag')) {
            parent = ele.parentNode;
            tagNodes = $(ele).parents('div.edition-target,div.edition-source').contents().filter('span.tagWrap.double').not(parent);
            for (let i = 0, len = tagNodes.length; i < len; i++) {
                _id = parent.dataset.db;
                _no = parent.dataset.no;
                if ($(tagNodes[i]).has('img').length > 0 && tagNodes[i].dataset.db === _id && tagNodes[i].dataset.no === _no) {
                    $(tagNodes[i]).css('opacity', '0.7');
                }
            }
        }
    });

    /*
     * ***** 搜索table绑定事件 ******
    */
    //右键插入
    $("table.searchList").on('mousedown', function (event) {
        var e = event || window.event;
        if (e.which === 3 && e.target.nodeName === "SPAN" && e.target.classList.contains('tbWrap')) {
            var id = e.target.dataset.id,
                txt = e.target.dataset.txt;
            dealCatObj.insertTbWord(id, txt);
        }
    });
    //双击复制
    $("table.searchList").on('dblclick', function (event) {
        var e = event || window.event;
        if (e.target.nodeName === "TD" && e.target.classList.contains('trans')) {
            var activeTr = $('tr.table-row.active'),
                senId = activeTr.attr('data-no'),
                targetDiv = activeTr.find('div.edition-target'),
                sourceDivCnts = activeTr.find('div.edition-source').clone().contents();
            var changeSts = new ChangeConfirmStatus();
            var txt = e.target.innerText,
                id = $(e.target).parent().attr('data-db'),
                percent = $(e.target).attr("data-tm");
            if (e.target.classList.contains('catTrans')) {
                targetDiv.html(dealCatObj.fastCopyStyle(sourceDivCnts, txt)).focus();
                changeSts.single(activeTr.find('td.confirm'));
                changeSts.single(targetDiv);
            }
        }
    });

    /*
   *  ***** CAT table绑定事件 *****
   */
    //右键插入“术语”
    $("table.transList").on('mousedown', function (event) {
        var e = event || window.event;
        if (e.which === 3 && e.target.nodeName === "SPAN" && e.target.classList.contains('tbWrap')) {
            var id = e.target.dataset.id,
                txt = e.target.dataset.txt;
            dealCatObj.insertTbWord(id, txt);
        }
    });
    //双击复制“TM库”结果
    $("table.tmTrans").on('dblclick', function (event) {
        var e = event || window.event;
        if (e.target.nodeName === "TD" && e.target.classList.contains('catTrans')) {
            var tarList = $("tr.table-row"),
                changeSts = new ChangeConfirmStatus();
            var senID = e.target.getAttribute("data"),
                fid = e.target.getAttribute("data-fid"),
                tmPercent = e.target.getAttribute("data-tm"),
                nextTxt = $(e.target).next().text();
            for (var j = 0, len = tarList.length; j < len; j++) {
                var _this = tarList[j],
                    _senID = _this.getAttribute("data-sign"),
                    _fid = _this.getAttribute("data-fid"),
                    targetDiv = $(_this).find("div.edition-target"),
                    sourceDivCnts = $(_this).find('div.edition-source').clone().contents();
                if (senID === _senID && fid === _fid) {
                    var scrollToPosi = $(_this).position().top > $('#mCSB_1').height() / 2.5
                        ? $(_this).position().top - $('#mCSB_1').height() / 2.5 : $(_this);
                    if (tmPercent) {
                        targetDiv.attr({ "data-mne": "true", "data-tm": tmPercent }).html(dealCatObj.fastCopyStyle(sourceDivCnts, nextTxt));
                        $(_this).find("td.status>font").html(tmPercent + "%");
                    } else {
                        targetDiv.html(dealCatObj.fastCopyStyle(sourceDivCnts, nextTxt));
                        $(_this).find("td.status>font").html("0%");
                    }
                    targetDiv.focus();
                    $(_this).addClass("active").siblings().removeClass("active selected");
                    $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                    changeSts.single(targetDiv);
                    return;
                }
            }

        }
    });
    // 双击复制“MTYYQ”结果
    $(".catTransMT").on('dblclick', function (event) {
        var e = event || window.event;
        if (e.target.nodeName === "TD" && e.target.classList.contains('catTrans')) {
            dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','其他','LanMT译文引用',baseFnObj.currentLink() + '-' + dataConfig.LangTypePair]);//埋点
            var tarList = $("tr.table-row"),
                changeSts = new ChangeConfirmStatus();
            var senID = e.target.getAttribute("data"),
                fid = e.target.getAttribute("data-fid"),
                wid = e.target.getAttribute("data-wid"),
                orgTxt = $(e.target).parents().find('tr>td.origin').text(),
                nextTxt = $(e.target).next().text();
            for (var j = 0, len = tarList.length; j < len; j++) {
                var _this = tarList[j],
                    _senID = _this.getAttribute("data-sign"),
                    _fid = _this.getAttribute("data-fid"),
                    targetDiv = $(_this).find("div.edition-target"),
                    sourceDivCnts = $(_this).find('div.edition-source').clone().contents();
                if (senID === _senID && fid === _fid) {
                    var scrollToPosi = $(_this).position().top > $('#mCSB_1').height() / 2.5
                        ? $(_this).position().top - $('#mCSB_1').height() / 2.5 : $(_this);
                    targetDiv.attr({"data-tm": '0' }).html(dealCatObj.fastCopyStyle(sourceDivCnts, nextTxt));
                    $(_this).find("td.status>font").html("0%");
                    targetDiv.focus();
                    $(_this).addClass("active").siblings().removeClass("active selected");
                    $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                    changeSts.single(targetDiv);
                    dealCatObj.confirmMTTranslation(wid, orgTxt, nextTxt, nextTxt, fid, 1);
                    return;
                }
            }

        }
    });
    /*
        ******** QA table事件绑定：鼠标单击 ********
    */
    $("tbody.qaList").on("click", function (event) {
        var e = event || window.event;
        if (e.target.nodeName === "TD" && e.target.classList.contains("clickTd")) {
            var tr = $(e.target).parents('tr.qa-tr'),
                fid = tr.attr("data-fid"),
                sid = tr.attr("data-id");
            var list = new Array();
            for (let i = 0; i < dataConfig.dataList.length; i++) {
                // var packid = dataConfig.dataList[i].Packid.split(',');
                var packid = dataConfig.dataList[i].Packid;
                for (let j = 0; j < packid.length; j++) {
                    var obj = new Object();
                    obj.ProjectID = dataConfig.ProjectID;
                    obj.FileID = dataConfig.dataList[i].Fileid;
                    obj.UserID = dataConfig.userID;
                    obj.PackID = packid[j];
                    list.push(obj);
                }
            };
            var link = $('script.current').attr('data-link');
            if (link !== 'ES') {
                classOperation.jumpToPosition(sid, fid, tr[0], 'isQA');
            } else {}
            if (tr.attr("data-sen") !== 'null') {
                var tarEl = $('.atypism-sentence');
                tr.attr("tooltips").indexOf('不一致检查') >= 0 ? tarEl.hasClass('add_hidden') && tarEl.removeClass('add_hidden') : tarEl.addClass('add_hidden');
                // var list = [];
                var obj = new Object();
                obj.ProjectID = dataConfig.ProjectID;
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = tr.attr("data-comparFileId").toString();
                obj.UserID = dataConfig.UserID;
                obj.FilterSen = tr.attr("data-sen").toString();
                obj.Link = $('script.current').attr('data-link');
                // list.push(obj);
                $.ajax({
                    type: "post",
                    url: urls.editUrl + "/File/SomeSenSel",
                    dataType: "json",
                    data: JSON.stringify(obj),
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $.LoadTips('句段获取中');
                    },
                    success: function (res) {
                        var json = res.data;
                        if (json) {
                            $("#atypismSen").empty();
                            let arr = [];
                            arr.push(json);
                            loadPage.handleDataFnc(arr, 1, 1);
                        }
                    },
                    complete: function () {
                        $(".init-page-modal").remove();
                        $(".loading-modal").remove();
                        $(".my-loading").remove();
                    }
                });
            } else {
                var tarEl = $('.atypism-sentence');
                tarEl.addClass('add_hidden');
            }
        }
        if (e.target.nodeName === 'SPAN' && e.target.classList.contains("qa-down-span")
            || e.target.nodeName === "I" && e.target.parentNode.classList.contains("qa-down-span")) {
            var el = e.target.nodeName === "I" ? e.target.parentNode : e.target;
            var left = $(el).offset().left,
                top = $(el).offset().top;
            var msg = $(el).next("input").val(),
                id = $(el).next("input").attr("data-id"),
                fid = $(el).next("input").attr("data-fid"),
                pid = $(el).next("input").attr("data-pid"),
                checkParam = $(el).next("input").attr("data-checkParam"),
                check = $(el).next("input").attr('data-check'),
                fileName = $(el).next("input").attr('data-fileName'),
                checkLevel = $(el).next("input").attr('data-checkLevel');
            var idx = $(el).parents("tr.qa-tr").index();
            var strA = '';
            if (check == '拼写检查' || check == '术语检查') {
                strA = `<dd><label><input type="checkbox" value='${msg}' data-id="${id}" data-fid="${fid}" data-pid="${pid}" data-check="${checkParam}" data-checkName="${check}" data-fileName="${fileName}" data-checkLevel="${checkLevel}" onclick="dealQaObj.ignoreQAResultAll(this,${idx})"/>全部忽略</label></dd>`
            } else {
                strA = '';
            }
            var dlStr = `<dl class="qa-down-list" style="left:${left - 8}px;top:${top + 24}px">
                            <dd>
                                <label><input type="checkbox" value='${msg}' data-id="${id}" data-fid="${fid}" data-pid="${pid}" data-check="${checkParam}" data-checkName="${check}" data-fileName="${fileName}" data-checkLevel="${checkLevel}" onclick="dealQaObj.ignoreQAResult(this,${idx})"/>忽略此项</label>
                            </dd>
                            ${strA}
                        </dl>`;
            $("dl.qa-down-list").remove();
            $("body").append(dlStr);
        }
    })
    /*
        ****** 滚动事件：加载数据 ******
    */
    $(".trans_container").mCustomScrollbar({
        mouseWheelPixels: 50,
        scrollInertia: 0,
        callbacks: {
            onScroll: function () { //滚动加载数据
                if (!localParam.isGetContent)return;
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    if ($("tr.init-row").length > 0) {
                        var toTop = document.querySelector(".trans_title").getBoundingClientRect().bottom,
                            toBottom = document.querySelector(".trans_container").getBoundingClientRect().bottom,
                            toPos = toBottom,
                            initTrs = $("tr.init-row");
                        for (var i = 0, initTr; initTr = initTrs[i++];) {
                            var tr = $(initTr);
                            if (tr.offset().top < toPos && (tr.offset().top + tr.height()) > toPos / 4) {
                                localParam.pageNum = Number(tr.attr("data-page"));
                                $.LoadTips("正在加载数据...");
                                $("body").append(`<div class="zeZhao"></div>`);
                                localParam.currentTarget && localParam.currentTarget.blur();
                                localParam.currentTarget = null;
                                switch (localParam.getContentMethod) {
                                    case 1:
                                        loadPage.initPage('','',tr);
                                        break;
                                    case 2:
                                        loadPage.filterPage('',tr);
                                        break;
                                    case 3:
                                        mainSearch.doSearch('','',tr);
                                        break;
                                    case 4:
                                        dealTranObj.replaceLookup('',tr);
                                        break;
                                }
                                $(".trans_container").mCustomScrollbar("update");
                                // if (isJump) {
                                //     var target = $("tr.table-row.active");
                                //     var scrollToPosi = target.length > 0 && (target.position().top - $('#mCSB_1').height() / 2.5);
                                //     $(".trans_container").mCustomScrollbar("scrollTo", scrollToPosi);
                                //     isJump = false;
                                // }
                                return false;
                            }
                        }
                    }
                }, 150);
            }
        }
    });


    return {
        copyTermWord: copyTermWord,
        firstCaseSensitive: firstCaseSensitive,
        clearContent: clearContent,
        jumpToPosition: jumpToPosition,
        findSentence: findSentence,
        getCheckedList: getCheckedList,
        scrollNextSentence: scrollNextSentence,
        scrollToNoConfirmSentence: scrollToNoConfirmSentence
    }
})(jQuery);

/*
*
* 构造函数：改变句段状态
* single -> 单句
* multi -> 多句
*
* */
function ChangeConfirmStatus() { }
Object.defineProperty(ChangeConfirmStatus.prototype, "constructor", {
    value: ChangeConfirmStatus
});
ChangeConfirmStatus.prototype.single = function (_this) {
    var confirmTd = $(_this).parent().next('td.confirm'),
        link = $('script.current').attr('data-link');
    switch (link) {
        case 'T':
            confirmTd.find('img').attr('src', iconsrc.yy_no);
            confirmTd.attr({ "data-iscon": "0", "title": "未翻译" });
            break;
        case 'ES':
            confirmTd.find('img').attr('src', iconsrc.yy_no);
            confirmTd.attr({ "data-iscon": "0", "title": "未翻译" });
            break;
        case 'C':
            confirmTd.find('img').attr('src', iconsrc.sh_no);
            confirmTd.attr({ "data-iscon": "2", "title": "未审核" });
            break;
        case 'Q':
            confirmTd.find('img').attr('src', iconsrc.qa_no);
            confirmTd.attr({ "data-iscon": "4", "title": "QA中" });
            break;
        case 'P':
            confirmTd.find('img').attr('src', iconsrc.pm_no);
            confirmTd.attr({ "data-iscon": "-1", "title": "PM修改中" });
            break;
    }
    $(_this).removeAttr("toolformat data-mne");
    $(_this).parents("tr").attr("data-true", "");
}
ChangeConfirmStatus.prototype.multi = function (tarList) {
    var link = $('script.current').attr('data-link');
    tarList.toArray().forEach(function (ele) {
        var tar = $(ele).find('td.confirm');
        switch (link) {
            case 'T':
                tar.find('img').attr('src', iconsrc.yy_no);
                tar.attr({ "data-iscon": "0", "title": "未翻译" });
                break;
            case 'ES':
                tar.find('img').attr('src', iconsrc.yy_no);
                tar.attr({ "data-iscon": "0", "title": "未翻译" });
                break;
            case 'C':
                tar.find('img').attr('src', iconsrc.sh_no);
                tar.attr({ "data-iscon": "2", "title": "未审核" });
                break;
            case 'Q':
                tar.find('img').attr('src', iconsrc.qa_no);
                tar.attr({ "data-iscon": "4", "title": "QA中" });
                break;
            case 'P':
                tar.find('img').attr('src', iconsrc.pm_no);
                tar.attr({ "data-iscon": "-1", "title": "PM修改中" });
                break;
        }
        $(ele).removeAttr("data-mne");
        $(ele).parents("tr").attr("data-true", "");
    });
}

