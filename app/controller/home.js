'use strict';

const Controller = require('egg').Controller;
const sendToWormhole = require('stream-wormhole');
const awaitWriteStream = require('await-stream-ready').write;
const path = require('path');
const fs = require('fs');

// TODO: app.cache 缓存机制
class HomeController extends Controller {

  async index() {
    const { ctx } = this;
    let page = ctx.params.page || 1;
    let size = 10;
    const list = await ctx.service.home.list(page, size);
    const total = await ctx.service.home.count();
    if (!list.length) {
      ctx.redirect(`/`);
    }
    await ctx.render('index.html', { list, page, size, total });
  }
  async detail() {
    const { ctx } = this;
    const id = ctx.params.id;
    let detail = await ctx.service.home.find(id);
    if (detail) {
      let nextId = id - 1;
      let next = {};
      if (nextId>0) {
        let nextDetail = await ctx.service.home.find(nextId,['id','title']);
        next = { id: nextDetail.id, title: nextDetail.title };
      }
      if (detail.contentHtml) {
        detail.content = detail.contentHtml;
      }
      await ctx.render('detail.html', { detail, next });
    } else {
      ctx.status = 404;
      ctx.body = '文章不存在';
    }
  }

  async add() {
    const { ctx } = this;
    if (ctx.request.method === 'GET') {
      await ctx.render('add.html');
    } else {
      //egg-multipart 已经帮我们处理文件二进制对象
      // node.js 和 php 的上传唯一的不同就是 ，php 是转移一个 临时文件
      // node.js 和 其他语言（java c#） 一样操作文件流
      let stream = await ctx.getFileStream({ requireFile: false });;
      const fields = stream.fields;
      let id = '';
      let title = fields.title;
      let tags = fields.tags;
      let content = fields.content;
      let contentHtml = fields['md-editor-html-code'];
      let smallThumb = '';
      let publishAt = Date.now();

      if (stream.filename) {
        //新建一个文件名
        const filename = Date.now() + path
          .extname(stream.filename)
          .toLocaleLowerCase();
        //文件生成绝对路径
        //当然这里这样市不行的，因为你还要判断一下是否存在文件路径
        const target = path.join(this.config.baseDir, 'app/public/img', filename);
        //生成一个文件写入 文件流
        const writeStream = fs.createWriteStream(target);
        try {
          //异步把文件流 写入
          await awaitWriteStream(stream.pipe(writeStream));
          smallThumb = '/public/img/' + filename;
        } catch (err) {
          //如果出现错误，关闭管道
          await sendToWormhole(stream);
          throw err;
        }
      }

      // 入库
      id = await this.ctx.service.home.add({
        title,
        smallThumb,
        content,
        contentHtml,
        tags,
        publishAt
      });
      ctx.redirect(`/detail/${id}`);
    }
  }
  // 归档 按照年份整理数据
  async archives() {
    const { ctx } = this;
    let firstPublishYear = 2019;
    let nowYear = new Date().getFullYear();
    let years = {};
    for (let index = 0; index <= nowYear-firstPublishYear; index++) {
      let year = firstPublishYear+index;
      let list = await ctx.service.home.getListByYear(year);
      years[year] = list;
    }
    await ctx.render('archives.html', { years });
  }

  // 查询所有tag
  // FIXME: 添加tags表 插入tags 获取tags
  async tags() {
    const { ctx } = this;
    const allTopicTags = await ctx.service.home.allTopicTags();
    let tags = new Set();
    allTopicTags.forEach(item => {
      let tagArr = item.tags.split(',');
      tagArr.forEach(tag => {
        tags.add(tag)
      });
    });
    tags = Array.from(tags);
    await ctx.render('tags.html', { tags });
  }
  // 按照tag获取对应列表
  async tag() {
    const { ctx } = this;
    const tag = ctx.params.tag;
    let list = await ctx.service.home.tag(tag);
    await ctx.render('tag.html', { tag, list });
  }

  async about() {
    const { ctx } = this;
    // TODO: 信息从mysql获取 定期维护
    await ctx.render('about.html');
  }

  async atom() {
    const { ctx } = this;
    const list = await ctx.service.home.list(1, 10);
    const headers = {
      'Content-Type': 'text/xml',
    };
    ctx.set(headers);
    await ctx.render('atom.xml', { list });
  }
}

module.exports = HomeController;
