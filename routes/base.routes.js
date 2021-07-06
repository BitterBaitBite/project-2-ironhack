const loggedUser = require('../utils/loggedUser');

const router = require('express').Router();

/* GET home page */
router.get('/', (req, res, next) => {
	const sessionUser = req.session.user;
	res.render('', { user: loggedUser(sessionUser) });
});

module.exports = router;
