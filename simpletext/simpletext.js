/* MagicMirror²
 * Module: simpletext
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("simpletext",{

	defaults: {
		text: "",
		cssClass: "medium"
	},

	getScripts: function () {
		return false;
	},
	
	getStyles: function () {
		return [
				//	"fontawesome.css"
				];
	},

	start: function () {
		Log.info("Starting module: " + this.name); 
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = this.config.cssClass;
		wrapper.innerHTML = this.config.text;
		return wrapper;
	},

	getHeader: function () {
		return this.data.header;
	},
});
