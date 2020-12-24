'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  // https://mozilla.github.io/nunjucks/templating.html
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks'
  },
  mysql: {
    enable: true,
    package: 'egg-mysql',
  }
};