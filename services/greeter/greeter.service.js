"use strict";
const axios = require("axios");

module.exports = {
	name: "greeter",
	settings: {},
	dependencies: [],
	actions: {
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler() {
				return "Hello Moleculer";
			}
		},
		welcome: {
			rest: "/welcome",
			params: {
				name: "string"
			},
			async handler(ctx) {
				return `Welcome, ${ctx.params.name}`;
			}
		},
		swapi: {
			rest: {
				method: "GET",
				path: "/swapi",
			},
			params: {
				personId: "string"
			},
			async handler(ctx) {
				this.logger.info(`Request param is: ${ctx.params.personId}`);
				const response = await axios.get(`https://swapi.dev/api/people/${ctx.params.personId}`);
				this.logger.info(response["data"]);
				return response["data"];
			}
		}
	},
	events: {},
	methods: {},
	created() {

	},
	async started() {

	},
	async stopped() {

	}
};
