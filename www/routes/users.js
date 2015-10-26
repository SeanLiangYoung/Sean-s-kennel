var express = require('express');
var router = express.Router();

//middleware specific to this router, console a date as a log here.
router.use(function timeLog(req, res, next){
	console.log("Time : ", Date.now());
	next();
})
/* GET users listing. */
router.get('/', function(req, res, next) {
	res.render('/users/index', { 
		title: '用户登陆',
		name: req.param.name 
	});
});

router.get('/login', function(req, res, next) {
	res.render('/users/login', {
		title: '用户登陆',
		name: req.param.name
	});
});

module.exports = router;
