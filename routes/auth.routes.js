const router = require('express').Router();

// Handles password encryption
const bcrypt = require('bcryptjs');

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

const User = require('../models/User.model');

const { isLoggedOut, isLoggedIn } = require('../middleware/');
const { errorValidation } = require('../utils/');

router.get('/signup', isLoggedOut, (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}
	res.render('auth/signup');
});

router.post('/signup', isLoggedOut, (req, res) => {
	const { username, password } = req.body;

	if (!username) {
		return res.status(400).render('auth/signup', { errorMessage: 'Please provide your username.' });
	}

	// if (password.length < 8) {
	// 	return res.status(400).render('auth/signup', {
	// 		errorMessage: 'Your password needs to be at least 8 characters long.',
	// 	});
	// }

	//   ! This use case is using a regular expression to control for special characters and min length

	//   const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

	//   if (!regex.test(password)) {
	//     return res.status(400).render("signup", {
	//       errorMessage:
	//         "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
	//     });
	//   }

	User.findOne({ username }).then((found) => {
		// If the user is found, send the message username is taken
		if (found) {
			return res.status(400).render('auth/signup', { errorMessage: 'Username already taken.' });
		}

		// if user is not found, create a new user - start with hashing the password
		return bcrypt
			.genSalt(saltRounds)
			.then((salt) => bcrypt.hash(password, salt))
			.then((hashedPassword) => {
				// Create a user and save it in the database
				return User.create({
					username,
					password: hashedPassword,
				});
			})
			.then((user) => {
				// Bind the user to the session object
				req.session.user = user;
				res.redirect('/');
			})
			.catch((err) => errorValidation(res, err));
	});
});

router.get('/login', isLoggedOut, (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}
	res.render('auth/login');
});

router.post('/login', isLoggedOut, (req, res, next) => {
	const { username, password } = req.body;

	if (!username) {
		return res.status(400).render('auth/login', { errorMessage: 'Please provide a username' });
	}

	// Here we use the same logic as above
	// - either length based parameters or we check the strength of a password
	// if (password.length < 8) {
	// 	return res.status(400).render('auth/login', {
	// 		errorMessage: 'Your password needs to be at least 8 characters long.',
	// 	});
	// }

	// Search the database for a user with the username submitted in the form
	User.findOne({ username })
		.then((user) => {
			// If the user isn't found, send the message that user provided wrong credentials
			if (!user) {
				return res.status(400).render('auth/login', { errorMessage: 'Wrong username' });
			}

			// If user is found based on the username, check if the input password matches the one saved in the database
			bcrypt.compare(password, user.password).then((isSamePassword) => {
				if (!isSamePassword) {
					return res.status(400).render('auth/login', { errorMessage: 'Wrong password' });
				}
				req.session.user = user;
				// req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
				return res.redirect('/');
			});
		})
		.catch((err) =>
			// sending the error to the error handling middleware defined in the error handling file
			next(err)
		);
});

router.get('/logout', isLoggedIn, (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}

	req.session.destroy((err) => {
		if (err) return res.status(500).render('auth/logout', { errorMessage: err.message });

		res.redirect('/');
	});
});

module.exports = router;
