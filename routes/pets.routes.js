const router = require('express').Router();

const Pet = require('../models/Pet.model');
const Message = require('../models/Message.model');
const Review = require('../models/Review.model');

const { isLoggedIn, roleCheck, isPetLoggedIn } = require('../middleware/');
const { errorValidation, hasRole, hasReview, calcRating } = require('../utils/');
const cdnUpload = require('../config/fileUpload.config');

router.get('/', isLoggedIn, isPetLoggedIn, (req, res) => {
	const addressProperties = ['street', 'postal', 'number', 'country', 'city'];

	// BUG - REFACTORIZAR CÓDIGO
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

	if (req.session.pet) result._id = { $ne: req.session.pet._id };

	Pet.find(result)
		.then((pets) => {
			const filteredPets = pets.filter((pet) => {
				return Object.keys(queryAddress).reduce((result, key) => {
					result = result && pet.address[key] == req.query[key];
					return result;
				}, true);
			});

			res.render('pets/', { pets: filteredPets });
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/:id', isLoggedIn, isPetLoggedIn, (req, res) => {
	Pet.findById(req.params.id)
		.populate({
			path: 'reviews',
			select: 'origin rating',
		})
		.then((pet) => {
			const rating = calcRating(pet.reviews);
			console.log(rating);

			res.render('pets/pet-details', {
				pet,
				isMod: hasRole(req.session.user, 'MODERATOR', 'ADMIN'),
				hasReview: req.session.pet ? hasReview(pet.reviews, req.session.pet) : false,
				rating,
				ratingNumber: pet.reviews.length,
			});
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/:id/edit', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	Pet.findById(req.params.id)
		.then((pet) => res.render('pets/edit-pet', { pet }))
		.catch((err) => errorValidation(res, err));
});

router.post('/:id/edit', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), cdnUpload.single('profile_img'), (req, res) => {
	const { name, description, species, age, gender, street, postal, number, country, city } = req.body;
	const address = { street, postal, number, country, city };

	Pet.findById(req.params.id)
		.then((pet) => {
			return Pet.findByIdAndUpdate(req.params.id, {
				name,
				description,
				species,
				address,
				age,
				gender,
				profile_img: req.file.path,
			});
		})
		.then((pet) => res.status(200).redirect(`/pets/${req.params.id}`))
		.catch((err) => errorValidation(res, err));
});

router.post('/:id/delete', isLoggedIn, roleCheck('ADMIN'), (req, res) => {
	Pet.findByIdAndDelete(req.params.id)
		.then(() => res.redirect('/pets'))
		.catch((err) => errorValidation(res, err));
});

router.get('/:id/contact', isLoggedIn, isPetLoggedIn, roleCheck('OWNER'), (req, res) => {
	const { id } = req.params;

	Pet.findById(id)
		.then((pet) => res.render('pets/contact-pet', { pet }))
		.catch((err) => errorValidation(res, err));
});

router.post('/:id/contact', isLoggedIn, isPetLoggedIn, roleCheck('OWNER'), (req, res) => {
	const { body } = req.body;
	const { id } = req.params;

	Message.create({ origin: req.session.pet._id, destinatary: id, body, date: Date.now() })
		.then((message) => {
			req.session.pet.messages.push(message._id);
			return Pet.findByIdAndUpdate(id, { $push: { messages: message._id } }, { new: true });
		})
		.then((pet) => res.render('pets/pet-details', { pet }))
		.catch((err) => errorValidation(res, err));
});

router.get('/:id/review', isLoggedIn, isPetLoggedIn, roleCheck('OWNER', 'MODERATOR'), (req, res) => {
	const { id } = req.params;

	Pet.findById(id)
		.populate({
			path: 'reviews',
			select: 'origin',
		})
		.then((pet) => {
			res.render('pets/review-pet', { pet, hasReview: req.session.pet ? hasReview(pet.reviews, req.session.pet) : false });
		})
		.catch((err) => errorValidation(res, err));
});

router.post('/:id/review', isLoggedIn, isPetLoggedIn, roleCheck('OWNER', 'MODERATOR'), (req, res) => {
	const { body, rating } = req.body;
	const { id } = req.params;

	Review.create({
		origin: req.session.pet._id,
		destinatary: id,
		body,
		date: Date.now(),
		rating,
	})
		.then((review) => {
			req.session.pet.reviews.push(review._id);
			return Pet.findByIdAndUpdate(id, { $push: { reviews: review._id } }, { new: true });
		})
		.then(() => res.redirect(`/pets/${id}`))
		.catch((err) => errorValidation(res, err));
});

router.get('/:id/reviews', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const { id } = req.params

	Pet
		.findById(id)
		.populate('reviews')
		.then(pet => {
			res.render('pets/allReviews', { pet })
		})
		.catch(err => errorValidation(res, err))

})

router.get('/:pet_id/reviews/:review_id', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const { pet_id, review_id } = req.params

	Review
		.findById(review_id)
		.populate('origin')
		.populate({
			path: 'destinatary',
			select: 'name _id',
		})
		.then(review => {
			res.render('pets/edit-review', { review })
		})
		.catch(err => errorValidation(res, err))
})

router.post('/:pet_id/reviews/:review_id/edit', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const { pet_id, review_id } = req.params
	const { body } = req.body

	Review
		.findByIdAndUpdate(review_id, { body })
		.then(review => {
			res.redirect(`/pets/${pet_id}/reviews`)
		})
		.catch(err => errorValidation(res, err))
})

router.post('/:pet_id/reviews/:review_id/delete', isLoggedIn, roleCheck('ADMIN', 'MODERATOR'), (req, res) => {
	const { pet_id, review_id } = req.params

	const reviewToDelete = Review.findByIdAndDelete(review_id)
	const petReviewToDelete = Pet.findByIdAndUpdate(pet_id, { $pull: { reviews: review_id } }, { new: true })

	Promise.all([reviewToDelete, petReviewToDelete])
		.then((review, pet) => {
			res.redirect(`/pets/${pet_id}/reviews`)
		})
		.catch(err => errorValidation(res, err))
})



module.exports = router;
