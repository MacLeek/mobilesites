#!/usr/bin/env python
# -*- coding: utf-8 -*-
import threading

from django.db import models
from django.conf import settings

__author__ = 'happylyang'


class IndexModifications(models.Model):
    """
    首页变化内容
    """
    js = models.TextField()  # 存储要执行的js代码


class SecondModifications(models.Model):
    """
    二级页变化内容
    """
    js = models.TextField(null=True)  # 存储要执行的js代码
    css_path = models.CharField(max_length=300)


class NavBlock(models.Model):
    """
    单个导航块
    """
    url = models.CharField(max_length=250)  # 导航块的超链接
    name = models.CharField(max_length=50)  # 导航快名字
    father_id = models.IntegerField()  # 上层导航快id,若干id为0表示一级导航块


class Slider(models.Model):
    url = models.CharField(max_length=250)


class Site(models.Model):
    name = models.CharField(max_length=100)  # 网站名字
    domain_name = models.CharField(max_length=50, unique=True)  # 网站域名
    is_active = models.BooleanField(default=False)  # 当前网站是否已经审查过
    index = models.ForeignKey(IndexModifications, null=True)
    second = models.ForeignKey(SecondModifications, null=True)
    nav_first = models.ManyToManyField(NavBlock)  # 多个导航快
    sliders = models.ManyToManyField(Slider)
