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
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const Pet = require('../models/Pet.model');
const User = require('../models/User.model');

const { isLoggedIn, isPetLoggedIn, isPetLoggedOut, roleCheck } = require('../middleware/');
const { errorValidation, hasPet, hasRole } = require('../utils/');
const cdnUpload = require('../config/fileUpload.config');

router.get('/', isLoggedIn, (req, res) => {
	const sessionUser = req.session.user;

	if (req.session.pet) {
		delete req.session.pet;
	}
	// const isMod = sessionUser.role == 'MODERATOR' || sessionUser.role == 'ADMIN';

	User.findById(sessionUser._id)
		.populate('pets')
		.then((user) => {
			if (!user) res.status(400).redirect('/login');
			res.status(200).render('user', {
				user,
				isMod: hasRole(req.session.user, 'MODERATOR', 'ADMIN'),
			});
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/new-pet', isLoggedIn, isPetLoggedOut, roleCheck('OWNER'), (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}

	res.render('user/new-pet');
});

router.post('/new-pet', isLoggedIn, isPetLoggedOut, cdnUpload.single('profile_img'), (req, res) => {
	const sessionUser = req.session.user;
	const { name, description, species, age, gender, street, postal, number, country, city } = req.body;
	const address = { street, postal, number, country, city };

	if (!name) {
		return res.status(400).render('user/new-pet', { errorMessage: 'Please provide a name for the pet' });
	}

	Pet.find({ name })
		.then((foundPets) => {
			let exists = false;
			foundPets.forEach((pet) => {
				exists = exists || hasPet(sessionUser, pet._id);
				if (exists) {
					return;
				}
			});
			if (exists) return res.status(400).render('user/new-pet', { errorMessage: 'You have already a pet with that name' });
			else return Pet.create({ name, description, species, address, age, gender, profile_img: req.file.path });
		})
		.then((pet) => User.findByIdAndUpdate(sessionUser._id, { $push: { pets: pet._id } }, { new: true }))
		.then((user) => {
			req.session.user = user;
			res.redirect('/profile');
		})
		.catch((err) => errorValidation(res, err));
});

// User Profile Edit

router.get('/edit', isLoggedIn, isPetLoggedOut, (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}

	res.render('user/edit-user', { user: req.session.user });
});

router.post('/edit', isLoggedIn, isPetLoggedOut, (req, res) => {
	const sessionUser = req.session.user;
	const { username, email, password } = req.body;

	if (!username) {
		return res.status(400).render('user/edit-user', { user: sessionUser, errorMessage: 'Please provide your username.' });
	}

	/*
	if (password.length < 8) {
		return res.status(400).render('auth/signup', {
			errorMessage: 'Your password needs to be at least 8 characters long.',
		});
	}

	  ! This use case is using a regular expression to control for special characters and min length
	
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
	return res.status(400).render("signup", {
	  errorMessage:
		"Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
	});
  }
  */

	User.findOne({ username }).then((found) => {
		// If the user is found, send the message username is taken
		if (found && String(found._id) != String(sessionUser._id)) {
			return res.status(400).render('user/edit', { user: sessionUser, errorMessage: 'Username already taken.' });
		}

		// if user is not found, create a new user - start with hashing the password
		//añadimos password anterior y nueva

		return bcrypt
			.genSalt(saltRounds)
			.then((salt) => bcrypt.hash(password, salt))
			.then((hashedPassword) => {
				// Create a user and save it in the database
				return User.findByIdAndUpdate(sessionUser._id, { username, email, password: hashedPassword });
			})
			.then((user) => {
				// Bind the user to the session object
				req.session.user = user;
				res.redirect('/profile');
			})
			.catch((err) => errorValidation(res, err));
	});
});

//Delete user

router.get('/delete', isLoggedIn, isPetLoggedOut, (req, res) => {
	if (req.session.pet) {
		delete req.session.pet;
	}

	res.render('user/delete-user');
});

router.post('/delete', isLoggedIn, isPetLoggedOut, (req, res) => {
	const sessionUser = req.session.user;

	const deletePets = Pet.deleteMany({
		_id: { $in: sessionUser.pets },
	});

	const deleteUser = User.findByIdAndDelete(sessionUser._id);

	Promise.all([deletePets, deleteUser])

		.then((pets, user) =>
			req.session.destroy((err) => {
				if (err) return res.status(500).render('user/', { errorMessage: err.message });

				res.redirect('/');
			})
		)
		.catch((err) => errorValidation(res, err));
});

router.get('/:id', isLoggedIn, (req, res) => {
	const id = req.params.id;

	if (!hasPet(req.session.user, req.params.id)) {
		res.status(401).render('user/', { errorMessage: 'Not authorized for that pet' });
		return;
	}

	Pet.findById(id)
		.populate({
			path: 'messages',
			populate: [
				{
					path: 'origin',
					select: 'name',
				},
			],
		})
		.then((pet) => {
			req.session.pet = pet;
			res.status(200).render('user/pet-details', { pet });
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/:id/edit', isLoggedIn, (req, res) => {
	if (!hasPet(req.session.user, req.params.id)) {
		res.status(401).render('user/', { errorMessage: 'Not authorized for that pet' });
		return;
	}

	Pet.findById(req.params.id)
		.then((pet) => {
			res.status(200).render('user/edit-pet', { pet });
		})
		.catch((err) => errorValidation(res, err));
});

router.post('/:id/edit', isLoggedIn, cdnUpload.single('profile_img'), (req, res) => {
	const { name, description, species, age, gender, street, postal, number, country, city } = req.body;
	const address = { street, postal, number, country, city };

	if (!hasPet(req.session.user, req.params.id)) {
		res.status(401).render('user/', { errorMessage: 'Not authorized for that pet' });
		return;
	}

	Pet.findByIdAndUpdate(req.params.id, {
		name,
		description,
		species,
		age,
		gender,
		address,
		profile_img: req.file.path,
	})
		.then(() => res.status(200).redirect('/profile'))
		.catch((err) => errorValidation(res, err));
});

// Mirar promiseAll
router.post('/:id/delete', isLoggedIn, (req, res) => {
	const id = req.params.id;

	if (!hasPet(req.session.user, id)) {
		res.status(401).render('user/', { errorMessage: 'Not authorized for that pet' });
		return;
	}

	User.findByIdAndUpdate(req.session.user._id, { $pull: { pets: id } }, { new: true })
		.then((user) => {
			req.session.user = user;
			return Pet.findByIdAndDelete(id);
		})
		.then(() => res.status(200).redirect('/profile'))
		.catch((err) => errorValidation(res, err));
});

module.exports = router;
