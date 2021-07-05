const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
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
});

const Message = model('Message', messageSchema);

module.exports = Message;
