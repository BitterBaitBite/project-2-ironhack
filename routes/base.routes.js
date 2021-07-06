const loggedUser = require('../utils/loggedUser');

const router = require('express').Router();

/* GET home page */
router.get('/', (req, res) => {
	res.render('', { user: req.session.user });
});

module.exports = router;
