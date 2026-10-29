import type videojs from 'video.js';

export interface ShuttleControlsOptions {
  playPauseKeys?: string[];
  backwardKeys?: string[];
  forwardKey?: string[];
  backwardFrameKey?: string[];
  forwardFrameKey?: string[];
  inKey?: string[];
  outKey?: string[];
  inTime?: number | null;
  outTime?: number | null;
  shiftMagnification?: number;
  fps?: number;
  playbackRates?: number[];
}

export declare class ShuttleControls {
  static VERSION: string;
  static defaultState: Record<string, any>;

  player: any;
  options: ShuttleControlsOptions;
  playPauseKeys: string[];
  backwardKeys: string[];
  forwardKey: string[];
  backwardFrameKey: string[];
  forwardFrameKey: string[];
  inKey: string[];
  outKey: string[];
  inTime: number | null | undefined;
  outTime: number | null | undefined;
  shiftMagnification: number;
  fps: number;
  playbackRates: number[];
  currentPlaybackRate: number;
  isPlaying: boolean;
  inMarker: HTMLElement;
  outMarker: HTMLElement;

  constructor(player: any, options?: ShuttleControlsOptions);
  frameByFrame(step: number): void;
}

declare module 'video.js' {
  namespace videojs {
    interface Player {
      shuttleControls(options?: ShuttleControlsOptions): ShuttleControls;
    }
  }
}

export default ShuttleControls;

