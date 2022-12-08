/*
 * 弹窗、props扩展对象。
 * 加载时、成功时、失败时等提示框扩展。
 * author: zhaoyong
*/
jQuery.extend({
    Confirm: function (txt) {
        $('#my-confirm').remove();
        const ele = `
             <div class="am-modal am-modal-confirm" tabindex="-1" id="my-confirm">
                    <div class="am-modal-dialog" style="width:360px">
                        <div class="am-modal-hd">Prompt</div>
                        <div class="am-modal-bd" style="padding-bottom:25px;">${txt || 'Do you confirm this operation?'}</div>
                        <div class="am-modal-footer">
                            <span class="am-modal-btn" data-am-modal-confirm>Yes</span>
                            <span class="am-modal-btn" data-am-modal-cancel style="color:#333">Cancel</span>
                        </div>
                    </div>
                </div>
            `;
        $('body').append(ele);
    },
	Tips: function(txt){
        var tar = $("head");
        var i = tar.attr("data-tips");
        i++;
        tar.attr("data-tips",i);
        var ele = '<div class="my-alert my-tips-'+i+'" style="height: 40px;line-height: 40px;border-radius: 5px;' +
            'background-color: #27A9E3;position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:2px 3px 8px 1px #666;font-family:Microsoft YaHei">'+ txt +'</div>';
        $(document.body).append(ele);
        window.setTimeout(function(){
            $(".my-tips-" + i).animate({ top: 30 + "%", opacity: 0 }, 500, function () {
                $(this).remove();
            })
        },3000);
    },
    Alert: function(txt){
        var tar = $("head");
        var i = tar.attr("data-alert");
        i++;
        tar.attr("data-alert",i);
        var ele = '<div class="my-alert my-alert-'+i+'" style="height: 40px;line-height: 40px;border-radius: 5px;' +
            'background: rgba(217,60,55,1);position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:2px 3px 8px 1px #666;font-family:Microsoft YaHei">'+ txt +'</div>';
        $(document.body).append(ele);
        window.setTimeout(function(){
            $(".my-alert-"+i).animate({top:30+"%",opacity:0},500,function(){
                $(this).remove();
            })
        },1800);
    },
    LoadTips: function (txt) {
        var ele = '<div class="my-loading" style="height: 40px;line-height: 40px;border-radius: 5px;' +
            'background: #27A9E3;position:absolute;z-index:9999;left:50%;top:45%;transform:translate(-50%,-50%);' +
            'padding:0 20px;color:#fff;font-size:14px;box-shadow:2px 3px 8px 1px #666;font-family:Microsoft YaHei"><i class="am-icon-spinner am-icon-spin"></i> ' + txt + '</div>';
        $(document.body).append(ele);
    }
})
