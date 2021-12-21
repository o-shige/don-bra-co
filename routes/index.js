var express = require('express');
var router = express.Router();

// 初期表示の作成
router.get('/', function(req, res, next) {
    res.render('index');
});

module.exports = router;