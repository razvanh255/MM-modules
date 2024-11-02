/* MagicMirror²
 * Module: Onecall OpenWeatherMap
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("onecall", {
	// Default module config.
	defaults: {
		// optional settings only if oneLoader is not used
		lat: config.lat,             		 // your location latitude,
		lon: config.lon,               		 // your location longitude,
		appId: config.apiKey,
		dayUpdateInterval: 10 * 60 * 1000,   // every 10 minutes
		nightUpdateInterval: 30 * 60 * 1000, // every 30 minutes
		random: true,
		appIds: {
			random: [

					]
		},

		// important settings
		endpointType: "onecall",             // "onecall", "current", "hourly" or "daily"
		oneLoader: false,                    // very important for just one API call
		pollutionOneLoader: true,            // very important for Air Pollution API call

		// general settings
		location: config.location,
		units: config.units,
		initialLoadDelay: 2000,              // 0 seconds delay
		animationSpeed: config.animation,
		timeFormat: config.timeFormat,
		language: config.language,
		decimalSymbol: config.decimal,
		degreeLabel: true,
		appendLocationNameToHeader: false,
		useLocationAsHeader: false,
		tempClass: "xlarge",
		tableClass: "small",
		showRainAmount: true,                // snow show only in winter months
		onlyTemp: false,
		plusForecast: false,
		hideTemp: false,
		roundTemp: false,                    // error if is true
		addExtra: true,
		showTopDescription: false,

		// current settings
		showWindDirection: true,
		showWindDirectionAsArrow: false,     // not realy working
		showIndoorTemp_Hum: false,
		useBeaufort: false,
		useKMPHwind: true,
		showFeelsLike: true,
		realFeelsLike: true,                 // show real not calculated
		showVisibility: true,
		showHumidity: true,
		showPressure: true,
		showDew: true,                       // dew point
		showUvi: true,                       // UV index
		showAlerts: true,
		notificationAlert: true,             // "full" for detailed alert notification
		defaultIcons: false,                 // with or without default icons

		// hourly & daily settings
		flexDayForecast: true,               // show Flex Daily Forecast, set maxNumberOfDays to 3 or 6
		flexHourForecast: false,             // show Flex Hourly Forecast, set maxNumberOfDays to 3 to 48
		maxNumberOfDays: 6,
		maxNumberOfHours: 6,
		fadeDaily: false,
		fadeHourly: false,
		fadePoint: 0.25,                     // Start on 1/4th of the list.
		colored: true,
		extraHourly: true,                  // snow extra hourly humidity, dew point, pressure, real feel and rain or snow,
		extraDaily: false,                    // snow extra daily humidity, dew point, pressure, real feel and rain or snow,
		daily: "dddd",                       // "ddd" for short day name or "dddd" for full day name
		hourly: "HH.mm",                     // "HH [h]" for hourly forecast or "HH.mm" for hour and minutes

		iconTable: {
			"01d": "day-sunny",
			"02d": "day-cloudy",
			"03d": "cloudy",
			"04d": "day-cloudy-windy",
			"09d": "day-showers",
			"10d": "day-rain",
			"11d": "day-thunderstorm",
			"13d": "day-snow",
			"50d": "day-fog",
			"01n": "night-clear",
			"02n": "night-alt-cloudy",
			"03n": "night-cloudy",
			"04n": "night-alt-cloudy",
			"09n": "night-alt-showers",
			"10n": "night-alt-rain",
			"11n": "night-alt-thunderstorm",
			"13n": "night-alt-snow",
			"50n": "night-alt-cloudy-windy"
		}
	},

	// Define required scripts.
	getScripts: function () {
		return [
				//	"moment.js"
				];
	},

	// Define required scripts.
	getStyles: function () {
		return ["onecall.css"
				//	, "fontawesome.css", "weather-icons-wind.css"
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
		this.lastappIdsIndex = -1;

		if (!this.config.oneLoader) {
			this.OneUpdate();
			this.scheduleUpdate();
		}

		// Set locale.
		moment.locale(this.config.language);
		this.now = moment().format("HH:mm");
		this.date = moment().format("DD.MM.YYYY");

		this.windSpeed = null;
		this.windDirection = null;
		this.windDeg = null;
		this.temperature = "0";
		this.weatherType = null;
		this.feelsLike = null;
		this.dew = null;
		this.uvi = null;
		this.desc = null;
		this.rain = null;
		this.snow = null;
		this.pressure = null;
		this.visibility = null;
		this.start = null;
		this.end = null;
		this.startDate = null;
		this.endDate = null;
		this.alert = null;
		this.indoorTemperature = null;
		this.indoorHumidity = null;
		this.loaded = false;

		if (this.config.pollutionOneLoader) {
			var self = this;
			setTimeout(function () {
				self.AirUpdate();
			}, 2000);
		}
	},

	// add extra information of current weather
	// windDirection, pressure, visibility and humidity
	addExtraInfoWeather: function (wrapper) {
		var small = document.createElement("div");
		small.className = "normal medium currentweather";

		var windIcon = document.createElement("span");
		windIcon.className = "wi wi-strong-wind cyan";
		small.appendChild(windIcon);

		if (this.config.showWindDirection) {
			var windDirection = document.createElement("span");
			if (this.config.showWindDirectionAsArrow) {
				if (this.windDeg !== null) {
				    windDirection.className = "wind";
					windDirection.innerHTML = " <i class=\"wi wi-direction-down\" style=\"transform:rotate(" + this.windDeg + "deg);\"></i>";
				}
			} else {
			    windDirection.className = "wind subs";
				windDirection.innerHTML = " " + this.translate(this.windDirection);
			}
			small.appendChild(windDirection);
		}

		var windSpeed = document.createElement("span");
		if (this.windSpeed > 50 && this.windSpeed < 75) {
			windSpeed.className = "lightblue";
		} else if (this.windSpeed > 75 && this.windSpeed < 100) {
			windSpeed.className = "yellow";
		} else if (this.windSpeed > 100) {
			windSpeed.className = "coral";
		} else windSpeed.className = " ";
		windSpeed.innerHTML = " " + this.windSpeed;
		small.appendChild(windSpeed);

		var windSpeedUnit = document.createElement("span");
		windSpeedUnit.className = "subs";
		if (this.config.units === "metric" || this.config.units === "default") {
			windSpeedUnit.innerHTML = " km/h ";
		} else if (this.config.units === "imperial") {
			windSpeedUnit.innerHTML = " mph ";
		}
		small.appendChild(windSpeedUnit);

		// pressure.
		if (this.config.showPressure) {
			var pressure = document.createElement("span");
			var atpressure = Math.round(this.pressure * 750.062 / 1000);
				if (atpressure < 745) {
					pressure.className = "pressure lightblue";
				} else if (atpressure > 775) {
					pressure.className = "pressure orange";
				} else pressure.className = "pressure greenyellow";
			pressure.innerHTML = " <i class=\"wi wi-barometer gold\"></i>" + Math.round(this.pressure * 750.062 / 1000);
			small.appendChild(pressure);

			var pressureSub = document.createElement("span");
			pressureSub.className = "subs";
			pressureSub.innerHTML = " Hg ";
			small.appendChild(pressureSub);
		}

		// visibility.
		if (this.config.showVisibility) {
			var visibility = document.createElement("span");
			visibility.className = "visibility";
			visibility.innerHTML = " <i class=\"fa fa-binoculars violet\"></i>" + this.visibility / 1000;
			small.appendChild(visibility);

			var visibilityUnit = document.createElement("span");
			visibilityUnit.className = "subs";
			if (this.config.units === "metric" || this.config.units === "default") {
				visibilityUnit.innerHTML = " km ";
			} else if (this.config.units === "imperial") {
				visibilityUnit.innerHTML = " mi ";
			}
			small.appendChild(visibilityUnit);
		}

		// humidity.
		if (this.config.showHumidity) {
			var humidity = document.createElement("span");
			if (this.humidity < 30) {
				humidity.className = "lightblue";
			} else if (this.humidity > 50 && this.humidity < 80) {
				humidity.className = "yellow";
			} else if (this.humidity > 80) {
				humidity.className = "coral";
			} else humidity.className = " ";
			humidity.innerHTML = " <i class=\"wi wi-humidity skyblue\"></i>" + this.humidity + "%";
			small.appendChild(humidity);
		}

		wrapper.appendChild(small);
	},

	// Override dom generator.
	getDom: function () {
		if (!this.config.oneLoader) {
			if (this.config.appId === "" && this.config.random === false) {
				var wrapper = document.createElement("div");
				wrapper.innerHTML = "Please set the correct openweather <i>appId</i> in the config for module: " + this.name + ".";
				wrapper.className = "dimmed light small";
				return wrapper;
			}
		}
	
		if (!this.config.colored) {
		    var onegray = Array.from(document.querySelectorAll(".onecall"));
		    onegray.forEach(function(element) {return element.style.filter = "grayscale(1)";});
		}

		var wrapper = document.createElement("div");
		wrapper.className = "current weather normal";
		
		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.config.endpointType === "current" || this.config.endpointType === "onecall") {

			if (this.config.addExtra !== false) {
				this.addExtraInfoWeather(wrapper);
			}

			if (this.config.showTopDescription) {
				var description = document.createElement("div");
				if (this.alert === null || !(this.now >= this.start && this.now < this.end) || !(this.date >= this.startDate && this.date <= this.endDate)) {
					description.className = "bright current-description slarge details";
					description.innerHTML = this.desc;
				} else if (this.alert !== null && (this.now >= this.start && this.now < this.end) && (this.date >= this.startDate && this.date <= this.endDate)) {
					description.className = "orangered current-description medium details";
					description.innerHTML = "<i class=\"fas fa-wind\"></i> " + this.translate("ALERTS") + this.start + "-" + this.end;
				} 
				wrapper.appendChild(description);
			}

			var large = document.createElement("div");
			large.className = "light";

			var degreeLabel = "";
			if (this.config.units === "metric" || this.config.units === "imperial") {
				degreeLabel;
			}
			if (this.config.degreeLabel) {
				switch (this.config.units) {
					case "metric":
						degreeLabel += "C";
						break;
					case "imperial":
						degreeLabel += "F";
						break;
					case "default":
						degreeLabel += "K";
						break;
				}
			}

			if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
				this.config.decimalSymbol = ".";
			}

			if (this.config.hideTemp === false) {
				var iconwrapper = document.createElement("span");
				if (this.config.defaultIcons) {
					iconwrapper.className = "current-weather mlarge";
					iconwrapper.style.transform = "translate(0) !important";
				} else {
					iconwrapper.className = "currentweather";
				}
				large.appendChild(iconwrapper);

				var weatherIcon = document.createElement("span");
				weatherIcon.className = "wi weathericon wi-" + this.weatherType;
				iconwrapper.appendChild(weatherIcon);

				var tempwrapper = document.createElement("span");
				tempwrapper.className = "currentweather";
				large.appendChild(tempwrapper);

				var temperature = document.createElement("span");
				temperature.className = "bright light " + this.config.tempClass;
				temperature.innerHTML = " " + this.temperature.replace(".", this.config.decimalSymbol) + "&deg;<span class=\"deg\">" + degreeLabel + "</span>";
				tempwrapper.appendChild(temperature);
			}

			if (this.config.showIndoorTemp_Hum) {
				var indoorSpace = document.createElement("br");
				large.appendChild(indoorSpace);

				var indoorIcon = document.createElement("span");
				indoorIcon.className = "medium fa fa-home gold";
				large.appendChild(indoorIcon);

				var indoorTemperature = document.createElement("span");
				indoorTemperature.className = "medium bright";
				indoorTemperature.innerHTML = "&nbsp; <i class=\"fa fa-thermometer orange\"></i> " + this.indoorTemperature.replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel;
				large.appendChild(indoorTemperature);

				var indoorHumidity = document.createElement("span");
				indoorHumidity.className = "medium bright";
				indoorHumidity.innerHTML = " <i class=\"fa fa-tint skyblue\"></i> " + this.indoorHumidity + "%";
				large.appendChild(indoorHumidity);
			}

			wrapper.appendChild(large);

			if (this.config.onlyTemp === false) {
				var small = document.createElement("div");
				small.className = "normal medium details";

				// only for metric.
				if (this.config.showFeelsLike) {
					var feelsLike = document.createElement("div");
					if (this.config.units == "metric") {
						if (this.feelsLike == -0) {this.feelsLike = 0}
						if (this.feelsLike >= 45) {
							feelsLike.className = "real redrf";
						} else if (this.feelsLike >= 40 && this.feelsLike < 45) {
							feelsLike.className = "real orangered";
						} else if (this.feelsLike >= 35 && this.feelsLike < 40) {
							feelsLike.className = "real tomato";
						} else if (this.feelsLike >= 30 && this.feelsLike < 35) {
							feelsLike.className = "real coral";
						} else if (this.feelsLike >= 25 && this.feelsLike < 30) {
							feelsLike.className = "real darkorange";
						} else if (this.feelsLike >= 20 && this.feelsLike < 25) {
							feelsLike.className = "real gold";
						} else if (this.feelsLike >= 15 && this.feelsLike < 20) {
							feelsLike.className = "real yellow";
						} else if (this.feelsLike >= 10 && this.feelsLike < 15) {
							feelsLike.className = "real greenyellow";
						} else if (this.feelsLike >= 5 && this.feelsLike < 10) {
							feelsLike.className = "real chartreuse";
						} else if (this.feelsLike >= 0 && this.feelsLike < 5) {
							feelsLike.className = "real lawngreen";
						} else if (this.feelsLike >= -5 && this.feelsLike < 0) {
							feelsLike.className = "real lime";
						} else if (this.feelsLike >= -10 && this.feelsLike < -5) {
							feelsLike.className = "real powderblue";
						} else if (this.feelsLike >= -15 && this.feelsLike < -10) {
							feelsLike.className = "real lightblue";
						} else if (this.feelsLike >= -20 && this.feelsLike < -15) {
							feelsLike.className = "real skyblue";
						} else if (this.feelsLike >= -25 && this.feelsLike < -20) {
							feelsLike.className = "real lightskyblue";
						} else if (this.feelsLike >= -30 && this.feelsLike < -25) {
							feelsLike.className = "real deepskyblue";
						} else if (this.feelsLike < 30) {
							feelsLike.className = "real dodgerblue";
						}
					} else feelsLike.className = "dimmed real";

					feelsLike.innerHTML = this.translate("Real feel: ") + "<i class=\"wi wi-thermometer yellow xmedium\"></i> " + this.feelsLike + "&deg;" + degreeLabel;
					small.appendChild(feelsLike);
				}

				// dew point.
				if (this.config.showDew) {
					var dew = document.createElement("span"); 
					dew.className = "dew xmedium cyan";
					dew.innerHTML = this.translate("Dew Point: ") + "<i class=\"wi wi-raindrops lightgreen\"></i> " + this.dew.toFixed(1).replace(".", this.config.decimalSymbol) + "&deg;" + degreeLabel + " &nbsp; ";
					small.appendChild(dew);
				}

				// uv index.
				if (this.config.showUvi) {
					var uvi = document.createElement("span");
					uvi.className = "uvi xmedium";
					uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-hot gold\"></i> " + this.uvi.toFixed(1).replace(".", this.config.decimalSymbol);
					if (this.uvi < 0.1) {
						uvi.className = uvi.className + " lightgreen";
						uvi.innerHTML = this.translate("UVI") + "<i class=\"wi wi-stars\"></i> 0";
					} else if (this.uvi > 0 && this.uvi < 3) {
						uvi.className = uvi.className + " lime";
					} else if (this.uvi >= 3 && this.uvi < 6) {
						uvi.className = uvi.className + " yellow";
					} else if (this.uvi >= 6 && this.uvi < 8) {
						uvi.className = uvi.className + " orange";
					} else if (this.uvi >= 8 && this.uvi < 11) {
						uvi.className = uvi.className + " orangered";
					} else if (this.uvi >= 11) {
						uvi.className = uvi.className + " violet";
					}
					small.appendChild(uvi);
				}

				// precipitation
				if (this.config.showRainAmount) {
					var precipitation = document.createElement("div");
					precipitation.className = "prep xmedium";
					if (this.precipitation > 0) {
						if(config.units === "imperial") {
							precipitation.innerHTML = this.translate("PRECIP") + (this.precipitation / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
						} else {
							precipitation.innerHTML = this.translate("PRECIP") + this.precipitation.toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
						}
					} else {
						precipitation.innerHTML = this.translate("No prep") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
					}
					small.appendChild(precipitation);
				}
				wrapper.appendChild(small);
			}

			//weather description and alerts.
			if (!this.config.showTopDescription) {
				var description = document.createElement("div");
				if (this.alert === null || !(this.now >= this.start && this.now < this.end) || !(this.date >= this.startDate && this.date <= this.endDate)) {
					description.className = "bright current-description slarge details";
					description.innerHTML = this.desc;
				} else if (this.alert !== null && (this.now >= this.start && this.now < this.end) && (this.date >= this.startDate && this.date <= this.endDate)) {
					description.className = "orangered current-description medium details";
					description.innerHTML = "<i class=\"fas fa-wind\"></i> " + this.translate("ALERTS") + this.start + "-" + this.end;
				} 
				wrapper.appendChild(description);
			}
		}

		//daily forecast
		if ((this.config.endpointType === "daily" || this.config.endpointType === "onecall") && this.config.onlyTemp === false || this.config.plusForecast === true) {

			if (this.config.appendLocationNameToHeader) {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next days") + this.config.location;
				wrapper.appendChild(header);
			} else {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next days");
				wrapper.appendChild(header);
			}

			if (this.config.flexDayForecast) {
				var container = document.createElement("div");
				container.className = "daily flex-container weatherforecast small normal";

				for (var f in this.forecastDaily) {
					var forecast = this.forecastDaily[f];

					var item = document.createElement("div");
					if (this.config.defaultIcons) {
						item.className = "item forecast weatherforecast";
						item.style.lineHeight = "1.8rem";
					} else {
						item.className = "item forecast currentweather";
					}
					container.appendChild(item);

					var dayCell = document.createElement("div");
					dayCell.className = "fday smedium";
					dayCell.style.textTransform = "capitalize";
					dayCell.innerHTML = forecast.day;
					item.appendChild(dayCell);

					var icon = document.createElement("div");
					icon.className = "wi weathericon wi-" + forecast.icon;
					if (this.config.defaultIcons) {
						icon.style.transform = "scale(2)";
						icon.style.padding = "17px";
					} else {
						icon.style.transform = "scale(0.8)";
					}
					item.appendChild(icon);

					var degreeLabel = "";
					if (this.config.units === "metric" || this.config.units === "imperial") {
						degreeLabel += "&deg;";
					}
					if (this.config.degreeLabel) {
						switch (this.config.units) {
							case "metric":
								degreeLabel += "C";
								break;
							case "imperial":
								degreeLabel += "F";
								break;
							case "default":
								degreeLabel = "K";
								break;
						}
					}

					if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
						this.config.decimalSymbol = ".";
					}

					var maxTempCell = document.createElement("div");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "maxtemp coral medium";
					item.appendChild(maxTempCell);

					var minTempCell = document.createElement("div");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "mintemp skyblue medium";
					item.appendChild(minTempCell);


					if (this.config.showRainAmount) {
						var rainCell = document.createElement("div");
						rainCell.className = "xmedium bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "small normal";
							rainCell.innerHTML = this.translate("No rain") + "&nbsp; <i class=\"fa fa-tint-slash skyblue small\"></i>";
						} else if (forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							}
						} else if (forecast.rain) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						} else if (forecast.rain && forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain + forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain + forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						}

							item.appendChild(rainCell);
						}

					if (this.config.extraDaily) {
						var humidity = document.createElement("span");
						humidity.innerHTML = "<i class=\"wi wi-humidity\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "humidity skyblue extra small";
						item.appendChild(humidity);

						var dewPoint = document.createElement("span");
						dewPoint.innerHTML = "&nbsp; " + parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "dewPoint cyan extra small";
						item.appendChild(dewPoint);

						var pressure = document.createElement("span");
						pressure.innerHTML = "<br>" + Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + "Hg";
						pressure.className = "pressure gold extra small";
						item.appendChild(pressure);
						
						var uvIndex = document.createElement("span");
						uvIndex.innerHTML = "&nbsp; UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "uvIndex lightgreen extra small";
						item.appendChild(uvIndex);

						container.appendChild(item);
					}
				}

				wrapper.appendChild(container);

			} else {

				var table = document.createElement("table");
				table.className = "daily weatherforecast " + this.config.tableClass;

				for (var f in this.forecastDaily) {
					var forecast = this.forecastDaily[f];

					var row = document.createElement("tr");
					row.className = "forecast normal";
					table.appendChild(row);

					var dayCell = document.createElement("td");
					if (this.config.language == "ro") {
						dayCell.className = "align-left day ro";
					} else dayCell.className = "align-left day en";
					dayCell.innerHTML = forecast.day;
					row.appendChild(dayCell);

					var iconCell = document.createElement("td");
					iconCell.className = "align-center bright weather-icon";
					row.appendChild(iconCell);

					var icon = document.createElement("span");
					icon.className = "align-center wi forecasticon wi-" + forecast.icon;
					iconCell.appendChild(icon);

					var degreeLabel = "";
					if (this.config.units === "metric" || this.config.units === "imperial") {
						degreeLabel += "&deg;";
					}
					if (this.config.degreeLabel) {
						switch (this.config.units) {
							case "metric":
								degreeLabel += "C";
								break;
							case "imperial":
								degreeLabel += "F";
								break;
							case "default":
								degreeLabel = "K";
								break;
						}
					}

					if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
						this.config.decimalSymbol = ".";
					}

					var maxTempCell = document.createElement("td");
					maxTempCell.innerHTML = forecast.maxTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					maxTempCell.className = "align-center max-temp coral";
					row.appendChild(maxTempCell);

					var minTempCell = document.createElement("td");
					minTempCell.innerHTML = forecast.minTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					minTempCell.className = "align-center min-temp skyblue";
					row.appendChild(minTempCell);

					if (this.config.showRainAmount) {
						var rainCell = document.createElement("td");
						rainCell.className = "align-right bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "align-right rain";
							rainCell.innerHTML = this.translate("No rain") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
						} else if (forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							}
						} else if (forecast.rain) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						} else if (forecast.rain && forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain + forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain + forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						}

						row.appendChild(rainCell);
					}

					if (this.config.fadeDaily && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastDaily.length * this.config.fadePoint;
						var steps = this.forecastDaily.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}

					// add extra information of weather forecast
					// humidity, dew point,, pressure, feels like and UV index

					if (this.config.extraDaily) {
						var row = document.createElement("tr");
						row.className = "extra normal";
						table.appendChild(row);

						var humidity = document.createElement("td");
						humidity.innerHTML = "<i class=\"wi wi-humidity skyblue little\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "align-left humidity";
						row.appendChild(humidity);

						var dewPoint = document.createElement("td");
						dewPoint.innerHTML = parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "align-center dewPoint cyan";
						row.appendChild(dewPoint);

						var pressure = document.createElement("td");
						pressure.innerHTML = Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + "Hg";
						pressure.className = "align-center pressure gold";
						row.appendChild(pressure);

						var realFeelDay = document.createElement("td");
						realFeelDay.innerHTML =  "<span class=\"currentweather\"><i class=\"wi wi-thermometer yellow\"></i></span> " + parseFloat(forecast.realFeelsDay).toFixed(0) + degreeLabel;
						realFeelDay.className = "align-center realFeel yellow";
						row.appendChild(realFeelDay);
							
						var uvIndex = document.createElement("td");
						uvIndex.innerHTML = "UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "align-right uvIndex lightgreen";
						row.appendChild(uvIndex);
					}

					if (this.config.fadeDaily && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastDaily.length * this.config.fadePoint;
						var steps = this.forecastDaily.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}
				}

				wrapper.appendChild(table);
			}
		}

		//hourly forecast
		if ((this.config.endpointType === "hourly" || this.config.endpointType === "onecall") && this.config.onlyTemp === false) {

			if (this.config.appendLocationNameToHeader) {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next hours") + this.config.location;
				wrapper.appendChild(header);
			} else {
				var header = document.createElement("header");
				header.className = "header";
				header.innerHTML = "<i class=\"wi wi-day-cloudy skyblue\"></i>&nbsp; " + this.translate("Next hours");
				wrapper.appendChild(header);
			}

			if (this.config.flexHourForecast) {
				var container = document.createElement("div");
				container.className = "hourly flex-container weatherforecast small normal";
				if (this.config.defaultIcons) {
					container.style.flexWrap = "nowrap";
					container.style.gap = "30px";
				} else {
					container.style.flexWarp = "warp";
				}

				for (var f in this.forecastHourly) {
					var forecast = this.forecastHourly[f];

					var item = document.createElement("div");
					if (this.config.defaultIcons) {
						item.className = "item forecast weatherforecast";
						item.style.lineHeight = "1.8rem";
					} else {
						item.className = "item forecast currentweather";
					}
					container.appendChild(item);

					var dayCell = document.createElement("div");
					dayCell.className = "fday xmedium";
					dayCell.innerHTML = forecast.hour + " h";
					item.appendChild(dayCell);

					var icon = document.createElement("div");
					icon.className = "wi weathericon wi-" + forecast.icon;
					if (this.config.defaultIcons) {
						icon.style.transform = "scale(2)";
						icon.style.padding = "17px";
					} else {
						icon.style.transform = "scale(0.8)";
					}
					item.appendChild(icon);

					var degreeLabel = "";
					if (this.config.units === "metric" || this.config.units === "imperial") {
						degreeLabel += "&deg;";
					}
					if (this.config.degreeLabel) {
						switch (this.config.units) {
							case "metric":
								degreeLabel += "C";
								break;
							case "imperial":
								degreeLabel += "F";
								break;
							case "default":
								degreeLabel = "K";
								break;
						}
					}

					if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
						this.config.decimalSymbol = ".";
					}

					var medTempCell = document.createElement("div");
					medTempCell.innerHTML = forecast.hourTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					medTempCell.className = "dayTemp yellow xmedium";
					item.appendChild(medTempCell);

					if (this.config.showRainAmount) {
						var rainCell = document.createElement("div");
						rainCell.className = "xmedium bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "small normal";
							rainCell.innerHTML = this.translate("No rain") + "&nbsp; <i class=\"fa fa-tint-slash skyblue small\"></i>";
						} else if (forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							}
						} else if (forecast.rain) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						} else if (forecast.rain && forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain + forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain + forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						}

						item.appendChild(rainCell);
					} 

					if (this.config.extraHourly) {
						var humidity = document.createElement("span");
						humidity.innerHTML = "<i class=\"wi wi-humidity\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "humidity skyblue extra small";
						item.appendChild(humidity);

						var dewPoint = document.createElement("span");
						dewPoint.innerHTML = "&nbsp; " + parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "dewPoint cyan extra small";
						item.appendChild(dewPoint);

						var pressure = document.createElement("span");
						pressure.innerHTML = "<br>" + Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + "Hg";
						pressure.className = "pressure gold extra small";
						item.appendChild(pressure);
						
						var uvIndex = document.createElement("span");
						uvIndex.innerHTML = "&nbsp; UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "uvIndex lightgreen extra small";
						item.appendChild(uvIndex);
					}

					container.appendChild(item);
				}

				wrapper.appendChild(container);

			} else {

				var table = document.createElement("table");
				table.className = "hourly weatherforecast " + this.config.tableClass;

				for (var f in this.forecastHourly) {
					var forecast = this.forecastHourly[f];

					var row = document.createElement("tr");
					row.className = "forecast normal";
					table.appendChild(row);

					var dayCell = document.createElement("td");

					if (this.config.language == "ro") {
						dayCell.className = "align-left day ro";
					} else dayCell.className = "align-left day en";

					dayCell.innerHTML = forecast.hour;
					row.appendChild(dayCell);

					var iconCell = document.createElement("td");
					iconCell.className = "align-center bright weather-icon";
					row.appendChild(iconCell);

					var icon = document.createElement("span");
					icon.className = "align-center wi forecasticon wi-" + forecast.icon;
					iconCell.appendChild(icon);

					var degreeLabel = "";
					if (this.config.units === "metric" || this.config.units === "imperial") {
						degreeLabel += "&deg;";
					}
					if (this.config.degreeLabel) {
						switch (this.config.units) {
							case "metric":
								degreeLabel += "C";
								break;
							case "imperial":
								degreeLabel += "F";
								break;
							case "default":
								degreeLabel = "K";
								break;
						}
					}

					if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
						this.config.decimalSymbol = ".";
					}

					var medTempCell = document.createElement("td");
					medTempCell.innerHTML = forecast.hourTemp.replace(".", this.config.decimalSymbol) + degreeLabel;
					medTempCell.className = "align-center lime";
					row.appendChild(medTempCell);

					var realFeel = document.createElement("td");
					realFeel.innerHTML = "<span class=\"currentweather\"><i class=\"wi wi-thermometer yellow\"></i></span> " + parseFloat(forecast.realFeels).toFixed(0).replace(".", this.config.decimalSymbol) + degreeLabel;
					realFeel.className = "align-center yellow";
					row.appendChild(realFeel);	

					if (this.config.showRainAmount) {
						var rainCell = document.createElement("td");
						rainCell.className = "align-right bright";
						if (!forecast.snow && !forecast.rain) {
							rainCell.className = "align-right rain";
							rainCell.innerHTML = this.translate("No rain") + " <i class=\"fa fa-tint-slash skyblue\"></i>";
						} else if (forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-snowflake-cold lightblue\"></i>";
							}
						} else if (forecast.rain) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						} else if (forecast.rain && forecast.snow) {
							if (config.units !== "imperial") {
								rainCell.innerHTML = parseFloat(forecast.rain + forecast.snow).toFixed(1).replace(".", this.config.decimalSymbol) + " mm <i class=\"wi wi-umbrella lime\"></i>";
							} else {
								rainCell.innerHTML = (parseFloat(forecast.rain + forecast.snow) / 25.4).toFixed(2).replace(".", this.config.decimalSymbol) + " in <i class=\"wi wi-umbrella lime\"></i>";
							}
						}

						row.appendChild(rainCell);
					}

					if (this.config.fadeHourly && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastHourly.length * this.config.fadePoint;
						var steps = this.forecastHourly.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}

					// add extra information of weather forecast
					// humidity, dew point,, pressure, visibility and UV index

					if (this.config.extraHourly) {
						var row = document.createElement("tr");
						row.className = "extra normal";
						table.appendChild(row);

						var humidity = document.createElement("td");
						humidity.innerHTML = "<i class=\"wi wi-humidity skyblue little\"></i> " + parseFloat(forecast.humidity).toFixed(0) + "%";
						humidity.className = "align-left humidity";
						row.appendChild(humidity);

						var dewPoint = document.createElement("td");
						dewPoint.innerHTML = parseFloat(forecast.dewPoint).toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
						dewPoint.className = "align-center dewPoint cyan";
						row.appendChild(dewPoint);

						var pressure = document.createElement("td");
						pressure.innerHTML = Math.round(forecast.pressure * 750.062 / 1000).toFixed(0) + "Hg";
						pressure.className = "align-center pressure gold";
						row.appendChild(pressure);

						var visible = document.createElement("td");
						if (this.config.units === "metric" || this.config.units === "default") {
							visible.innerHTML =  forecast.visibility/1000 + " Km";
						} else if (this.config.units === "imperial") {
							visible.innerHTML =  Math.round(forecast.visibility/1000).toFixed(2) + " mi";
						}
						visible.className = "align-center violet visibility";
						row.appendChild(visible);

						var uvIndex = document.createElement("td");
						uvIndex.innerHTML = "UVI " + parseFloat(forecast.uvIndex).toFixed(1).replace(".", this.config.decimalSymbol);
						uvIndex.className = "align-right uvIndex lightgreen";
						row.appendChild(uvIndex);
					}

					if (this.config.fadeHourly && this.config.fadePoint < 1) {
						if (this.config.fadePoint < 0) {
							this.config.fadePoint = 0;
						}
						var startingPoint = this.forecastHourly.length * this.config.fadePoint;
						var steps = this.forecastHourly.length - startingPoint;
						if (f >= startingPoint) {
							var currentStep = f - startingPoint;
							row.style.opacity = 1 - (1 / steps) * currentStep;
						}
					}
				}

				wrapper.appendChild(table);
			}
		}

		return wrapper;
	},

	// Override getHeader method.
	getHeader: function () {
		if (this.config.useLocationAsHeader && this.config.location !== false) {
			if (this.data.header) return this.config.location;
		}

		if (this.config.appendLocationNameToHeader) {
			if (this.data.header) return this.data.header + " " + this.config.location;
		}

		return this.data.header ? this.data.header : "";
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
			appIdsIndex = generate();
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

	/* updateWeather(compliments)
	 * Requests new data from openweather.org.
	 * Calls processWeather on succesfull response.
	 */
	OneUpdate: function () {
		if ((this.config.appId === "") && !this.config.random) {
			return Log.error("OneCall: appId not set!");
		}

		var params = "?lat=" + this.config.lat + "&lon=" + this.config.lon + "&units=" + config.units + "&lang=" + this.config.language;
		if (this.config.random) {
		    url = "https://api.openweathermap.org/data/3.0/onecall" + params + "&exclude=minutely" + "&appId=" + this.randomappIds();
		} else {
		    url = "https://api.openweathermap.org/data/3.0/onecall" + params + "&exclude=minutely" + "&appId=" + this.config.appId;
		}

		var self = this;
		var weatherRequest = new XMLHttpRequest();
		weatherRequest.open("GET", url, true);
		weatherRequest.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status === 200) {
				//	send payload for other instances
					self.sendNotification("ONE_RESPONSE", JSON.parse(this.response));
				//	Log.info("ONE_RESPONSE", JSON.parse(this.response));
					if (self.config.endpointType === "current") {
						self.processWeather(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "hourly") {
						self.processHourly(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "daily") {
						self.processDaily(JSON.parse(this.response));
					}
					else if (self.config.endpointType === "onecall"){
						self.processWeather(JSON.parse(this.response));
						self.processDaily(JSON.parse(this.response));
						self.processHourly(JSON.parse(this.response));
					}
				} else if (this.status === 401) {
				    self.DomUpdate(this.config.initialLoadDelay)
					return Log.error("OneCall: appId not available!");
				} else if (this.status === 429) {
					return Log.error("Onecall: Exceeding of requests!");
				} else {
					Log.error(self.name + ": Incorrect appId. Could not load weather.");
				}
			}
		};
		weatherRequest.send();
	},

	AirUpdate: function () {
		if ((this.config.appId === "") && !this.config.random) {
			return Log.error("OneCall: appId not set!");
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
					self.sendNotification("AIR_RESPONSE", JSON.parse(this.response));
				//	Log.info("AIR_RESPONSE", JSON.parse(this.response));
				} else if (this.status === 401) {
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

	// Override notification handler.
	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			var empty = "";
			this.hide(0, empty, { lockString: this.identifier });
		}

		//	recevie payload for other instances
		if (notification === "ONE_RESPONSE" && this.config.oneLoader) {
			if (this.config.endpointType === "current") {
				this.processWeather(payload);
			}
			if (this.config.endpointType === "daily") {
				this.processDaily(payload);
			}
			if (this.config.endpointType === "hourly") {
				this.processHourly(payload);
			}
			if (this.config.endpointType === "onecall") {
				this.processWeather(payload);
				this.processDaily(payload);
				this.processHourly(payload);
			}
		}

		if (this.config.showIndoorTemp_Hum) {
			if (notification === "INDOOR_TEMPERATURE") {
				this.indoorTemperature = this.roundValue(payload);
				this.updateDom(this.config.animationSpeed);
			} else this.indoorTemperature = "NA";

			if (notification === "INDOOR_HUMIDITY") {
				this.indoorHumidity = this.roundValue(payload);
				this.updateDom(this.config.animationSpeed);
			} else this.indoorHumidity = "NA";
		}
	},

	/* processWeather(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Weather information received form openweather.org.
	 */
	processWeather: function (data) {
		if (!data || !data.current || typeof data.current.temp === "undefined") {
			// Did not receive usable new data. Maybe this needs a better check?
			return Log.error("NO CURRENT WEATHETR DATA");
		}

		this.humidity = parseFloat(data.current.humidity);
		this.temperature = this.roundValue(data.current.temp);
		this.feelsLike = 0
		this.desc = data.current.weather[0].description;    // weather description.
		this.pressure = data.current.pressure;              // main pressure.
		this.visibility = data.current.visibility;          // visibility.
		this.dew = data.current.dew_point;                  // dew point.
		this.uvi = data.current.uvi;                        // uv index.

		if (data.hasOwnProperty("alerts") && this.config.showAlerts) {
			this.start = moment.unix(data.alerts[0].start).format("HH:mm");
			this.end = moment.unix(data.alerts[0].end).format("HH:mm");
			this.startDate = moment.unix(data.alerts[0].start).format("DD.MM.YYYY");
			this.endDate = moment.unix(data.alerts[0].end).format("DD.MM.YYYY");
			this.alert = data.alerts[0].description;
			this.event = data.alerts[0].event;
			this.sender = data.alerts[0].sender_name;
			this.tags = data.alerts[0].tags;
			if (this.config.notificationAlert === "full" && (this.now >= this.start && this.now < this.end) && (this.date >= this.startDate && this.date <= this.endDate)) {
				this.sendNotification("DAY_NOTIFICATION", {imageFA: "wind red", title: this.translate("ALERTS") + "<br>" + this.start + " - " + this.end, message: this.alert , timer: 15000});
				this.sendNotification("CURRENTWEATHER_ALERT", { tags: "weather_alert" }); // this.tags
			} else if (this.config.notificationAlert === true && (this.now >= this.start && this.now < this.end) && (this.date >= this.startDate && this.date <= this.endDate)) {
				this.sendNotification("DAY_NOTIFICATION", {imageFA: "wind red", title: this.translate("ALERT!"), message: this.translate("ALERT") + this.translate(" between ") + this.start + " - " + this.end , timer: 10000});
				this.sendNotification("CURRENTWEATHER_ALERT", { tags: "weather_alert" }); // this.tags
			}
			Log.log("CURRENTWEATHER_ALERT", { tags: "weather_alert" });
			Log.log("Start: " + this.startDate + " at "+ this.start + " Stop: " + this.endDate + " at "+ this.end);
		}
		
		this.temperature === "-0.0" ? 0.0 : this.temperature;

		var precip = false;
		if (data.current.hasOwnProperty("rain") && !isNaN(data.current["rain"]["1h"])) {
			if (this.config.units === "imperial") {
				this.rain = data.current["rain"]["1h"] / 25.4;
			} else {
				this.rain = data.current["rain"]["1h"];
			}
			precip = true;
		}
		if (data.current.hasOwnProperty("snow") && !isNaN(data.current["snow"]["1h"])) {
			if (this.config.units === "imperial") {
				this.snow = data.current["snow"]["1h"] / 25.4;
			} else {
				this.snow = data.current["snow"]["1h"];
			}
			precip = true;
		}
		if (precip) {
			this.precipitation = this.rain + this.snow;
		}

		if (this.config.realFeelsLike) {
			this.feelsLike = parseFloat(data.current.feels_like).toFixed(0);
		} else if (windInMph > 3 && tempInF < 50) {
			// windchill
			var windChillInF = Math.round(35.74 + 0.6215 * tempInF - 35.75 * Math.pow(windInMph, 0.16) + 0.4275 * tempInF * Math.pow(windInMph, 0.16));
			var windChillInC = (windChillInF - 32) * (5 / 9);

			switch (this.config.units) {
				case "metric":
					this.feelsLike = windChillInC.toFixed(0);
					break;
				case "imperial":
					this.feelsLike = windChillInF.toFixed(0);
					break;
				case "default":
					this.feelsLike = (windChillInC + 273.15).toFixed(0);
					break;
			}
		} else if (tempInF > 80 && this.humidity > 40) {
			// heat index
			var Hindex =
				-42.379 +
				2.04901523 * tempInF +
				10.14333127 * this.humidity -
				0.22475541 * tempInF * this.humidity -
				6.83783 * Math.pow(10, -3) * tempInF * tempInF -
				5.481717 * Math.pow(10, -2) * this.humidity * this.humidity +
				1.22874 * Math.pow(10, -3) * tempInF * tempInF * this.humidity +
				8.5282 * Math.pow(10, -4) * tempInF * this.humidity * this.humidity -
				1.99 * Math.pow(10, -6) * tempInF * tempInF * this.humidity * this.humidity;

			switch (this.config.units) {
				case "metric":
					this.feelsLike = parseFloat((Hindex - 32) / 1.8).toFixed(0);
					break;
				case "imperial":
					this.feelsLike = Hindex.toFixed(0);
					break;
				case "default":
					var tc = parseFloat((Hindex - 32) / 1.8) + 273.15;
					this.feelsLike = tc.toFixed(0);
					break;
			}
		}

		if (this.config.useBeaufort) {
			this.windSpeed = this.ms2Beaufort(this.roundValue(data.current.wind_speed));
		} else if (this.config.useKMPHwind) {
			this.windSpeed = parseFloat((data.current.wind_speed * 60 * 60) / 1000).toFixed(0);
		} else {
			this.windSpeed = parseFloat(data.current.wind_speed).toFixed(0);
		}

		this.windDirection = this.deg2Cardinal(data.current.wind_deg);
		this.windDeg = data.wind_deg;
		this.weatherType = this.config.iconTable[data.current.weather[0].icon];

		this.sendNotification("CURRENTWEATHER_TYPE", { type: this.config.iconTable[data.current.weather[0].icon].replace("-", "_") });
		this.DomUpdate(this.config.initialLoadDelay);
	},

	processDaily: function (data) {
		if (!data || !data.daily || typeof data.daily[0] === "undefined") {
			return Log.error("NO DAILY FORECAST DATA");
		}

		this.forecastDaily = [];
		var lastDay = null;
		var forecastData = {};
		var dayStarts = 7;
		var dayEnds = 18;

		// Handle different structs between onecall endpoints
		var forecastList = null;
		if (data.daily) {
			forecastList = data.daily;
		} else {
			Log.error("Unexpected forecast data");
			return undefined;
		}

		for (var i = 0, count = forecastList.length; i < count; i++) {
			var forecast = forecastList[i];

			var day;
			if (forecast.dt_txt) {
				day = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format(this.config.daily);
			} else {
				day = moment.unix(forecast.dt).format(this.config.daily);
			}

			if (day !== lastDay) {
				forecastData = {
					day: day,
					icon: this.config.iconTable[forecast.weather[0].icon],
					maxTemp: this.roundValue(forecast.temp.max),
					minTemp: this.roundValue(forecast.temp.min),
					rain: this.processRain(forecast, forecastList, moment),
					snow: this.processSnow(forecast, forecastList, moment),
					humidity: forecast.humidity,
					pressure: forecast.pressure,
					precip: this.roundValue(forecast.pop),
					realFeelsDay: this.roundValue(forecast.feels_like.day),
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
					visibility: forecast.visibility,
				};

				this.forecastDaily.push(forecastData);
				lastDay = day;

				// Stop processing when maxNumberOfDays is reached
				if (this.forecastDaily.length === this.config.maxNumberOfDays) {
					break;
				}
			} else {
				forecastData.maxTemp = forecast.temp.max > parseFloat(forecastData.maxTemp) ? this.roundValue(forecast.temp.max) : forecastData.maxTemp;
				forecastData.minTemp = forecast.temp.min < parseFloat(forecastData.minTemp) ? this.roundValue(forecast.temp.min) : forecastData.minTemp;

				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour > dayStarts && hour < dayEnds) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		this.DomUpdate(this.config.initialLoadDelay);
	},

	processHourly: function (data) {
		if (!data || !data.hourly || typeof data.hourly[0] === "undefined") {
			return Log.error("NO HOURLY FORECAST DATA");
		}

		this.forecastHourly = [];
		var lastHour = null;
		var forecastData = {};
		var hourStarts = 7;
		var hourEnds = 18;

		// Handle different structs between onecall endpoints
		var forecastList = null;
		if (data.hourly) {
			forecastList = data.hourly;
		} else {
			Log.error("Unexpected forecast data");
			return undefined;
		}

		for (var i = 0, count = forecastList.length; i < count; i++) {
			var forecast = forecastList[i];

			var hour;
			if (forecast.dt_txt) {
				hour = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format(this.config.hourly);
			} else {
				hour = moment.unix(forecast.dt).format(this.config.hourly);
			}

			if (hour !== lastHour) {
				forecastData = {
					hour: hour,
					icon: this.config.iconTable[forecast.weather[0].icon],
					rain: this.processRain(forecast, forecastList, moment),
					snow: this.processSnow(forecast, forecastList, moment),
					humidity: forecast.humidity,
					pressure: forecast.pressure,
					hourTemp: this.roundValue(forecast.temp),
					precip: this.roundValue(forecast.pop),
					realFeels: this.roundValue(forecast.feels_like),
					dewPoint: this.roundValue(forecast.dew_point),
					uvIndex: forecast.uvi,
					visibility: forecast.visibility,
				};

				this.forecastHourly.push(forecastData);
				lastHour = hour;

				// Stop processing when maxNumberOfHours is reached
				if (this.forecastHourly.length === this.config.maxNumberOfHours) {
					break;
				}
			} else {
				// Since we don't want an icon from the start of the day (in the middle of the night)
				// we update the icon as long as it's somewhere during the day.
				if (hour > hourStarts && hour < hourEnds) {
					forecastData.icon = this.config.iconTable[forecast.weather[0].icon];
				}
			}
		}

		this.DomUpdate(this.config.initialLoadDelay);
	},
	
	DomUpdate: function () {
		if (!this.loaded) { 
			this.loaded = true;
			this.DomUpdate();
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
			self.OneUpdate();
			if (self.config.pollutionOneLoader) {
				setTimeout(function () {
					self.AirUpdate();
				}, 2000);
			}
		}, updateInterval);
	},

	/* ms2Beaufort(ms)
	 * Converts m2 to beaufort (windspeed).
	 *
	 * see:
	 *  https://www.spc.noaa.gov/faq/tornado/beaufort.html
	 *  https://en.wikipedia.org/wiki/Beaufort_scale#Modern_scale
	 *
	 * argument ms number - Windspeed in m/s.
	 *
	 * return number - Windspeed in beaufort.
	 */
	ms2Beaufort: function (ms) {
		var kmh = (ms * 60 * 60) / 1000;
		var speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (var beaufort in speeds) {
			var speed = speeds[beaufort];
			if (speed > kmh) {
				return beaufort;
			}
		}
		return 12;
	},

	deg2Cardinal: function (deg) {
		if (deg > 11.25 && deg <= 33.75) {
			return "NNE";
		} else if (deg > 33.75 && deg <= 56.25) {
			return "NE";
		} else if (deg > 56.25 && deg <= 78.75) {
			return "ENE";
		} else if (deg > 78.75 && deg <= 101.25) {
			return "E";
		} else if (deg > 101.25 && deg <= 123.75) {
			return "ESE";
		} else if (deg > 123.75 && deg <= 146.25) {
			return "SE";
		} else if (deg > 146.25 && deg <= 168.75) {
			return "SSE";
		} else if (deg > 168.75 && deg <= 191.25) {
			return "S";
		} else if (deg > 191.25 && deg <= 213.75) {
			return "SSW";
		} else if (deg > 213.75 && deg <= 236.25) {
			return "SW";
		} else if (deg > 236.25 && deg <= 258.75) {
			return "WSW";
		} else if (deg > 258.75 && deg <= 281.25) {
			return "W";
		} else if (deg > 281.25 && deg <= 303.75) {
			return "WNW";
		} else if (deg > 303.75 && deg <= 326.25) {
			return "NW";
		} else if (deg > 326.25 && deg <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	},

	/* function(temperature)
	 * Rounds a temperature to 1 decimal or integer (depending on config.roundTemp).
	 *
	 * argument temperature number - Temperature.
	 *
	 * return string - Rounded Temperature.
	 */
	roundValue: function (temperature) {
		var decimals = this.config.roundTemp ? 0 : 1;
		var roundValue = parseFloat(temperature).toFixed(decimals);
		return roundValue === "-0" ? 0 : roundValue;
	},

	/* processRain(forecast, allForecasts)
	 * Calculates the amount of rain for a whole day even if long term forecasts isn't available for the appId.
	 *
	 * When using the the fallback endpoint forecasts are provided in 3h intervals and the rain-property is an object instead of number.
	 * That object has a property "3h" which contains the amount of rain since the previous forecast in the list.
	 * This code finds all forecasts that is for the same day and sums the amount of rain and returns that.
	 */
	processRain: function (forecast, allForecasts) {
		// If the amount of rain actually is a number, return it
		if (this.config.endpointType === "hourly" && this.config.endpointType === "onecall") {
			if (!isNaN(forecast.rain) && !isNaN(forecast.rain["1h"])) {
				return forecast.rain;
			}
		} else {
			if (!isNaN(forecast.rain)) {
				return forecast.rain;
			}
		}

		// Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment.unix(forecast.dt);
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment.unix(item.dt);
			return itemDateTime.isSame(checkDateTime, "day") && item.rain instanceof Object;
		});

		// If no rain this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		// Summarize all the rain from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.rain)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	},

	processSnow: function (forecast, allForecasts) {
		// If the amount of snow actually is a number, return it
		if (this.config.endpointType === "hourly" && this.config.endpointType === "onecall") {
			if (!isNaN(forecast.snow) && !isNaN(forecast.snow["1h"])) {
				return forecast.snow;
			}
		} else {
			if (!isNaN(forecast.snow)) {
				return forecast.snow;
			}
		}

		// Find all forecasts that is for the same day
		var checkDateTime = forecast.dt_txt ? moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment.unix(forecast.dt);
		var daysForecasts = allForecasts.filter(function (item) {
			var itemDateTime = item.dt_txt ? moment(item.dt_txt, "YYYY-MM-DD hh:mm:ss") : moment.unix(item.dt);
			return itemDateTime.isSame(checkDateTime, "day") && item.snow instanceof Object;
		});

		// If no snow this day return undefined so it wont be displayed for this day
		if (daysForecasts.length === 0) {
			return undefined;
		}

		// Summarize all the snow from the matching days
		return daysForecasts
			.map(function (item) {
				return Object.values(item.snow)[0];
			})
			.reduce(function (a, b) {
				return a + b;
			}, 0);
	}
});