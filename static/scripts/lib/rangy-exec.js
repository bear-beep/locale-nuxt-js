﻿define(["rangy-range","rangy-style","rangy-core"],function(d,j,k){var b=navigator.userAgent.toLowerCase();var i=function(){var p=k.getSelection();return p.rangeCount?p.getRangeAt(0):null};var l=function(){if(window.getSelection){return window.getSelection()}else{if(document.selection&&document.selection.createRange&&document.selection.type!="None"){return document.selection.createRange()}}};var n=function(){var r,q;if(window.getSelection){q=getSelection();r=q.anchorNode}if(!r&&document.selection&&document.selection.createRange&&document.selection.type!="None"){q=document.selection;var p=q.getRangeAt?q.getRangeAt(0):q.createRange();r=p.commonAncestorContainer?p.commonAncestorContainer:p.parentElement?p.parentElement():p.item(0)}if(r){return(r.nodeName=="#text"?$(r.parentNode):$(r))}else{return false}};var o=function(q,r){var s=n();s=s?s:q;if(s&&r==false){if(s.parent().is("[style]")){s.attr("style",s.parent().attr("style"))}if(s.is("[style]")){s.find("*").attr("style",s.attr("style"))}}else{if(q&&r&&q.is("[style]")){var p=r.split(";");p=p[0].split(":");if(q.is("[style*="+p[0]+"]")){q.find("*").css(p[0],p[1])}m(q)}}};var m=function(q){if(q){var q=q[0];if(document.body.createTextRange){var p=document.body.createTextRange();p.moveToElementText(q);p.select()}else{if(window.getSelection){var r=window.getSelection();var p=document.createRange();if(q!="undefined"&&q!=null){p.selectNodeContents(q);r.removeAllRanges();r.addRange(p);if($(q).is(":empty")){$(q).append("&nbsp;");m($(q))}}}}}};var c=function(p,r){var q,s=l();if(window.getSelection){if(s.anchorNode&&s.getRangeAt){q=s.getRangeAt(0)}if(q){s.removeAllRanges();s.addRange(q)}if(!b.match(/msie/)){document.execCommand("StyleWithCSS",false,false)}document.execCommand(p,false,r)}else{if(document.selection&&document.selection.createRange&&document.selection.type!="None"){q=document.selection.createRange();q.execCommand(p,false,r)}}};var e=function(t,q,u){var p;var s=new ChangeConfirmStatus();if(!u){p=k.getSelection().getRangeAt(0)}else{p=window.specialTagRangy}j.transferStyleToSpan(null,p);var r=d.isAddStyle(p,t);d.changeSpecialStyle([t],p,r);s.single(q)};var g=function(){var p=$(".tool-btn");p.off("click").on("click",function(){var s=$("tr.table-row.active").find(".edition-target");var q=null,r=null,t=null;if(window.getSelection){q=window.getSelection()}else{if(document.selection){q=document.selection.createRange()}}if(q.type==="None"){return}r=q.getRangeAt(0);t=$(r.startContainer).parents("td.active-text>div");if(t.hasClass("edition-source")&&!t.attr("contenteditable")){return}if($(this).hasClass("bold-btn")){e("fontBold",s)}else{if($(this).hasClass("italic-btn")){e("fontItatic",s)}else{if($(this).hasClass("underline-btn")){e("fontUnder",s)}else{if($(this).hasClass("sub-btn")){e("fontSubscript",s)}else{if($(this).hasClass("sup-btn")){e("fontSupscript",s)}else{if($(this).hasClass("clear-btn")){a()}}}}}}});return false};g();var f=function(){$(document).on("keydown",function(r){var t=window.event||r;var s=$(".table-row.active").find(".edition-target");var p=null,q=null,u=null;if(window.getSelection){p=window.getSelection()}else{if(document.selection){p=document.selection.createRange()}}if(p.type==="None"){return}q=p.getRangeAt(0);u=$(q.startContainer).parents("td.active-text>div");if(u.hasClass("edition-source")&&!u.attr("contenteditable")){return}if(t.ctrlKey&&t.keyCode===_keyCode._b){t.preventDefault();e("fontBold",s);return false}else{if(t.ctrlKey&&t.keyCode===_keyCode._i){t.preventDefault();e("fontItatic",s);return false}else{if(t.ctrlKey&&t.keyCode===_keyCode._u){t.preventDefault();e("fontUnder",s);return false}else{if(t.ctrlKey&&t.keyCode===_keyCode["_-"]){t.preventDefault();e("fontSubscript",s);return false}else{if(t.ctrlKey&&t.keyCode===_keyCode["_="]){t.preventDefault();e("fontSupscript",s);return false}else{if(t.altKey&&t.keyCode===_keyCode._e){t.preventDefault();a();return false}}}}}}})};f();function a(){var B;var D,u,q,r,z,w;var A=new ChangeConfirmStatus();if(window.getSelection){D=window.getSelection()}else{if(document.selection){D=document.selection.createRange()}}if(D.type==="None"){return}if(D.type==="Caret"){var v=$("tr.table-row.active");var C=null;if(v&&v.length>0){C=v.find(".edition-target").contents().not("span.tagWrap");C.removeClass().removeAttr("style").addClass("fontText");for(var y=0;y<C.length;y++){var s=C[y];for(var p in s.dataset){delete s.dataset[p]}}B=v.find(".edition-target")}}else{u=D.getRangeAt(0);q=u.cloneContents();r=$(q).context.childNodes;z=$(u.startContainer).parents("td.active-text");w=$(u.startContainer).parents(".edition-target");B=w;if(z&&z.length>0&&$(z).parent("tr").hasClass("active")){if(r.length===0){return}else{if(r.length>0&&r.length<=1){new h(getClassSpan(u.startContainer),"",u.startOffset,u.endOffset,"").single()}else{if(r.length>1){for(var t=0;t<r.length;t++){if(t==0){new h(getClassSpan(u.startContainer),u.startOffset,r.length,"",getClassSpan(u.endContainer)).multi();continue}else{if(t==r.length-1){new h(getClassSpan(u.endContainer),u.endOffset,"",r.length,getClassSpan(u.startContainer)).multi();
break}}}}}}(w&&w.length>0)&&A.single(w)}}window.setTimeout(function(){var x=B[0];dealTranObj.tempTrans($(x))},50)}function h(q,t,p,s,r){this.span=q;this.offset=t;this.offsetS=p;this.offsetE=s;this.oSpan=r;this.single=function(){var z=this.span.text(),v=z.substring(0,this.offsetS),w=z.substring(this.offsetS,this.offsetE),A=z.substring(this.offsetE),x=this.span.clone(true),y=this.span.clone(true);this.span.text(v);x.text(w);y.text(A);this.span.after(x);x.after(y);x.removeClass().removeAttr("style").addClass("fontText");for(var u in x[0].dataset){delete x[0].dataset[u]}};this.multi=function(){var D=this.span.text(),A=D.substring(0,this.offset),v=D.substring(this.offset),z=this.span.clone(true);this.span.text(A);z.text(v);this.span.after(z);if(this.offsetS&&this.offsetS!=""){var C=this.span.next().nextUntil(this.oSpan);z.removeClass().removeAttr("style").addClass("fontText");C.removeClass().removeAttr("style").addClass("fontText");for(var y in z[0].dataset){delete z[0].dataset[y]}for(var B=0;B<C.length;B++){var u=C[B];for(var w in u.dataset){delete u.dataset[w]}}}if(this.offsetE&&this.offsetE!=""){var C=this.oSpan.next().nextUntil(this.span);this.span.removeClass().removeAttr("style").addClass("fontText");C.removeClass().removeAttr("style").addClass("fontText");for(var y in this.span[0].dataset){delete this.span[0].dataset[y]}for(var B=0;B<C.length;B++){var u=C[B];for(var w in u.dataset){delete u.dataset[w]}}}}}return{ecd:e,affectStyleAround:o,handleButton:g}});