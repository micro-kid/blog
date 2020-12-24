var host = location.host;

var _hmt = _hmt || [];
(function () {
  var hm = document.createElement("script");
  if (host.indexOf('youranxixi.com') > 0) {
    hm.src = "https://hm.baidu.com/hm.js?c8c6630f8e68769bb92a1a04c5db4c89";
  } else if (host.indexOf('microkid.cn') > 0) {
    hm.src = "https://hm.baidu.com/hm.js?47feaa9ab93bf4b63f845a12460a633b";
  }
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
