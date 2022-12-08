/*
 * 所搜的对象。
 * mainSearch：顶部搜索原\译文
 * partSearch：右侧搜索
 * author: zhaoyong
*/
var mainSearch = (function (window,document,$) {

    var searchTimer = null;

    function gEBI(id) {
        return document.getElementById(id);
    }

    //发送搜索
    function doSearch(options, el,tr) {
        classOperation.clearContent();
        localParam.isGetContent = false;
        options = options || {};
        var link = $('script.current').attr('data-link');
        var fileArr = [],
            packArr = [];
        for (let i = 0; i < dataConfig.dataList.length; i++) {
            var packid = dataConfig.dataList[i].Packid;
            fileArr.push(dataConfig.dataList[i].Fileid);
            for (let j = 0; j < packid.length; j++) {
                packArr.push(packid[j]);
            }
        }
        var params = {
            FileID: fileArr,
            OrderStr: '1',
            IsCapsLock: $("#caseSensitive").prop('checked'),
            IsWholeWord: $("#wholeWord").prop('checked'),
            Link: link,
            PackID: packArr,
            ProjectCreatedTime: dataConfig.createdTime,
            ProjectID: dataConfig.ProjectID,
            SelectSourceStr: $("#filterSource").val(),
            SelectTransStr: $("#filterTarget").val(),
            UserID: dataConfig.userID,
            WordID: ''
        };
        $.ajax({
            type: "post",
            url: urls.editUrl + "/Search?size=" + localParam.pageSize + "&index=" + localParam.pageNum,
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            success: function (result) {
                if (result.success) {
                    if (result.data.records.length > 0) {
                        if (localParam.isFirst){
                            $(".updataList>tbody").empty();
                            $(".transList>tbody").empty();
                            $('.tmTransInfo>thead').empty();
                            $(".trans_spell").empty();
                            $("#edition-area").empty();
                            $('.trans-table .tmDetail').hide();
                            $('.transDetail').hide();
                            $('.tmtb-tab').css({ 'height': '100%' });
                            localParam.allPageNum = result.data.pages;
                            loadPage.loadEachPage(result.data.records, localParam.pageNum, localParam.pageSize);
                            loadPage.initAllPage(localParam.allPageNum);
                            $(".trans_container").mCustomScrollbar('scrollTo', 0);
                            dealTranObj.getProgress();//获取翻译进度
                            localParam.isFirst = false;
                        }else {
                            loadPage.loadEachPage(result.data.records, localParam.pageNum, localParam.pageSize,tr);
                        }
                    } else {
                        $.Alert("查找无该内容");
                    }
                } else {
                    $("#edition-area").empty();
                    $.Alert(result.msg);
                }
            },
            complete: function () {
                localParam.isGetContent =true;
                $(".my-loading").remove();
                $(el).removeAttr("disabled");
                $(el).html('<span class="am-icon-search"></span>查找');
            },
            error: function (error) {
                $.Alert("搜索失败，请重试");
            }
        });
    }

    //enter搜索原文
    gEBI("filterSource").onkeydown = function (event) {
        var e = event || window.event;
        var searchBoxSource = gEBI("filterSource"),
            caseSensitive = gEBI("caseSensitive");
        if (e.keyCode === _keyCode._enter) {
            var sourceVal = searchBoxSource.value;
            $.LoadTips('查找中，请勿频繁操作');
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(function () {
                localParam.searchOringin = sourceVal;
                localParam.searchTrans = "";
                localParam.pageNum = 1;
                localParam.getContentMethod = 3;
                localParam.isFirst = true;
                doSearch({
                    originTxt: sourceVal,
                    isSensitive: caseSensitive.checked
                });
            },300);
        }
    }
    //enter搜索译文
    gEBI("filterTarget").onkeydown = function (event) {
        var e = event || window.event;
        var searchBoxTarget = gEBI("filterTarget"),
            caseSensitive = gEBI("caseSensitive");
        if (e.keyCode === _keyCode._enter) {
            var targetVal = searchBoxTarget.value;
            $.LoadTips('查找中，请勿频繁操作');
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(function () {
                localParam.searchOringin = "";
                localParam.searchTrans = targetVal;
                localParam.pageNum = 1;
                localParam.getContentMethod = 3;
                localParam.isFirst = true;
                doSearch({
                    transTxt: targetVal,
                    isSensitive: caseSensitive.checked
                });
            }, 300);
        }
    }
    //搜索原文、译文
    gEBI("filterBtn").onclick = function () {
        var _this = this;
        var searchBoxSource = gEBI("filterSource"),
            searchBoxTarget = gEBI("filterTarget"),
            caseSensitive = gEBI("caseSensitive"),
        //修改
        wholeWord = gEBI("wholeWord");
        var sourceVal = searchBoxSource.value,
            targetVal = searchBoxTarget.value;
        let condition ='';
        if (caseSensitive.checked)condition += '-区分大小写';
        if (wholeWord.checked)condition += '-全字匹配';
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','查找','查找',baseFnObj.currentLink() + condition]);//埋点
        $(_this).attr("disabled", true);
        $(_this).html('查找中<i class="am-icon-spinner am-icon-spin"></i>');
        $.LoadTips('查找中，请勿频繁操作');
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
            localParam.searchOringin = sourceVal;
            localParam.searchTrans = targetVal;
            localParam.pageNum = 1;
            localParam.getContentMethod = 3;
            localParam.isFirst = true;
            doSearch({
                originTxt: sourceVal,
                transTxt: targetVal,
                isSensitive: caseSensitive.checked,
                isWholeWord:wholeWord.checked
            }, _this);
        //    修改结束
        }, 300);
    };
    return {
        doSearch
    }
})(window, document,jQuery);

/*
    *** 定义搜索构造函数 ***
*/
function partSearch() {
    this._init();
}
//初始化获取部分参数
partSearch.prototype._init = function () {
    var searchtxt = document.getElementById("search_text").value;
    var language = $('#language-pair').val();
    return {
        proid: dataConfig.ProjectID,
        source: language.slice(0, 4),
        target: language.slice(4),
        txt: searchtxt
    }
}
//搜索方法一
partSearch.prototype.fileSen = function (config, search) {
    return new Promise(function (resolve, reject) {
        var params = {
            projectId: config.proid,
            lanSource: config.source,
            // LanTagert: config.target,
            senOrig: config.txt
        };
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/file/SenSel",
            dataType: "json",
            data: JSON.stringify(params),
            contentType: "application/json;charset=utf-8",
            beforeSend: function () {
                $('#search_btn').attr("disabled", true);
                $('#search_btn').html('<i class="am-icon-spinner am-icon-spin"></i>搜索中');
            },
            complete: function () {
                $('#search_btn').removeAttr("disabled");
                $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
                $('#type-pair').val() === 'tm' && search.tmSearch(config, dataConfig.DataBaseId_TM);
                $('#type-pair').val() === 'tb' && search.tbSearch(config);
                $('#type-pair').val() === 'tb1' && search.tbSearchNew(config, dataConfig.DataBaseId_TB);
            },
            success: function (data) {
                if (data.success) {
                    var result = data.data;
                    var html = "";
                    result.forEach((item, index) => {
                        var reg = null,
                            regStr = "", repStr = "";
                        if (item.wordsColorList && item.wordsColorList.length > 0) {
                            item.wordsColorList.forEach((word) => {
                                word && (regStr += "(" + word + ")|");
                            });
                            regStr = regStr.slice(0, -1);
                            try {
                                reg = new RegExp(regStr, 'ig');
                            } catch (err) {
                                reg = config.txt;
                            }
                        } else {
                            try {
                                reg = new RegExp(config.txt, 'ig');
                            } catch (err) {
                                reg = config.txt;
                            }
                        }
                        item.senOrig = item.senOrig.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        item.senTrans = item.senTrans.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        repStr = item.senOrig.replace(reg, function (word) {
                            return '<span class="matchResult">' + word + '</span>';
                        });
                        html += `<tr class='tr-xm tm-tb-tr copy-tb' onclick="dealCatObj.showDetailTBTM(this)" data='{"name":"${item.modifier}","area":"${item.filename.replace(/'|"/g,'.')}","time":"${item.modifyTime}"}' data-db=${config.id ? config.id : ""}>
                                    <td style='width:30px;padding:0;vertical-align:middle;text-align:center'>${index+1}</td>
                                    <td>${repStr}</td>
                                    <td class="trans-bg trans-per" style="padding:0;width:42px;">${(item.matchRate * 100).toFixed(0)}%</td >
                                    <td class="trans-bg trans-tm">项目</td>
                                    <td class="trans tmTrans" data-id="${config.id}" data-tm="${(item.matchRate * 100).toFixed(0)}">${item.senTrans}</td>
                                </tr>`;
                    });
                    $(".searchList>tbody").append(html);
                    resolve($('.searchList>tbody>tr').length);
                }
            }
        });
    });
}
//tm搜索
partSearch.prototype.tmSearch = function (config, dbids) {
    return new Promise(function (resolve, reject) {
        var idArr = dbids.map(item => +item);
        var source = document.getElementById('language-pair').value.slice(0, 4);
        // var rWord = source === dataConfig.sourceLan ? encodeURIComponent(config.txt) : '',
        //     tWord = source === dataConfig.sourceLan ? '' : encodeURIComponent(config.txt);
        var rWord = source === dataConfig.sourceLan ? config.txt : '',
            tWord = source === dataConfig.sourceLan ? '' : config.txt;
        var params = {
            tmReverseIds: dataConfig.reverseIds,
            indexIds: idArr,
            isApproved: true,
            number: dataConfig.number,
            rowKey: "",
            rtext: rWord,
            ttext: tWord,
            rLanguageType: dataConfig.sourceLan,
            tLanguageType: dataConfig.targetLan
        };
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/match/tm/search",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify(params),
            // beforeSend: function () {
            //     $('#search_btn').attr("disabled", true);
            //     $('#search_btn').html('<i class="am-icon-spinner am-icon-spin"></i>搜索中');
            // },
            // complete: function () {
            //     $('#search_btn').removeAttr("disabled");
            //     $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
            //     partSearch.prototype.fileSen(config)
            // },
            success: function (res, text, xhr) {
                var data = res.data;
                var trLen = $('.searchList>tbody>tr').length,
                    ismt = $('.searchList>tbody>tr').first().attr('toolmt');
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (res.success) {
                        var data = res.data;
                        var html = "";
                        for (var i = 0, len = data.length; i < len; i++) {
                            var reg = null;
                            try {
                                reg = new RegExp(config.txt.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'ig');
                            } catch (err) {
                                reg = config.txt;
                            }
                            var pattern = new RegExp("[<>]"); // 尖括号影响标签展示
                            if (pattern.test(data[i].translationText)) {
                                data[i].translationText = data[i].translationText.replace(/</g, '&lt;');
                                data[i].translationText = data[i].translationText.replace(/>/g, '&gt;');
                            }
                            data[i].rawText = data[i].rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            let newText = data[i].rawText.replace(reg, function (word) {
                                return '<span class="matchResult">' + word + '</span>';
                            });
                            let isTitle = data[i].reverse ? "title='源自反向语料库'" : "",
                                isBg = data[i].reverse ? 'background:#eee' : "";
                            html += `<tr class="tm-tb-tr tmwithtime-tmindexinfo copy-tb" ${isTitle} onclick="dealCatObj.showDetailTBTM(this)" data-key="${data[i].rowKey}" data-mold="tm" data-db=${config.id ? config.id : ""}>
                                <td style='width:30px;padding:0;vertical-align:middle;text-align:center;${isBg}'>${ismt ? (trLen + i) : (trLen + i + 1)}</td>
                                <td>${source === dataConfig.sourceLan ? newText : data[i].rawText}</td>
                                <td class="trans-bg trans-per" style="padding:0;width:42px;">${(data[i].percentage * 100).toFixed(0)}%</td>
								<td class="trans-bg trans-tm">TM</td>
								<td class="trans tmTrans" data-id="${config.id}" data-tm="${(data[i].percentage * 100).toFixed(0)}">${source === dataConfig.sourceLan ? data[i].translationText : data[i].translationText.replace(reg, `<span class="matchResult">${config.txt}</span>`)}</td>
                            </tr>`;
                        }
                        $(".searchList>tbody").append(html);
                        $(".search_result_total>font").html($('.searchList>tbody>tr').length);
                    }
                }
                $(".my-loading").remove();
                $('#search_btn').removeAttr("disabled");
                $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
                resolve($('.searchList>tbody>tr').length);
            }
        });
    });
}
//tb项目库搜索
partSearch.prototype.tbSearch = function (config) {
    return new Promise(function (resolve, reject) {
        var source = document.getElementById('language-pair').value.slice(0, 4);
        var rWord = source === dataConfig.sourceLan ? encodeURIComponent(config.txt) : '',
            tWord = source === dataConfig.sourceLan ? '' : encodeURIComponent(config.txt);
        $.ajax({
            method: "get",
            url: urls.tmtbUrl + "/termproj/search/" + dataConfig.ProjectID,
            data: {
                Number: dataConfig.number,
                rWord: rWord,
                tWord: tWord,
                RowKey: ""
            },
            dataType: "json",
            // beforeSend: function () {
            //     $('#search_btn').attr("disabled", true);
            //     $('#search_btn').html('<i class="am-icon-spinner am-icon-spin"></i>搜索中');
            // },
            // complete: function () {
            //     $('#search_btn').removeAttr("disabled");
            //     $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
            //     partSearch.prototype.fileSen(config)
            // },
            success: function (res, text, xhr) {
                var data = res.data;
                var trLen = $('.searchList>tbody>tr').length,
                    ismt = $('.searchList>tbody>tr').first().attr('toolmt');
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var html = "";
                    for (var i = 0, len = data.length; i < len; i++) {
                        var reg = null;
                        try {
                            reg = new RegExp(config.txt.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'ig');
                        } catch (err) {
                            reg = config.txt;
                        }
                        data[i].Model.rText = data[i].Model.rText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        data[i].Model.tText = data[i].Model.tText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        let newText = data[i].Model.rText.replace(reg, function (word) {
                            return '<span class="matchResult">' + word + '</span>';
                        });
                        html += `<tr class="tm-tb-tr tmwithtime-tmindexinfo copy-tb" onclick="dealCatObj.showDetailTBTM(this)" data-key="${data[i].RowKey}" data-mold="tb" data-db=${config.id ? config.id : ""}>
                                <td style='width:30px;padding:0;vertical-align:middle;text-align:center'>${ismt ? (trLen + i) : (trLen + i + 1)}</td>
                                <td>${source === dataConfig.sourceLan ? newText : data[i].Model.rText}</td>
                                <td class="trans-bg trans-per" style="padding:0;width:42px;">${(data[i].Percentage * 100).toFixed(0)}%</td>
								<td class="trans-bg trans-tb">TB</td>
								<td><span class='tbWrap' data-id="${config.id}" data-txt="${data[i].Model.tText}">${source === dataConfig.sourceLan ? data[i].Model.tText : data[i].Model.tText.replace(reg, `<span class="matchResult">${config.txt}</span>`)}</span></td>
                            </tr>`;
                    }
                    $(".searchList>tbody").append(html);
                    $(".search_result_total>font").html($('.searchList>tbody>tr').length);
                }
                $(".my-loading").remove();
                $('#search_btn').removeAttr("disabled");
                $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
                resolve($('.searchList>tbody>tr').length);
            }
        });
    });
};
// TB参考库
partSearch.prototype.tbSearchNew = function (config, tbids) {
    return new Promise(function (resolve, reject) {
        var idArr = tbids.map(item => +item);
        var source = document.getElementById('language-pair').value.slice(0, 4);
        var rWord = source === dataConfig.sourceLan ? encodeURIComponent(config.txt) : '',
            tWord = source === dataConfig.sourceLan ? '' : encodeURIComponent(config.txt);
        $.ajax({
            method: "post",
            url: urls.tmtbUrl + "/terms/search?Number=" + dataConfig.number + "&rWord=" + rWord + "&tWord=" + tWord + "&IsApproved=true&RowKey=",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(idArr),
            dataType: "json",
            // beforeSend: function () {
            //     $('#search_btn').attr("disabled", true);
            //     $('#search_btn').html('<i class="am-icon-spinner am-icon-spin"></i>搜索中');
            // },
            // complete: function () {
            //     $('#search_btn').removeAttr("disabled");
            //     $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
            //     partSearch.prototype.fileSen(config)
            // },
            success: function (res, text, xhr) {
                var data = res.data;
                var trLen = $('.searchList>tbody>tr').length,
                    ismt = $('.searchList>tbody>tr').first().attr('toolmt');
                if (res && res.success && data.length > 0) {
                    var html = "";
                    for (var i = 0, len = data.length; i < len; i++) {
                        var reg = null;
                        try {
                            reg = new RegExp(config.txt.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'ig');
                        } catch (err) {
                            reg = config.txt;
                        }
                        var pattern = new RegExp("[<>]"); // 尖括号影响标签展示
                        if (pattern.test(data[i].Model.tText)) {
                            data[i].Model.tText = data[i].Model.tText.replace(/</g, '&lt;');
                            data[i].Model.tText = data[i].Model.tText.replace(/>/g, '&gt;');
                        }
                        data[i].Model.rText = data[i].Model.rText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        let newText = data[i].Model.rText.replace(reg, function (word) {
                            return '<span class="matchResult">' + word + '</span>';
                        });
                        html += `<tr class="tm-tb-tr termwithtime-termindexinfo copy-tb" onclick="dealCatObj.showDetailTBTM(this)" data-key="${data[i].RowKey}" data-mold="tb1" data-db=${config.id ? config.id : ""}>
                                <td style='width:30px;padding:0;vertical-align:middle;text-align:center'>${ismt ? (trLen + i) : (trLen + i + 1)}</td>
                                <td>${source === dataConfig.sourceLan ? newText : data[i].Model.rText}</td>
                                <td class="trans-bg trans-per" style="padding:0;width:42px;">${(data[i].Percentage * 100).toFixed(0)}%</td>
								<td class="trans-bg trans-tm">TB</td>
								<td class="trans tmTrans" data-id="${config.id}" data-tm="${(data[i].Percentage * 100).toFixed(0)}">${source === dataConfig.sourceLan ? data[i].Model.tText : data[i].Model.tText.replace(reg, `<span class="matchResult">${config.txt}</span>`)}</td>
                            </tr>`;
                    }
                    $(".searchList>tbody").append(html);
                    $(".search_result_total>font").html($('.searchList>tbody>tr').length);
                }
                $(".my-loading").remove();
                $('#search_btn').removeAttr("disabled");
                $('#search_btn').html('<span class="am-icon-search"></span> 搜索');
                resolve($('.searchList>tbody>tr').length);
            }
        });
    });
}
//复制并搜索
partSearch.prototype.copySearch = function (_proto_, ele) {
    var pair = document.getElementById('language-pair'),
        source = pair.value.slice(0, 4);
    var txt = source === dataConfig.sourceLan ? ele.find('div.edition-source').text() : ele.find('div.edition-target').text(),
        tabSearch = document.querySelector('._search'),
        searchBox = document.getElementById('search_text'),
        searchBtn = document.getElementById('search_btn');
    var userSelection;
    if (window.getSelection) {
        userSelection = window.getSelection();
    } else if (document.selection) {
        userSelection = document.selection.createRange();
    }
    if (userSelection && userSelection.type === "Range") {
        searchBox.value = userSelection.toString();
    } else {
        searchBox.value = txt;
    }
    tabSearch.click();
    $.LoadTips("搜索中，请勿频繁操作");
    $('._search .tmDetail').hide();
    $('.search-result').css({ 'height': 'calc(100% - 70px)' });
    $(".searchList>tbody").empty();
    $('.searchList').css('display', 'none');
    $(".search_result_total>font").html(0);

    var param = _proto_._init();
    param.id = ele[0].dataset.no;
    dealCatObj.getMTofResult(param.source, param.target, param.txt, "", ".searchList>tbody");
    _proto_.fileSen(param, _proto_).then(data => {
    // _proto_.tmSearch(param, dataConfig.DataBaseId_TM).then(data => {
        $(".search_result_total>font").html(data);
        $('.my-loading').remove();
    }).catch(err => {
        $('.my-loading').remove();
        $.Alert("搜索失败，请重试");
    });
    $('.searchList').show();
}
