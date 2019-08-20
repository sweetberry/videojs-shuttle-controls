# videojs-shuttle-controls

Adds shuttle controls(JKL controls) to video.js

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [Options](#options)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation

```sh
npm install --save videojs-shuttle-controls
```

## Usage

To include videojs-shuttle-controls on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-shuttle-controls.min.js"></script>
<script>
  var player = videojs('my-video');

  player.shuttleControls();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-shuttle-controls via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-shuttle-controls');

var player = videojs('my-video');

player.shuttleControls();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-shuttle-controls'], function(videojs) {
  var player = videojs('my-video');

  player.shuttleControls();
});
```

## Options

- `playPauseKeys` (array of string): The keys to toggle between play and pause (default: `[' ', 'k']`)
- `backwardKeys` (array of string): The keys to play backward (default: `['j']`)
- `forwardKey` (array of string): The keys to play forward (default: `['l']`)
- `fps` (number): The video frame rate (default: `30`)
- `playbackRates` (array of number): Set playbackRates. If you want to display in the control bar, set it to the player's playbackRates instead of here. (default: `[-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10]`)




## License

MIT. Copyright (c) sweetberry &lt;pixel@sweetberry.com&gt;


[videojs]: http://videojs.com/


