var user = kango.storage.getItem("user");
var header = {
    name: "sociaxtjfkp",
    code: "jfUguK9l1jj"
};

var currentUrl="";
var currentQuerie = ""
var done = 0;
var idAktiveTab;
var activeTab;
var emails =[];
var urls =[];
var queries =[];
var ping = 0;

var imagesOff = false;

var start = false;
var delay;
var dublicate;
var keywords = [];
var patterns = [];

chrome.contentSettings.images.clear({scope:"regular"});
chrome.contentSettings.images.clear({scope:"incognito_session_only"});

var active = (kango.storage.getItem("active"))?kango.storage.getItem("active"):false;



if (!kango.storage.setItem("rememberLogin")) {
    kango.storage.setItem("rememberLogin", false);
}
if (user) {
    $.ajax({
        url: "http://cracks.ga/authenticate.php",
        type: "POST",
        data: {
            username: user.username,
            password: user.password
        },
        headers: {
            "Authorization": "Basic " + btoa(header.name + ":" + header.code)
        },
        success: function (data) {
            if (data != "VALID|PAID") {
                kango.storage.setItem("active", false);
            }
        },
        error: function(){
            kango.storage.setItem("active", false);
        }
    });
}else{
    kango.storage.setItem("active", false);
}
var getContent = function(url, callback) {
    var details = {
        url: url,
        method: 'GET',
        async: true,
        contentType: 'text'
    };
    urllist = [];
    kango.xhr.send(details, function(data) {
        callback(data.response);
    });
};

function getTab(callback) {
    kango.browser.tabs.getAll(function(tabs) {
        for(var i = 0; i < tabs.length; i++){
            if (tabs[i].getId()==idAktiveTab) {
                callback(tabs[i]);
                return;
            }
        }
    });
}


function isStarted(callback){
    callback(start);
    ping = 1;
}

function offImages(){
    getTab(function(t){
        chrome.contentSettings.images.set({
            'primaryPattern': "https://*.facebook.com/*",
            'setting': 'block',
            'scope': (t.isPrivate())?'incognito_session_only':'regular'// (t.isPrivate())?'incognito_persistent':
        });
    });
}




function onlyOn(arr){
    var result = [];
    for(var i=0;i<arr.length;i++){
        if (arr[i].val) result.push(arr[i].name);
    }
    return result;
}

function stop(){
    chrome.contentSettings.images.clear({scope:"regular"});
    chrome.contentSettings.images.clear({scope:"incognito_session_only"});
    start = false;
    getTab(function(tab){
        tab.dispatchMessage('stop');
        kango.dispatchMessage('respoceStop');
    });
}

kango.addMessageListener('stop', function(){
    stop();
});
kango.addMessageListener('formData',function(){
    kango.dispatchMessage('progress',{
        nowrun: currentQuerie,
        colected: emails.length,
        progress: done+"/"+urls.length,
        start: start
    });
});


function procesing(){
    if (done == urls.length)
    {
        stop()
        return;
    }
    currentUrl = urls[done];
    currentQuerie = queries[done];
    done++;
    ping = 0;
    kango.dispatchMessage('progress',{
        nowrun: currentQuerie,
        colected: emails.length,
        progress: done+"/"+urls.length,
        start: start
    });

    getTab(function(tab){
        kango.browser.addEventListener(kango.browser.event.DOCUMENT_COMPLETE,  documentComplite);
        tab.navigate(currentUrl);
    });

}

function documentComplite(event)
{
    getTab(function (tab) {
        if (event.target.getId() ==idAktiveTab){
            kango.browser.removeEventListener(kango.browser.event.DOCUMENT_COMPLETE, documentComplite);
            if (ping>0) {
                tab.dispatchMessage('collectEmails');
            }
            else setTimeout(documentComplite,500);
        }
    })
}



kango.addMessageListener('pageDone', function(event){
    setTimeout(procesing, delay*1000);
});

kango.addMessageListener('foundEmail', function(event) {
        emails.push(event.data.email.toLowerCase());
    kango.dispatchMessage('progress',{
        nowrun: currentQuerie,
        colected: emails.length,
        progress: done+"/"+urls.length,
        start: start
    });
});



kango.addMessageListener('generateLinks', function(event){
    urls = [];
    emails = [];
    queries = [];
    var startUrl = "https://www.facebook.com/search/str/";
    imagesOff = event.data.images;
    delay = event.data.delay;
    dublicate = event.data.dublicate;
    keywords = event.data.keywords.split("\n");
    patterns = event.data.emails.split("\n");
    var arrTime = onlyOn(JSON.parse(kango.storage.getItem('time')));
    var arrTypes = onlyOn(JSON.parse(kango.storage.getItem('types')));
    kango.browser.tabs.getCurrent(function(tab){
        idAktiveTab = tab.getId()
        if (imagesOff) offImages();
    });
    start = true;
    var end = false;
    var i_k= 0, i_p = 0, i_ti=0, i_ty=0;
    while(!end){
        var keyws = keywords[i_k].split(',');
        var url= startUrl+'"'+patterns[i_p]+'"';
        var keyset = "";
        for(var i=0; i<keyws.length; i++){
            keyset += '+'+encodeURIComponent(keyws[i]);
        }
        url += keyset+"/stories-keyword/";
        if (arrTypes[i_ty] !='post' ) {
            url += arrTypes[i_ty]+"/stories/";
        }
        url +=arrTime[i_ti]+"/date/stories/intersect";
        urls.push(url);
        queries.push(patterns[i_p]+ " /"+keywords[i_k]+"/ "+arrTypes[i_ty]+ "/ "+arrTime[i_ti] )
        i_ti++;
        if(i_ti>arrTime.length-1) {i_ti = 0;
            i_ty++;
            if (i_ty > arrTypes.length - 1) {i_ty = 0;
                i_k++;
                if (i_k > keywords.length - 1) {i_k = 0;
                    i_p++;
                    if (i_p > patterns.length - 1) {
                        end = true;
                    }
                }
            }
        }
    }
    kango.dispatchMessage('progress',{
        nowrun: "-",
        colected: 0,
        progress: "0/"+urls.length
    });
    currentQuerie="";
    currentUrl="";
    done = 0;
    setTimeout(procesing, 300);


});

kango.addMessageListener('getEmailsToDownload', function(event){
    event.source.dispatchMessage('resiveEmailsToDownload', {emails: emails});
});
kango.addMessageListener('downloadEmails', function(event){
    if(event.data.url && event.data.name){
        chrome.downloads.download({
            url: event.data.url,
            filename: event.data.name,
            saveAs: false
        });
    }
});