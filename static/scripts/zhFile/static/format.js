/*
 * 该文件格式化原\译文用。
 * 鼠标mousedown、click等事件，处理原\译文样式，转为符合后端list的格式。
 * CAT入口、插入标签等。
 * author: zhaoyong
*/
define(['rangy-style'], function (s) {

    var clickTimer = null;

    $("table#edition-list").on('mousedown', function (event) {
        var e = window.event || event;
        var ele = null;
        dataConfig.newRangy = s;//格式化函数存放到全局

        //鼠标mousedown时，格式化当前句段内容
        if ($(e.target).parents('td').hasClass('target-text')) {
            let isLock = $(e.target).parents("tr").find("td.lock").attr('data-islock');
            if (isLock==='true'){
                $(".all-change-btn,.change-btn,.bold-btn,.italic-btn,.underline-btn,.sup-btn,.sub-btn,.color-btn,.clear-btn").attr("disabled",true);
                $.Alert("该句段不能操作");
                return;
            }else {
                $(".all-change-btn,.change-btn,.bold-btn,.italic-btn,.underline-btn,.sup-btn,.sub-btn,.color-btn,.clear-btn").removeAttr("disabled");
            }
            //屏蔽回车键
            $(document).keydown(function() { return key(arguments[0]) });
            function key(e) {
                var keynum;
                if (window.event) // IE
                    keynum = e.keyCode;
                else if (e.which) // Netscape/Firefox/Opera
                    keynum = e.which;
                if (keynum === 13) {
                    return false;
                }
            }
            ele = $(e.target).parents("td").find("div.edition-target");
            if (ele.attr('tb-flag') && ele.children().length === 0 && ele.text() !== '') {
                var sourceCnt = ele.parents('tr.table-row').find('div.edition-source').contents();
                var newNode = null;
                for (let i = 0; i < sourceCnt.length; i++) {
                    var _node = sourceCnt[i];
                    if (!$(_node).hasClass('tagWrap')) {
                        newNode = $(_node).clone(true);
                        break;
                    }
                }
                newNode.text(ele.text());
                ele.html(newNode);
                ele.removeAttr('tb-flag');
            } else if (ele.children().length >= 1) {
                var isAllEmpty = ele.find('.fontText').toArray().every(function (item) {
                    return item.className === "fontText";
                });
                var sourceCnt = ele.parents('tr.table-row').find('div.edition-source').contents();
                var newNode = null;
                for (let i = 0; i < sourceCnt.length; i++) {
                    var _node = sourceCnt[i];
                    if (!$(_node).hasClass('tagWrap')) {
                        newNode = $(_node).clone(true);
                        break;
                    }
                }
                if (newNode && ele.html().startsWith('<br>')) {
                    newNode.text(' ');
                    ele.html(newNode);
                } else if (isAllEmpty && newNode && newNode.attr('class') !== 'fontText') {
                    for (var i = 0, len = ele.contents().length; i < len; i++) {
                        var el = ele.contents()[i];
                        if (el.className === 'fontText') {
                            var cloneEl = newNode.clone();
                            var txt = el.innerText || el.textContent;
                            cloneEl.html(txt);
                            $(el).replaceWith(cloneEl);
                        }

                    }
                    //newNode.text(ele.text());
                    //ele.html(newNode);
                }
            }
            if (!/Firefox/i.test(navigator.userAgent)){ // 不为火狐浏览器时执行（火狐浏览器译文框光标不能点击到文字中间）
                s.formatTarget(ele);
            }
            ele.attr("toolformat", "marked");
        }
        if ($(e.target).parents('td').hasClass('source-text') && $(e.target).parents('td').find('div').attr('contenteditable') === 'true') {
            ele = $(e.target).parents("td").find("div.edition-source");
            s.formatTarget(ele);
        }
        // 点击提交
        // if (e.target.tagName === "IMG" && $(e.target).parent("td").hasClass("confirm") || e.target.tagName === "TD" && e.target.classList.contains("confirm")) {
        //     var _this = e.target.tagName === "IMG" ? $(e.target).parent("td") : $(e.target);
        //     var tr = $(_this).parents('tr');
        //     if (tr.hasClass("repeated")) {
        //         return;
        //     }
        //     if (tr.hasClass("locked")) {
        //         $.Alert('该句段已锁定');
        //         return;
        //     }
        //     window.clearTimeout(clickTimer);
        //     s.formatTarget(tr.find(".edition-target"));
        //     clickTimer = window.setTimeout(function () {
        //         //提交ajax
        //         var prev = tr.prev().find('.edition-source').text(),
        //             next = tr.next().find('.edition-source').text(),
        //             curr = tr.find('.edition-source').text(),
        //             trans = tr.find(".edition-target").text();
        //         var sid = tr.attr('data-no'),
        //             fileNmae = tr.attr('data-fname'),
        //             MTtrans = '',
        //             fid = tr.attr('data-fid');
        //         if ($('.catTransMT').find('td.trans').attr('data-wid') === sid) {
        //             MTtrans = $('.catTransMT').find('td.trans').text();
        //         } else {
        //             MTtrans = '';
        //         }
        //         dealTranObj.confirmTrans(tr);
        //         dealCatObj.importTM(prev, next, curr, trans);
        //         dealCatObj.importPro(prev, next, curr, trans, fileNmae);
        //         dealCatObj.tempConfirmTM(prev, next, curr, trans, fileNmae);
        //         dealCatObj.confirmMTTranslation(sid, curr, trans, MTtrans, fid, '');
        //         $('body').removeAttr('data-change');
        //     }, 150);
        // }
    });

    $(document).on('keydown', function (event) {
        var e = event || window.event;
        /*
            **** 左、右键：格式化focus句段内容 ****
        */
        if (e.keyCode === 37 || e.keyCode === 39) {
            var userSelection, range;
            if (window.getSelection) {
                userSelection = window.getSelection();
            } else if (document.selection) {
                userSelection = document.selection.createRange();
            }
            if (userSelection.rangeCount === 0)return;
            range = userSelection.getRangeAt(0);
            var inTag = range.endContainer.parentNode.classList.contains("tagWrap")
                && range.startContainer.parentNode.classList.contains("tagWrap");
            if (inTag) {
                var tar = $("tr.table-row.active"),
                    tarEle = tar.find(".edition-target"),
                    isformat = tarEle.attr("toolformat");
                if (!isformat) {
                    for (var i = 0, len = tarEle.contents().length; i < len; i++) {
                        var node = tarEle.contents()[i];
                        if (node.nodeName === "DIV") {
                            return null;
                        }
                    }
                    s.formatTarget(tarEle);
                    tarEle.attr("toolformat", "marked");
                }
            }
        }
        /*
        * Ctrl+Enter\Shift+Enter：提交选择句段
        */
        if (e.keyCode === _keyCode._enter && e.ctrlKey) {
            e.preventDefault();
            if(Date.now() < dataConfig.restrictions+200){
                $.Alert("请勿频繁操作");
                return false;
            }
            var tr = $("tr.table-row.active"),
                txt = tr.find(".edition-target").text(),
                confirm = tr.find("td.confirm").attr("data-iscon"),
                link = $("script.current").attr('data-link');
            if (tr.length < 1) {
                $.Alert("请让句段处于活动状态");
                return false;
            }
            if (tr.hasClass("locked") || tr.hasClass("repeated")) {
                $.Alert("该句段不能操作");
                return false;
            }
            //提交 ajax
            var $tar = tr.find(".edition-target");
            s.formatTarget($tar);
            var prev = tr.prev().find('.edition-source').text(),
                next = tr.next().find('.edition-source').text(),
                curr = tr.find('.edition-source').text(),
                trans = $tar.text();
            var isTag = (link === "T" && confirm === "1")
                || (link === "C" && confirm === "3")
                || (link === "Q" && confirm === "5")
                || (link === "P" && confirm === "-2")
                || (link === "ES" && confirm === "1");
            var sid = tr.attr('data-no'),
                MTtrans = '',
                fileName = tr.attr('data-fname'),
                fid = tr.attr('data-fid');
            $(tr).find('div.edition-target').attr("data-isDraft",'false');
            if (e.altKey) {
                if (isTag) {
                    classOperation.scrollNextSentence(tr);
                } else {
                    dealTranObj.confirmTrans(tr, "alt");
                }
            } else {
                if (isTag) {
                    tr.addClass("enterTag");
                    classOperation.scrollToNoConfirmSentence(tr);
                } else {
                    dealTranObj.confirmTrans(tr);
                }
            }
            if ($('.catTransMT').find('td.trans').attr('data-wid') === sid) {
                MTtrans = $('.catTransMT').find('td.trans').text();
            } else {
                MTtrans = '';
            }
            dealCatObj.importTM(prev, next, curr, trans);
            dealCatObj.importPro(prev, next, curr, trans, fileName);
            dealCatObj.confirmMTTranslation(sid, curr, trans, MTtrans, fid, '');
            $('body').removeAttr('data-change');
        }
    });
    /*
        *** 确认按钮：提交选择句段 ***
    */
    $(document).on("click", ".enter-btn", function () {
        var tr = $("tr.table-row.active");
        if (tr.length < 1) {
            $.Alert("请让句段处于活动状态");
            return false;
        }
        if (tr.hasClass("locked") || tr.hasClass("repeated")) {
            $.Alert("该句段不能操作");
            return false;
        }
        //提交 ajaxss
        var $tar = tr.find(".edition-target");
        s.formatTarget($tar);
        var prev = tr.prev().find('.edition-source').text(),
            next = tr.next().find('.edition-source').text(),
            curr = tr.find('.edition-source').text(),
            txt = $tar.text();
        var sid = tr.attr('data-no'),
            fileName = tr.attr('data-fname'),
            MTtrans = $(".mtTrans>tbody>tr>.trans").text(),
            fid = tr.attr('data-fid');
        if ($('.catTransMT').find('td.trans').attr('data-wid') === sid) {
            MTtrans = $('.catTransMT').find('td.trans').text();
        } else {
            MTtrans = '';
        }
        dealTranObj.confirmTrans(tr);
        dealCatObj.tempConfirmTM(prev, next, curr, txt, fileName);
        dealCatObj.importTM(prev, next, curr, txt);
        dealCatObj.importPro(prev, next, curr, txt, fileName);
        dealCatObj.confirmMTTranslation(sid, curr, txt, MTtrans, fid, '');
        $('body').removeAttr('data-change');
    });

    // 消除右键自定义事件
    $('.content').not("#edition-list").bind("mousedown", function (e) {
        if (e.button != 2) {
            $('#evaluateBox').css("display", "none");
            $('#DTP-evaluateBox').css("display", "none");
            $('#textareaTarget').val('');
            $('#textareaSource').val('');
            $('#textareaTarget').next().find('i').html(0);
            $('#textareaSource').next().find('i').html(0);
            $('.evaluateIsMust').remove();
        }
    });
});
