module.exports = (app) => {
	app.use((req, res, next) => {
		if (req.session.user) res.locals.currentUser = req.session.user;
		// if (req.session.pet)
		next();
	});
	app.use('/', require('./base.routes'));
	app.use('/', require('./auth.routes'));
	app.use('/profile', require('./user.routes'));
	app.use('/pets', require('./pets.routes'));
	app.use('/events', require('./events.routes'));
};
