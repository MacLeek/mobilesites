/**
 * Created by happylyang on 15/3/8.
 */
(function() {
    var getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l.pathname;
    };
    $(document).ready(function() {
        $('#ifr').load(function() {
            $(".loadingBlock").hide();
        });
        $("#add_first_nav").on("click", function() {
            var ifr = $('#ifr').contents();
            var nav = ifr.find(".mainmenu");
            var navUrl = $("#navUrl").val();
            var navName = $("#navName").val();
            if ( navUrl&&navName ) {
                var numOfNavs = nav.find('li').length;
                var toAppend = '<li id="nav_1_' + numOfNavs + '"><a href="' + getLocation(navUrl) + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
                nav.append(toAppend);
                var navBlock = '<div class="form-inline"><div id="nav_1_' + numOfNavs + '" style="float: left;">一级</div><input type="text" class="form-control" value="' +
                    navName + '" name="navNameO"> ' +
                    '<input type="text" class="form-control" value="' + navUrl + '" name="navUrlO">' +
                    '<button id="add_second_nav" class="btn btn-warning btn-xs">增加</button>' +
                    '<button id="findSecondNav" navId="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">提取</button></div>';
                $("#existing_navs").append(navBlock);
                $("#navUrl").val('');
                $("#navName").val('');
            } else {
                alert('请填写完整!');
            }
        });
        $("#existing_navs").on("click", '#add_second_nav', function() {
            var toAppend = '<li><input type="text" class="form-control" value="" name="navName">' +
                '<input type="text" class="form-control" value="" name="navUrlO">' +
                '<button id="del_current_second_nav" class="btn btn-warning btn-xs">删除</button></div>' +
                '</li>';
            $(this).parent().append(toAppend);
        });
        $("#addSlider").on("click", function() {
            var imgUrl = $("#imgUrl").val();
            if (imgUrl) {
                var toAppend = '<div class="form-inline"><input data-role="none" type="text" class="form-control" value="'+imgUrl+'" name="url"></div><br>';
                $("#slider").append(toAppend);
                $("#imgUrl").val('');
            } else {
                alert('请输入图片url');
            }
        });
        $("#saveCss").on('click', function() {
            var cssPath = $("#cssPath").val();
            if (cssPath) {
                $.ajax({
                    method: "post",
                    url: "/save",
                    data: {'url': $("#siteUrl").val(), 'type': 'css', 'cssPath': cssPath}
                })
                    .done(function() {
                        alert("保存成功");
                    });
            } else {
                alert('请输入css路径!');
            }
        });
        $("#saveSlider").on("click", function() {
            var imgUrls = Array();
            $("#slider").find('input').each(function() {
                imgUrls.push($(this).val());
            });
            $.ajax({
                method: "post",
                url: "/save",
                data: {'url': $("#siteUrl").val(), 'type': 'imgs', 'imgUrl': JSON.stringify(imgUrls)}
            })
                .done(function() {
                    alert("保存成功");
                });
        });
        //抓取一级导航
        $("#findNav").on("click", function() {
            $("#currentIfr").val("ifrNav");
            var navModal = $('#navModal');
            navModal.modal({
                keyboard: false
            });
            navModal.modal('show');
        });
        //抓取一级图片slider
        $("#findSlider").on("click", function() {
            $("#currentIfr").val("ifrSlider");
            var navModal = $('#sliderModal');
            navModal.modal({
                keyboard: false
            });
            navModal.modal('show');
        });
        //抓取二级导航
        $("#existing_navs").on("click", '#findSecondNav', function() {
            $("#currentIfr").val("ifrSecondNav");
            $("#currentSecondNav").val($(this).attr('navid'));
            //将当前选中二级导航快的id传到隐藏input中
            var navModal = $('#navModal');
            navModal.modal({
                keyboard: false
            });
            navModal.modal('show');
        });
        //删除当前二级导航项
        $("#existing_navs").on("click", '#del_current_second_nav', function() {
            $(this).parent().remove()
        });
        //抓取二级页面内容
        $("#findContent").on("click", function() {
            $("#currentIfr").val("ifrContent");
            //如果输入了二级页面的内容
            var secondUrl = $("#secondUrl").val();
            if (secondUrl) {
                $('#ifrContent').empty();
                $("#ifrContent").attr('src', "/page?url=" + secondUrl);
                $('#ifrContent').load(function() {
                    var ifrContent = $('#ifrContent').contents();
                    var tmp = ifrContent.find("head");
                    $('<script>')
                        .attr('src', $("#hostIp").val() + "/static/js/inspector.js")
                        .appendTo(tmp);
                });
                //$('#ifr').attr('src', "/page?url=" + secondUrl);
                var contentModal = $('#contentModal');
                contentModal.modal({
                    keyboard: false
                });
                contentModal.modal('show');
            } else {
                alert("请输入Url!");
            }
        });
        $('#refreshContent').on('click', function(){
            $("#ifr").attr('src', "/mobile?level=2&url=" + $("#secondUrl").val());
        });
        $('#ifrNav').load(function() {
            var ifrNav = $('#ifrNav').contents();
            var tmp = ifrNav.find("head");
            $('<script>')
                .attr('src', $("#hostIp").val()+"/static/js/inspector.js")
                .appendTo(tmp);
        });
        $('#ifrSlider').load(function() {
            var ifrNav = $('#ifrSlider').contents();
            var tmp = ifrNav.find("head");
            $('<script>')
                .attr('src', $("#hostIp").val()+"/static/js/inspector.js")
                .appendTo(tmp);
        });
        $("#emptyNav").on("click", function() {
            $('#ifr').contents().find(".mainmenu").empty();
            $('#existing_navs').empty();
        });
        $("#emptySlider").on("click", function() {
            $('#ifr').contents().find("#slider").empty();
            $.ajax({
                method: "delete",
                url: "/save",
                data: {'type': 'imgs', 'url': $("#siteUrl").val()}
            })
                .done(function(msg) {
                    alert("删除成功");
                });
        });
        $("#saveNav").on("click", function() {
            var Navs = Array();
            $("#existing_navs").children().each(function(){
                var url = getLocation($(this).find("input[name='navUrlO']").val());
                var name = $(this).find("input[name='navNameO']").val();
                var secondNavs = Array();
                $(this).find("li").each(function(){
                    var url = getLocation($(this).find("input[name='navUrlO']").val());
                    var name = $(this).find("input[name='navNameO']").val();
                    secondNavs.push({
                        'name': name,
                        'url': url
                    });
                });
                Navs.push({
                    'name': name,
                    'url': url,
                    'secondNavs': secondNavs
                });
            });
            $.ajax({
                method: "post",
                url: "/save",
                data: {'navs': JSON.stringify(Navs), 'url': $("#siteUrl").val()}
            })
                .done(function(msg) {
                    alert("保存成功");
                });
        });
        $("#addNewsite").on('click', function() {
            var newSiteurl = $("#newSiteurl").val();
            if(newSiteurl) {
                window.location.href = "/index?step=1&url=" + newSiteurl;
            } else {
                alert('请输入地址!');
            }
        });
        $(".enableSite").each(function() {
            $(this).on('click', function() {
                var id = $(this).attr('siteId');
                var that = $(this);
                $.ajax({
                    method: "post",
                    url: "/save",
                    data: {'type': 'status', 'id': id}
                })
                    .done(function() {
                        if(that.attr('data-title') == '启用'){
                            that.attr('class', 'btn btn-success btn-xs');
                            that.attr('data-title', '禁用');
                            that.text('已启用');
                        } else {
                            that.attr('class', 'btn btn-warning btn-xs');
                            that.attr('data-title', '启用');
                            that.text('已禁用');
                        }
                    });
            });
        });
        $("#mytable #checkall").click(function() {
            if ($("#mytable #checkall").is(':checked')) {
                $("#mytable input[type=checkbox]").each(function() {
                    $(this).prop("checked", true);
                });

            } else {
                $("#mytable input[type=checkbox]").each(function() {
                    $(this).prop("checked", false);
                });
            }
        });
        $("[data-toggle=tooltip]").tooltip();
    });
})();
