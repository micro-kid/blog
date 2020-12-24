const Subscription = require('egg').Subscription;
const fs = require('fs');
const path = require('path');
const markdown = require('marked');


class BringMdToMysql extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '12h', // 1 分钟间隔
            immediate: true,
            type: 'worker', // 指定所有的 worker 都需要执行
            disable: false
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        console.log('BringMdToMysql schedule worked');
        const mdDir = path.join(this.config.baseDir, 'app/public/md/');
        fs.readdir(mdDir, async (err, files) => {
            if (err) {
                return this.ctx.logger.error(new Error('mdDir ready fail'));
            }
            files.forEach(async file => {
                if (path.extname(file) === '.md') {
                    let filename = file;
                    let filepath = path.join(mdDir, filename);
                    fs.readFile(filepath, async (err, data) => {
                        if (err) {
                            return this.ctx.logger.error(new Error(filename + 'ready fail'));
                        }
                        var markdownContent = data.toString();
                        // # 标题
                        let title = markdownContent.match(/# (.+)/);
                        if (title) {
                            title = title[1];
                            markdownContent = markdownContent.replace(title[0],'');
                        }
                        // ![GitHub](https://avatars2.githubusercontent.com/u/3265208?v=3&s=100 "GitHub,Social Coding") 封面
                        let smallThumb = markdownContent.match(/!\[.+\]\((.+)\s".*"\)/);
                        if (smallThumb) {
                            smallThumb = smallThumb[1];
                            // markdownContent = markdownContent.replace(smallThumb[0],'');
                        }
                        // 标签
                        let tags = markdownContent.match(/__(.+)__/);
                        if (tags) {
                            tags = tags[1];
                            markdownContent = markdownContent.replace(tags[0],'');
                        }
                        // 发布时间
                        let publishAt = filename.split('.')[0];
                        let content = markdown(markdownContent)
                        const res = await this.ctx.service.home.add({
                            title,
                            smallThumb,
                            content,
                            tags,
                            publishAt
                        });
                        if (res) {
                            this.ctx.logger.info(filename + 'insert success');
                            fs.unlink(filepath, async (err) => {
                                if (err) {
                                    this.ctx.logger.error(new Error(filename + 'unlink fail'));
                                }
                                this.ctx.logger.info(filename + 'unlink success');
                            });
                        } else {
                            this.ctx.logger.error(new Error(filename + 'insert fail'));
                        }
                    })
                }
            })
        })
    }
}

module.exports = BringMdToMysql;
