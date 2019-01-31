var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/sitemap', function(req, res, next) {
  res.render('sitemap', { title: '网址地图' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: '首页' });
});

module.exports = router;
