(function (MemoryGame, Timer) {

  /**
   * Adapter between memory game and H5P.Timer
   *
   * @class H5P.MemoryGameCFRD.Timer
   * @extends H5P.Timer
   * @param {Element} element
   * @param {number} [startValue=0] Initial clock time in milliseconds.
   * @param {Object} [options]
   * @param {boolean} [options.countdown] Count down instead of up.
   * @param {number} [options.durationMs] Full countdown duration (used on reset).
   * @param {Function} [options.onZero] Called once when countdown reaches zero.
   */
  MemoryGame.Timer = function (element, startValue = 0, options = {}) {
    /** @alias H5P.MemoryGameCFRD.Timer# */
    var self = this;

    var isCountdown = !!options.countdown;
    var durationMs = options.durationMs || 0;
    var onZero = typeof options.onZero === 'function' ? options.onZero : null;
    var zeroFired = false;

    // Initialize event inheritance
    Timer.call(self, 100);

    /**
     * Apply mode and clock for count-up or countdown.
     *
     * @private
     * @param {number} value
     */
    var configureClock = function (value) {
      if (isCountdown) {
        self.setMode(Timer.BACKWARD);
        var ms = (value !== undefined && value !== null) ? value : durationMs;
        self.setClockTime(ms > 0 ? ms : 0);
      }
      else {
        self.setMode(Timer.FORWARD);
        self.setClockTime(value || 0);
      }
    };

    configureClock(startValue);

    // Avoid firing onZero during construction when restoring a finished countdown
    if (isCountdown && self.getTime() <= 0) {
      zeroFired = true;
    }

    /** @private {string} */
    var naturalState = element.innerText;

    /**
     * Format milliseconds as m:ss (minutes may exceed 59).
     * Examples: 30000 → 0:30, 180000 → 3:00, 1800000 → 30:00
     *
     * @private
     * @param {number} timeMs
     * @returns {{minutes: number, seconds: number, label: string}}
     */
    var formatClock = function (timeMs) {
      var totalSeconds = Math.floor(Math.max(0, timeMs) / 1000);
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;
      var secondsLabel = seconds < 10 ? '0' + seconds : String(seconds);
      return {
        minutes: minutes,
        seconds: seconds,
        label: minutes + ':' + secondsLabel
      };
    };

    /**
     * Fire onZero once when the countdown has reached the end.
     *
     * @private
     */
    var fireZero = function () {
      if (!isCountdown || !onZero || zeroFired) {
        return;
      }
      zeroFired = true;
      updateDisplay();
      onZero();
    };

    /**
     * Paint the clock label without triggering onZero.
     *
     * @private
     */
    var updateDisplay = function () {
      var time = Math.max(0, self.getTime());
      var formatted = formatClock(time);

      element.setAttribute(
        'datetime',
        'PT' + formatted.minutes + 'M' + formatted.seconds + 'S'
      );
      element.innerText = formatted.label;
    };

    /**
     * Periodic paint; also detects zero if notifications still run.
     *
     * @private
     */
    var update = function () {
      updateDisplay();
      if (isCountdown && self.getTime() <= 0) {
        fireZero();
      }
    };

    /**
     * Register recurring display updates and a near-zero one-shot.
     * Must be re-registered after reset clears them.
     *
     * Do not use calltime 0: H5P.Timer treats 0 as falsy and replaces it with
     * the current clock (fires immediately). calltime 1 is the earliest valid
     * absolute target for a countdown.
     *
     * Also listen to "stop": when BACKWARD hits <= 0, H5P.Timer stops without
     * running notifications, so every_tenth_second may never see time <= 0.
     *
     * @private
     */
    var registerNotifications = function () {
      self.notify('every_tenth_second', update);
      if (isCountdown && onZero) {
        self.notify({ calltime: 1 }, function () {
          fireZero();
        });
      }
    };

    registerNotifications();

    self.on('stop', function () {
      if (isCountdown && self.getTime() <= 0) {
        fireZero();
      }
    });

    self.on('reset', function () {
      zeroFired = false;
      element.innerText = naturalState;
      configureClock(isCountdown ? durationMs : 0);
      if (isCountdown && self.getTime() <= 0) {
        zeroFired = true;
      }
      registerNotifications();
      updateDisplay();
    });

    /**
     * Allow a new countdown cycle after a fail/finish without relying only on reset.
     */
    self.clearZeroFlag = function () {
      zeroFired = false;
    };

    updateDisplay();
  };

  // Inheritance
  MemoryGame.Timer.prototype = Object.create(Timer.prototype);
  MemoryGame.Timer.prototype.constructor = MemoryGame.Timer;

})(H5P.MemoryGameCFRD, H5P.Timer);
