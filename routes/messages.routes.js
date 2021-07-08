const router = require('express').Router();

const Pet = require('../models/Pet.model');
const Message = require('../models/Message.model');

const { isLoggedIn, roleCheck, isPetLoggedIn } = require('../middleware/');
const { errorValidation, hasRole } = require('../utils/');

router.get('/', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { pet } = req.session;

	// BUG - FILTRAR Nº MENSAJES Y ORDENAR POR FECHA
	res.render('messages/', { pet });
});

router.get('/:message_id', isLoggedIn, isPetLoggedIn, (req, res) => {
	const { pet } = req.session;

	Message.findById(req.params.message_id)
		.populate({
			path: 'origin',
			select: 'name',
		})
		.then((message) => res.render('messages/message-details', { message }))
		.catch((err) => errorValidation(res, err));
});

module.exports = router;
