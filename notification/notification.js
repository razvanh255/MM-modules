/* MagicMirror²
 * Module: notification timer
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("notification", {

	defaults: {
		startImage: "wifi",
		startTitle: "MagicMirror²",
		startTablet: "Magic iPad³",
		startNotification: "Platforma modulară este online",
		animationSpeed: config.animation,
		showWelcome: false,

		rotate: false,     // rotate display 90 or -90 deg.
		bodysize: 1080,    // Minimum window width
		zoomMode: false,   // zoomed night mode for iPad 3

		background: false, // background picture "css/background.jpg",
		opacity: 75,       // opacity of background picture
		modBackgrd: 0.25,  // add some visual changes,
		monochrome: false, // monochrome display, 100,

		nightMode: true,   // dimmed mode over night and back in the morning
		fadeMode: true,    // fade to dimmed mode over night and back in the morning
		dimming: 50,       // 0 = opacity 1, 100 = opacity 0, 40 = opacity 0.6

		sharpMode: true,   // hourly alert notification
		dateMode: true,    // specific date hourly custom notification
		resetMM: false,    // "0 03:59:59" to reload Sunday at 4 A.M. or every night at "03:59:59"

		birthday1: "",     // day & month of wife or girlfriend
		customTitle1: "",  // Name of wife or girlfriend
		customText1: "",   // Text for wife or girlfriend
		birthday2: "",     // day & month of husband or boyfriend
		customTitle2: "",  // Name of husband or boyfriend
		customText2: "",   // Text for husband or boyfriend
		birthday3: "",     // day & month of child or pet
		customTitle3: "",  // Name of child or pet
		customText3: "",   // Text for child or pet

		debugging: false   // midnight for custom timer start
	},
	
	getScripts: function () {
		return [
				//	"moment.js"
				];
	},

	getStyles: function () {
		return [
				//	"fontawesome.css"
				];
	},

	getTranslations: function () {
		return {
			en: "en.json",
			ro: "ro.json"
		};
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.timer = 8000;
		this.scale = 1;
		this.top = 0;
		this.blur = 5;
		this.bright = 25;
		this.busy = false;
		this.nightDim = "";

		var self = this;
		setInterval(function () {
			self.variables();
			self.interface();
			self.timing();
			self.dimming();
			self.notifications();
			self.program();
		//	if (moment().format("s") == 30) {
		//		self.onLine();
		//	}
		}, 1000);
	},

	variables: function () {
		this.now = moment().format("HH:mm:ss");
		this.date = moment().format("DD.MM mm:ss");
		this.hour = moment().format("hh");
		this.mins = moment().format("mm");
		this.secs = moment().format("ss");
		this.grayscale = this.config.dimming; 
		this.body = Array.from(document.querySelectorAll("body"));
	//	this.opacity = (1 - this.grayscale / 100).toPrecision(2);

		if (this.config.debugging !== false) {
			this.gray1 = (this.mins * (this.grayscale / 60) / 1).toPrecision(2);
			this.gray2 = ((this.grayscale - this.gray1) / 1).toPrecision(2);
			this.night = moment().endOf("d").add(this.config.debugging,"h").add(1,"s").format("HH:mm:ss");
			this.midnight = moment().startOf("d").add(this.config.debugging,"h").format("HH:mm:ss");
			this.before = moment().startOf("d").add(this.config.debugging - 1,"h").format("HH:mm:ss");
			this.morning = moment().startOf("d").add(this.config.debugging + 1,"h").format("HH:mm:ss");
			this.after = moment().startOf("d").add(this.config.debugging + 2,"h").format("HH:mm:ss");
			Log.info("Night: " + this.night + " Midnight: " + this.midnight + " Before: " 
				+ this.before + " Morning: " + this.morning + " After: " + this.after);
			Log.info("Grayscale/opacity 1: " + this.gray1 + "%, Grayscale/opacity 2: " + this.gray2 + "%");
		} else {
			this.gray1 = (this.mins * this.grayscale / 60).toPrecision(4);
			this.gray2 = (this.grayscale - this.gray1).toPrecision(4);
			this.night = moment().endOf("d").format("HH:mm:ss");
			this.midnight = moment().startOf("d").format("HH:mm:ss");
			this.before = moment().startOf("d").subtract(1,"h").format("HH:mm:ss");
			this.morning = moment().startOf("d").add(6,"h").format("HH:mm:ss");
			this.after = moment().startOf("d").add(7,"h").format("HH:mm:ss");
			this.weekday = moment().format("d HH:mm:ss"); this.winter = moment().format("WW");
			if (this.winter > "44" && this.winter < "14" || moment().isDST() == false) {
				this.morning = moment().startOf("d").add(7,"h").format("HH:mm:ss");
				this.after = moment().startOf("d").add(8,"h").format("HH:mm:ss");
			}
		}
	},
	
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "island";
		wrapper.style.transform = "scale(" + this.scale + ") translateY(" + this.top + "px)";
		wrapper.onclick = function() {location.reload()};

		var title = document.createElement("div");
		title.className = "slarge bright light";
		title.innerHTML = this.image + this.title;
		
		var notification = document.createElement("span");
		notification.className = "xmedium light normal";
		notification.style.maxHeight = "25px";
		notification.innerHTML = this.message;

		wrapper.appendChild(title);
		wrapper.appendChild(notification);

		return wrapper;
	},

	onLine: function () {
		if (this.busy === false) {
			this.scale = 1; this.top = 0;
			this.timer = 8000;
		//	this.busy = false;

			this.image = "<i class=\"green fas fa-" + this.config.startImage + "\"></i> ";
			if (navigator.appVersion.match(/iPad/)) {
				this.title = this.config.startTablet + this.nightDim;
			} else this.title = this.config.startTitle + this.nightDim;
			this.message = this.config.startNotification;
			this.config.animationSpeed = config.animation;
			this.updateDom();
			
			var modules = document.querySelectorAll(".module:not(."+this.name+")");
			for (var i = 0; i < modules.length; i++) {
				var item = modules[i];
				item.classList.remove("alert-blur");
			}
		}
	},

	offLine: function () {
		if (this.busy === false) {
			this.image = "<i class=\"fas fa-" + this.config.startImage + " orangered\"></i>";
			this.title = "<span class=\"orangered\"> " + this.translate("No Internet connection!") + "</span>";
			this.message = this.translate("Check Wi-Fi connection and router");
			this.updateDom();
		//	this.busy = true;
		}

	//	var self = this;
	//	setTimeout(function () {
	//		if (navigator.onLine === true) {
	//			self.onLine();
	//		} else self.offLine(); self.config.animationSpeed = 0;
	//	}, config.animation);
	},

	timeout: function () {
		this.busy = true;
		var self = this;
		setTimeout(function () {
			self.busy = false;
			self.onLine();
		}, this.timer);
	},
	
	alertBlur: function () {
		var sheet = document.createElement('style');
		sheet.innerHTML = ".alert-blur {filter: blur(" + this.blur + "px) brightness(" + this.bright + "%) !important;}";
		document.head.appendChild(sheet);

		var modules = document.querySelectorAll(".module:not(."+this.name+")");
		for (var i = 0; i < modules.length; i++) {
			var item = modules[i];
			item.classList.add("alert-blur");
		}
	},

	notificationReceived: function (notification, payload, sender) {
		if (notification === "DOM_OBJECTS_CREATED") {
			if (this.config.showWelcome === true) {
				this.scale = 1.5; this.top = 20;
				this.alertBlur(); this.timer = 10000;

				this.image = "";
				if (navigator.appVersion.match(/iPad/)) {
					this.title = this.config.startTablet;
				} else this.title = this.config.startTitle;
				this.message = "<div class=xmedium>" + this.translate("Modular platform is online");

				this.updateDom(this.config.animationSpeed);
				this.timeout();
			} else this.onLine();
		}

		if ((notification === "SUN_NOTIFICATION") && (this.busy === false)) {
			this.scale = 1.5; this.top = 20;
			this.alertBlur(); this.timer = 60000;

			if (payload.title == "Sunset") {
				this.image = "<i class=\"fas fa-sunset gold\"></i>";
				this.title = this.translate("Sunset");
				this.message = this.translate("Next Sunrise ") + payload.message;
			}

			if (payload.title == "Sunrise") {
				this.image = "<i class=\"fas fa-sunrise gold\"></i>";
				this.title = this.translate("Sunrise");
				this.message = this.translate("Next Sunset ") + payload.message;
			}

			this.updateDom(this.config.animationSpeed);
		//	this.busy = true; 
			this.timeout();
		}

		if ((notification === "DAY_NOTIFICATION") && (this.busy === false)) {
			this.scale = 1.5; this.top = 20;
			this.alertBlur(); this.timer = 10000;

			if (typeof payload.imageHeight === "undefined") {
				payload.imageHeight = "80%";
			}

			if (typeof payload.imageUrl === "undefined") {
				this.image = payload.imageFA;
			} else this.image = "<img src=" + payload.imageUrl.toString() + " height=" + payload.imageHeight.toString() + "> ";

			if (typeof payload.imageFA === "undefined") {
				this.image = "<i class=\"fas fa-" + this.config.startImage + "\"></i> ";
			} else this.image = "<i class=\"fas fa-" + payload.imageFA + "\"></i> ";

			if (typeof payload.title === "undefined") {
				payload.title = this.config.startTitle + this.nightDim;
			} else this.title = payload.title;

			if (typeof payload.message === "undefined") {
				payload.message = this.config.startNotification;
			} else this.message = payload.message;

			if (typeof payload.timer === "undefined") {
				payload.timer = this.timer;
			} else this.timer = payload.timer;

			this.updateDom(this.config.animationSpeed);
		//	this.busy = true; 
			this.timeout();
		}
		
		// from old external notification
		if (notification === "RESET_MIRROR") {
			if (this.weekday == this.config.resetMM) {location.reload();}
			else if (this.now == this.config.resetMM) {location.reload();}
		}

		if (notification === "OFFLINE_NOTIFICATION") {
			this.offLine();
		}
		
		if (notification === "NIGHT_NOTIFICATION") {
			this.nightDim = " <span class=small>(" + parseInt(payload) + "%)</span>";
		}
	},

	dayTime: function () {
		if (this.busy === false) {
			this.scale = 1.5; this.top = 20;
			this.alertBlur();
			this.updateDom(this.config.animationSpeed);
		//	this.busy = true; 
			this.timeout();
		}
	},

	interface: function () {
		var body = this.body; var mins = this.mins; var self = this;
		var html = Array.from(document.querySelectorAll("html"));
		var land = window.matchMedia("screen and (min-height: 1079px) and (orientation: landscape)");
		var port = window.matchMedia("screen and (min-height: 1919px) and (orientation: portrait)");
		var json = Array.from(document.querySelectorAll(".cheltuieli"));
		var wifi = Array.from(document.querySelectorAll(".wifi"));
		var below = Array.from(document.querySelectorAll(".below"));
		var centr = Array.from(document.querySelectorAll(".top.center"));
		var retop = Array.from(document.querySelectorAll(".region.top:not(.bar)"));
		var table = Array.from(document.querySelectorAll(".region table tr:nth-child(even), .region table td"));

		if (this.config.background) {
			below.forEach(function(element) {return element.style.backgroundImage = "url(" + self.config.background + ")", element.style.filter = "opacity(" + self.config.opacity + "%)", element.style.backgroundSize = "cover"});
			if (this.config.modBackgrd !== 0) {
				retop.forEach(function(element) {return element.style.background = "rgba(0,0,0," + self.config.modBackgrd + ")", element.style.padding = "5px", element.style.margin = "5px", element.style.border = "1px rgba(80,80,80,0.5) outset", element.style.borderRadius = "10px"});
				centr.forEach(function(element) {element.style.transform = "translateX(-51.75%)"});
			} else table.forEach(function(element) {return element.style.background = "rgba(0,0,0,0)", element.style.borderBottom = "0"});
		}

		if (this.config.monochrome) {
			body.forEach(function(element) {element.style.filter = "grayscale(" + self.config.monochrome +"%)"});
			this.config.nightMode = false;
		}

		if (this.config.rotate === -90 && land.matches) {
			html.forEach(function(element) {return element.style.transform = "rotate(-90deg)", element.style.transformOrigin = "top left", element.style.top = "100%", element.style.left = "0"});
			body.forEach(function(element) {return element.style.height = "100vw", element.style.width = "100vh"});
		} else if (this.config.rotate === 90 && land.matches) {
			html.forEach(function(element) {return element.style.transform = "rotate(90deg)", element.style.transformOrigin = "bottom right", element.style.bottom = "100%", element.style.right = "0"});
			body.forEach(function(element) {return element.style.height = "100vw", element.style.width = "100vh"});
		} else if (this.config.rotate === -90 && port.matches) {
			html.forEach(function(element) {return element.style.transform = "rotate(0deg)", element.style.transformOrigin = "top left", element.style.top = "0", element.style.left = "0"});
			body.forEach(function(element) {return element.style.height = "100vh", element.style.width = "100vw"});
		} else if (this.config.rotate === 90 && port.matches) {
			html.forEach(function(element) {return element.style.transform = "rotate(0deg)", element.style.transformOrigin = "bottom right", element.style.bottom = "100%", element.style.right = "100%"});
			body.forEach(function(element) {return element.style.height = "100vh", element.style.width = "100vw"});
		}

	/*	if (mins % 2 === 0) {
			json.forEach(function(element) {return element.style.filter = "opacity(0)", element.style.position = "fixed"});
			wifi.forEach(function(element) {return element.style.filter = "opacity(1)", element.style.position = "static"});

		//	modules/tests/dynamic
			this.sendNotification('CHANGE_POSITIONS', modules = {
				'clock'           :{position: 'top_right',},
				'lifecounter'     :{position: 'top_right',},
				'swatch'          :{position: 'top_right',},
				'phases'          :{position: 'top_right',},
				'simpletext'      :{position: 'top_right',},
				'icalendar'       :{position: 'top_right',},
				'onecall'         :{position: 'top_left',}
			});
		} else {
			wifi.forEach(function(element) {return element.style.filter = "opacity(0)", element.style.position = "fixed"});
			json.forEach(function(element) {return element.style.filter = "opacity(1)", element.style.position = "static"});

		//	modules/tests/dynamic
			this.sendNotification('CHANGE_POSITIONS', modules = {
				'clock'           :{position: 'top_left',},
				'lifecounter'     :{position: 'top_left',},
				'swatch'          :{position: 'top_left',},
				'phases'          :{position: 'top_left',},
				'simpletext'      :{position: 'top_left',},
				'icalendar'       :{position: 'top_left',},
				'onecall'         :{position: 'top_right',}
			});
		} */
	},

	timing: function () {
		var body = this.body; var now = this.now; var size = this.config.bodysize;
		var hide = Array.from(document.querySelectorAll(".module:not(.night, .swatch), .weatherforecast"));
		var show = Array.from(document.querySelectorAll(".day, .weatherforecast"));
		var weat = Array.from(document.querySelectorAll(".onecall"));
		var temp = Array.from(document.querySelectorAll(".current .weathericon"));
		var comp = Array.from(document.querySelectorAll(".compliments"));
		var islnd = Array.from(document.querySelectorAll(".island"));
		var ipad3 = window.matchMedia("screen and (max-height: 768px) and (orientation: landscape)");

		if (window.innerWidth <= size) {
			if (this.config.zoomMode) {
				if (navigator.appVersion.match(/iPad/) && ipad3.matches) {
					if (now >= this.midnight && now < this.morning) { 
						night_(); } else { day_(); 
					}
				} else { day_(); }
			} else { day_(); }
		}

		function day_() {
			body.forEach(function(element) {return element.style.minHeight = window.innerHeight / (window.innerWidth / size) + "px", element.style.minWidth = size + "px", element.style.transform = "scale(" + window.innerWidth / size + ")"});
			show.forEach(function(element) {return element.style.filter = "opacity(1)", element.style.position = "static"});
			weat.forEach(function(element) {return element.style.transform = "translate(0, 0)", element.style.textAlign = "inherit"});
			temp.forEach(function(element) {return element.style.float = "left", element.style.paddingRight = "0px"});
			comp.forEach(function(element) {return element.style.width = "inherit", element.style.transform = "scale(1)"});
		//	islnd.forEach(function(element) {return element.style.background = "rgba(0, 0, 0, 0.5)", element.style.border = "1px rgba(80, 80, 80, 0.5) inset"});
		}

		function night_() {
			body.forEach(function(element) {return element.style.minHeight = window.innerHeight / (window.innerWidth / size) + "px", element.style.minWidth = size + "px", element.style.transform = "scale(" + window.innerWidth / size * 1.5 + ")"});
			hide.forEach(function(element) {return element.style.filter = "opacity(0)", element.style.position = "fixed"});
			weat.forEach(function(element) {return element.style.transform = "translate(-208%, 145%)", element.style.textAlign = "left"});
			temp.forEach(function(element) {return element.style.float = "right", element.style.paddingRight = "20px"});
			comp.forEach(function(element) {return element.style.width = "500px", element.style.transform = "translate(58%, -83%) scale(0.5)"});
		//	islnd.forEach(function(element) {return element.style.background = "transparent", element.style.border = "0"});
		}
	},

	dimming: function () {
		var body = this.body; var self = this;
		var now = this.now; var grayscale = this.grayscale;
		var gray1 = this.gray1; var gray2 = this.gray2; 
		var above = Array.from(document.querySelectorAll(".above"));

		if (this.config.nightMode) {
			if (this.config.fadeMode) {
				if (now >= this.before && now < this.night) {
					body.forEach(function(element) {element.style.filter = "grayscale(" + gray1 + "%)"});
					above.forEach(function(element) {return element.style.background = "black", element.style.filter = "opacity(" + gray1 + "%)"});
					this.nightDim = " <span class=small>(" + parseInt(gray1) + "%)</span>";
				} else if (now >= this.midnight && now < this.morning) {
					body.forEach(function(element) {element.style.filter = "grayscale(" + grayscale + "%)"});
					above.forEach(function(element) {return element.style.background = "black", element.style.filter = "opacity(" + grayscale + "%)"});
					this.nightDim = " <span class=small>(" + grayscale + "%)</span>";
				} else if (now >= this.morning && now < this.after) {
					body.forEach(function(element) {element.style.filter = "grayscale(" + gray2 + "%)"});
					above.forEach(function(element) {return element.style.background = "black", element.style.filter = "opacity(" + gray2 + "%)"});
					this.nightDim = " <span class=small>(" + parseInt(gray2) + "%)</span>";
				} else {
					body.forEach(function(element) {element.style.filter = "grayscale(0)"});
					above.forEach(function(element) {element.style.background = "transparent"});
					this.nightDim = " <span class=hide></span>";
				}
			} else { if (now >= this.midnight && now < this.morning) {
					body.forEach(function(element) {element.style.filter = "grayscale(" + grayscale + "%)"});
					above.forEach(function(element) {return element.style.background = "black", element.style.filter = "opacity(" + grayscale + "%)"});
					this.nightDim = " <span class=small>(" + grayscale + "%)</span>";
				} else {
					body.forEach(function(element) {element.style.filter = "grayscale(0)"});
					above.forEach(function(element) {element.style.background = "transparent"});
					this.nightDim = " <span class=hide></span>";
				}
			}
		} else above.forEach(function(element) {element.style.background = "transparent"});
	},

	notifications: function () {
		var self = this; var now = this.now; var date = this.date; var secs = this.secs;
		var sharp = this.translate("Time it was ") + moment().format("H:mm");
		var bell = "<i class=\"fas fa-bell green\"></i> ";
		var gift = "<i class=\"fas fa-gift orange\"></i> ";
		var glas = "<i class=\"fas fa-glass-cheers gold\"></i> ";
		var hart = "<i class=\"fas fa-heart orangered\"></i> ";
		var cake = "<i class=\"fas fa-birthday-cake mooncolor\"></i> ";

		if (this.config.sharpMode) {
			if ((now === "23:00:00") || (now === "00:00:00") || (now === "01:00:00")) {
				this.image = bell; this.title = sharp; this.message = this.translate("Good night!"); this.timer = 8000; this.dayTime();
			} else if (now === "02:00:00" || now === "03:00:00" || now === "04:00:00") {
				this.image = bell; this.title = sharp; this.message = this.translate("Sleep well!"); this.timer = 8000; this.dayTime();
			} else if (now === "05:00:00" || now === "06:00:00" || now === "07:00:00" || now === "08:00:00" || now === "09:00:00" || now === "10:00:00" || now === "11:00:00") {
				this.image = bell; this.title = sharp; this.message = this.translate("Good morning!"); this.timer = 8000; this.dayTime();
			} else if (now === "12:00:00" || now === "13:00:00" || now === "14:00:00") {
				this.image = bell; this.title = sharp; this.message = this.translate("Bon appetit!"); this.timer = 8000; this.dayTime();
			} else if (now === "15:00:00" || now === "16:00:00" || now === "17:00:00") {
				this.image = bell; this.title = sharp; this.message = this.translate("Have a nice day!"); this.timer = 8000; this.dayTime();
			} else if (now === "18:00:00" || now === "19:00:00" || now === "20:00:00" || now === "21:00:00" || now === "22:00:00") {
				this.image = bell; this.title = sharp; this.message = this.translate("Have a nice evening!"); this.timer = 8000; this.dayTime();
			} else if (secs === "00") { // notification	
				self.sendNotification("SHOW_ALERT", {type: "notification", title: bell + sharp, message: this.translate("Good night!")});
			} else if (secs === "30") { // alert with timer mandatory
				self.sendNotification("SHOW_ALERT", {imageFA: "circle-exclamation orangered", title: sharp, message: this.translate("Good night!"), timer: 5000});
			}
		}

		if (this.config.dateMode) { 
			if (date === "25.12 00:10" || date === "26.12 00:10") {
				this.image = gift; this.title = this.translate("Marry Christmas!"); this.message = this.translate("Happy holidays with many joys!"); this.timer = 14000; this.dayTime();
			} else if (date === "01.01 00:10" || date == "02.01 00:10") {
				this.image = glas; this.title = this.translate("Marry New Year ") + moment().format("YYYY") + "!"; this.message = this.translate("A good new year and good health!"); this.timer = 14000; this.dayTime();
			} else if (date === "14.02 00:10") {
				this.image = hart; this.title = this.translate("Happy Valentine's Day!"); this.message = this.translate("Happy Valentine's Day!"); this.timer = 14000; this.dayTime();
			} else if (date === this.config.birthday1 + " 00:10") {
				this.image = cake; this.title = this.config.customTitle1; this.message = this.config.customText1; this.timer = 14000; this.dayTime();
			} else if (date === this.config.birthday2 + " 00:10") {
				this.image = cake; this.title = this.config.customTitle2; this.message = this.config.customText2; this.timer = 14000; this.dayTime();
			} else if (date === this.config.birthday3 + " 00:10") {
				this.image = cake; this.title = this.config.customTitle3; this.message = this.config.customText3; this.timer = 14000; this.dayTime();
			}
		}
	},

	program: function () {
		if (navigator.onLine == false) {
			this.offLine();
		} else

		if (navigator.onLine === true) {
			this.onLine();
		}

		if (this.now == this.midnight) {
			this.sendNotification("MIDNIGHT_NOTIFICATION");
		}
		
		if (this.config.resetMM !== false) {
			if (this.weekday == this.config.resetMM) {location.reload();}
			else if (this.now == this.config.resetMM) {location.reload();}
		}
	}
});