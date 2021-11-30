// ==UserScript==
// @all-frames false
// @run-at document-start
// @require js/libs/jquery-2.0.3.min.js
// ==/UserScript==
var collecter = {
    started: true,
    proc: false
};


var tolongtime = 20;

kango.addMessageListener('stop', function(){
    clearTimeout(collecter.proc);
    collecter.started=false;
});

function procesing(){
    if(collecter.started) window.scrollTo(0, 1000 + document.body.offsetHeight);
    var seeMore=$('a.see_more_link:not([cliked="1"])');
    for(var i=0;i<seeMore.length;i++){
        $(seeMore[i]).attr("href","#");
        seeMore[i].click();
        $(seeMore[i]).attr("cliked", 1);
    }
    if(!collecter.started){
        return;
    }
    setTimeout(function() {
        var blocs = $('._5jmm:not([momane_dd="1"])');
        if ($('._5jmm:not([momane_done="1"])').length>0) tolongtime=20;
        else tolongtime--;
        for (var i = 0; i < blocs.length; i++) {
            var text = $(blocs[i]).html();
            var re = /[a-zA-Z0-9][a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.([a-zA-Z0-9-]+\.){0,1}[a-zA-Z]{2,4}/g;
            //for(var matches = re.exec(text); matches != null; matches = re.exec(text)) {
            while((matches= re.exec(text))!=null) {
                kango.dispatchMessage('foundEmail', {email: matches[0]});
                $(blocs[i]).attr("momane_dd", 1);
            }
            $(blocs[i]).attr("momane_done", 1);
        }


        if ($("#browse_end_of_results_footer").length > 0 || $(".phm").length > 0|| tolongtime<1) {
            kango.dispatchMessage('pageDone');
            clearTimeout(collecter.proc);
        } else {
            collecter.proc = setTimeout(procesing, 500);
        }
    },200);
}

kango.addMessageListener('collectEmails', function(event){
        collecter.proc = setTimeout(procesing, 200);
});

kango.addMessageListener('stop', function(event){
    clearInterval(collecter.proc);
    collecter.proc = false;
    collecter.started = false;
});
kango.invokeAsyncCallback('isStarted', function(result) {
    collecter.started = result;
});