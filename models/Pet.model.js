const { Schema, model } = require('mongoose');

const petSchema = new Schema({
	name: {
		type: String,
		unique: true,
		required: true,
	},

	description: {
		type: String,
	},

	species: {
		type: String,
		required: true,
	},

	address: {
		type: String,
		required: true,
	},

	age: {
		type: Number,
		required: true,
	},

	profile_img: {
		type: String,
		required: true,
	},

	gender: {
		type: String,
		enum: ['MALE', 'FEMALE', 'UNDEFINED'],
		default: 'UNDEFINED',
	},

	reviews: {
		type: [Schema.Types.ObjectId],
		ref: 'Review',
	},

	messages: {
		type: [Schema.Types.ObjectId],
		ref: 'Message',
	},

	friends: {
		type: [Schema.Types.ObjectId],
		ref: 'Pet',
	},
});

const Pet = model('Pet', petSchema);

module.exports = Pet;
