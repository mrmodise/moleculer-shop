"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");
const bcrypt = require("bcryptjs");

module.exports = {
	name: "user",
	settings: {},
	mixins: [DbService("users"), CacheCleanerMixin(["cache.clean.users"])],
	dependencies: [],
	actions: {
		signup: {
			rest: {
				method: "POST /signup",
				params: {
					user: { type: "object" }
				}
			},
			async handler(ctx) {
				let entity = ctx.params.user;

				await this.validateUserEntity(entity);

				await this.validateEntity(entity);

				entity.createdAt = new Date();
				entity.password = bcrypt.hashSync(entity.password, 10);

				const doc = await this.adapter.insert(entity);

				return this.transformDocuments(ctx, {}, doc);
			}
		}
	},
	events: {},
	methods: {
		async validateUserEntity(entity) {

			await this.validateMandatoryFields(entity);

			if (entity.username) {
				const found = await this.adapter.findOne({ username: entity.username });

				this.broker.logger.info("User found: ", found);

				if (found) throw new MoleculerClientError("Username is exist!", 422, "", [{ field: "username", message: "exists" }]);
			}

			if (entity.email) {
				const found = await this.adapter.findOne({ email: entity.email });
				if (found)
					throw new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "exists" }]);
			}
		},
		async validateMandatoryFields(entity) {
			if (typeof entity.firstName === "undefined" || entity.firstName.length === 0) {
				throw new MoleculerClientError("Missing mandatory field", 422, [{ field: "firstName", message: "is mandatory" }]);
			}

			if (typeof entity.lastName === "undefined" || entity.lastName.length === 0) {
				throw new MoleculerClientError("Missing mandatory field", 422, [{ field: "lastName", message: "is mandatory" }]);
			}

			if (typeof entity.email === "undefined" || entity.email.length === 0) {
				throw new MoleculerClientError("Missing mandatory field", 422, [{ field: "email", message: "is mandatory" }]);
			}

			if (typeof entity.username === "undefined" || entity.username.length === 0) {
				throw new MoleculerClientError("Missing mandatory field", 422, [{ field: "username", message: "is mandatory" }]);
			}

			if (typeof entity.password === "undefined" || entity.password.length === 0) {
				throw new MoleculerClientError("Missing mandatory field", 422, [{ field: "password", message: "is mandatory" }]);
			}

			if (entity.email) {
				const emailReg = /\S+@\S+\.\S+/;
				if (!emailReg.test(entity.email)) {
					throw new MoleculerClientError("Invalid email", 422, [{ field: "email", message: "is incorrect" }]);
				}
			}
		}
	},
	created() {},
	async started() {},
	async stopped() {}
};
