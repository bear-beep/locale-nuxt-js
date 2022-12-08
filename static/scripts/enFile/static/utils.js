/*
* utils 工具类
*/
var utils = (function (window, document, $, undefined) {

    dataConfig.userID = queryParam('UserID');

    //获取url参数
    function queryParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    //随机生成36位字符串
    function randomWord([length, split = [7, 11, 15, 19]]) {
        let str = "",
            pos = 0,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        for (let i = 0; i < length; i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            if (i === split[0] || i === split[1] || i === split[2] || i === split[3]) {
                str += arr[pos] + "-";
            } else {
                str += arr[pos];
            }
        }
        return str;
    }

    //随机生成12位字符串
    function guid() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + S4());
    }

    /** 添加高亮
		@param txt  显示的高亮文本
		@param el   绑定的字段
    */
    function addMark(txt, el) {
        let oldHtml = el.html();
        let texts = oldHtml;

        var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
            regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if(regEn.test(txt) || regCn.test(txt)) {
            return false;
        }
        if (txt) {
            let allVal = oldHtml && oldHtml.match(new RegExp(txt, 'ig'));
            if (allVal) {
                for (var j = 0; j < allVal.length; j++) {
                    texts = texts.replace(allVal[j], '[*' + j + '*]');
                }
                for (var i = 0; i < allVal.length; i++) {
                    texts = texts.replace('[*' + i + '*]', '<em class="mark">' + allVal[i] + '</em>');
                }
            }
        }
        el.html(texts);
    }

    //QA高亮匹配
    function markQaResult(editTr, clickTr) {
        $(clickTr).addClass("active").siblings().removeClass("active");
        if (clickTr.dataset.json) {
            var data = JSON.parse($(clickTr).attr('data-json').replace(/\\"/g, "'"));
            data.forEach(function (item){
                var arr = [];
                var elDiv = item.sentence[0] === "T" ? $(editTr).find("div.edition-target") : $(editTr).find("div.edition-source");
                item.value.forEach((item1) => {
                    arr.indexOf(item1) === -1 && arr.push(item1);
                });
                for (var i = 0; i < elDiv.contents().length; i++) {
                    var node = elDiv.contents()[i],
                        txt = node.innerHTML;
                    var repStr = "";
                    if(!$(node).hasClass('tagWrap')){
                        arr.forEach((item2) => {
                            var pattern = new RegExp("[`~!@#$^&*()=|{}':;\\[\\]<>/?]");
                            if (!pattern.test(item2) && item2 !== '') {
                                //不匹配<Q>、<U>等字符串，包括其子字符串；
                                if (!/^([\<\/]*[qQuU]?[\>]*)$/.test(item2)) {
                                    var reg = null;
                                    try {
                                        reg = new RegExp(item2.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g');
                                    } catch (e) {
                                        reg = item2;
                                    }
                                    repStr = txt.replace(reg, "<U>" + item2 + "</U>");
                                }
                            } else {
                                repStr = txt;
                            }
                            txt = repStr;
                        });
                        node.innerHTML = repStr;
                    }
                }
            });
        }
    }

    //函数节流
    function throttle(fn, delay) {
        var timer = null;
        return function () {
            var cnt = this,
                args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(cnt, args);
            }, delay);
        }
    }

    return {
        queryParam: queryParam,
        randomWord: randomWord,
        guid: guid,
        addMark: addMark,
        throttle: throttle,
        markQaResult: markQaResult
    }

}(window, document, jQuery));
