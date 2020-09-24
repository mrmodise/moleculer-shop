"use strict";

module.exports = {
	name: "user",
	settings: {},
	dependencies: [],
	actions: {
		signup: {
			rest: {
				method: "GET",
				path: "/signup"
			},
			async handler() {
				return "Hello User";
			}
		}
	},
	events: {},
	methods: {},
	created() {},
	async started() {},
	async stopped() {}
};
