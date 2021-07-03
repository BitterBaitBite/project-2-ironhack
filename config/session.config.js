const session = require('express-session');
const MongoStore = require('connect-mongo');
const MONGO_URI = require('../utils/consts');

module.exports = (app) => {
	app.set('trust proxy', 1);
	app.use(
		session({
			secret: process.env.SESSION_SECRET,
			resave: true,
			saveUninitialized: false,
			cookie: {
				sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				maxAge: 300000,
			},
			store: MongoStore.create({
				mongoUrl: MONGO_URI,
			}),
		})
	);
};
