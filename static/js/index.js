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
            //var ifr = $(this).contents();
            //var nav = ifr.find(".mainmenu");
            ////获取iframe中原先系统自动获取的nav，并复制到主页
            //var originNavElems = nav.children().clone();
            //var originNavs = Array();
            //originNavElems.each(function() {
            //    originNavs.push({
            //        'name': $(this).text().replace(/\s/g, ''),
            //        'url': $(this).find('a').attr('href'),
            //        'id': $(this).attr('id')
            //    });
            //});
        });
        $("#add_first_nav").on("click", function() {
            var ifr = $('#ifr').contents();
            var nav = ifr.find(".mainmenu");
            var navUrl = $("#navUrl").val();
            var navName = $("#navName").val();
            var numOfNavs = nav.find('li').length;
            var toAppend = '<li id="nav_1_'+numOfNavs+'"><a href="' + getLocation(navUrl) + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
            nav.append(toAppend);
            var navBlock = '<div class="form-inline"><div style="float: left;">一级</div><input type="text" class="form-control" value="' +
                navName + '" name="navNameO"> ' +
                '<input type="text" class="form-control" value="' + navUrl + '" name="navUrlO">' +
                ' <button id="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">确定修改</button>' +
                    '<button id="add_second_nav" class="btn btn-warning btn-xs">增加</button>'+
                '<button id="findSecondNav" navId="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">提取</button></div>';
            $("#existing_navs").append(navBlock);
        });
        $("#existing_navs").on("click", '#add_second_nav', function() {
            var toAppend = '<li><input type="text" class="form-control" value="" name="navName">' +
                '<input type="text" class="form-control" value="" name="navUrlO">' +
                '<button id="del_current_second_nav" class="btn btn-warning btn-xs">删除</button></div>' +
                '</li>';
            $(this).parent().append(toAppend);
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
            var navModal = $('#navModal');
            navModal.modal({
                keyboard: false
            });
            navModal.modal('show');
        });
        //抓取二级导航
        $("#existing_navs").on("click", '#findSecondNav', function() {
            $("#currentIfr").val("ifrSecondNav");
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
                $('#ifrContent').attr('src', "/page?url=" + secondUrl);
                //$('#ifrContent').load(function() {
                //    var ifrContent = $('#ifrContent').contents();
                //    var tmp = ifrContent.find("head");
                //    $('<script>')
                //        .attr('src', "http://127.0.0.1:8000/static/js/inspector.js")
                //        .appendTo(tmp);
                //});
                var contentModal = $('#contentModal');
                contentModal.modal({
                    keyboard: false
                });
                contentModal.modal('show');
            } else {
                alert("请输入Url!");
            }
        });
        $('#ifrContent').load(function() {
            var ifrContent = $('#ifrContent').contents();
            var tmp = ifrContent.find("head");
            $('<script>')
                .attr('src', "http://127.0.0.1:8000/static/js/inspector.js")
                .appendTo(tmp);
        });
        $('#ifrNav').load(function() {
            var ifrNav = $('#ifrNav').contents();
            var tmp = ifrNav.find("head");
            $('<script>')
                .attr('src', "http://127.0.0.1:8000/static/js/inspector.js")
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

            //var ifr = $('#ifr').contents();
            //var nav = ifr.find(".mainmenu");
            //var originNavElems = nav.children().clone();

            //originNavElems.each(function() {
            //    originNavs.push({
            //        'name': $(this).text().replace(/\s/g, ''),
            //        'url': $(this).find('a')[0].pathname  //获取url的path部分
            //    });
            //});
            $.ajax({
                method: "post",
                url: "/save",
                data: {'navs': JSON.stringify(Navs), 'url': $("#siteUrl").val()}
            })
                .done(function(msg) {
                    alert("保存成功");
                });
        });
        $("#first").on("click", function() {
            $('#ifr').attr('src', "/mobile?url=" + $("#siteUrl").val());
        });
        $("#second").on("click", function() {
            $('#ifr').attr('src', "/mobile?level=2&url=" + $("#siteUrl").val());
        });
    });
})();
