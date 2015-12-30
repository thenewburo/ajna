// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Deck', new Schema({
	name: { type: String, required: true },
	cards: [],
	tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	description: { type: String },
	price: { type: Number },
	isOnline: { type: Boolean, required: true },
	hasBeenOnline: { type: Boolean, required: true }
}));