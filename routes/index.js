module.exports = (app) => {
	app.use('/', require('./base.routes'));
	app.use('/', require('./auth.routes'));
	app.use('/profile', require('./user.routes'));
	app.use('/pets', require('./pets.routes'));
	app.use('/events', require('./events.routes'));
};
