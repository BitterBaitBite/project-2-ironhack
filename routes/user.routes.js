// -   /profile (get)
// -   /profile/friends (get)
// -   /profile/notifications (get)
// -   /profile/edit (get, post)
// -   /profile/delete ? (post)
// -   /profile/new-pet
// -   /profile/:pet_id
// -   /profile/:pet_id/edit
// -   /profile/:pet_id/delete

const router = require('express').Router();

const session = require('express-session');
const User = require('../models/User.model');

router.get('/', (req, res) => {
	const { currentUser } = req.session;

	res.render('user', currentUser);
});

router.get('/new-pet', (req, res) => {
	res.render('user/new-pet');
});

router.post('/new-pet', (req, res) => {
	const { username, password } = req.body;

	if (!username) {
		return res.status(400).render('auth/signup', { errorMessage: 'Please provide your username.' });
	}

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
			.catch((error) => {
				if (error instanceof mongoose.Error.ValidationError) {
					return res.status(400).render('auth/signup', { errorMessage: error.message });
				}
				if (error.code === 11000) {
					return res.status(400).render('auth/signup', {
						errorMessage: 'The username you chose is already in use.',
					});
				}
				return res.status(500).render('auth/signup', { errorMessage: error.message });
			});
	});

	res.send(req.body);
});

module.exports = router;
