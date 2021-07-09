const router = require('express').Router();

const { errorValidation } = require('../utils');
const { MAPS_KEY } = require('../utils/consts');

router.get('/key', (req, res) => {
	try {
		res.json(MAPS_KEY);
	} catch (err) {
		errorValidation(err);
	}
});

module.exports = router;
