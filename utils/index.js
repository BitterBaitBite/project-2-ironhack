const mongoose = require('mongoose')

module.exports = {


	hasPet: (user, pet_id) => {
		return user.pets.includes(String(pet_id));
	},

	hasRole: (user, ...roles) => {

		return roles.includes(user.role)

	},

	loggedUser: (currentUser) => {

		let user;
		const isLogged = currentUser && (user = currentUser);
		return { user, isLogged }
	},



	errorValidation: (res, err) => {

		if (err instanceof mongoose.Error.ValidationError) {
			return res.status(400).render('user/', { errorMessage: err.message });
		}

		if (err.code === 11000) {
			return res.status(400).render('user/', { errorMessage: 'The value you chose is already in use' });
		}

		return res.status(500).render('user/', { errorMessage: err.message });
	}



}