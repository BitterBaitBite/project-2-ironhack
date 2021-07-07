// -   /events
// -   /events/search?filters
// -   /events/add
// -   /events/:id
// -   /events/:id/edit (admin, moderator, publisher)
// -   /events/:id/delete (admin, moderator, publisher)
// -   /events/:id/join (owner only)(option to multipet join)
// -   /events/:id/quit (owner only)(option to multipet join)

const router = require('express').Router();
const Event = require('../models/Event.model');
const {isLoggedIn} = require('../middleware/');
const {errorValidation, dateFormat} = require('../utils/');

router.get('/:pet_id', isLoggedIn, (req, res) => {
	Event.find()
		.then((events) => {
			res.render('events/', { events, pet_id: req.params.pet_id });
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/:pet_id/add', isLoggedIn, (req, res) => {
	// REVISAR ZONA HORARIA Y FORMATO
	const dateUnix = new Date(Date.now())


	const {date, time} = dateFormat( dateUnix )

	// let temp = new Date(Date.now().toLocaleString(undefined, { timeZone: 'UTC' }).split(','));
	// const time = temp[1];
	// const date = temp[0];

	res.render('events/new-event', { date, time, pet_id: req.params.pet_id });
});

router.post('/:pet_id/add', isLoggedIn, (req, res) => {
	const { eventDate: date, eventTime: time, activity, description, latitude, longitude } = req.body;

	const eventFullDate = [date, time].join('T');

	Event.create({
		creator: req.params.pet_id,
		participants: [req.params.pet_id],
		activity,
		description,
		creationDate: Date.now(),
		eventDate: eventFullDate,
		location: {
			type: 'Point',
			coordinates: [latitude, longitude],
		},
	})
		.then((event) => res.redirect(`/events/${req.params.pet_id}`))
		.catch((err) => errorValidation(res, err));
});

router.get('/:pet_id/details/:event_id', isLoggedIn, (req, res) => {
	const { pet_id, event_id } = req.params;

	Event.findById(event_id)
		.populate('creator')
		.populate('participants')
		.then((event) => {
			const isEnroled = event.participants.some((pet) => pet._id == pet_id);
			res.render('events/event-details', { event, isEnroled, pet_id, event_id });
		})
		.catch((err) => errorValidation(res, err));
});

router.post('/:pet_id/details/:event_id/join', isLoggedIn, (req, res) => {
	const { pet_id, event_id } = req.params;

	Event.findById(event_id)
		.populate('creator')
		.populate('participants')
		.then((event) => {
			const isEnroled = event.participants.some((pet) => pet._id == pet_id);

			if (isEnroled) {
				res.redirect(`/events/${pet_id}/details/${event_id}`);
				return;
			}

			const arr = [...event.participants];
			arr.push(pet_id);
			return Event.findByIdAndUpdate(event_id, { participants: [...arr] }, { new: true });
		})
		.then((event) => res.redirect(`/events/${pet_id}/details/${event_id}`))
		.catch((err) => errorValidation(res, err));
});

router.post('/:pet_id/details/:event_id/quit', isLoggedIn, (req, res) => {
	const { pet_id, event_id } = req.params;

	Event.findById(req.params.event_id)
		.populate('creator')
		.populate('participants')
		.then((event) => {
			const isEnroled = event.participants.some((pet) => pet._id == pet_id);

			if (!isEnroled) {
				res.redirect(`/events/${pet_id}/details/${event_id}`);
				return;
			}

			const arr = [...event.participants];
			arr.splice(arr.indexOf(pet_id), 1);
			return Event.findByIdAndUpdate(event_id, { participants: [...arr] }, { new: true });
		})
		.then(() => res.redirect(`/events/${pet_id}/details/${event_id}`))
		.catch((err) => errorValidation(res, err));
});

module.exports = router;
