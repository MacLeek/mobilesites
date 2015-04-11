#!/usr/bin/env python
# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import urllib
from PIL import ImageFile
import json
import re
import bleach
from urlparse import urlparse
import lxml.html
from lxml.cssselect import CSSSelector
import lxml.html.clean as clean
from collections import OrderedDict

from django.http import HttpResponse, QueryDict
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

from models import NavBlock, Site, SecondModifications, Slider

__author__ = 'happylyang'

# 暂时保留了script标签
ALLOWED_TAGS = ["img", "div", "span", "p", "br", "pre", "table", "tbody", "thead", "tr", "td", "blockquote", "ul", "li",
                "ol", "b", "i", "u", "a", "input", "label", "textarea", "form", "select", "option", "strong", "iframe",
                "script", "embed", "h1", "h2"]
ALLOWED_ATTRIBUTES = {'img': ['src', 'alt', 'width', 'height'], 'a': ['href'], 'input': ['type', 'id', 'name', 'value',
                      'onclick'], 'form': ['action', 'method', 'name', 'id'], 'option': ['value'], 'select': ['name'],
                      'iframe': ['src'], '*': ['bgcolor', 'class', 'id', 'onclick'], 'script': ['language', 'type'],
                      'embed': ['src', 'pluginspage', 'type', 'quality']}


def login_view(request):
    c = {}
    return render(request, 'login.html', c)


@login_required
def logout_view(request):
    logout(request)
    return redirect('/login')


def login_action(request):
    username = request.POST.get('username', None)
    password = request.POST.get('password', None)
    if username and password:
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect('/index')
    err_msg = '用户名密码错误'
    c = {
        'error': err_msg
    }
    return render(request, 'login.html', c)


@login_required
def index(request):
    """
    项目首页
    :param request:
    :return:
    """
    url = request.GET.get("url", None)
    step = request.GET.get("step", '0')
    if not url and step != '0':
        return HttpResponse(status=404)
    if url:
        top_domain = get_top_domain(url)
        site_set = Site.objects.filter(domain_name=top_domain)
        c = {
            "SITE_URL": url,
            "HOST_IP": settings.HOST_IP
        }
    if step == '0':
        sites = Site.objects.all()
        c = {
            'sites': sites
        }
        return render(request, 'index.html', c)
    elif step == '1':
        if site_set.exists():
            nav_list = NavBlock.objects.filter(site__domain_name=top_domain, father_id=0)
            navs = OrderedDict()
            for nav in nav_list:
                second_nav_set = NavBlock.objects.filter(site__domain_name=top_domain, father_id=nav.id).exclude(father_id=0)
                navs[nav.name] = (nav.url, second_nav_set)
            c.update(navs=navs.iteritems())
        return render(request, 'first.html', c)
    elif step == '2':
        if site_set.exists():
            site = site_set[0]
            imglist = site.sliders.all()
        else:
            imglist = []
        c.update(imglist=imglist)
        return render(request, 'second.html', c)
    elif step == '3':
        if site_set.exists():
            site = site_set[0]
            css_path = site.second.css_path if site.second else ''
        else:
            css_path = ''
        c.update(css_path=css_path)
        return render(request, 'third.html', c)
    elif step == '4':
        response = render(request, 'fourth.html', c)
        response.set_cookie('domain_name', top_domain)
        return response
    return HttpResponse(status=404)


def get_top_domain(url):
    """
    获取根域名,如:baidu.com，但是 有些域名如:china.com.cn就无法正常获取到
    :param url:
    :return:
    """
    netloc = urlparse(url).netloc
    if netloc:
        res = '.'.join(netloc.split('.')[-2:])
    else:
        res = '.'.join(url.split('.')[-2:])
    return res.split(':')[0]


@login_required
@csrf_exempt
def save(request):
    """
    存储导航项,所选区域的css路径
    :param request:
    :return:
    """
    if request.method == "POST":
        kind = request.POST.get('type', 'contents')
        url = request.POST.get('url', None)
        # 如果抓取二级页面内容
        if kind == 'contents':
            navs_str = request.POST.get('navs', None)
            if navs_str:
                navs = json.loads(navs_str, 'utf-8')
                domain_name = get_top_domain(url)
                site_set = Site.objects.filter(domain_name=domain_name)
                if site_set.exists():
                    s = site_set[0]
                    s.nav_first.clear()
                else:
                    s = Site()
                s.domain_name = domain_name.strip()
                s.save()
                for nav in navs:
                    if nav['name'].strip() and nav['url'].strip():
                        n = NavBlock()
                        n.father_id = 0
                        n.name = nav['name'].strip()
                        n.url = nav['url'].strip()
                        n.save()
                        for second in nav['secondNavs']:
                            sn = NavBlock()
                            sn.father_id = n.id
                            sn.name = second['name'].strip()
                            sn.url = second['url'].strip()
                            sn.save()
                            # 添加二级nav
                            s.nav_first.add(sn)
                        # 添加一级nav
                        s.nav_first.add(n)
                return HttpResponse(status=200)
        # 如果抓取图片
        elif kind == 'imgs':
            url_str = request.POST.get('imgUrl', None)
            img_urls = json.loads(url_str, 'utf-8')
            domain_name = get_top_domain(url)
            site_set = Site.objects.filter(domain_name=domain_name)
            if site_set.exists():
                s = site_set[0]
                if s.sliders:
                    s.sliders.clear()
            else:
                s = Site()
                s.domain_name = domain_name.strip()
                s.save()
            for url in img_urls:
                if url.strip():
                    slider = Slider()
                    slider.url = url.strip()
                    slider.save()
                    s.sliders.add(slider)
            return HttpResponse(status=200)
        elif kind == 'css':
            domain_name = get_top_domain(url)
            css_path = request.POST.get('cssPath', None)
            site_set = Site.objects.filter(domain_name=domain_name)
            if site_set.exists():
                s = site_set[0]
            else:
                s = Site()
            s.domain_name = domain_name
            # 保存二级页面的主要显示区域的css
            if css_path.strip():
                if not s.second:
                    second = SecondModifications()
                    second.css_path = css_path.strip()
                    second.save()
                    s.second = second
                else:
                    second = s.second
                    second.css_path = css_path.strip()
                    second.save()
            s.save()
            return HttpResponse(status=200)
        elif kind == 'status':
            uid = request.POST.get('id', None)
            if uid:
                site_set = Site.objects.filter(id=uid)
                if site_set.exists():
                    site = site_set[0]
                    site.is_active = not site.is_active
                    site.save()
                    return HttpResponse(status=200)
    elif request.method == "DELETE":
        request_delete = QueryDict(request.body)
        kind = request_delete.get('type', 'imgs')
        url = request_delete.get('url', None)
        if kind == 'imgs':
            domain_name = get_top_domain(url)
            site_set = Site.objects.filter(domain_name=domain_name)
            if site_set.exists():
                s = site_set[0]
                s.sliders.clear()
                return HttpResponse(status=204)
            else:
                return HttpResponse(status=404)

    return HttpResponse(status=403)


def purify(html, base_url):
    """
    过滤掉多余css,修正图片一些属性,替换超链接
    :param request:
    :return:
    """
    if base_url[-1] != '/':
        base_url = "%s/" % base_url
    if not html or not base_url:
        return False
    soup = BeautifulSoup(html, "lxml")
    # 去掉style和script标签及其内容，因为bleach会保留标签内的内容
    for elem in soup.find_all(['style']):
        elem.extract()
    purified_contents = bleach.clean(str(soup), tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, strip=True)
    # 在table上添加id
    soup = BeautifulSoup(purified_contents, "lxml")
    for tab in soup.find_all('table'):
        tab['data-role'] = "table"
        tab['class'] = "ui-table ui-table-reflow"
    for ul in soup.find_all('ul'):
        ul['data-role'] = "listview"
        ul['data-inset'] = "false"
    # 修正img src地址，及调整图片宽度css
    for img in soup.find_all('img'):
        if 'http' not in img['src'][:4]:
            img['src'] = base_url + img['src']
        size = getsizes(img['src'].encode('utf-8'))
        if size[0] > 200:
            img['style'] = 'width:100%;display: block;'
    for title in soup.find_all(['h1', 'h2', 'h3', 'h4']):
        new_tag = soup.new_tag('div')
        new_tag['data-role'] = "header"
        title.wrap(new_tag)
    # 替换超链接
    for a in soup.find_all('a'):
        if 'href' in a.attrs:
            # 如果使用了绝对地址的超链接,且同域,则替换成相对路径
            o = urlparse(a['href'])
            u = urlparse(base_url)
            if get_top_domain(o.netloc) == get_top_domain(u.netloc):
                a['href'] = o.path
    return str(soup)


@login_required
def purify_html(request):
    """
    过滤掉多余css,修正图片一些属性,替换超链接
    :param request:
    :return:
    """
    html = request.GET.get('html', None)
    base_url = request.GET.get('baseUrl', None)
    css_path = request.GET.get('cssPath', None)
    # 若果domain已经在数据库了就找到，没有就新建
    domain_name = get_top_domain(base_url)
    site_set = Site.objects.filter(domain_name=domain_name)
    if site_set.exists():
        s = site_set[0]
    else:
        s = Site()
    s.domain_name = domain_name
    # 保存二级页面的主要显示区域的css
    if css_path.strip():
        if not s.second:
            second = SecondModifications()
            second.css_path = css_path.strip()
            second.save()
            s.second = second
        else:
            second = s.second
            second.css_path = css_path.strip()
            second.save()
    s.save()
    res = purify(html, base_url)
    if not res:
        return HttpResponse(status=404)
    return HttpResponse(res)


@login_required
def page(request):
    """
    获取指定网址的内容并显示
    :param request:
    :return:
    """
    url = request.GET.get("url", None)
    if url:
        r = requests.get(url)
        soup = BeautifulSoup(r.content, "lxml")
        new_tag = soup.new_tag('base', href="%s" % url)
        soup.head.insert(0, new_tag)
        return HttpResponse(str(soup))
    else:
        return HttpResponse(status=404)


@login_required
def mob_index(request):
    """
    手机模拟器现实的内容
    传入的url需要以"/"结尾
    :param request:
    :return:
    """
    url = request.GET.get("url", None)
    level = int(request.GET.get("level", 1))
    if not url:
        return HttpResponse(status=404)
    top_domain = get_top_domain(url)
    site_set = Site.objects.filter(domain_name=top_domain)
    # 如果是首页
    if level == 1:
        nav_list = []
        imglist = []
        if site_set.exists():
            s = site_set[0]
            imglist = s.sliders.all()
            nav_list = NavBlock.objects.filter(site__domain_name=get_top_domain(url), father_id=0)
        c = {
            'nav': nav_list,
            'imglist': imglist
        }
        return render(request, 'mob_index.html', c)
    # 如果是二级页面
    else:
        c = {}
        if site_set.exists():
            s = site_set[0]
            r = requests.get(url)
            # 这里有用到soup是因为网页的编码问题,用了其他的监测编码的库似乎不太好用,暂时用bs的
            soup = BeautifulSoup(r.content)
            tree = lxml.html.fromstring(str(soup))
            sel = CSSSelector(s.second.css_path)
            res = sel(tree)
            if res:
                html = lxml.html.tostring(res[0])
                base_url = 'http://www.%s' % top_domain
                contents = purify(html, base_url)
                c = {
                    "contents": contents,
                }
        return render(request, 'mob_second.html', c)


def getsizes(uri):
    """
    获取图片的宽高
    :param uri:
    :return:
    """
    # get file size *and* image size (None if not known)
    file = urllib.urlopen(uri)
    p = ImageFile.Parser()
    while 1:
        data = file.read(1024)
        if not data:
            break
        p.feed(data)
        if p.image:
            return p.image.size
    file.close()
    return None


def test(request):
    """
    访问桌面网站时使用此view
    :param request:
    :return:
    """
    url_path = request.META['PATH_INFO']
    host = request.META['HTTP_HOST']
    # 需传入点击时的element的文字内容
    title = request.GET.get('title', None)
    domain_name = request.COOKIES.get('domain_name', None)
    if domain_name:
        site_set = Site.objects.filter(domain_name=domain_name)
        if site_set.exists():
            s = site_set[0]
            # 判断访问的是不是首页
            is_index = False
            if re.match(r'^\/($|(index|home))', url_path):
                is_index = True
            if is_index:
                c = {
                    "title": title,
                    "nav": NavBlock.objects.filter(site__domain_name=domain_name, father_id=0),
                    'imglist': s.sliders.all()
                }
                return render(request, 'mob_index.html', c)
            else:
                # 如果是二级页面,则判断是否有二级导航
                base_url = 'http://www.%s' % domain_name
                second_set = NavBlock.objects.filter(url=url_path, site__id=s.id).exclude(father_id=0)
                if second_set.exists():
                    second = second_set[0]
                    second_navs = NavBlock.objects.filter(father_id=second.father_id)
                else:
                    second_navs = []
                if second_navs and 6 > len(second_navs) > 3:
                    extra_navs = xrange(6 - len(second_navs))
                else:
                    extra_navs = []
                r = requests.get(base_url+url_path)
                # 这里有用到soup是因为网页的编码问题,用了其他的监测编码的库似乎不太好用,暂时用bs的
                soup = BeautifulSoup(r.content)
                tree = lxml.html.fromstring(str(soup))
                sel = CSSSelector(s.second.css_path)
                res = sel(tree)
                c = {
                    "title": title,
                    "second_navs": second_navs,
                    "extra_navs": extra_navs
                }
                if res:
                    html = lxml.html.tostring(res[0])
                    contents = purify(html, base_url)
                    c.update(contents=contents)
                return render(request, 'mob_second.html', c)
    return HttpResponse(status=404)
