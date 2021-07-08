module.exports = (app) => {
	app.use((req, res, next) => {
		if (req.session.user) {
			res.locals.currentUser = req.session.user;
			res.locals.isLogged = true;
		}
		if (req.session.pet) res.locals.currentPet = req.session.pet;
		res.locals.MAPS_KEY = process.env.MAPS_KEY;
		next();
	});
	app.use('/', require('./base.routes'));
	app.use('/', require('./auth.routes'));
	app.use('/profile', require('./user.routes'));
	app.use('/pets', require('./pets.routes'));
	app.use('/events', require('./events.routes'));
	app.use('/admin', require('./admin.routes'));
	app.use('/messages', require('./messages.routes'));
};
