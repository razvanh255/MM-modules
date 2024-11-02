/* MagicMirror²
 * Module: iCalendar
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("icalendar", {

	defaults: {
		maximumEntries: 18,
		calendarClass: "calendar",
		defaultSymbol: "calendar",
		language: config.language,
		displaySymbol: true,
		updateInterval: 50,
		updateDataInterval: 5 * 60 * 1000,
		fadeInterval: config.animation,
		fade: false,
		calendarParser: "modules/icalendar/icalendar.php",

		calendar: {
			urls: []
		}
	},

	getScripts: function() {
		return ["moment.js", "jquery.js", "rrule.min.js"];
	},

	getStyles: function() {
		return ["font-awesome.css"];
	},
	
	start: function() {
		Log.info("Starting module: " + this.name);
		this.calendar();
	},
	
	notificationReceived: function (notification, payload, sender) {
		if (notification === "MIDNIGHT_NOTIFICATION") {
		//	this.updateDom();
		}
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.calendarClass + " normal qsmall";
		return wrapper;
	},

	getHeader: function () {
		return this.data.header;
	},
	
	scheduleUpdate: function() {
		var now = moment().format("HH:mm:ss");
		
		if (now >= "00:00:00" && now < "07:00:00") {
			this.config.updateDataInterval = this.config.updateDataInterval * 6;
		}
	},

	calendar: function() {
		var self = this;
		var calendar = {
			eventList: [],
			calendarPos: 0,
			calendarUrl: (typeof this.config.calendar.urls == "undefined") ? this.config.calendar.url : this.config.calendar.urls[0].url,
			calendarSymbol: (typeof this.config.calendar.urls == "undefined") ? this.config.defaultSymbol || "none" : this.config.calendar.urls[0].symbol,
			displaySymbol: (typeof this.config.displaySymbol == "undefined") ? false : this.config.displaySymbol
		};

		$.fn.updateWithText = function(text, speed, force) {
			var dummy = $('<div/>').html(text);
			if (force || ($(this).html() != dummy.html())) {
				$(this).fadeOut(speed/2, function() {
					$(this).html(text);
					$(this).fadeIn(speed/2, function() {
					});
				});
			}
		};

		$(document).ready(function($) {
			var eventList = [];
			moment.locale(self.config.language);
			calendar.init();
		});

		calendar.processEvents = function(url, events) {
			tmpEventList = [];
			var eventListLength = this.eventList.length;
			for (var i = 0; i < eventListLength; i++) {
				if (this.eventList[i]["url"] != url) {
					tmpEventList.push(this.eventList[i]);
				}
			}
			this.eventList = tmpEventList;
			self.sendNotification("CALENDAR_EVENTS", this.eventList);
			for (i in events) {
				var e = events[i];
				for (var key in e) {
					var value = e[key];
					var seperator = key.search(";");
					if (seperator >= 0) {
						var mainKey = key.substring(0,seperator);
						var subKey = key.substring(seperator+1);
						var dt;
						if (subKey == "VALUE=DATE") {
							dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8));
						} else {
							dt = new Date(value.substring(0,4), value.substring(4,6) - 1, value.substring(6,8), value.substring(9,11), value.substring(11,13), value.substring(13,15));
						}
						if (mainKey == "DTSTART") e.startDate = dt;
						if (mainKey == "DTEND") e.endDate = dt;
					}
				}
				if (e.startDate === undefined) {
					var days = moment(e.DTSTART).diff(moment(), "days");
					var seconds = moment(e.DTSTART).diff(moment(), "seconds");
					var startDate = moment(e.DTSTART);
					var endDays = moment(e.DTEND).diff(moment(), "days");
					var endSeconds = moment(e.DTEND).diff(moment(), "seconds");
					var endDate = moment(e.DTEND);
				} else {
					days = moment(e.startDate).diff(moment(), "days");
					seconds = moment(e.startDate).diff(moment(), "seconds");
					startDate = moment(e.startDate);
					endDays = moment(e.endDate).diff(moment(), "days");
					endSeconds = moment(e.endDate).diff(moment(), "seconds");
					endDate = moment(e.endDate);
				}
				if (seconds >= 0) {
					if (seconds <= 60*60*5 || seconds >= 60*60*24*2) {
						var time_string = moment(startDate).from(moment().format("YYYY-MM-DD")).replace("peste o zi", "mâine").replace("in a day", "Tomorrow").replace(/la|0:00|00:00/g, "");
					} else {
						time_string = moment(startDate).calendar().replace("peste o zi", "mâine").replace("in a day", "Tomorrow").replace(/la|0:00|00:00/g, "");
					}
					if (!e.RRULE) {
						this.eventList.push({"description":e.SUMMARY,"seconds":seconds,"days":time_string,"url": url, symbol: this.calendarSymbol});
					}
					e.seconds = seconds;
				} else if  (endSeconds > 0) {
					if (endSeconds <= 60*60*5 || endSeconds >= 60*60*24*2) {
						time_string = moment(endDate).from(moment().format("YYYY-MM-DD")).replace(/mâine|peste o zi/g, "astăzi").replace("in a day", "Today").replace(/la|0:00|00:00/g, "");
					} else {
						time_string = moment(endDate).calendar().replace(/mâine|peste o zi/g, "astăzi").replace("in a day", "Today").replace(/la|0:00|00:00/g, "");
					}
					if (!e.RRULE) {
						this.eventList.push({"description":e.SUMMARY,"seconds":seconds,"days":time_string,"url": url, symbol: this.calendarSymbol});
					}
					e.seconds = endSeconds;
				}
				if (e.RRULE) {
					var options = new RRule.parseString(e.RRULE);
					options.dtstart = e.startDate;
					var rule = new RRule(options);
					var oneYear = new Date();
					oneYear.setFullYear(oneYear.getFullYear() + 1);
					var dates = rule.between(new Date(), oneYear, true, function(date, i){return i < 10;});
					for (var date in dates) {
						dt = new Date(dates[date]);
						days = moment(dt).diff(moment(), "days");
						seconds = moment(dt).diff(moment(), "seconds");
						startDate = moment(dt);
						if (seconds >= 0) {
							if (seconds <= 60*60*5 || seconds >= 60*60*24*2) {
								time_string = moment(dt).from(moment().format("YYYY-MM-DD")).replace("peste o zi", "mâine").replace("in a day", "Tomorrow").replace(/la|0:00|00:00/g, "");
							} else {
								time_string = moment(dt).calendar().replace("peste o zi", "mâine").replace("in a day", "Tomorrow").replace(/la|0:00|00:00/g, "");
							}
							this.eventList.push({"description":e.SUMMARY,"seconds":seconds,"days":time_string,"url": url, symbol: this.calendarSymbol});
						}
					}
				}
			}
			this.eventList = this.eventList.sort(function(a,b){return a.seconds-b.seconds;});
			this.eventList = this.eventList.slice(0, self.config.maximumEntries);
		};

		calendar.updateData = function(callback) {
			ical_parser(self.config.calendarParser + "?_nocache&url=" + encodeURIComponent(this.calendarUrl), function(cal) {
				this.processEvents(this.calendarUrl, cal.getEvents());
				this.calendarPos++;
				if ((typeof self.config.calendar.urls == "undefined") || (this.calendarPos >= self.config.calendar.urls.length)) {
					this.calendarPos = 0;
					if (callback !== undefined && Object.prototype.toString.call(callback) === "[object Function]") {
						callback(this.eventList);
					}
				} else {
					setTimeout(function() {
						this.updateData(this.updateCalendar.bind(this));
					}.bind(this), self.config.updateInterval);
				}
				if (typeof self.config.calendar.urls != "undefined") {
					this.calendarUrl = self.config.calendar.urls[this.calendarPos].url;
					this.calendarSymbol = self.config.calendar.urls[this.calendarPos].symbol || self.config.defaultSymbol;
				}
			}.bind(this));
		};

		calendar.updateCalendar = function(eventList) {
			var is_new = true;
			if ($(".calendar-table").length) {
				is_new = false;
			}
			table = $("<table/>").addClass("calendar-table");
			opacity = 1;
			for (var i in eventList) {
				var e = eventList[i];
				var row = $("<tr/>").attr("id", "event" +i).css("opacity",opacity).addClass("normal event");
				if (this.displaySymbol) {
					row.append($("<td/>").addClass("fa").addClass("fa-"+e.symbol).addClass("normal calendar-icon"));
				}
				row.append($("<td/>").html(e.description.replace("New moon", "Lună nouă la").replace("Full moon", "Lună plină la").replace("First quarter", "Primul pătrar la").replace("Last quarter", "Ultimul pătrar la").replace("Orthodox Good Friday", "Vinerea Mare").replace("Adormirea Maicii Domnului", "Adormirea M.D.").replace(/Doua zi|a doua zi/, "A doua zi").replace("Ziua Sfîntului Andrei", "Ziua Sf. Andrei").replace("Ziua Internațională a Femeii", "Ziua femeii").replace("Zi Constantin Brancusi", "Ziua Constantin Brâncuși")).addClass("normal description"));
				row.append($("<td/>").html(e.days).addClass("days"));
				if (!is_new && $("#event"+i).length) {
					$("#event" +i).updateWithText(row.children(), self.config.fadeInterval);
				} else {
					is_new = true;
				}
				table.append(row);
				if (self.config.fade === true) {
					opacity -= 1 / eventList.length;
				}
			}
			if (is_new) {
				$("."+self.config.calendarClass).updateWithText(table, self.config.fadeInterval);
			}
		};
		
		calendar.init = function() {
			this.updateData(this.updateCalendar.bind(this));
			this.updateCalendar(this.eventList);

			setInterval(function () {
				self.scheduleUpdate();
				this.updateData(this.updateCalendar.bind(this));
			}.bind(this), self.config.updateDataInterval);
		};

		/** 
		 * Javascript ical Parser
		 * Proof of concept method of reading icalendar (.ics) files with javascript.
		 *
		 * @author: Carl Saggs
		 * @source: https://github.com/thybag/
		 * @version: 0.2
		 */
		ical_parser=function(e,t){this.raw_data=null,this.events=[],this.loadFile=function(e,t){var a=new XMLHttpRequest;a.open("GET",e,!0),a.onreadystatechange=function(){4===a.readyState&&200===a.status&&t(a.responseText)},a.send(null)},this.makeDate=function(e){var t={year:e.substr(0,4),month:e.substr(4,2),day:e.substr(6,2),hour:e.substr(9,2),minute:e.substr(11,2)},a=Date.UTC(t.year,t.month-1,t.day,t.hour,t.minute),n={};return n.date=new Date(a),n.year=n.date.getFullYear(),n.month=("0"+(n.date.getMonth()+1)).slice(-2),n.day=("0"+n.date.getDate()).slice(-2),n.hour=("0"+n.date.getHours()).slice(-2),n.minute=("0"+n.date.getMinutes()).slice(-2),n.dayname=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][n.date.getDay()],n.monthname=["January","February","March","April","May","June","July","August","September","October","November","December"][n.date.getMonth()],n},this.parseICAL=function(e){this.events=[],cal_array=e.replace(RegExp("\\r","g"),"").replace(/\n /g,"").split("\n");for(var t=!1,a=null,n=0;n<cal_array.length;n++)if(ln=cal_array[n],t||"BEGIN:VEVENT"!=ln||(t=!0,a={}),t&&"END:VEVENT"==ln)t=!1,this.events.push(a),a=null;else if(t){if(idx=ln.indexOf(":"),type=ln.substr(0,idx).replace(/^\s\s*/,"").replace(/\s\s*$/,""),val=ln.substr(idx+1).replace(/^\s\s*/,"").replace(/\s\s*$/,""),void 0!==a[type])continue;"DTSTART"==type?(val=(dt=this.makeDate(val)).date,a.start_time=dt.hour+":"+dt.minute,a.start_date=dt.day+"/"+dt.month+"/"+dt.year,a.day=dt.dayname,a.start_date_long=dt.day+". "+dt.monthname+" "+dt.year):"DTEND"==type?(val=(dt=this.makeDate(val)).date,a.end_time=dt.hour+":"+dt.minute,a.end_date=dt.day+"/"+dt.month+"/"+dt.year,a.day=dt.dayname):val="DTSTAMP"==type?this.makeDate(val).date:val.replace(/\\r\\n/g,"<br />").replace(/\\n/g,"<br />").replace(/\\,/g,","),a[type]=val}this.complete()},this.complete=function(){this.events.sort(function(e,t){return e.DTSTART-t.DTSTART}),"function"==typeof t&&t(this)},this.getEvents=function(){return this.events},this.getFutureEvents=function(){var e=[],t=new Date;return this.events.forEach(function(a){a.DTEND>t&&e.push(a)}),e},this.getPastEvents=function(){var e=[],t=new Date;return this.events.forEach(function(a){a.DTEND<=t&&e.push(a)}),e.reverse()},this.load=function(e){var t=this;this.raw_data=null,this.loadFile(e,function(e){t.raw_data=e,t.parseICAL(e)})},this.feed_url=e,this.load(this.feed_url)};
	},

	broadcastEvents: function () {
		var eventList = this.eventList;
		for (var event of eventList) {
			event.symbol = this.symbolsForEvent(event);
			event.calendarName = this.calendarNameForUrl(event.url);
			event.color = this.colorForUrl(event.url);
			delete event.url;
		}

		this.sendNotification("CALENDAR_EVENTS", eventList);
	}
});