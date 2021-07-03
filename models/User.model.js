const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		required: true,
	},

	password: {
		type: String,
		required: true,
	},

	email: String,

	role: {
		type: String,
		enum: ['OWNER', 'MODERATOR', 'ADMIN'],
		default: 'OWNER',
		// required: true,
	},

	pets: {
		type: [Schema.Types.ObjectId],
		ref: 'Pet',
		// required: true,
	},
});

const User = model('User', userSchema);

module.exports = User;
