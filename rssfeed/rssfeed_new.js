/* MagicMirror²
 * Module: rssfeed
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania.
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("rssfeed", {

	defaults: {
		fetchNewsTime: 5 * 60 * 1000,  // 5 minutes
		updateInterval: 10 * 1000,     // 10 seconds
		animationSpeed: 1000,          // 1 second
		lengthTitle: 200,
		lengthDescription: 500,
		loadFeeds: "modules/rssfeed/rssfeed.php",
		feedURLs: {},
		feedMaxAge: { days: 0, hours: 12 }
	},

	getStyles: function () {
		return ["font-awesome.css"];
	},

	getScripts: function () {
		return ["moment.js"];
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.scheduleUpdate();
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "rssfeed";
		return wrapper;
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.newsfeed();
		}, this.config.fetchNewsTime);
	},

	newsfeed: function () {
		var self = this;
		var fetchNewsTime = this.config.fetchNewsTime;
		var feedURLs = this.config.feedURLs;
		var feedMaxAge = this.config.feedMaxAge;

		Object.keys(feedURLs).forEach(function (key) {
			self.fetchNewsForURL(key, feedURLs[key]);
		});
	},

	fetchNewsForURL: function (key, url) {
	    var self = this;
	    var phpScriptUrl = this.config.loadFeeds + "?url=" + encodeURIComponent(url);

	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function () {
	        if (xhr.readyState === 4) {
	            if (xhr.status === 200) {
	                var stories = self.parseRSS(xhr.responseText);
	                self.processStories(key, stories);
	            } else {
	                Log.error("Failed to fetch RSS data from " + url + ": " + xhr.status);
	            }
	        }
	    };
	    xhr.open("GET", phpScriptUrl, true);
	    xhr.send();
	},

	parseRSS: function (rssData) {
		var self = this;
		var oldestDate = moment().subtract(this.config.feedMaxAge.days, "days").subtract(this.config.feedMaxAge.hours, "hours");
		var stories = [];

		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(rssData, "text/xml");

		var items = xmlDoc.querySelectorAll("item, entry");
		items.forEach(function (item) {
			var pubDate = moment(item.querySelector("pubDate").textContent);
			var title = item.querySelector("title").textContent.substring(0, self.config.lengthTitle).trim().replace(/VIDEO|FOTO|HOROSCOP|COMENTARIU/g, "");
			var desc = item.querySelector("description").textContent.substring(0, self.config.lengthDescription).trim().replace(/<\/?[^>]+(>|$)/g, "");
			
			if (oldestDate.diff(pubDate) < 0) {
				stories.push({
					title: title,
					description: desc,
					pubDate: pubDate
				});
			}
		});

		return stories;
	},

	processStories: function (key, stories) {
		var self = this;
		var totalStories = stories.length;
		var rssinfo = totalStories + " stiri din " + Object.keys(this.config.feedURLs).length + " surse";

		var sourceElem = document.createElement("div");
		sourceElem.className = "source dimmed";
		sourceElem.innerHTML = "<i class=\"fa fa-rss-square\"></i> " + key;

		var rssElem = document.createElement("div");
		rssElem.className = "RSS dimmed";
		rssElem.textContent = rssinfo;

		var newsElem = document.createElement("div");
		newsElem.className = "news bright";

		if (totalStories > 0) {
			var index = 0;

			function showStory() {
				var story = stories[index];

				newsElem.innerHTML = "<span class=\"date\"> - " + moment(story.pubDate).fromNow() + ":</span><br><span class=\"title\">" + story.title + "</span> <span class=\"desc\"> &bull; " + story.description + "</span>";
				
				var existingNewsElem = document.querySelector(".news");
				if (existingNewsElem) {
					existingNewsElem.parentNode.replaceChild(newsElem, existingNewsElem);
				}

				index = (index + 1) % totalStories;
				setTimeout(showStory, self.config.updateInterval + (story.title.length + story.description.length) * 50);
			}

			showStory();
		}

		var wrapper = document.createElement("div");
		wrapper.className = "rssfeed";
		wrapper.appendChild(sourceElem);
		wrapper.appendChild(document.createElement("br"));
		wrapper.appendChild(rssElem);
		wrapper.appendChild(document.createElement("br"));
		wrapper.appendChild(newsElem);

		var existingWrapper = document.querySelector(".rssfeed");
		if (existingWrapper) {
			existingWrapper.parentNode.replaceChild(wrapper, existingWrapper);
		} else {
			return wrapper;
		}
	}
});
