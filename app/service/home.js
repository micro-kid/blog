const Service = require('egg').Service;
/**
 * 文章服务
 */
// https://eggjs.org/zh-cn/tutorials/mysql.html
// query 完整sql语句 不建议sql拼接  如果必要请使用 mysql.escape
// 封装的方法
// insert
// delete
// update
// select
// get
// 表达式
// literals
class HomeService extends Service {
    async count() {
        const { app } = this;
        let res = await app.mysql.count('b_topic');
        return res;
    }
    async list(page = 1, size = 10) {
        const { app } = this;
        // SELECT * FROM b_topic LIMIT ?,?
        let res = await app.mysql.select('b_topic', {
            limit: size,
            offset: (page - 1) * size,
            orders: [['publishAt', 'desc']]
        });
        return res;
    }
    async allTopicTags() {
        const { app } = this;
        let res = await app.mysql.select('b_topic', {
            columns: ['tags']
        });
        return res;
    }
    async tag(tag) {
        const { app } = this;
        /* let res = await app.mysql.select('b_topic', {
            where: { tags: tag },
            columns: ['id', 'title', 'smallThumb', 'tags', 'publishAt'],
            orders: [['publishAt', 'desc']]
        }); */
        let res = await app.mysql.query(`
            SELECT id,title,smallThumb,tags,publishAt FROM b_topic WHERE tags LIKE '%${tag}%' ORDER BY publishAt DESC;
        `)
        return res;
    }
    async find(id = 0, columns = null) {
        const { app } = this;
        let params = {
            where: { id }
        }
        if (columns) {
            params.columns = columns;
        }
        let res = await app.mysql.select('b_topic', params);
        if (res.length) {
            res = res[0];
        }
        return res;
    }
    async add(data) {
        const { app } = this;
        let res = await app.mysql.insert('b_topic', data);
        return res.insertId;
    }
    async getListByYear(year){
        const { app } = this;
        let timestampStart = new Date(`${year}-01-01`).getTime();
        let timestampEnd = new Date(`${year}-12-31`).getTime();
        let res = await app.mysql.query(`
            SELECT id,title,publishAt FROM b_topic WHERE publishAt BETWEEN ${timestampStart} AND ${timestampEnd};
        `)
        return res;
    }

}

module.exports = HomeService;