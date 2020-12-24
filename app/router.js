'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/p:page', controller.home.index);
  router.get('/detail/:id', controller.home.detail);
  router.get('/add', controller.home.add);
  router.get('/archives', controller.home.archives);
  router.get('/tags', controller.home.tags);
  router.get('/tag/:tag', controller.home.tag);
  router.get('/about', controller.home.about);
  router.post('/add', controller.home.add);
  router.get('/atom.xml', controller.home.atom);
};
