# Pollution (OpenWeatherMap/Air_Pollution)

[![Platform](https://img.shields.io/badge/platform-MagicMirror2-informational)](https://github.com/cristearazvanh/MagicMirror2)
[![CC-0 license](https://img.shields.io/badge/License-CC--4.0-blue.svg)](https://creativecommons.org/licenses/by-nd/4.0)


MagicMirror2 stand alone module based on Openweathermap Air Pollution
<br>Keep in mind that this module is for my personal use and not necessarily for sharing so don't create issues or pull requests.

#### Air Quality Index

<img src=https://github.com/razvanh255/MagicMirror/blob/master/modules/pollution/pollution.png>

	{
		module: "pollution",
		position: "top_right",
		classes: "air quality",
		config: {
			lat: "",                      // your location latitude,
			lon: "",                      // your location longitude,
			appid: "",                    // your openweathermap API key,
			calculateAqi: false,          // calculate AQI from pollutants concentration
			showAqiTime: true,            // show last update time
			showPollution: true,          // snow list of all pollutants, hidding AQI calculation of all pollutants
			oneLoader: false,             // use onecall loader for API call
		}
	},


#### Air Quality Index with pollutans calculation accoring EU standards and oneLoader from Onecall 


	{
		module: "pollution",
		position: "top_right",
		header: "Air Quality Index",
		classes: "air quality",
		config: {
			calculateAqi: true,           // calculate AQI from pollutants concentration
			showAqiData: true,            // show AQI calculation pollutants, hidding last update
			showPollution: false,         // snow list of all pollutants, hidding AQI calculation of all pollutants
			oneLoader: true,              // use onecall loader for API call
		}
	},


	/*
	Quality   Index     Sub-index   CAQI calculation from highest pollutant concentration in μg/m3
	                                O3          NO2         PM10        PM25         SO2         NH3        CO
	Good        1       0-25        0-60        0-50        0-25        0-15         0-50        0-200      0-5000
	Fair        2       25-50       60-120      50-100      25-50       15-30        50-100      200-400    5000-7500
	Moderate    3       50-75       120-180     100-200     50-90       30-55        100-350     400-800    7500-10000
	Poor        4       75-100      180-240     200-400     90-180      55-110       350-500     800-1600   10000-20000
	Unhealty    5       > 100       > 240       > 400       > 180       > 110        > 500       > 1600     > 20000
	Source: https://www.airqualitynow.eu/download/CITEAIR-Comparing_Urban_Air_Quality_across_Borders.pdf
	*/

Air Quality compliments to put in your config.js


	compliments: {
		AQI_1 : [
			 "<i class=\"fa fa-leaf lime\"></i> Air Quality Good",
		],
		AQI_2 : [
			 "<i class=\"fa fa-leaf yellow\"></i> Air Quality Fair",
			],
		AQI_3 : [
			 "<i class=\"fa fa-leaf orange\"></i> Air Quality Moderate",
		],
		AQI_4 : [
			 "<i class=\"fa fa-leaf orangered\"></i> Air Quality Poor",
		],
		AQI_5 : [
			 "<i class=\"fa fa-leaf redrf\"></i> Air Quality Unhealty",
		],			
	}

Designed by Răzvan Cristea
https://github.com/razvanh255
Creative Commons BY-NC-SA 4.0, Romania.
