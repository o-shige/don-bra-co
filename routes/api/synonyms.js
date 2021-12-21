const express = require('express')
const router = express.Router()
const getSynonyms = require('../../lib/synonymsDictionary')

// テスト
router.get('/', function(req, res, next) {
    const keyword = req.query.keyword

    const synonyms = getSynonyms(keyword)

    res.json({ synonyms })
})

module.exports = router