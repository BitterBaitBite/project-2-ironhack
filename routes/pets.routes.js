// -   /pets
// -   /pets?filters (admin can filter by owner user)
// -   /pets/:id (get)
// -   /pets/:id/contact (get, post)
// -   /pets/:id/edit (get, post)(admin only, moderator for reviews)
// -   /pets/:id/delete (post)(admin only)
const router = require('express').Router();
const mongoose = require('mongoose');

const Pet = require('../models/Pet.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const roleCheck = require('../middleware/roleCheck');
const Message = require('../models/Message.model');

router.get('/', isLoggedIn, (req, res) => {
	const addressProperties = ['street', 'postal', 'number', 'country', 'city'];

	const queryAddress = Object.keys(req.query).reduce((result, key) => {
		if (addressProperties.includes(key) && req.query[key] != '') {
			result[key] = req.query[key];
		}
		return result;
	}, {});

	const result = Object.keys(req.query).reduce((result, key) => {
		if (!addressProperties.includes(key) && req.query[key] != '') {
			result[key] = req.query[key];
		}
		return result;
	}, {});

	Pet.find(result)
		.then((pets) => {
			const filteredPets = pets.filter((pet) => {
				//PREGUNTAR POR QUÉ OBJECT.VALUES(PET.ADDRESS) NOS DEVUELVE EL INTERNALCACHE

				return Object.keys(queryAddress).reduce((result, key) => {
					result = result && pet.address[key] == req.query[key];
					return result;
				}, true);
			});

			res.render('pets/', { pets: filteredPets });
		})
		.catch((err) => console.error(err));
});

router.get('/:id', isLoggedIn, (req, res) => {
	const isMod = req.session.user.role == 'MODERATOR' || req.session.user.role == 'ADMIN';

	const { id } = req.params;
	console.log(id, req.url);
	Pet.findById(req.params.id)
		.then((pet) => res.render('pets/pet-details', { pet, isMod }))
		.catch((err) => console.log(err));
});

router.get('/:id/edit', isLoggedIn, roleCheck, (req, res) => {
	const { id } = req.params;

	Pet.findById(id)
		.then((pet) => res.render('pets/edit-pet', { pet }))
		.catch((err) => console.log(err));
});

router.post('/:id/edit', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const { name, description, species, age, gender, profile_img, street, postal, number, country, city } = req.body;
	const address = { street, postal, number, country, city };

	Pet.findById(req.params.id)
		.then((pet) => {
			// if (!user.pets.includes(String(pet._id))) {
			// 	res.status(401).render(`pets/pet-details`, {  errorMessage: 'Not authorized for that pet' });
			// 	return;
			// }

			return Pet.findByIdAndUpdate(req.params.id, { name, description, species, address, age, gender, profile_img });
		})
		.then((pet) => res.status(200).redirect(`/pets/${req.params.id}`))

		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render(`pets/pet-details}`, { errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render(`pets/pet-details}`, {
					errorMessage: error.message,
				});
			}
			return res.status(500).render(`pets/pet-details}`, { errorMessage: error.message });
		});
});

router.post('/:id/delete', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
	const { id } = req.params;

	Pet.findByIdAndDelete(id)
		.then(() => res.redirect('/pets'))
		.catch((err) => console.log(err));
});

router.get('/:id/contact', isLoggedIn, (req, res) => {
	const { id } = req.params;

	Pet.findById(id)
		.then((pet) => res.render('pets/contact-pet', { pet }))
		.catch((err) => console.log(err));
});

router.post('/:id/contact', isLoggedIn, (req, res) => {
	const { body } = req.body;
	const { id } = req.params;

	// BUG - El origin está metiendo al usuario
	Message.create({ origin: req.session.user._id, destinatary: id, body, date: Date.now() }).then((message) => {
		//SI ESTO NOS DA ALGÚN PROBLEMA FUTURO, TENEMOS DEBAJO LA OTRA OPCIÓN (POR MODIFICAR)
		Pet.findById(id)
			.then((pet) => {
				pet.messages.push(message._id);
				return pet.save();
			})
			.then((pet) => {
				res.render('pets/pet-details', { pet });
			})
			.catch((err) => console.log(err));

		// Pet.findById(id)
		// .then((pet) => Pet.findByIdAndUpdate(id, { messages: pet.messages.push(message._id) }, { new: true }))
		// .then((pet) => console.log(message, pet))
	});
});

module.exports = router;
