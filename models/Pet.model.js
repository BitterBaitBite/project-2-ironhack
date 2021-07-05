const { Schema, model } = require('mongoose');

const petSchema = new Schema({
	name: {
		type: String,
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
		street: { type: String, required: true },
		postal: { type: String, required: true },
		number: { type: Number, required: true },
		country: { type: String, required: true, default: 'SPAIN' },
		city: { type: String, required: true },
		location: {
			type: {
				type: String,
			},
			coordinates: [Number],
		},
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

	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],

	messages: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Message',
		},
	],

	friends: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Pet',
		},
	],
});

petSchema.index({ location: '2dsphere' });

const Pet = model('Pet', petSchema);

module.exports = Pet;
