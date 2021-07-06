const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'Pet',
	},

	participants: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Pet',
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

	creationDate: {
		type: Date,
		required: true,
	},

	eventDate: {
		type: Date,
		required: true,
	},
});

eventSchema.index({ location: '2dsphere' });

const Event = model('Event', eventSchema);

module.exports = Event;
