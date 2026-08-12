(function (MemoryGame) {

  /**
   * Keeps track of the number of cards that has been turned
   *
   * @class H5P.MemoryGameCFRD.Counter
   * @param {H5P.jQuery} $container
   * @param {number} [startValue=0]
   * @param {number} [maxTurns] Optional maximum; when set, display is "current / max".
   */
  MemoryGame.Counter = function ($container, startValue = 0, maxTurns) {
    /** @alias H5P.MemoryGameCFRD.Counter# */
    var self = this;

    var current = startValue;
    var limit = (maxTurns && maxTurns > 0) ? maxTurns : null;

    /**
     * @private
     */
    self.update = function () {
      var text = limit ? (current + ' / ' + limit) : String(current);
      var el = $container[0];
      el.innerHTML = text + '<span class="h5p-memory-hidden-read">.</span>';
    };

    /**
     * Get current count.
     * @returns {number} Current count.
     */
    self.getCount = () => {
      return current;
    };

    /**
     * @returns {number|null} Configured turn limit, if any.
     */
    self.getLimit = function () {
      return limit;
    };

    /**
     * Whether the current count has reached the configured limit.
     * @returns {boolean}
     */
    self.hasReachedLimit = function () {
      return !!limit && current >= limit;
    };

    /**
     * Increment the counter.
     */
    self.increment = function () {
      current++;
      self.update();
    };

    /**
     * Revert counter back to its natural state
     */
    self.reset = function () {
      current = 0;
      self.update();
    };

    self.update();
  };

})(H5P.MemoryGameCFRD);
