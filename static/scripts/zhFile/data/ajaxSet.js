/*
 * 该文件主要是ajax请求
 * 主要包含基本方法、处理原\译文样式、CAT、QA相关、编辑区等各类对象
 * author: zhaoyong
*/

/*
    **** 基础对象 ***
*/
var baseFnObj = (function (window, document, $) {

    //帮助信息
    if (sessionStorage.getItem('UseHelpMsg')){
        showHelpMsg(JSON.parse(sessionStorage.getItem('UseHelpMsg')));
    }else {
        $.ajax({
            method: "get",
            url: urls.editUrl + "/ParameterSet/UseHelpMsg",
            dataType: "json",
            success: function (res) {
                if (res.success) {
                    sessionStorage.setItem('UseHelpMsg', JSON.stringify(res.data));
                    showHelpMsg(res.data);
                }
            }
        });
    }
    function showHelpMsg(arr) {
        let container = document.getElementById('helpList'),
            html = "";
        arr.forEach(item => {
            html += `<tr>
                                <td>${item.Number}</td>
                                <td>${item.FunctionName}</td>
                                <td>${item.Shorcutkeys}</td>
                                <td width="200">${item.Description}</td>
                            </tr>`;
        });
        container.innerHTML = html;
    }

    return {
        triangle: triangle,
        query: queryEle,
        currentLink
    }

    //加载备注
    function triangle(title, status, message) {
        return `<div class="triangle" 
                    data-foco="false"
                    onclick="event.stopPropagation();dealTranObj.showRemarkModal(this)"
                    title="${title}" 
                    data-sts="${status}" 
                    data-mes="${message}"><i class="am-icon-info"></i>
                </div>`;
    }

    //获取DOM
    function queryEle(obj) {
        return document.querySelector("." + obj);
    }

    //获取当前角色
    function currentLink() {
        let link = $('script.current').attr('data-link'),currentLink;
        switch (link){
            case 'T':
                currentLink = '翻译';
                break;
            case 'C':
                currentLink = '审校';
                break;
            case 'Q':
                currentLink = 'QA';
                break;
            case 'P':
                currentLink = 'PM';
                break;
        }
        return currentLink;
    }

})(window, document, jQuery);

/*
   **** object：加载、发送原译文内容 ****
*/
var dealTextObj = (function (window, document, $) {

    return {
        creatTag,
        listToStyleString,
        styleStringToList,
        matchTerm
    }

    /*
        处理span的class，获取样式对
        @param: element, array
    */
    function dealClass(ele, arr) {
        var classList = [];
        arr.map((item, index) => {
            if (item != 'fontText') {
                var [Class, ClassValue] = ['', 'True'];
                switch (item.toLowerCase()) {
                    case "fontbold":
                        Class = 'Bold';
                        break;
                    case "fontitatic":
                        Class = "Italic";
                        break;
                    case "fontsubscript":
                        Class = "Subscript";
                        break;
                    case "fontsupscript":
                        Class = "Superscript";
                        break;
                    case "fontstrike":
                        Class = "Strike";
                        break;
                    case "fontunder":
                        Class = "Underline";
                        ClassValue = "Single";
                        break;
                    case 'fonthighbg':
                        Class = 'Highlight';
                        ClassValue = ele.getAttribute('data-bg');
                        break;
                    case 'fontcolor':
                        Class = 'Color';
                        ClassValue = ele.getAttribute('data-cl');
                        break;
                    case 'fontsize':
                        Class = 'Fontsize';
                        ClassValue = ele.getAttribute('data-sz');
                        break;
                    case 'fontstyle':
                        Class = 'TypeFace';
                        ClassValue = ele.getAttribute('data-fs');
                        break;
                }
                ClassValue.replace(/%/g, '%25');
                classList.push({Key: Class, Value: decodeURIComponent(ClassValue)});
            }
        });
        return classList;
    }

    /*
        处理json转为class
        @param: visualTag
    */
    function dealJson(param) {
        var [Class, Style, Data] = ['', '', ''];
        switch (param.Key.toLowerCase()) {
            case "bold":
                Class = "fontBold";
                break;
            case "italic":
                Class = "fontItatic";
                break;
            case "underline":
                Class = "fontUnder";
                break;
            case "subscript":
                Class = "fontSubscript";
                break;
            case "superscript":
                Class = "fontSupscript";
                break;
            case "strike":
                Class = "fontStrike";
                break;
            case "highlight":
                Class = "fontHighBg";
                Style = "background:#" + param.Value + ";";
                Data = `data-bg="${param.Value}"`;
                break;
            case 'color':
                Class = "fontColor";
                Style = "color:#" + param.Value + ";";
                Data = `data-cl="${param.Value}"`;
                break;
            case 'fontsize':
                Class = "fontSize";
                Style = "font-size:" + param.Value + "px;";
                Data = `data-sz="${param.Value}"`;
                break;
            case 'typeface':
                Class = "fontStyle";
                if (param.Value && (param.Value.indexOf('"') > -1 || param.Value.indexOf("'") > -1)) {
                    // Style = "font-family:" + encodeURIComponent(param.Value) + ";";
                    Data = `data-fs="${encodeURIComponent(param.Value)}"`;
                } else {
                    // Style = "font-family:" + param.Value + ";";
                    Data = `data-fs="${param.Value}"`;
                }
                break;

            default:
                Class = param.Key;
        }
        return [Class, Style, Data];
    }

    //创建标签
    function creatTag(tag, param, url) {
        var title = "", titleList = [];
        if (param.title && typeof param.title === 'object') {
            titleList = param.title;
            titleList.forEach((item) => {
                var key, val;
                key = item.Key;
                val = item.Value;
                title += key + ":" + val + "; ";
            });
        }
        var defaul = {
            startTag: `<span class="tagWrap double start" 
                            data-db="${param.id}"
                            data-fw="${param.fw}" 
                            data-no="${param.txt}" 
                            data-notag="${param.notag}"><img class="tag" title="${title}" src="/public/images/tag-${param.txt}-01.png"/></span>`,
            endTag: `<span class="tagWrap double end" 
                            data-db="${param.id}"
                            data-fw="${param.fw}" 
                            data-no="${param.txt}"><img class="tag" src="/public/images/tag-${param.txt}-02.png"/></span>`,
            singleTag: `<span class="tagWrap single" 
                            data-db="${param.id}"
                            data-fw="${param.fw}" 
                            data-notag="${param.notag}"><img class="tag" title="${param.title}" src="${url}"/></span>`
        }
        return defaul[tag];
    }

    //包含['*','(',')','?','+','\','^','$']字符时，不匹配高亮
    function filterStr(str) {
        if (str.indexOf('^') > -1 ||
            str.indexOf('$') > -1 ||
            str.indexOf('*') > -1 ||
            str.indexOf('(') > -1 ||
            str.indexOf(')') > -1 ||
            str.indexOf('+') > -1 ||
            str.indexOf('?') > -1 ||
            str.indexOf('\\') > -1) {
            return false;
        }
        return true;
    }

    //匹配搜索（不区分大小写）
    function matchSearch(txt, reg) {
        txt = txt.replace(/&lt;|&lt/g, "<").replace(/&gt;|&gt/g, ">");//防止搜索lt或gt时出现异常
        var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
            regCn = /[·！#￥（—）：；“”‘、，|《。》？【】[\]]/im;
        if (regEn.test(reg) || regCn.test(reg)) {
            txt = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return txt;
        }
        var allStr = "";
        var splitArr = [],
            matchArr = [];
        try {
            splitArr = txt.split(new RegExp(reg, 'i'));
            matchArr = txt.match(new RegExp(reg, 'ig'));
        } catch (err) {
            splitArr = txt.split(reg);
            matchArr = txt.match(reg);
        }
            splitArr.forEach(function (item, index) {
                item = item.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                if (matchArr && matchArr[index]) {
                    var temp = "<em class='mark'>" + matchArr[index] + "</em>";
                    allStr += (item + temp);
                } else {
                    allStr += item;
                }
            });
        return allStr;
    }

    //匹配TB标记，return匹配的字符串
    function matchTerm(txt, tbArr) {
        var list = tbArr,
            text = txt;
        list.forEach((item) => {
            var reg = null;
            var repTxt = item.rText;
            try {
                reg = new RegExp(repTxt.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'ig');
            } catch (err) {
                reg = repTxt;
            }
            //不匹配<Q>、<q>等类型，包括其子字符串
            if (item.rText && !/^([\<\/]*[qQ]?[\>]*)$/.test(item.rText)) {
                text = text.replace(reg, function (matchWord, index) {
                    if (dataConfig.sourceLan.toLowerCase() === "enus") {
                        var isChar = /[a-zA-Z]/;
                        var prev = text.slice(index - 1, index),
                            next = text.slice(index + matchWord.length, index + matchWord.length + 1);
                        if (prev !== "" || next !== "") {
                            if (!isChar.test(prev) && !isChar.test(next)) {
                                return "<Q>" + matchWord + "</Q>";
                            } else {
                                return matchWord;
                            }
                        } else {
                            if (txt === matchWord) {
                                return "<Q>" + matchWord + "</Q>";
                            }
                            return matchWord;
                        }
                    } else {
                        return "<Q>" + matchWord + "</Q>";
                    }
                });
            }
        });
        return text;
    }

    /*
        @description: 处理原译文，带可视化样式的字符串
        @params：YYQTagOrTextList
    */
    function listToStyleString(data, isspace, mark, termList) {
        data = data || [];
        mark = mark || {};
        mark.txtAddBg = mark.txtAddBg || "";
        mark.case = !document.getElementById("caseSensitive").checked;
        var [html, tag, tagNum, tagFlag] = ["", "", 0, false];
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].IsPair) {
                if (data[i].IsStartTag) {
                    var dealSty = dealJson,
                        flagTag = false;
                    [tag, tagFlag] = ["", false];
                    for (var m = 0; m < data.length; m++) {
                        if (data[i].ID == data[m].ID && !data[m].IsStartTag) {
                            flagTag = true;
                        }
                    }
                    var [classStr, styleStr, dataStr] = ["fontText ", "", ""];
                    for (var j = 0; j < data[i].VisualTag.length; j++) {
                        var [a, b, c] = dealSty(data[i].VisualTag[j]);
                        classStr += a + " ";
                        styleStr += b;
                        dataStr += c + " ";
                    }
                    dealSty = null;
                    //标签开始
                    for (var k = 0; k < data[i].NoVisualTag.length; k++) {
                        if (data[i].NoVisualTag[k].Key == "Have" && data[i].NoVisualTag[k].Value == "True") {
                            tagNum++;
                            tagFlag = true;
                            tag = data[i + 1] && data[i + 1].Value && data[i + 1].Value != ''
                                ? creatTag('startTag', {
                                    id: data[i].ID,
                                    txt: tagNum,
                                    fw: data[i].forceWrap,
                                    title: data[i].VisualTag,
                                    notag: data[i].NoVisualTag[1] && data[i].NoVisualTag[1].Value ? data[i].NoVisualTag[1].Value : ""
                                })
                                : creatTag('startTag', {
                                id: data[i].ID,
                                txt: tagNum,
                                fw: data[i].forceWrap,
                                title: data[i].VisualTag,
                                notag: data[i].NoVisualTag[1] && data[i].NoVisualTag[1].Value ? data[i].NoVisualTag[1].Value : ""
                            }) + '<span class="' + classStr + '" style="' + styleStr + '" data-db="' + data[i].ID + '" data-fw="' + data[i].forceWrap + '" ' + dataStr + '>' + isspace + '</span>';
                        }
                    }
                    classStr = classStr.trim();
                    html += tag;
                    html += `<span class="${classStr}" data-db="${data[i].ID}" data-fw="${data[i].forceWrap}" ${dataStr} style="${styleStr}">`;
                    if (!flagTag) html += '</span>';
                } else {
                    //标签结束
                    if (tagFlag) {
                        tag = creatTag('endTag', {id: data[i].ID, txt: tagNum, fw: data[i].forceWrap});
                    }
                    html += '</span>' + tag;
                }
            } else if (data[i].IsPair === undefined) {
                data[i].Value = data[i].Value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                if (i > 0 && i < data.length - 1) {
                    if (data[i - 1].ID && data[i + 1].ID && data[i - 1].ID == data[i + 1].ID) {
                        if (mark.txtAddBg) {
                            var allStr = data[i].Value;
                            var splitArr = [];
                            if (mark.case) {
                                allStr = matchSearch(data[i].Value, mark.txtAddBg);
                            } else {
                                splitArr = data[i].Value.split(mark.txtAddBg);
                                allStr = splitArr.join("<em class='mark'>" + mark.txtAddBg + "</em>");
                            }
                            html += allStr;
                        } else {
                            var matchTb = "";
                            if (termList && termList.length > 0) {
                                matchTb = matchTerm(data[i].Value, termList);
                            } else {
                                matchTb = data[i].Value;
                            }
                            html += matchTb;
                        }
                    } else {
                        if (mark.txtAddBg) {
                            var allStr = data[i].Value;
                            var splitArr = [];
                            if (mark.case) {
                                allStr = matchSearch(data[i].Value, mark.txtAddBg, data[i].WordID);
                            } else {
                                splitArr = data[i].Value.split(mark.txtAddBg);
                                allStr = splitArr.join("<em class='mark'>" + mark.txtAddBg + "</em>");
                            }
                            html += '<span class="fontText">' + allStr + '</span>';
                        } else {
                            var matchTb = "";
                            if (termList && termList.length > 0) {
                                matchTb = matchTerm(data[i].Value, termList);
                            } else {
                                matchTb = data[i].Value;
                            }
                            html += '<span class="fontText">' + matchTb + '</span>';
                        }
                    }
                } else {
                    if (mark.txtAddBg) {
                        var allStr = data[i].Value;
                        var splitArr = [];
                        if (mark.case) {
                            allStr = matchSearch(data[i].Value, mark.txtAddBg, data[i].WordID);
                        } else {
                            splitArr = data[i].Value.split(mark.txtAddBg);
                            allStr = splitArr.join("<em class='mark'>" + mark.txtAddBg + "</em>");
                        }
                        html += '<span class="fontText">' + allStr + '</span>';
                    } else {
                        var matchTb = "";
                        if (termList && termList.length > 0) {
                            matchTb = matchTerm(data[i].Value, termList);
                        } else {
                            matchTb = data[i].Value;
                        }
                        html += '<span class="fontText">' + matchTb + '</span>';
                    }
                }
            } else {
                //单个标签
                for (var k = 0; k < data[i].NoVisualTag.length; k++) {
                    if (data[i].NoVisualTag[k].Key == "Have" && data[i].NoVisualTag[k].Value == "True") {
                        let tagType = '', title = '';
                        if (data[i].NoVisualTag[1].Value.includes('@')) {
                            const splitArr = data[i].NoVisualTag[1].Value.split('@');
                            title = splitArr[0];
                            tagType = splitArr[splitArr.length - 1];
                        } else {
                            tagType = data[i].NoVisualTag[1].Value;
                        }
                        let imgUrl = tagType ? `/public/images/single-tags/${tagType}.png` : "/public/images/single-tags/tag.png";
                        html += creatTag('singleTag', {
                            id: data[i].ID,
                            txt: '',
                            fw: data[i].forceWrap,
                            notag: data[i].NoVisualTag[1].Value,
                            title: title
                        }, imgUrl);
                    }
                }
            }
        }
        return html;
    }

    /*
        @description: 处理可视化字符串，转化为list给后台
        param: 需要处理的带html的句子
    */
    function styleStringToList(html) {
        var nodes, node, dataArr = [];
        if (html.children().length < 1) {
            dataArr.push({Value: ""});
            return dataArr;
        } else {
            //删除空span
            for (var m = 0; m < html.contents().length; m++) {
                var _node = html.contents()[m];
                if (((_node.nodeType === 1 && $(_node).html() === '')
                    || (_node.nodeType === 3 && $(_node).text() === ''))) {
                    if (($(_node).hasClass('tagWrap') && $(_node).find('img').length === 0) || !$(_node).hasClass('tagWrap')){
                        $(_node).remove();
                        m--;
                    }
                }
            }
            if (html.contents().length === 0){
                dataArr.push({Value: ""});
                return dataArr;
            }
            //分两次判断，防止同时循环出现纰漏
            for (var n = 0; n < html.contents().length; n++) {
                var _node = html.contents()[n],
                    _nextNodes = $(_node).nextAll();
                _nextNodes.each(function (index, element) {
                    if (!$(_node).hasClass('tagWrap') && !$(element).hasClass('tagWrap') && $(_node).attr('data-db') === $(element).attr('data-db')) {
                        $(element).removeAttr('data-db')//去掉id重复的标签
                    }
                });
            }
            //原文若不存在tagWrap标签，删除译文的标签
            var trRow = html.parents('tr.table-row'),
                divSource = trRow.find('div.edition-source');
            if (divSource.find('.tagWrap').length < 1) {
                html.find('.tagWrap').remove();
            }
            nodes = html.contents();
            for (let i = 0, len = nodes.length; i < len; i++) {
                node = nodes[i];
                if (node.nodeType === 1 && node.nodeName === 'SPAN') {
                    if (node.classList.contains('tagWrap')) {
                        var id, wrap, novisual;
                        var $childs, $nextAll;
                        if (node.classList.contains('double') && node.classList.contains('start')) {//成对标签
                            $nextAll = $(node).nextAll('.tagWrap');
                            id = $(node).attr('data-db');
                            wrap = $(node).attr('data-fw') === 'true';
                            novisual = [
                                {Key: 'Have', Value: 'True'},
                                {Key: 'classType', Value: $(node).attr('data-notag') ? $(node).attr('data-notag') : ""}
                            ];
                            if (node.classList.contains('double') && $nextAll.length > 0 && $nextAll[0].classList.contains('end') && id == $($nextAll[0]).attr('data-db')) {
                                $childs = $(node).nextUntil('.tagWrap');
                                if ($childs && $childs.length === 0) {
                                    dataArr.push({
                                        ID: id,
                                        IsPair: true,
                                        IsStartTag: true,
                                        forceWrap: wrap,
                                        NoVisualTag: novisual,
                                        VisualTag: []
                                    });
                                    dataArr.push({Value: ""});
                                    dataArr.push({
                                        ID: id,
                                        IsPair: true,
                                        IsStartTag: false,
                                        forceWrap: wrap,
                                        NoVisualTag: [],
                                        VisualTag: []
                                    });
                                } else if ($childs && $childs.length > 0) {
                                    for (var k = 0; k < $childs.length; k++) {
                                        var $child = $childs[k],
                                            classes = $child.className.split(' '),
                                            val = $($child).text().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                                        dataArr.push({
                                            ID: id,
                                            IsPair: true,
                                            IsStartTag: true,
                                            forceWrap: wrap,
                                            NoVisualTag: novisual,
                                            VisualTag: dealClass($child, classes)
                                        });
                                        dataArr.push({Value: val ? val : ""});
                                        dataArr.push({
                                            ID: id,
                                            IsPair: true,
                                            IsStartTag: false,
                                            forceWrap: wrap,
                                            NoVisualTag: [],
                                            VisualTag: []
                                        });
                                    }
                                } else {
                                    dataArr.push({
                                        ID: id,
                                        IsPair: true,
                                        IsStartTag: true,
                                        forceWrap: wrap,
                                        NoVisualTag: novisual,
                                        VisualTag: []
                                    });
                                    dataArr.push({
                                        ID: id,
                                        IsPair: true,
                                        IsStartTag: false,
                                        forceWrap: wrap,
                                        NoVisualTag: [],
                                        VisualTag: []
                                    });
                                }
                            } else {
                                dataArr.push({
                                    ID: id,
                                    IsPair: true,
                                    IsStartTag: true,
                                    forceWrap: wrap,
                                    NoVisualTag: novisual,
                                    VisualTag: []
                                });
                            }
                        } else if (node.classList.contains('single')) {//单个标签
                            dataArr.push({
                                ID: $(node).attr('data-db'),
                                IsPair: false,
                                IsStartTag: true,
                                forceWrap: $(node).attr('data-fw') === 'true',
                                NoVisualTag: [
                                    {Key: 'Have', Value: 'True'},
                                    {
                                        Key: 'classType',
                                        Value: $(node).attr('data-notag') ? $(node).attr('data-notag') : ""
                                    }
                                ],
                                VisualTag: []
                            })
                        }
                    } else {//不含class=tagWrap的span标签
                        if (!($(node).prevAll('.tagWrap').length > 0 && $(node).nextAll('.tagWrap').length > 0 && ($(node).prevAll('.tagWrap')[0].dataset.db == $(node).nextAll('.tagWrap')[0].dataset.db))) {
                            var classes = node.className.split(' '),
                                val = $(node).text().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                            if (classes && classes.length > 1) {
                                var tempid = "adec9547-ddfe-45d1-bb6f-" + utils.guid(),
                                    originid = $(node).attr('data-db') ? $(node).attr('data-db') : tempid;
                                if (originid === 'adec9547-ddfe-45d1-bb6f-1'){ // 清理错误数据，后面可以删除
                                    originid = $(node).parents('tr').find('div.edition-source span.fontText').attr('data-db')
                                }
                                dataArr.push({
                                    ID: originid,
                                    IsPair: true,
                                    IsStartTag: true,
                                    forceWrap: $(node).attr('data-fw') === 'true',
                                    NoVisualTag: [],
                                    VisualTag: dealClass(node, classes)
                                });
                                dataArr.push({Value: val ? val : ""});
                                dataArr.push({
                                    ID: originid,
                                    IsPair: true,
                                    IsStartTag: false,
                                    forceWrap: $(node).attr('data-fw') === 'true',
                                    NoVisualTag: [],
                                    VisualTag: []
                                });
                            } else {
                                dataArr.push({Value: val ? val : ""});
                            }
                        }
                    }
                } else {
                    var val = $(node).text().replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    dataArr.push({Value: val ? val : ""});
                }
            }
        }
        return dataArr;
    }
})(window, document, jQuery);

/*
    ***** object：处理机翻、术语、TM库等相关内容 *****
*/
var dealCatObj = (function (window, document, $) {

    /*
        ******** 私有方法 **********
    */

    //插入tb单词
    function insertTbWord(id, words, _this) {
        let word = '';
        if (words) {
            word = words;
        } else {
            // word = $($(_this).prevAll()[1]).text();
            word = $($(_this).prevAll()[0]).text();
        }
        var range, newRange, userSelection;
        var targetDiv, targetTr, targetId, targetEl;
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.rangeCount === 0)return;
        range = userSelection.getRangeAt(0);
        targetEl = $(range.endContainer);
        targetTr = $(range.endContainer).parents('tr.table-row');
        targetDiv = targetTr.find('div.edition-target');
        //光标位置与句段相符
        if (userSelection.type == 'Caret'
            && range.endOffset === range.startOffset
            && targetTr.length > 0
            && targetEl.parents('td').hasClass('target-text')
        ) {
            var changeSts = new ChangeConfirmStatus();
            var txtNode = document.createTextNode(word);//创建文本节点
            (targetEl.hasClass('tagWrap') || targetEl.hasClass('edition-target'))
            && (txtNode = document.createTextNode(word), targetDiv.blur());
            range.insertNode(txtNode);//插入文本节点
            targetEl.attr('tb-flag', 'true');
            newRange = document.createRange();
            newRange.selectNodeContents(txtNode);
            range.setStart(txtNode, txtNode.length);
            newRange.collapse(false);
            userSelection.removeAllRanges();
            userSelection.addRange(newRange); //创建新的range对象
            changeSts.single(targetDiv);
            changeSts = null;
        }
    }
    // 插入特殊字符
    function insertCharacter(_this,word){
        var range, newRange, userSelection;
        var targetDiv, targetTr, targetEl;
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.rangeCount === 0)return;
        range = userSelection.getRangeAt(0);
        targetEl = $(range.endContainer);
        targetTr = $(range.endContainer).parents('tr.table-row');
        targetDiv = targetTr.find('div.edition-target');
        //光标位置与句段相符
        if (userSelection.type === 'Caret'
            && range.endOffset === range.startOffset
            && targetTr.length > 0
            && targetEl.parents('td').hasClass('active-text')
            && targetEl.parents('td').find('div').attr('contenteditable')
        ) {
            var changeSts = new ChangeConfirmStatus();
            var txtNode = document.createTextNode(word);//创建文本节点
            (targetEl.hasClass('tagWrap') || targetEl.hasClass('edition-target'))
            && (txtNode = document.createTextNode(word), targetDiv.blur());
            range.insertNode(txtNode);//插入文本节点
            newRange = document.createRange();
            newRange.selectNodeContents(txtNode);
            range.setStart(txtNode, txtNode.length);
            newRange.collapse(false);
            userSelection.removeAllRanges();
            userSelection.addRange(newRange); //创建新的range对象
            targetEl.hasClass('edition-target') && changeSts.single(targetDiv);
            changeSts = null;
        }
        if ($('.isClose').prop('checked')){
            $(_this).prev().click();
            // $('#character-modal').modal('close');
        }
    }

    //快速复制原文样式
    function fastCopyStyle(contents, txt) {
        var newTxt = txt;
        var node, newNode;
        var reg = new RegExp('&nbsp;', 'g');
        if (txt.match(reg) && txt.match(reg).length > 0) {
            newTxt = txt.replace(reg, ' ');
        }
        for (var i = 0, ele; ele = contents[i++];) {
            var _node = ele;
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
        node = $(newNode).clone(true);
        node.text(newTxt);
        return node;
    }

    //获取MT类型
    function getMTofType() {
        var [icon, type] = [null, dataConfig.MTtype];
        switch (Number(type)) {
            case 1:
            case 25:
                icon = icons.baidu;
                break;
            case 2:
                icon = icons.youdao;
                break;
            case 3:
                icon = icons.sougou;
                break;
            case 4:
                icon = icons.tecent;
                break;
            case 5:
                icon = icons.google1;
                break;
            case 6:
                icon = icons.google2;
                break;
            case 7:
                icon = icons.xiaoniu;
                break;
            case 8:
            case 14:
            case 16:
                icon = icons.yyq;
                break;
            case 10:
                icon = icons.jinshan;
                break;
            case 11:
                icon = icons.zkfy;
                break;
            case 12:
                icon = icons.deepL;
                break;
            default:
                icon = icons.yyq;
        }
        return {icon: icon, type: type};
    }

    /*
        ******** 公有方法 **********
    */

    //机翻
    function getMTofResult(source, target, txt, sid, tbody, async = false) {
        var {icon, type} = getMTofType();
        if (!type) return;
        if (!dataConfig.isMTshow) return;
        var params = {
            "originalText": txt,
            "originalLanguage": source,
            "targetLanguage": target,
            "mtType": type,
            "field": dataConfig.Field,
            "projectId": dataConfig.TermProtection ? dataConfig.ProjectID : '',
            "enableTermProtection": dataConfig.TermProtection
        };
        $.ajax({
            url: urls.mtUrl + '/mt/getMachineText',
            type: 'post',
            async: async,
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (res, text, xhr) {
                if (res.success) {
                    var data = res.data;
                    var str = "", tdStr = "", isEmpty = "";
                    if (tbody === ".tmTrans>tbody") {
                        tdStr = "<td style='width:50px;vertical-align:middle;text-align:center'>1</td>";
                        isEmpty = `<td style='display:none'>${data.translationText.replace(/</g, "&lt;").replace(/</g, "&gt;")}</td>`;
                    } else {
                        tdStr = "<td style='width:30px;padding:0;vertical-align:middle;text-align:center'></td>";
                    }
                    str += `<tr class="key-copy" toolmt="true">
                                    ${tdStr}
                                    <td style=${tbody == ".tmTrans>tbody" ? "width:43%" : ""}>${data.originalText.replace(/</g, "&lt;").replace(/</g, "&gt;")}</td>
                                    <td class="trans-icon" style="vertical-align:middle;text-align:center">${icon}</td>
                                    <td class="trans-bg trans-mt">MT</td>
                                    <td class="catTrans trans" data="${sid}">${data.translationText.replace(/</g, "&lt;").replace(/</g, "&gt;")}</td>
                                    ${isEmpty}
                                    </tr>`;
                    tbody === '.tmTrans>tbody' ? $(tbody).html(str) : $(tbody).append(str);
                    BOM.setTransHeight();
                }
            }
        });
    }

    //LanMT参考
    function getMTYYQofResult(senId, source, target, txt, fid, wid) {
        if (!$('.mtTrans-btn').length || !$('.mtTrans-btn').hasClass('selected')) return;
        $(".mtTrans>tbody").empty();
        let isSupport = 'zhCN-enUS-frFR-ruRU-deDE-jaJP-esES-zhHK-zhTW';
        if ((source + target).indexOf('zhCN') === -1 && isSupport.indexOf((source + target).replace('zhCN','')) === -1){
            return;
        }
        if (dataConfig.sentence.ori[fid+wid] && !dataConfig.sentence.ori[fid+wid].isGet){
            mtShow(dataConfig.sentence.ori[fid+wid],txt,senId,fid,wid);
            BOM.setTransHeight();
            return;
        }
        let params = {
            "originalText": txt,
            "originalLanguage": source,
            "targetLanguage": target,
            "mtType": 14,
            "field": dataConfig.Field,
            "projectId": dataConfig.TermProtection ? dataConfig.ProjectID : '',
            "enableTermProtection": dataConfig.TermProtection
        };
        $.ajax({
            url: urls.mtUrl + '/mt/getMachineText',
            type: 'post',
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                $('div.catTransMT').empty();
            },
            success: function (res) {
                if (res.success) {
                    dataConfig.sentence.ori[fid+wid] = res.data;
                    delete dataConfig.sentence.ori[fid+wid].isGet;
                    mtShow(res.data,txt,senId,fid,wid);
                }
                BOM.setTransHeight();
            }
        });
    }
    // 机翻文本渲染
    function mtShow(data,txt,senId,fid,wid){
        let html = "";
        $(".catMtEvaluate").remove();
        data.translationText = data.translationText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        txt = txt.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // var strat = '<span class="starTips">质量评价：</span><input id="input-star" type="number" class="rating" value="0" data-min=0 data-max=5 step=0.5 data-size="xs" ><button class="submitStar am-btn normal-btn normal-bg-btn" onclick="dealCatObj.submitStarScore()" title="感谢您对当前“参考”译文的质量评价！">提交</button>'
        let evaluate = `<span class="catMtEvaluate" style="float:right;">
                                        <img class="evaluateUp" src="/public/images/right-area/CAT_zan.png" style="margin-right: 10px;cursor: pointer;" alt="" title="点赞" onclick="dealCatObj.submitStarScore(0)">
                                        <img class="evaluateDown" src="/public/images/right-area/CAT_cha.png" style="margin-right: 10px;cursor: pointer;" alt="" title="吐槽" data-am-modal="{target:'#trans-feedback',closeViaDimmer:0}">
                                    </span>`;
        html = `<tr class="key-copy" toolmt="true">
                            <!-- <td width="50" style="text-align: center;position: relative;">#</td>-->
                            <td class="origin" style="display:none">${txt}</td>
                            <td class="catTrans trans" data='${senId}' data-fid='${fid}' data-wid='${wid}'>${data.translationText}</td>
                            <td style="display:none">${data.translationText}</td>
                        </tr>`
        $(".catTransMT").html(html);
        $(".mtTrans p").append(evaluate);
        // $(".star-ratingBox").html(strat);
        // $(".starPositionBox").show();
        // $('#input-star').rating({
        //     step: 0.5,
        //     size: 'xs',//星星大小可选lg,sm,xl,xs
        //     showClear: false,
        //     starCaptions: {1: '', 2: '', 3: '', 4: '', 5: ''}
        // });
    }
    // 提交机翻评价
    function submitStarScore (type) {
        var tr = $('.catTransMT').find('td.trans'),
            fid = tr.attr("data-fid"),
            transMT = tr.text(),
            tar = $('tr.table-row.active'),
            sid = tr.attr("data-wid"),
            origin = '',
            trans = '';
        // if (Number($('#input-star').val()) === 0) {
        //     $.Alert("请选择分数");
        //     return;
        // }
        let feedArr = [];
        if (type === 1){
            let isChecked = false;
            $("#trans-feedback input").toArray().forEach(item => {
                if (item.checked) {
                    feedArr.push(item.value);
                    item.checked = false; // 提交后清除选中
                    isChecked = true;
                }
            });
            if (!isChecked){
                $.Alert('至少选择一个错误类型');
                return
            }
            $('.evaluateDown').attr('src','/public/images/right-area/CAT_cha_pre.png');
            $('.evaluateUp').attr('src','/public/images/right-area/CAT_zan.png');
        }else if (type === 0){
            $('.evaluateDown').attr('src','/public/images/right-area/CAT_cha.png');
            $('.evaluateUp').attr('src','/public/images/right-area/CAT_zan_pre.png');
        }
        if (tar.attr('data-no') === sid) {
            origin = tar.find('.edition-source').text();
            trans = tar.find('.edition-target').text();
        } else {
            return
        }
        var params = {
            creator: dataConfig.userName,
            creatorID: dataConfig.userID,
            projectID: dataConfig.ProjectID,
            fileID: fid,
            sentenceID: sid,
            finalTranslation: trans,
            origin: origin,
            translation: transMT,
            langPair: dataConfig.LangTypePair,
            // score: Number($('#input-star').val())
            score: type,
            errortype:feedArr.toString(),
            comment:$(".feedbackTxt").val()
        };
        $.ajax({
            url: urls.confirmMtYYQUrl + '/cat/submitScore',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.code === '200') {
                    $.Tips('提交成功');
                    $("#trans-feedback .am-close").click();//关闭弹框
                    $(".feedbackTxt").val('');// 提交后清空意见框
                    // $('#input-star').val('0');
                    // $('#input-star').rating('refresh',{
                    //     min: 0,
                    //     max: 5,
                    //     step: 0.5,
                    //     size: 'xs',//星星大小可选lg,sm,xl,xs
                    //     showClear: false,
                    //     starCaptions: {1: '', 2: '', 3: '', 4: '', 5: ''}
                    // });
                }else {
                    $.Tips(data.message);
                }
            }
        })
    }

    // 提交机翻译文与最终译文（用以优化机翻引擎）
    function confirmMTTranslation(senId, curr, trans, transMT, fid, recommend) {
        var params = {
            creator: dataConfig.userName,
            creatorID: dataConfig.userID,
            fileID: fid,
            finalTranslation: trans,
            origin: curr,
            projectID: dataConfig.ProjectID,
            sentenceID: senId,
            langPair: dataConfig.LangTypePair,
            translation: transMT,
            recommend: recommend
        };
        $.ajax({
            url: urls.confirmMtYYQUrl + '/cat/submitmtrecord',
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {},
            error: function () {}
        })
    }

    /*
          @description: TM检查
          @param: DatabaseID: 库编号,
                  rText: 原文,
                  Percentage: 匹配率,
                  Number: 最大匹配条数,
                  Last: 原文上一句,
                  Next: 原文下一句
      */
    function getTMofResult(senId, fid, dbids, percent, number, txt, prev, next, trEle,xlid,fill) {
        if (!dataConfig.ImportID_TM || dataConfig.ImportID_TM.length < 1 || !Number(dataConfig.ImportID_TM)) return;
        var params = {
            "text": [prev, txt, next],
            "ids": dbids.map(item => Number(item)),
            rLanguageType: dataConfig.sourceLan,
            tLanguageType: dataConfig.targetLan,
            reverseIds: dataConfig.reverseIds
        }
        $(".tmTrans>tbody").empty();
        var cat_tm_xhr = $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/match/tm/?Percentage=" + percent / 100 + "&Number=" + number,
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (res) {
                if (res.success) {
                    var data = res.data;
                    if (data && data.length > 0) {
                        var html = "";
                        for (var i = 0, len = data.length; i < len; i++) {
                            var pattern = new RegExp("[<>]"); // 尖括号影响标签展示
                            if (pattern.test(data[i].ttext)) {
                                data[i].ttext = data[i].ttext.replace(/</g, '&lt;');
                                data[i].ttext = data[i].ttext.replace(/>/g, '&gt;');
                                data[i].revisionTText = data[i].revisionTText.replace(/</g, '&lt;');
                                data[i].revisionTText = data[i].revisionTText.replace(/>/g, '&gt;');
                            }
                            let isTitle = data[i].reverse ? "title='源自反向语料库'" : "",
                                isBg = data[i].reverse ? 'background:#eee' : "";
                            html += `<tr class='tm-tb-tr tmwithtime-tmindexinfo key-copy' ${isTitle} data-key='${data[i].rowKey}' data-mold='tm' data-reverse='${data[i].reverse}' onclick='dealCatObj.showDetailTBTM(this)'>
                                <td style='width:50px;vertical-align:middle;text-align:center;${isBg}'>${i + 1}</td>
                                <td style='width:43%;'>${data[i].revisionRText.replace(/amp;/g, "")}</td>
                                <td class='trans-bg trans-per'>${(data[i].percentage * 100).toFixed(0)}%</td>
                                <td class='trans-bg trans-tm'>TM</td>
                                <td class='catTrans' data-xlid='${xlid}' data='${senId}' data-fid='${fid}' data-tm='${(data[i].percentage * 100).toFixed(0)}'>${data[i].ttext}</td>
                                <td style="display:none">${data[i].revisionTText}</td>
                            </tr>`;
                        }
                        $(".tmTrans>tbody").html(html);
                        $(".tmTrans tr").eq(0).click();//显示第一条tm
                        if (fill) {
                            var changeSts = new ChangeConfirmStatus();
                            var rTxt = data[0].revisionTText,
                                targetDiv = trEle.find('div.edition-target'),
                                sourceDivCnts = trEle.find('div.edition-source').clone().contents();
                            var tmPercent = (data[0].percentage * 100).toFixed(0);
                            rTxt = rTxt.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                            targetDiv.attr({
                                "data-mne": "true",
                                "data-tm": tmPercent
                            }).html(fastCopyStyle(sourceDivCnts, rTxt));
                            trEle.find("td.status>font").html((data[0].percentage * 100).toFixed(0) + "%");
                            changeSts.single(targetDiv);
                            changeSts = null;
                        }
                    } else {
                        $(".tmTrans>tbody").html(`<div style="height: 90px;display:flex;justify-content:center;align-items:center;text-align: center;font-size: 12px;color: #999;">无数据</div>`);
                    }
                    BOM.setTransHeight();
                }
            },
            error: function () {
                // getMTofResult(dataConfig.sourceLan, dataConfig.targetLan, txt, senId, ".tmTrans>tbody", true);
            }
        });
    }

    /*
         @description: 术语检查
         @param:  DatabaseID: 库编号,
                  rText: 原文,
                  Percentage: 匹配率,
                  Number: 最大匹配条数
    */
    // 时间戳转为常规格式
    function timeFormat(shijianchuo) {
        function add0(m){return m<10?'0'+m:m }
        //shijianchuo是整数，否则要parseInt转换
        var time = new Date(shijianchuo);
        var y = time.getFullYear();
        var m = time.getMonth()+1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        return y+'/'+add0(m)+'/'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
    }

    function getTBofResult(senId, dbids, percent, number, txt) {
        if (!dataConfig.ImportID_TB || dataConfig.ImportID_TB.length < 1 || !Number(dataConfig.ImportID_TB)) return;
        var params = {
            "Text": txt,
            "Ids": dbids.map(item => Number(item))
        };
        number = 50; // 翻译中心需求增加术语提示
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/match/termprojanddb/" + dataConfig.ProjectID + "?Percentage=" + 1 + "&Number=" + number,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            success: function (data) {
                if (data && data.length > 0){
                    var str = "";
                    for (var i = 0, len = data.length; i < len; i++) {
                        var temp = data[i].Model,
                            isBg = data[i].IsProj ? 'background:#eee' : "",
                            isTitle = data[i].IsProj ? "title='本子订单术语'" : "";
                        str += `<tr class='tm-tb-tr termwithtime-termindexinfo copy-tb' data-key='${data[i].RowKey}' data-mold='term' data-istrue="${data[i].IsProj}" data-professional="${data[i].tbProfessional}"  ${isTitle} onclick="dealCatObj.showDetailTBTM(this)">
                                <td style='width:36px;padding:0;vertical-align:middle;text-align:center;${isBg}'>${i + 1}</td>
                                <td>${data[i].Model.rText.replace(/</g, "&lt;").replace(/</g, "&gt;")}</td>
                                <td class='trans-bg trans-per'>${(data[i].Percentage * 100).toFixed(0)}%</td>
                                <td class='trans-bg trans-tb'>TB</td>
                                <td><span class='tbWrap' data-id='${senId}' data-txt='${data[i].Model.tText}'>${data[i].Model.tText.replace(/</g, "&lt;").replace(/</g, "&gt;")}</span></td>
                            </tr>`;
                    }
                    $("table.transList>tbody").html(str);
                    $("table.transList tr").eq(0).click();
                }else {
                    $("table.transList>tbody").html(`<div style="height: 90px;display:flex;justify-content:center;align-items:center;text-align: center;font-size: 12px;color: #999;">无数据</div>`);
                }
            }
        });
    }

    //导入pro（项目库）
    function importPro(prev, next, curr, trans, fileNmae) {
        if (trans.trim() === "") return;
        if (dataConfig.ImportID_TB.length < 1 || !Number(dataConfig.ImportID_TB)) return;
        var params = {
            CreateTime: 0,
            Creator: dataConfig.userID,
            CurrentOrigin: curr,
            IsApproved: true,
            LastOrigin: prev,
            ModifiedTime: 0,
            Modifier: dataConfig.userName,
            NextOrigin: next,
            Note: "",
            ProjectId: dataConfig.ProjectID,
            Remark: "",
            Reviewer: dataConfig.userName,
            RowKey: "",
            Translations: [trans],
            filename: fileNmae
        };
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/tmproj",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8"
        });
    }

    //导入tm（参考库）
    function importTM(prev, next, curr, trans) {
        if (trans.trim() === "") return;
        if (!dataConfig.ImportID_TM || dataConfig.ImportID_TM.length < 1 || !Number(dataConfig.ImportID_TM)) return;
        var params = [];
        dataConfig.ImportID_TM.forEach(function (item) {
            var tempObj = {
                CreateTime: 0,
                Creator: dataConfig.userID,
                CurrentOrigin: curr,
                DatabaseId: +item,
                IsApproved: true,
                LastOrigin: prev, // 上一句原文
                ModifiedTime: 0,
                Modifier: dataConfig.userName,
                NextOrigin: next, // 下一句原文
                Note: "",
                ProjectId: dataConfig.ProjectID,
                Remark: "",
                Reviewer: dataConfig.userName,
                RowKey: "",
                Translations: [trans]
            };
            params.push(tempObj);
        });
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/tms",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8"
        });
    }

    //提交：TM临时库
    function tempConfirmTM(prev, next, curr, trans, fileNmae) {
        var params = {
            CreateTime: 0,
            Creator: dataConfig.userID,
            CurrentOrigin: curr,
            LastOrigin: '',
            ModifiedTime: 0,
            Modifier: dataConfig.userName,
            NextOrigin: '',
            Note: '',
            ProjectId: dataConfig.ProjectID,
            Remark: '',
            Reviewer: '',
            RowKey: '',
            Translations: [trans],
            filename: fileNmae
        };
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/tmproj",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8"
        });
    };

    //点击tr：展示TB、TM详细信息
    function showDetailTBTM(_this) {
        var id = '';
        var div = $(_this).parents('table').parent('div'),
            ul = div.next('ul.tmDetail');
        var mold = _this.dataset.mold,
            key = _this.dataset.key,
            professional = _this.dataset.professional,
            type = _this.className.split(' ')[1].split('-');
        $(_this).addClass('active').siblings().removeClass('active');
        if ($(_this).hasClass('tr-xm')) {// 搜索处项目库
            var list = JSON.parse(_this.getAttribute('data'));
            ul.show();
            ul.find('i.tmtbCreater').html('提交人：' + list.name).attr('title', list.name);
            ul.find('i.tmtbArea').html('来源：' + list.area).attr('title', list.area);
            ul.find('i.tmtbTime').html('提交时间：' + list.time).attr('title', list.time);
            !div.hasClass('tmContent') && div.css({'height': 'calc(100% - 117px)'});
        } else {// 语料术语（含搜索处）
            var _url = urls.tmtbUrl + "/" + type[0] + "/" + key + '?rLanType=' + dataConfig.sourceLan + '&tLanType=' + dataConfig.targetLan;
            if (_this.dataset.istrue && _this.dataset.istrue == "true"
                || _this.dataset.mold && _this.dataset.mold == 'tb') {// 术语处部分tr或搜索处tb项目库
                _url = urls.tmtbUrl + "/termproj/" + key + '?source=' + dataConfig.sourceLan + '&target=' + dataConfig.targetLan;
            }
            $.get(_url, function (res, text, xhr) {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = res.data;
                    var prev = "",
                        next = "",
                        txt = data.Origin,
                        txtTrans = data.Translations;
                    id = data.DatabaseId;
                    if (mold === "tm") {
                        txt = data.CurrentOrigin;
                        prev = data.lastOrigin;
                        next = data.NextOrigin;
                        id = data.DatabaseId;
                        txtTrans = data.Translation;
                        if (!document.getElementById("inputCurren")) {
                            var inputCurren = $('<div></div>').text(txt).attr({'id': 'inputCurren'}).css({'display': 'none'}),
                                lastOrigin = $('<div></div>').text(prev).attr({'id': 'lastOrigin'}).css({'display': 'none'}),
                                nextOrigin = $('<div></div>').text(next).attr({'id': 'nextOrigin'}).css({'display': 'none'}),
                                inputTrans = $('<div></div>').text(txtTrans).attr({'id': 'inputTrans'}).css({'display': 'none'});
                            $('body').append(inputCurren);
                            $('body').append(lastOrigin);
                            $('body').append(nextOrigin);
                            $('body').append(inputTrans);
                        } else {
                            $("#inputCurren").text(txt);
                            $("#lastOrigin").text(prev);
                            $("#nextOrigin").text(next);
                            $("#inputTrans").text(txtTrans);
                        }
                    }
                    ul.show();
                    div.hasClass('tmtb-tab') ? div.css({'height': 'calc(100% - 46px)'}) : (!div.hasClass('tmContent') && div.css({'height': 'calc(100% - 117px)'}));
                    div.hasClass('tmtb-tab') && ul.find('.tmtbOperate').attr({
                        'data-mold': mold,
                        'data-key': key,
                        'data-databaseId': data.DatabaseId,
                        'data-creater': data.Creator,
                        'data-modi': data.Modifier,
                        'data-orin': txt,
                        'data-trans': txtTrans,
                        'data-remark': data.Remark,
                        'data-note': data.note,
                        'data-istrue': _this.dataset.istrue
                    });
                    if (_this.dataset.istrue && _this.dataset.istrue == "true"
                        || _this.dataset.mold && _this.dataset.mold == 'tb') {// 术语处部分tr或搜索处tb项目库
                        $('.tmtbOperate').css('display',professional==='true'?'none':'inline');
                        ul.find('i.tmtbArea').html('来源：项目库').attr('title', '项目库');
                        ul.find('i.tmtbCreater').html(`提交人：${data.Modifier} <span style="margin-left: 10px;"> ${timeFormat(data.ModifiedTime)} </span>`).attr('title', data.Modifier + timeFormat(data.ModifiedTime));
                        // ul.find('i.tmtbTime').html('提交时间：' + new Date(data.ModifiedTime).toLocaleString('chinese',{hour12:false})).attr('title', new Date(data.ModifiedTime).toLocaleString('chinese',{hour12:false}));
                        ul.find('i.tmtbTime').html('');
                        ul.find('i.tmtbRemark').html('备注：' + data.Remark + '；' + data.note).attr('title', data.Remark + ';' + data.note);
                    } else {
                        $.get(urls.tmtbUrl + "/" + type[1] + "/" + id + "?rowKey=" + key, function (res1, text, xhr) {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                var result = res1.data;
                                if (div.hasClass('tmContent')) {// 语料处
                                    let currentTd = `<td style="width: 23.5%;"><a class="tmOperate" href="javascript:$('.update-tmtb-content').remove();$(document.body).append($('#updateTMTB').html());$('.modal-tm').css('display','block');$('.last-origin').html($('#lastOrigin').text());$('.update-orin').html($('#inputCurren').text());$('.next-origin').html($('#nextOrigin').text());$('.update-trans').html($('#inputTrans').text());$('#updateTmTbData').attr('data-mold','${mold}');event.preventDefault();" data-key="${key}" data-creater="${data.Creator}" data-databaseId="${data.DatabaseId}">更新库</a></td>`
                                    if (_this.dataset.reverse === 'true') {
                                        currentTd = `<td style="width: 23.5%;color: #ccc;">更新库</td>`
                                    }
                                    var tdStr = `<tr>
                                                    ${currentTd}
                                                    <td style="width: 23.5%;">${result.modifier}<span style="margin-left: 16px;">${timeFormat(result.modifiedTime)}</span></td>
                                                    <td>${result.field}</td>
                                                </tr>`;
                                    $(".tmTransInfo>thead").html(tdStr);
                                } else {// 术语处、搜索处
                                    $('.tmtbOperate').css('display',professional==='true'?'none':'inline');
                                    ul.find('i.tmtbArea').html(`库名称： ${type[1] === 'tmindexinfo' ? result.field : result.Field}`).attr('title', `${type[1] === 'tmindexinfo' ? result.field : result.Field}`);
                                    ul.find('i.tmtbCreater').html(`提交人：${type[1] === 'tmindexinfo' ? result.modifier : result.ModifiedInformation.Modifier}<span style="margin-left: 10px;">${timeFormat(type[1] === 'tmindexinfo' ? result.modifiedTime : result.ModifiedInformation.ModifiedTime)}</span>`).attr('title', `${type[1] === 'tmindexinfo' ? result.modifier : result.ModifiedInformation.Modifier}` + ' ' + timeFormat(type[1] === 'tmindexinfo' ? result.modifiedTime : result.ModifiedInformation.ModifiedTime));
                                    // ul.find('i.tmtbTime').html('提交时间：' + new Date(result.ModifiedInformation.ModifiedTime).toLocaleString('chinese',{hour12:false})).attr('title', new Date(result.ModifiedInformation.ModifiedTime).toLocaleString('chinese',{hour12:false}));
                                    ul.find('i.tmtbTime').html('');
                                    ul.find('i.tmtbRemark').html(`备注：${type[1] === 'tmindexinfo' ? result.remark + '；' + result.note : result.ModifiedInformation.Remark + '；' + result.ModifiedInformation.note}`).attr('title', `${type[1] === 'tmindexinfo' ? result.remark + result.note : result.ModifiedInformation.Remark + result.ModifiedInformation.note}`);
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    //提交：更新TB、TM临时库数据
    function tempUpdateTBTM(_this) {
        var params = null;
        var url = "",
            ele = document.querySelector('.tmtbOperate');
        if ($(_this).attr('data-mold') === 'tm') {
            ele = document.querySelector('.tmOperate');
            url = "/tm";
            params = {
                Remark: "",
                Note: "",
                IsApproved: true,
                CreateTime: 0,
                ModifiedTime: 0,
                Reviewer: dataConfig.userName.split('_')[0],
                Creator: dataConfig.userID,
                RowKey: ele.dataset.key,
                DatabaseId: +ele.dataset.databaseid,
                Modifier: dataConfig.userName.split('_')[0],
                LastOrigin: $('#lastOrigin').text(),
                NextOrigin: $('#nextOrigin').text(),
                CurrentOrigin: $('#inputCurren').text(),
                Translations: [$('textarea.update-trans').val()]
            };
        } else {
            if ($(ele).attr("data-istrue") == "true") {
                url = "/termproj";
            } else {
                url = "/term";
            }
            params = {
                IsApproved: true,
                Remark: $(".update-remark").val(),
                CreateTime: 0,
                ModifiedTime: 0,
                Reviewer: ele.dataset.key,
                Creator: dataConfig.userID,
                RowKey: ele.dataset.key,
                ProjectId: dataConfig.ProjectID,
                DatabaseId: Number(dataConfig.ImportID_TB),
                Modifier: dataConfig.userName.split('_')[0],
                Origin: ele.dataset.orin,
                Translations: [$('textarea.update-trans').val()],
                note: $("textarea.update-note").val()
            }
        }
        $.ajax({
            type: 'post',
            url: urls.tmtbUrl + url,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                $(_this).attr('disabled', true);
            },
            complete: function () {
                $(_this).removeAttr('disabled');
            },
            success: function (data, text, xhr) {
                // if (data && data[0].Modifier == dataConfig.userName.split('_')[0]) {
                if (data.success) {
                    $.Tips('修改成功');
                    setTimeout(() => {
                        if (url === "/tm"){
                            let tr = $('tr.table-row.active'),
                                fid = tr.attr("data-fid"),
                                senid = tr.attr("data-sign"),
                                xlid = tr.attr("data-xlid"),
                                prevTxt = tr.prev().find(".edition-source").text(),
                                nextTxt = tr.next().find(".edition-source").text();
                            dealCatObj.getTMofResult(senid, fid, dataConfig.DataBaseId_TM, dataConfig.percentge, dataConfig.number, params.CurrentOrigin, prevTxt, nextTxt, tr,xlid);
                        }
                    },500)
                } else {
                    $.Alert(data.msg);
                }
                $(_this).next('button').click();
            }
        });
    }

    //添加术语
    function addTerm(_this) {
        var remark = "",
            remarkSel = document.querySelector('.term_select'),
            remarkTxt = document.querySelector('.term_remark');
        // remark = remarkTxt.value ? (remarkSel.value + "：" + remarkTxt.value) : remarkSel.value;
        var params = {
            RowKey: "",
            Remark: remarkSel.value,
            Reviewer: "",
            CreateTime: 0,
            ModifiedTime: 0,
            IsApproved: true,
            Modifier: dataConfig.userName.split('_')[0],
            Creator: dataConfig.userID,
            DatabaseId: Number(dataConfig.ImportID_TB),
            ProjectId: dataConfig.ProjectID,
            Origin: $(".term_source").val(),
            Translations: [$(".term_target").val()],
            note: remarkTxt.value
        }
        var _params = {
            RowKey: "",
            Remark: remarkSel.value,
            Reviewer: "",
            CreateTime: 0,
            ModifiedTime: 0,
            IsApproved: true,
            Modifier: dataConfig.userName.split('_')[0],
            Creator: dataConfig.userID,
            DatabaseId: Number(dataConfig.ImportID_TB),
            ProjectId: dataConfig.ProjectID,
            Origin: $(".term_source").val(),
            Translations: [$(".term_target").val()],
            note: remarkTxt.value
        }
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/termproj",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            success: function (res, text, xhr) {
                if (res.data && res.data.Modifier == dataConfig.userName.split('_')[0]) {
                    $.Tips('添加成功');
                    $(".term-content").find(".am-form-field").val("");
                } else {
                    $.Alert(res.msg);
                }
            }
        });
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/term",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(_params),
            beforeSend: function () {
                $(_this).attr("disabled", true);
                $(_this).html('保存中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(_this).html("添 加");
            },
            success: function (res, text, xhr) {
                if (res.data && res.data.Modifier == dataConfig.userName.split('_')[0]) {
                    $.Tips('添加成功');
                    $(".term-content").find(".am-form-field").val("");
                } else {
                    $.Alert(res.msg);
                }
            }
        })
    }

    return {
        addTerm,
        importTM,
        importPro,
        showDetailTBTM,
        tempUpdateTBTM,
        tempConfirmTM,
        getTMofResult,
        getTBofResult,
        getMTofResult,
        fastCopyStyle,
        insertTbWord,
        insertCharacter,
        getMTYYQofResult,
        confirmMTTranslation,
        submitStarScore
    }
})(window, document, jQuery);

/*
    ***** object：处理QA内容 *****
*/
var dealQaObj = (function (window, document, $) {

    var spellTxt = "";
    var matchQA = $('input[name=setMatchQA]');
    var SpaceBeforePunc = $('input[name=setSpaceBeforePunc]');

    //添加敏感词、空格检查
    function checkWordAndSpace(_this, btn, list) {
        var url = "",
            params = {};
        params.sensitiveWordList = [];
        url = btn === "SensitiveWordCheck"
            ? urls.qaUrl + "/QA_sensitive_insert"
            : urls.qaUrl + "/QA_PuncWithSpace";
        for (var i = 0, len = list.length; i < len; i++) {
            var tempobj = new Object();
            tempobj.sensitiveWord = list[i].value;
            tempobj.languageType = dataConfig.LangTypePair;
            tempobj.userId = dataConfig.userID;
            tempobj.projectId = dataConfig.ProjectID;
            params.sensitiveWordList.push(tempobj);
        }
        $.ajax({
            method: "post",
            url: url,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                $(_this).attr("disabled", true);
                $(_this).html('添加中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(_this).html("确 认");
            },
            success: function (data) {
                if (data.success) {
                    $.Tips("添加成功");
                    $(".full-content").find("a.am-close").click();
                    // 修改
                    getSensitiveWord();
                    // 修改结束
                } else {
                    $.Alert(data.errors);
                }
            }
        });
    }

    // 获取已添加的敏感词
    function getSensitiveWord() {
        $.ajax({
            method: "get",
            url: urls.qaUrl + "/QA_sensitive?" + "projectId=" + dataConfig.ProjectID + "&userId=" + dataConfig.userID,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    var _title = '';
                    var arr = [];
                    if (data.data.length > 0) {
                        for (let i = 0; i < data.data.length; i++) {
                            arr.push(data.data[i].sensitiveWord)
                        }
                        _title = '敏感词：' + arr.join(';');
                        $(".SensitiveWordCheck").parent().attr("title",_title);
                    }
                }
            }
        });
    }

    //显示拼写检查单词
    function showSpellingWord() {
        var tar = document.querySelectorAll("a.error_word"),
            spell = document.querySelector('.trans-spell');
        for (var i = 0, len = tar.length; i < len; i++) {
            (function (el) {
                tar[el].addEventListener("click", function (event) {
                    var e = event || window.event;
                    var _this = this;
                    e.stopPropagation();
                    if (spell.getBoundingClientRect().bottom - _this.getBoundingClientRect().bottom < $(_this).find("dl").height()) {
                        $(_this).find("dl").css('top', -($(_this).find("dl").height() + 5));
                    }
                    if (spell.getBoundingClientRect().right - _this.getBoundingClientRect().right < 165) {
                        $(_this).find("dl").css({'right': 0, 'left': 'auto'});
                    }
                    $("a.error_word>dl").css('display', 'none');
                    $(_this).find("dl").css('display', 'block');
                }, false);
            })(i);
        }
        $('.trans-spell').on("click", function () {
            $("a.error_word").find("dl").removeAttr('style');
        })
    }

    //QA添加空格检查、敏感词，弹出二级modal 停用2022-11-15-lwq
    // $(".SensitiveWordCheck").on("click", function () {
    //     var _this = this,
    //         _class = _this.className;
    //     if (_this.checked) {
    //         $(".fullBtn").click();
    //         $(".full-row").css('display', 'none');
    //         $(".full-row." + _class).css('display', 'block');
    //         $('.fullCompBtn').attr("data", _class);
    //     }
    // });
    $(".fullAddBtn,.fullCompBtn").on("click", function () {
        var _this = this;
        if ($(this).hasClass("fullAddBtn")) {
            var optionStr = "",
                parent = $(_this).parents("ul");
            optionStr = '<li class="full-row-li" style="margin-top:6px"><input type="text" value="" /></li>';
            parent.append(optionStr);
        } else {
            var _class = _this.getAttribute("data"),
                _tar = $('.full-row.' + _class).find('input');
            checkWordAndSpace(_this, _class, _tar);
        }
    });
    //QA全选
    $('#QA_AllCheck').on('click', function () {
        this.checked ? (
            $(".qaParamsList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
                // $("label.tab").css("display", "block")
        ) : (
            $(".qaParamsList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
                // $("label.tab").css("display", "none")
        );
    });
    $('#sign_all').on('click', function () {
        this.checked ? (
            $(".signList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
        ) : (
            $(".signList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
        );
    });
    $('#difference_all').on('click', function () {
        this.checked ? (
            $(".differenceList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
                // $(".differenceList>label.tab").css("display", "block")
        ) : (
            $(".differenceList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
                // $(".differenceList>label.tab").css("display", "none")
        );
    });
    $('#number_all').on('click', function () {
        this.checked ? (
            $(".numberList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
        ) : (
            $(".numberList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
        );
    });
    $('#sentence_all').on('click', function () {
        this.checked ? (
            $(".sentenceList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
                // $(".sentenceList>label.tab").css("display", "block")
        ) : (
            $(".sentenceList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
                // $(".sentenceList>label.tab").css("display", "none")
        );
    });
    $('#term_all').on('click', function () {
        this.checked ? (
            $(".termList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
        ) : (
            $(".termList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
        );
    });
    $('#remark_all').on('click', function () {
        this.checked ? (
            $(".remarkList").find("input[type='radio'],input[type='checkbox']").prop("checked", true)
        ) : (
            $(".remarkList").find("input[type='radio'],input[type='checkbox']").removeAttr("checked")
        );
    });
    var isTermLib = 'pro'; // 用以判断QA什么类型的术语库
    //QA检查项查询
    $("#qaSetBtn").on("click", function () {
        getQASet('manual');
    });
    // 获取QA设置参数
    let notUsedQaList = []; // 保存未使用参数再传回后端
    function getQASet(type) {
        notUsedQaList = [];
        const _this = this;
        $.ajax({
            method: "get",
            url: urls.qaUrl + "/QA_CheckParams",
            data: {
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID,
                fileIdAndPackId: {}
            },
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                $(_this).attr("disabled", true);
                $(_this).html('初始化<i class="am-icon-spinner am-icon-spin"></i>');
                $.LoadTips('加载中');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(_this).html('<i class="am-icon-cog"></i> QA设置');
                $(".my-loading").remove();
            },
            success: function (data) {
                if (data.success) {
                    if (type == 'manual') {
                        $(".qaHiddenSetBtn").click();
                    }
                    var params = $(".qaParamsList").find("input");
                    let isNewProject = false;//判断项目是否有检查当前任务包参数
                    for (var i = 0, len = data.data.length; i < len; i++) {
                        var _name = data.data[i].checkParams,
                            _checkSymbol = data.data[i].checkSymbol,
                            _checked = data.data[i].paramsSet
                        if (data.data[i].checkParams === 'NotSameTransOpenTaskPackCheck'){
                            isNewProject =true;
                        }
                        if (data.data[i].checkParams === 'IgnoreTag_NotSameTransCheck' || data.data[i].checkParams === 'TimeCheck' ||
                            data.data[i].checkParams === 'SameUpperCaseCheck' || data.data[i].checkParams === 'DateCheck'){
                            notUsedQaList.push({checkParams: data.data[i].checkParams,
                                paramsSet: data.data[i].paramsSet,
                                checkLevel: data.data[i].checkLevel,
                                userId: dataConfig.userID,
                                projectId: dataConfig.ProjectID})
                        }
                        for (var j = 0, jLen = params.length; j < jLen; j++) {
                            var opt = params[j];
                            if (_name == $(opt).attr("class") && _name !== 'MatchingRateCheck' && _name !== 'SpaceBeforePuncCheck') {
                                var _check = _checked == 1;
                                if ($(opt).attr("type") == "checkbox" || $(opt).attr("type") == "radio") {
                                    opt.checked = _check;
                                } else {
                                    opt.value = _checked;
                                }
                            } else if ($(opt).attr("class") == _name && _name == 'MatchingRateCheck') {
                                let _check1 = _checked == 0;
                                opt.checked = !_check1;
                                if (_check1) {
                                    matchQA.val(76);
                                } else {
                                    matchQA.val(_checked);
                                }
                            } else if ($(opt).attr("class") == _name && _name == 'SpaceBeforePuncCheck') {
                                let _check1 = _checked == 0;
                                opt.checked = !_check1;
                                if (_check1) {
                                    SpaceBeforePunc.val('');
                                } else {
                                    SpaceBeforePunc.val(_checkSymbol);
                                }
                            }
                        }
                    }
                    !isNewProject && $(".NotSameTransOpenTaskPackCheck,.NotSameOrigsOpenTaskPackCheck,.TermInconsistencyOpenTaskPackCheck").click();
                    if (baseFnObj.query("FileTBCheck").checked) {
                        isTermLib = 'tm'
                    } else {
                        isTermLib = 'pro'
                    }
                    getSensitiveWord();
                    // baseFnObj.query("OriAndTranSameCheck").checked && $("label.sen1").css("display", "block");
                    // baseFnObj.query("MatchNotEditCheck").checked && $("label.dif1").css("display", "block");
                    // baseFnObj.query("RepeatWordCheck").checked && $("label.dif2").css("display", "block");
                    // baseFnObj.query("NotSameTransCheck").checked && $("label.dif3").css("display", "block");
                    // baseFnObj.query("NotUseTBCheck").checked && $("label.term1").css("display", "block");
                } else {
                    $.Alert(data.errors);
                }
            }
        })
    };
    // QA参数匹配率限制
    $('input[name=setMatchQA]').blur(function () {
        var matchQA = $('input[name=setMatchQA]');
        if (matchQA.val() < 76) {
            $.Alert('匹配率需设置76%以上！');
            matchQA.val(76);
            return;
        }
        if (matchQA.val() > 101) {
            $.Alert('匹配率需设置101%以下！');
            matchQA.val(101);
            return;
        }
    });
    //QA检查项保存
    $("#qaSetParamsBtn").on("click", function () {
        var _this = this,
            params = {},
            checkList = [],
            options = $(".qaParamsList").find("input").not('input[name=QA_AllCheck]');
        isTermLib = 'pro'; // 清除之前的装状态
        checkList = notUsedQaList; // 先保存未使用参数
        for (var i = 0, item; item = options[i++];) {
            var ele = item;
            if (!$(ele).parent("label").hasClass("tab")) {
                //修改
                if (ele.getAttribute("type") != "number" && ele.className !== 'SpaceBeforePuncCheck' && ele.getAttribute("type") != "text") {
                    checkList.push({
                        checkParams: ele.className,
                        paramsSet: ele.checked ? 1 : 0,
                        checkLevel: "警告",
                        userId: dataConfig.userID,
                        projectId: dataConfig.ProjectID
                    });
                }
            //    修改结束
            }
        }
        if (baseFnObj.query("OriAndTranSameCheck").checked) {
            checkList.push({
                checkParams: "IgnoreCase_OriAndTranSameCheck",
                paramsSet: baseFnObj.query("IgnoreCase_OriAndTranSameCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
            checkList.push({
                checkParams: "IgnoreTag_OriAndTranSameCheck",
                paramsSet: baseFnObj.query("IgnoreTag_OriAndTranSameCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
        }
        if (baseFnObj.query("MatchNotEditCheck").checked) {
            checkList.push({
                checkParams: "OnlyConfirm_MatchNotEditCheck",
                paramsSet: baseFnObj.query("OnlyConfirm_MatchNotEditCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
            checkList.push({
                checkParams: "AllCheck_MatchNotEditCheck",
                paramsSet: baseFnObj.query("AllCheck_MatchNotEditCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
            if (baseFnObj.query("MatchingRateCheck").checked) {
                checkList.push({
                    checkParams: "MatchingRateCheck",
                    paramsSet:  matchQA.val(),
                    checkLevel: "警告",
                    userId: dataConfig.userID,
                    projectId: dataConfig.ProjectID
                })
            } else {
                checkList.push({
                    checkParams: "MatchingRateCheck",
                    paramsSet:  0,
                    checkLevel: "警告",
                    userId: dataConfig.userID,
                    projectId: dataConfig.ProjectID
                })
            }
        }
        if (baseFnObj.query("RepeatWordCheck").checked) {
            checkList.push({
                checkParams: "IgnoreCase_RepeatWordCheck",
                paramsSet: baseFnObj.query("IgnoreCase_RepeatWordCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
            checkList.push({
                checkParams: "IgnoreNumber_RepeatWordCheck",
                paramsSet: baseFnObj.query("IgnoreNumber_RepeatWordCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
        }
        if (baseFnObj.query("NotSameTransCheck").checked) {
            // checkList.push({
            //     checkParams: "NotSameTransOpenTaskPackCheck",
            //     paramsSet: baseFnObj.query("NotSameTransOpenTaskPackCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            // checkList.push({
            //     checkParams: "NotSameTransEntireProjectCheck",
            //     paramsSet: baseFnObj.query("NotSameTransEntireProjectCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            // checkList.push({
            //     checkParams: "IgnoreTag_NotSameTransCheck",
            //     paramsSet: baseFnObj.query("IgnoreTag_NotSameTransCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            checkList.push({
                checkParams: "IgnoreCase_NotSameTransCheck",
                paramsSet: baseFnObj.query("IgnoreCase_NotSameTransCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
        }
        if (baseFnObj.query("NotSameOrigsCheck").checked) {
            // checkList.push({
            //     checkParams: "NotSameOrigsOpenTaskPackCheck",
            //     paramsSet: baseFnObj.query("NotSameOrigsOpenTaskPackCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            // checkList.push({
            //     checkParams: "NotSameOrigsEntireProjectCheck",
            //     paramsSet: baseFnObj.query("NotSameOrigsEntireProjectCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            checkList.push({
                checkParams: "isIgnoreCase_NotSameOrigsCheck",
                paramsSet: baseFnObj.query("isIgnoreCase_NotSameOrigsCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            });
            // checkList.push({
            //     checkParams: "isIgnoreTag_NotSameOrigsCheck",
            //     paramsSet: baseFnObj.query("isIgnoreTag_NotSameOrigsCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
        }
        if (baseFnObj.query("NotUseTBCheck").checked) {
            checkList.push({
                checkParams: "IgnoreCase_NotUseTBCheck",
                paramsSet: baseFnObj.query("IgnoreCase_NotUseTBCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            })
        }
        if (baseFnObj.query("SpaceBeforePuncCheck").checked) {
            checkList.push({
                checkParams: "SpaceBeforePuncCheck",
                // 修改
                paramsSet: 1,
                checkSymbol: SpaceBeforePunc.val(),
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            })
        }else {
            checkList.push({
                checkParams: "SpaceBeforePuncCheck",
                paramsSet:  0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            })
        }
        // 修改结束
        if (baseFnObj.query("NotUseTBCheck").checked) {
            checkList.push({
                checkParams: "FileTBCheck",
                paramsSet: baseFnObj.query("FileTBCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID,
                fileids: dataConfig.ImportID_TB
            });
            checkList.push({
                checkParams: "FileTBCheckPro",
                paramsSet: baseFnObj.query("FileTBCheckPro").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID,
                fileids: dataConfig.ImportID_TB
            });
            if (baseFnObj.query("FileTBCheck").checked) {
                isTermLib = 'tm'
            } else {
                isTermLib = 'pro'
            }
        }
        if (baseFnObj.query("TermInconsistencyCheck").checked) {
            // checkList.push({
            //     checkParams: "TermInconsistencyOpenTaskPackCheck",
            //     paramsSet: baseFnObj.query("TermInconsistencyOpenTaskPackCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            // checkList.push({
            //     checkParams: "TermInconsistencyEntireProjectCheck",
            //     paramsSet: baseFnObj.query("TermInconsistencyEntireProjectCheck").checked ? 1 : 0,
            //     checkLevel: "警告",
            //     userId: dataConfig.userID,
            //     projectId: dataConfig.ProjectID
            // });
            checkList.push({
                checkParams: "IgnoreCase_TermInconsistencyCheck",
                paramsSet: baseFnObj.query("IgnoreCase_TermInconsistencyCheck").checked ? 1 : 0,
                checkLevel: "警告",
                userId: dataConfig.userID,
                projectId: dataConfig.ProjectID
            })
        }
        params.userId = dataConfig.userID;
        params.projectId = dataConfig.ProjectID;
        params.CheckParams = checkList;
        params.fileIdAndPackId = {};
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_CheckParams_insert",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                $(_this).attr("disabled", true);
                $(_this).html('保存中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(_this).html("确 认");
            },
            success: function (data) {
                if (data.success) {
                    $(_this).next("button").click();
                } else {
                    $.Alert(data.errors);
                }
            }
        });

    });

    //QA检查
    $("#qaRunBtn,span.qa-sort").on("click", function () {
        $("#page-container-static-normal").unbind('pageChanged').html('');
        var _this = this,
            sort = $('span.qa-sort').attr('data'),
            params = {};
        if (_this.classList.contains('qa-sort')) {
            if (sort == '0') {
                _this.setAttribute('data', '1');
                _this.innerHTML = '句段 <i class="am-icon-caret-down"></i>';
            } else {
                _this.setAttribute('data', '0');
                _this.innerHTML = '句段 <i class="am-icon-caret-up"></i>';
            }
            sort = _this.getAttribute('data');
        }
        $.LoadTips('QA检查中');
        var fileIdAndPackId = {};
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            fileIdAndPackId[dataConfig.dataList[i].Fileid] = packid;
        };
        if (isTermLib === 'tm') {
            params.fileids = dataConfig.DataBaseId_TB
        } else {
            params.fileids = []
        }

        params.userId = dataConfig.userID;
        params.projectId = dataConfig.ProjectID;
        params.isRepeat = [0, 3];
        params.isLock = false;
        params.langTypeO = dataConfig.sourceLan;
        params.langTypeT = dataConfig.targetLan;
        params.langType = dataConfig.targetLan;
        params.sortType = sort;
        params.fileIdAndPackId = fileIdAndPackId;
        params.confirmRole = $('script.current').attr('data-link');
        params.page = 1;
        params.checkName = [];
        params.size = localParam.qaPageSize;
        params.ignore = $("input[name=ignore]").is(":checked");
        params.notIgnore = $("input[name=noIgnore]").is(":checked");
        dataConfig.qaParams = params;
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_check",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                if (_this.id === 'qaRunBtn') {
                    $(_this).attr("disabled", true);
                    // $("#qa_page_num").selected('disable');
                    $("#qa_page_num").attr("disabled", true);
                    $("#qa_count").html('共计 -- 条 ');
                    $(_this).html('检查中<i class="am-icon-spinner am-icon-spin"></i>');
                }
                $(".qa-isIgnore").attr("disabled", true);
                $("tbody.qaList").empty();
                $(".qa-container").hide();
            },
            complete: function () {
                if (_this.id === 'qaRunBtn') {
                    $(_this).removeAttr("disabled");
                    // $("#qa_page_num").selected('enable');
                    $("#qa_page_num").removeAttr("disabled");
                    $(_this).html("QA检查");
                }
                $(".qa-isIgnore").removeAttr("disabled");
                $(".my-loading").remove();
                $('input[name="qaCheckList"]').removeAttr('checked');
            },
            success: function (data) {
                if (data.success) {
                    data.data.length === 0 && $.Tips("无QA数据");
                    var listStr = "";
                    for (var i = 0, iLen = data.data.length; i < iLen; i++) {
                        var pattern = new RegExp("[<>]"); // 尖括号影响标签展示
                        if (pattern.test(data.data[i].detailName)) { // 转义<>
                            data.data[i].detailName = data.data[i].detailName.replace(/</g, '&lt;');
                            data.data[i].detailName = data.data[i].detailName.replace(/>/g, '&gt;');
                            // data.data[i].detailName = data.data[i].detailName.replace(/'/g, '&#39;');
                            // data.data[i].detailName = data.data[i].detailName.replace(/"/g, '&quto;');
                        };
                        var jsonStr = "";
                        data.data[i].suggest && (jsonStr = JSON.stringify(data.data[i].suggest));
                        // 含有是否忽略
                        listStr += `<tr class='qa-tr' tooltips='${data.data[i].checkName}' data-id="${data.data[i].sentenceId}" data-sen='${data.data[i].sen}' data-json='${jsonStr}' data-fid='${data.data[i].fileId}' data-comparFileId='${data.data[i].comparFileId}'>
                                        <td class="clickTd" width='38'><input type="checkbox" name="ingoreCheck" ${(data.data[i].ignoreFlag === 0)?"disabled=true'":''} value='${data.data[i].detailName}' data-checkName="${data.data[i].checkName}"  data-check="${data.data[i].checkParam}" data-id="${data.data[i].sentenceId}" data-fid='${data.data[i].fileId}' data-pid='${data.data[i].packId}' data-fileName="${data.data[i].filename}" data-checkLevel="${data.data[i].checkLevel}" /></td>
                                        <td class="clickTd" width='55'>${data.data[i].sentenceId}</td>
                                        <td class="clickTd" width='55' title="${data.data[i].filename}" style="overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">${data.data[i].filename}</td>
                                        <td class='qa-select clickTd'>${data.data[i].checkName}</td>
                                        <td class="clickTd" title='${data.data[i].detailName}' style="min-width: 70px;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">${data.data[i].detailName}</td>
                                        <td width='50' style="position:relative;padding:0.4em 0">
                                        ${data.data[i].ignoreFlag === 0 ? data.data[i].checkLevel : `<span class="qa-down-span clickSpan">${data.data[i].checkLevel} <i class="am-icon-caret-down"></i></span>
                                            <input type="hidden" value='${data.data[i].detailName}' data-check="${data.data[i].checkName}" data-checkParam="${data.data[i].checkParam}" data-id="${data.data[i].sentenceId}" data-fid='${data.data[i].fileId}' data-pid='${data.data[i].packId}' data-fileName="${data.data[i].filename}" data-checkLevel="${data.data[i].checkLevel}"/>`}
                                        </td>
                                     </tr>`;
                    }
                    $("tbody.qaList").html(listStr);
                    // QA检查分页
                    $("#qa_count").html('共计' + data.total + '条 ');
                    $(".pageBox").css('display','block');
                    $("#page-container-static-normal").page({
                        count:data.total,
                        pageSize:params.size,
                        theme:"normal"
                    });
                    $("#page-container-static-normal").on("pageChanged",function (event,item) {
                        params.page = +item.pageNum;
                        qaNext(params);
                        $(this).data("page").refresh(item);
                    });
                    $(".qa-containerEvaluat").hide();
                    $(".qa-table").show();
                    $(".qa-container").show();
                } else {
                    $.Alert(data.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                console.log(err)
                err.responseJSON && $.Alert(err.responseJSON.msg);
            }
        })
    });
    //QA分页选择
    if (localStorage.getItem('qaPageSize')){
        let m = $("#qa_page_num").find('option');
        for(let i=0;i<=m.length;i++) {
            if(m[i].value === localStorage.getItem('qaPageSize')) {
                m[i].selected=true;
                // $("#qa_page_num").trigger('changed.selected.amui');
                break;
            }
        }
    }

    $("#qa_page_num").on('change',function () {
        localStorage.setItem('qaPageSize',$(this).val());
        localParam.qaPageSize = Number($(this).val());
        $("#qaRunBtn").click();
    });
    //QA跳转页面
    function qaNext(params,isInspect){
        dataConfig.qaParams = params;
        isInspect && $("#page-container-static-normal").unbind('pageChanged').html('');
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_nextPage",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                $.LoadTips('加载中');
            },
            complete: function () {
                $(".my-loading").remove();
            },
            success: function (data) {
                if (data.data && data.data.length > 0){
                    let listStr = "";
                    for (var i = 0, iLen = data.data.length; i < iLen; i++) {
                        var pattern = new RegExp("[<>]"); // 尖括号影响标签展示
                        if (pattern.test(data.data[i].detailName)) { // 转义<>
                            data.data[i].detailName = data.data[i].detailName.replace(/</g, '&lt;');
                            data.data[i].detailName = data.data[i].detailName.replace(/>/g, '&gt;');
                            // data.data[i].detailName = data.data[i].detailName.replace(/'/g, '&#39;');
                            // data.data[i].detailName = data.data[i].detailName.replace(/"/g, '&quto;');
                        };
                        var jsonStr = "";
                        data.data[i].suggest && (jsonStr = JSON.stringify(data.data[i].suggest));
                        // 含有是否忽略
                        listStr += `<tr class='qa-tr' tooltips='${data.data[i].checkName}' data-id="${data.data[i].sentenceId}" data-sen='${data.data[i].sen}' data-json='${jsonStr}' data-fid='${data.data[i].fileId}' data-comparFileId='${data.data[i].comparFileId}'>
                                        <td class="clickTd" width='38'><input type="checkbox" name="ingoreCheck" ${(data.data[i].ignoreFlag === 0)?"disabled=true'":''} value='${data.data[i].detailName}' data-checkName="${data.data[i].checkName}"  data-check="${data.data[i].checkParam}" data-id="${data.data[i].sentenceId}" data-fid='${data.data[i].fileId}' data-fileName="${data.data[i].filename}" data-checkLevel="${data.data[i].checkLevel}" /></td>
                                        <td class="clickTd" width='55'>${data.data[i].sentenceId}</td>
                                        <td class="clickTd" width='55' title="${data.data[i].filename}" style="overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">${data.data[i].filename}</td>
                                        <td class='qa-select clickTd'>${data.data[i].checkName}</td>
                                        <td class="clickTd" title='${data.data[i].detailName}' style="min-width: 70px;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">${data.data[i].detailName}</td>
                                        <td width='50' style="position:relative;padding:0.4em 0">
                                        ${data.data[i].ignoreFlag === 0 ? data.data[i].checkLevel : `<span class="qa-down-span clickSpan">${data.data[i].checkLevel} <i class="am-icon-caret-down"></i></span>
                                            <input type="hidden" value='${data.data[i].detailName}' data-check="${data.data[i].checkName}" data-checkParam="${data.data[i].checkParam}" data-id="${data.data[i].sentenceId}" data-fid='${data.data[i].fileId}' data-fileName="${data.data[i].filename}" data-checkLevel="${data.data[i].checkLevel}"/>`}
                                        </td>
                                     </tr>`;
                    }
                    $("tbody.qaList").html(listStr);
                    $("#qa_count").html('共计' + data.total + '条 ');
                    $(".pageBox").css('display','block');
                    $(".qa-containerEvaluat").hide();
                    $(".qa-table").show();
                    $(".qa-container").show();
                    if (isInspect){
                        // QA检查分页
                        $("#page-container-static-normal").page({
                            count:data.total,
                            pageSize:params.size,
                            theme:"normal"
                        });
                        $("#page-container-static-normal").on("pageChanged",function (event,item) {
                            params.page = +item.pageNum;
                            qaNext(params);
                            $(this).data("page").refresh(item);
                        })
                    }
                }else {
                    $("#qa_count").html('共计0条 ');
                    $.Tips('无数据');
                }
            }
        })
    }
    //QA筛查是否忽略
    $('input[name="ignore"],input[name="noIgnore"]').on('click', function () {
        if (!$("input[name=ignore]").prop('checked') && !$("input[name=noIgnore]").prop('checked')){
            $.Tips("至少选中一个QA筛查");
            $("input[name=noIgnore]").prop("checked", true);
        }
        let condition ='';
        if ($("input[name=ignore]").prop('checked'))condition += '-已忽略';
        if ($("input[name=noIgnore]").prop('checked'))condition += '-未忽略';
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','QA','QA筛查',baseFnObj.currentLink() + condition]);//埋点
        // $("#qaRunBtn").click();
        let filterArr = [],
            checkedList = $('input[name="qaCheckList"]'),
            elList = $('tr.qa-tr');
        elList.addClass('hide');
        $('dl.qa-down-list').remove();
        $('input[name=allIgnoreCheck]').prop('checked', false);
        $("input[name=ingoreCheck]").prop('checked', false);
        checkedList.toArray().forEach( item => {
            item.checked && filterArr.push(item.value);
        });
        let params = {};
        var fileIdAndPackId = {};
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            fileIdAndPackId[dataConfig.dataList[i].Fileid] = dataConfig.dataList[i].Packid;
        }
        if (isTermLib === 'tm') {
            params.fileids = dataConfig.DataBaseId_TB
        } else {
            params.fileids = []
        }
        params.userId = dataConfig.userID;
        params.projectId = dataConfig.ProjectID;
        params.isRepeat = [0, 3];
        params.isLock = false;
        params.langTypeO = dataConfig.sourceLan;
        params.langTypeT = dataConfig.targetLan;
        params.langType = dataConfig.targetLan;
        params.sortType = $("span.qa-sort").attr('data');
        params.fileIdAndPackId = fileIdAndPackId;
        params.confirmRole = $('script.current').attr('data-link');
        params.page = 1;
        params.size = localParam.qaPageSize;
        params.checkName = filterArr;
        params.ignore = $("input[name=ignore]").is(":checked");
        params.notIgnore = $("input[name=noIgnore]").is(":checked");
        qaNext(params,'true');
    });
    //筛选QA检查
    $('input[name="qaCheckList"]').on('click', function () {
        var filterArr = [],
            filterFidList = [],
            filterList = [];
        var checkedList = $('input[name="qaCheckList"]'),
            elList = $('tr.qa-tr');
        elList.addClass('hide');
        $('dl.qa-down-list').remove();
        $('input[name=allIgnoreCheck]').prop('checked', false);
        $("input[name=ingoreCheck]").prop('checked', false);
        checkedList.toArray().forEach((item, index) => {
            // var val;
            if (item.checked) {
                // val = item.value;
                // for (var i = 0, el; el = elList[i++];) {
                //     var sid = $(el).attr('data-id'),
                //         fid = $(el).attr('data-fid'),
                //         senid = $(el).attr('data-sen');
                //     var tip = el.getAttribute('tooltips');
                //     if (tip === val) {
                //         filterList.push(sid);
                //         filterFidList.push(fid);
                //         $(el).removeClass('hide');
                //     }
                //     if (tip === '不一致检查' && senid) {
                //         filterList.push(senid);
                //         filterFidList.push(fid);
                //     }
                // }
                filterArr.push(item.value);
            }
        });
        let params = {};
        var fileIdAndPackId = {};
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            fileIdAndPackId[dataConfig.dataList[i].Fileid] = dataConfig.dataList[i].Packid;
        }
        if (isTermLib === 'tm') {
            params.fileids = dataConfig.DataBaseId_TB
        } else {
            params.fileids = []
        }

        params.userId = dataConfig.userID;
        params.projectId = dataConfig.ProjectID;
        // params.packId1 = packArr;
        // params.files = fileArr;
        params.isRepeat = [0, 3];
        params.isLock = false;
        params.langTypeO = dataConfig.sourceLan;
        params.langTypeT = dataConfig.targetLan;
        params.langType = dataConfig.targetLan;
        params.sortType = $("span.qa-sort").attr('data');
        params.fileIdAndPackId = fileIdAndPackId;
        params.confirmRole = $('script.current').attr('data-link');
        params.page = 1;
        params.size = localParam.qaPageSize;
        params.checkName = filterArr;
        params.ignore = $("input[name=ignore]").is(":checked");
        params.notIgnore = $("input[name=noIgnore]").is(":checked");
        let isInspect = true;
        qaNext(params,isInspect);
        filterArr.length === 0 && elList.removeClass('hide');
        // var dumplicateArr = [...new Set(filterList)];
        // var fidArr = [...new Set(filterFidList)];
        // loadPage.filterQA(dumplicateArr, fidArr, filterArr);
    });
    //忽略（多项）
    $('#qaIgnoreBtn').on('click', function () {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','QA','批量忽略',baseFnObj.currentLink()]);//埋点
        var _this = this;
        var checkedBoxAll = $('input[name=ingoreCheck]');
        var checkedBox = $('input[name=ingoreCheck]:checked');
        if (checkedBox.length < 1) {
            $.Tips('未选择忽略项');
            return;
        }
        var allMsg = [];
        var ignoreList = [];
        checkedBox.toArray().forEach(function (item) {
            allMsg.push(item)
            // if (item.dataset.check == '不一致检查' || item.dataset.check == '重复单词检查' || item.dataset.check == '术语检查') {
            //     checkedBoxAll.toArray().forEach(function (index) {
            //         if (item.dataset.check == index.dataset.check) {
            //             index.checked = true;
            //             allMsg.push(index)
            //         }
            //     })
            // } else {
            //     allMsg.push(item)
            // }
        });
        let fileIdAndPackId = {};
        for (let i = 0; i < allMsg.length; i++) {
            if (fileIdAndPackId[allMsg[i].dataset.fid]){
                fileIdAndPackId[allMsg[i].dataset.fid].push(allMsg[i].dataset.pid);
            }else {
                fileIdAndPackId[allMsg[i].dataset.fid] = [allMsg[i].dataset.pid];
            }
            fileIdAndPackId[allMsg[i].dataset.fid] = Array.from(new Set(fileIdAndPackId[allMsg[i].dataset.fid]));
            var params = {
                projectId: dataConfig.ProjectID,
                userId: dataConfig.userID,
                fileId: allMsg[i].dataset.fid,
                packId: allMsg[i].dataset.pid,
                sentenceId: allMsg[i].dataset.id,
                checkParam: allMsg[i].dataset.check,
                message: allMsg[i].value,
                isAllIgnore: 0,
                checkName:allMsg[i].dataset.checkname,
                filename: allMsg[i].dataset.filename,
                detailName: allMsg[i].value,
                checkLevel: allMsg[i].dataset.checklevel
            };
            ignoreList.push(params);
        }
        checkedBox = $('input[name=ingoreCheck]:checked');
        var jsonModel={
            fileIdAndPackId: fileIdAndPackId,
            ignoreList: ignoreList
        };
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_Ignore",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(jsonModel),
            beforeSend: function () {
                $(_this).attr("disabled", true);
                $(_this).html('忽略中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function (xhr) {
                $(_this).removeAttr("disabled");
                $(_this).html('批量忽略');
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                    $.Tips("已忽略");
                    checkedBox.toArray().forEach(function (item) {
                        var tr = $(item).parents('tr.qa-tr');
                        tr.remove();
                    });
                    qaNext(dataConfig.qaParams);
                }
            }
        });
    });
    /*
        ******* 公有方法  *******
    */
    //忽略检查(全部)
    function ignoreQAResultAll(_this, _index) {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','QA','全部忽略',baseFnObj.currentLink() + '-' + _this.dataset.checkname]);//埋点
        let fileIdAndPackId = {};
        fileIdAndPackId[_this.dataset.fid] = [_this.dataset.pid];
        var params = {
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            fileId: _this.dataset.fid,
            packId: _this.dataset.pid,
            sentenceId: _this.dataset.id,
            checkParam: _this.dataset.check,
            message: _this.value,
            isAllIgnore: 1,
            checkName:_this.dataset.checkname,
            filename: _this.dataset.filename,
            detailName: _this.value,
            checkLevel: _this.dataset.checklevel
        };
        var ignoreList = [];
        ignoreList.push(params);
        var jsonModel={
            fileIdAndPackId: fileIdAndPackId,
            ignoreList: ignoreList
        };
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_Ignore",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(jsonModel),
            complete: function (xhr) {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                    $.Tips("已忽略");
                    var arr = $('tr.qa-tr input[type="hidden"]');
                    for (let i = 0; i < arr.length; i++) {
                        if ($(arr[i]).attr('value') === _this.value) {
                            $(arr[i]).parents('tr').remove()
                        }
                    }
                    $("dl.qa-down-list").remove();
                    qaNext(dataConfig.qaParams);
                }
            }
        });
    }
    //忽略检查
    function ignoreQAResult(_this, _index) {
        let fileIdAndPackId = {};
        fileIdAndPackId[_this.dataset.fid] = [_this.dataset.pid];
        var params = {
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            fileId: _this.dataset.fid,
            packId: _this.dataset.pid,
            sentenceId: _this.dataset.id,
            checkParam: _this.dataset.check,
            message: _this.value,
            isAllIgnore: 0,
            checkName:_this.dataset.checkname,
            filename: _this.dataset.filename,
            detailName: _this.value,
            checkLevel: _this.dataset.checklevel
        };
        var ignoreList = [];
        ignoreList.push(params);
        var jsonModel={
            fileIdAndPackId: fileIdAndPackId,
            ignoreList: ignoreList
        };
        $.ajax({
            method: "post",
            url: urls.qaUrl + "/QA_Ignore",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(jsonModel),
            complete: function (xhr) {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                    $.Tips("已忽略");
                    $("tr.qa-tr").eq(_index).remove();
                    $("dl.qa-down-list").remove();
                    qaNext(dataConfig.qaParams);
                }
            }
        });
    }

    //记录是否引用TB术语
    function tbMatchRecord(list) {
        var params = {
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            tbMatchModelList: list
        };
        $.ajax({
            type: "post",
            url: urls.qaUrl + "/QA_TBMatchRecord",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params)
        });
    }

    //输入停顿后发送请求
    let count = 0, timer = '', val = ''
    function pauseSend(tarText, wid, fid, pid) {
        // 初始化
        count = 0
        if (timer) {
            clearInterval(timer)
        }
        // 获取输入值
        if (val.length !== tarText.length) {
            val = String(tarText)
            if (!val.length) {
                return
            }
        }
        // 定时器判断空闲时发送请求
        timer = setInterval(function () {
            ++count
            if (count >= 10) {
                spellingCheck(tarText, wid, fid, pid);
                clearInterval(timer)
            }
        }, 100)
    }

    //拼写检查
    function spellingCheck(tarText, wid, fid, pid, cache) {
        if (!tarText.trim()) return;
        var params = {
            langType: dataConfig.targetLan,
            str: tarText,
            // sentence: sen,
            // sentenceId: wid,
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            // fileId1: fid,
            // isLock: '0',
            // isRepeat: [0, 3],
            // fileIdAndPackId: {}
        };
        spellTxt = tarText;
        if ($('.trans-spell').hasClass('add_hidden')) {
            return;
        }
        if (cache && dataConfig.sentence.tar[fid+wid]){
            spellingCheckShow(dataConfig.sentence.tar[fid+wid],wid,fid,pid);
            return;
        }
        $.ajax({
            url: urls.qaUrl + "/SpellingCheck",
            type: "post",
            dataType: "json",
            // data: JSON.stringify(params),
            data: params,
            beforeSend: function () {
                $('div.trans_spell').empty();
            },
            success: function (data, text, xhr) {
                dataConfig.sentence.tar[fid+wid] = data;
                if (data.success && data.data.length > 0) {
                    spellingCheckShow(data,wid,fid,pid);
                }else {
                    $(".trans_spell").html(`<div style="height: 90px;display:flex;justify-content:center;align-items:center;text-align: center;font-size: 12px;color: #999;">无数据</div>`);
                }
            }
        });
    }
    // 拼写检查渲染
    function spellingCheckShow(data,wid,fid,pid){
        var str = data.msg.replace(/</g, "&lt;").replace(/>/g, "&gt;"), allStr = "";
        for (var i = 0; i < data.data.length; i++) {
            var posi = 0;
            var items = "", listStr = "", itemsStr = "";
            var reg = null;
            try {
                reg = new RegExp(data.data[i].errorWord, 'g');
            } catch (err) {
                reg = data.data[i].errorWord;
            }
            if (data.data[i].suggestWords){
                for (var j = 0, jLen = data.data[i].suggestWords.length; j < jLen; j++) {
                    itemsStr += "<font class='spellCopy' ondblclick='dealTranObj.copySpelling(\"" + data.data[i].suggestWords[j] + "\",\"" + wid + "\",\"" + data.data[i].errorWord + "\",\"" + fid + "\", \"" + pid + "\")'>" + data.data[i].suggestWords[j] + "</font>" + "，";
                }
                itemsStr = itemsStr.slice(0, -1);
                items += '<dd>' + itemsStr + '</dd>';
                if (data.data[i].suggestWords.length > 0) {
                    listStr = '<dt>可能需要的单词：</dt>' + items;
                }
            }
            if (data.data[i].errorWord){
                posi = str.indexOf(data.data[i].errorWord, posi);
                allStr += str.substring(0, posi + data.data[i].errorWord.length).replace(reg, '<a class="error-word error_word"><span title="可能拼写错误的单词，点击查看">' + data.data[i].errorWord + '</span><dl><dd style="margin:0.3em 0"><button onclick="dealQaObj.addDictionary(\'' + wid + '\',\'' + data.data[i].errorWord + '\',\'' + fid + '\')">无误，加入词典</button></dd>' + listStr + '</dl></a>');
                str = str.substring(posi + data.data[i].errorWord.length);
            }
            i === (data.data.length - 1) && (allStr += str);
        }
        $(".trans_spell").html(allStr);
        showSpellingWord();
    }

    //评价
    var oriTxtEvaluate = '', // 接收参数 用来传参给提交按钮
        transTxtEvaluate = '',
        evaUserName = '',
        idCheckPANGU = "";

    function evaluateCheck(sen, fid, pid, oriTxt, transTxt) {
        idCheckPANGU = "";
        $('.evaluate_info').removeClass("add_hidden");
        var params = {
            fileid: fid,
            sentenceid: sen,
            projectid: dataConfig.ProjectID,
            packid: pid
        };
        if ($('.evaluate-info').hasClass('add_hidden')) {
            return;
        }
        oriTxtEvaluate = oriTxt;
        transTxtEvaluate = transTxt;
    }
    // 单句QA
    function evaluateCheck_QA(sen, fid, pid, oriTxt, transTxt, tr) {
        let arr = [];
        arr.push(pid);
        var params = {
            sentenceId: sen,
            sentence: transTxt,
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            isRepeat: [0, 3],
            isLock: false,
            langTypeO: dataConfig.sourceLan,
            langTypeT: dataConfig.targetLan,
            langType: dataConfig.targetLan,
            sortType: 0,
            confirmRole: $('script.current').attr('data-link'),
            fileIdAndPackId: {
                fid: arr
            }
        };
        $.ajax({
            url: urls.qaUrl + "/realTime_check",
            type: "post",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            success: function (data) {
                if (data.success) {
                    if (data.data.length > 0) {
                        var dataMsg = JSON.stringify(data.data);
                        // 特殊符号转义
                        dataMsg = dataMsg.trim().replace(/</g, '&lt;');
                        dataMsg = dataMsg.trim().replace(/>/g, '&gt;');
                        dataMsg = dataMsg.trim().replace(/"/g, '&quto;');
                        tr.find('td.target-text').append(`<div class="triangleQA" id="oneQA"
                                    onclick="event.stopPropagation();dealTranObj.showOneQAModal(this)"
                                    data-qa="${dataMsg}" ><i class="am-icon-exclamation"></i>
                                </div>`)
                        tr.find('td.target-text').css('overflow', 'hidden');
                    } else {
                        tr.find('td.target-text #oneQA').remove();
                        tr.find('td.target-text').css('overflow', '');
                    }
                } else {
                    tr.find('td.target-text #oneQA').remove();
                    tr.find('td.target-text').css('overflow', '');
                }
            }
        });
    };
    $(".evaluate-infoLable>:radio").click(function () {
        var options1 = $(".evaluateList").find("input[name='errorTypeMsg']");
        for (var i = 0; i < options1.length; i++) {
            $(options1[i]).parent().css("background", "#DFDFDF");
            $(options1[i]).parent().css("color", "#333");
        }
        $(this).parent().css("background", "#056655");
        $(this).parent().css("color", "#fff");
    });
    $(".evaluate-infoLable1>:radio").click(function () {
        var options2 = $(".evaluateList").find("input[name='level']");
        for (var i = 0; i < options2.length; i++) {
            $(options2[i]).parent().css("background", "#DFDFDF");
            $(options2[i]).parent().css("color", "#333");
        }
        $(this).parent().css("background", "#056655");
        $(this).parent().css("color", "#fff");
    });
    // 获取被评价人
    function getUserEvaluateData(pid) {
        var link = $('script.current').attr('data-link');
        var currentPhase = 0;
        switch (link) {
            case 'T':
                currentPhase = 2;
                break;
            case 'C':
                currentPhase = 3;
                break;
            case 'Q':
                currentPhase = 4;
                break;
            case 'P':
                currentPhase = 6;
                break;
        }
        $.ajax({
            // url: urls.qaUrl + "/getpackagestaff?packageId=" + pid + "&currentPhase=" + currentPhase,
            url: urls.chatRoomId + "/pm/transTask/getTransByPackageIds?packageId=" + pid + "&currentPhase=" + currentPhase,
            type: "post",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (res) {
                if (res.success) {
                    var container = document.getElementById('evaluateUserList');
                    var html = "";
                    if (res.data.length > 0) {
                        res.data.forEach((item, index) => {
                            let str = '';
                            if (item.staffType === '2') {
                                str = '翻译'
                            }
                            if (item.staffType === '3') {
                                str = '审校'
                            }
                            if (item.staffType === '4') {
                                str = 'QA'
                            }
                            html += `
                                <label class="evaluate-infoLable2"><input type="radio" name="evaUser" data-phase="${item.staffType}" data-pid="${pid}" value="${item.staffNum}" id="${item.staffNum}" onClick="dealQaObj.evaUserBtnClick(this)"/>${item.staffName}（${str}）</label>
                            `;
                        });
                        $('#evaluateBox').css("display", "block");
                    } else {
                        $.Alert("流程中暂未分配人员！");
                        $('#evaluateBox').css("display", "none");
                    }
                    container.innerHTML = html;
                    var optionsUser = $("#evaluateUserList").find("input");
                    for (var i = 0; i < optionsUser.length; i++) {
                        $(optionsUser[i]).parent().css("background", "#DFDFDF");
                        $(optionsUser[i]).parent().css("color", "#333");
                    };
                    $(optionsUser[optionsUser.length - 1]).attr('checked', 'true');
                    $(optionsUser[optionsUser.length - 1]).parent().css("background", "#056655");
                    $(optionsUser[optionsUser.length - 1]).parent().css("color", "#fff");
                    var UserID = $("input[name='evaUser']:checked").val();
                    var type = $("input[name='evaUser']:checked").attr('data-phase');
                    var packID = $("input[name='evaUser']:checked").attr('data-pid');
                    mustEvaFuc(UserID, packID, type);
                }
            }
        })
    }
    // 选择被评价人
    function evaUserBtnClick(_this) {
        $('.evaluateIsMust').remove();
        var options3 = $("#evaluateUserList").find("input[name='evaUser']");
        for (var i = 0; i < options3.length; i++) {
            $(options3[i]).parent().css("background", "#DFDFDF");
            $(options3[i]).parent().css("color", "#333");
        }
        $(_this).parent().css("background", "#056655");
        $(_this).parent().css("color", "#fff");
        var UserID = $("input[name='evaUser']:checked").val();
        var type = $("input[name='evaUser']:checked").attr('data-phase');
        var packID = $("input[name='evaUser']:checked").attr('data-pid');
        mustEvaFuc(UserID, packID, type);
    };
    //提交评价
    function submitEvaluateFnc(_that, subType) {
        var tr = $("tr.table-row.active");
        var params = {};
        var checkData = "";
        var link = $('script.current').attr('data-link');
        // 参数记录
        // phase：1 to "译前DTP",2 to "翻译",3 to "审校",4 to "QA",5 to "译后DTP",6 to "PM"
        var sourceText = _that.getAttribute('data-sou'),
            targetText = _that.getAttribute('data-tar'),
            fid = _that.getAttribute('data-fid'),
            pid = _that.getAttribute('data-pid'),
            wid = _that.getAttribute('data-wid'),
            fileName = _that.getAttribute('data-fileName'),
            className = _that.getAttribute('data-className');
        var phase = '';
        var currentPhase = 0;
        var levelData = $("input[name='level']:checked").val();
        var options = $(".evaluateList").find("input");
        for (var i = 0; i < options.length; i++) {
            if (options[i].checked) {
                checkData = options[i].value;
            }
        }
        sourceText = decodeURI(sourceText);
        targetText = decodeURI(targetText);
        switch (link) {
            case 'T':
                currentPhase = 2;
                break;
            case 'C':
                currentPhase = 3;
                break;
            case 'Q':
                currentPhase = 4;
                break;
            case 'P':
                currentPhase = 6;
                break;
        }
        var evaUserID = $("input[name='evaUser']:checked").val();
        var evaUserName = $("input[name='evaUser']:checked").parent().text();
        var judgePhase = $("input[name='evaUser']:checked").attr('data-phase');
        var typeNameErr = $("input[name='errorTypeMsg']:checked").attr('dataType');
        if (subType == '提交') {
            if (checkData == '' || checkData == undefined || checkData == null) {
                $.Alert('请选择评价的问题');
                return
            }
            if (levelData == '' || levelData == undefined) {
                $.Alert('请选择严重程度');
                return
            }
            if (className == 'edition-source') {
                params.evaluatedName = dataConfig.userNameDTP;
                params.evaluatedId = dataConfig.userIdDTP;
                phase = '1';
                params.description = $('#textareaSource').val();
            }
            if (className == 'edition-target') {
                if (evaUserID == '' || evaUserName == '' || evaUserID == undefined) {
                    $.Alert('请选择被评价人');
                    return
                }
                params.evaluatedName = evaUserName;
                params.evaluatedId = evaUserID;
                phase = judgePhase;
                params.description = $('#textareaTarget').val();
            }
            params.judgeMessage = $("input[name='errorTypeMsg']:checked").val();
            params.level = $("input[name='level']:checked").val();
        } else {
            params.judgeMessage = '正常';
            typeNameErr = '';
            params.level = 'ignore';
            if (className == 'edition-source') {
                params.description = $('#textareaSource').val();
                phase = '1';
                params.evaluatedName = dataConfig.userNameDTP;
                params.evaluatedId = dataConfig.userIdDTP;
            }
            if (className == 'edition-target') {
                params.description = $('#textareaTarget').val();
                phase = judgePhase;
                params.evaluatedName = evaUserName;
                params.evaluatedId = evaUserID;
            }
        };
        params.projectId = dataConfig.ProjectID;
        params.packageId = pid;
        params.fileName = fileName;
        params.fileId = fid;
        params.sentenceId = wid;
        params.origin = sourceText;
        params.translation = targetText;
        params.appraiserId = dataConfig.userID;
        params.appraiserName = dataConfig.userName;
        params.phase = phase;
        params.typeName = typeNameErr;
        params.ModifyTranslation = $(".edition-target[data-wid='" + wid + "']").text();
        $.ajax({
            type: "post",
            url: urls.qaUrl + "/insertPanGu?judgePhase=" + phase + "&currentPhase=" + currentPhase,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(params),
            beforeSend: function () {
                $.LoadTips('评价中');
            },
            success: function (data) {
                if (data.success) {
                    $(".my-loading").remove();
                    closeEvaluateBox();
                    $.Tips('评价成功');
                    if ($(tr).find('td.target-text').children('.evaluateTip').length === 0) {
                        var strEva = '';
                        strEva = `<div class="evaluateTip"
                            onclick="event.stopPropagation();dealQaObj.showEvaluateData(this)"
                            title="点击查看评价"
                            data-wid="${wid}" 
                             data-pid="${pid}" 
                             data-fid="${fid}">
                            </div>`
                        $(tr).find('td.target-text').append(strEva);
                    }
                } else {
                    $(".my-loading").remove();
                    $.Alert(data.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                err.responseJSON && $.Alert(err.responseJSON.msg);
            }
        });
    }

    // 获取评价结果
    function getEvaluateData(sen, fid, pid) {
        var params = {
            packageId: pid,
            projectId: dataConfig.ProjectID,
            fileId: fid,
            sentenceId: sen
        };
        var params1 = {
            packageId: pid,
            projectId: dataConfig.ProjectID,
            fileId: fid,
            source: dataConfig.sourceLan,
            target: dataConfig.targetLan
        };
        $.ajax({
            url: urls.qaUrl + "/getsentenceandwordsamount",
            type: "get",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: params1,
            success: function (data) {
                if (data.success) {
                    var container = document.getElementById('evaluateTitleData');
                    var html = "";
                        html += `
                                <span>已评价字数：${data.data.wordsAmount}</span>
                                <span style="margin-left: 20px;">已评价句段数：${data.data.sentenceEvaed}</span>
                                <!--<span style="margin-left: 20px;">还需评价句段数：${data.data.sentenceLeft2Eva}</span>-->
                                <span class="am-icon-question-circle evaluateBtnExplain" onclick="$('.evaluationExplainBtn').click()"></span>`;
                    var link = $('script.current').attr('data-link');
                    if (link !== 'ES' && link !== 'T') {
                        container.innerHTML = html;
                    }
                    $('.evaluateSen1').html('已评价句段：' + data.data.sentenceEvaed);
                }
            }
        });
        $.ajax({
            url: urls.qaUrl + "/gethistory",
            type: "get",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: params,
            success: function (res) {
                if (res.success) {
                    var container = document.getElementById('senHistoryEvaluateList');
                    var container1 = document.getElementById('taskHistoryEvaluateList');
                    var html = "";
                    var html1 = "";
                    if (res.data.length > 0) {
                        res.data.forEach((item, index) => {
                            var str = '/';
                            if (item.description) {
                                str = `<span style="color: #159396;" title="${item.description}">查看</span>`;
                            } else {
                                str = '/';
                            }
                            html += `<tr>
                                <td>${item.appraiserName}</td>
                                <td>${item.evaluatedName}</td>
                                <td>${item.phase}</td>
                                <td>${item.judgeMessage}</td>
                                <td>${item.level}</td>
                                <!--<td>${item.score}</td>-->
                                <td width="50">${str}</td>
                                <td>${item.modifiedTime}</td>
                            </tr>`;
                        });
                    } else {
                        html = `<tr>
                                    <td colspan="7">暂无数据</td>
                                </tr>`;
                    };
                    if (res.data1.length > 0) {
                        res.data1.forEach((item, index) => {
                            var str = '/';
                            if (item.description) {
                                str = `<span style="color: #159396;" title="${item.description}">查看</span>`;
                            } else {
                                str = '/';
                            }
                            html1 += `<tr>
                                <td width="50">${item.sentenceId}</td>
                                <td>${item.appraiserName}</td>
                                <td>${item.evaluatedName}</td>
                                <td>${item.phase}</td>
                                <td>${item.judgeMessage}</td>
                                <td>${item.level}</td>
                                <!--<td width="50">${item.score}</td>-->
                                <td width="50">${str}</td>
                                <td width="120">${item.modifiedTime}</td>
                            </tr>`;
                        });
                    } else {
                        html1 = `<tr>
                                    <td colspan="8">暂无数据</td>
                                </tr>`;
                    }
                    container.innerHTML = html;
                    container1.innerHTML = html1;
                }
            }
        });
    };

    // 取消评价（关闭评价弹窗）
    function closeEvaluateBox () {
        $('#evaluateBox').css("display", "none");
        $('#DTP-evaluateBox').css("display", "none");
        $('#textareaTarget').val('');
        $('#textareaSource').val('');
        $('#textareaTarget').next().find('i').html(0);
        $('#textareaSource').next().find('i').html(0);
        $('.evaluateIsMust').remove();
    };

    // 小三角切换评价tab并获取数据
    function showEvaluateData(_that) {
        var fid = _that.getAttribute('data-fid'),
            pid = _that.getAttribute('data-pid'),
            wid = _that.getAttribute('data-wid');
        getEvaluateData(wid, fid, pid);
        $('label._evaluate').click();
    };

    // 打开评价弹窗
    function openEvaluatePopup(that) {
        var editorCnt = $(that).parents("td");
        var editorCntTr = $(that).parents("tr");
        var sourceText = editorCntTr.find(".edition-source").text(),
            targetText = editorCntTr.find(".edition-target").text(),
            className = editorCnt.children('div').attr('class'),
            fid = editorCntTr.attr('data-fid'),
            pid = editorCntTr.attr('data-pid'),
            fileName = editorCntTr.attr('data-fname'),
            wid = editorCntTr.attr('data-no');
        var sou = encodeURI(sourceText);
        var tar = encodeURI(targetText);
        var link = $('script.current').attr('data-link');
        var options = $(".evaluateList").find("input");
        for (var i = 0; i < options.length; i++) {
            $(options[i]).parent().css("background", "#DFDFDF");
            $(options[i]).parent().css("color", "#333");
        };
        var htmlBtn = `
                <button id="evaluateNormalBtn" class="am-btn normal-btn" style="background: #159396;color: #fff;" 
                data-sou="${sou}" data-tar="${tar}" data-fid="${fid}" data-pid="${pid}" data-wid="${wid}" data-className="${className}" data-fileName="${fileName}"
                onClick="dealQaObj.submitEvaluateFnc(this, '正常')">正常</button>
                <button id="evaluateSubBtn" class="am-btn normal-btn" style="background: #159396;color: #fff;" 
                data-sou="${sou}" data-tar="${tar}" data-fid="${fid}" data-pid="${pid}" data-wid="${wid}" data-className="${className}" data-fileName="${fileName}"
                onClick="dealQaObj.submitEvaluateFnc(this, '提交')">提交</button>
                <button id="evaluateCancelBtn" class="am-btn normal-btn normal-bg-btn" style="" onClick="dealQaObj.closeEvaluateBox()">取消</button>`;
        var oMenuDTP = document.getElementById("DTP-evaluateBox");
        var oMenu = document.getElementById("evaluateBox");
        if (link !== 'ES' && link !== 'T') {
            if (dataConfig.isDTPevaluate) {
                if (className === 'edition-source') {
                    if (dataConfig.userIdDTP !== null) {
                        $('.textarea-comment').val('');
                        oMenu.style.display = "none";
                        oMenuDTP.style.display = "block";
                        // mustEvaFuc(dataConfig.userIdDTP, pid, '1');
                        $('.evaluateSen').html('当前句段：' + wid);
                        $('.evaluate_box_bottom').html(htmlBtn);
                    } else {
                        $.Alert('项目无DTP负责人，无法评价！');
                    }
                }
            }
            if (className === 'edition-target') {
                $('.textarea-comment').val('');
                oMenuDTP.style.display = "none";
                // oMenu.style.display = "block";
                oMenu.style.top = "25%";
                dealQaObj.getUserEvaluateData(pid);
                $('.evaluateSen').html('当前句段：' + wid);
                $('.evaluate_box_bottom').html(htmlBtn);
            }
        }
        if (link === 'T') {
            if (dataConfig.isDTPevaluate) {
                if (className === 'edition-source') {
                    if (dataConfig.userIdDTP !== null) {
                        $('.textarea-comment').val('');
                        oMenuDTP.style.display = "block";
                        // mustEvaFuc(dataConfig.userIdDTP, pid, '1');
                        $('.evaluateSen').html('当前句段：' + wid);
                        $('.evaluate_box_bottom').html(htmlBtn);
                    } else {
                        $.Alert('项目无DTP负责人，无法评价！');
                    }
                }
            }
        }
    };

    // 监听输入框字数
    (function () {
        $('#textareaSource,#textareaTarget,.remarkTxt').on('keyup',function () {
            let len = $(this).val().length;
            $(this).next().find('.entered').html(len);
        });
    })();

    // 获取任务是否必须评价
    function mustEvaFuc(UserID, packID, type) {
        $.ajax({
            method: "get",
            // url: urls.qaUrl + "/taskmusteva?" + "staffNum=" + UserID + "&taskPackageId=" + packID + "&taskType=" + type,
            url: urls.chatRoomId + "/pm/evaluate/isMustEvaluate?" + "staffNum=" + UserID + "&taskPackageId=" + packID + "&taskType=" + type,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    if (!data.data) {
                        let str = `<span class="am-icon-info-circle evaluateIsMust">该任务为非必评</span>`
                        $('.evaluate_box_top').append(str);
                    } else {
                        $('.evaluateIsMust').remove();
                    }
                }
            }
        });
    }

    //加入词典
    function addDictionary(sid, word, fid) {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','拼写检查','加入词典',baseFnObj.currentLink()]);//埋点
        var params = {
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            dicWord1: [{
                dicWord: word,
                projectId: dataConfig.ProjectID,
                userId: dataConfig.userID,
            }],
            fileIdAndPackId: {}
        };
        $.Confirm('确认加入词典吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                $.ajax({
                    type: "post",
                    url: urls.qaUrl + "/QA_DicRecord",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(params),
                    complete: function (xhr, err, text) {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            $.Tips('加入成功');
                            // dealQaObj.spellingCheck(spellTxt, sid, fid);
                            dealQaObj.pauseSend(spellTxt, sid, fid);
                        } else {
                            $.Alert('加入失败');
                        }
                    }
                });
            }
        });
    }

    //显示二级QA选项
    function showSecondOption(_this, el) {
        // _this.checked
        //     ? $(_this).parent().nextUntil("label[for='" + el + "']").css("display", "block")
        //     : $(_this).parent().nextUntil("label[for='" + el + "']").css("display", "none");
    }

    // $('#QA_AllCheck').click();
    // window.setTimeout(() => {
    //     getQASet('auto');
    // }, 5000);

    return {
        ignoreQAResult,
        ignoreQAResultAll,
        pauseSend,
        spellingCheck,
        evaluateCheck,
        evaluateCheck_QA,
        showSecondOption,
        tbMatchRecord,
        addDictionary,
        getEvaluateData,
        evaUserBtnClick,
        getUserEvaluateData,
        closeEvaluateBox,
        submitEvaluateFnc,
        showEvaluateData,
        openEvaluatePopup
    }
})(window, document, jQuery);

/*
    ***** object：处理原、译文翻译操作相关内容 *****
*/
var dealTranObj = (function (window, document, $) {

    var capsTimer = null;
    window.setInterval(function () {
        // newUpdateHistory(); // 暂不使用该方法
    }, 1000 * 60 * 2);

    /*
     * **** 私有方法 ****
    */

    //修改反馈数据
    function updateHistoryReview(data) {
        var json = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var params = {
                UserID: dataConfig.userID,
                ProjectID: dataConfig.ProjectID,
                FileID: data[i].FileID,
                WordID: data[i].WordID,
                PackID: data[i].PackID,
                Link: $('script.current').attr('data-link')  //处理环节：T、C、Q、P   译员、审校、QA、PM
            }
            json.push(params);
        }
        $.ajax({
            url: urls.editUrl + "/HistoryMsg/UpdHisReview",
            method: "post",
            dataType: "json",
            data: {JsonStr: JSON.stringify(json)}
        })
    }

    //间隔时间获取修改记录
    function newUpdateHistory() {
        var json = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var params = new Object();
                params.ProjectID = dataConfig.ProjectID;
                params.FileID = dataConfig.dataList[i].Fileid;
                params.UserID = dataConfig.userID;
                params.PackID = packid[j];
                params.Link = $('script.current').attr('data-link');  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
                json.push(params);
            }
        }
        $.ajax({
            method: "post",
            url: urls.editUrl + "/HistoryMsg/SelHisReview",
            dataType: "json",
            data: {JsonStr: JSON.stringify(json)},
            beforeSend: function () {
                $('.update_insert').prev('font').remove();
            },
            success: function (data) {
                if (data.success && data.data && data.data.length > 0) {
                    $('.update_insert').prev('label').remove();
                    $('.update_insert').before('<font class="new-message">你有新的信息，点击查看（' + data.data.length + '）</font>');
                    $('.new-message').on("click", function () {
                        updateHistoryReview(data.data);
                        $(".update_insert").next('.transTab').remove();
                        $(".update_insert").after($("#myUpdateAll").html());
                        var list = "";
                        for (var i = 0, len = data.data.length; i < len; i++) {
                            var tagTxt = data.data[i].TransChangeMarkList;
                            list += "<tr class='updateTr' data='{\"user\":\"" + data.data[i].UpdateUser + "\",\"time\":\"" + data.data[i].UpdateTime + "\",\"remark\":\"" + data.data[i].UpdateRemark + "\",\"node\":\"" + data.data[i].UpdateNode + "\"}' data-db='" + data.data[i].WordID + "' onclick='classOperation.jumpToPosition(\"" + data.data[i].WordID + "\")'>" + // 这里不修改传参的参数  后端更改了参数的值
                                "<td align='center'>" + data.data[i].WordID + "</td>" +
                                "<td><div class='hastag'>" + tagTxt + "</div></td>" +
                                "</tr>";
                        }
                        $(".updataList>tbody").html(list);
                        getHistoryDetail();
                        $(this).remove();
                        $('.update_insert').attr('data-toggle', "true");
                        $('.update_insert').before(`<label class="am-checkbox reset-info">
                                            <input type="checkbox" data-am-ucheck="" class="am-ucheck-checkbox" onclick="this.checked &&        $('.update_insert').removeAttr('data-toggle');!this.checked && $('.update_insert').attr('data-toggle','true')">
                                            <span class="am-ucheck-icons">
                                                <i class="am-icon-unchecked"></i>
                                                <i class="am-icon-checked"></i>
                                            </span>
                                            恢复查看单句记录
                                        </label>`);
                    });
                }
            }
        });
    }

    //替换详细修改信息
    function getHistoryDetail() {
        var tarList = $("tr.updateTr");
        for (var i = 0, len = tarList.length; i < len; i++) {
            tarList[i].onmousedown = function () {
                $(this).addClass("active").siblings().removeClass("active");
                var _this = this,
                    _parent = $(_this).parents('.transTab'),
                    $data = JSON.parse(_this.getAttribute("data"));
                _this.getAttribute("data") ? (
                    _parent.next(".transDetail").show(),
                        _parent.css("height", "calc(100% - 73px)")
                ) : (
                    _parent.next(".transDetail").hide(),
                        _parent.css("height", "auto")
                );
                _parent.next('ul').find("i.updateUser").html("修改人：" + $data.user).attr('title', $data.user);
                _parent.next('ul').find("i.updateTime").html("修改时间：" + $data.time).attr('title', $data.time);
                _parent.next('ul').find("i.updateNode").html("修改节点：" + $data.node).attr('title', $data.node);
                _parent.next('ul').find("i.updateInfo").html("备注信息：" + $data.remark).attr('title', $data.remark);
            }
        }
    }

    //获取当前光标位置
    function getCursortPosition(element) {
        var caretOffset = 0;
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection != "undefined") {//谷歌、火狐
            sel = win.getSelection();
            if (sel.rangeCount > 0) {//选中的区域
                var range = win.getSelection().getRangeAt(0);
                var preCaretRange = range.cloneRange();//克隆一个选中区域
                preCaretRange.selectNodeContents(element);//设置选中区域的节点内容为当前节点
                preCaretRange.setEnd(range.endContainer, range.endOffset);  //重置选中区域的结束位置
                caretOffset = preCaretRange.toString().length;
            }
        } else if ((sel = doc.selection) && sel.type != "Control") {//IE
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }
        return caretOffset;
    }

    /*
     ******* return methods ********
    */
    return {
        referSen: referSen,
        confirmPackTask: confirmPackTask,
        preTranLibrary: preTranLibrary,
        confirmTrans: confirmTrans,
        confirmSource: confirmSource,
        tempTrans: tempTrans,
        lockSentence: lockSentence,
        getProgress: getProgress,
        previewOriginal: previewOriginal,
        previewOriginalByPDF: previewOriginalByPDF,
        previewSupportOriginal: previewSupportOriginal,
        previewTranslation: previewTranslation,
        updateHistory: updateHistory,
        readHistory: readHistory,
        refuseTask: refuseTask,
        showRemarkModal: showRemarkModal,
        addRemark: addRemark,
        showOneQAModal: showOneQAModal,
        joinFrameSentence: joinFrameSentence,
        splitSentence: splitSentence,
        joinSentence: joinSentence,
        previewSentence: previewSentence,
        lock: lock,
        unlock: unlock,
        copySpelling: copySpelling,
        rootTranSource: rootTranSource,
        rootCopySource: rootCopySource,
        batchCopySource,
        batchDelTarget,
        tMSource,
        updateRemark,
        delRemark,
        remarkList,
        queryRemark,
        replaceLookup
    }

    //（批量）提交句段
    function referSen(flag) {
        var typemethod = '';
        var selectedTr = $('tr.table-row.selected'),
            link = $("script.current").attr("data-link");
        if (selectedTr.length < 1) {
            $.Alert('未选中句段（请点击句段编号处）');
            return;
        }
        var params = [];
        for (let i = 0, len = selectedTr.length; i < len; i++) {
            var obj = new Object();
            obj.ProjectID = dataConfig.ProjectID;
            obj.FileID = selectedTr[i].dataset.fid;
            obj.SubFlag = flag;
            obj.SenID = selectedTr[i].dataset.no;
            obj.UserName = dataConfig.userName;
            obj.UserId = dataConfig.userID;
            obj.ProjectCreatedTime = dataConfig.createdTime;
            obj.ImportedTM = dataConfig.ImportID_TM;
            params.push(obj);
        }
        switch (link) {
            case 'T':
                typemethod = 'SubmitT';
                break;
            case 'C':
                typemethod = 'SubmitC';
                break;
            case 'Q':
                typemethod = 'SubmitQ';
                break;
            case 'P':
                typemethod = 'SubmitP';
                break;
            case 'ES':
                typemethod = 'SubmitES';
                break;
        }
        $.LoadTips(flag ? '正在批量提交' : '正在批量取消');
        $.ajax({
            method: "post",
            url: urls.editUrl + "/" + typemethod + "/SubBatch",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                $(".my-loading").remove();
                if (data.success) {
                    $.LoadTips(`${flag ? '提交成功' : '取消成功'}，正在刷新`);
                    window.setTimeout(() => {
                        localParam.isFirst = true;
                        // loadPage.initPage($(selectedTr[0]).attr('data-no'), $(selectedTr[0]).attr('data-fid'),$(selectedTr[0]));
                        loadPage.initPage($(selectedTr[0]).attr('data-no'), $(selectedTr[0]).attr('data-fid'));
                    }, 1500);
                } else {
                    $.Alert("提交失败");
                }
            },
            error:function(err){
                $('.my-loading').remove();
                err.responseJSON && $.Alert(err.responseJSON.msg);
            }
        });
    }

    //全部提交
    function confirmPackTask(_this) {
        var typemethod = '';
        var activeTr = $('tr.table-row.active');
        var link = $("script.current").attr("data-link")
        var PackID = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = new Object();
                obj.PackID = packid[j];
                PackID.push(obj);
            }
        };
        var params = {
            ProjectCreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            PackID: PackID,
            UserName: dataConfig.userName,
            UserId: dataConfig.userID,
            ImportedTM: dataConfig.ImportID_TM
        };
        switch (link) {
            case 'T':
                typemethod = 'SubmitT';
                break;
            case 'C':
                typemethod = 'SubmitC';
                break;
            case 'Q':
                typemethod = 'SubmitQ';
                break;
            case 'P':
                typemethod = 'SubmitP';
                break;
            case 'ES':
                typemethod = 'SubmitES';
                break;
        }
        if (typemethod === 'SubmitES') {
            $.Confirm('请核查所有句段均为已确认提交状态，以免提交后数据未保存');
        } else {
            $.Confirm('确认提交全部译文吗？');
        }
        $('#my-confirm').modal({
            onConfirm: function (e) {
                if (typemethod === 'SubmitES') {
                    $.LoadTips('正在提交');
                } else {
                    $.LoadTips('正在全部提交');
                }
                $.ajax({
                    method: "post",
                    url: urls.editUrl + "/" + typemethod + "/PackTask",
                    dataType: "json",
                    data: JSON.stringify(params),
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $(_this).attr("disabled", true);
                        $(_this).html('提交中<i class="am-icon-spinner am-icon-spin"></i>');
                    },
                    complete: function () {
                        $(_this).removeAttr("disabled");
                        if (typemethod === 'SubmitES') {
                            $(_this).html("任务提交");
                        } else {
                            $(_this).html("全部提交");
                        }
                    },
                    success: function (data) {
                        $(".my-loading").remove();
                        if (data.success) {
                            $.LoadTips('提交成功，正在刷新');
                            window.setTimeout(() => {
                                localParam.isFirst = true;
                                if (activeTr.attr('data-no')){
                                    loadPage.initPage(activeTr.attr('data-no'), activeTr.attr('data-fid'),activeTr);
                                }else {
                                    localParam.pageNum = 1;
                                    loadPage.initPage();
                                }
                            }, dataConfig.allSubmitTime);//通过需要翻译句段数计算的等待时间
                        } else {
                            $.Alert("提交失败");
                        }
                    },
                    error:function(err){
                        $('.my-loading').remove();
                        $.Alert(err.responseJSON.msg);
                    }
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    //预翻过库
    function preTranLibrary(_this) {
        var activeTr = $('tr.table-row.active');
        var arr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                arr.push({
                    fileId: dataConfig.dataList[i].Fileid,
                    packId: packid[j]
                })
            }
        };
        var params = {
            fileList: arr,
            // fileId: arr.join(','),
            // LanguagePair: dataConfig.LangTypePair,
            projectId: dataConfig.ProjectID,
            userId: dataConfig.userID,
            link: $('script.current').attr('data-link')
            // ProjectCreatedTime: dataConfig.createdTime
        };
        $.Confirm('确认预翻过库操作吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                $.LoadTips('正在预翻过库');
                $.ajax({
                    method: "post",
                    // url: urls.editUrl + "/Corpus/AutoTransAfter",
                    url: urls.preLibUrl + "/pretreatment/transcation/postTranslationLibrary",
                    dataType: "json",
                    data: JSON.stringify(params),
                    contentType: "application/json;charset=utf-8",
                    beforeSend: function () {
                        $(_this).attr("disabled", true);
                        $(_this).html('过库中<i class="am-icon-spinner am-icon-spin"></i>');
                    },
                    complete: function () {
                        $(_this).removeAttr("disabled");
                        $(_this).html("预翻过库");
                    },
                    success: function (data) {
                        $(".my-loading").remove();
                        if (data.success) {
                            $.LoadTips(`${data.msg}正在刷新`);
                            window.setTimeout(() => {
                                localParam.isFirst = true;
                                if (activeTr.attr('data-no')){
                                    loadPage.initPage(activeTr.attr('data-no'), activeTr.attr('data-fid'),activeTr);
                                }else {
                                    localParam.pageNum = 1;
                                    loadPage.initPage();
                                }
                            }, 1500);
                        } else {
                            $.Alert(data.msg);
                        }
                    },
                    error:function(err){
                        $('.my-loading').remove();
                        err.responseJSON && $.Alert(err.responseJSON.msg);
                    }
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    //确认：译文提交
    function confirmTrans(tr, alt) {
        dataConfig.restrictions = Date.now();
        var link = $('script.current').attr('data-link');
        var isConfirm, tmPercent, typeofmethod,
            params = {};
        var targetDiv = $(tr).find('div.edition-target');
        var sourceDiv = $(tr).find('div.edition-source');
        isConfirm = $(tr).find(".confirm").attr("data-iscon");
        tmPercent = targetDiv.attr("data-tm");
        // 译文丢失做的规避方法
        var tarText = $(tr).find('div.edition-target').text().trim();
        var jsonData = dealTextObj.styleStringToList(targetDiv);
        var jsonDataSource = dealTextObj.styleStringToList(sourceDiv);
        var defaultEmpty = true;
        jsonData.forEach(function (item, index) {
            if(item.Value !== undefined && item.Value.trim() !== ''){
                defaultEmpty = false;
            }
        });
        if(tarText === '' || defaultEmpty){
            jsonData = dealTextObj.styleStringToList(targetDiv);
        }
        params = {
            SubmitTime:new Date().getTime(),
            CreatedTime: dataConfig.createdTime,
            FileID: $(tr).attr('data-fid'),
            IsSubmitScript: false, // 是否草稿状态
            JsonTrans: jsonData,
            LanguageMaps: dataConfig.LangTypePair,
            Link: link,
            MatchingRateTM: tmPercent,
            Origin: jsonDataSource,
            PackID:  $(tr).attr('data-pid'),
            ProjectID: dataConfig.ProjectID,
            SubmitMark: $(tr).find('.triangle').attr('data-mes')!=='null'? $(tr).find('.triangle').attr('data-mes'):'',
            UpdateUserID: dataConfig.userID,
            UpdateUserName: dataConfig.userName,
            WordID: $(tr).attr('data-no')
        };
        if (link === "T") {
            typeofmethod = 'SubmitT';
            params.IsConfirmStatus = +isConfirm === 0 ? 1 : 0;   // T
        } else if (link === "ES") {
            typeofmethod = 'SubmitES';
            params.IsConfirmStatus = +isConfirm === 0 ? 1 : 0;  // ES
        } else if (link === "C") {
            typeofmethod = 'SubmitC';
            params.IsConfirmStatus = +isConfirm < 3 ? 3 : 2;    // C
        } else if (link === "Q") {
            typeofmethod = 'SubmitQ';
            params.IsConfirmStatus = +isConfirm < 5 ? 5 : 4;    // Q
        } else if (link === "P") {
            typeofmethod = 'SubmitP';
            params.IsConfirmStatus = +isConfirm > -2 ? -2 : -1;   // P
        }
        let isShow = true;
        $.ajax({
            type: "post",
            url: urls.editUrl + "/" + typeofmethod + "/SubSen",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                dataConfig.currentSentence.push('q'+ params.FileID + params.WordID);
                setTimeout(() => {
                    if (isShow){
                        $(".noSubmitWarn").css('display','inline-block');
                        window.onbeforeunload = function(b) {
                            b = b || window.event;
                            let a = '确认离开吗？';
                            b.returnValue = a;//已不支持自定义提示文本
                            return a
                        }
                    }
                },500)
            },
            complete: function () {
                dataConfig.currentSentence = dataConfig.currentSentence.filter((item) => {
                    return item !== 'q'+ params.FileID + params.WordID;
                });
                if (dataConfig.currentSentence.length === 0){
                    isShow = false;
                    window.onbeforeunload = null;
                    $(".noSubmitWarn").css('display','none');
                }
            },
            success: function (data) {
                if (data.success) {
                    switch (link) {
                        case 'T':
                            isConfirm === '0' ? (
                                $(tr).attr("data-true", "ok"),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.yy),
                                    $(tr).find("td.confirm").attr({"data-iscon": "1", "title": "已翻译"}),
                                !alt && (
                                    $(tr).addClass("enterTag").siblings().removeClass("enterTag"),
                                        classOperation.scrollToNoConfirmSentence($(tr))
                                )
                            ) : (
                                $(tr).attr("data-true", ""),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.yy_no),
                                    $(tr).find("td.confirm").attr({"data-iscon": "0", "title": "未翻译"})
                            );
                            break;
                        case 'C':
                            +isConfirm < 3 ? (
                                $(tr).attr("data-true", "ok"),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.sh),
                                    $(tr).find("td.confirm").attr({"data-iscon": "3", "title": "已审核"}),
                                !alt && (
                                    $(tr).addClass("enterTag").siblings().removeClass("enterTag"),
                                        classOperation.scrollToNoConfirmSentence($(tr))
                                )
                            ) : (
                                $(tr).attr("data-true", ""),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.sh_no),
                                    $(tr).find("td.confirm").attr({"data-iscon": "2", "title": "未审核"})
                            );
                            break;
                        case 'Q':
                            +isConfirm < 5 ? (
                                $(tr).attr("data-true", "ok"),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.qa),
                                    $(tr).find("td.confirm").attr({"data-iscon": "5", "title": "已QA"}),
                                !alt && (
                                    $(tr).addClass("enterTag").siblings().removeClass("enterTag"),
                                        classOperation.scrollToNoConfirmSentence($(tr))
                                )
                            ) : (
                                $(tr).attr("data-true", ""),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.qa_no),
                                    $(tr).find("td.confirm").attr({"data-iscon": "4", "title": "未QA"})
                            );
                            break;
                        case 'P':
                            +isConfirm > -2 ? (
                                $(tr).attr("data-true", "ok"),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.pm),
                                    $(tr).find("td.confirm").attr({"data-iscon": "-2", "title": "PM已审核"}),
                                !alt && (
                                    $(tr).addClass("enterTag").siblings().removeClass("enterTag"),
                                        classOperation.scrollToNoConfirmSentence($(tr))
                                )
                            ) : (
                                $(tr).attr("data-true", ""),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.pm_no),
                                    $(tr).find("td.confirm").attr({"data-iscon": "-1", "title": "PM修改中"})
                            );
                            break;
                        case 'ES':
                            isConfirm === '0' ? (
                                $(tr).attr("data-true", "ok"),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.yy),
                                    $(tr).find("td.confirm").attr({"data-iscon": "1", "title": "已翻译"}),
                                !alt && (
                                    $(tr).addClass("enterTag").siblings().removeClass("enterTag"),
                                        classOperation.scrollToNoConfirmSentence($(tr))
                                )
                            ) : (
                                $(tr).attr("data-true", ""),
                                    $(tr).find("td.confirm>img").attr('src', iconsrc.yy_no),
                                    $(tr).find("td.confirm").attr({"data-iscon": "0", "title": "未翻译"})
                            );
                            break;
                    }
                    alt && classOperation.scrollNextSentence();
                    getProgress();
                    if (link !== "ES") {
                        dealQaObj.evaluateCheck_QA($(tr).attr('data-no'), $(tr).attr('data-fid'), $(tr).attr('data-pid'), $(tr).find('div.edition-source').text(), $(tr).find('div.edition-target').text(), $(tr));
                    }
                } else {
                    $.Alert(data.msg);
                }
            }
        })
    }

    //临时：译文提交
    function tempTrans(tarDiv) {
        var typeofmethod;
        var link = $('script.current').attr('data-link'),
            confirmEle = tarDiv.parents('tr').find(".confirm");
        var sourceDiv = tarDiv.parents('tr').find('div.edition-source');
        var jsonDataSource = dealTextObj.styleStringToList(sourceDiv);
        if (link === "T") {
            typeofmethod = 'SubmitT';// T
        } else if (link === "C") {
            typeofmethod = 'SubmitC';// C
        } else if (link === "Q") {
            typeofmethod = 'SubmitQ'; // Q
        } else if (link === "P") {
            typeofmethod = 'SubmitP'; // P
        } else if (link === "ES") {
            typeofmethod = 'SubmitES'; // ES
        }
        var isStatus = $.trim(tarDiv.text()) === ""
            && ((link === "T" && confirmEle.attr("data-iscon") === "0")
                || (link === "ES" && confirmEle.attr("data-iscon") === "0")
                || (link === "C" && confirmEle.attr("data-iscon") === "2")
                || (link === "Q" && confirmEle.attr("data-iscon") === "4")
                || (link === "P" && confirmEle.attr("data-iscon") === "-1"));
        if (isStatus) {
            status = "0";
        }
        // 规避译文丢失
        var jsonData = dealTextObj.styleStringToList(tarDiv);
        // for (let i = 0; i < 3; i++) {
        //     jsonData = dealTextObj.styleStringToList(tarDiv);
        // }
        var params = {
            SubmitTime:new Date().getTime(),
            CreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            FileID: tarDiv.attr("data-fid") || '',
            IsSubmitScript: true, // 是否草稿状态
            UpdateUserName: dataConfig.userName,
            UpdateUserID: dataConfig.userID,
            LanguageMaps: dataConfig.LangTypePair,
            Link: link,
            PackID: tarDiv.attr("data-pid") || '',
            WordID: tarDiv.attr("data-wid") || '',
            IsConfirmStatus: confirmEle.attr("data-iscon") || '',
            MatchingRateTM: tarDiv.attr("data-tm") || '',
            SubmitMark: tarDiv.parents('tr').find('.triangle').attr('data-mes')!=='null'?tarDiv.parents('tr').find('.triangle').attr('data-mes'):'',
            JsonTrans: jsonData,
            Origin: jsonDataSource
        };
        let isShow = true;
        $.ajax({
            method: "post",
            url: urls.editUrl + "/" + typeofmethod + "/SubSen?draft=1",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                dataConfig.currentSentence.push(params.FileID + params.WordID);
                setTimeout(() => {
                    if (isShow){
                        $(".noSubmitWarn").css('display','inline-block');
                        window.onbeforeunload = function(b) {
                            b = b || window.event;
                            let a = '确认离开吗？';
                            b.returnValue = a;//已不支持自定义提示文本
                            return a
                        }
                    }
                },500)
            },
            complete: function () {
                dataConfig.currentSentence = dataConfig.currentSentence.filter((item) => {
                    return item !== params.FileID + params.WordID;
                });
                if (dataConfig.currentSentence.length === 0){
                    isShow = false;
                    window.onbeforeunload = null;
                    $(".noSubmitWarn").css('display','none');
                }
            },
            success: function (data) {
                data.success && getProgress();
                if (!data.success && data.data !== '-2' && $.trim(tarDiv.text()) !== "") {
                    var tr = tarDiv.parents("tr");
                    var $tar = tr.find(".edition-target");
                    $.Alert(data.msg);
                    $("#addRemarkBtn").attr({
                        "data-proid": dataConfig.ProjectID,
                        "data-fid": $tar.attr("data-fid"),
                        "data-pid": $tar.attr("data-pid"),
                        "data-wid": $tar.attr("data-wid"),
                        "data-sts": tr.find('.triangle').attr('data-sts'),
                        "data-org": tr.attr("data-no")
                    });
                    $(".remarkTxt").val(new Date().toLocaleString('chinese',{hour12:false}) + " 译文提交失败");
                    document.querySelector(".checkRemark").checked = false;
                    addRemark(document.getElementById('addRemarkBtn'), "error");
                } else if (!data.success && data.data === '-2') {
                    $.Confirm(data.msg);
                    $('#my-confirm').modal({
                        onConfirm: function (e) {
                            const newParams = {};
                            Object.assign(newParams, _params, {GoSubSen: "-1"});
                            $.ajax({
                                method: "post",
                                url: urls.editUrl + "/" + typeofmethod + "/SubSen?time=" + $tar.attr("data-wid"),
                                dataType: "json",
                                data: {
                                    JsonStr: JSON.stringify(newParams),
                                    JsonTrans: JSON.stringify(dealTextObj.styleStringToList(tarDiv))
                                }
                            })
                        },
                        onCancel: function (e) {
                            console.log('cancel')
                        }
                    });
                }
            }
        })
    }

    //保存原文
    function confirmSource(tarDiv, pid, wid, fid) {
        var typeofmethod,
            link = $('script.current').attr('data-link');
        var params = {
            UserID: dataConfig.userID,
            PackID: pid,
            WordID: wid,
            ProjectID: dataConfig.ProjectID,
            FileID: fid,
            CreatedTime: dataConfig.createdTime,
            LanguageMaps: dataConfig.LangTypePair,
            JsonTrans: dealTextObj.styleStringToList(tarDiv),
            Link: link,
            UpdateUserID: dataConfig.userID,
            UpdateUserName: dataConfig.userName
        }
        if (link === "T") {
            typeofmethod = 'SubmitT';
        } else if (link === "C") {
            typeofmethod = 'SubmitC';
        } else if (link === "Q") {
            typeofmethod = 'SubmitQ';
        } else if (link === "P") {
            typeofmethod = 'SubmitP';
        } else if (link === "ES") {
            typeofmethod = 'SubmitES';
        }
        var sendXHR = $.ajax({
            method: "post",
            url: urls.editUrl + "/" + typeofmethod + "/EditorOrig",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    tarDiv.removeAttr('contenteditable');
                    tarDiv.parents('tr').find('.edition-target').focus();
                    if (dataConfig.sentence.ori[fid+wid])dataConfig.sentence.ori[fid+wid].isGet = true;
                } else {
                    $.Alert(data.msg);
                }
            }
        })
    }

    //锁定句段
    function lockSentence(_this) {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','编辑器','单击图标锁定/解锁',baseFnObj.currentLink()]);//埋点
        var link = $('script.current').attr('data-link');
        var activeTr = $(_this).parents("tr"),
            targetDiv = activeTr.find(".edition-target"),
            isLock = _this.getAttribute("data-islock");
        //修改
        if (isLock==='false'){
            $("div.catTransMT").empty();
        }
        if (activeTr.hasClass('repeated')) return;
        if (link !== "P") {
            $.Alert("无操作权限");
            return;
        }
        var params = {
            CreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            FileID: targetDiv.attr("data-fid"),
            PackID: targetDiv.attr("data-pid"),
            WordID: targetDiv.attr("data-wid"),
            Link: link,
            UpdateUserID: dataConfig.userID,
            UpdateUserName: dataConfig.userName,
            IsLock: isLock == "false" ? true : false
        }
        $.ajax({
            method: "post",
            url: urls.editUrl + "/Lock/Sen",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    activeTr.toggleClass("locked").removeClass("active selected");
                    $(_this).toggleClass("ok");
                    activeTr.hasClass("locked") ? (
                        targetDiv.removeAttr("contenteditable")
                    ) : (
                        targetDiv.attr("contenteditable", true)
                    )
                    isLock == 'false' ? (
                        $(_this).attr({"data-islock": "true", "title": "已锁定"})
                    ) : (
                        $(_this).attr({"data-islock": "false", "title": "未锁定"})
                    );
                } else {
                    $.Alert(data.msg);
                }
            }
        })
    }

    //获取翻译进度
    function getProgress() {
        var arr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = new Object();
                obj.projectID = dataConfig.ProjectID;
                obj.fileID = dataConfig.dataList[i].Fileid;
                obj.userID = dataConfig.userID;
                obj.packID = packid[j];
                obj.link = $('script.current').attr('data-link');  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
                arr.push(obj);
            }
        }
        $.ajax({
            method: "post",
            // url: urls.preLibUrl + "/pretreatment/filePackMsg/timelyMsg",
            url: urls.preLibUrl + "/editor/filePackMsg/timelyMsg",
            dataType: "json",
            data: JSON.stringify(arr),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success && data.data != null) {
                    dataConfig.allSubmitTime = Math.ceil(data.data.originalSentenceNumber/0.2);//通过需要翻译句段数计算的等待时间存放到全局
                    // $(".file_name").attr('title', data.data.fileName).html('文件名：' + data.data.fileName);
                    //悬浮显示文件名
                    let fileName = data.data.fileName.replace(/;/g,`<br>`);
                    $(".file_name").html(dataConfig.dataList.length > 1 ? '文件名：' + dataConfig.dataList.length + '个文件' : '文件名：' + data.data.fileName).on('mouseenter',function () {
                        $(".popup").html(fileName).css('display','block');
                        $(".popupTriangle").css('display','block');
                    }).on('mouseleave',function () {
                        $(".popup").css('display','none');
                        $(".popupTriangle").css('display','none');
                    });
                    $(".popup,.popupTriangle").on('mouseenter',function () {
                        $(".popup").css('display','block');
                        $(".popupTriangle").css('display','block');
                    }).on('mouseleave',function () {
                        $(".popup").css('display','none');
                        $(".popupTriangle").css('display','none');
                    });
                    //     .popover({content:fileName, trigger:'hover',placement:'top'})
                    $(".file_count").html(data.data.translationWordNumberAll + "/" + data.data.originalWordNumberAll);
                    $(".file_sentence").html(data.data.translationSentenceNumber + "/" + data.data.originalSentenceNumber);
                    $(".all_file_sentence").html(data.data.packTotal);
                    $(".file_percent").html((data.data.progressReportView * 100).toFixed(0) + "%");
                    $('title').html(data.data.fileName);
                }
            }
        })
    }

    //预览原文
    // 判断文件类型是否支持预览
    function previewSupportOriginal() {
        var fileid = dataConfig.dataList[0].Fileid;
        var params = {
            fileId: fileid,
            projectId: dataConfig.ProjectID
        };
        $.ajax({
            method: "get",
            url: urls.editUrl + "/fileType",
            // dataType: "json",
            data: params,
            // contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    if (data.data.type === 'doc' || data.data.type === 'docx' || data.data.type === 'txt') {
                        $('div.preview-origin').toggle();
                        BOM.setTransHeight();
                        previewOriginal();
                    } else {
                        $.Alert("当前文档目前暂不支持预览！");
                    }
                } else {
                    $.Alert("操作失败，请重试");
                }
            }
        });
    }
    // 以html形式预览
    function previewOriginal() {
        var fileid = dataConfig.dataList[0].Fileid;
        var params = {
            fileId: fileid,
            projectId: dataConfig.ProjectID
        };
        // $(".previewContainer>iframe").attr("src", urls.editUrl + '/originalPreview?fileId=' + fileid + '&projectId=' + dataConfig.ProjectID);
        // $(".preview-btn").attr("data-ajax", "true");
        $.ajax({
            method: "post",
            url: urls.editUrl + "/originalPreview",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                // console.log(data);
                if (data.success) {
                    $("#previewCont").html(data.data.document);
                    $(".preview-btn").attr("data-ajax", "true");
                    // $(".previewContainer>iframe").html(data.data.document);
                    // $(".preview-btn").attr("data-ajax", "true");
                } else {
                    $("#previewCont").html('预览失败，请重试');
                    $.Alert("操作失败，请重试");
                }
            },
            error: function (err) {
                console.log(err)
                $.Alert("操作失败，请重试");
            }
        });
    }
    // 以PDF形式预览
    function previewOriginalByPDF() {
        var fileid = dataConfig.dataList[0].Fileid;
        var params = {
            FileID: fileid,
            ProjectID: dataConfig.ProjectID,
            ProjectCreatedTime: dataConfig.createdTime
        };
        $.ajax({
            method: "post",
            url: urls.editUrl + "/Preview/Orig",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success) {
                    $(".previewContainer>iframe").attr("src", urls.editUrl + "/ViewFilePDForHTML/" + data.data);
                    $(".preview-btn").attr("data-ajax", "true");
                } else {
                    $.Alert("操作失败，请重试");
                }
            }
        });
    }

    //预览译文
    function previewTranslation() {
        var fileid = dataConfig.dataList[0].Fileid;
        const params = {
            FileID: fileid,
            // DownType: '1',
            ProjectID: dataConfig.ProjectID,
            ProjectCreatedTime: dataConfig.createdTime,
            UserID: dataConfig.userID,
            UpdateUserName: dataConfig.userName
        };
        $.ajax({
            method: "post",
            url: urls.editUrl + "/Preview/Trans",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            complete: function () {
                $('.my-loading').remove();
            },
            success: function (data) {
                data.success ? window.open(urls.editUrl + "/ViewFilePDForHTML/" + data.data, '_blank') : $.Alert(data.msg);
            }
        });
    }

    //修改记录
    function updateHistory(wid, pid, fid) {
        $('.isAllUpdateList').off().on('click',function (){
            $('.trans-info .transDetail').css('display','none');
            updateHistory(wid, pid, fid);
        }).parent('label').css('display','inline');
        var params = {
            all: $('.isAllUpdateList').prop('checked'),
            DateTime: dataConfig.createdTime,
            UserID: dataConfig.userID,
            ProjectID: dataConfig.ProjectID,
            FileID: fid,
            PackID: pid,
            WordID: wid,
            Link: $('script.current').attr('data-link')  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
        }
        if ($('.trans-info').hasClass('add_hidden')) {
            return;
        }
        $(".trans-info .transTab").remove();
        $.ajax({
            method: "post",
            url: urls.editUrl + "/HistoryMsg/SelHisEachByCondition",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success && data.data.length > 0) {
                    updateHistoryShow(data);
                }else {
                    $(".update_insert").after(`<div class="transTab" style="height: 90px;display:flex;justify-content:center;align-items:center;text-align: center;font-size: 12px;color: #999;">无数据</div>`);
                }
            }
        })
    }
    //修改记录渲染
    function updateHistoryShow(data){
        var list = "";
        for (var i = 0, len = data.data.length; i < len; i++) {
            var tagTxt = data.data[i].TransChangeMarkList;
            list += "<tr class='updateTr' data='{\"user\":\"" + data.data[i].UpdateUser + "\",\"time\":\"" + data.data[i].UpdateTime + "\",\"remark\":\"" + data.data[i].UpdateRemark + "\",\"node\":\"" + data.data[i].UpdateNode + "\"}'>" +
                "<td align='center'>" + (i + 1) + "</td>" +
                "<td><div class='hastag'>" + tagTxt + "</div></td>" +
                "</tr>";
        }
        $(".update_insert").after($("#myUpdate").html());
        $(".updataList>tbody").html(list);
        getHistoryDetail();
    }

    //批阅记录
    function readHistory(wid, pid, fid) {
        var params = {
            ProjectCreatedTime: dataConfig.createdTime,
            UserID: dataConfig.userID,
            ProjectID: dataConfig.ProjectID,
            FileID: fid,
            PackID: pid,
            WordID: wid,
            Link: $('script.current').attr('data-link')  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
        };
        if ($('.read-info').hasClass('add_hidden')) {
            return;
        }
        $(".read-info .transTab").remove();
        $.ajax({
            method: "post",
            url: urls.editUrl + "/HistoryMsg/SelHisEachNoLink",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (data.success && data.data.length > 0) {
                    var list = "";
                    for (var i = 0, len = data.data.length; i < len; i++) {
                        var tagTxt = data.data[i].TransChangeMarkList;
                        list += "<tr class='updateTr' data='{\"user\":\"" + data.data[i].UpdateUser + "\",\"time\":\"" + data.data[i].UpdateTime + "\",\"remark\":\"" + data.data[i].UpdateRemark + "\",\"node\":\"" + data.data[i].UpdateNode + "\"}'>" +
                            "<td align='center'>" + (i + 1) + "</td>" +
                            "<td><div class='hastag'>" + tagTxt + "</div></td>" +
                            "</tr>";
                    }
                    $(".read_insert").after($("#myRead").html());
                    $(".readList>tbody").html(list);
                    getHistoryDetail();
                }else {
                    $(".read_insert").after(`<div class="transTab" style="height: 90px;display:flex;justify-content:center;align-items:center;text-align: center;font-size: 12px;color: #999;">无数据</div>`);
                }
            }
        })
    };

    //拒绝
    function refuseTask([link, packid, senid, fid, sign]) {
        $.Confirm('确认拒绝选中句段吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                if (link && packid && senid) {
                    $.LoadTips("正在拒绝选中句段");
                    let _params = {
                        RefuseType: 'S',
                        Link: link,
                        PackID: packid,
                        SentenceID: senid
                    };
                    $.ajax({
                        type: "post",
                        url: urls.editUrl + '/ReTask/RefuseAudit',
                        dataType: "json",
                        data: {JsonStr: JSON.stringify(_params)},
                        success: function (data) {
                            $(".my-loading").remove();
                            if (data.success) {
                                $.LoadTips("拒绝成功，正在刷新");
                                window.setTimeout(() => {
                                    loadPage.initPage(sign, fid);
                                }, 1500);
                            } else {
                                $.Alert(data.data);
                            }
                        },
                        error:function(err){
                            $('.my-loading').remove();
                            $.Alert(err.responseJSON.msg);
                        }
                    })
                }
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    //显示备注
    function showRemarkModal(_this,foco) {
        // if ($(_this).parents("tr").hasClass("locked")
        //     || $(_this).parents("tr").hasClass("repeated")) {
        //     $.Alert('该句段不能操作');
        //     return;
        // }
        let $tar = $(_this).parents("tr").find(".edition-target");
        $("#addRemarkBtn").attr({
            "data-proid": dataConfig.ProjectID,
            "data-fid": $tar.attr("data-fid"),
            "data-pid": $tar.attr("data-pid"),
            "data-wid": $tar.attr("data-wid"),
            // "data-sts": _this.dataset.sts,
            "data-org": $(_this).parents("tr").attr("data-no")
        });

        if (!foco){
            let $tar = $(_this).parents("tr").find(".edition-target");
            let fileID = $tar.attr("data-fid");
            let packID = $tar.attr("data-pid");
            let wordId = $(_this).parents("td").text().trim();
            dealTranObj.queryRemark(fileID,packID,wordId);
            $("#_remarks").click();
        }else {
            dealTranObj.queryRemark(foco.fileID,foco.packID,foco.wordId);
        }
    }

    // 查询备注
    function queryRemark(fileID,packID,wordId) {
        let roles = JSON.parse(sessionStorage.getItem('dataListCAT'))[0];
        $("#remarksColumn").html('当前句段：'+wordId);
        let _params ={
            "FileID": fileID,
            "PackID": packID,
            "ProjectID": roles.Projectid,
            "Link": roles.NowLink,
            "CreatedTime": roles.ProjectCreatedTime,
            "WordID": wordId
        };
        let remarkHtm = '';
        $("#remarkList").html('');
        $.ajax({
            type: "post",
            url: urls.editUrl + "/Remark/Query",
            dataType: "json",
            data: JSON.stringify(_params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                let current = false;
                if (data.data && data.data.length > 0){
                    data.data.forEach(v => {
                        if (v.Link === _params.Link){
                            current = true;
                            $("#addTable").css('display','none');
                        }
                        v.RemarkMessage = v.RemarkMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        remarkHtm += dealTranObj.remarkList(v.WordID,v.Name,v.Link,v.RemarkMessage,v.SubmittedTime,v.RemarkStatus,v.FileID,v.PackID);
                        $("#remarkList").html(remarkHtm);
                    });
                    if (!current){
                        $(".remarkTxt").val('');
                        $("#addTable").css('display','block');
                    }
                }else {
                    $(".remarkTxt").val('');
                    $("#addTable").css('display','block');
                }
            }
        });
    }
    //备注列表
    function remarkList(wordId,name,link,msg,time,RemarkStatus,FileID,PackID) {
        let role = JSON.parse(sessionStorage.getItem('dataListCAT'))[0].NowLink;
        let userRole = '';
        switch (link) {
            case "T":userRole = '翻译';break;
            case "C":userRole = '审校';break;
            case "P":userRole = 'PM';break;
            case "Q":userRole = '质检';break;
        }
        if (RemarkStatus === 2){
            if (role === link){
                return `<div class="remarkList"><div class="remarkMsg"><p class="current">${msg}</p><span class="operation"><img src="/public/images/right-area/update.png" title="修改" alt="" onclick="dealTranObj.updateRemark(${wordId},${RemarkStatus},'${FileID}','${PackID}',this)" /> | 
            <img src="/public/images/right-area/del.png" title="删除" alt="" onclick="dealTranObj.delRemark(${wordId},'${FileID}','${PackID}','${link}',this)" /></span><span class="preservation"><img src="/public/images/right-area/submit.png" class="remarkOk" alt=""  title="确认" /> | 
            <img src="/public/images/right-area/cancel.png" class="remarkCancel" alt="" title="取消" /></span></div><div class="role"><span>添加人：${userRole}-${name}<span class="piZhu">批注</span></span><span>添加时间：${time}</span></div></div>`
            }else if (dataConfig.isDeleteRemark){
                return `<div class="remarkList"><div class="remarkMsg"><p class="current">${msg}</p><span class="operation"><img src="/public/images/right-area/del.png" title="删除" alt="" onclick="dealTranObj.delRemark(${wordId},'${FileID}','${PackID}','${link}',this)" /></span></div><div class="role"><span>添加人：${userRole}-${name}<span class="piZhu">批注</span></span><span>添加时间：${time}</span></div></div>`
            }else {
                return `<div class="remarkList"><div class="remarkMsg"><p >${msg}</p></div><div class="role"><span>添加人：${userRole}-${name}<span class="piZhu">批注</span></span><span>添加时间：${time}</span></div></div>`
            }
        }else {
            if (role === link){
                return `<div class="remarkList"><div class="remarkMsg"><p class="current">${msg}</p><span class="operation"><img src="/public/images/right-area/update.png" title="修改" alt="" onclick="dealTranObj.updateRemark(${wordId},${RemarkStatus},'${FileID}','${PackID}',this)" /> | 
            <img src="/public/images/right-area/del.png" title="删除" alt="" onclick="dealTranObj.delRemark(${wordId},'${FileID}','${PackID}','${link}',this)" /></span><span class="preservation"><img src="/public/images/right-area/submit.png" class="remarkOk" alt=""  title="确认" /> | 
            <img src="/public/images/right-area/cancel.png" class="remarkCancel" alt="" title="取消" /></span></div><div class="role"><span>添加人：${userRole}-${name}</span><span>添加时间：${time}</span></div></div>`
            }else if (dataConfig.isDeleteRemark){
                return `<div class="remarkList"><div class="remarkMsg"><p class="current">${msg}</p><span class="operation"><img src="/public/images/right-area/del.png" title="删除" alt="" onclick="dealTranObj.delRemark(${wordId},'${FileID}','${PackID}','${link}',this)" /></span></div><div class="role"><span>添加人：${userRole}-${name}</span><span>添加时间：${time}</span></div></div>`
            }else {
                return `<div class="remarkList"><div class="remarkMsg"><p >${msg}</p></div><div class="role"><span>添加人：${userRole}-${name}</span><span>添加时间：${time}</span></div></div>`
            }
        }
    }
    //删除备注
    function delRemark(wordId,FileID,PackID,link,_this) {
        $.Confirm('确认删除备注吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                let role = dataConfig.dataList[0];
                let params = {
                    CreatedTime: role.ProjectCreatedTime,
                    ProjectID: role.Projectid,
                    FileID: FileID,
                    PackID: PackID,
                    WordID: wordId,
                    Link: link,
                    Name:role.UserName
                };
                $.ajax({
                    type: "post",
                    url: urls.editUrl + "/Remark/Clear",
                    dataType: "json",
                    data: JSON.stringify(params),
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        if (data.success){
                            $('script.current').attr('data-link') === link && $("#addTable").css('display','block');
                            $(_this).parents('.remarkList').remove();
                            $.Tips(data.msg);
                            let currentTd = $("tr.table-row.active").find("td.s-no"),
                                currentDiv = currentTd.find(".triangle");
                            if ($("#remarkList div").hasClass('remarkList')){
                                if ($("#remarkList span").hasClass('piZhu')){
                                    currentTd.removeClass("unsolve").addClass("solve");
                                    currentDiv.attr({"title": "导出为批注", 'data-sts': '2'});
                                }else {
                                    currentTd.removeClass("solve").addClass("unsolve");
                                    currentDiv.attr({"title": "查看备注信息", 'data-sts': '1'});
                                }
                            }else {
                                currentTd.removeClass("solve unsolve");
                                currentDiv.attr({"title": "无备注", 'data-sts': '0'});
                            }
                        }else {
                            $.Tips(data.msg);
                        }
                    }
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    // 修改备注
    function updateRemark(wordId,RemarkStatus,FileID,PackID,_this) {
        let current = $(_this).parents('div.remarkMsg');
        let role = dataConfig.dataList[0];
        let oldVal = current.find('p.current').text();
        current.find('p.current').attr('contenteditable','true').css({'border':'1px solid #ccc','background-color':'white'});
        current.find('span.operation').css('display','none');
        $(".preservation").unbind("click").css('display','inline-block').on('click','.remarkOk,.remarkCancel',function () {
            if (this.classList.contains('remarkOk')){
                if (!current.find('p.current').text().trim()){
                    $.Alert("请填写备注");
                    return;
                }
                $(".preservation").css('display','none');
                current.find('span.operation').css('display','inline-block');
                current.find('p.current').attr('contenteditable','false').css({'border':'none','background-color':'transparent'});
                // let doc = document.querySelector(".checkRemark");
                let params = {
                    CreatedTime: role.ProjectCreatedTime,
                    ProjectID: role.Projectid,
                    FileID: FileID,
                    PackID: PackID,
                    WordID: wordId,
                    Name: role.UserName,
                    UserID:role.UserID,
                    RemarkMessage: current.find('p.current').text(),
                    RemarkStatus: RemarkStatus,
                    Link: $('script.current').attr('data-link')  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
                };
                $.ajax({
                    method: "post",
                    url: urls.editUrl + "/Remark/Sub",
                    dataType: "json",
                    data: JSON.stringify(params),
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        $.Tips(data.msg);
                    },
                    error: function (response) {
                        $.Alert(response.msg);
                    }
                })
            }else {
                $(".preservation").css('display','none');
                current.find('span.operation').css('display','inline-block');
                current.find('p.current').attr('contenteditable','false').css({'border':'none','background-color':'transparent'}).text(oldVal);
            }
        })

    }

    //添加备注
    function addRemark(_this, error) {
        if ($.trim($(".remarkTxt").val()) === "") {
            $.Alert("请填写备注");
            return;
        }
        $(_this).attr("disabled", true);
        var doc = document.querySelector(".checkRemark");
        let fid = $("#addRemarkBtn").attr('data-fid');
        let org = $("#addRemarkBtn").attr('data-org');
        let pid = $("#addRemarkBtn").attr('data-pid');
        var params = {
            CreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            // FileID: _this.dataset.fid,
            // PackID: _this.dataset.pid,
            // WordID: _this.dataset.wid,
            FileID: fid,
            PackID: pid,
            WordID: org,
            Name: dataConfig.userName,
            UserID:dataConfig.userID,
            RemarkMessage: $(".remarkTxt").val(),
            RemarkStatus: doc.checked ? "2" : "1",
            Link: $('script.current').attr('data-link')  //T:处理环节：T、C、Q、P   译员、审校、QA、PM
        };
        $.ajax({
            method: "post",
            url: urls.editUrl + "/Remark/Sub",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                $(_this).html('保存中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(_this).html("确 认");
            },
            success: function (data) {
                if (data.success) {
                    !error && $.Tips(data.msg);
                    // var org = _this.dataset.org,
                    //     fid = _this.dataset.fid,
                    var tempList = $("tr.table-row");
                    for (var t = 0, len = tempList.length; t < len; t++) {
                        if (org == tempList[t].dataset.no && fid === tempList[t].dataset.fid) {
                            var el = tempList[t],
                                $targetParent = $(el).find("td.s-no"),
                                $target = $targetParent.find(".triangle");
                            $target.attr("data-mes", $(".remarkTxt").val());
                            if ($target.attr('data-sts') == 2){
                                $target.attr({"title": "导出为批注", 'data-sts': '2'});
                                $targetParent.removeClass("unsolve").addClass("solve")
                            }else {
                                doc.checked ? (
                                    $target.attr({"title": "导出为批注", 'data-sts': '2'}),
                                        $targetParent.removeClass("unsolve").addClass("solve")
                                ) : (
                                    $target.attr({"title": "查看备注信息", 'data-sts': '1'}),
                                        $targetParent.removeClass("solve").addClass("unsolve")
                                );
                            }
                            $("#addTable").css('display','none');
                            dealTranObj.queryRemark(params.FileID,params.PackID,params.WordID);
                            $(".remarkTxt").val('');
                            $("#wordLimit .entered").html(0);
                            $(_this).next().click();
                            return;
                        }
                    }
                } else {
                    !error && $.Alert(data.msg);
                }
            },
            error: function (response) {
                $.Alert(response.msg);
            }
        })
    }

    //显示单句QA数据
    function showOneQAModal(_this) {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','QA','实时检查',baseFnObj.currentLink()]);//埋点
        var dataMsg = $(_this).attr('data-qa');
        dataMsg = dataMsg.replace(/&lt;/g, '<');
        dataMsg = dataMsg.replace(/&gt;/g, '>');
        dataMsg = dataMsg.replace(/&quto;/g, '"');
        var dataList = JSON.parse(dataMsg);
        var container = document.getElementById('oneQAmodalList');
        var html = "";
        dataList.forEach((item, index) => {
            html += `<tr>
                    <td width="50">${index + 1}</td>
                    <td>${item.checkName}</td>
                    <td>${item.detailName}</td>
                </tr>`;
        });
        container.innerHTML = html;
        $(".oneQAModal").click();
    }

    //悬浮框合并句段
    function joinFrameSentence() {
        var typeofmethod, btntype, wordid, pid;
        var params = {},
            url = "";
        var link = $('script.current').attr('data-link'),
            tar = $('tr.table-row.active');
        if (tar.length < 1) return;
        wordid = [tar.prev().attr("data-no"), tar.attr("data-no")];
        pid = tar.find('.edition-target').attr('data-pid');
        switch (link) {
            case 'T':
                typeofmethod = 'SubmitT';
                break;
            case 'C':
                typeofmethod = 'SubmitC';
                break;
            case 'Q':
                typeofmethod = 'SubmitQ';
                break;
            case 'P':
                typeofmethod = 'SubmitP';
                break;
            case 'ES':
                typeofmethod = 'SubmitES';
                break;
        }
        url = urls.editUrl + "/" + typeofmethod + "/SpiltAndJoinOrig";
        // url = "http://192.168.70.201:8522/" + typeofmethod + "/SpiltAndJoinOrig";
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.PackID = pid;
        params.WordID = wordid;
        params.LanguageMaps = dataConfig.LangTypePair;
        params.HandleWays = "J";
        params.IndexCondition = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = {};
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.OrderStr = "1";
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                params.IndexCondition.push(obj);
            }
        }
        $.Confirm('确认合并句段吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                $.LoadTips("正在合并句段");
                loadPage.splitAndMerge({
                    url: url,
                    param: params,
                    btntype: "J",
                    tar: tar
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    //拆分句段
    function splitSentence(_this) {
        var typeofmethod, btntype, wordid, pid;
        var params = {}, url = "";
        var link = $('script.current').attr('data-link'),
            tar = $('tr.table-row.active');
        if (tar.length < 1) {
            $.Alert('请让句段处于活动状态');
            return;
        }
        if (tar.hasClass("repeated") || tar.hasClass("locked")) {
            $.Alert("该句段不能操作");
            return;
        }
        let userSelection, isSpan, isDiv, mousePos,range;
        let allTxt = '';
        if (window.getSelection) {
            userSelection = window.getSelection();
        } else if (document.selection) {
            userSelection = document.selection.createRange();
        }
        if (userSelection.rangeCount === 0)return;
        range = userSelection.getRangeAt(0);
        if (!range.collapsed) {
            $.Alert("请勿选择文本");
            return false;
        }
        isSpan = $(range.endContainer).parent();
        if (!isSpan.is('span')) {
            $.Alert("请在文本中插入光标");
            return;
        }
        isDiv = isSpan.parents('.edition-source');
        if (isDiv.attr('contenteditable') !== 'true') {
            $.Alert("请让原文处于可编辑状态");
            return;
        }
        mousePos = getCursortPosition(isDiv[0]);
        allTxt = isDiv.text().slice(0, mousePos);
        btntype = 'S'; //拆分
        wordid = [tar.attr('data-no')];
        pid = tar.find('.edition-target').attr('data-pid');
        switch (link) {
            case 'T':
                typeofmethod = 'SubmitT';
                break;
            case 'C':
                typeofmethod = 'SubmitC';
                break;
            case 'Q':
                typeofmethod = 'SubmitQ';
                break;
            case 'P':
                typeofmethod = 'SubmitP';
                break;
            case 'ES':
                typeofmethod = 'SubmitES';
                break;
        }
        url = urls.editUrl + "/" + typeofmethod + "/SpiltAndJoinOrig";
        // url = "http://192.168.70.201:8522/" + typeofmethod + "/SpiltAndJoinOrig";
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.PackID = pid;
        params.WordID = wordid;
        params.LanguageMaps = dataConfig.LangTypePair;
        params.OrigFP = allTxt;
        params.HandleWays = btntype;
        params.IndexCondition = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = {};
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.OrderStr = "1";
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                params.IndexCondition.push(obj);
            }
        }
        $.LoadTips("正在拆分句段");
        loadPage.splitAndMerge({
            url: url,
            param: params,
            btntype: btntype,
            tar: tar
        });
    }

    //合并句段
    function joinSentence(_this) {
        var typeofmethod, btntype, wordid, pid;
        var params = {}, url = "";
        var link = $('script.current').attr('data-link'),
            tar = $('tr.table-row.selected');
        if (tar.length < 1) {
            $.Alert('未选中句段（请点击句段编号处）');
            return;
        }
        if (tar.length > 1) {
            $.Alert('只能选择单条句段');
            return;
        }
        if (tar.hasClass("repeated") || tar.hasClass("locked")) {
            $.Alert("该句段不能操作");
            return;
        }
        btntype = 'J';  //合并
        wordid = [tar.prev().attr('data-no'), tar.attr('data-no')];
        pid = tar.find('.edition-target').attr('data-pid');
        switch (link) {
            case 'T':
                typeofmethod = 'SubmitT';
                break;
            case 'C':
                typeofmethod = 'SubmitC';
                break;
            case 'Q':
                typeofmethod = 'SubmitQ';
                break;
            case 'P':
                typeofmethod = 'SubmitP';
                break;
            case 'ES':
                typeofmethod = 'SubmitES';
                break;
        }
        url = urls.editUrl + "/" + typeofmethod + "/SpiltAndJoinOrig";
        // url = "http://192.168.70.201:8522/" + typeofmethod + "/SpiltAndJoinOrig";
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.PackID = pid;
        params.LanguageMaps = dataConfig.LangTypePair;
        params.WordID = wordid;
        params.HandleWays = btntype;
        params.IndexCondition = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = {};
                obj.ProjectID = dataConfig.ProjectID;
                obj.UserID = dataConfig.userID;
                obj.OrderStr = "1";
                obj.ProjectCreatedTime = dataConfig.createdTime;
                obj.FileID = dataConfig.dataList[i].Fileid;
                obj.PackID = packid[j];
                params.IndexCondition.push(obj);
            }
        }
        $.Confirm("确认合并句段吗？");
        $('#my-confirm').modal({
            onConfirm: function (e) {
                $.LoadTips("正在合并句段");
                loadPage.splitAndMerge({
                    url: url,
                    param: params,
                    btntype: btntype,
                    tar: tar
                });
            }
        });
    }

    //预览句段
    function previewSentence(sId, fid, pId) {
        let url, type, list = [];
        const link = $('script.current').attr('data-link');
        switch (link) {
            case 'T':
                type = 'TTrans';
                break;
            case 'C':
                type = 'TCheck';
                break;
            case 'Q':
                type = 'TQA';
                break;
            case 'P':
                type = 'TPM';
                break;
            case 'ES':
                type = 'SubmitES';
                break;
        }
        url = urls.editUrl + "/" + type + "/SentenceSel";
        var obj = {};
        obj.ProjectID = dataConfig.ProjectID;
        obj.FileID = fid;
        obj.UserID = dataConfig.userID;
        obj.PackID = pId;
        obj.OrderStr = "1";
        obj.PageSize = localParam.pageSize;
        obj.NowPageID = 1;
        obj.NowSentenceID = sId;
        obj.SelectSourceStr = "";
        obj.SelectTransStr = "";
        list.push(obj);

        $.ajax({
            url: url,
            method: "post",
            dataType: "json",
            data: {JsonStr: JSON.stringify(list)},
            success: function (result) {
                $('tbody#previewSen').empty();
                if (result && result.length > 0) {
                    var str = "";
                    result.forEach((item, index) => {
                        var ori = dealTextObj.listToStyleString(item.Original[0].YYQTagOrTextList, ""),
                            tran = dealTextObj.listToStyleString(item.Translate[0].YYQTagOrTextList, "");
                        str += `<tr>
                                    <td align="center">${item.WordID}</td>
                                    <td>${ori}</td>
                                    <td>${tran}</td>
                                    <td align="center" color="#3B6CAA">${item.MatchingRateTM}%</td>
                                </tr>`;
                    });
                    $('tbody#previewSen').html(str);
                }
            }
        })
    }

    //（批量）锁定
    function lock() {
        var paramsList = [];
        var selectedTr = $("tr.table-row.selected");
        if (selectedTr.length < 1) {
            $.Alert('未选中句段（请点击句段编号处）');
            return;
        }
        for (let i = 0, len = selectedTr.length; i < len; i++) {
            var el = selectedTr[i];
            var param = {
                FileID: el.dataset.fid,
                PackID: el.dataset.pid,
                SenID: el.dataset.no,
            };
            paramsList.push(param);
        }
        var paramData = {
            CreatedTime: dataConfig.createdTime,
            Link: $('script.current').attr('data-link'),
            IsAll: false,
            IsLock: true,
            ProjectID: dataConfig.ProjectID,
            UserName: dataConfig.userName,
            UserID: dataConfig.userID,
            SenList: paramsList
        };
        $.LoadTips("正在锁定选中句段");
        $.ajax({
            url: urls.editUrl + "/Lock/BatchLockState",
            method: "post",
            data: JSON.stringify(paramData),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (result) {
                $('.my-loading').remove();
                if (result.success) {
                    var sign = selectedTr[0].dataset.sign;
                    var fid = selectedTr[0].dataset.fid;
                    $.LoadTips("锁定成功，正在刷新");
                    window.setTimeout(() => {
                        localParam.isFirst = true;
                        if (sign){
                            loadPage.initPage(sign, fid,selectedTr.first());
                        }else {
                            localParam.pageNum = 1;
                            loadPage.initPage();
                        }
                    }, 1500);
                } else {
                    $.Alert(result.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                $.Alert(err.responseJSON.msg);
            }
        });
    }

    //（批量）解锁
    function unlock(flag) {
        var packid = "", senList = "", isConfirm = false;
        var selectedTr = $("tr.table-row.selected");
        var isAll = false;
        var fileList = [];
        // dataConfig.PackID.forEach((item) => {
        //     packid += item + ",";
        // });
        // packid = packid.slice(0, -1);
        if (flag) {
            if (selectedTr.length < 1) {
                $.Alert('未选中句段（请点击句段编号处）');
                return;
            }
            selectedTr.toArray().forEach((item) => {
                fileList.push({
                    FileID: item.dataset.fid,
                    PackID: item.dataset.pid,
                    SenID: item.dataset.no
                })
            });
            // selectedTr.toArray().forEach((item) => {
            //     senList += item.dataset.no + ",";
            // });
            // selectedTr.toArray().forEach((item) => {
            //     packid += item.dataset.pid + ",";
            // });
            // senList = senList.slice(0, -1);
            // packid = packid.slice(0, -1);
            isConfirm = true;
            isAll = false;
        } else {
            for (let i = 0; i < dataConfig.dataList.length; i++) {
                // var packids = dataConfig.dataList[i].Packid.split(',');
                var packids = dataConfig.dataList[i].Packid;
                for (let j = 0; j < packids.length; j++) {
                    fileList.push({
                        FileID: dataConfig.dataList[i].Fileid,
                        PackID: packids[j],
                        SenID: ''
                    });
                }
            };
            isAll = true;
            isConfirm = confirm("操作提示：确认全部解锁吗？");
        }
        if (!isConfirm) return;
        $.LoadTips("正在解锁句段");
        $.ajax({
            url: urls.editUrl + "/Lock/BatchLockState",
            method: "post",
            data: JSON.stringify({
            CreatedTime: dataConfig.createdTime,
            Link: $('script.current').attr('data-link'),
            IsAll: isAll,
            IsLock: false,
            ProjectID: dataConfig.ProjectID,
            UserName: dataConfig.userName,
            UserID: dataConfig.userID,
            SenList: fileList
        }),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            success: function (result) {
                $('.my-loading').remove();
                if (result.success) {
                    var sign = selectedTr.first().attr('data-no');
                    var fid = selectedTr.first().attr('data-fid');
                    $.LoadTips("解锁成功，正在刷新");
                    window.setTimeout(() => {
                        localParam.isFirst = true;
                        if (sign){
                            loadPage.initPage(sign, fid,selectedTr.first());
                        }else {
                            localParam.pageNum = 1;
                            loadPage.initPage();
                        }
                    }, 1500);
                } else {
                    $.Alert(result.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                err.responseJSON && $.Alert(err.responseJSON.msg);
            }
        });
    }

    //复制拼写检查结果
    function copySpelling(newtxt, wid, oldtxt, fid, pid) {
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','拼写检查','可能需要的单词',baseFnObj.currentLink()]);//埋点
        let _wid = $('body').attr('data-change');
        if (_wid === wid) {
            let url, params = {};
            let ele = $('tr.table-row.active'),
                link = $('script.current').attr('data-link');
            url = urls.editUrl + "/SpellingUpdate";
            params.UserID = dataConfig.userID;
            params.UserName = dataConfig.userName;
            params.ProjectCreatedTime = dataConfig.createdTime;
            params.ProjectID = dataConfig.ProjectID;
            params.FileID = [fid];
            params.Link = link;
            params.IsAllReplace = false;
            params.WordID = wid;
            params.OldText = oldtxt;
            params.NewText = newtxt;
            params.CaseSentence = true;
            params.PackID = [pid];
            $.LoadTips("正在复制检查结果");
            $.ajax({
                method: "post",
                url: url,
                dataType: "json",
                data: JSON.stringify(params),
                contentType: "application/json;charset=utf-8",
                success: function (data) {
                    $(".my-loading").remove();
                    if (data.success) {
                        var html = "";
                        var trans = dealTextObj.listToStyleString(data.data, "");
                        html += trans;
                        ele.find('div.edition-target').html(html);
                        // dealQaObj.spellingCheck(ele.find('div.edition-target').text(), wid, fid, pid);
                        dealQaObj.pauseSend(ele.find('div.edition-target').text(), wid, fid, pid);
                        $.Tips('复制成功');
                    } else {
                        $.Alert(data.msg);
                    }
                },
                error:function(err){
                    $('.my-loading').remove();
                    $.Alert(err.responseJSON.msg);
                }
            });
        } else {
            $.Alert("句段不匹配");
        }
    }

    //一键翻译/MT预翻
    function rootTranSource() {
        $.Confirm('确认MT预翻操作吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                var PackID = [];
                for (let i = 0; i < dataConfig.dataList.length; i++) {
                    // var packid = dataConfig.dataList[i].Packid.split(',');
                    var packid = dataConfig.dataList[i].Packid;
                    for (let j = 0; j < packid.length; j++) {
                        PackID.push(packid[j]);
                    }
                };
                $.LoadTips("正在翻译，请勿重复操作");
                $.ajax({
                    url: urls.editUrl + "/Corpus/MTresultCopySel",
                    method: "post",
                    data: JSON.stringify({
                        CreatedTime: dataConfig.createdTime,
                        ProjectID: dataConfig.ProjectID,
                        Link: $('script.current').attr('data-link'),
                        PackIDList: PackID,
                        UserID: dataConfig.userID,
                        UpdateUserName: dataConfig.userName
                    }),
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    beforeSend:function(){
                        $('.trans-all-btn').attr("disabled", true);
                        $("body").append(`<div class="zeZhao"></div>`);
                    },
                    complete: function () {
                        $('.trans-all-btn').removeAttr("disabled");
                        $(".zeZhao").remove();
                    },
                    success: function (result) {
                        $('.my-loading').remove();
                        if (result.success) {
                            $.LoadTips(result.msg);
                            window.setTimeout(function () {
                                localParam.isFirst = true;
                                if ($("tr.table-row.active").attr("data-no")){
                                    loadPage.initPage($("tr.table-row.active").attr("data-no"), $("tr.table-row.active").attr("data-fid"),$("tr.table-row.active"));
                                }else {
                                    localParam.pageNum = 1;
                                    loadPage.initPage();
                                }
                            }, 1500);
                        } else {
                            $.Tips(result.msg);
                        }
                    },
                    error:function(err){
                        $('.my-loading').remove();
                        $.Alert(err.responseJSON.msg);
                    }
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    //TM预翻
    function tMSource() {
        let num = Number($('#matching').val());//获取当前匹配度
        $('.trans-TM-modal').css('display', 'block');
        $('#matchingReduce').on('click',function () {
            if (num>75){
                $('#matching').val(--num);
            }
        });
        $('#matchingAdd').on('click',function () {
            if (num<100){
                $('#matching').val(++num);
            }
        });
        $('input[name=matching]').on('blur',function () {
            var matchQA = $('input[name=matching]');
            if (matchQA.val() < 75 || matchQA.val() > 100) {
                $.Alert('匹配度需设置75%-100%！');
                return false;
            }
        });
        $(".OK-trans-TM").unbind("click");
        $('.OK-trans-TM').on('click',function () {
            if (Number($('#matching').val())<75 || Number($('#matching').val())>100){
                $.Alert('匹配度需设置75%-100%！');
                $('#matching').val(75);
                return;
            }
            $('.trans-TM-modal').css('display', 'none');
            let fileList = [];
            for (let i = 0; i < dataConfig.dataList.length; i++) {
                fileList.push({fileId:dataConfig.dataList[i].Fileid,packId:dataConfig.dataList[i].Packid.toString()});
            }
            $.LoadTips("正在翻译，请勿重复操作");
            let data = {
                fileList: fileList,
                matchRate: $('#matching').val(),
                projectId: dataConfig.ProjectID,
                userCode: dataConfig.userID,
                userName: dataConfig.userName
            };
            $.ajax({
                url: urls.preLibUrl + "/pretreatment/transcation/TMPreTranslation",
                method: "post",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                beforeSend: function () {
                    $('.trans-all-btn').attr("disabled", true);
                },
                complete: function () {
                    $('.trans-all-btn').removeAttr("disabled")
                },
                success: function (result) {
                    $('.my-loading').remove();
                    if (result.success) {
                        $.LoadTips(result.msg);
                        window.setTimeout(function () {
                            localParam.isFirst = true;
                            if ($("tr.table-row.active").attr("data-no")){
                                loadPage.initPage($("tr.table-row.active").attr("data-no"), $("tr.table-row.active").attr("data-fid"),$("tr.table-row.active"));
                            }else {
                                localParam.pageNum = 1;
                                loadPage.initPage();
                            }
                        }, 1500);
                    } else {
                        $.Alert(result.msg);
                    }
                },
                error:function(err){
                    $('.my-loading').remove();
                    $.Alert(err.responseJSON.msg);
                }
            })
        });
    }

    // 批量复制
    function batchCopySource(){
        let data = dataConfig.dataList[0];
        let eles = $("tr.table-row.active,tr.table-row.selected");
        let params = {
            ProjectID:data.Projectid,
            Link:data.NowLink,
            userId:data.UserID,
            userName:data.UserName,
            param:[],
        };
        for (let i = 0; i < eles.length; i++) {
            if (eles[i].classList.contains('repeated') || eles[i].classList.contains('locked')) {
                continue;
            }
            params.param.push({FileID:$(eles[i]).attr('data-fid'),PackID:$(eles[i]).attr('data-pid'),WordID:$(eles[i]).attr('data-no')});
        }
        $.LoadTips('正在复制，请勿重复操作');
        $.ajax({
            url: urls.editUrl + "/batchCopySen",
            method: "post",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                $(".my-loading").remove();
                if (data.success) {
                    $.LoadTips("复制成功，正在刷新");
                    window.setTimeout(function () {
                        localParam.isFirst = true;
                        let tr = $("tr.table-row.selected").eq(0);
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
                    }, 1500);
                } else {
                    $.Alert(data.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                $.Alert(err.responseJSON.msg);
            }
        });
    }
    //一键复制
    function rootCopySource() {
        var PackID = [];
        var typeofmethod = '';
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            for (let j = 0; j < packid.length; j++) {
                var obj = new Object();
                obj.PackID = packid[j];
                PackID.push(obj);
            }
        };
        if (link === "T") {
            typeofmethod = 'SubmitT';
        } else if (link === "ES") {
            typeofmethod = 'SubmitES';
        } else if (link === "C") {
            typeofmethod = 'SubmitC';
        } else if (link === "Q") {
            typeofmethod = 'SubmitQ';
        } else if (link === "P") {
            typeofmethod = 'SubmitP';
        }
        var params = {
            ProjectID: dataConfig.ProjectID,
            ProjectCreatedTime: dataConfig.createdTime,
            PackID: PackID,
            UserId: dataConfig.userID,
            UserName: dataConfig.userName
        };
        $.Confirm('确认复制全部原文到译文吗？');
        $('#my-confirm').modal({
            onConfirm: function (e) {
                $.LoadTips('正在复制，请勿重复操作');
                $.ajax({
                    url: urls.editUrl + "/" + typeofmethod + "/CopyAllSen",
                    method: "post",
                    dataType: "json",
                    data: JSON.stringify(params),
                    contentType: "application/json;charset=utf-8",
                    success: function (data) {
                        $(".my-loading").remove();
                        if (data.success) {
                            $.LoadTips("全部复制成功，正在刷新");
                            window.setTimeout(function () {
                                localParam.isFirst = true;
                                if ($("tr.table-row.active").attr("data-no")){
                                    loadPage.initPage($("tr.table-row.active").attr("data-no"), $("tr.table-row.active").attr("data-fid"),$("tr.table-row.active"));
                                }else {
                                    localParam.pageNum = 1;
                                    loadPage.initPage();
                                }
                            }, 1500);
                        } else {
                            $.Alert(data.msg);
                        }
                    },
                    error:function(err){
                        $('.my-loading').remove();
                        $.Alert(err.responseJSON.msg);
                    }
                });
            },
            onCancel: function (e) {
                console.log('cancel')
            }
        });
    }

    // 批量删除译文
    function batchDelTarget(one){
        let data = dataConfig.dataList[0];
        let eles = $("tr.table-row.active,tr.table-row.selected");
        let params = {
            ProjectID:data.Projectid,
            Link:data.NowLink,
            userId:data.UserID,
            userName:data.UserName,
            param:[],
        };
        if (one) {
            params.param.push({FileID:$(eles[0]).attr('data-fid'),PackID:$(eles[0]).attr('data-pid'),WordID:$(eles[0]).attr('data-no')});
        } else {
            for (let i = 0; i < eles.length; i++) {
                if (eles[i].classList.contains('repeated') || eles[i].classList.contains('locked')) {
                    continue;
                }
                params.param.push({FileID:$(eles[i]).attr('data-fid'),PackID:$(eles[i]).attr('data-pid'),WordID:$(eles[i]).attr('data-no')});
            }
            if (params.param.length === 0) {
                $.Alert("该句段不能操作");
                return;
            }
        }
        !one && $.LoadTips('正在删除，请勿重复操作');
        $.ajax({
            url: urls.editUrl + "/batchRemoveSen",
            method: "post",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (data) {
                if (!one) {
                    $(".my-loading").remove();
                    if (data.success) {
                        $.LoadTips("删除成功，正在刷新");
                        window.setTimeout(function () {
                            localParam.isFirst = true;
                            let tr = $("tr.table-row.selected").eq(0);
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
                        }, 1500);
                    } else {
                        $.Alert(data.msg);
                    }
                }
            },
            error:function(err){
                $('.my-loading').remove();
                $.Alert(err.responseJSON.msg);
            }
        });
    }

    // 替换前查找
    function replaceLookup(jumpId,trs) {
        classOperation.clearContent();
        localParam.isGetContent = false;
        var fileArr = [],
            packArr = [],
            link = $('script.current').attr('data-link');
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            fileArr.push(dataConfig.dataList[i].Fileid);
            for (let j = 0; j < packid.length; j++) {
                packArr.push(packid[j]);
            }
        }
        var caseSensitive = document.getElementById("replace-multiple");
        var params = {};
        params.UserID = dataConfig.userID;
        params.UserName = dataConfig.userName;
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.FileID = fileArr;
        params.PackID = packArr;
        params.WordID = $("body").attr("data-rep");
        params.IsAllReplace = false;
        params.Link = link;
        params.OldText = $(".exc_exchange_content").val();
        params.NewText = $(".exc_replace_content").val();
        params.Position = $(".exc_position").val();
        params.CaseSentence = caseSensitive.checked;
        $.ajax({
            method: "post",
            url: urls.editUrl + "/ReplaceSel?size=" + localParam.pageSize + "&index=" + localParam.pageNum,
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function (xhr) {
                $("#excFindBtn").attr("disabled", true).html('查找中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function (xhr) {
                localParam.isGetContent =true;
                $('.my-loading').remove();
                $("#excFindBtn").removeAttr("disabled").html(xhr.responseJSON && xhr.responseJSON.success ? "查找下一句" : "重新查找");
            },
            success: function (data) {
                if (data && data.success) {
                    $("#excFindBtn").attr('firstClick',true);
                    if (localParam.isFirst){
                        $("#edition-area").empty();
                        $("body").attr("data-rep", data.data.records[0].SentenceId);
                        localParam.allPageNum = data.data.pages;
                        //存在不首先加载第一页数据的情况，先加载各页码
                        loadPage.initAllPage(localParam.allPageNum,1);//初始化预加载所有页数
                        loadPage.loadEachPage(data.data.records, localParam.pageNum, localParam.pageSize,$("tr.init-row[data-page='"+ data.data.current +"']"));//加载每页
                        $(".trans_container").mCustomScrollbar('scrollTo', 0);
                        localParam.isFirst = false;
                    }else {
                        loadPage.loadEachPage(data.data.records, localParam.pageNum, localParam.pageSize,trs);
                    }
                    var trList = $("tr.table-row");
                    for (let no = 0, len = trList.length; no < len; no++) {
                        var item = $(trList[no]).attr('data-no');
                        if (+item === +jumpId) {
                            var tr = $(trList[no]),
                                scrollToPosi = tr.position().top > $('#mCSB_1').height() / 2.5
                                    ? tr.position().top - $('#mCSB_1').height() / 2.5 : tr;
                            $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                            break;
                        }
                    }
                    let el = $($("tr.table-row")[0]).find('div.edition-target').contents()[0];
                    utils.addMark($('.exc_exchange_content').val(), $(el));
                }else {
                    $("#edition-area").empty();
                    $.Tips(data.msg);
                }
            },
            error:function (err) {
                console.log(err)
            }
        })
    }

})(window, document, jQuery);

/*
    *** object：处理原、译文查找和替换等内容 ***
*/
var dealSearRepObj = (function (window, document, $) {

    var [findSenTimer, findSenTimerInter, newTimer] = [null, null, null];
    /*
        @describtion: 查找、替换、全部替换
        @params: params
    */
    // 替换
    $("#excBtn").on("click", function () {
        localParam.isFirst = true;
        // localParam.pageNum = 1;
        var _this = this,
            activeTr = $('tr.table-row.active');
        var typeofmethod,
            link = $('script.current').attr('data-link');
        if ($.trim($(".exc_exchange_content").val()) === ""
            || $.trim($(".exc_replace_content").val()) === "") {
            $.Alert("请输入替换内容");
            return false;
        }
        if (!$("body").attr("data-rep")) {
            $.Alert("只能替换查找句段内容");
            return;
        }
        var packArr = [];
        var fileArr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            // var packid = dataConfig.dataList[i].Packid.split(',');
            var packid = dataConfig.dataList[i].Packid;
            fileArr.push(dataConfig.dataList[i].Fileid);
            for (let j = 0; j < packid.length; j++) {
                packArr.push(packid[j]);
            }
        }
        var caseSensitive = document.getElementById("replace-multiple");
        var params = {};
        params.UserID = dataConfig.userID;
        params.UserName = dataConfig.userName;
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.FileID = fileArr;
        params.Link = link;
        params.WordID = $("body").attr("data-rep");
        params.IsAllReplace = false;
        params.OldText = $(".exc_exchange_content").val();
        params.NewText = $(".exc_replace_content").val();
        params.CaseSentence = caseSensitive.checked;
        params.SubmitTime = new Date().getTime();
        var $curDd = $('#edition-area').find('tr[data-no="' + $("body").attr("data-rep") + '"]');
        params.PackID = [$curDd.attr("data-pid")];
        $.LoadTips("正在替换内容");
        $.ajax({
            method: "post",
            url: urls.editUrl + "/Replace",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function (xhr) {
                $(_this).attr("disabled", true);
                $("body").append(`<div class="zeZhao"></div>`);
                $(_this).html('替换中<i class="am-icon-spinner am-icon-spin"></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(".zeZhao").remove();
                $(_this).html("替换");
            },
            success: function (data) {
                if (data.success) {
                    $('.my-loading').remove();
                    if (data.data <= 0) {
                        $.Tips(data.msg);
                        return false;
                    } else {
                        $.LoadTips('数据处理中...');
                    }
                    $.LoadTips(data.msg);
                    dealTranObj.replaceLookup(data.data.SentenceID);
                } else {
                    $('.my-loading').remove();
                    $.Alert(data.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                $.Alert(err.responseJSON.msg);
            }
        })
    });
    // 全部替换
    $("#excAllBtn").on("click", function () {
        var _this = this,
            activeTr = $('tr.table-row.active');
        var typeofmethod,
            link = $('script.current').attr('data-link');
        if ($.trim($(".exc_exchange_content").val()) === ""
            || $.trim($(".exc_replace_content").val()) === "") {
            $.Alert("请输入替换内容");
            return false;
        }
        if (!window.confirm("提示信息：确认全部替换吗？")) {
            return;
        }
        var packArr = [];
        var fileArr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            fileArr.push(dataConfig.dataList[i].Fileid);
            for (let j = 0; j < packid.length; j++) {
                packArr.push(packid[j]);
            }
        }
        var caseSensitive = document.getElementById("replace-multiple");
        var params = {};
        params.UserID = dataConfig.userID;
        params.UserName = dataConfig.userName;
        params.ProjectCreatedTime = dataConfig.createdTime;
        params.ProjectID = dataConfig.ProjectID;
        params.FileID = fileArr;
        params.PackID = packArr;
        params.Link = link;
        params.WordID = 0;
        params.IsAllReplace = true;
        params.OldText = $(".exc_exchange_content").val();
        params.NewText = $(".exc_replace_content").val();
        params.Position = $(".exc_position").val();
        params.CaseSentence = caseSensitive.checked;
        $.LoadTips("正在替换内容");
        $.ajax({
            method: "post",
            url: urls.editUrl + "/ReplaceAll",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function (xhr) {
                $(_this).attr("disabled", true);
                $("body").append(`<div class="zeZhao"></div>`);
                $(_this).html('替换中<i class="am-icon-spinner am-icon-spin" style=""></i>');
            },
            complete: function () {
                $(_this).removeAttr("disabled");
                $(".zeZhao").remove();
                $(_this).html("全部替换");
                $("#excFindBtn").html(`<span class="am-icon-search"></span> 查找`).removeAttr('firstClick');
            },
            success: function (data) {
                if (data.success) {
                    $('.my-loading').remove();
                    if (data.data <= 0) {
                        $.Tips(data.msg);
                        return false;
                    } else {
                        $.LoadTips('数据处理中...');
                    }
                    $.Tips(data.msg);
                    localParam.isFirst = true;
                    // localParam.pageNum = 1;
                    loadPage.initPage(data.data.SentenceID, data.data.FileID,$(`tr.table-row.active`));
                } else {
                    $('.my-loading').remove();
                    $.Alert(data.msg);
                }
            },
            error:function(err){
                $('.my-loading').remove();
                $.Alert(err.responseJSON.msg);
            }
        })
    });

    /*
        **** 查找需要替换的句段 ****
    */
    let current = 0;
    $("#excFindBtn").on("click", function () {
        if (localParam.getContentMethod !== 4 && $("#excFindBtn").text().trim() !== '查找'){
            //替换前查找初始化
            $("#excFindBtn").removeAttr('firstClick');
        }
        if (!$(this).attr('firstClick')){//第一次查找
            localParam.pageNum = 1;
            localParam.getContentMethod = 4;
            localParam.isFirst = true;
            if ($(".exc_exchange_content").val() === "") {
                $.Alert("未输入查找内容");
                return false;
            }
            !document.body.dataset.rep && $("body").attr("data-rep", "0");
            clearTimeout(findSenTimer);
            findSenTimer = setTimeout(function () {
                dealTranObj.replaceLookup();
            }, 500);
        }else {//查找下一个
            current++;
            if (current === $("tr.table-row").length){
                $("tr.table-row").removeClass("active selected");
                $.Tips("无查找内容");
                current = 0;
                $("#excFindBtn").html("重新查找").removeAttr('firstClick');
            }else {
                let tr = $($("tr.table-row")[current]),
                    txt = $('.exc_exchange_content').val(),
                    scrollToPosi = tr.position() && tr.position().top > $('#mCSB_1').height() / 2.5
                        ? tr.position().top - $('#mCSB_1').height() / 2.5 : tr;
                tr.addClass('active').siblings().removeClass("active selected");
                $("body").attr("data-rep", tr.attr('data-no'));
                $(".trans_container").mCustomScrollbar('scrollTo', scrollToPosi);
                $("em").before(txt).remove();
                utils.addMark(txt, $(tr.find('div.edition-target').contents()[0]));
            }
        }
    });

    //预加载数据
    $("label[for=header-replace]").on("mousedown", function () {
        // if ($('tr.init-row').length > 0) {
        //     clearInterval(findSenTimerInter);
        //     findSenTimerInter = setInterval(function () {
        //         if ($('tr.init-row').length === 0) {
        //             clearInterval(findSenTimerInter);
        //             localData = null;
        //             return;
        //         }
        //         var loadList = loadPage.loadEachPage;
        //         var first = $('tr.init-row').first();
        //         first && loadList(localData, +first.attr("data-page"), localParam.pageSize, first);
        //         loadList = null;
        //     }, 1500);
        // }
    });
    $("label[for=header-start],label[for=header-view],label[for=header-search]").on('mousedown', function () {
        clearInterval(findSenTimerInter);
    });
    /*
        语料搜索（网络搜索）
    */
    $('#searchCorpus_btn').on("click", function () {
        var text = $('#searchCorpus_text').val();
        var checkList =[];
        $('.corpusChannel input[type="checkbox"]:checked').each(function(){
            checkList.push($(this).val());
        });
        if (checkList.length > 0) {
            if (text) {
                var _this = this;
                var params = {};
                params.sourceLanguage = dataConfig.sourceLan;
                params.Type = checkList.toString();
                params.Keyword = text;
                $.ajax({
                    method: "post",
                    url: urls.editUrl + "/webSearch",
                    contentType: "application/x-www-form-urlencoded;charset=utf-8",
                    data: params,
                    beforeSend: function () {
                        $(_this).attr("disabled", true);
                        $(_this).html('<i class="am-icon-spinner am-icon-spin"></i>搜索中');
                    },
                    complete: function () {
                        $(_this).removeAttr("disabled");
                        $(_this).html('<span class="am-icon-search"></span> 搜索');
                    },
                    success: function (data) {
                        if (data.success) {
                            var container = document.getElementById('corpusDataList');
                            var dataList = data.data;
                            var html = "";
                            dataList.forEach((item, index) => {
                                html += `<tr>
                                            <td width="50">${index + 1}</td>
                                            <td style="text-align: left;">${item.ch}</td>
                                            <td style="text-align: left;">${item.en}</td>
                                        </tr>`;
                            });
                            container.innerHTML = html;
                            $('.corpusDataTable').show();
                        } else {
                            $.Alert(data.msg);
                            var container = document.getElementById('corpusDataList');
                            container.innerHTML = '';
                            $('.corpusDataTable').hide();
                        }
                    }
                });

            } else {
                $.Alert('请输入需要搜索的文本');
            }
        } else {
            $.Alert('请选择渠道');
        }
    });
})(window, document, jQuery);
