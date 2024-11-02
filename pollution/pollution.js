/* MagicMirror²
 * Module: air pollution OpenWeatherMap
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("pollution", {
	// Default module config.
	defaults: {
		lat: config.lat,                   // your location latitude,
		lon: config.lon,                  // your location longitude,
		location: config.location,
		appId: config.apiKey,
		units: config.units,
		dayUpdateInterval: 10 * 60 * 1000,      // every 10 minutes
		nightUpdateInterval: 30 * 60 * 1000,    // every 30 minutes
		initialLoadDelay: 0,                    // 0 seconds delay
		oneLoader: true,                        // use onecall loader for API call
		random: false,
		appIds: {
			random : []
		},

		animationSpeed: config.animation,
		timeFormat: config.timeFormat,
		language: config.language,
		decimalSymbol: config.decimal,
		appendLocationNameToHeader: true,
		useLocationAsHeader: false,
		notificationAlert: true,
		
		calculateAqi: true,          // calculate AQI from pollutants concentration (not fully tested)
		showAqiTime: true,           // show last update time
		showAqiData: true,           // show AQI calculation pollutants, hidding last update
		showPollution: false,        // snow list of all pollutants, hidding AQI calculation of all pollutants
	},

	// Define required scripts.
	getScripts: function () {
		return [
				//	"moment.js"
				];
	},

	// Define required scripts.
	getStyles: function () {
		return ["pollution.css"
				//	, "fontawesome.css"
				];
	},

	// Define required translations.
	getTranslations: function () {
		return {
			en: "en.json",
			ro: "ro.json"
		};
	},

	// Define start sequence.
	start: function () {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(this.config.language);

		this.lastappIdIndex = -1;
		this.aqi = null;
		this.aqi_t = null;
		this.aqi_i = null;
		this.aqi_s = null;
		this.c_co = null;
		this.c_no = null;
		this.c_no2 = null;
		this.c_o3 = null;
		this.c_so2 = null;
		this.c_pm25 = null;
		this.c_pm10 = null;
		this.c_nh3 = null;

		this.loaded = false;
		if (!this.config.oneLoader) {
			this.AirUpdate();
			this.scheduleUpdate();
		}
	},

	// Override dom generator.
	getDom: function () {
		
		var wrapper = document.createElement("div");
		wrapper.className = "airpollution";

		if (!this.config.oneLoader) {
			if (this.config.appId === "") {
				wrapper.innerHTML = "Please set the correct openweather <i>appId</i> in the config for module: " + this.name + ".";
				wrapper.className = "dimmed light small";
				return wrapper;
			}
		}
		
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		/*
		Quality   Index     Sub-index   CAQI calculation from highest pollutant concentration in µg/m3

		                                O3          NO2         PM10        PM25         SO2         NH3        CO

		Good        1       0-25        0-60        0-50        0-25        0-15         0-50        0-200      0-5000
		Fair        2       25-50       60-120      50-100      25-50       15-30        50-100      200-400    5000-7500
		Moderate    3       50-75       120-180     100-200     50-90       30-55        100-350     400-800    7500-10000
		Poor        4       75-100      180-240     200-400     90-180      55-110       350-500     800-1600   10000-20000
		Very Poor   5       > 100       > 240       > 400       > 180       > 110        > 500       > 1600     > 20000

		Source: https://www.airqualitynow.eu/download/CITEAIR-Comparing_Urban_Air_Quality_across_Borders.pdf
		*/

		var aqi = document.createElement("div");
		aqi.className = "normal medium aqi bright";
		var aqi_q = null; var aqi_c = null; var aqi_b = null;
		if (this.config.calculateAqi) {
			if (this.aqi_i <= 25) {
				aqi_q = this.translate("Good");
				aqi_c = "lime";
			} else if (this.aqi_i > 25 && this.aqi_i <= 50) {
				aqi_q = this.translate("Fair");
				aqi_c = "yellow";
			} else if (this.aqi_i > 50 && this.aqi_i <= 75) {
				aqi_q = this.translate("Moderate");
				aqi_c = "orange";
			} else if (this.aqi_i > 75 && this.aqi_i <= 100) {
				aqi_q = this.translate("Poor");
				aqi_c = "orangered";
			} else if (this.aqi_i > 100) {
				aqi_q = this.translate("Unhealty");
				aqi_c = "red";
			}

			aqi.innerHTML = this.translate("Index") + ": <span class=" + aqi_c + ">" + aqi_q + "</span>"; //" (" + this.aqi_i + ")</span>";
			
		} else {
			if (this.aqi === 1) { 
				aqi_q = this.translate("Good");
				aqi_c = "lime";
			} else if (this.aqi === 2) { 
				aqi_q = this.translate("Fair");
				aqi_c = "yellow";
			} else if (this.aqi === 3) { 
				aqi_q = this.translate("Moderate");
				aqi_c = "orange";
			} else if (this.aqi === 4) { 
				aqi_q = this.translate("Poor");
				aqi_c = "orangered";
			} else if (this.aqi === 5) { 
				aqi_q = this.translate("Unhealty");
				aqi_c = "red";
			}
			aqi.innerHTML = this.translate("Index") + ": <span class=" + aqi_c + ">" + aqi_q + "</span>";

		}
		
		wrapper.appendChild(aqi);
			
		if (this.config.showAqiData && !this.config.showPollution) {
			var aqi_d = document.createElement("div");
			aqi_d.className = "normal small aqi_d";
			aqi_d.innerHTML = "PM<sub>10</sub> <span class=bright>" + Math.round(this.c_pm10/1.8)
					+ "</span>; PM<sub>2.5</sub> <span class=bright>" + Math.round(this.c_pm25/1.1)
					+ "</span>; O<sub>3</sub> <span class=bright>" + Math.round(this.c_o3/2.4*1.7)
					+ "</span>; NO<sub>2</sub> <span class=bright>" + Math.round(this.c_no2/4)
					+ "</span>; SO<sub>2</sub> <span class=bright>" + Math.round(this.c_so2/5*1.3)
					+ "</span>";
			wrapper.appendChild(aqi_d);

		} else if (this.config.showAqiTime) {
			var aqi_t = document.createElement("div");
			aqi_t.className = "shade small aqi_t";
			aqi_t.innerHTML = this.translate("Update") + this.aqi_t + ", " + this.config.location;
			wrapper.appendChild(aqi_t);
		}
			
		if (this.config.showPollution) {
			this.config.showAqiData = false;
			var spacer = document.createElement("br");
			wrapper.appendChild(spacer);

			var c_pm10 = document.createElement("div");
			c_pm10.className = "normal small c_pm10";
			c_pm10.innerHTML = "10μm particle (PM<sub>10</sub>) <span class=bright>" + this.c_pm10.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_pm10);

			var c_pm25 = document.createElement("div");
			c_pm25.className = "normal small c_pm25";
			c_pm25.innerHTML = "2.5μm particle (PM<sub>2.5</sub>) <span class=bright>" + this.c_pm25.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_pm25);
				
			var c_o3 = document.createElement("div");
			c_o3.className = "normal small c_o3";
			c_o3.innerHTML = "Ozone (O<sub>3</sub>) <span class=bright>" + this.c_o3.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_o3);

			var c_no2 = document.createElement("div");
			c_no2.className = "normal small c_no2";
			c_no2.innerHTML = "Nitrogen dioxide (NO<sub>2</sub>) <span class=bright>" + this.c_no2.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_no2);

			var c_no = document.createElement("div");
			c_no.className = "normal small c_no";
			c_no.innerHTML = "Nitrogen monoxide (NO) <span class=bright>" + this.c_no.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_no);

			var c_so2 = document.createElement("div");
			c_so2.className = "normal small c_so2";
			c_so2.innerHTML = "Sulphur dioxide (SO<sub>2</sub>) <span class=bright>" + this.c_so2.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_so2);

			var c_co = document.createElement("div");
			c_co.className = "normal small c_co";
			c_co.innerHTML = "Carbon monoxide (CO) <span class=bright>" + (this.c_co/1000).toFixed(2).replace(".", this.config.decimalSymbol) + " mg/m³</span>";
			wrapper.appendChild(c_co);

			var c_nh3 = document.createElement("div");
			c_nh3.className = "normal small c_nh3";
			c_nh3.innerHTML = "Ammonia (NH<sub>3</sub>) <span class=bright>" + this.c_nh3.toFixed(2).replace(".", this.config.decimalSymbol) + " µg/m³</span>";
			wrapper.appendChild(c_nh3);
		}

		return wrapper;
	},

	// Override getHeader method.
	getHeader: function () {
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			return this.config.location;
		}

		if (this.config.appendLocationNameToHeader) {
			return "<i class=\"fa fa-leaf lime\"></i>&nbsp; " + this.translate("Air_quality") + this.config.location;
		}

		return this.data.header ? this.data.header : "";
	},

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			var empty = "";
			this.hide(0, empty, { lockString: this.identifier });
		}

		if (notification === "AIR_RESPONSE" && this.config.oneLoader) {
			this.processAir(payload);
			Log.log("Air " + payload);
		}
	},

	randomIndex: function (appIds) {
		if (appIds.length === 1) {
			return 0;
		}
		var generate = function () {
			return Math.floor(Math.random() * appIds.length);
		};
		var appIdsIndex = generate();
		while (appIdsIndex === this.lastappIdsIndex) {
			appIdIndex = generate();
		}
		this.lastappIdsIndex = appIdsIndex;
		return appIdsIndex;
	},
	
	appIdsArray: function () {
		var appIds;
		appIds = this.config.appIds.random;
		return appIds;
	},
	
	randomappIds: function () {
		var appIds = this.appIdsArray();
		var index = this.randomIndex(appIds);
		return appIds[index];
	},

	/* updateAir (Air Quality Index)
	 * Requests new data from openweathermap.org.
	 * Calls processAir on succesfull response.
	 */
	AirUpdate: function () {
		if ((this.config.appId === "") && !this.config.random) {
			return Log.error("Air Pollution: appId not set!");
		}

		if (this.config.random) {
			url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + this.config.lat + "&lon=" + this.config.lon + "&appId=" + this.randomappIds();
		} else {
			url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + this.config.lat + "&lon=" + this.config.lon + "&appId=" + this.config.appId;
		}

		var self = this;
		var airRequest = new XMLHttpRequest();
		airRequest.open("GET", url, true);
		airRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processAir(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.DomUpdate(self.config.initialLoadDelay)
					return Log.error("Air Pollution: appId not available!");
				} else if (this.status === 429) {
					return Log.error("Air Pollution: Exceeding of requests!");
				} else {
					Log.error(self.name + ": Incorrect appId. Could not load Air Pollution.");
				}
			}
		};
		airRequest.send();
	},

	/* processAir(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - air quality information received form openweathermap.org.
	 */
	processAir: function (data) {
		if (!data || !data.list || typeof data.list[0] === "undefined") {
			return Log.error("NO AIR POLLUTION DATA");
		}
		
		if (data.list[0].hasOwnProperty("main")) {
			this.aqi = data.list[0].main.aqi;
		}

		if (data.list[0].hasOwnProperty("dt")) {
			this.aqi_t = moment(data.list[0].dt, "X").format("HH:mm");
		}

		if (data.list[0].hasOwnProperty("components")) {
			var aqi_p = data.list[0].components;
			this.c_co = aqi_p.co;
			this.c_no = aqi_p.no;
			this.c_no2 = aqi_p.no2;
			this.c_o3 = aqi_p.o3;
			this.c_so2 = aqi_p.so2;
			this.c_pm25 = aqi_p.pm2_5;
			this.c_pm10 = aqi_p.pm10;
			this.c_nh3 = aqi_p.nh3;
		}

		if (this.config.calculateAqi) {
			this.aqi_i = Math.max(
				Math.round(this.c_no2/4*1.3),   // mandatory
				Math.round(this.c_no/4)*1.3,    // optional
				Math.round(this.c_pm10/1.8),    // mandatory 
				Math.round(this.c_o3/2.4*1.7),  // mandatory
				Math.round(this.c_pm25/1.1),    // optional
				Math.round(this.c_so2/5),       // optional
				Math.round(this.c_nh3/16*0.9),  // optional
				Math.round(this.c_co/2000*0.9)  // optional
			).toFixed(0);

			if (this.aqi_i <= 25) {
				this.aqi_s = 1;
			} else if (this.aqi_i > 25 && this.aqi_i <= 50) {
				this.aqi_s = 2;
			} else if (this.aqi_i > 50 && this.aqi_i <= 75) {
				this.aqi_s = 3;
			} else if (this.aqi_i > 75 && this.aqi_i <= 100) {
				this.aqi_s = 4;
			} else if (this.aqi_i > 100) {
				this.aqi_s = 5;
			}

			this.sendNotification("AIRQUALITY_INDEX", { index: "AQI_" + this.aqi_s });
			Log.log("AIRQUALITY_INDEX", { index: "AQI_" + this.aqi_s + " (" + this.aqi_i + ")" });
			if ((this.aqi_i > 100) && (this.config.notificationAlert)) {
				this.sendNotification("DAY_NOTIFICATION", {imageFA: "leaf red", title: this.translate("Index"), message: "Aerul este " + this.translate("Unhealty") + " (" + this.aqi_i + ")", timer: 10000000});
			}
		} else {
			this.sendNotification("AIRQUALITY_INDEX", { index: "AQI_" + this.aqi });
			Log.log("AIRQUALITY_INDEX", { index: "AQI_" + this.aqi });
			if ((this.aqi > 4) && (this.config.notificationAlert)) {
				this.sendNotification("DAY_NOTIFICATION", {imageFA: "leaf red", title: this.translate("Index"), message: "Aerul este " + this.translate("Unhealty") + " (" + this.aqi + ")", timer: 10000000});
			}
		}

		this.DomUpdate(this.config.initialLoadDelay)
	},

	DomUpdate: function () {
		if (!this.loaded) { 
			this.loaded = true;
			var self = this;
			setTimeout(function () {
				var empty = "";
				self.show(self.config.animationSpeed, empty, { lockString: self.identifier });
			}, 2000);
		}
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 */
	scheduleUpdate: function () {
		var now = moment().format("HH:mm:ss");
		var updateInterval = null;

		if (now >= "00:00:00" && now < "07:00:00") {
			updateInterval = this.config.nightUpdateInterval;
		} else {
			updateInterval = this.config.dayUpdateInterval;
		}

		var self = this;
		setInterval(function () {
			self.AirUpdate();
		}, updateInterval);
	}
});