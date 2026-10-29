import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import videojs from 'video.js';
import plugin from '../src/plugin.js';

// jsdom lacks HTMLMediaElement methods; stub them to prevent console warnings
window.HTMLMediaElement.prototype.load = () => {};
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

const Player = videojs.getComponent('Player');

describe('videojs-shuttle-controls', () => {
  it('the environment is sane', () => {
    expect(typeof Array.isArray).toBe('function');
    expect(typeof vi).toBe('object');
    expect(typeof videojs).toBe('function');
    expect(typeof plugin).toBe('function');
  });

  describe('plugin registration and initialization', () => {
    let fixture;
    let video;
    let player;

    beforeEach(() => {
      vi.useFakeTimers();

      fixture = document.createElement('div');
      fixture.id = 'qunit-fixture';
      document.body.appendChild(fixture);

      video = document.createElement('video');
      fixture.appendChild(video);

      player = videojs(video);
    });

    afterEach(() => {
      if (player) {
        player.dispose();
      }
      if (fixture && fixture.parentNode) {
        fixture.parentNode.removeChild(fixture);
      }
      vi.useRealTimers();
    });

    it('registers itself with video.js', () => {
      expect(typeof Player.prototype.shuttleControls).toBe('function');

      const instance = player.shuttleControls();

      // Tick the clock forward enough to trigger the player to be "ready".
      vi.advanceTimersByTime(10);

      expect(player.hasClass('vjs-shuttle-controls')).toBe(true);
      expect(instance).toBeDefined();
    });

    it('accepts custom options', () => {
      const customOptions = {
        fps: 60,
        shiftMagnification: 5,
        playPauseKeys: ['x']
      };

      const instance = player.shuttleControls(customOptions);

      expect(instance.fps).toBe(60);
      expect(instance.shiftMagnification).toBe(5);
      expect(instance.playPauseKeys).toEqual(['x']);
    });

    it('handles keydown events for playback control', () => {
      const instance = player.shuttleControls();

      // Forward play (l)
      player.trigger({ type: 'keydown', key: 'l', shiftKey: false });
      expect(instance.isPlaying).toBe(true);

      // Play/Pause toggle (k)
      player.trigger({ type: 'keydown', key: 'k', shiftKey: false });
      expect(instance.isPlaying).toBe(false);

      // Backward play (j)
      player.trigger({ type: 'keydown', key: 'j', shiftKey: false });
      expect(instance.isPlaying).toBe(true);
    });

    it('creates in and out markers', () => {
      const instance = player.shuttleControls();

      expect(instance.inMarker).toBeDefined();
      expect(instance.outMarker).toBeDefined();
      expect(instance.inMarker.id).toBe('vjs_shuttleControls_inMarker');
      expect(instance.outMarker.id).toBe('vjs_shuttleControls_outMarker');
    });
  });
});
