/* MagicMirror²
 * Module: Moon phases
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */

Module.register("phases",{
	// Default module config.
	defaults: {
		updateInterval: 60 * 60 * 1000,
		animationSpeed: config.animation,
		moonPhasesNightOnly: false,
		nightStart: "19",
		nightEnd: "06",
		width: "70",
		height: "70"
	},

	start: function() {
		Log.info('Starting module: ' + this.name);
		var self = this;
		setInterval(function () {
			self.updateDom(self.config.animationSpeed);
		}, this.config.updateInterval);
	},

	getScripts: function () {
		return [];
	},

	getStyles: function () {
		return ["phases.css"];
	},

	getTranslations: function () {
		return {
		 en: "en.json",
		 ro: "ro.json"
		};
	},

	notificationReceived: function (notification, payload, sender) {
		if (notification === "MIDNIGHT_NOTIFICATION") {
			this.updateDom();
		}
	},

	// Override dom generator.
	getDom: function() {
		var date = new Date();
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		var hour = date.getHours();

		if (month < 3) {
			year--;
			month += 12;
		}

		// Calculate Julian Day (jd) 
		var a = parseInt(year / 100);
		var b = parseInt(a / 4);
		var c = 2 - a + b;
		var e = parseInt(365.25 * (year + 4716));
		var f = parseInt(30.6001 * (month + 1));
		var jd = c + day + e + f - 1524.5;

		var daysSinceNew = jd - 2451549.5;
		var newMoons = daysSinceNew / 29.5306;
		var newMoonsFract = newMoons - parseInt(newMoons);
		var phase = newMoonsFract * 29.5306;
		// Log.info(phase);

		if (phase > 29.5) {
			phase = 0;
		}

		switch(true){
			case phase < 0.5:
				moonImage = 'modules/phases/pix/wanecres2.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 1:
				moonImage = 'modules/phases/pix/wanecres1.png';
				moonPhase = "new_moon";
				break;
			case phase < 1.5:
				moonImage = 'modules/phases/pix/newmoon.png'; // new moon
				moonPhase = "new_moon";
				break;
			case phase < 2:
				moonImage = 'modules/phases/pix/waxcres1.png';
				moonPhase = "new_moon";
				break;
			case phase < 2.5:
				moonImage = 'modules/phases/pix/waxcres5.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 3:
				moonImage = 'modules/phases/pix/waxcres6.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 3.5:
				moonImage = 'modules/phases/pix/waxcres11.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 4:
				moonImage = 'modules/phases/pix/waxcres17.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 4.5:
				moonImage = 'modules/phases/pix/waxcres23.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 5:
				moonImage = 'modules/phases/pix/waxcres24.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 5.5:
				moonImage = 'modules/phases/pix/waxcres26.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 6:
				moonImage = 'modules/phases/pix/waxcres32.png'; // waxing crescent
				moonPhase = "waxing_crescent";
				break;
			case phase < 6.5:
				moonImage = 'modules/phases/pix/waxcres33.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 7:
				moonImage = 'modules/phases/pix/waxcres35.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 7.5:
				moonImage = 'modules/phases/pix/waxcres41.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 8:
				moonImage = 'modules/phases/pix/waxcres42.png';
				moonPhase = "waxing_crescent";
				break;
			case phase < 8.5:
				moonImage = 'modules/phases/pix/waxcres46.png';
				moonPhase = "first_quarter";
				break;
			case phase < 9:
				moonImage = 'modules/phases/pix/waxcres50.png'; // first quarter
				moonPhase = "first_quarter";
				break;
			case phase < 9.5:
				moonImage = 'modules/phases/pix/waxgib52.png';
				moonPhase = "first_quarter";
				break;
			case phase < 10:
				moonImage = 'modules/phases/pix/waxgib56.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 10.5:
				moonImage = 'modules/phases/pix/waxgib62.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 11:
				moonImage = 'modules/phases/pix/waxgib69.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 11.5:
				moonImage = 'modules/phases/pix/waxgib77.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 12:
				moonImage = 'modules/phases/pix/waxgib82.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 12.5:
				moonImage = 'modules/phases/pix/waxgib86.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 13:
				moonImage = 'modules/phases/pix/waxgib87.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 13.5:
				moonImage = 'modules/phases/pix/waxgib90.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 14:
				moonImage = 'modules/phases/pix/waxgib93.png'; // waxing gibbous
				moonPhase = "waxing_gibbous";
				break;
			case phase < 14.5:
				moonImage = 'modules/phases/pix/waxgib96.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 15:
				moonImage = 'modules/phases/pix/waxgib98.png';
				moonPhase = "waxing_gibbous";
				break;
			case phase < 15.5:
				moonImage = 'modules/phases/pix/waxgib99.png';
				moonPhase = "full_moon";
				break;
			case phase < 16:
				moonImage = 'modules/phases/pix/fullmoon.png'; // full moon
				moonPhase = "full_moon";
				break;
			case phase < 16.5:
				moonImage = 'modules/phases/pix/wanegib98.png';
				moonPhase = "full_moon";
				break;
			case phase < 17:
				moonImage = 'modules/phases/pix/wanegib96.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 17.5:
				moonImage = 'modules/phases/pix/wanegib93.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 18:
				moonImage = 'modules/phases/pix/wanegib92.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 18.5:
				moonImage = 'modules/phases/pix/wanegib89.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 19:
				moonImage = 'modules/phases/pix/wanegib86.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 19.5:
				moonImage = 'modules/phases/pix/wanegib85.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 20:
				moonImage = 'modules/phases/pix/wanegib81.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 20.5:
				moonImage = 'modules/phases/pix/wanegib77.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 21:
				moonImage = 'modules/phases/pix/wanegib75.png'; // waning gibbous
				moonPhase = "waning_gibbous";
				break;
			case phase < 21.5:
				moonImage = 'modules/phases/pix/wanegib71.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 22:
				moonImage = 'modules/phases/pix/wanegib67.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 22.5:
				moonImage = 'modules/phases/pix/wanegib60.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 23:
				moonImage = 'modules/phases/pix/wanegib56.png';
				moonPhase = "waning_gibbous";
				break;
			case phase < 23.5:
				moonImage = 'modules/phases/pix/wanegib54.png';
				moonPhase = "third_quarter";
				break;
			case phase < 24:
				moonImage = 'modules/phases/pix/wanecres49.png'; // last quarter
				moonPhase = "third_quarter";
				break;
			case phase < 24.5:
				moonImage = 'modules/phases/pix/wanecres45.png';
				moonPhase = "third_quarter";
				break;
			case phase < 25:
				moonImage = 'modules/phases/pix/wanecres38.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 25.5:
				moonImage = 'modules/phases/pix/wanecres28.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 26:
				moonImage = 'modules/phases/pix/wanecres25.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 26.5:
				moonImage = 'modules/phases/pix/wanecres19.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 27:
				moonImage = 'modules/phases/pix/wanecres17.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 27.5:
				moonImage = 'modules/phases/pix/wanecres15.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 28:
				moonImage = 'modules/phases/pix/wanecres12.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 28.5:
				moonImage = 'modules/phases/pix/wanecres10.png'; // waning crescent
				moonPhase = "waning_crescent";
				break;
			case phase < 29:
				moonImage = 'modules/phases/pix/wanecres8.png';
				moonPhase = "waning_crescent";
				break;
			case phase < 29.5:
				moonImage = 'modules/phases/pix/wanecres6.png';
				moonPhase = "waning_crescent";
				break;
		}

		if (this.config.moonPhasesNightOnly){
			if (hour >= this.config.nightStart || hour < this.config.nightEnd) {
				this.sendNotification("MOON_PHASE", { phase: moonPhase });
			}
		} else {
			this.sendNotification("MOON_PHASE", { phase: moonPhase }); 
		}

		// Create and return the necessary HTML
		var wrapper = document.createElement("div");
		wrapper.style.height = "calc(" + this.config.height + "px + 5px";

		var img = document.createElement("img");
			img.style.height = this.config.height + "px";
			img.style.widht = this.config.width + "px";
			img.style.float = "right";
			img.style.paddingRight = "10px";
			img.src = moonImage;
	 
		wrapper.appendChild(img);

		var txt = document.createElement("span");
			txt.className = "medium bright";
			txt.style.float = "left";
			txt.innerHTML = "<header><i class=\"fa fa-moon\"></i> " + this.translate("Moon_Phases") + "</header>" + this.translate(moonPhase);

		wrapper.appendChild(txt);

		return wrapper;
	}
});