// -   /pets
// -   /pets?filters (admin can filter by owner user)
// -   /pets/:id (get)
// -   /pets/:id/contact (get, post)
// -   /pets/:id/edit (get, post)(admin only, moderator for reviews)
// -   /pets/:id/delete (post)(admin only)
const router = require('express').Router();
const mongoose = require('mongoose');

const session = require('express-session');
const Pet = require('../models/Pet.model');
const User = require('../models/User.model');
const isLoggedIn = require('../middleware/isLoggedIn');
const loggedUser = require('../utils/loggedUser');
const roleCheck = require('../middleware/roleCheck');
const Message = require('../models/Message.model')

router.get('/', isLoggedIn, (req, res) => {

	const user = req.session.user;
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
	// console.log(result)
	Pet.find(result)
		.then((pets) => {
			const filteredPets = pets.filter((pet) => {
				//PREGUNTAR POR QUÉ OBJECT.VALUES(PET.ADDRESS) NOS DEVUELVE EL INTERNALCACHE

				return Object.keys(queryAddress).reduce((result, key) => {
					result = result && pet.address[key] == req.query[key];
					return result;
				}, true);
			});

			res.render('pets/', { user: loggedUser(user), pets: filteredPets });
		})
		.catch((err) => console.error(err));
});



router.get('/:id', isLoggedIn, (req, res) => {
	const currentUser = req.session.user;
	console.log('hello')
	const isMod = currentUser.role == 'MODERATOR' || currentUser.role == 'ADMIN';

	const { id } = req.params
	console.log(id, req.url)
	Pet
		.findById(req.params.id)
		.then((pet) => res.render('pets/pet-details', { pet, user: loggedUser(currentUser), isMod }))
		.catch(err => console.log(err))
})


router.get('/:id/edit', isLoggedIn, roleCheck, (req, res) => {
	const currentUser = req.session.user;
	const { id } = req.params

	Pet
		.findById(id)
		.then((pet) => res.render('pets/edit-pet', { pet, user: loggedUser(currentUser) }))
		.catch(err => console.log(err))

})



router.post('/:id/edit', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const user = req.session.user;

	const { name, description, species, age, gender, profile_img } = req.body;
	const { street, postal, number, country, city } = req.body;
	const address = { street, postal, number, country, city };

	Pet.findById(req.params.id)
		.then((pet) => {
			// if (!user.pets.includes(String(pet._id))) {
			// 	res.status(401).render(`pets/pet-details`, { user: loggedUser(user), errorMessage: 'Not authorized for that pet' });
			// 	return;
			// }

			return Pet.findByIdAndUpdate(req.params.id, { name, description, species, address, age, gender, profile_img });

		})
		.then((pet) => res.status(200).redirect(`/pets/${req.params.id}`))

		.catch((error) => {
			if (error instanceof mongoose.Error.ValidationError) {
				return res.status(400).render(`pets/pet-details}`, { user: loggedUser(user), errorMessage: error.message });
			}
			if (error.code === 11000) {
				return res.status(400).render(`pets/pet-details}`, {
					errorMessage: error.message,
				});
			}
			return res.status(500).render(`pets/pet-details}`, { user: loggedUser(user), errorMessage: error.message });
		});
});



router.post('/:id/delete', isLoggedIn, roleCheck('ADMIN'), (req, res) => {

	const { id } = req.params

	Pet
		.findByIdAndDelete(id)
		.then(() => res.redirect('/pets'))
		.catch(err => console.log(err))
})


router.get('/:id/contact', isLoggedIn, (req, res) => {
	const user = req.session.user;
	const { id } = req.params

	Pet
		.findById(id)
		.then((pet) => res.render('pets/contact-pet', { user: loggedUser(user), pet }))
		.catch(err => console.log(err))
})


router.post('/:id/contact', isLoggedIn, (req, res) => {
	const user = req.session.user;
	const { body } = req.body
	const { id } = req.params

	Message

		.create({ origin: user._id, destinatary: id, body, date: Date.now() })
		.then((message) => {


			//SI ESTO NOS DA ALGÚN PROBLEMA FUTURO, TENEMOS DEBAJO LA OTRA OPCIÓN (POR MODIFICAR)
			Pet
				.findById(id)
				.then((pet) => {
					pet.messages.push(message._id);
					return pet.save()

				})
				.then((pet) => {
					
					res.render('pets/pet-details', { user: loggedUser(user), pet })})
				.catch(err => console.log(err))





			// Pet.findById(id)
			// .then((pet) => Pet.findByIdAndUpdate(id, { messages: pet.messages.push(message._id) }, { new: true }))
			// .then((pet) => console.log(message, pet))

		})
})





module.exports = router;
