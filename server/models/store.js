// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Store', new Schema({
	deckId: { type: Schema.Types.ObjectId, ref: 'Deck' },
	deckName: { type: String, required: true },
	deck: {},
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	authorName: { type: String, required: true },
	nbDownloads: { type: Number, default: 0, required: true },
	description: { type: String, default: "" },
	price: { type: Number, default: 0 },
	dateOfSale: { type: Date, default: Date.now, required: true },
	isOnline: { type: Boolean, default: true, required: true }
}));