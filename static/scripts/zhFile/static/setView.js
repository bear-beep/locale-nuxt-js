/*
 * 自定义设置
 * author: zy
*/
var mtTransVisible = true;
var v = "?v=" + new Date().getTime();
var style1 = document.createElement('link'),
    style2 = document.createElement('link');
function SetView() { }

//显示设置
SetView.prototype.init = function (setParam) {
    let isSupport = 'zhCN-enUS-frFR-ruRU-deDE-jaJP-esES-zhHK-zhTW';
    mtTransVisible = dataConfig.LangTypePair.indexOf('zhCN') > -1 && isSupport.indexOf(dataConfig.sourceLan) > -1 && isSupport.indexOf(dataConfig.targetLan) > -1;
    var checkBtn = $('button.check-btn'),
        updateBtn = $('button.update-btn'),
        readBtn = $('button.read-btn'),
        mtTransBtn = $('button.mtTrans-btn'),
        bgBtns = $('input[name=setBg]'),
        sizeBtns = $('input[name=setSize]'),
        match = $('input[name=setMatch]');
    var setBtnContainer = document.querySelector("div.header"),
        setBgContainer = document.querySelector("div.content-inner"),
        setSizeContainer = document.querySelector("tbody#edition-area");
    var _class = "add_hidden",
        _tmtbmt = $(".trans-table"),
        _history = $(".trans-info"),
        _read = $(".read-info"),
        _mtTrans = $(".mtTrans"),
        _spell = $(".trans-spell");
    var _arrEl = [_history, _read, _spell, _mtTrans];
    var _arrDt = [setParam.HistoryRecodVisible, setParam.PiyueHistoryVisible, setParam.SpellingVisible, mtTransVisible];

    setParam.SpellingVisible ? checkBtn.addClass('selected') : checkBtn.removeClass('selected');
    setParam.HistoryRecodVisible ? updateBtn.addClass('selected') : updateBtn.removeClass('selected');
    setParam.PiyueHistoryVisible ? readBtn.addClass('selected') : readBtn.removeClass('selected');
    mtTransVisible ? mtTransBtn.addClass('selected') : mtTransBtn.removeClass('selected');
    bgBtns.each((index, el) => {
        +el.value === setParam.BackGroundStyle && $(el).attr('checked', true);
    });
    sizeBtns.each((index, el) => {
        +el.value === setParam.FontSize && $(el).attr('checked', true);
    });
    match.val(setParam.MatchingRateTM);

    //判断某个字符出现的次数
    var n = _arrDt.toString().split('true').length - 1;
    _arrDt.forEach(function (item, index) {
        //显示右侧某些操作
        item ? $(_arrEl[index]).removeClass(_class) : $(_arrEl[index]).addClass(_class);
    });
    _tmtbmt.css('height', 100 / (n + 1) + "%");
    _arrEl.forEach(function (item) {
        item.css('height', 100 / (n + 1) + "%");
    });
    //背景颜色（模式切换）
    style1.rel = 'stylesheet';
    style2.rel = 'stylesheet';
    style1.href = '/css/own-base.css' + v;
    style2.href = '/css/own-editor.css' + v;
    document.head.appendChild(style1);
    document.head.appendChild(style2);
    if (+setParam.BackGroundStyle === 1) {
        setBgContainer.style.background = "#FFFFFF";
        setBgContainer.style.color = "#333";
    } else if (+setParam.BackGroundStyle === 2) {
        setBgContainer.style.background = "#C5EBCB";
        setBgContainer.style.color = "#333";
    } else if (+setParam.BackGroundStyle === 3) {
        setBgContainer.style.background = "#1a2525";
        setBgContainer.style.color = "#888888";
        style1.rel = 'stylesheet';
        style2.rel = 'stylesheet';
        style1.href = '/css/own-base-dark.css' + v;
        style2.href = '/css/own-editor-dark.css' + v;

        document.head.appendChild(style1);
        document.head.appendChild(style2);
    }
    //字号
    if (+setParam.FontSize === 0) {
        setSizeContainer.className = "default-size";
    } else if (+setParam.FontSize === 1) {
        setSizeContainer.className = "small-size";
    } else if (+setParam.FontSize === 2) {
        setSizeContainer.className = "medium-size";
    } else if (+setParam.FontSize === 3) {
        setSizeContainer.className = "big-size";
    }
};

//保存设置
SetView.prototype.add = function () {
    var checkBtn = $('button.check-btn'),
        updateBtn = $('button.update-btn'),
        readBtn = $('button.read-btn'),
        mtTransBtn = $('button.mtTrans-btn'),
        bgBtns = $('input[name=setBg]'),
        sizeBtns = $('input[name=setSize]'),
        match = $('input[name=setMatch]');
    var setBgContainer = document.querySelector("div.content-inner"),
        setSizeContainer = document.querySelector("tbody#edition-area");
    var _class = "add_hidden",
        _tmtbmt = $(".trans-table"),
        _history = $(".trans-info"),
        _read = $(".read-info"),
        _mtTrans = $(".mtTrans"),
        _spell = $(".trans-spell");
    var _arrBtn = [updateBtn, readBtn, checkBtn, mtTransBtn],
        _arrEl = [_history, _read, _spell, _mtTrans];
    var setSize, setBg;
    bgBtns.each((index, el) => {
        $(el).is(':checked') && (setBg = el.value);
    });
    sizeBtns.each((index, el) => {
        $(el).is(':checked') && (setSize = el.value);
    });
    if (match.val() < 75) {
        $.Alert('匹配率需设置75%以上，请重新设置！');
        return;
    }
    if (match.val() > 102) {
        $.Alert('匹配率需设置102%以下，请重新设置！');
        return;
    }
    const params = {
        UserID: dataConfig.userID,
        ButtonVisible: true,
        HistoryRecodVisible: updateBtn.hasClass('selected'),
        PiyueHistoryVisible: readBtn.hasClass('selected'),
        SpellingVisible: checkBtn.hasClass('selected'),
        mtTransVisible: mtTransBtn.hasClass('selected'),
        MatchingRateTM: +match.val() || 75,
        FontSize: +setSize || 0,
        BackGroundStyle: +setBg || 1,
        UserName: dataConfig.userName
    };
    _arrBtn.forEach(function (item, index) {
        item.hasClass('selected') ? $(_arrEl[index]).removeClass(_class) : $(_arrEl[index]).addClass(_class);
    });
    //显示右侧操作
    var n = 0;
    if ($('script.current').attr('data-link') === 'ES') {
        checkBtn.hasClass('selected') ? n = 1 : n = 0;
        _tmtbmt.css('height', 100 / (n + 1) + "%");
        _spell.css('height', 100 / (n + 1) + "%");
    } else {
        _arrEl.forEach(function (item) {
            !item.hasClass(_class) && n++;
        });
        _tmtbmt.css('height', 100 / (n + 1) + "%");
        _arrEl.forEach(function (item) {
            item.css('height', 100 / (n + 1) + "%");
        });
    }
    //背景颜色(模式切换)
    style1.rel = 'stylesheet';
    style2.rel = 'stylesheet';
    style1.href = '/css/own-base.css' + v;
    style2.href = '/css/own-editor.css' + v;
    document.head.appendChild(style1);
    document.head.appendChild(style2);
    if (+setBg === 1) {
        setBgContainer.style.background = "#FFFFFF";
        setBgContainer.style.color = "#333";
    } else if (+setBg === 2) {
        setBgContainer.style.background = "#C5EBCB";
        setBgContainer.style.color = "#333";
    } else if (+setBg === 3) {
        setBgContainer.style.background = "#1a2525";
        setBgContainer.style.color = "#888888";
        style1.rel = 'stylesheet';
        style2.rel = 'stylesheet';
        style1.href = '/css/own-base-dark.css' + v;
        style2.href = '/css/own-editor-dark.css' + v;
        document.head.appendChild(style1);
        document.head.appendChild(style2);
    }
    //字体
    if (+setSize === 0) {
        setSizeContainer.className = "default-size";
    } else if (+setSize === 1) {
        setSizeContainer.className = "small-size";
    } else if (+setSize === 2) {
        setSizeContainer.className = "medium-size";
    } else if (+setSize === 3) {
        setSizeContainer.className = "big-size";
    }
    $.ajax({
        url: urls.editUrl + "/ParameterSet/SetPersonalStyle",
        type: "post",
        dataType: "json",
        data: JSON.stringify(params),
        contentType: "application/json;charset=utf-8"
    });
};

//全屏
SetView.prototype.fullScreen = function () {
    // $('button.fullscreen-btn').addClass('selected');
    var el = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (typeof rfs != "undefined" && rfs) {
        rfs.call(el);
    };
    return;
};

/*
 *  绑定事件
 */
$(document).on('click', 'button.check-btn,button.update-btn,button.mtTrans-btn,button.read-btn,input[name=setBg],input[name=setSize]', function (e) {
    let timer = null;
    if ($(this).hasClass('check-btn') || $(this).hasClass('update-btn') || $(this).hasClass('read-btn') || $(this).hasClass('mtTrans-btn')) {
        $(this).toggleClass('selected');
    }
    if ($(this).hasClass('mtTrans-btn')) {
        if (mtTransVisible) {
            mtTransVisible = false;
        } else {
            mtTransVisible = true;
        }
    }
    clearTimeout(timer);
    timer = setTimeout(function () {
        SetView.prototype.add();
    }, 500);
});
$('input[name=setMatch]').blur(function () {
    SetView.prototype.add();
});
