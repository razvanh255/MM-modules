/* MagicMirror²
 * Module: Swatch .beat
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("swatch", {

	defaults: {
		logo_height: 30,
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		this.swatch();
		var self = this;
		setInterval(function() {
			self.swatch();
		}, 864);
	},

	notificationReceived: function (notification, payload, sender) {
		if (notification === "MIDNIGHT_NOTIFICATION") {
			this.swatch();
		}
	},

	swatch: function () {
		// CET Switzerland, Biel Meantime UTC+1
		var date = new Date();
		var hours = date.getUTCHours();
		var minutes = date.getUTCMinutes();

		// Calculează secunde și transformă în beats
		var seconds = (hours + 1) * 3600 + minutes * 60;
		var beats = Math.round(seconds / 86.4);

		// Formatăm beats pentru a avea întotdeauna 3 cifre
		this.beats = ("000" + beats).slice(-3);
		this.updateDom();
	},

	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "swatch";

		var swatch_logo = document.createElement("span");
		swatch_logo.className = "logo";
		swatch_logo.innerHTML = '<svg height="' + this.config.logo_height + '" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 607.31 108.58"><title>swatch</title><path id="path27756" d="M492.09,10.21a7.69,7.69,0,1,1,15.38,0,7.69,7.69,0,1,1-15.38,0Zm7.73,9.46a9.46,9.46,0,1,0-9.62-9.46A9.43,9.43,0,0,0,499.83,19.67Zm-2-8.72h1.89l2.88,4.69h1.81l-3-4.77a2.81,2.81,0,0,0,2.8-3c0-2.22-1.32-3.13-3.87-3.13h-4.19V15.64h1.73Zm0-1.4V6.18h2.22c1.15,0,2.39.25,2.39,1.56,0,1.73-1.23,1.81-2.63,1.81h-2" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27758" d="M81.59,23.86H25.25a23.34,23.34,0,0,0-16.61,7,22.55,22.55,0,0,0-6.5,16.21A23,23,0,0,0,8.71,63.7a22,22,0,0,0,15.87,6.43H59.46c7.48.06,13.08,5.36,13.16,12.62A13.52,13.52,0,0,1,59.38,95.82H1.72V107.9H59.46A25.82,25.82,0,0,0,84.71,82.75c-.25-14.07-11.1-24.58-25.25-24.7h-35a10,10,0,0,1-7.24-2.88,11.28,11.28,0,0,1-3.13-8.11,10.72,10.72,0,0,1,3.13-7.74A11.25,11.25,0,0,1,25.33,36H81.59V23.86" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27760" d="M184.56,23.45v57a16.08,16.08,0,0,1-4.77,11.46,15.68,15.68,0,0,1-11.27,4.6c-8.72.07-15.87-7.19-16.12-16.19V23.45h-12V80.61h0A15.34,15.34,0,0,1,136,91.82a16,16,0,0,1-11.6,4.71,14.8,14.8,0,0,1-10.77-4.47A15.71,15.71,0,0,1,109,80.57V23.45H96.89v57a28.15,28.15,0,0,0,8.06,20.1,27,27,0,0,0,19.41,8,27.73,27.73,0,0,0,20.15-8.31,31.08,31.08,0,0,0,2.14-2.39,27.92,27.92,0,0,0,49.93-17.43v-57h-12" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27762" d="M278.25,23.12h-26.4a43.11,43.11,0,0,0-43.76,42.31c.33,24.39,20,44,43.76,43.9a38.83,38.83,0,0,0,14.31-2.47V94.4h-1.4l-1.15.54A26.48,26.48,0,0,1,252,97.25c-17.44.07-31.67-14.2-31.91-31.81.25-17.12,14.15-30.47,31.67-30.23h20.4v72.35h12.09V23.12h-6" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27764" d="M328.09,96.54a15.14,15.14,0,0,1-10.69-4.59,13.73,13.73,0,0,1-3.95-9.89V35.21h28.87V23.12H313.45V1.41h-12V81.9a25.1,25.1,0,0,0,7.32,18.43,26.88,26.88,0,0,0,19.33,8.27H345.2V96.54H328.09" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27766" d="M415.93,78.73a31.14,31.14,0,0,1-28.62,18.52A31.48,31.48,0,0,1,364.69,88a31,31,0,0,1-9.13-22.43c-.16-17.3,14.15-31.5,31.75-31.75a30.87,30.87,0,0,1,24.92,13.06l10-6.89c-7.81-11.27-20.48-17.93-34.79-18.26-24.51.33-44.09,20-43.92,43.84a43,43,0,0,0,12.67,31A43.8,43.8,0,0,0,427,83.66l-11-4.93" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27768" d="M471.94,21.72A35.54,35.54,0,0,0,447.43,31V1.41H435.34V107.57h12.09V58.31a24.15,24.15,0,0,1,7.16-17.5,23.83,23.83,0,0,1,17.35-7A25,25,0,0,1,497.36,58.5v49.07h12.09V58.39a37.1,37.1,0,0,0-37.51-36.67" transform="translate(-1.72 -0.75)" fill="#fff"/><path id="path27770" d="M527,25.59h81.92v82H527Z" transform="translate(-1.72 -0.75)" fill="#da0d24" stroke="#da0d24" stroke-miterlimit="3.86" stroke-width="0.29"/><path id="path27772" d="M603.21,56.25h-25V31.35H557.57V56.25H531.9V76.92h25.66v25.65h20.64V76.92h25V56.25" transform="translate(-1.72 -0.75)" fill="#fff"/></svg>';
		wrapper.appendChild(swatch_logo);

		var beat = document.createElement("span");
		beat.style.fontSize = this.config.logo_height + "pt";
		beat.className = "beat bright";
		beat.innerHTML = " " + this.beats + " ";
		wrapper.appendChild(beat);

		var beats_logo = document.createElement("span");
		beats_logo.className = "logo";
		beats_logo.innerHTML = '<svg height="' + this.config.logo_height + '" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 606.08 205.46"><title>beat</title><path id="path27774" d="M1.87,142H54.19v60.48H1.87Z" transform="translate(-1.73 -0.96)" fill="#da0d24" stroke="#da0d24" stroke-width="0.29"/><path id="path27776" d="M136.6,127.26c0-27.12,1.15-48,16.7-48,16.78,0,17.6,18.36,17.6,46,0,24.58-.58,48-17.85,48C139.4,173.29,136.6,156.91,136.6,127.26ZM91.86,202.5h43.92V183.73h.49c3.45,10.48,12.75,22.65,33.23,22.65,30.68,0,47-22.08,47-79,0-47.29-6.74-81.54-44.17-81.54-12.75,0-26.65,4.24-34.3,20.67h-.58V1H91.86V202.5" transform="translate(-1.73 -0.96)" fill="#fff"/><path id="path27778" d="M281.77,107.08c0-20.69,2.55-33.15,17.44-33.15,12.58,0,15.38,11.61,15.38,33.15Zm76.9,26.65c0-52.15-3.95-87.93-60.62-87.93-49.51,0-61.85,31.81-61.85,74.9,0,45.46,4.52,85.72,61.85,85.72,37.75,0,58.4-18.28,59.22-56.05H314.92c-1.15,19.18-4.77,27.92-16.61,27.92-13.16,0-16.53-11.56-16.53-35.24v-9.3h76.9" transform="translate(-1.73 -0.96)" fill="#fff"/><path id="path27780" d="M422.83,155.41c0-8.41,2.22-13.18,7.07-16.82,4.28-3.36,10.53-3.65,25-11.22,0,6.17-.33,14-.33,26.64,0,15.14-8.8,20.74-18.42,20.74C427.6,174.75,422.83,167.46,422.83,155.41Zm.74-58.32c.25-13.57,3.95-21.37,16.78-21.37,10.28,0,14.56,6.06,14.56,15.59,0,11.66-2.55,13.91-16.53,17.55-12.75,3.36-29.69,6.17-41,12.34s-18.67,21-18.67,38.7c0,32.93,15.05,46.49,40.71,46.49,15.38,0,29.86-7.9,36.11-21.47h.58c.25,6,.82,12.17,2.55,17.55h44c-5.35-6.79-5.35-21.49-5.35-33V91.31c0-32.53-16.7-45.51-54.37-45.51-19.08,0-32.08,2.54-42.77,9.88s-16.94,20-17.19,41.4h40.63" transform="translate(-1.73 -0.96)" fill="#fff"/><path id="path27782" d="M541.1,81.38H522.18V49.75H541.1V4.84h45.57V49.75h21.14V81.38H586.67v77.11c0,10.73,3.95,14.13,14.72,14.13a49.7,49.7,0,0,0,6.42-.57v30.5a202.69,202.69,0,0,1-26.24,1.69c-31.5,0-40.47-5.65-40.47-41.27V81.38" transform="translate(-1.73 -0.96)" fill="#fff"/></svg>';
		wrapper.appendChild(beats_logo);

		return wrapper;
	}
});