const mongoose = require('mongoose');

module.exports = (res, err) => {
	if (err instanceof mongoose.Error.ValidationError) {
		return res.status(400).render('user/', { errorMessage: err.message });
	}

	if (err.code === 11000) {
		return res.status(400).render('user/', { errorMessage: 'The value you chose is already in use' });
	}

	return res.status(500).render('user/', { errorMessage: err.message });
};
