# notification timer

[![Platform](https://img.shields.io/badge/platform-MagicMirror2-informational)](https://github.com/cristearazvanh/MagicMirror2)
[![CC-0 license](https://img.shields.io/badge/License-CC--4.0-blue.svg)](https://creativecommons.org/licenses/by-nd/4.0)
[![GitHub branches](https://badgen.net/github/branches/cristearazvanh/notification_timer)](https://github.com/cristearazvanh/notification_timer)
[![GitHub forks](https://badgen.net/github/forks/cristearazvanh/notification_timer)](https://github.com/cristearazvanh/notification_timer)
[![GitHub stars](https://badgen.net/github/stars/cristearazvanh/notification_timer)](https://github.com/cristearazvanh/notification_timer)

https://github.com/cristearazvanh/notification_timer

MagicMirror 2 Notification receiver, dimmer, alert & timer trigger for my own use on iPad3, 
because the default alert module is full of shit! 
This module is no longer maintained, will not have any improvements or bug fixes.

All settings inside of module or in config.js

	{
		module: "notification_timer",
		position: "top_center",
		config: {
			startImage: "wifi",
			startTitle: "Magic <i class=\"fab fa-windows skyblue\"></i> Board³",
			startTablet: "Magic <i class=\"fab fa-apple\"></i> iPad³",
			startNotification: "Platforma modulară inteligentă este online",
			animationSpeed: config.animation,
			showWelcome: false,

			rotate: 90,        // rotate display 90 or -90 deg.
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
			resetMM: false,    // "0 03:59:59" to reload Sunday at 4 A.M.

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
		}
	},

	Designed by Răzvan Cristea https://github.com/cristearazvanh Creative Commons BY-NC-SA 4.0, Romania.
