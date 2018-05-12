var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// POST method route
router.post('/', function (req, res) {
    console.log(req);
    res.send('This is post function!');
});

module.exports = router;