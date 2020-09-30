"use strict";

const {MoleculerClientError} = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");
const Credentials = require("../models/credentials.model");

module.exports = {
	name: "credentials",
	settings: {
		fields: ["username", "password", "lastName", "firstName", "email", "_id", "createdAt"],
	},
	model: Credentials,
	mixins: [DbService("credentials"), CacheCleanerMixin(["cache.clean.users"])],
	dependencies: [],
	actions: {
		login: {
			rest: {
				method: "POST /credentials"
			},
			handler: async function (ctx) {
				this.logger.info(ctx);
				return ctx;
			}
		}
	},
	events: {},
	methods: {
	},
	created() {
	},
	async started() {
	},
	async stopped() {
	}
};
