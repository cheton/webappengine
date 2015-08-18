# WebAppEngine [![build status](https://travis-ci.org/cheton/webappengine.svg?branch=master)](https://travis-ci.org/cheton/webappengine) [![Coverage Status](https://coveralls.io/repos/cheton/webappengine/badge.svg)](https://coveralls.io/r/cheton/webappengine)

[![NPM](https://nodei.co/npm/webappengine.png?downloads=true&stars=true)](https://nodei.co/npm/webappengine/)    

A web application platform that can host multiple web apps running with Node.js.

![WebAppEngine](https://github.com/cheton/webappengine/blob/master/media/screenshot.png)
<i>Note. The administration UI is currently under construction.</i>

## Installation
```bash
$ npm install -g webappengine
```

## Usage
Run `webappengine` to start the app, and visit `http://yourhostname:8000/` to check if it works:

```bash
$ webappengine
```

To check what port the app is running on, find the message `Server is listening on 0.0.0.0:8000` from console output.

By default the app listens on port 8000, you can use the `PORT` environment variable to determine which port your application should listen on. For example:
```bash
$ PORT=80 webappengine
```

Set the environment variable `NODE_ENV` to `production` if you are running in production mode:
```bash
$ NODE_ENV=production webappengine
```

Run `webappengine` with `-h` for detailed usage:
```
$ webappengine -h

  Usage: webappengine [options]
  
  Options:
    -h, --help               output usage information
    -V, --version            output the version number
    -c, --config [filename]  set multihost configuration file
                             (default: node_modules/webappengine/app/config/multihost.json)
```

## Getting Started

### Working with static assets
The following configuration will serve static assets from the directory:
```json
[
    {
        "type": "static",
        "route": "/",
        "directory": "/path/to/your/project/web/"
    }
]
```

### Configure multihost settings to run multiple web apps
First, checkout [examples/simple/app.js](examples/simple/app.js) and [examples/multihost.json](examples/multihost.json), and copy [examples](examples) to your project folder to kickstart a web application.

simple/app.js:
```js
var path = require('path'),
    express = require('express');

module.exports = function(options) {
    options = options || {};

    var app = express();
    var serveStatic = require('serve-static');
    var assetPath = path.resolve(__dirname, 'web');

    // Enable case sensitivity routing: "/Foo" is not equal to "/foo"
    app.enable('case sensitive routing');
    // Disable strict routing: "/foo" and "/foo/" are treated the same
    app.disable('strict routing');

    app.use(options.route, serveStatic(assetPath));

    return app;
};
```

multihost.json:
```json
[
    {
        "route": "/simple",
        "server": "/path/to/your/project/simple/app"
    }
]
```

Run `webappengine` with `--config` to set multihost configuration file, like so:
```bash
$ webappengine --config "/path/to/your/project/multihost.json"
```

Visits `http://yourhostname:8000/simple` will return a simple page as below:
```
WebAppEngine Test Page
```
(See also: [examples/simple/web/index.html](examples/simple/web/index.html))

## Internationalization (I18n)
### Change the display language
You can change the display language by specifying the `lang` query string parameter: `?lang={locale}`

Here is a list of currently supported locales:

Locale | Language
------ | --------
de     | Deutsch
en     | English (US)
es     | Español
fr     | Français
it     | Italiano
ja     | 日本語
zh-cn  | 中文 (简体)
zh-tw  | 中文 (繁體)

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/webappengine/blob/master/LICENSE).
