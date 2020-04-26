/*! @name videojs-shuttle-controls @version 1.2.2 @license MIT */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = global || self, global.videojsShuttleControls = factory(global.videojs));
}(this, (function (videojs) { 'use strict';

  videojs = videojs && Object.prototype.hasOwnProperty.call(videojs, 'default') ? videojs['default'] : videojs;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var version = "1.2.2";

  var Plugin = videojs.getPlugin('plugin'); // Default options for the plugin.

  var defaults = {
    playPauseKeys: [' ', 'k'],
    backwardKeys: ['j'],
    forwardKey: ['l'],
    backwardFrameKey: ['ArrowLeft'],
    forwardFrameKey: ['ArrowRight'],
    inKey: ['i'],
    outKey: ['o'],
    inTime: null,
    outTime: null,
    shiftMagnification: 10,
    fps: 30,
    playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
  };
  /**
   * @param {Promise} value
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


  var ShuttleControls = /*#__PURE__*/function (_Plugin) {
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
     * @param  {String[]} [options.inKey]
     * @param  {String[]} [options.outKey]
     * @param  {!number} [options.inTime]
     * @param  {!number} [options.outTime]
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
      _this.inKey = _this.options.inKey;
      _this.outKey = _this.options.outKey;
      _this.inTime = _this.options.inTime;
      _this.outTime = _this.options.outTime;
      _this.shiftMagnification = _this.options.shiftMagnification;
      _this.fps = _this.options.fps;
      _this.currentPlaybackRate = 1;
      _this.isPlaying = false;

      _this.player.on('keydown', function (e) {
        _this._onKeydown(e);
      });

      _this.playbackRates = _this.options.playbackRates;

      if (player.options_.playbackRates.length) {
        _this.playbackRates = player.options_.playbackRates;
      }

      _this.player.on('ratechange', function () {
        var speed = _this.player.playbackRate();

        if (_this.isPlaying) {
          _this._play(speed);
        } else {
          _this.player.$('.vjs-playback-rate-value').innerHTML = speed + "x";
          _this.currentPlaybackRate = speed;
        }
      });

      _this.player.one('play', function () {
        _this.isPlaying = true;
      });

      _this._tweakMenuStyles();

      _this._listenPlayControlButton();

      _this._createMarkers();

      return _this;
    }

    var _proto = ShuttleControls.prototype;

    _proto._tweakMenuStyles = function _tweakMenuStyles() {
      var liArray = videojs.dom.$$('.vjs-menu li');
      liArray.forEach(function (li) {
        li.style['font-size'] = 'inherit';
        li.style.padding = '0';
      });
    };

    _proto._listenPlayControlButton = function _listenPlayControlButton() {
      var _this2 = this;

      var buttonDom = videojs.dom.$('.vjs-play-control');
      var techDom = videojs.dom.$('.vjs-tech');

      var playControlHandler = function playControlHandler() {
        var hasPaused = videojs.dom.hasClass(techDom.parentNode, 'vjs-paused');
        var currentPlaybackRate = _this2.currentPlaybackRate;
        var isNegativePlaying = _this2.isPlaying && currentPlaybackRate < 0 && hasPaused;
        var isNegativePause = !_this2.isPlaying && currentPlaybackRate < 0 && hasPaused;
        var isPositivePlaying = _this2.isPlaying && currentPlaybackRate > 0 && !hasPaused;
        var isPositivePause = !_this2.isPlaying && currentPlaybackRate > 0 && hasPaused;

        if (isNegativePlaying || isPositivePlaying) {
          _this2._playPause();
        }

        if (isNegativePause || isPositivePause) {
          _this2._play(currentPlaybackRate);
        }
      };

      buttonDom.addEventListener('click', playControlHandler);
      techDom.addEventListener('click', playControlHandler);
    };

    _proto._onKeydown = function _onKeydown(e) {
      this._clearNegativeTimer();

      this._clearLoopTimer();

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

      if (this.inKey.indexOf(e.key) > -1) {
        this._updateInTime();

        this._updateMarkers();
      }

      if (this.outKey.indexOf(e.key) > -1) {
        this._updateOutTime();

        this._updateMarkers();
      }
    };

    _proto._updateInTime = function _updateInTime() {
      var isPlaying = this.isPlaying;
      var currentPlaybackRate = this.currentPlaybackRate;
      this.inTime = this.player.currentTime();

      if (this.outTime && this.inTime > this.outTime) {
        this.outTime = this.inTime;
      }

      if (isPlaying && currentPlaybackRate < 0) {
        this.player.currentTime(this.outTime || this.player.duration());
      }

      if (isPlaying) {
        this._play(currentPlaybackRate);
      }
    };

    _proto._updateOutTime = function _updateOutTime() {
      var isPlaying = this.isPlaying;
      var currentPlaybackRate = this.currentPlaybackRate;
      this.outTime = this.player.currentTime();

      if (this.inTime && this.inTime > this.outTime) {
        this.inTime = this.outTime;
      }

      if (isPlaying && currentPlaybackRate > 0) {
        this.player.currentTime(this.inTime || 0);
      }

      if (isPlaying) {
        this._play(currentPlaybackRate);
      }
    };

    _proto._playPause = function _playPause() {
      var player = this.player;

      this._clearLoopTimer();

      this._clearNegativeTimer();

      this.isPlaying = false; // console.log(this.isPlaying);

      var buttonDom = videojs.dom.$('.vjs-play-control');

      if (videojs.dom.hasClass(buttonDom, 'vjs-playing')) {
        videojs.dom.toggleClass(buttonDom, 'vjs-paused');
        videojs.dom.toggleClass(buttonDom, 'vjs-playing');
      }

      player.pause();
    };

    _proto._ResetPlaybackRate = function _ResetPlaybackRate() {
      var player = this.player;
      this.currentPlaybackRate = 1;
      player.playbackRate(1);
      player.$('.vjs-playback-rate-value').innerHTML = '1x';
    };

    _proto._togglePlay = function _togglePlay() {
      var player = this.player;

      if (!this.isPlaying) {
        this._play(1);

        silencePromise(player.play());
      } else {
        this._playPause();

        this._ResetPlaybackRate();
      }
    };

    _proto._negativePlay = function _negativePlay(speed) {
      var player = this.player;
      var frameTime = 1 / this.fps;
      var buttonDom = videojs.dom.$('.vjs-play-control');

      if (videojs.dom.hasClass(buttonDom, 'vjs-paused')) {
        videojs.dom.toggleClass(buttonDom, 'vjs-paused');
        videojs.dom.toggleClass(buttonDom, 'vjs-playing');
      }

      this.isPlaying = true;
      player.pause();
      player.$('.vjs-playback-rate-value').innerHTML = speed + "x";
      var newTime = this.player.currentTime() + frameTime * speed;

      if (newTime < 0) {
        newTime = player.duration();
      }

      player.currentTime(newTime);
    };

    _proto._loop = function _loop(speed) {
      var player = this.player;
      var inTime = this.inTime || 0;
      var outTime = this.outTime || player.duration();
      var currentTime = this.player.currentTime();
      var frameTime = 1 / this.fps;

      if (this.isPlaying && inTime === outTime) {
        this._playPause();

        this._ResetPlaybackRate();

        player.currentTime(inTime);
      } else if (this.isPlaying && speed > 0) {
        if (currentTime < inTime) {
          player.currentTime(inTime + frameTime * speed);
        } else if (currentTime > outTime) {
          player.currentTime(inTime + frameTime * speed);
        }
      } else if (this.isPlaying) {
        if (currentTime < inTime) {
          player.currentTime(outTime + frameTime * speed);
        } else if (currentTime > outTime) {
          player.currentTime(outTime + frameTime * speed);
        }
      }
    };

    _proto._play = function _play(speed) {
      var _this3 = this;

      this.isPlaying = true;
      var player = this.player;
      var frameTime = 1 / this.fps;
      this.currentPlaybackRate = speed;

      this._clearLoopTimer();

      this._clearNegativeTimer();

      if (speed > 0) {
        player.playbackRate(speed);
        silencePromise(player.play());
      } else {
        this.negativeTimer = setInterval(function () {
          _this3._negativePlay(speed);
        }, frameTime * 1000);
      }

      this.loopTimer = setInterval(function () {
        _this3._loop(speed);
      }, frameTime * 1000);
    };

    _proto._clearLoopTimer = function _clearLoopTimer() {
      if (this.loopTimer) {
        clearInterval(this.loopTimer);
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

    _proto._createMarkers = function _createMarkers() {
      var player = this.player;
      var inMarkerStyle = {
        'position': 'absolute',
        'width': '0',
        'height': '0',
        'display': 'inline-block',
        'border-style': 'solid',
        'border-width': ' 0 5px 10px 0',
        'border-color': 'transparent #ffffff transparent transparent',
        'bottom': '5px',
        'margin-left': '-5px',
        'left': '0%'
      };
      var outMarkerStyle = {
        'position': 'absolute',
        'width': '0',
        'height': '0',
        'display': 'inline-block',
        'border-style': 'solid',
        'border-width': '10px 5px 0 0',
        'border-color': '#ffffff transparent transparent transparent',
        'bottom': '5px',
        'left': '100%'
      };
      var inMarker = videojs.dom.createEl('div', {}, {
        id: 'vjs_shuttleControls_inMarker'
      });
      var outMarker = videojs.dom.createEl('div', {}, {
        id: 'vjs_shuttleControls_outMarker'
      });
      Object.keys(inMarkerStyle).forEach(function (key) {
        inMarker.style[key] = inMarkerStyle[key];
      });
      Object.keys(outMarkerStyle).forEach(function (key) {
        outMarker.style[key] = outMarkerStyle[key];
      });
      player.el().querySelector('.vjs-progress-holder').appendChild(inMarker);
      player.el().querySelector('.vjs-progress-holder').appendChild(outMarker);
      this.inMarker = inMarker;
      this.outMarker = outMarker;
    };

    _proto._updateMarkers = function _updateMarkers() {
      var player = this.player;
      var inTime = this.inTime || 0;
      var outTime = this.outTime || player.duration();
      var inPosition = inTime / player.duration() * 100;
      var outPosition = outTime / player.duration() * 100;
      var inMarker = this.inMarker;
      var outMarker = this.outMarker;
      inMarker.style.left = inPosition + "%";
      outMarker.style.left = outPosition + "%";
    };

    return ShuttleControls;
  }(Plugin); // Define default values for the plugin's `state` object here.


  ShuttleControls.defaultState = {}; // Include the version number.

  ShuttleControls.VERSION = version; // Register the plugin with video.js.

  videojs.registerPlugin('shuttleControls', ShuttleControls);

  return ShuttleControls;

})));
