# swatch.beat

[![Platform](https://img.shields.io/badge/platform-MagicMirror2-informational)](https://github.com/cristearazvanh/MagicMirror2)
[![CC-0 license](https://img.shields.io/badge/License-CC--4.0-blue.svg)](https://creativecommons.org/licenses/by-nd/4.0)


Simple Swatch .beat Internet Time MagicMirror2 module

<img src=https://github.com/razvanh255/MagicMirror/blob/master/modules/swatch/preview.png>

Instead of hours and minutes, the mean solar day is divided into 1000 parts called ".beats". Each .beat is equal to one decimal minute in the French Revolutionary decimal time system and lasts 1 minute and 26.4 seconds (86.4 seconds) in standard time. Times are notated as a 3-digit number out of 1000 after midnight. So, for example @248 would indicate a time 248 .beats after midnight representing ​248⁄1000 of a day, just over 5 hours and 57 minutes.

There are no time zones in Swatch Internet Time; instead, the new time scale of Biel Meantime (BMT) is used, based on Swatch's headquarters in Biel, Switzerland and equivalent to Central European Time, West Africa Time, and UTC+01. Unlike civil time in Switzerland and many other countries, Swatch Internet Time does not observe daylight saving time.

	{
		module: "swatch",
		position: "top_left",
		config: {
			logo_height: 28
		},
	}

Designed by Răzvan Cristea
https://github.com/razvanh255
Creative Commons BY-NC-SA 4.0, Romania.
