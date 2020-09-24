"use strict";

const {MoleculerClientError} = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const CacheCleanerMixin = require("../mixins/cache.cleaner.mixin");
const bcrypt = require("bcryptjs");

module.exports = {
	name: "user",
	settings: {
		entityValidator: {
			username: {type: "string", min: 2},
			password: {type: "string", min: 6},
			email: {type: "email"},
			firstName: {type: "string", min: 2},
			lastName: {type: "string", min: 2},
		},
		fields: ["username", "password", "lastName", "firstName", "email", "_id"]
	},
	mixins: [DbService("users"), CacheCleanerMixin(["cache.clean.users"])],
	dependencies: [],
	actions: {
		signup: {
			rest: {
				method: "POST /signup",
				params: {
					user: {
						type: "object", props: {
							firstName: {type: "string"},
							lastName: {type: "string"},
							username: {type: "string"},
							password: {type: "string"},
							email: {type: "email"},
						}
					}
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
			if (entity.username) {
				const found = await this.adapter.findOne({username: entity.username});

				this.broker.logger.info("User found: ", found);

				if (found) throw new MoleculerClientError("Username is exist!", 422, "", [{
					field: "username",
					message: "exists"
				}]);
			}

			if (entity.email) {
				const found = await this.adapter.findOne({email: entity.email});
				if (found)
					throw new MoleculerClientError("Email is exist!", 422, "", [{field: "email", message: "exists"}]);
			}
		}
	},
	created() {
	},
	async started() {
	},
	async stopped() {
	}
};
