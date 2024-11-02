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
		fetchNewsTime: 5 * 60 * 1000,
		updateInterval: 10000,
		animationSpeed: config.animation,
		lengthTitle: 200,
		lengthDescription: 500,
		loadFeeds: "modules/rssfeed/rssfeed.php",
		feedURLs: {},
		feedMaxAge: {days: 0, hours: 12}
	},

	getScripts: function() {
		return ["moment.js", "jquery.js"];
	},

	getStyles: function() {
		return ["font-awesome.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.newsfeed();
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "feed normal";
		var source = document.createElement("span");
		source.className = "source dimmed";
		wrapper.appendChild(source);
		var RSS = document.createElement("span");
		RSS.className = "RSS dimmed";
		wrapper.appendChild(RSS);
		var news = document.createElement("span");
		news.className = "news bright";
		wrapper.appendChild(news);
		var story = document.createElement("span");
		story.className = "story normal";
		wrapper.appendChild(story);
		var dots = document.createElement("span");
		dots.className = "dots shade";
		wrapper.appendChild(dots);
		return wrapper;
	},

	scheduleUpdate: function () {
		var now = moment().format("HH:mm:ss");
		
		if (now >= "00:00:00" && now < "07:00:00") {
			this.config.fetchNewsTime = this.config.fetchNewsTime * 6;
		}
	},

	newsfeed: function() {
		var self = this;
		var fetchNewsTime = this.config.fetchNewsTime;
		var feedURLs = this.config.feedURLs;
		var feedMaxAge = this.config.feedMaxAge;

		moment.createFromInputFallback = function (config) {
			config._d = new Date(config._i);
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

		if(typeof feedURLs == "undefined") {
			if(typeof feed == "undefined")
				feedURLs;
			else
				feedURLs = {"News" : feed};
		}

		$(document).ready(function($) {
			var news = [];
			var newsFeedIndex = 0;
			var newsStoryIndex = 0;
			for(var key in feedURLs) {
				news.push(new Array(0));
			}

			function fetchNews() {
				var cachebuster = new Date().getTime();
				var index = 0;
				for(var key in feedURLs) {
					var url = feedURLs[key] + "&_nocache=" + cachebuster;
					fetchNewsForURL(index++, self.config.loadFeeds + "?url=" + encodeURI(url));
				}
				self.scheduleUpdate();
				setTimeout(fetchNews, fetchNewsTime);
			} fetchNews(); 

			function fetchNewsForURL(index, url) {
				$.get(url, function(rssData, textStatus) {
					var oldestDate = moment().subtract(feedMaxAge.days, "days").subtract(feedMaxAge.hours, "hours");
					var stories = [];
					$(rssData).find("item").each(function() {
						addStoryForFeed(stories, oldestDate, $(this));
					});

					$(rssData).find("entry").each(function() {
						addStoryForFeed(stories, oldestDate, $(this));
					});
					news[ index ] = stories;

					var newsCountTotal = 0;
					for(var i=0; i < news.length; i++) {
						newsCountTotal += news[i].length;
					}
					var rssinfo = " " + newsCountTotal + " stiri din " + news.length + " surse ";
				//	$(".RSS").updateWithText(rssinfo, self.config.animationSpeed, true);
				});
			}

			function addStoryForFeed(stories, oldestDate, story) {
				var pubDate = moment(story.find("pubDate").text()); // .format("ddd, DD MMM YYYY HH:mm:ss Z")
				var title = story.find("title").text().substring(0, self.config.lengthTitle).trim().replace("VIDEO","").replace("FOTO","").replace("HOROSCOP","").replace("COMENTARIU","");
				var desc = story.find("description").text().substring(0, self.config.lengthDescription).trim().replace("div>","span>").replace("<br","<base").replace(/&#8230;|]]>/,"...").replace(/--|__/,"");
			//	var counter = "<span class=\"count\">" + (title.length + desc.length) + "</span>";
			//	var update = "<span class=\"update\">(" + counter + "/" + moment().format("HH:mm") + ")</span>";
				if(oldestDate.diff(pubDate) < 0) {
					stories.push("<span class=\"date\"> - " + moment(pubDate).fromNow() + ":</span><br><span class=\"title\">" + title + "</span> <span class=\"desc\"> &bull; " + desc + "</span>");
				}
			}

			function showNews() {
				var initialFeed = newsFeedIndex;
				if(news.length === 0) {
					return;
				}

				for(var i=0; i < news.length+1; i++) {
					var newsFeed = news[newsFeedIndex];
					if(newsFeed === undefined)
						continue;

					if(newsFeed.length === 0) {
						if(++newsFeedIndex == news.length)
							newsFeedIndex = 0;
						newsStoryIndex = 0;
						continue;
					}

					if(newsStoryIndex >= newsFeed.length) {
						newsStoryIndex = 0;
						if(++newsFeedIndex >= news.length) {
							newsFeedIndex = 0;
							continue;
						}
					}
				}

				if(news[newsFeedIndex].length === 0) {
					setTimeout(showNews, 2000);
					return;
				}

				i = 0;
				for(var key in feedURLs) {
					if(i == newsFeedIndex)
						break;
					i++;
				}

				$(".source").updateWithText("<i class=\"fa fa-rss-square\"></i> " + key, self.config.animationSpeed, true);

				var dots = "";
				for(i=0; i < news.length; i++) {
					if(i == newsFeedIndex)
						dots += "";
					else
						dots += "";
				}
				dots += "";

				for(i=0; i < news[newsFeedIndex].length; i++) {
					if( i == newsStoryIndex)
						dots += "";
					else
						dots += "";
				}
			//	$(".dots").updateWithText(dots, self.config.animationSpeed, true);

				newsFeed = news[newsFeedIndex];
				newsStory = newsFeed[newsStoryIndex];

				var nextTimeout = 2000;
				if( typeof newsStory !== "undefined") {
					$(".news").updateWithText(newsStory, self.config.animationSpeed, true);
					nextTimeout = self.config.updateInterval + (newsStory.length * 100);
				}

				newsStoryIndex++;
				setTimeout(showNews, nextTimeout);
			} showNews(); 
		});
	}
});