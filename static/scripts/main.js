/*
 * main.js
 * 配置js文件，异步加载。
*/
// var isIE = navigator.userAgent.indexOf('MSIE');
// if (isIE > -1 && !(window.ActiveXObject && /10\.0/.test(navigator.userAgent))) {
//     window.alert("您使用的浏览器版本过低，推荐使用Chrome浏览器");
//     window.location = "https://www.baidu.com/s?ie=UTF-8&wd=chrome浏览器";
// }
// 图片加载失败时,显示默认图片
window.addEventListener('error',function(e){
    // 当前异常是由图片加载异常引起的
    if(e.target.tagName && e.target.tagName.toUpperCase() === 'IMG' ){
        e.target.src = '/images/single-tags/DocumentFormat.OpenXml.Wordprocessing.NoBreakHyphen.png';
    }
},true)
if ($ !== undefined) {
    //统一添加请求头
    $(document).ajaxSend(function (event, jqxhr, settings) {
        console.log("in req header")
        if (sessionStorage.getItem('token'))jqxhr.setRequestHeader('authorization',sessionStorage.getItem('token'));
        if (sessionStorage.getItem('projectId'))jqxhr.setRequestHeader('projectId',sessionStorage.getItem('projectId'));
    });
    //请求完成拦截
    $(document).ajaxComplete(function (event,xhr,options) {
        if (xhr.status === 401){
            $.Alert('身份验证不通过');
            sessionStorage.clear();
            // window.location.href = urls.login;
        }
        if (xhr.status === 407){
            $.Alert('登录失效');
            sessionStorage.clear();
            window.location.href = urls.login;
        }
        if (xhr.status !== 200 && xhr.status !== 401 && xhr.status !== 407) {
            Sentry.configureScope(scope => {
                scope.setTag('editor-tag', 'editor response')
                scope.setLevel('warning')
                // // will be tagged with my-tag="my value"
                Sentry.captureException(new Error(JSON.stringify(xhr.responseJSON ? xhr.responseJSON : xhr)))
            })
        }
    })
}
// 检测浏览器
getChromeVersion();
function getChromeVersion() {
    var arr = navigator.userAgent.split(' ');
    var chromeVersion = '';
    for(var i=0;i < arr.length;i++){
        if(/chrome/i.test(arr[i]))
            chromeVersion = arr[i]
    }
    if(chromeVersion){
        return Number(chromeVersion.split('/')[1].split('.')[0]);
    } else {
        return false;
    }
};
if(getChromeVersion()) {
    var version = getChromeVersion();
    if(version < 90) {
        if ($('script.current').attr('data-lan')) {
            tipBrowser('For a better experience, please upgrade your browser to Google Chrome 90 or above!', 'Download now', 'No, thanks');
        } else {
            tipBrowser('为了更好地体验，请将浏览器升级为谷歌浏览器90以上版本！', '去下载', '残忍拒绝');
        }
        $('.testR2').css('display', 'block');
    }
} else {
    if ($('script.current').attr('data-lan')) {
        tipBrowser('For a better experience, please upgrade your browser to Google Chrome 90 or above!', 'Download now', 'No, thanks');
    } else {
        tipBrowser('为了更好地体验，请将浏览器升级为谷歌浏览器90以上版本！', '去下载', '残忍拒绝');
    }
    $('.testR2').css('display', 'block');
}

function tipBrowser(txt, btn1, btn2) {
    var ele = "<div class='testR2' style='position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 11000;width: 100%;height: 100%;padding-top: 200px;background-color: #323232'>" +
        "<p style='text-align: center'><img src='/images/chromeImg.png' alt=''></p>" +
        "<p style='font-size: 26px;text-align: center;color: white;margin-top: 20px;'>"+ txt +"</p>" +
        "<p style='text-align: center;margin-top: 160px;'><button type='button' class='am-btn am-btn-primary normal-btn goDownBrowser' style='width: 120px;height: 46px;font-size: 18px;'>"+ btn1 +"</button>" +
        "<button type='button' class='am-btn normal-btn normal-bg-btn cancleTipBrowser' style='margin-left: 40px;width: 120px;height: 46px;font-size: 18px;'>"+ btn2 +"</button></p>" +
        "</div>";
    $(document.body).append(ele);
}
function switchPage(type, lang) {
    if (lang === 'zh') {
        let condition = dataConfig.userID + '_' + dataConfig.userName;
        dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','切换到英文版',condition,baseFnObj.currentLink()]);//埋点
        switch (type) {
            case 'T':
                window.location.href = '/IndexEN';
                break;
            case 'C':
                window.location.href = '/ReviserIndexEN';
                break;
            case 'Q':
                window.location.href = '/QAIndexEN';
                break;
            case 'P':
                window.location.href = '/PMIndexEN';
                break;
            case 'ES':
                break;
        }
    } else {
        switch (type) {
            case 'T':
                window.location.href = '/Index';
                break;
            case 'C':
                window.location.href = '/ReviserIndex';
                break;
            case 'Q':
                window.location.href = '/QAIndex';
                break;
            case 'P':
                window.location.href = '/PMIndex';
                break;
            case 'ES':
                break;
        }
    }
};
$('.goDownBrowser').on('click', function () {
    window.location = "https://www.google.cn/intl/zh-CN/chrome/";
});
$('.cancleTipBrowser').on('click', function () {
    $('.testR2').css('display', 'none');
});
//配置
var v = "?v=" + new Date().getTime();
if ($('script.current').attr('data-lan')) {
    require.config({
        baseUrl: "/scripts",
        paths: {
            "rangy-core": "lib/rangy-core",
            "rangy-exec": "lib/rangy-exec",
            "rangy-range": "lib/rangy-range",
            "rangy-style": "lib/rangy-style",
            // "rangy-text": "lib/rangy-text.min",
            "rangy-text": "lib/rangy-text",
            "config": "config.js" + v,
            "utils": "enFile/static/utils.js" + v,
            "setView": "enFile/static/setView.js" + v,
            "modal": "enFile/static/modal.js" + v,
            "bom": "enFile/static/bom.js" + v,
            "variable": "enFile/static/variable.js" + v,
            "init": "enFile/static/init.js" + v,
            "operationSet": "enFile/static/operationSet.js?v=" + v,
            "search": "enFile/static/search.js" + v,
            "format": "enFile/static/format.js" + v,
            "loadTranslationTxt": "enFile/data/loadTranslationTxt.js" + v,
            "ajaxSet": "enFile/data/ajaxSet.js" + v
        },
        shim: {
            'rangy-range': ['rangy-core'],
            'rangy-style': ['rangy-core'],
            'rangy-exec': ['rangy-range', 'rangy-style'],
            'utils': ['variable'],
            'modal': ['utils'],
            'ajaxSet': ['modal', 'config'],
            'loadTranslationTxt': ['init'],
            'init': ['ajaxSet','setView'],
            'bom': ['ajaxSet'],
            'operationSet': ['ajaxSet'],
            'search': ['operationSet'],
            'setView': ['operationSet']
        }
    });
} else {
    require.config({
        baseUrl: "/scripts",
        paths: {
            "rangy-core": "lib/rangy-core",
            "rangy-exec": "lib/rangy-exec",
            "rangy-range": "lib/rangy-range",
            "rangy-style": "lib/rangy-style",
            // "rangy-text": "lib/rangy-text.min",
            "rangy-text": "lib/rangy-text",
            "config": "config.js" + v,
            "utils": "zhFile/static/utils.js" + v,
            "setView": "zhFile/static/setView.js" + v,
            "modal": "zhFile/static/modal.js" + v,
            "bom": "zhFile/static/bom.js" + v,
            "variable": "zhFile/static/variable.js" + v,
            "init": "zhFile/static/init.js" + v,
            "operationSet": "zhFile/static/operationSet.js?v=" + v,
            "search": "zhFile/static/search.js" + v,
            "format": "zhFile/static/format.js" + v,
            "loadTranslationTxt": "zhFile/data/loadTranslationTxt.js" + v,
            "ajaxSet": "zhFile/data/ajaxSet.js" + v
        },
        shim: {
            'rangy-range': ['rangy-core'],
            'rangy-style': ['rangy-core'],
            'rangy-exec': ['rangy-range', 'rangy-style'],
            'utils': ['variable'],
            'modal': ['utils'],
            'ajaxSet': ['modal', 'config'],
            'loadTranslationTxt': ['init'],
            'init': ['ajaxSet','setView'],
            'bom': ['ajaxSet'],
            'operationSet': ['ajaxSet'],
            'search': ['operationSet'],
            'setView': ['operationSet']
        }
    });
}
require(["bom", "init", "operationSet", "modal", "loadTranslationTxt", 'ajaxSet', 'rangy-exec', 'format', "rangy-text", "search", "setView"]);
