const moment = require('moment');
moment.locale('zh-cn');
exports.nowTime = time => moment(new Date()).format('YYYY-MM-DD HH:MM:SS');
exports.relativeTime = time => moment(new Date(time*1)).fromNow();
exports.localTime = time => moment(new Date(time*1)).format('YYYY-MM-DD');
exports.localTimeFull = time => moment(new Date(time*1)).format('YYYY-MM-DD HH:MM:SS');