const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
	origin: {
		type: Schema.Types.ObjectId,
		ref: 'Pet',
		required: true,
	},

	destinatary: {
		type: Schema.Types.ObjectId,
		ref: 'Pet',
		required: true,
	},

	body: {
		type: String,
		required: true,
	},

	date: {
		type: Date,
		required: true,
	},

	rating: {
		type: Number,
		required: true,
		max: 10,
		min: 0,
	},
});

const Review = model('Review', reviewSchema);

module.exports = Review;
