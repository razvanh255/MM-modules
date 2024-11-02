/* MagicMirror²
 * Module: lifecounter
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("lifecounter", {

	defaults: {
		birthday: "",               // 1970-01-01 00:00:00
		counter: "",                // seconds, minutes, hours, days
		before: "",                 // your text before
		after: "",                  // your text after
		cssclass: "small",
		decimalSymbol: ".",
	},

	getScripts: function () {
		return [];
	},
	
	start: function () {
		Log.info("Starting module: " + this.name);

		this.updateInterval = 1000;

		var self = this;
		setInterval(function() {
			self.updateDom();
		}, this.updateInterval);
	},

	notificationReceived: function (notification, payload, sender) {
		if (notification === "MIDNIGHT_NOTIFICATION") {
			this.updateDom();
		}
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		var cclass = this.config.cssclass;
		var calDate = (new Date() - new Date(this.config.birthday));

		if (this.config.counter == "seconds") {
			var yourtime = Math.floor(calDate / 1000);

			if (yourtime > 999395200 || yourtime < 1000086400) { // highlited one week before and one day after
				wrapper.className = "bright " + cclass;
			} else {
				wrapper.className = "normal " + cclass;
			}

		} else if (this.config.counter == "minutes") {
			var yourtime = Math.floor(calDate / (1000*60)+1);

			if (yourtime > 60) {
				wrapper.className = "bright " + cclass;
			} else {
				wrapper.className = "normal " + cclass;
			}

			this.updateInterval = 60000;

		} else if (this.config.counter == "hours") {
			var yourtime = Math.floor(calDate / (1000*60*60)+1);

			if (yourtime > 24) {
				wrapper.className = "bright " + cclass;
			} else {
				wrapper.className = "normal " + cclass;
			}

			this.updateInterval = 3600000;

		} else if (this.config.counter == "days") {
			var yourtime = Math.floor(calDate / (1000*60*60*24)+1);

			if (yourtime > 7) {
				wrapper.className = "bright " + cclass;
			} else {
				wrapper.className = "normal " + cclass;
			}

			this.updateInterval = 86400000;
		}

		var lifecounter = this.config.before + " " + Math.abs(yourtime) + " " + this.config.after;

		if (this.config.decimalSymbol == ".") {
			wrapper.innerHTML = lifecounter.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		} else {
			wrapper.innerHTML = lifecounter.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		return wrapper;
	}
});