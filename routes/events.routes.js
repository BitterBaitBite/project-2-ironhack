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
const { isLoggedIn, isPetLoggedIn, isPetLoggedOut, roleCheck } = require('../middleware/');
const { errorValidation, dateFormat, hasRole, dateReverseFormat } = require('../utils/');

router.get('/', isLoggedIn, isPetLoggedIn, (req, res) => {
	let pet_id = undefined;
	req.session.pet && (pet_id = req.session.pet._id);
	// console.log(pet_id)

	Event.find()
		.then((events) => {
			res.render('events/', { events, pet_id, isMod: hasRole(req.session.user, 'ADMIN', 'MODERATOR') });
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/add', isLoggedIn, isPetLoggedIn, roleCheck('OWNER'), (req, res) => {
	// REVISAR ZONA HORARIA Y FORMATO
	const dateUnix = new Date(Date.now());

	const { date, time } = dateFormat(dateUnix);

	// let temp = new Date(Date.now().toLocaleString(undefined, { timeZone: 'UTC' }).split(','));
	// const time = temp[1];
	// const date = temp[0];

	res.render('events/new-event', { date, time, pet_id: req.session.pet._id });
});

router.post('/add', isLoggedIn, isPetLoggedIn, roleCheck('OWNER'), (req, res) => {
	const { eventDate: date, eventTime: time, activity, description, latitude, longitude } = req.body;

	const eventFullDate = [date, time].join('T');

	console.log(typeof latitude, typeof longitude);

	const latToNumber = Number(latitude);
	const lngToNumber = Number(longitude);

	Event.create({
		creator: req.session.pet._id,
		participants: [req.session.pet._id],
		activity,
		description,
		creationDate: Date.now(),
		eventDate: eventFullDate,
		location: {
			type: 'Point',
			coordinates: [latitude, longitude],
		},
	})
		.then((event) => res.redirect(`/events/${event._id}`))
		.catch((err) => errorValidation(res, err));
});

router.get('/:event_id', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { event_id } = req.params;
	// console.log(event_id)
	let pet_id = undefined;
	req.session.pet && (pet_id = req.session.pet._id);

	Event.findById(event_id)
		.populate('creator')
		.populate('participants')
		.then((event) => {
			console.log(event);

			const isOwner = req.session.pet && event.creator == req.session.pet._id;
			const isEnroled = event.participants.some((pet) => pet._id == pet_id);

			console.log(isOwner);

			res.render('events/event-details', {
				isOwner,
				event,
				isEnroled,
				pet_id,
				isMod: hasRole(req.session.user, 'ADMIN', 'MODERATOR'),
				event_id,
			});
		})
		.catch((err) => errorValidation(res, err));
});

router.get('/:event_id/edit', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { event_id } = req.params;

	Event.findById(event_id)
		.then((event) => {
			// const isOwner = hasRole('OWNER') && event.creator == req.session.pet._id
			const fixedDate = dateFormat(event.eventDate);
			res.render('events/edit-event', { event, fixedDate });
		})
		.catch((err) => console.log(err));
});

router.post('/:event_id/edit', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { eventDate: date, eventTime, activity, description, latitude, longitude } = req.body;
	const { event_id } = req.params;
	const fixedDate = dateReverseFormat(date, eventTime);

	Event.findByIdAndUpdate(
		event_id,
		{
			eventDate: fixedDate,
			activity,
			description,
			location: {
				type: 'Point',
				coordinates: [latitude, longitude],
			},
		},
		{ new: true }
	)
		.then((event) => res.redirect(`/events/${event_id}`))
		.catch((err) => console.log(err));
});

router.post('/:event_id/join', isLoggedIn, isPetLoggedIn, roleCheck('OWNER'), (req, res) => {
	const { event_id } = req.params;

	Event.findById(event_id)
		.then((event) => {
			const isEnroled = event.participants.some((pet) => pet._id == req.session.pet._id);

			if (isEnroled) {
				res.redirect(`/events/${event_id}`);
				return;
			}

			return Event.findByIdAndUpdate(event_id, { $push: { participants: req.session.pet._id } }, { new: true });
		})
		.then((event) => res.redirect(`/events/${event_id}`))
		.catch((err) => errorValidation(res, err));
});

router.post('/:event_id/quit', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { event_id } = req.params;

	Event.findById(req.params.event_id)
		.then((event) => {
			const isEnroled = event.participants.some((pet) => pet._id == req.session.pet._id);

			if (!isEnroled) {
				res.redirect(`/events/${event_id}`);
				return;
			}

			return Event.findByIdAndUpdate(event_id, { $pull: { participants: req.session.pet._id } }, { new: true });
		})
		.then(() => res.redirect(`/events/${event_id}`))
		.catch((err) => errorValidation(res, err));
});

module.exports = router;
