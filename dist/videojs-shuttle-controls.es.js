/*! @name videojs-shuttle-controls @version 1.1.1 @license MIT */
import videojs from 'video.js';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var version = "1.1.1";

var Plugin = videojs.getPlugin('plugin'); // Default options for the plugin.

var defaults = {
  playPauseKeys: [' ', 'k'],
  backwardKeys: ['j'],
  forwardKey: ['l'],
  backwardFrameKey: ['ArrowLeft'],
  forwardFrameKey: ['ArrowRight'],
  shiftMagnification: 10,
  fps: 30,
  playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
};
/**
 * @param {*} value
 */

function silencePromise(value) {
  if (value !== null && typeof value.then === 'function') {
    value.then(null, function (e) {});
  }
}
/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */


var ShuttleControls =
/*#__PURE__*/
function (_Plugin) {
  _inheritsLoose(ShuttleControls, _Plugin);

  /**
   * Create a ShuttleControls plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options] An optional options object.
   * @param  {String[]} [options.playPauseKeys]
   * @param  {String[]} [options.backwardKeys]
   * @param  {String[]} [options.forwardKey]
   * @param  {String[]} [options.backwardFrameKey]
   * @param  {String[]} [options.forwardFrameKey]
   * @param  {number} [options.shiftMagnification]
   * @param  {number} [options.fps]
   * @param  {Number[]} [options.playbackRates]
   */
  function ShuttleControls(player, options) {
    var _this;

    // the parent class will add player under this.player
    _this = _Plugin.call(this, player) || this;
    _this.options = videojs.mergeOptions(defaults, options);

    _this.player.ready(function () {
      _this.player.addClass('vjs-shuttle-controls');
    });

    _this.playPauseKeys = _this.options.playPauseKeys;
    _this.backwardKeys = _this.options.backwardKeys;
    _this.forwardKey = _this.options.forwardKey;
    _this.backwardFrameKey = _this.options.backwardFrameKey;
    _this.forwardFrameKey = _this.options.forwardFrameKey;
    _this.shiftMagnification = _this.options.shiftMagnification;
    _this.fps = _this.options.fps;
    _this.currentPlaybackRate = 1;
    _this.isPlaying = false;

    _this.player.on('play', function () {
      _this.isPlaying = true;
    });

    _this.player.on('keydown', function (e) {
      _this._onKeydown(e);
    });

    _this.playbackRates = _this.options.playbackRates;

    if (player.options_.playbackRates.length) {
      _this.playbackRates = player.options_.playbackRates;
    }

    return _this;
  }

  var _proto = ShuttleControls.prototype;

  _proto._onKeydown = function _onKeydown(e) {
    this._clearNegativeTimer();

    var mag = e.shiftKey ? this.shiftMagnification : 1;

    if (this.playPauseKeys.indexOf(e.key) > -1) {
      this._togglePlay();
    }

    if (this.forwardKey.indexOf(e.key) > -1) {
      this._shuttlePlaybackRate(1);
    }

    if (this.backwardKeys.indexOf(e.key) > -1) {
      this._shuttlePlaybackRate(-1);
    }

    if (this.forwardFrameKey.indexOf(e.key) > -1) {
      this.frameByFrame(mag);
    }

    if (this.backwardFrameKey.indexOf(e.key) > -1) {
      this.frameByFrame(-mag);
    }
  };

  _proto._togglePlay = function _togglePlay() {
    var player = this.player;

    if (!this.isPlaying) {
      this._play(1);

      silencePromise(player.play());
    } else {
      player.playbackRate(1);
      player.$('.vjs-playback-rate-value').innerHTML = '1x';

      this._clearNegativeTimer();

      this.isPlaying = false;
      player.pause();
    }
  };

  _proto._negativePlay = function _negativePlay(speed, player) {
    var frameTime = 1 / this.fps;
    this.isPlaying = true;
    player.pause();
    player.$('.vjs-playback-rate-value').innerHTML = speed + "x";
    var newTime = this.player.currentTime() + frameTime * speed;

    if (newTime < 0) {
      newTime = player.duration();
    }

    player.currentTime(newTime);
  };

  _proto._play = function _play(speed) {
    var _this2 = this;

    this.isPlaying = true;
    var player = this.player;
    this.currentPlaybackRate = speed;

    this._clearNegativeTimer();

    if (speed > 0) {
      player.playbackRate(speed);
      silencePromise(player.play());
    } else {
      var frameTime = 1 / this.fps;
      this.negativeTimer = setInterval(function () {
        _this2._negativePlay(speed, player);
      }, frameTime * 1000);
    }
  };

  _proto._clearNegativeTimer = function _clearNegativeTimer() {
    if (this.negativeTimer) {
      clearInterval(this.negativeTimer);
    }
  };

  _proto._shuttlePlaybackRate = function _shuttlePlaybackRate(step) {
    if (!this.isPlaying) {
      this._play(step);
    } else {
      var playbackRates = this.playbackRates;
      var nowRate = this.currentPlaybackRate;
      var nowIndex = playbackRates.indexOf(nowRate);
      var nextIndex = Math.min(Math.max(nowIndex + step, 0), playbackRates.length - 1);

      this._play(playbackRates[nextIndex]);
    }
  };

  _proto.frameByFrame = function frameByFrame(step) {
    var player = this.player;
    var frameTime = 1 / this.fps;
    player.pause();
    player.currentTime(this.player.currentTime() + frameTime * step);
  };

  return ShuttleControls;
}(Plugin); // Define default values for the plugin's `state` object here.


ShuttleControls.defaultState = {}; // Include the version number.

ShuttleControls.VERSION = version; // Register the plugin with video.js.

videojs.registerPlugin('shuttleControls', ShuttleControls);

export default ShuttleControls;
