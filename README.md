# videojs-shuttle-controls

Adds shuttle controls (JKL controls) to Video.js.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [ES Modules (Vite, Webpack, Rollup, etc.)](#es-modules)
  - [CommonJS](#commonjs)
  - [`<script>` Tag](#script-tag)
- [Options](#options)
- [Development](#development)
- [License](#license)

## Installation

```sh
npm install --save videojs-shuttle-controls
```

> **Note**: Requires `video.js` v8 or later (`peerDependencies`).

## Usage

### ES Modules

```javascript
import videojs from 'video.js';
import 'videojs-shuttle-controls';

const player = videojs('my-video', {
  playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
});

player.shuttleControls({
  playPauseKeys     : [' ', 'k'],
  backwardKeys      : ['j'],
  forwardKey        : ['l'],
  inKey             : ['i'],
  outKey            : ['o'],
  backwardFrameKey  : ['ArrowLeft'],
  forwardFrameKey   : ['ArrowRight'],
  shiftMagnification: 10,
  fps               : 30
});
```

### CommonJS

```javascript
const videojs = require('video.js');
require('videojs-shuttle-controls');

const player = videojs('my-video', {
  playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
});

player.shuttleControls({
  playPauseKeys     : [' ', 'k'],
  backwardKeys      : ['j'],
  forwardKey        : ['l'],
  inKey             : ['i'],
  outKey            : ['o'],
  backwardFrameKey  : ['ArrowLeft'],
  forwardFrameKey   : ['ArrowRight'],
  shiftMagnification: 10,
  fps               : 30
});
```

### `<script>` Tag

Include the plugin script after Video.js:

```html
<link href="//unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet">
<script src="//unpkg.com/video.js/dist/video.min.js"></script>
<script src="//unpkg.com/videojs-shuttle-controls/dist/videojs-shuttle-controls.min.js"></script>

<script>
  var player = videojs('my-video', {
    playbackRates: [-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]
  });

  player.shuttleControls({
    playPauseKeys       : [' ', 'k'],
    backwardKeys        : ['j'],
    forwardKey          : ['l'],
    inKey               : ['i'],
    outKey              : ['o'],
    backwardFrameKey    : ['ArrowLeft'],
    forwardFrameKey     : ['ArrowRight'],
    shiftMagnification  : 10,
    fps                 : 30
  });
</script>
```

## Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `playPauseKeys` | `string[]` | `[' ', 'k']` | Keys to toggle between play and pause. |
| `backwardKeys` | `string[]` | `['j']` | Keys to shuttle backward (rewind). |
| `forwardKey` | `string[]` | `['l']` | Keys to shuttle forward (fast-forward). |
| `backwardFrameKey` | `string[]` | `['ArrowLeft']` | Keys to step one frame backward. |
| `forwardFrameKey` | `string[]` | `['ArrowRight']` | Keys to step one frame forward. |
| `inKey` | `string[]` | `['i']` | Keys to set loop In-point. |
| `outKey` | `string[]` | `['o']` | Keys to set loop Out-point. |
| `inTime` | `number \| null` | `null` | Initial loop In-point time in seconds. |
| `outTime` | `number \| null` | `null` | Initial loop Out-point time in seconds. |
| `shiftMagnification` | `number` | `10` | Frame step multiplier when holding the Shift key. |
| `fps` | `number` | `30` | Frame rate used for frame-by-frame stepping. |
| `playbackRates` | `number[]` | `[-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]` | Playback speed steps for shuttle controls. |

## Development

```sh
# Start local development server with demo
npm run dev

# Run Vitest test suite
npm test

# Run tests in watch mode
npm run test:watch

# Build bundle for production (ESM, CJS, UMD, and minified UMD)
npm run build
```

## License

MIT
