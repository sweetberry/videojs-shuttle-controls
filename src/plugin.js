import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
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
    value.then(null, function(e) {
    });
  }
}

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class ShuttleControls extends Plugin {

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
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.obj.merge(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-shuttle-controls');
    });

    this.playPauseKeys = this.options.playPauseKeys;
    this.backwardKeys = this.options.backwardKeys;
    this.forwardKey = this.options.forwardKey;
    this.backwardFrameKey = this.options.backwardFrameKey;
    this.forwardFrameKey = this.options.forwardFrameKey;
    this.inKey = this.options.inKey;
    this.outKey = this.options.outKey;
    this.inTime = this.options.inTime;
    this.outTime = this.options.outTime;
    this.shiftMagnification = this.options.shiftMagnification;

    this.fps = this.options.fps;

    this.currentPlaybackRate = 1;
    this.isPlaying = false;

    this.player.on('keydown', (e) => {
      this._onKeydown(e);
    });
    this.playbackRates = this.options.playbackRates;
    if (player.options_.playbackRates.length) {
      this.playbackRates = player.options_.playbackRates;
    }

    this.player.on('ratechange', () => {
      const speed = this.player.playbackRate();

      if (this.isPlaying) {
        this._play(speed);
      } else {
        this.player.$('.vjs-playback-rate-value').innerHTML = `${speed}x`;
        this.currentPlaybackRate = speed;
      }

    });
    this.player.one('play', () => {
      this.isPlaying = true;
    });
    this._tweakMenuStyles();
    this._listenPlayControlButton();
    this._createMarkers();
  }

  _tweakMenuStyles() {
    const liArray = videojs.dom.$$('.vjs-menu li');

    liArray.forEach((li) => {
      li.style['font-size'] = 'inherit';
      li.style.padding = '0';
    });
  }

  _listenPlayControlButton() {
    const buttonDom = videojs.dom.$('.vjs-play-control');
    const techDom = videojs.dom.$('.vjs-tech');
    const playControlHandler = () => {
      if (techDom.parentNode.id == this.player.id) {
        const hasPaused = videojs.dom.hasClass(techDom.parentNode, 'vjs-paused');
        const currentPlaybackRate = this.currentPlaybackRate;
        const isNegativePlaying = this.isPlaying && currentPlaybackRate < 0 && hasPaused;
        const isNegativePause = !this.isPlaying && currentPlaybackRate < 0 && hasPaused;
        const isPositivePlaying = this.isPlaying && currentPlaybackRate > 0 && !hasPaused;
        const isPositivePause = !this.isPlaying && currentPlaybackRate > 0 && hasPaused;

        if (isNegativePlaying || isPositivePlaying) {
          this._playPause();
        }
        if (isNegativePause || isPositivePause) {
          this._play(currentPlaybackRate);
        }
      }
    };

    buttonDom.addEventListener('click', playControlHandler);
    techDom.addEventListener('click', playControlHandler);
  }

  _onKeydown(e) {
    this._clearNegativeTimer();
    this._clearLoopTimer();

    const mag = e.shiftKey ? this.shiftMagnification : 1;

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
  }

  _updateInTime() {
    const isPlaying = this.isPlaying;
    const currentPlaybackRate = this.currentPlaybackRate;

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
  }

  _updateOutTime() {
    const isPlaying = this.isPlaying;
    const currentPlaybackRate = this.currentPlaybackRate;

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
  }

  _playPause() {
    const player = this.player;

    this._clearLoopTimer();
    this._clearNegativeTimer();
    this.isPlaying = false;
    // console.log(this.isPlaying);
    const buttonDom = videojs.dom.$('.vjs-play-control');

    if (videojs.dom.hasClass(buttonDom, 'vjs-playing')) {
      videojs.dom.toggleClass(buttonDom, 'vjs-paused');
      videojs.dom.toggleClass(buttonDom, 'vjs-playing');
    }
    player.pause();
  }

  _ResetPlaybackRate() {
    const player = this.player;

    this.currentPlaybackRate = 1;
    player.playbackRate(1);
    player.$('.vjs-playback-rate-value').innerHTML = '1x';
  }

  _togglePlay() {
    const player = this.player;

    if (!this.isPlaying) {
      this._play(1);
      silencePromise(player.play());
    } else {
      this._playPause();
      this._ResetPlaybackRate();
    }
  }

  _negativePlay(speed) {
    const player = this.player;
    const frameTime = 1 / (this.fps);
    const buttonDom = videojs.dom.$('.vjs-play-control');

    if (videojs.dom.hasClass(buttonDom, 'vjs-paused')) {
      videojs.dom.toggleClass(buttonDom, 'vjs-paused');
      videojs.dom.toggleClass(buttonDom, 'vjs-playing');
    }
    this.isPlaying = true;
    player.pause();
    player.$('.vjs-playback-rate-value').innerHTML = `${speed}x`;
    let newTime = this.player.currentTime() + frameTime * speed;

    if (newTime < 0) {
      newTime = player.duration();
    }
    player.currentTime(newTime);

  }

  _loop(speed) {
    const player = this.player;
    const inTime = this.inTime || 0;
    const outTime = this.outTime || player.duration();
    const currentTime = this.player.currentTime();
    const frameTime = 1 / (this.fps);

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

  }

  _play(speed) {
    this.isPlaying = true;

    const player = this.player;
    const frameTime = 1 / (this.fps);

    this.currentPlaybackRate = speed;
    this._clearLoopTimer();
    this._clearNegativeTimer();
    if (speed > 0) {
      player.playbackRate(speed);
      silencePromise(player.play());
    } else {
      this.negativeTimer = setInterval(() => {
        this._negativePlay(speed);
      }, frameTime * 1000);
    }

    this.loopTimer = setInterval(() => {
      this._loop(speed);
    }, frameTime * 1000);
  }

  _clearLoopTimer() {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
    }
  }

  _clearNegativeTimer() {
    if (this.negativeTimer) {
      clearInterval(this.negativeTimer);
    }
  }

  _shuttlePlaybackRate(step) {
    if (!this.isPlaying) {
      this._play(step);
    } else {
      const playbackRates = this.playbackRates;
      const nowRate = this.currentPlaybackRate;
      const nowIndex = playbackRates.indexOf(nowRate);
      const nextIndex = Math.min(Math.max(nowIndex + step, 0), playbackRates.length - 1);

      this._play(playbackRates[nextIndex]);
    }
  }

  frameByFrame(step) {
    const player = this.player;
    const frameTime = 1 / this.fps;

    player.pause();
    player.currentTime(this.player.currentTime() + frameTime * step);
  }

  _createMarkers() {
    const player = this.player;
    const inMarkerStyle = {
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
    const outMarkerStyle = {
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
    const inMarker = videojs.dom.createEl('div', {}, {
      id: 'vjs_shuttleControls_inMarker'
    });

    const outMarker = videojs.dom.createEl('div', {}, {
      id: 'vjs_shuttleControls_outMarker'
    });

    Object.keys(inMarkerStyle).forEach((key) => {
      inMarker.style[key] = inMarkerStyle[key];
    });

    Object.keys(outMarkerStyle).forEach((key) => {
      outMarker.style[key] = outMarkerStyle[key];
    });

    player.el().querySelector('.vjs-progress-holder')
      .appendChild(inMarker);
    player.el().querySelector('.vjs-progress-holder')
      .appendChild(outMarker);

    this.inMarker = inMarker;
    this.outMarker = outMarker;
  }

  _updateMarkers() {
    const player = this.player;
    const inTime = this.inTime || 0;
    const outTime = this.outTime || player.duration();
    const inPosition = (inTime / player.duration()) * 100;
    const outPosition = (outTime / player.duration()) * 100;
    const inMarker = this.inMarker;
    const outMarker = this.outMarker;

    inMarker.style.left = `${inPosition}%`;
    outMarker.style.left = `${outPosition}%`;
  }

}

// Define default values for the plugin's `state` object here.
ShuttleControls.defaultState = {};

// Include the version number.
ShuttleControls.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('shuttleControls', ShuttleControls);

export default ShuttleControls;
