Module.register("phases", {
    defaults: {
        updateInterval: 60 * 60 * 1000,
        animationSpeed: config.animation,
        moonPhasesNightOnly: false,
        nightStart: 19,
        nightEnd: 6,
        width: "100",
        height: "100"
    },

    start: function() {
        Log.info('Starting module: ' + this.name);
        this.updateDom(this.config.animationSpeed);
        setInterval(() => {
            this.updateDom(this.config.animationSpeed);
        }, this.config.updateInterval);
    },

    getHeader: function () {
        return this.data.header || `<i class="fa fa-moon mooncolor"></i> &nbsp; ${this.translate("Moon_Phases")}`;
    },

    getStyles: function () {
        return ["phases.css"];
    },

    getTranslations: function () {
        return {
            en: "en.json",
            ro: "ro.json"
        };
    },

    notificationReceived: function (notification) {
        if (notification === "MIDNIGHT_NOTIFICATION") {
            this.updateDom();
        }
    },

    getDom: function() {
        const date = new Date();
        const jd = this.calculateJulianDate(date);
        const { image, phase } = this.calculateMoonPhase(jd);

        if (this.config.moonPhasesNightOnly) {
            const hour = date.getHours();
            if (hour < this.config.nightStart && hour >= this.config.nightEnd) return document.createElement("div");
        }

        this.sendNotification("MOON_PHASE", { phase: phase });

        const wrapper = document.createElement("div");
        wrapper.style.height = `calc(${this.config.height / 2}px)`;

        const img = document.createElement("img");
        img.style.height = `${this.config.height}px`;
        img.style.width = `${this.config.width}px`;
        img.src = `modules/phases/pix/${image}`;
        wrapper.appendChild(img);

        const txt = document.createElement("span");
        txt.className = "medium bright";
        txt.style.cssFloat = "left";
        txt.innerHTML = this.translate(phase);
        wrapper.appendChild(txt);

        return wrapper;
    },

    calculateMoonPhase: function(jd) {
        const phases = [
            { limit: 0.5, image: 'wanecres2.png', phase: "waning_crescent" },
            { limit: 1, image: 'wanecres1.png', phase: "new_moon" },
            { limit: 1.5, image: 'newmoon.png', phase: "new_moon" },
            { limit: 2, image: 'waxcres1.png', phase: "new_moon" },
            { limit: 2.5, image: 'waxcres5.png', phase: "waxing_crescent" },
            { limit: 3, image: 'waxcres6.png', phase: "waxing_crescent" },
            { limit: 3.5, image: 'waxcres11.png', phase: "waxing_crescent" },
            { limit: 4, image: 'waxcres17.png', phase: "waxing_crescent" },
            { limit: 4.5, image: 'waxcres23.png', phase: "waxing_crescent" },
            { limit: 5, image: 'waxcres24.png', phase: "waxing_crescent" },
            { limit: 5.5, image: 'waxcres26.png', phase: "waxing_crescent" },
            { limit: 6, image: 'waxcres32.png', phase: "waxing_crescent" },
            { limit: 6.5, image: 'waxcres33.png', phase: "waxing_crescent" },
            { limit: 7, image: 'waxcres35.png', phase: "waxing_crescent" },
            { limit: 7.5, image: 'waxcres41.png', phase: "waxing_crescent" },
            { limit: 8, image: 'waxcres42.png', phase: "waxing_crescent" },
            { limit: 8.5, image: 'waxcres46.png', phase: "first_quarter" },
            { limit: 9, image: 'waxcres50.png', phase: "first_quarter" },
            { limit: 9.5, image: 'waxgib52.png', phase: "first_quarter" },
            { limit: 10, image: 'waxgib56.png', phase: "waxing_gibbous" },
            { limit: 10.5, image: 'waxgib62.png', phase: "waxing_gibbous" },
            { limit: 11, image: 'waxgib69.png', phase: "waxing_gibbous" },
            { limit: 11.5, image: 'waxgib77.png', phase: "waxing_gibbous" },
            { limit: 12, image: 'waxgib82.png', phase: "waxing_gibbous" },
            { limit: 12.5, image: 'waxgib86.png', phase: "waxing_gibbous" },
            { limit: 13, image: 'waxgib87.png', phase: "waxing_gibbous" },
            { limit: 13.5, image: 'waxgib90.png', phase: "waxing_gibbous" },
            { limit: 14, image: 'waxgib93.png', phase: "waxing_gibbous" },
            { limit: 14.5, image: 'waxgib96.png', phase: "waxing_gibbous" },
            { limit: 15, image: 'waxgib98.png', phase: "waxing_gibbous" },
            { limit: 15.5, image: 'waxgib99.png', phase: "full_moon" },
            { limit: 16, image: 'fullmoon.png', phase: "full_moon" },
            { limit: 16.5, image: 'wanegib98.png', phase: "full_moon" },
            { limit: 17, image: 'wanegib96.png', phase: "waning_gibbous" },
            { limit: 17.5, image: 'wanegib93.png', phase: "waning_gibbous" },
            { limit: 18, image: 'wanegib92.png', phase: "waning_gibbous" },
            { limit: 18.5, image: 'wanegib89.png', phase: "waning_gibbous" },
            { limit: 19, image: 'wanegib86.png', phase: "waning_gibbous" },
            { limit: 19.5, image: 'wanegib85.png', phase: "waning_gibbous" },
            { limit: 20, image: 'wanegib81.png', phase: "waning_gibbous" },
            { limit: 20.5, image: 'wanegib77.png', phase: "waning_gibbous" },
            { limit: 21, image: 'wanegib75.png', phase: "waning_gibbous" },
            { limit: 21.5, image: 'wanegib71.png', phase: "waning_gibbous" },
            { limit: 22, image: 'wanegib67.png', phase: "waning_gibbous" },
            { limit: 22.5, image: 'wanegib60.png', phase: "waning_gibbous" },
            { limit: 23, image: 'wanegib56.png', phase: "waning_gibbous" },
            { limit: 23.5, image: 'wanegib54.png', phase: "third_quarter" },
            { limit: 24, image: 'wanecres49.png', phase: "third_quarter" },
            { limit: 24.5, image: 'wanecres45.png', phase: "third_quarter" },
            { limit: 25, image: 'wanecres38.png', phase: "waning_crescent" },
            { limit: 25.5, image: 'wanecres28.png', phase: "waning_crescent" },
            { limit: 26, image: 'wanecres25.png', phase: "waning_crescent" },
            { limit: 26.5, image: 'wanecresb19.png', phase: "waning_crescent" },
            { limit: 27, image: 'wanecres17.png', phase: "waning_crescent" },
            { limit: 27.5, image: 'wanecres15.png', phase: "waning_crescent" },
            { limit: 28, image: 'wanecres12.png', phase: "waning_crescent" },
            { limit: 28.5, image: 'wanecres10.png', phase: "waning_crescent" },
            { limit: 29, image: 'wanecres8.png', phase: "waning_crescent" },
            { limit: 29.5, image: 'wanecres6.png', phase: "waning_crescent" }
        ];

        let daysSinceNew = jd - 2451549.5;
        let phase = (daysSinceNew / 29.5306) % 1 * 29.5306;

        for (let item of phases) {
            if (phase < item.limit) {
                return item;
            }
        }
        return phases[0];
        //Log.info(phase);
    },

    calculateJulianDate: function(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (month < 3) { year--; month += 12; }

        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    }
});
