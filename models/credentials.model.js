"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CredentialsSchema = new Schema({
	username: {
		type: String,
		unique: true,
		lowercase: true,
		required: "Please enter the user name",
		trim: true
	},
	password: {
		type: String,
		required: "Please enter the password"
	}
});

module.exports = mongoose.model("Credentials", CredentialsSchema);
