const loggedUser = require('../utils/loggedUser');

const router = require('express').Router();

/* GET home page */
<<<<<<< HEAD
router.get('/', (req, res) => {
	const user = req.session.user;
	res.render('', { user: loggedUser(user) });
=======
router.get('/', (req, res, next) => {
	const sessionUser = req.session.user;
	res.render('', { user: loggedUser(sessionUser) });
>>>>>>> guille
});

module.exports = router;
