const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: [true, 'You must decide on a username to sign up'],
	},

	password: {
		type: String,
		validate: {
			validator: (pass) => {
				return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(pass);
			},
			message: 'The password must contain at least a number, an uppercase letter, a lowercase letter and an 8 digits length',
		},
		required: [true, 'You must introduce a valid password'],
	},

	email: String,

	role: {
		type: String,
		enum: ['OWNER', 'MODERATOR', 'ADMIN'],
		default: 'OWNER',
		// required: true,
	},

	pets: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Pet',
			// required: true,
		},
	],
});

const User = model('User', userSchema);

module.exports = User;
