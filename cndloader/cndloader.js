/* MagicMirror²
 * Module: CDN js & css loader
 *
 * Redesigned by Răzvan Cristea
 * for iPad 3 & HD display
 *
 * https://github.com/cristearazvanh
 * Creative Commons BY-NC-SA 4.0, Romania. 
 *
 * Original MagicMirror² MIT Licensed.
 */
Module.register("cndloader", {

    async start() {
        Log.info("Starting module: " + this.name);
        //	loadResources();
    },

    getScripts () {
		return [
			'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment-with-locales.min.js',
	        'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.46/moment-timezone-with-data.min.js',
	        'https://cdnjs.cloudflare.com/ajax/libs/nunjucks/3.2.4/nunjucks.min.js',
	        'https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js',
	        'https://cdnjs.cloudflare.com/ajax/libs/croner/8.1.2/croner.umd.min.js'
		];
	},

	getStyles () {
		return [
			'https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.12/css/weather-icons.min.css',
	        'https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.12/css/weather-icons-wind.min.css',
	        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
	        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/v4-shims.min.css',
	        'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
		];
	},

/* For test only */

    async loadResources() {
        try {
        	await this.getFiles();
            Log.info("All scripts and styles loaded successfully.");
        } catch (error) {
            Log.error("Error loading resources: ", error);
        }
    },

	loadScript(url) {
	    return new Promise((resolve, reject) => {
	        if (document.querySelector(`script[src="${url}"]`)) {
	            Log.info(`Script already loaded: ${url}`);
	            resolve();
	            return;
	        }

	        const script = document.createElement('script');
	        script.src = url;
	        script.onload = () => {
	            Log.info(`Loaded script: ${url}`);
	            resolve();
	        };
	        script.onerror = () => {
	            Log.error(`Failed to load script: ${url}`);
	            reject(new Error(`Script load error: ${url}`));
	        };
	        document.body.appendChild(script);
	    });
	},

	loadStyle(url) {
	    return new Promise((resolve, reject) => {
	        if (document.querySelector(`link[href="${url}"]`)) {
	            Log.info(`Style already loaded: ${url}`);
	            resolve();
	            return;
	        }

	        const link = document.createElement('link');
	        link.rel = 'stylesheet';
	        link.href = url;
	        link.onload = () => {
	            Log.info(`Loaded style: ${url}`);
	            resolve();
	        };
	        link.onerror = () => {
	            Log.error(`Failed to load style: ${url}`);
	            reject(new Error(`Style load error: ${url}`));
	        };
	        document.head.appendChild(link);
	    });
	},

    async getFiles() {
        const scripts = [
		//	'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js',
		//	'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment-with-locales.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.46/moment-timezone-with-data.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/nunjucks/3.2.4/nunjucks.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.9.0/suncalc.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/croner/8.1.2/croner.umd.min.js'
        ];

        for (const script of scripts) {
            await this.loadScript(script);
        }

        const styles = [
		//	"https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css",
		//	"https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css",
            'https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.12/css/weather-icons.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.12/css/weather-icons-wind.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/v4-shims.min.css'
        ];

        for (const style of styles) {
            await this.loadStyle(style);
        }
    }
});
