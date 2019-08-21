import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
  playPauseKeys: [' ', 'k'],
  backwardKeys: ['j'],
  forwardKey: ['l'],
  fps: 30,
  playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
};

/**
 * @param {*} value
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
   * @param  {number} [options.fps]
   * @param  {Number[]} [options.playbackRates]
   */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-shuttle-controls');
    });

    this.playPauseKeys = this.options.playPauseKeys;
    this.backwardKeys = this.options.backwardKeys;
    this.forwardKey = this.options.forwardKey;
    this.fps = this.options.fps;

    this.currentPlaybackRate = 1;
    this.isPlaying = false;

    this.player.on('play', () => {
      this.isPlaying = true;
    });
    this.player.on('keydown', (e) => {
      this._onKeydown(e);
    });
    this.playbackRates = this.options.playbackRates;
    if (player.options_.playbackRates.length) {
      this.playbackRates = player.options_.playbackRates;
    }
  }

  _onKeydown(e) {
    this._clearNegativeTimer();
    if (this.playPauseKeys.indexOf(e.key) > -1) {
      this._togglePlay();
    }
    if (this.forwardKey.indexOf(e.key) > -1) {
      this._shuttlePlaybackRate(1);
    }
    if (this.backwardKeys.indexOf(e.key) > -1) {
      this._shuttlePlaybackRate(-1);
    }
  }

  _togglePlay() {
    const player = this.player;

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
  }

  _negativePlay(speed, player) {
    const frameTime = 1 / (this.fps);

    this.isPlaying = true;
    player.pause();
    player.$('.vjs-playback-rate-value').innerHTML = `${speed}x`;
    let newTime = this.player.currentTime() + frameTime * speed;

    if (newTime < 0) {
      newTime = player.duration();
    }
    player.currentTime(newTime);

  }

  _play(speed) {
    this.isPlaying = true;

    const player = this.player;

    this.currentPlaybackRate = speed;
    this._clearNegativeTimer();
    if (speed > 0) {
      player.playbackRate(speed);
      silencePromise(player.play());
    } else {
      const frameTime = 1 / (this.fps);

      this.negativeTimer = setInterval(() => {
        this._negativePlay(speed, player);
      }, frameTime * 1000);
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
}

// Define default values for the plugin's `state` object here.
ShuttleControls.defaultState = {};

// Include the version number.
ShuttleControls.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('shuttleControls', ShuttleControls);

export default ShuttleControls;
