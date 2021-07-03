const loggedUser = require('../utils/loggedUser');

const router = require('express').Router();

/* GET home page */
router.get('/', (req, res, next) => {
	const user = req.session.user;
	res.render('', { user: loggedUser(user) });
});

module.exports = router;
