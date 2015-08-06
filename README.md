webappengine [![build status](https://travis-ci.org/cheton/webappengine.svg?branch=master)](https://travis-ci.org/cheton/webappengine) [![Coverage Status](https://coveralls.io/repos/cheton/webappengine/badge.svg)](https://coveralls.io/r/cheton/webappengine)

[![NPM](https://nodei.co/npm/webappengine.png?downloads=true&stars=true)](https://nodei.co/npm/webappengine/)    

A web application platform that can host multiple web apps running with Node.js.

## Installation
```bash
$ npm install -g webappengine
```

## Usage
Run `webappengine` to start the app, and visit `http://yourhostname:8000/` to check if it works. For Example:

```bash
$ webappengine
```
To check what port the app is running on, find the message `Server is listening on 0.0.0.0:8000` from console output.

By default the app listens on port 8000, you can use the `PORT` environment variable to determine which port your application should listen on:
```bash
$ PORT=80 webappengine
```

Set the environment variable `NODE_ENV` to `production` if you are running in production mode:
```bash
$ NODE_ENV=production webappengine
```

## License

Copyright (c) 2015 Cheton Wu

Licensed under the [MIT License](https://github.com/cheton/webappengine/blob/master/LICENSE).
