/*
 * 该文件是基本类。
 * 定义BOM对象，主要操作窗口位置、拖拽宽高等。
 * author: zhaoyong
*/

var BOM = (function ($) {
    var link = $('script.current').attr('data-link');

    //上下拖动，改变高度
    var bindRowResize = function (str) {
        var el = document.querySelector(str);
        var x = 0;
        $(el).mousedown(function (e) {
            //按下元素后，计算当前鼠标与对象计算后的坐标
            x = e.clientX - el.offsetWidth;
            //FireFox支持window.captureEvents
            el.setCapture ? (
                //捕捉焦点
                el.setCapture(),
                //设置事件
                el.onmousemove = function (ev) {
                    mouseMove(ev || event)
                },
                el.onmouseup = mouseUp
            ) : (
                    //绑定事件
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                )
            //防止默认事件发生
            e.preventDefault();
        });
        function mouseMove(e) {
            $(".tmContent").height(e.clientY - $('div.header').height() - $('div.content-tools-bar').height());
            $(".trans-content").height($('.transArea').height() - $(".tmContent").height() - $('div.header').height() - $('div.content-tools-bar').height());
        }
        function mouseUp() {
            //FireFox支持window.releaseEvents
            el.releaseCapture ? (
                //释放焦点
                el.releaseCapture(),
                //移除事件
                el.onmousemove = el.onmouseup = null
            ) : (
                    //卸载事件
                    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                );
            setTransHeight();
        }
    }
    //窗口左右拖动，改变宽度
    var bindColResize = function (str) {
        var el = document.querySelector(str);
        var x = 0;
        $(el).mousedown(function (e) {
            if (document.body.clientWidth <= 1280) return false;
            //按下元素后，计算当前鼠标与对象计算后的坐标
            x = e.clientX - el.offsetWidth;
            //FireFox支持window.captureEvents
            el.setCapture ? (
                //捕捉焦点
                el.setCapture(),
                //设置事件
                el.onmousemove = function (ev) {
                    mouseMove(ev || event)
                },
                el.onmouseup = mouseUp
            ) : (
                    //绑定事件
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                )
            //防止默认事件发生
            e.preventDefault();
        });
        function mouseMove(e) {
            var prevOri = $(".preview-origin");
            if (prevOri.attr("data-back") == "true") {
                e.clientX <= 840 ? prevOri.width(840) : prevOri.width(e.clientX - 12);
            }
            let kong = 1300/($(document.body).width());
            let left = (e.clientX)*100/($(document.body).width())+'%';
            let right = 100-(e.clientX)*100/($(document.body).width())-kong+'%';
            if (e.clientX > 710 && e.clientX < 1435){
                $(".transArea").css('width',left);
                $(".funcArea").css('width',right);
            }
            // $(".transArea").width(e.clientX);
            // $(".funcArea").width($(document.body).width() - $(".transArea").width() - 3 - 10);
        }
        function mouseUp() {
            //FireFox支持window.releaseEvents
            el.releaseCapture ? (
                //释放焦点
                el.releaseCapture(),
                //移除事件
                el.onmousemove = el.onmouseup = null
            ) : (
                //卸载事件
                $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
            );
            setTransHeight();
            window.setTimeout(() => {
                let kong = 1300/($(document.body).width());
                let right = 100-($(".transArea").width())*100/($(document.body).width())-kong+'%';
                $(".transArea").width() > 710 && $(".funcArea").css('width',right);
                // $(".funcArea").width($(document.body).width() - $(".transArea").width() - 3 - 10);
            }, 500);
        }
    }
    //拖动预览原文窗口宽、高
    var previewOriginResize = function (el) {
        var x = 0, y = 0;
        $(el).mousedown(function (e) {
            $(".iframe_shade").css("pointer-events", "auto");
            x = e.clientX - el.offsetWidth;
            y = e.clientY - el.offsetHeight;
            el.setCapture ? (
                el.setCapture(),
                el.onmousemove = function (ev) {
                    mouseMove(ev || event)
                },
                el.onmouseup = mouseUp
            ) : (
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                )
            e.preventDefault();
        });
        function mouseMove(e) {
            var _target = $(".preview-origin");
            _target.width(e.clientX - _target.offset().left);
            _target.height(e.clientY - _target.offset().top);
        }
        function mouseUp() {
            $(".iframe_shade").css("pointer-events", "none");
            el.releaseCapture ? (
                el.releaseCapture(),
                el.onmousemove = el.onmouseup = null
            ) : (
                    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                );
        }
    }
    //拖动预览句段窗口宽、高
    var previewSenResize = function (el) {
        var x = 0, y = 0;
        $(el).mousedown(function (e) {
            x = e.clientX - el.offsetWidth;
            y = e.clientY - el.offsetHeight;
            el.setCapture ? (
                el.setCapture(),
                el.onmousemove = function (ev) {
                    mouseMove(ev || event)
                },
                el.onmouseup = mouseUp
            ) : (
                    $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                )
            e.preventDefault();
        });
        function mouseMove(e) {
            var _target = $(".preview-sentence");
            _target.width(e.clientX - _target.offset().left);
            _target.height(e.clientY - _target.offset().top);
        }
        function mouseUp() {
            el.releaseCapture ? (
                el.releaseCapture(),
                el.onmousemove = el.onmouseup = null
            ) : (
                    $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
                );
        }
    }
    //拖动不一致预览句段窗口宽、高
    var atypismSenResize = function (el) {
        var x = 0, y = 0;
        $(el).mousedown(function (e) {
            x = e.clientX - el.offsetWidth;
            y = e.clientY - el.offsetHeight;
            el.setCapture ? (
                el.setCapture(),
                    el.onmousemove = function (ev) {
                        mouseMove(ev || event)
                    },
                    el.onmouseup = mouseUp
            ) : (
                $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
            )
            e.preventDefault();
        });
        function mouseMove(e) {
            var _target = $(".atypism-sentence");
            _target.width(e.clientX - _target.offset().left);
            _target.height(e.clientY - _target.offset().top);
        }
        function mouseUp() {
            el.releaseCapture ? (
                el.releaseCapture(),
                    el.onmousemove = el.onmouseup = null
            ) : (
                $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
            );
        }
    }
    //拖动评价窗口宽、高
    var evaluateResize = function (el) {
        var x = 0, y = 0;
        $(el).mousedown(function (e) {
            x = e.clientX - el.offsetWidth;
            y = e.clientY - el.offsetHeight;
            el.setCapture ? (
                el.setCapture(),
                    el.onmousemove = function (ev) {
                        mouseMove(ev || event)
                    },
                    el.onmouseup = mouseUp
            ) : (
                $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
            )
            e.preventDefault();
        });
        function mouseMove(e) {
            var _target = $(".evaluate_box");
            _target.width(e.clientX - _target.offset().left);
            _target.height(e.clientY - _target.offset().top);
        }
        function mouseUp() {
            el.releaseCapture ? (
                el.releaseCapture(),
                    el.onmousemove = el.onmouseup = null
            ) : (
                $(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp)
            );
        }
    }
    //窗口位置拖动
    var dragPreviewWindow = function (obj, dragBar, resBar, resize, point = null) {

        var oBox = document.querySelector(obj);
        var oBar = document.querySelector(dragBar);
        var params = {
            left: 0,
            top: 0,
            currentX: 0,
            currentY: 0,
            xMax: 0,
            xMin: 0,
            yMax: 0,
            yMin: 0,
            flag: false
        };
        //获取相关CSS属性
        var getCss = function (o, key) {
            return o.currentStyle ? o.currentStyle : window.getComputedStyle(o, null)[key];//currentStyle for IE, getComputedStyle for FF,获取元素css属性
        };

        //判断是否超出屏幕
        function Median(target, min, max) {
            if (target > max) return max;
            else if (target < min) return min;
            else return target;
        }

        //拖拽的实现
        var startDrag = function (bar, target, callback) {

            params.xMax = document.documentElement.clientWidth - parseInt(getCss(target, "width"));
            params.yMax = document.documentElement.clientHeight - parseInt(getCss(target, "height"));
            params.xMin = 0;
            params.yMin = 0;

            if (getCss(target, "left") !== "auto") {
                params.left = getCss(target, "left");
            }
            if (getCss(target, "top") !== "auto") {
                params.top = getCss(target, "top");
            }
            //o是移动对象
            bar.onmousedown = function (event) {
                point ? point.css("pointer-events", "auto") : '';
                event.preventDefault();
                params.flag = true;
                if (!event) {
                    event = window.event;
                    //防止IE文字选中
                    bar.onselectstart = function () {
                        return false;
                    }
                }
                var e = event;
                params.currentX = e.clientX;
                params.currentY = e.clientY;
                point ? setTransHeight() : "";
                document.onmouseup = function () {
                    point ? point.css("pointer-events", "none") : '';
                    params.flag = false;
                    if (getCss(target, "left") !== "auto") {
                        params.left = getCss(target, "left");
                    }
                    if (getCss(target, "top") !== "auto") {
                        params.top = getCss(target, "top");
                    }
                    point ? setTransHeight() : "";
                    document.onmousemove = null;
                };
                document.onmousemove = function (event) {
                    var e = event ? event : window.event;
                    var tar = document.querySelector(resBar);
                    if (params.flag) {
                        var _resize = $(obj).attr("data-origin");
                        if (_resize == "true") {
                            var _top = $(obj).offset().top;
                            var _left = e.clientX;
                            params.top = _top;
                            params.left = _left;
                            var _find = $(".nav-contents-list");
                            $(obj).css({ "width": _find.width(), "height": _find.height() / 2 });
                            $(obj).css("position", "fixed");
                            $(obj).attr("data-origin", "false");
                            $(obj).attr("data-back", "false");
                            resize(tar);
                        }
                        var nowX = e.clientX, nowY = e.clientY;
                        var disX = nowX - params.currentX, disY = nowY - params.currentY;
                        var targetX = parseInt(params.left) + disX;
                        var targetY = parseInt(params.top) + disY;
                        target.style.left = targetX + "px";
                        target.style.top = targetY + "px";
                        tar.style.display = "block";
                    }
                    if (typeof callback == "function") {
                        callback(Median(targetX, params.xMin, params.xMax), Median(targetY, params.yMin, params.yMax));
                    }
                }
            };

        };
        startDrag(oBar, oBox);
    }
    // 聊天室拖动
    var chatRoomDrag = function () {
        var moveChat = false;//移动标记
        var _x,_y;//鼠标离控件左上角的相对位置
        var WidthB = document.documentElement.clientWidth;
        var HeightB = document.documentElement.clientHeight;
        var downX, downY, upX, upY;
        $("#chatRoom").mousedown(function(e){
            moveChat = true;
            _x = e.pageX - parseInt($("#chatRoom").css("left"));
            _y = e.pageY - parseInt($("#chatRoom").css("top"));
            downX = e.pageX;
            downY = e.pageY;
        });
        $(document).mousemove(function(e){
            if(moveChat){
                var x = e.pageX - _x;//控件左上角到屏幕左上角的相对位置
                var y = e.pageY - _y;
                if (x + 110 > WidthB) {
                    x = WidthB - 110
                }
                if (x < 0) {
                    x = 0
                }
                if (y + 110 > HeightB) {
                    y = HeightB - 110
                }
                if (y < 0) {
                    y = 0
                }
                $("#chatRoom").css({"top": y,"left": x});
            }
        })
        $(document).mouseup(function(e){
            moveChat = false;
            upX = e.pageX;
            upY = e.pageY;
            if (Math.abs(upX - downX) < 5 && Math.abs(upY - downY) < 5) {
                if (dataConfig.chatRoomId && dataConfig.chatRoomId !== '') {
                    dataConfig.isProduction && window._czc && window._czc.push(['_trackEvent','其他','进入聊天室',baseFnObj.currentLink()]);//埋点
                    let url = urls.chatRoom + "/#/ChatRoom?sys=pangu&roomid=" + dataConfig.chatRoomId;
                    dataConfig.msgNum = 0;
                    $(".chatRoom").removeClass('shake-hard');// 移出聊天室图标抖动
                    $(".chatRoomMsg,.unreadMsgNum").css('display','none');
                    let a = document.createElement('a');
                    a.href = url;
                    a.target = dataConfig.tokenPM;
                    a.click();
                    a.remove();
                } else {
                    getChatRoomID('two');
                }
            }
        });
    };
    // 评价窗口拖动
    var evaluateDrag = function (id) {
        var Drag = document.getElementById(id);
        Drag.onmousedown = function(event) {
            var ev = event || window.event;
            var WidthB = document.documentElement.clientWidth;
            var HeightB = document.documentElement.clientHeight;
            event.stopPropagation();
            var disX = ev.clientX - Drag.offsetLeft;
            var disY = ev.clientY - Drag.offsetTop;
            // Drag.style.transform = 'none'
            document.onmousemove = function(event) {
                var ev = event || window.event;
                if (ev.clientX + (Drag.offsetWidth - disX) > WidthB) {
                    Drag.style.left = WidthB - Drag.offsetWidth
                } else {
                    Drag.style.left = ev.clientX - disX + "px";
                }
                if (ev.clientY - disY + Drag.offsetHeight > HeightB) {
                    Drag.style.top = HeightB - Drag.offsetHeight
                } else {
                    Drag.style.top = ev.clientY - disY + "px";
                }
                Drag.style.cursor = "move";
            };
        };
        Drag.onmouseup = function() {
            document.onmousemove = null;
            this.style.cursor = "default";
        };
    };

    setTransHeight();
    bindColResize(".content-drag-bar");
    bindRowResize("#heightResize");
    dragPreviewWindow(".preview-origin", ".preview-origin-Dragbar", ".preview-resize", previewOriginResize, $(".iframe_shade"));//拖动预览原文
    dragPreviewWindow(".preview-sentence", ".preview-sen-Dragbar", ".sentence-resize", previewSenResize);//拖动预览句段
    dragPreviewWindow(".atypism-sentence", ".atypism-sen-Dragbar", ".atypism-resize", atypismSenResize);//拖动不一致预览句段
    chatRoomDrag();
    if (link !== 'ES' && link !== 'T') {
        evaluateDrag("evaluateBox");
        evaluateDrag("DTP-evaluateBox");
    }
    if (link === 'T') {
        evaluateDrag("DTP-evaluateBox");
    }

    //设置编辑高度
    function setTransHeight(term) {
        var _top = document.querySelector(".trans_title") && document.querySelector(".trans_title").getBoundingClientRect().bottom,
            _bottom_none = document.querySelector(".content-footer").getBoundingClientRect().top,
            _bottom_block = document.querySelector(".preview-origin").getBoundingClientRect().top;
        var el = $(".preview-origin");
        term && (
            _bottom_block = document.querySelector(".add-term").getBoundingClientRect().top,
            el = $(".add-term")
        );
        if (el.css("display") == "block" && el.css("position") == "absolute") {
            $(".trans_container").css("height", _bottom_block - _top);
        } else {
            $(".trans_container").css("height", _bottom_none - _top);
        }
    }

    return { setTransHeight }
})(jQuery);


//复位
$("#re-origin,#re-sentence,.re-sentence,.re-origin").on("click", function () {
    var target, origin, flag;
    flag = this.id === 're-origin' || this.classList.contains('re-origin');
    flag ? (
        target = $(".preview-origin"),
        origin = document.querySelector(".preview-resize")
    ): (
        target = $(".preview-sentence"),
        origin = document.querySelector(".sentence-resize")
    );
    if (target.attr("data-origin") === "false") {
        target.css({
            "position": "absolute",
            "height": flag ? "50%" : "250px",
            "width": $(".transArea").width() - 2,
            "left": 0,
            "top": "auto",
            "bottom": 39
        });
        target.attr({ "data-origin": "true", "data-back": "true" });
        origin.style.display = "none";
        flag ? BOM.setTransHeight() : "";
    }
});
// 不一致复位
$(".re-atypismsentence").on("click", function () {
    var target, origin, flag;
    flag = this.id === 're-origin' || this.classList.contains('re-origin');
    target = $(".atypism-sentence");
    origin = document.querySelector(".atypism-resize");
    if (target.attr("data-origin") === "false") {
        target.css({
            "position": "absolute",
            "height": flag ? "50%" : "250px",
            "width": $(".transArea").width() - 2,
            "left": 0,
            "top": "auto",
            "bottom": 39
        });
        target.attr({ "data-origin": "true", "data-back": "true" });
        origin.style.display = "none";
        flag ? BOM.setTransHeight() : "";
    }
});
