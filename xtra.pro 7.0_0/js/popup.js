KangoAPI.onReady(function () {
    //var started = false;
    //var count = [];
    //var current_tab_id;
    var scServer = "http://cracks.ga/authenticate.php";
    var header = {
        name: "sociaxtjfkp",
        code: "jfUguK9l1jj"
    };
    var user = kango.storage.getItem("user");
    if (user) {
        $.ajax({
            url: scServer,
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
                    $("#notActive").show();
                }
            },
            error: function () {
                kango.storage.setItem("active", false);
                $("#notActive").show();
            }
        });
    } else {
        kango.storage.setItem("active", false);
        $("#notActive").show();
    }
    if (!kango.storage.getItem("active")) {
        $("#notActive").show();
    }


    kango.dispatchMessage('formData');
    kango.addMessageListener('respoceStop',function(event){
        $('#start').show();
        $('#stop').hide();
        $('#stop').removeClass('pure-button-disabled');
    });

    kango.addMessageListener('progress', function (event) {
        $('#nowrun').text(event.data.nowrun);
        $('#colected').text(event.data.colected);
        $('#progress').text(event.data.progress);
        if(event.data.start){
            $('#stop').show();
            $('#start').hide();
        }
    });



   document.getElementById('download').onclick = function(){
        kango.dispatchMessage('getEmailsToDownload');
    };

    kango.addMessageListener('resiveEmailsToDownload', function(event){
        var mime_type = "";
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();
        var data = curr_year + "-" + curr_month + "-" + curr_date;

        var filename = 'emailList-'+data+".txt";
        if (filename.trim() == "") filename="list";
            mime_type = 'text/plain';
            var emails = event.data.emails.slice();
            if ($("#dublicate").prop("checked")) emails = emails.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
            if(!kango.storage.getItem('active')) emails.splice(40);
            var txt = emails.join("\r\n");
        var File = new Blob([txt], {type: mime_type})
        var url = URL.createObjectURL(File);
        kango.dispatchMessage('downloadEmails', {url: url, name: filename});
    });

   function validate(){
        var OK = true;
        var eRe = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
        var emailarr = $("#emails").val().split('\n');
        emailarr = emailarr.filter(function(item, i, ar){ return item.trim()!==""});
        var keywords = $("#keywords").val().split('\n');
        keywords = keywords.filter(function(item, i, ar){ return item.trim()!==""});
        $("#keywords").val(keywords.join("\n"));
        for(var i=0;i<emailarr.length;i++ ){
            emailarr[i]=emailarr[i].trim();
            var tmp = eRe.exec(emailarr[i]);
            if (tmp===null || tmp[0]!==emailarr[i]) OK = OK && false;
        }
        $("#emails").val(emailarr.join('\n'));
        if (!OK) alert('Wrong: @ Pattern');
        return OK;
    }
    $(document).ready(function () {

        var keys = kango.storage.getKeys();
        if(keys.indexOf("downloadName") == -1){
            kango.storage.setItem("downloadName", true);
        }

        function saveGroup(grop, name){
            var types = $('[name="'+grop+'[]"]');
            var arr = [];
            var all = true;
            for(var i =0; i<types.length; i++)
            {
                arr.push({ name:types[i].id, val: $(types[i]).prop("checked")});
                all = all && $(types[i]).prop("checked");
            }
            $('#'+grop).prop("checked",all);
            kango.storage.setItem(name, JSON.stringify(arr));
        }

        function loadGroup(grop, name){
            var arr = JSON.parse(kango.storage.getItem(name));
            var all = true;
            if (arr !== null) for(var i =0; i<arr.length; i++)
            {
                $('#'+arr[i].name).prop("checked",arr[i].val);
                all = all && arr[i].val;
            }
            if ($('[name="'+grop+'[]"]:not(:checked)').length>0) all = false;
            $('#'+grop).prop("checked",all);
        }
        $('#stop').click(function(){
            $('#stop').addClass('pure-button-disabled');
            kango.dispatchMessage('stop');
        });
        $('#start').click(function(){
            if(validate()) {
                saveGroup('tg', 'types');
                saveGroup('dg', 'time');
                $('#start').hide();
                $('#stop').show();

                kango.dispatchMessage('generateLinks', {
                    images: $("#image").prop("checked"),
                    delay: $("#delay").val(),
                    dublicate: $("#dublicate").prop("checked"),
                    keywords: $("#keywords").val(),
                    emails: $("#emails").val()
                });
            }

        });


        loadGroup('tg','types');
        loadGroup('dg', 'time');
        if(kango.storage.getItem("delay")!==null) $("#delay").val(kango.storage.getItem("delay"));
        if(kango.storage.getItem("keywords")!==null) $("#keywords").val(kango.storage.getItem("keywords"));
        if(kango.storage.getItem("emails")!==null) $("#emails").val(kango.storage.getItem("emails"));
        if(kango.storage.getItem("image")!==null) $("#image").prop("checked",kango.storage.getItem("image"));
        if(kango.storage.getItem("dublicate")!==null) $("#dublicate").prop("checked",kango.storage.getItem("dublicate"));


        $('#tg').click(function () {
            if($(this).is(":checked")){
                $('[name="tg[]"]').prop("checked", true);}
            else {
                $('[name="tg[]"]').prop("checked", false);}
            saveGroup('tg', 'types');
        });

        $('#dg').click(function () {
            if($(this).is(":checked")){
                $('[name="dg[]"]').prop("checked", true);}
            else {
                $('[name="dg[]"]').prop("checked", false);}
            saveGroup('dg', 'time');
        });

        $('[name="tg[]"]').click(function () {
            saveGroup('tg', 'types');
        });
        $('[name="dg[]"]').click(function () {
            saveGroup('dg', 'time');
        });

        $("#dublicate").click(function () {
            if($(this).is(":checked")){
                kango.storage.setItem("dublicate",true );}
            else {
                kango.storage.setItem("dublicate",false );
            }

        });
        $("#image").click(function () {
            if($(this).is(":checked")){
                kango.storage.setItem("image",true );}
            else {
                kango.storage.setItem("image",false );
            }

        });

        $("#delay").change(function () {
            kango.storage.setItem("delay",$("#delay").val() );
        });
        $("#emails").change(function () {
            kango.storage.setItem("emails",$("#emails").val() );
        });
        $("#keywords").change(function () {
            kango.storage.setItem("keywords",$("#keywords").val() );
        });

        $('input[name="logType"]').change(function () {
            kango.storage.setItem("logType",$('input[name="logType"]:checked').val() );
        });

        $("#login").click(function () {
            $(".scodeArea").fadeIn();
            $(".head-container").css('-webkit-filter', 'blur(3px)');
        });

        $("#active").click(function () {
            var that = $(this);
            that.text("Activating...");
            var username = $("#userName").val().trim(),
                password = $("#password").val().trim(),
                remember = $("#remember").is(":checked");

            if (username && password) {
                $.ajax({
                    url: scServer,
                    type: "POST",
                    data: {
                        username: username,
                        password: password
                    },
                    headers: {
                        "Authorization": "Basic " + btoa(header.name + ":" + header.code)
                    },
                    success :function(data){
                        if(data == "VALID|PAID"){
                            kango.storage.setItem("active", true);
                            if(remember){
                                kango.storage.setItem("rememberLogin", true);
                                kango.storage.setItem("user", {username :username, password: password });
                            }
                            var activeSuccess = $("<div/>", {
                                "style": "cursor : pointer;" +
                                "font-weight: bold;"
                            }).html("<p></p><p style='text-align: center'>" +
                            "Thank you, active success, click to close this message</p><p></p>")
                                .click(function () {
                                    $(".scodeArea").fadeOut();
                                    $(".head-container").css('-webkit-filter', '');
                                    $(".settings").css('-webkit-filter', '');
                                    $("#notActive").remove();
                                    $("input").removeAttr("disabled");
                                    $("textarea").removeAttr("disabled");
                                });
                            $(".scodeArea").html(activeSuccess);
                        } else if(data == "VALID|FREE" || data=="INVALID"){
                            var activeSuccess = $("<div/>", {
                                "style": "cursor : pointer;" +
                                "font-weight: bold;"
                            }).html("<p></p><p style='text-align: center'>" +
                            "Thanks for trying, click to close this message</p><p></p>")
                                .click(function () {
                                    $(".scodeArea").fadeOut();
                                    $(".head-container").css('-webkit-filter', '');
                                    $(".settings").css('-webkit-filter', '');
                                    $("input").removeAttr("disabled");
                                    $("textarea").removeAttr("disabled");
                                });
                            $(".scodeArea").html(activeSuccess);
                        }else{
                            alert("Activation error. please contact us");
                            that.text("Active");
                        }

                    }, error :function(){
                        alert("Can not connect to the server, please try again.");
                        that.text("Active");
                    }
                });
            } else {
                alert("Please input your user name and password");
                that.text("Active");
            }
        });
        $("#cancel").click(function () {
            $(".scodeArea").fadeOut();
            $(".head-container").css('-webkit-filter', '');
            $(".settings").css('-webkit-filter', '');

        });
    });
});

function da() {
    kango.storage.setItem("active", false);
}
