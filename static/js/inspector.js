/**
 * Simple JavaScript DOM Inspector v0.1.2
 *
 */
//获取当前使用的iframe document
var currentIfr = document.getElementById("currentIfr").value;
var ifrdocument = document.getElementById(currentIfr).contentDocument;
(function(document) {
    var last;

    /**
     * Get full CSS path of any element
     *
     */

    function fullPath(el) {
        var names = [];
        while (el.parentNode) {
            if (el.id) {
                names.unshift('#' + el.id);
                break;
            } else {
                if (el == el.ownerDocument.documentElement) names.unshift(el.tagName.toLowerCase());
                else {
                    for (var c = 1, e = el; e.previousElementSibling; e = e.previousElementSibling, c++);
                    names.unshift(el.tagName.toLowerCase() + ":nth-child(" + c + ")");
                }
                el = el.parentNode;
            }
        }
        return names.join(" > ");
    }


    /**
     * MouseOver action for all elements on the page:
     */
    function inspectorMouseOver(e) {
        // NB: this doesn't work in IE (needs fix):
        var element = e.target;

        // Set outline:
        element.style.outline = '#00ff00 dotted thick';

        // Set last selected element so it can be 'deselected' on cancel.
        last = element;
    }

    /**
     * MouseOut event action for all elements
     */
    function inspectorMouseOut(e) {
        // Remove outline from element:
        e.target.style.outline = '';
    }
    function getLocation(href) {
        var l = document.createElement("a");
        l.href = href;
        if (l.pathname == '/') {
            return href;
        } else {
            return href.replace(l.pathname, '') + '/';
        }
    }
    /**
     * Click action for hovered element
     */
    function inspectorOnClick(e) {
        e.preventDefault();
        var ifr = $('#ifr').contents();
        //TODO:首先判断哪种操作：抓取导航(二级导航)，抓取logo，抓取二级页面content
        //如果是抓取一级导航
        var currentIfr = $("#currentIfr").val();
        if ( currentIfr == "ifrNav" ) {
            var nav = ifr.find(".mainmenu");
            //nav.empty();
            var target = $(e.target);
            if (target.is("a")) {
                var navUrl = target[0].pathname;
                var navName = target.text();
                if (navUrl && navName) {
                    var toAppend = '<li><a href="' + navUrl + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
                    nav.append(toAppend);
                    var numOfNavs = nav.find('li').length;
                    var navBlock = '<div class="form-inline"><div style="float: left;">一级</div><input type="text" class="form-control" value="' +
                        navName + '" name="navNameO"> ' +
                        '<input type="text" class="form-control" value="' + navUrl + '" name="navUrlO">' +
                        ' <button id="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">确定修改</button>' +
                        '<button id="add_second_nav" class="btn btn-warning btn-xs">增加</button>' +
                        '<button id="findSecondNav" navId="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">提取</button></div>';
                    $("#existing_navs").append(navBlock);
                }
            } else {
                var toExtract = target.find("a");
                if (toExtract.length > 0) {
                    toExtract.each(function() {
                        var navUrl = $(this).attr("href");
                        var navName = $(this).text();
                        if (navUrl && navName) {
                            var toAppend = '<li><a href="' + navUrl + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
                            nav.append(toAppend);
                            var numOfNavs = nav.find('li').length;
                            var navBlock = '<div class="form-inline"><div style="float: left;">一级</div><input type="text" class="form-control" value="' +
                                navName + '" name="navNameO"> ' +
                                '<input type="text" class="form-control" value="' + navUrl + '" name="navUrlO">' +
                                ' <button id="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">确定修改</button>' +
                                '<button id="add_second_nav" class="btn btn-warning btn-xs">增加</button>' +
                                '<button id="findSecondNav" navId="nav_1_' + numOfNavs + '" class="btn btn-warning btn-xs">提取</button></div>';
                            $("#existing_navs").append(navBlock);
                        }
                    });
                } else {
                    //找不到a标签
                    alert("无法获取导航项!");
                }
            }
        //如果抓取二级页面content
        } else if ( currentIfr == "ifrContent" ) {
            var path = fullPath(e.target);
            var ifr = $('#ifr').contents();
            $.ajax({
                method: "GET",
                url: "/purify",
                data: {html: $(e.target)[0].outerHTML, cssPath: path, baseUrl:getLocation($("#siteUrl").val())}
            })
                .done(function(msg) {
                    var secondContent = ifr.find("#secondContent");
                    secondContent.append(msg);
                    secondContent.enhanceWithin();
                });
        //如果抓取二级导航项
        } else if ( currentIfr == "ifrSecondNav" ) {
            //var path = fullPath(e.target);
            var ifr = $('#ifr').contents();
            var target = $(e.target);
            var currentSecondNav = $("#currentSecondNav").val();
            var pos = $("#nav_1_"+currentSecondNav).parent();
            if (target.is("a")) {
                var navUrl = target[0].pathname;
                var navName = target.text();
                if (navUrl && navName) {
                    var toAppend = '<li><input type="text" class="form-control" value="'+navName+'" name="navNameO">' +
                        '<input type="text" class="form-control" value="'+navUrl+'" name="navUrlO">' +
                        '<button id="del_current_second_nav" class="btn btn-warning btn-xs">删除</button></div>' +
                        '</li>';
                    pos.append(toAppend);
                }
            } else {
                var target = $(e.target);
                var toExtract = target.find("a");
                if (toExtract.length > 0) {
                    toExtract.each(function() {
                        var navUrl = $(this).attr("href");
                        var navName = $(this).text();
                        if (navUrl && navName) {
                            var toAppend = '<li><input type="text" class="form-control" value="' + navName + '" name="navNameO">' +
                                '<input type="text" class="form-control" value="' + navUrl + '" name="navUrlO">' +
                                '<button id="del_current_second_nav" class="btn btn-warning btn-xs">删除</button></div>' +
                                '</li>';
                            pos.append(toAppend);
                        }
                    });
                } else {
                    //找不到a标签
                    alert("无法获取导航项!");
                }
            }
        //如果抓取一级导航slider图片
        } else if ( currentIfr == "ifrSlider" ) {
            var path = fullPath(e.target);
            var target = $(e.target);
            var ifr = $('#ifr').contents();
            var imgUrl;
            if (target.is('img')){
                var imgPos = ifr.find("#slider");
                imgUrl = target.attr('src');
                imgPos.append('<div><img src="'+ imgUrl +'"></div>');
                //ifr.find("#slider").excoloSlider({
                //    autoPlay: true,
                //    interval: 5000,
                //    autoSize: true,
                //    repeat: true,
                //    width: 640,
                //    height: 452,
                //    mouseNav: false,
                //    prevnextNav: false
                //});
            } else {
                var imgs = target.find('img');
                if (imgs.length > 0) {
                    imgs.each(function() {
                        var imgPos = ifr.find("#slider");
                        imgUrl = $(this).attr('src');
                        imgPos.append('<div><img src="'+ imgUrl +'"></div>');
                        //ifr.excoloSlider({
                        //    autoPlay: true,
                        //    interval: 5000,
                        //    autoSize: true,
                        //    repeat: true,
                        //    width: 640,
                        //    height: 452,
                        //    mouseNav: false,
                        //    prevnextNav: false
                        //});
                    });
                }
            }
            $.ajax({
                method: "post",
                url: "/save",
                data: {'url': $("#siteUrl").val(), 'type': 'imgs', 'imgUrl': imgUrl}
            })
                .done(function() {
                    alert("保存成功");
                });
        }
        //
        //// These are the default actions (the XPath code might be a bit janky)
        //// Really, these could do anything:
        //var path = cssPath(e.target);
        //console.log(path);
        ////找到手机内页的iframe并清空现有导航
        //var ifr = $('#ifr').contents();
        //var nav = ifr.find(".mainmenu");
        //nav.empty();
        //$(document).find(path).find("a").each(function() {
        //    console.log($(this).text());
        //    var navUrl = $(this).attr("href");
        //    var navName = $(this).text();
        //    var toAppend = '<li><a href="' + navUrl + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
        //    nav.append(toAppend);
        //});
        ////var navUrl = $("#navUrl").val();
        ////var navName = $("#navName").val();
        ////var toAppend = '<li><a href="' + navUrl + '"><em></em><p><span>' + navName + '</span></p><b></b></a></li>';
        ////nav.append(toAppend);
        ///* console.log( getXPath(e.target).join('/') ); */

        return false;
    }

    /**
     * Function to cancel inspector:
     */
    function inspectorCancel(e) {
        // Unbind inspector mouse and click events:
        if (e === null && event.keyCode === 27) { // IE (won't work yet):
            document.detachEvent("mouseover", inspectorMouseOver);
            document.detachEvent("mouseout", inspectorMouseOut);
            document.detachEvent("click", inspectorOnClick);
            //document.detachEvent("keydown", inspectorCancel);
            last.style.outlineStyle = 'none';
        } else if (e.which === 27) { // Better browsers:
            document.removeEventListener("mouseover", inspectorMouseOver, true);
            document.removeEventListener("mouseout", inspectorMouseOut, true);
            document.removeEventListener("click", inspectorOnClick, true);
            //document.removeEventListener("keydown", inspectorCancel, true);

            // Remove outline on last-selected element:
            last.style.outline = 'none';
        } else if (e.which === 65 || (e === null && event.keyCode === 65)) {
            if (document.addEventListener) {
                document.addEventListener("mouseover", inspectorMouseOver, true);
                document.addEventListener("mouseout", inspectorMouseOut, true);
                document.addEventListener("click", inspectorOnClick, true);
                //document.addEventListener("keydown", inspectorCancel, true);
            } else if (document.attachEvent) {
                document.attachEvent("mouseover", inspectorMouseOver);
                document.attachEvent("mouseout", inspectorMouseOut);
                document.attachEvent("click", inspectorOnClick);
                //document.attachEvent("keydown", inspectorCancel);
            }
        }
    }

    /**
     * Add event listeners for DOM-inspectorey actions
     */
    if (document.addEventListener) {
        document.addEventListener("keydown", inspectorCancel, true);
        document.addEventListener("mouseover", inspectorMouseOver, true);
        document.addEventListener("mouseout", inspectorMouseOut, true);
        document.addEventListener("click", inspectorOnClick, true);

    } else if (document.attachEvent) {
        document.attachEvent("keydown", inspectorCancel);
        document.attachEvent("mouseover", inspectorMouseOver);
        document.attachEvent("mouseout", inspectorMouseOut);
        document.attachEvent("click", inspectorOnClick);

    }

})(ifrdocument);