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
const mongoose = require('mongoose');

const session = require('express-session');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const loggedUser = require('../utils/loggedUser');

router.get('/', isLoggedIn, (req, res) => {
	const currentUser = req.session.user;

	User.findById(currentUser._id)
		.populate('pets')
		.then((user) => {
			if (!user) res.status(400).redirect('/login');
			console.log(req.session.user);
			res.status(200).render('user', {
				user: loggedUser(user),
				/* user,
				logged: req.logged, */
			});
		})
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user', { user: loggedUser(user), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render('user', {
					errorMessage: 'The username you chose is already in use.',
				});
			}
			return res.status(500).render('user', { user: loggedUser(user), errorMessage: error.message });
		});
});

router.get('/new-pet', isLoggedIn, (req, res) => {
	const user = req.session.user;

	res.render('user/new-pet', { user: loggedUser(user) });
});

router.post('/new-pet', isLoggedIn, (req, res) => {
	const user = req.session.user;
	const { name, description, species, address, age, gender, profile_img } = req.body;

	if (!name) {
		return res.status(400).render('user/new-pet', { user: loggedUser(user), errorMessage: 'Please provide a name.' });
	}

	Pet.find({ name })
		.then((foundPets) => {
			foundPets.forEach((pet) => {
				if (user.pets.includes(pet._id)) {
					return res.status(400).render('user/new-pet', {
						user: loggedUser(currentUser),
						errorMessage: 'You have already a pet with that name.',
					});
				}
			});

			return Pet.create({ name, description, species, address, age, gender, profile_img });
		})
		.then((pet) => {
			return User.findById(user._id).then((user) => {
				const pets = [...user.pets];
				pets.push(pet._id);
				req.session.user = user;
				return User.findByIdAndUpdate(user._id, { pets });
			});
		})
		.then(() => res.redirect('/profile'))
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user/new-pet', { user: loggedUser(currentUser), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render('user/new-pet', {
					errorMessage: 'The username you chose is already in use.',
				});
			}
			return res.status(500).render('user/new-pet', { user: loggedUser(currentUser), errorMessage: error.message });
		});
});

router.get('/:id', isLoggedIn, (req, res) => {
	const currentUser = req.session.user;
	const id = req.params.id;

	User.findById(currentUser._id)
		.then((user) => {
			return Pet.findById(id).then((pet) => {
				if (!user.pets.includes(String(pet._id))) {
					res.status(401).render('user/', { user: loggedUser(user), errorMessage: 'Not authorized for that pet' });
					return;
				}

				res.status(200).render('user/pet-details', { user: loggedUser(user), pet });
			});
		})
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user/', { user: loggedUser(currentUser), errorMessage: error.message });
			}

			if (error instanceof mongoose.Error.ValidationError) {
				res.status(401).render('user/', { user: loggedUser(currentUser), errorMessage: 'Not authorized for that pet' });
			}

			if (error.code === 11000) {
				return res.status(400).render('user/', {
					user: loggedUser(user),
					errorMessage: 'The username you chose is already in use.',
				});
			}
			return res.status(500).render('user/new-pet', { user: loggedUser(currentUser), errorMessage: error.message });
		});
});

router.get('/:id/edit', isLoggedIn, (req, res) => {
	const user = req.session.user;

	Pet.findById(req.params.id)
		.then((pet) => {
			if (!user.pets.includes(String(pet._id))) {
				res.status(401).render('user/', { user: loggedUser(user), errorMessage: 'Not authorized for that pet' });
				return;
			}

			res.status(200).render('user/edit-pet', { user: loggedUser(user), pet });
		})
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user/', { user: loggedUser(user), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render('user/', {
					errorMessage: error.message,
				});
			}
			return res.status(500).render('user/', { user: loggedUser(user), errorMessage: error.message });
		});
});

router.post('/:id/edit', isLoggedIn, (req, res) => {
	const user = req.session.user;
	const { name, description, species, address, age, gender, profile_img } = req.body;

	Pet.findById(req.params.id)
		.then((pet) => {
			if (!user.pets.includes(String(pet._id))) {
				res.status(401).render('user/', { user: loggedUser(user), errorMessage: 'Not authorized for that pet' });
				return;
			}

			return Pet.findByIdAndUpdate(req.params.id, { name, description, species, address, age, gender, profile_img });
		})
		.then(() => res.status(200).redirect('/profile'))
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user/', { user: loggedUser(user), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render('user/', {
					errorMessage: error.message,
				});
			}
			return res.status(500).render('user/', { user: loggedUser(user), errorMessage: error.message });
		});
});

// Mirar promiseAll
router.post('/:id/delete', isLoggedIn, (req, res) => {
	const currentUser = req.session.user;
	const id = req.params.id;

	User.findById(currentUser._id)
		.then((user) => {
			user.pets.splice(user.pets.indexOf(id), 1);
			req.session.user = user;
			return User.findByIdAndUpdate(user._id, { pets: user.pets });
		})
		.then(() => Pet.findByIdAndDelete(id))
		.then(() => res.status(200).redirect('/profile'))
		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render('user/', { user: loggedUser(currentUser), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render('user/', {
					errorMessage: error.message,
				});
			}
			return res.status(500).render('user/', { user: loggedUser(currentUser), errorMessage: error.message });
		});
});

module.exports = router;
