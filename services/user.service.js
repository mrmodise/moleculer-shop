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
		fields: ["username", "password", "lastName", "firstName", "email", "_id", "createdAt"],
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
		},
		login: {
			rest: {
				method: "POST /login",
				params: {
					username: {type: "string"},
					password: {type: "string"}
				}
			},
			handler: async function (ctx) {
				let username = ctx.params.username;
				let password = ctx.params.username;

				if (typeof username === "undefined" ||
					typeof password === "undefined" ||
					username.length === 0 ||
					password.length === 0) {
					throw new MoleculerClientError("Please enter username and password", 422);
				}

				const user = await this.adapter.findOne({username});

				this.logger.info(user);

				if (!user)
					throw new MoleculerClientError("Email or password is invalid!", 422, "", [{
						field: "email",
						message: "is not found"
					}]);

				const response = await bcrypt.compare(password, user.password);

				if (!response)
					throw new MoleculerClientError("Wrong password!", 422, "", [{ field: "email", message: "is not found" }]);

				return {token: "12345"};
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
