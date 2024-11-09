# Smart notification

[![Platform](https://img.shields.io/badge/platform-MagicMirror2-informational)](https://github.com/cristearazvanh/MagicMirror2)
[![CC-0 license](https://img.shields.io/badge/License-CC--4.0-blue.svg)](https://creativecommons.org/licenses/by-nd/4.0)


MagicMirror 2 Notification receiver, dimmer, alert & timer trigger for my own use

<img src=https://github.com/razvanh255/MagicMirror/blob/master/modules/smartNotification/notification.png>

All settings inside of module or in config.js

	{
		module: "smartNotification",
		position: "top_center",
		config: {
			showStatus: true,
			dimInterval: 10,
			dimLevel: 50,
			dimStart: "23:50",
			dimEnd: "05:50",
			rotation: 0,
			sharpMode: true,
			hideModulesTime: "00:00",
			showModulesTime: "00:00",
			modulesToHide: [],
			notifications: [
				{
					month: 12,
					day: 25,
					startHour: 8,
					endHour: 23,
					titles: [
						'<i class="fa-solid fa-gift mooncolor"></i> Crăciun fericit!', 
						'<i class="fa-solid fa-gifts mooncolor"></i> Sărbători fericite!'],
					messages: ["Multă sănătate și multe bucurii!"]
				}
			]
		}
	},

	Designed by Răzvan Cristea https://github.com/razvanh255 Creative Commons BY-NC-SA 4.0, Romania.
