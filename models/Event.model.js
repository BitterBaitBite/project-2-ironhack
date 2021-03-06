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
		required: [true, 'You must especify a name for the activity'],
	},

	description: {
		type: String,
		required: [true, 'You must specify a description for the event'],
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
