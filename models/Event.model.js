const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'Pet',
		required: true,
	},

	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Pet',
			required: true,
		},
	],

	activity: {
		type: String,
		required: true,
	},

	description: {
		type: String,
		required: true,
	},

	location: {
		type: {
			type: String,
		},
		coordinates: [Number],
	},

	date: {
		type: Date,
		required: true,
	},
});

eventSchema.index({ location: '2dsphere' });

const Event = model('Event', eventSchema);

module.exports = Event;
