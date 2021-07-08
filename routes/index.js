const { localsUpdate } = require('../middleware');

module.exports = (app) => {
	app.use('/', localsUpdate, require('./base.routes'));
	app.use('/', localsUpdate, require('./auth.routes'));
	app.use('/profile', localsUpdate, require('./user.routes'));
	app.use('/pets', localsUpdate, require('./pets.routes'));
	app.use('/events', localsUpdate, require('./events.routes'));
	app.use('/admin', localsUpdate, require('./admin.routes'));
	app.use('/messages', localsUpdate, require('./messages.routes'));
};
