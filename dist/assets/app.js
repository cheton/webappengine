(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./web/main.js":[function(require,module,exports){
'use strict';

var _ = require('lodash');
var async = require('async');
var i18n = require('i18next');
var Uri = require('jsUri');
var log = require('./lib/log');
var app = require('./app');
var settings = require('./config/settings');
var sha1 = require('sha1');

var query_params = (function (qs) {
    qs = String(qs || '');
    if (qs[0] !== '?') {
        qs = '?' + qs;
    }
    var uri = new Uri(qs);
    var obj = _.reduce(uri.queryPairs, function (obj, item) {
        var key = item[0],
            value = item[1];
        obj[key] = decodeURIComponent(value);
        return obj;
    }, {});

    return obj;
})(window.root.location.search) || {};

// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
function cookie_get(key) {
    if (!key) {
        return null;
    }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}

function registerI18nHelpers(i18n) {
    i18n = i18n || {};
    i18n._ = function () {
        var args = Array.prototype.slice.call(arguments);
        if (_.size(args) === 0 || _.isEmpty(args[0])) {
            i18n.t.apply(i18n, args);
            return;
        }

        var value = args[0];
        var options = args[1] || {};
        var key = sha1(value);
        args[0] = value;

        options.defaultValue = value;

        return i18n.t(key, options);
    };
}

async.series([
// i18next
function i18next_init(next) {
    var lng;

    registerI18nHelpers(i18n);

    // 1. query string: lang=en
    lng = query_params[settings.i18next.detectLngQS] || '';

    // 2. cookie
    lng = lng || (function (lng) {
        if (settings.i18next.useCookie) {
            return cookie_get(settings.i18next.cookieName);
        }
        return lng;
    })(lng);

    // 3. Using 'lang' attribute on the html element
    lng = lng || $('html').attr('lang');

    // Lowercase countryCode in requests
    lng = (lng || '').toLowerCase();

    if (settings.supportedLngs.indexOf(lng) >= 0) {
        settings.i18next.lng = lng;
    } else {
        settings.i18next.lng = settings.i18next.fallbackLng || settings.supportedLngs[0];
    }

    i18n.init(settings.i18next, function (t) {
        next();
    });
},
// logger
function log_init(next) {
    var log_level = query_params['log_level'] || settings.log.level;
    var log_logger = query_params['log_logger'] || settings.log.logger;
    var log_prefix = query_params['log_prefix'] || settings.log.prefix;

    log.setLevel(log_level);
    log.setLogger(log_logger);
    log.setPrefix(log_prefix);

    var msg = ['version=' + settings.version, 'webroot=' + settings.webroot, 'cdn=' + settings.cdn];
    log.debug(msg.join(','));

    next();
}], function (err, results) {

    var loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }

    app.run();
});


},{"./app":"/home/cheton/github/webappengine/web/app.jsx","./config/settings":"/home/cheton/github/webappengine/web/config/settings.js","./lib/log":"/home/cheton/github/webappengine/web/lib/log.js","async":"/home/cheton/github/webappengine/web/vendor/async/lib/async.js","i18next":"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js","jsUri":"/home/cheton/github/webappengine/web/vendor/jsUri/Uri.js","lodash":"lodash","sha1":"/home/cheton/github/webappengine/node_modules/sha1/sha1.js"}],"/home/cheton/github/webappengine/node_modules/browserify-css/browser.js":[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }
        
        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            head.appendChild(style);
        } else if (style.styleSheet) { // for IE8 and below
            head.appendChild(style);
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            head.appendChild(style);
        }
    }
};

},{}],"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

},{"base64-js":"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","ieee754":"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"/home/cheton/github/webappengine/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"/home/cheton/github/webappengine/node_modules/sha1/node_modules/charenc/charenc.js":[function(require,module,exports){
var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;

},{}],"/home/cheton/github/webappengine/node_modules/sha1/node_modules/crypt/crypt.js":[function(require,module,exports){
(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();

},{}],"/home/cheton/github/webappengine/node_modules/sha1/sha1.js":[function(require,module,exports){
(function (Buffer){
(function() {
  var crypt = require('crypt'),
      utf8 = require('charenc').utf8,
      bin = require('charenc').bin,

  // The core
  sha1 = function (message) {
    // Convert to byte array
    if (message.constructor == String)
      message = utf8.stringToBytes(message);
    else if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer == 'function' && Buffer.isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();

    // otherwise assume byte array

    var m  = crypt.bytesToWords(message),
        l  = message.length * 8,
        w  = [],
        H0 =  1732584193,
        H1 = -271733879,
        H2 = -1732584194,
        H3 =  271733878,
        H4 = -1009589776;

    // Padding
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >>> 9) << 4) + 15] = l;

    for (var i = 0; i < m.length; i += 16) {
      var a = H0,
          b = H1,
          c = H2,
          d = H3,
          e = H4;

      for (var j = 0; j < 80; j++) {

        if (j < 16)
          w[j] = m[i + j];
        else {
          var n = w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16];
          w[j] = (n << 1) | (n >>> 31);
        }

        var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) + (
                j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
                j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
                j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
                         (H1 ^ H2 ^ H3) - 899497514);

        H4 = H3;
        H3 = H2;
        H2 = (H1 << 30) | (H1 >>> 2);
        H1 = H0;
        H0 = t;
      }

      H0 += a;
      H1 += b;
      H2 += c;
      H3 += d;
      H4 += e;
    }

    return [H0, H1, H2, H3, H4];
  },

  // Public API
  api = function (message, options) {
    var digestbytes = crypt.wordsToBytes(sha1(message));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

  api._blocksize = 16;
  api._digestsize = 20;

  module.exports = api;
})();

}).call(this,require("buffer").Buffer)
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9zaGExL3NoYTEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcbiAgdmFyIGNyeXB0ID0gcmVxdWlyZSgnY3J5cHQnKSxcbiAgICAgIHV0ZjggPSByZXF1aXJlKCdjaGFyZW5jJykudXRmOCxcbiAgICAgIGJpbiA9IHJlcXVpcmUoJ2NoYXJlbmMnKS5iaW4sXG5cbiAgLy8gVGhlIGNvcmVcbiAgc2hhMSA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgLy8gQ29udmVydCB0byBieXRlIGFycmF5XG4gICAgaWYgKG1lc3NhZ2UuY29uc3RydWN0b3IgPT0gU3RyaW5nKVxuICAgICAgbWVzc2FnZSA9IHV0Zjguc3RyaW5nVG9CeXRlcyhtZXNzYWdlKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgQnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQnVmZmVyLmlzQnVmZmVyID09ICdmdW5jdGlvbicgJiYgQnVmZmVyLmlzQnVmZmVyKG1lc3NhZ2UpKVxuICAgICAgbWVzc2FnZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG1lc3NhZ2UsIDApO1xuICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1lc3NhZ2UpKVxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2UudG9TdHJpbmcoKTtcblxuICAgIC8vIG90aGVyd2lzZSBhc3N1bWUgYnl0ZSBhcnJheVxuXG4gICAgdmFyIG0gID0gY3J5cHQuYnl0ZXNUb1dvcmRzKG1lc3NhZ2UpLFxuICAgICAgICBsICA9IG1lc3NhZ2UubGVuZ3RoICogOCxcbiAgICAgICAgdyAgPSBbXSxcbiAgICAgICAgSDAgPSAgMTczMjU4NDE5MyxcbiAgICAgICAgSDEgPSAtMjcxNzMzODc5LFxuICAgICAgICBIMiA9IC0xNzMyNTg0MTk0LFxuICAgICAgICBIMyA9ICAyNzE3MzM4NzgsXG4gICAgICAgIEg0ID0gLTEwMDk1ODk3NzY7XG5cbiAgICAvLyBQYWRkaW5nXG4gICAgbVtsID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbCAlIDMyKTtcbiAgICBtWygobCArIDY0ID4+PiA5KSA8PCA0KSArIDE1XSA9IGw7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgICB2YXIgYSA9IEgwLFxuICAgICAgICAgIGIgPSBIMSxcbiAgICAgICAgICBjID0gSDIsXG4gICAgICAgICAgZCA9IEgzLFxuICAgICAgICAgIGUgPSBINDtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCA4MDsgaisrKSB7XG5cbiAgICAgICAgaWYgKGogPCAxNilcbiAgICAgICAgICB3W2pdID0gbVtpICsgal07XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBuID0gd1tqIC0gM10gXiB3W2ogLSA4XSBeIHdbaiAtIDE0XSBeIHdbaiAtIDE2XTtcbiAgICAgICAgICB3W2pdID0gKG4gPDwgMSkgfCAobiA+Pj4gMzEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHQgPSAoKEgwIDw8IDUpIHwgKEgwID4+PiAyNykpICsgSDQgKyAod1tqXSA+Pj4gMCkgKyAoXG4gICAgICAgICAgICAgICAgaiA8IDIwID8gKEgxICYgSDIgfCB+SDEgJiBIMykgKyAxNTE4NTAwMjQ5IDpcbiAgICAgICAgICAgICAgICBqIDwgNDAgPyAoSDEgXiBIMiBeIEgzKSArIDE4NTk3NzUzOTMgOlxuICAgICAgICAgICAgICAgIGogPCA2MCA/IChIMSAmIEgyIHwgSDEgJiBIMyB8IEgyICYgSDMpIC0gMTg5NDAwNzU4OCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgKEgxIF4gSDIgXiBIMykgLSA4OTk0OTc1MTQpO1xuXG4gICAgICAgIEg0ID0gSDM7XG4gICAgICAgIEgzID0gSDI7XG4gICAgICAgIEgyID0gKEgxIDw8IDMwKSB8IChIMSA+Pj4gMik7XG4gICAgICAgIEgxID0gSDA7XG4gICAgICAgIEgwID0gdDtcbiAgICAgIH1cblxuICAgICAgSDAgKz0gYTtcbiAgICAgIEgxICs9IGI7XG4gICAgICBIMiArPSBjO1xuICAgICAgSDMgKz0gZDtcbiAgICAgIEg0ICs9IGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtIMCwgSDEsIEgyLCBIMywgSDRdO1xuICB9LFxuXG4gIC8vIFB1YmxpYyBBUElcbiAgYXBpID0gZnVuY3Rpb24gKG1lc3NhZ2UsIG9wdGlvbnMpIHtcbiAgICB2YXIgZGlnZXN0Ynl0ZXMgPSBjcnlwdC53b3Jkc1RvQnl0ZXMoc2hhMShtZXNzYWdlKSk7XG4gICAgcmV0dXJuIG9wdGlvbnMgJiYgb3B0aW9ucy5hc0J5dGVzID8gZGlnZXN0Ynl0ZXMgOlxuICAgICAgICBvcHRpb25zICYmIG9wdGlvbnMuYXNTdHJpbmcgPyBiaW4uYnl0ZXNUb1N0cmluZyhkaWdlc3RieXRlcykgOlxuICAgICAgICBjcnlwdC5ieXRlc1RvSGV4KGRpZ2VzdGJ5dGVzKTtcbiAgfTtcblxuICBhcGkuX2Jsb2Nrc2l6ZSA9IDE2O1xuICBhcGkuX2RpZ2VzdHNpemUgPSAyMDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGFwaTtcbn0pKCk7XG4iXX0=
},{"buffer":"/home/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/index.js","charenc":"/home/cheton/github/webappengine/node_modules/sha1/node_modules/charenc/charenc.js","crypt":"/home/cheton/github/webappengine/node_modules/sha1/node_modules/crypt/crypt.js"}],"/home/cheton/github/webappengine/web/app.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.run = run;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _libLog = require('./lib/log');

var _libLog2 = _interopRequireDefault(_libLog);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _reactRouter2 = _interopRequireDefault(_reactRouter);

var _componentsHeader = require('./components/header');

var _componentsHome = require('./components/home');

var _componentsDashboard = require('./components/dashboard');

var App = (function (_React$Component) {
    _inherits(App, _React$Component);

    function App() {
        _classCallCheck(this, App);

        _get(Object.getPrototypeOf(App.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(App, [{
        key: 'render',
        value: function render() {
            var style = {
                paddingTop: '50px',
                paddingBottom: '20px'
            };
            return _react2['default'].createElement(
                'div',
                { style: style },
                _react2['default'].createElement(_componentsHeader.Header, null),
                _react2['default'].createElement(_reactRouter.RouteHandler, null)
            );
        }
    }]);

    return App;
})(_react2['default'].Component);

exports.App = App;

function run() {
    var routes = _react2['default'].createElement(
        _reactRouter.Route,
        { name: 'app', path: '/', handler: App },
        _react2['default'].createElement(_reactRouter.DefaultRoute, { handler: _componentsHome.Home }),
        _react2['default'].createElement(_reactRouter.Route, { name: 'dashboard', handler: _componentsDashboard.Dashboard })
    );
    _reactRouter2['default'].run(routes, function (Handler) {
        _react2['default'].render(_react2['default'].createElement(Handler, null), document.querySelector('#components'));
    });
}


},{"./components/dashboard":"/home/cheton/github/webappengine/web/components/dashboard/index.jsx","./components/header":"/home/cheton/github/webappengine/web/components/header/index.jsx","./components/home":"/home/cheton/github/webappengine/web/components/home/index.jsx","./lib/log":"/home/cheton/github/webappengine/web/lib/log.js","react":"react","react-router":"/home/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js"}],"/home/cheton/github/webappengine/web/components/dashboard/index.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Sortable = require('Sortable');

var _Sortable2 = _interopRequireDefault(_Sortable);

var _widget = require('../widget');

var Widget1 = (function (_React$Component) {
    _inherits(Widget1, _React$Component);

    function Widget1() {
        _classCallCheck(this, Widget1);

        _get(Object.getPrototypeOf(Widget1.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Widget1, [{
        key: 'render',
        value: function render() {
            var options = {
                containerClass: 'col-sm-6',
                title: 'WIDGET 1',
                content: _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'p',
                        null,
                        'Widget Content'
                    )
                )
            };
            return _react2['default'].createElement(_widget.Widget, { options: options });
        }
    }]);

    return Widget1;
})(_react2['default'].Component);

var Widget2 = (function (_React$Component2) {
    _inherits(Widget2, _React$Component2);

    function Widget2() {
        _classCallCheck(this, Widget2);

        _get(Object.getPrototypeOf(Widget2.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Widget2, [{
        key: 'render',
        value: function render() {
            var options = {
                containerClass: 'col-sm-6',
                title: 'WIDGET 2',
                content: _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'p',
                        null,
                        'Widget Content'
                    )
                )
            };
            return _react2['default'].createElement(_widget.Widget, { options: options });
        }
    }]);

    return Widget2;
})(_react2['default'].Component);

var Widget3 = (function (_React$Component3) {
    _inherits(Widget3, _React$Component3);

    function Widget3() {
        _classCallCheck(this, Widget3);

        _get(Object.getPrototypeOf(Widget3.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Widget3, [{
        key: 'render',
        value: function render() {
            var options = {
                containerClass: 'col-sm-12',
                noheader: true,
                content: _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'h3',
                        { className: 'widget-title' },
                        'WIDGET WITHOUT HEADER'
                    ),
                    _react2['default'].createElement(
                        'p',
                        null,
                        'Widget Content'
                    )
                )
            };
            return _react2['default'].createElement(_widget.Widget, { options: options });
        }
    }]);

    return Widget3;
})(_react2['default'].Component);

var Widget4 = (function (_React$Component4) {
    _inherits(Widget4, _React$Component4);

    function Widget4() {
        _classCallCheck(this, Widget4);

        _get(Object.getPrototypeOf(Widget4.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Widget4, [{
        key: 'render',
        value: function render() {
            var options = {
                containerClass: 'col-sm-4',
                title: this.props.title,
                content: _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'p',
                        null,
                        'Widget Content'
                    )
                )
            };
            return _react2['default'].createElement(_widget.Widget, { options: options });
        }
    }]);

    return Widget4;
})(_react2['default'].Component);

var WidgetList = (function (_React$Component5) {
    _inherits(WidgetList, _React$Component5);

    function WidgetList(props) {
        _classCallCheck(this, WidgetList);

        _get(Object.getPrototypeOf(WidgetList.prototype), 'constructor', this).call(this, props);
        this._sortableInstance = null;
    }

    _createClass(WidgetList, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var dom = _react2['default'].findDOMNode(this);
            this._sortableInstance = _Sortable2['default'].create(dom, {
                filter: '.widget-content'
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this._sortableInstance.destroy();
            this._sortableInstance = null;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'row' },
                _react2['default'].createElement(Widget1, null),
                _react2['default'].createElement(Widget2, null),
                _react2['default'].createElement(Widget3, null),
                _react2['default'].createElement(Widget4, { title: 'widget 5' }),
                _react2['default'].createElement(Widget4, { title: 'widget 6' }),
                _react2['default'].createElement(Widget4, { title: 'widget 7' })
            );
        }
    }]);

    return WidgetList;
})(_react2['default'].Component);

var Dashboard = (function (_React$Component6) {
    _inherits(Dashboard, _React$Component6);

    function Dashboard() {
        _classCallCheck(this, Dashboard);

        _get(Object.getPrototypeOf(Dashboard.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Dashboard, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'container no-heading' },
                _react2['default'].createElement(WidgetList, null)
            );
        }
    }]);

    return Dashboard;
})(_react2['default'].Component);

exports.Dashboard = Dashboard;


},{"../widget":"/home/cheton/github/webappengine/web/components/widget/index.jsx","Sortable":"/home/cheton/github/webappengine/web/vendor/Sortable/Sortable.js","i18next":"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/home/cheton/github/webappengine/web/components/header/index.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var Header = (function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header() {
        _classCallCheck(this, Header);

        _get(Object.getPrototypeOf(Header.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Header, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'nav',
                { className: 'navbar navbar-inverse navbar-fixed-top' },
                _react2['default'].createElement(
                    'div',
                    { className: 'container' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'navbar-header' },
                        _react2['default'].createElement(
                            'button',
                            { type: 'button', className: 'navbar-toggle collapsed', 'data-toggle': 'collapse', 'data-target': '#navbar-collapse' },
                            _react2['default'].createElement('span', { className: 'sr-only' }),
                            _react2['default'].createElement('span', { className: 'icon-bar' }),
                            _react2['default'].createElement('span', { className: 'icon-bar' }),
                            _react2['default'].createElement('span', { className: 'icon-bar' })
                        ),
                        _react2['default'].createElement(
                            'a',
                            { className: 'navbar-brand', href: '#' },
                            _i18next2['default']._('WebAppEngine')
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { className: 'navbar-collapse collapse', id: 'navbar-collapse' },
                        _react2['default'].createElement(
                            'ul',
                            { className: 'nav navbar-nav' },
                            _react2['default'].createElement(
                                'li',
                                null,
                                _react2['default'].createElement(
                                    _reactRouter.Link,
                                    { to: 'dashboard' },
                                    _i18next2['default']._('Dashboard')
                                )
                            ),
                            _react2['default'].createElement(
                                'li',
                                { className: 'dropdown' },
                                _react2['default'].createElement(
                                    'a',
                                    { href: '#', className: 'dropdown-toggle', 'data-toggle': 'dropdown', role: 'button' },
                                    _i18next2['default']._('Settings'),
                                    ' ',
                                    _react2['default'].createElement('span', { className: 'caret' })
                                ),
                                _react2['default'].createElement(
                                    'ul',
                                    { className: 'dropdown-menu', role: 'menu' },
                                    _react2['default'].createElement(
                                        'li',
                                        { className: 'dropdown-header' },
                                        _i18next2['default']._('Language')
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=de' },
                                            'Deutsch'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=en' },
                                            'English (US)'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=es' },
                                            'Español'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=fr' },
                                            'Français'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=it' },
                                            'Italiano'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=ja' },
                                            '日本語'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=zh-cn' },
                                            '中文 (简体)'
                                        )
                                    ),
                                    _react2['default'].createElement(
                                        'li',
                                        null,
                                        _react2['default'].createElement(
                                            'a',
                                            { href: '?lang=zh-tw' },
                                            '中文 (繁體)'
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);

    return Header;
})(_react2['default'].Component);

exports.Header = Header;


},{"i18next":"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react","react-router":"/home/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js"}],"/home/cheton/github/webappengine/web/components/home/index.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var Home = (function (_React$Component) {
    _inherits(Home, _React$Component);

    function Home() {
        _classCallCheck(this, Home);

        _get(Object.getPrototypeOf(Home.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Home, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { className: 'jumbotron' },
                    _react2['default'].createElement(
                        'div',
                        { className: 'container' },
                        _react2['default'].createElement(
                            'h1',
                            null,
                            _i18next2['default']._('Welcome to WebAppEngine!')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _i18next2['default']._('If you see this page, the WebAppEngine server is successfully installed and working. Further configuration is required.')
                        ),
                        _react2['default'].createElement('p', { dangerouslySetInnerHTML: { __html: _i18next2['default']._('For online documentation please refer to <a href="http://cheton.github.io/webappengine/">http://cheton.github.io/webappengine/</a>.') } }),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(
                                'a',
                                { className: 'btn btn-primary btn-lg', href: 'https://github.com/cheton/webappengine', role: 'button' },
                                _i18next2['default']._('Learn more »')
                            )
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            _react2['default'].createElement(
                                'i',
                                null,
                                _i18next2['default']._('Thank you for using WebAppEngine.')
                            )
                        )
                    )
                ),
                _react2['default'].createElement('div', { className: 'container' })
            );
        }
    }]);

    return Home;
})(_react2['default'].Component);

exports.Home = Home;


},{"i18next":"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/home/cheton/github/webappengine/web/components/widget/index.jsx":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./widget.css');

var WidgetHeader = (function (_React$Component) {
    _inherits(WidgetHeader, _React$Component);

    function WidgetHeader() {
        _classCallCheck(this, WidgetHeader);

        _get(Object.getPrototypeOf(WidgetHeader.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WidgetHeader, [{
        key: 'render',
        value: function render() {
            var options = this.props.options;

            options = options || {};
            return _react2['default'].createElement(
                'div',
                { className: 'widget-header clearfix' },
                _react2['default'].createElement(
                    'h3',
                    { className: 'widget-header-title' },
                    _react2['default'].createElement('i', { className: 'icon ion-pricetag' }),
                    ' ',
                    _react2['default'].createElement(
                        'span',
                        null,
                        options.title
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'btn-group widget-header-toolbar' },
                    _react2['default'].createElement(
                        'a',
                        { href: 'javascript: void(0)', title: 'Expand/Collapse', className: 'btn btn-link btn-toggle-expand', onClick: this.props.handleClick.bind(this, 'btn-toggle-expand') },
                        _react2['default'].createElement('i', { className: 'icon ion-ios-arrow-up' })
                    ),
                    _react2['default'].createElement(
                        'a',
                        { href: 'javascript: void(0)', title: 'Remove', className: 'btn btn-link btn-remove', onClick: this.props.handleClick.bind(this, 'btn-remove') },
                        _react2['default'].createElement('i', { className: 'icon ion-ios-close-empty' })
                    )
                )
            );
        }
    }]);

    return WidgetHeader;
})(_react2['default'].Component);

var WidgetContent = (function (_React$Component2) {
    _inherits(WidgetContent, _React$Component2);

    function WidgetContent() {
        _classCallCheck(this, WidgetContent);

        _get(Object.getPrototypeOf(WidgetContent.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WidgetContent, [{
        key: 'render',
        value: function render() {
            var options = this.props.options;

            options = options || {};
            return _react2['default'].createElement(
                'div',
                { className: 'widget-content' },
                options.content
            );
        }
    }]);

    return WidgetContent;
})(_react2['default'].Component);

var WidgetFooter = (function (_React$Component3) {
    _inherits(WidgetFooter, _React$Component3);

    function WidgetFooter() {
        _classCallCheck(this, WidgetFooter);

        _get(Object.getPrototypeOf(WidgetFooter.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(WidgetFooter, [{
        key: 'render',
        value: function render() {
            return _react2['default'].createElement('div', { className: 'widget-footer' });
        }
    }]);

    return WidgetFooter;
})(_react2['default'].Component);

var Widget = (function (_React$Component4) {
    _inherits(Widget, _React$Component4);

    function Widget() {
        _classCallCheck(this, Widget);

        _get(Object.getPrototypeOf(Widget.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Widget, [{
        key: 'handleClick',
        value: function handleClick(target) {
            if (target === 'btn-remove') {
                this.unmount();
            }
        }
    }, {
        key: 'unmount',
        value: function unmount() {
            var container = _react2['default'].findDOMNode(this.refs.widgetContainer);
            _react2['default'].unmountComponentAtNode(container);
            container.remove();
        }
    }, {
        key: 'render',
        value: function render() {
            var options = this.props.options;

            options = options || {};
            options.containerClass = options.containerClass || '';
            return _react2['default'].createElement(
                'div',
                { className: options.containerClass, ref: 'widgetContainer' },
                _react2['default'].createElement(
                    'div',
                    { className: 'widget' },
                    !options.noheader && _react2['default'].createElement(WidgetHeader, { options: options, handleClick: this.handleClick.bind(this) }),
                    _react2['default'].createElement(WidgetContent, { options: options })
                )
            );
        }
    }]);

    return Widget;
})(_react2['default'].Component);

exports.Widget = Widget;


},{"./widget.css":"/home/cheton/github/webappengine/web/components/widget/widget.css","i18next":"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/home/cheton/github/webappengine/web/components/widget/widget.css":[function(require,module,exports){
var css = ".widget{border-radius:3px;border-width:1px;border-style:solid;margin-bottom:20px;background-color:#fff;border-color:#d0d0d0}.widget.widget-no-header .widget-title{margin-top:0;font-size:14px;color:#6a6a6a}.widget .widget-header{padding:0 10px;border-bottom:1px solid #fff;background-color:#e9e9e9}.widget .widget-header .widget-header-title{margin-top:0;font-size:14px;color:#6a6a6a;display:inline-block;vertical-align:middle;margin-bottom:0;line-height:40px}.widget .widget-header .btn-group .dropdown-toggle .icon,.widget .widget-header .btn-group>a{color:#838383}.widget .widget-header .btn-group .dropdown-toggle .icon:focus,.widget .widget-header .btn-group .dropdown-toggle .icon:hover,.widget .widget-header .btn-group>a:focus,.widget .widget-header .btn-group>a:hover{color:#505050}.widget .widget-header .btn i{position:relative;top:0;margin-right:2px;font-size:16px;line-height:1}.widget .widget-header .widget-header-toolbar{float:right;width:auto;margin-left:15px}.widget .widget-header .widget-header-toolbar.btn-group{top:5px}.widget .widget-header .widget-header-toolbar .badge{margin-top:10px}.widget .widget-header .widget-header-toolbar .label{position:relative;top:11px;padding:5px;font-size:85%}.widget .widget-header .widget-header-toolbar .label i{font-size:14px}.widget .widget-header .widget-header-toolbar .btn-xs{top:5px}.widget .widget-header .widget-header-toolbar .btn-link{padding:0 0 0 15px}.widget .widget-header .widget-header-toolbar .btn-link:first-child{padding-left:0}.widget .widget-header .widget-header-toolbar .btn-link i{font-size:28px;line-height:1}@media screen and (max-width:480px){.widget .widget-header .widget-header-toolbar{display:block;position:inherit}.widget .widget-header .widget-header-toolbar.btn-group>.btn{top:-5px}.widget .widget-header .widget-header-toolbar .badge{margin-top:0}.widget .widget-header .widget-header-toolbar .label{top:0}}.widget .widget-content{padding:20px}.widget .widget-footer{padding:7px 10px;background-color:#e9e9e9}"; (require("browserify-css").createStyle(css, { "href": "components/widget/widget.css"})); module.exports = css;
},{"browserify-css":"/home/cheton/github/webappengine/node_modules/browserify-css/browser.js"}],"/home/cheton/github/webappengine/web/config/settings.js":[function(require,module,exports){
'use strict';

var root = window.root;

console.assert(typeof root.app.config === 'object', 'root.app.config is not an object');

var settings = {};

module.exports = settings = {
    version: root.app.config.version,
    webroot: root.app.config.webroot,
    cdn: root.app.config.cdn,
    log: {
        level: 'debug', // trace, debug, info, warn, error
        logger: 'console', // console
        prefix: 'app:'
    },
    supportedLngs: ['en', // default language
    'de', 'es', 'fr', 'it', 'ja', 'zh-cn', 'zh-tw'],
    i18next: {
        // Resources will be resolved in this order:
        // 1) try languageCode plus countryCode, eg. 'en-US'
        // 2) alternative look it up in languageCode only, eg. 'en'
        // 3) finally look it up in definded fallback language, default: 'dev'
        // If language is not set explicitly i18next tries to detect the user language by:
        // 1) querystring parameter (?setLng=en-US)
        // 2) cookie (i18next)
        // 3) language set in navigator
        //lng: lng,

        // Preload additional languages on init:
        preload: [],

        // To lowercase countryCode in requests, eg. to 'en-us' set option lowerCaseLng = true
        lowerCaseLng: true,

        // The current locale to set will be looked up in the new parameter: ?lang=en-US
        // default would be ?setLng=en-US
        detectLngQS: 'lang',

        // Enable cookie usage
        useCookie: true,

        // Change the cookie name to lookup lng
        cookieName: 'lang', // default: 'i18next'

        // As the fallbackLng will default to 'dev' you can turn it off by setting the option value to false. This will prevent loading the fallbacks resource file and any futher look up of missing value inside a fallback file.
        fallbackLng: 'en', //false,

        // Specify which locales to load:
        // If load option is set to current i18next will load the current set language (this could be a specific (en-US) or unspecific (en) resource file).
        // If set to unspecific i18next will always load the unspecific resource file (eg. en instead of en-US).
        load: 'current', // all, current, unspecific

        // Caching is turned off by default. You might want to turn it on for production.
        //useLocalStorage: has('production') ? true : false,
        useLocalStorage: false, // TODO: monitor the stability
        localStorageExpirationTime: 7 * 24 * 60 * 60 * 1000, // in ms, default 1 week

        // Debug output
        debug: false,

        // Path in resource store
        //resStore: resStore,

        // Set static route to load resources from
        // e.g. 'i18n/en-US/translation.json
        resGetPath: root.app.config.webroot + 'i18n/${lng}/${ns}.json',

        // Load resource synchron
        getAsync: false,

        // Send missing resources to server
        sendMissing: false,
        sendMissingTo: 'all', // fallback|current|all
        resPostPath: 'api/i18n/sendMissing/${lng}/${ns}',
        sendType: 'POST', // POST|GET
        postAsync: true, // true|false

        nsseparator: ':', // namespace separator
        keyseparator: '.', // key separator

        interpolationPrefix: '${',
        interpolationSuffix: '}',

        // Multiple namespace
        ns: {
            namespaces: ['locale', // locale: language, timezone, ...
            'resource' // default
            ],
            defaultNs: 'resource'
        }
    }
};


},{}],"/home/cheton/github/webappengine/web/lib/browser.js":[function(require,module,exports){
'use strict';

var browser = {
    isSafari: function isSafari() {
        return (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)
        );
    },
    isOpera: function isOpera() {
        return (/OPR/.test(navigator.userAgent) && /Opera/.test(navigator.vendor)
        );
    },
    isFirefox: function isFirefox() {
        return (/Firefox/.test(navigator.userAgent)
        );
    },
    // http://stackoverflow.com/questions/10213639/differentiate-ie7-browser-and-browser-in-ie7-compatibility-mode
    // If the browser has "Trident" and "MSIE 7.0" in the user agent it is most likely a ie>7 in compat mode.
    // No "trident" but "MSIE 7.0" means most likely a real IE7.
    isIEEdge: function isIEEdge() {
        return navigator.appName === 'Netscape' && /Trident\/\d/.test(navigator.userAgent);
    },
    isIE: function isIE() {
        return browser.getIEVersion() > 0;
    },
    // http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.110).aspx
    // http://stackoverflow.com/questions/17907445/how-to-detect-ie11
    getIEVersion: function getIEVersion() {
        var rv = -1;
        var ua, re;
        if (navigator.appName === 'Microsoft Internet Explorer') {
            ua = navigator.userAgent;
            re = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        } else if (navigator.appName === 'Netscape') {
            ua = navigator.userAgent;
            re = new RegExp(/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/);
            if (re.exec(ua) !== null) {
                rv = parseFloat(RegExp.$1);
            }
        }
        return rv;
    }
};

// http://stackoverflow.com/questions/11018101/render-image-using-datauri-in-javascript
// Data URIs must be smaller than 32 KiB in Internet Explorer 8
browser.datauri = {
    // Alternative to Modernizr.datauri.over32kb
    over32kb: !(browser.isIE() && browser.getIEVersion() < 9)
};

module.exports = browser;


},{}],"/home/cheton/github/webappengine/web/lib/log.js":[function(require,module,exports){
/**
 * Libraries
 */
'use strict';

var printStackTrace = require('stacktrace');

/**
 * Modules
 */
var browser = require('./browser');

// Constants
var TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    NONE = 5,
    SEPARATOR = '\t';

var supportSafari = function supportSafari() {
    var m = navigator.userAgent.match(/AppleWebKit\/(\d+)\.(\d+)(\.|\+|\s)/);
    if (!m) {
        return false;
    }
    return 537.38 <= parseInt(m[1], 10) + parseInt(m[2], 10) / 100;
};

var supportOpera = function supportOpera() {
    var m = navigator.userAgent.match(/OPR\/(\d+)\./);
    if (!m) {
        return false;
    }
    return 15 <= parseInt(m[1], 10);
};

var supportFirefox = function supportFirefox() {
    return window.console.firebug || window.console.exception;
};

var getISODateTime = function getISODateTime(d) {
    if (typeof d === 'undefined') {
        d = new Date();
    }

    function pad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }

    function getTimeZoneDesignator(d) {
        var tz_offset = d.getTimezoneOffset();
        var hour = pad(Math.abs(tz_offset / 60), 2);
        var minute = pad(Math.abs(tz_offset % 60), 2);
        tz_offset = (tz_offset < 0 ? '+' : '-') + hour + ':' + minute;
        return tz_offset;
    }

    return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) + 'T' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) + ':' + pad(d.getSeconds(), 2) + getTimeZoneDesignator(d);
};

var consoleLogger = function consoleLogger(logger) {
    window.console.assert(typeof logger !== 'undefined', 'logger is undefined');
    window.console.assert(typeof logger.datetime === 'string', 'datetime is not a string');
    window.console.assert(typeof logger.level === 'string', 'level is not a string');

    var console = window.console;

    if (!console) {
        return;
    }

    var args = [];
    if (browser.isIE() || browser.isFirefox() && !supportFirefox() || browser.isOpera() && !supportOpera() || browser.isSafari() && !supportSafari()) {
        args.push(logger.datetime || '');
        args.push(logger.level || '');
    } else {
        var styles = {
            datetime: 'font-weight: bold; line-height: 20px; padding: 2px 4px; color: #3B5998; background: #EDEFF4',
            level: {
                'T': 'font-weight: bold; line-height: 20px; padding: 2px 4px; border: 1px solid; color: #4F8A10; background: #DFF2BF',
                'D': 'font-weight: bold; line-height: 20px; padding: 2px 4px; border: 1px solid; color: #222; background: #F5F5F5',
                'I': 'font-weight: bold; line-height: 20px; padding: 2px 4px; border: 1px solid; color: #00529B; background: #BDE5F8',
                'W': 'font-weight: bold; line-height: 20px; padding: 2px 4px; border: 1px solid; color: #9F6000; background: #EFEFB3',
                'E': 'font-weight: bold; line-height: 20px; padding: 2px 4px; border: 1px solid; color: #D8000C; background: #FFBABA'
            }
        };
        args.push('%c' + logger.datetime + '%c %c' + logger.level + '%c');
        args.push(styles.datetime);
        args.push('');
        args.push(styles.level[logger.level] || '');
        args.push('');
    }

    if (logger.prefix) {
        args.push(logger.prefix);
    }
    if (logger.args) {
        args = args.concat(logger.args);
    }
    if (logger.stackTrace) {
        args.push(logger.stackTrace[6]);
    }

    try {
        // http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
        //
        // console.log.apply not working in Internet Explorer 9 and earlier browser versions
        // Use console.log(message) for IE and console.log.apply(console, arguments) for Safari, Firefox, Chrome, etc.
        if (browser.isIE() && browser.getIEVersion() <= 9 || browser.isFirefox() && !supportFirefox()) {
            var message = args.join(' ');
            console.log(message);
            return;
        }

        if (typeof console !== 'undefined' && typeof console.log !== 'undefined' && console.log.apply) {
            console.log.apply(console, args);
        }
    } catch (e) {
        console.error(e);
    }
};

var Log = function Log() {
    this._prefix = false;
    this._level = DEBUG;
    this._logger = consoleLogger;

    return this;
};

Log.prototype._log = function (level, args) {
    var stackTrace = printStackTrace({
        // stacktrace.js will try to get the source via AJAX to guess anonymous functions.
        // It is necessary to disable AJAX requests in production to avoid unwanted traffic.
        guess: false
    });
    var d = new Date();
    this._logger({
        datetime: getISODateTime(d),
        level: level,
        prefix: this.getPrefix(),
        args: args,
        stackTrace: stackTrace
    });
};

Log.prototype.setPrefix = function (prefix) {
    if (typeof prefix !== 'undefined') {
        this._prefix = prefix;
    } else {
        this._prefix = false;
    }
};

Log.prototype.getPrefix = function () {
    return this._prefix !== false ? this._prefix : '';
};

Log.prototype.setLogger = function (logger) {
    if (typeof logger !== 'undefined' && typeof logger === 'function') {
        this._logger = logger;
    } else if (typeof logger !== 'undefined' && typeof logger === 'string') {
        var log_loggers = {
            'console': consoleLogger
        };
        this._logger = log_loggers[logger];

        if (typeof this._logger === 'undefined') {
            this._logger = function nullLogger(logger) {}; // default
        }
    }
};

Log.prototype.getLogger = function () {
    return this._logger;
};

Log.prototype.setLevel = function (level) {
    if (typeof level !== 'undefined' && typeof level === 'number') {
        this._level = level;
    } else if (typeof level !== 'undefined' && typeof level === 'string') {
        var log_levels = {
            'trace': TRACE,
            'debug': DEBUG,
            'info': INFO,
            'warn': WARN,
            'error': ERROR
        };
        this._level = log_levels[level];
        if (typeof this._level === 'undefined') {
            this._level = NONE; // default
        }
    }
};

Log.prototype.getLevel = function () {
    return this._level;
};

Log.prototype.log = function () {
    this._log('', Array.prototype.slice.call(arguments));
};

Log.prototype.trace = function () {
    var level = this._level;
    if (level <= TRACE) {
        this._log('T', Array.prototype.slice.call(arguments));
    }
};

Log.prototype.debug = function () {
    if (this._level <= DEBUG) {
        this._log('D', Array.prototype.slice.call(arguments));
    }
};

Log.prototype.info = function () {
    if (this._level <= INFO) {
        this._log('I', Array.prototype.slice.call(arguments));
    }
};

Log.prototype.warn = function () {
    if (this._level <= WARN) {
        this._log('W', Array.prototype.slice.call(arguments));
    }
};

Log.prototype.error = function () {
    if (this._level <= ERROR) {
        this._log('E', Array.prototype.slice.call(arguments));
    }
};

var _log = new Log();

module.exports = {
    setLevel: function setLevel() {
        _log.setLevel.apply(_log, Array.prototype.slice.call(arguments));
    },
    getLevel: function getLevel() {
        return _log.getLevel.apply(_log, Array.prototype.slice.call(arguments));
    },
    setLogger: function setLogger() {
        _log.setLogger.apply(_log, Array.prototype.slice.call(arguments));
    },
    getLogger: function getLogger() {
        return _log.getLogger.apply(_log, Array.prototype.slice.call(arguments));
    },
    setPrefix: function setPrefix() {
        _log.setPrefix.apply(_log, Array.prototype.slice.call(arguments));
    },
    getPrefix: function getPrefix() {
        return _log.getPrefix.apply(_log, Array.prototype.slice.call(arguments));
    },
    log: function log() {
        return _log.log.apply(_log, Array.prototype.slice.call(arguments));
    },
    trace: function trace() {
        return _log.trace.apply(_log, Array.prototype.slice.call(arguments));
    },
    debug: function debug() {
        return _log.debug.apply(_log, Array.prototype.slice.call(arguments));
    },
    info: function info() {
        return _log.info.apply(_log, Array.prototype.slice.call(arguments));
    },
    warn: function warn() {
        return _log.warn.apply(_log, Array.prototype.slice.call(arguments));
    },
    error: function error() {
        return _log.error.apply(_log, Array.prototype.slice.call(arguments));
    }
};


},{"./browser":"/home/cheton/github/webappengine/web/lib/browser.js","stacktrace":"/home/cheton/github/webappengine/web/vendor/stacktrace-js/stacktrace.js"}],"/home/cheton/github/webappengine/web/vendor/Sortable/Sortable.js":[function(require,module,exports){
/**!
 * Sortable
 * @author	RubaXa   <trash@rubaxa.org>
 * @license MIT
 */

"use strict";

(function (factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(factory);
	} else if (typeof module != "undefined" && typeof module.exports != "undefined") {
		module.exports = factory();
	} else if (typeof Package !== "undefined") {
		Sortable = factory(); // export for Meteor.js
	} else {
			/* jshint sub:true */
			window["Sortable"] = factory();
		}
})(function () {
	"use strict";

	var dragEl,
	    ghostEl,
	    cloneEl,
	    rootEl,
	    nextEl,
	    scrollEl,
	    scrollParentEl,
	    lastEl,
	    lastCSS,
	    oldIndex,
	    newIndex,
	    activeGroup,
	    autoScroll = {},
	    tapEvt,
	    touchEvt,
	   

	/** @const */
	RSPACE = /\s+/g,
	    expando = 'Sortable' + new Date().getTime(),
	    win = window,
	    document = win.document,
	    parseInt = win.parseInt,
	    supportDraggable = !!('draggable' in document.createElement('div')),
	    _silent = false,
	    abs = Math.abs,
	    slice = [].slice,
	    touchDragOverListeners = [],
	    _autoScroll = _throttle(function ( /**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
		// Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
		if (rootEl && options.scroll) {
			var el,
			    rect,
			    sens = options.scrollSensitivity,
			    speed = options.scrollSpeed,
			    x = evt.clientX,
			    y = evt.clientY,
			    winWidth = window.innerWidth,
			    winHeight = window.innerHeight,
			    vx,
			    vy;

			// Delect scrollEl
			if (scrollParentEl !== rootEl) {
				scrollEl = options.scroll;
				scrollParentEl = rootEl;

				if (scrollEl === true) {
					scrollEl = rootEl;

					do {
						if (scrollEl.offsetWidth < scrollEl.scrollWidth || scrollEl.offsetHeight < scrollEl.scrollHeight) {
							break;
						}
						/* jshint boss:true */
					} while (scrollEl = scrollEl.parentNode);
				}
			}

			if (scrollEl) {
				el = scrollEl;
				rect = scrollEl.getBoundingClientRect();
				vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
				vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens);
			}

			if (!(vx || vy)) {
				vx = (winWidth - x <= sens) - (x <= sens);
				vy = (winHeight - y <= sens) - (y <= sens);

				/* jshint expr:true */
				(vx || vy) && (el = win);
			}

			if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
				autoScroll.el = el;
				autoScroll.vx = vx;
				autoScroll.vy = vy;

				clearInterval(autoScroll.pid);

				if (el) {
					autoScroll.pid = setInterval(function () {
						if (el === win) {
							win.scrollTo(win.pageXOffset + vx * speed, win.pageYOffset + vy * speed);
						} else {
							vy && (el.scrollTop += vy * speed);
							vx && (el.scrollLeft += vx * speed);
						}
					}, 24);
				}
			}
		}
	}, 30);

	/**
  * @class  Sortable
  * @param  {HTMLElement}  el
  * @param  {Object}       [options]
  */
	function Sortable(el, options) {
		this.el = el; // root element
		this.options = options = _extend({}, options);

		// Export instance
		el[expando] = this;

		// Default options
		var defaults = {
			group: Math.random(),
			sort: true,
			disabled: false,
			store: null,
			handle: null,
			scroll: true,
			scrollSensitivity: 30,
			scrollSpeed: 10,
			draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
			ghostClass: 'sortable-ghost',
			ignore: 'a, img',
			filter: null,
			animation: 0,
			setData: function setData(dataTransfer, dragEl) {
				dataTransfer.setData('Text', dragEl.textContent);
			},
			dropBubble: false,
			dragoverBubble: false,
			dataIdAttr: 'data-id',
			delay: 0
		};

		// Set default options
		for (var name in defaults) {
			!(name in options) && (options[name] = defaults[name]);
		}

		var group = options.group;

		if (!group || typeof group != 'object') {
			group = options.group = { name: group };
		}

		['pull', 'put'].forEach(function (key) {
			if (!(key in group)) {
				group[key] = true;
			}
		});

		options.groups = ' ' + group.name + (group.put.join ? ' ' + group.put.join(' ') : '') + ' ';

		// Bind all private methods
		for (var fn in this) {
			if (fn.charAt(0) === '_') {
				this[fn] = _bind(this, this[fn]);
			}
		}

		// Bind events
		_on(el, 'mousedown', this._onTapStart);
		_on(el, 'touchstart', this._onTapStart);

		_on(el, 'dragover', this);
		_on(el, 'dragenter', this);

		touchDragOverListeners.push(this._onDragOver);

		// Restore sorting
		options.store && this.sort(options.store.get(this));
	}

	Sortable.prototype = /** @lends Sortable.prototype */{
		constructor: Sortable,

		_onTapStart: function _onTapStart( /** Event|TouchEvent */evt) {
			var _this = this,
			    el = this.el,
			    options = this.options,
			    type = evt.type,
			    touch = evt.touches && evt.touches[0],
			    target = (touch || evt).target,
			    originalTarget = target,
			    filter = options.filter;

			if (type === 'mousedown' && evt.button !== 0 || options.disabled) {
				return; // only left button or enabled
			}

			target = _closest(target, options.draggable, el);

			if (!target) {
				return;
			}

			// get the index of the dragged element within its parent
			oldIndex = _index(target);

			// Check filter
			if (typeof filter === 'function') {
				if (filter.call(this, evt, target, this)) {
					_dispatchEvent(_this, originalTarget, 'filter', target, el, oldIndex);
					evt.preventDefault();
					return; // cancel dnd
				}
			} else if (filter) {
					filter = filter.split(',').some(function (criteria) {
						criteria = _closest(originalTarget, criteria.trim(), el);

						if (criteria) {
							_dispatchEvent(_this, criteria, 'filter', target, el, oldIndex);
							return true;
						}
					});

					if (filter) {
						evt.preventDefault();
						return; // cancel dnd
					}
				}

			if (options.handle && !_closest(originalTarget, options.handle, el)) {
				return;
			}

			// Prepare `dragstart`
			this._prepareDragStart(evt, touch, target);
		},

		_prepareDragStart: function _prepareDragStart( /** Event */evt, /** Touch */touch, /** HTMLElement */target) {
			var _this = this,
			    el = _this.el,
			    options = _this.options,
			    ownerDocument = el.ownerDocument,
			    dragStartFn;

			if (target && !dragEl && target.parentNode === el) {
				tapEvt = evt;

				rootEl = el;
				dragEl = target;
				nextEl = dragEl.nextSibling;
				activeGroup = options.group;

				dragStartFn = function () {
					// Delayed drag has been triggered
					// we can re-enable the events: touchmove/mousemove
					_this._disableDelayedDrag();

					// Make the element draggable
					dragEl.draggable = true;

					// Disable "draggable"
					options.ignore.split(',').forEach(function (criteria) {
						_find(dragEl, criteria.trim(), _disableDraggable);
					});

					// Bind the events: dragstart/dragend
					_this._triggerDragStart(touch);
				};

				_on(ownerDocument, 'mouseup', _this._onDrop);
				_on(ownerDocument, 'touchend', _this._onDrop);
				_on(ownerDocument, 'touchcancel', _this._onDrop);

				if (options.delay) {
					// If the user moves the pointer before the delay has been reached:
					// disable the delayed drag
					_on(ownerDocument, 'mousemove', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchmove', _this._disableDelayedDrag);

					_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
				} else {
					dragStartFn();
				}
			}
		},

		_disableDelayedDrag: function _disableDelayedDrag() {
			var ownerDocument = this.el.ownerDocument;

			clearTimeout(this._dragStartTimer);

			_off(ownerDocument, 'mousemove', this._disableDelayedDrag);
			_off(ownerDocument, 'touchmove', this._disableDelayedDrag);
		},

		_triggerDragStart: function _triggerDragStart( /** Touch */touch) {
			if (touch) {
				// Touch device support
				tapEvt = {
					target: dragEl,
					clientX: touch.clientX,
					clientY: touch.clientY
				};

				this._onDragStart(tapEvt, 'touch');
			} else if (!supportDraggable) {
				this._onDragStart(tapEvt, true);
			} else {
				_on(dragEl, 'dragend', this);
				_on(rootEl, 'dragstart', this._onDragStart);
			}

			try {
				if (document.selection) {
					document.selection.empty();
				} else {
					window.getSelection().removeAllRanges();
				}
			} catch (err) {}
		},

		_dragStarted: function _dragStarted() {
			if (rootEl && dragEl) {
				// Apply effect
				_toggleClass(dragEl, this.options.ghostClass, true);

				Sortable.active = this;

				// Drag start event
				_dispatchEvent(this, rootEl, 'start', dragEl, rootEl, oldIndex);
			}
		},

		_emulateDragOver: function _emulateDragOver() {
			if (touchEvt) {
				_css(ghostEl, 'display', 'none');

				var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY),
				    parent = target,
				    groupName = ' ' + this.options.group.name + '',
				    i = touchDragOverListeners.length;

				if (parent) {
					do {
						if (parent[expando] && parent[expando].options.groups.indexOf(groupName) > -1) {
							while (i--) {
								touchDragOverListeners[i]({
									clientX: touchEvt.clientX,
									clientY: touchEvt.clientY,
									target: target,
									rootEl: parent
								});
							}

							break;
						}

						target = parent; // store last element
					}
					/* jshint boss:true */
					while (parent = parent.parentNode);
				}

				_css(ghostEl, 'display', '');
			}
		},

		_onTouchMove: function _onTouchMove( /**TouchEvent*/evt) {
			if (tapEvt) {
				var touch = evt.touches ? evt.touches[0] : evt,
				    dx = touch.clientX - tapEvt.clientX,
				    dy = touch.clientY - tapEvt.clientY,
				    translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';

				touchEvt = touch;

				_css(ghostEl, 'webkitTransform', translate3d);
				_css(ghostEl, 'mozTransform', translate3d);
				_css(ghostEl, 'msTransform', translate3d);
				_css(ghostEl, 'transform', translate3d);

				evt.preventDefault();
			}
		},

		_onDragStart: function _onDragStart( /**Event*/evt, /**boolean*/useFallback) {
			var dataTransfer = evt.dataTransfer,
			    options = this.options;

			this._offUpEvents();

			if (activeGroup.pull == 'clone') {
				cloneEl = dragEl.cloneNode(true);
				_css(cloneEl, 'display', 'none');
				rootEl.insertBefore(cloneEl, dragEl);
			}

			if (useFallback) {
				var rect = dragEl.getBoundingClientRect(),
				    css = _css(dragEl),
				    ghostRect;

				ghostEl = dragEl.cloneNode(true);

				_css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
				_css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
				_css(ghostEl, 'width', rect.width);
				_css(ghostEl, 'height', rect.height);
				_css(ghostEl, 'opacity', '0.8');
				_css(ghostEl, 'position', 'fixed');
				_css(ghostEl, 'zIndex', '100000');

				rootEl.appendChild(ghostEl);

				// Fixing dimensions.
				ghostRect = ghostEl.getBoundingClientRect();
				_css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
				_css(ghostEl, 'height', rect.height * 2 - ghostRect.height);

				if (useFallback === 'touch') {
					// Bind touch events
					_on(document, 'touchmove', this._onTouchMove);
					_on(document, 'touchend', this._onDrop);
					_on(document, 'touchcancel', this._onDrop);
				} else {
					// Old brwoser
					_on(document, 'mousemove', this._onTouchMove);
					_on(document, 'mouseup', this._onDrop);
				}

				this._loopId = setInterval(this._emulateDragOver, 150);
			} else {
				if (dataTransfer) {
					dataTransfer.effectAllowed = 'move';
					options.setData && options.setData.call(this, dataTransfer, dragEl);
				}

				_on(document, 'drop', this);
			}

			setTimeout(this._dragStarted, 0);
		},

		_onDragOver: function _onDragOver( /**Event*/evt) {
			var el = this.el,
			    target,
			    dragRect,
			    revert,
			    options = this.options,
			    group = options.group,
			    groupPut = group.put,
			    isOwner = activeGroup === group,
			    canSort = options.sort;

			if (evt.preventDefault !== void 0) {
				evt.preventDefault();
				!options.dragoverBubble && evt.stopPropagation();
			}

			if (activeGroup && !options.disabled && (isOwner ? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
			: activeGroup.pull && groupPut && (activeGroup.name === group.name || // by Name
			groupPut.indexOf && ~groupPut.indexOf(activeGroup.name)) // by Array
			) && (evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
			) {
					// Smart auto-scrolling
					_autoScroll(evt, options, this.el);

					if (_silent) {
						return;
					}

					target = _closest(evt.target, options.draggable, el);
					dragRect = dragEl.getBoundingClientRect();

					if (revert) {
						_cloneHide(true);

						if (cloneEl || nextEl) {
							rootEl.insertBefore(dragEl, cloneEl || nextEl);
						} else if (!canSort) {
							rootEl.appendChild(dragEl);
						}

						return;
					}

					if (el.children.length === 0 || el.children[0] === ghostEl || el === evt.target && (target = _ghostInBottom(el, evt))) {
						if (target) {
							if (target.animated) {
								return;
							}
							targetRect = target.getBoundingClientRect();
						}

						_cloneHide(isOwner);

						if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect) !== false) {
							el.appendChild(dragEl);
							this._animate(dragRect, dragEl);
							target && this._animate(targetRect, target);
						}
					} else if (target && !target.animated && target !== dragEl && target.parentNode[expando] !== void 0) {
						if (lastEl !== target) {
							lastEl = target;
							lastCSS = _css(target);
						}

						var targetRect = target.getBoundingClientRect(),
						    width = targetRect.right - targetRect.left,
						    height = targetRect.bottom - targetRect.top,
						    floating = /left|right|inline/.test(lastCSS.cssFloat + lastCSS.display),
						    isWide = target.offsetWidth > dragEl.offsetWidth,
						    isLong = target.offsetHeight > dragEl.offsetHeight,
						    halfway = (floating ? (evt.clientX - targetRect.left) / width : (evt.clientY - targetRect.top) / height) > 0.5,
						    nextSibling = target.nextElementSibling,
						    moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect),
						    after;

						if (moveVector !== false) {
							_silent = true;
							setTimeout(_unsilent, 30);

							_cloneHide(isOwner);

							if (moveVector === 1 || moveVector === -1) {
								after = moveVector === 1;
							} else if (floating) {
								after = target.previousElementSibling === dragEl && !isWide || halfway && isWide;
							} else {
								after = nextSibling !== dragEl && !isLong || halfway && isLong;
							}

							if (after && !nextSibling) {
								el.appendChild(dragEl);
							} else {
								target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
							}

							this._animate(dragRect, dragEl);
							this._animate(targetRect, target);
						}
					}
				}
		},

		_animate: function _animate(prevRect, target) {
			var ms = this.options.animation;

			if (ms) {
				var currentRect = target.getBoundingClientRect();

				_css(target, 'transition', 'none');
				_css(target, 'transform', 'translate3d(' + (prevRect.left - currentRect.left) + 'px,' + (prevRect.top - currentRect.top) + 'px,0)');

				target.offsetWidth; // repaint

				_css(target, 'transition', 'all ' + ms + 'ms');
				_css(target, 'transform', 'translate3d(0,0,0)');

				clearTimeout(target.animated);
				target.animated = setTimeout(function () {
					_css(target, 'transition', '');
					_css(target, 'transform', '');
					target.animated = false;
				}, ms);
			}
		},

		_offUpEvents: function _offUpEvents() {
			var ownerDocument = this.el.ownerDocument;

			_off(document, 'touchmove', this._onTouchMove);
			_off(ownerDocument, 'mouseup', this._onDrop);
			_off(ownerDocument, 'touchend', this._onDrop);
			_off(ownerDocument, 'touchcancel', this._onDrop);
		},

		_onDrop: function _onDrop( /**Event*/evt) {
			var el = this.el,
			    options = this.options;

			clearInterval(this._loopId);
			clearInterval(autoScroll.pid);
			clearTimeout(this._dragStartTimer);

			// Unbind events
			_off(document, 'drop', this);
			_off(document, 'mousemove', this._onTouchMove);
			_off(el, 'dragstart', this._onDragStart);

			this._offUpEvents();

			if (evt) {
				evt.preventDefault();
				!options.dropBubble && evt.stopPropagation();

				ghostEl && ghostEl.parentNode.removeChild(ghostEl);

				if (dragEl) {
					_off(dragEl, 'dragend', this);

					_disableDraggable(dragEl);
					_toggleClass(dragEl, this.options.ghostClass, false);

					if (rootEl !== dragEl.parentNode) {
						newIndex = _index(dragEl);

						// drag from one list and drop into another
						_dispatchEvent(null, dragEl.parentNode, 'sort', dragEl, rootEl, oldIndex, newIndex);
						_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);

						// Add event
						_dispatchEvent(null, dragEl.parentNode, 'add', dragEl, rootEl, oldIndex, newIndex);

						// Remove event
						_dispatchEvent(this, rootEl, 'remove', dragEl, rootEl, oldIndex, newIndex);
					} else {
						// Remove clone
						cloneEl && cloneEl.parentNode.removeChild(cloneEl);

						if (dragEl.nextSibling !== nextEl) {
							// Get the index of the dragged element within its parent
							newIndex = _index(dragEl);

							// drag & drop within the same list
							_dispatchEvent(this, rootEl, 'update', dragEl, rootEl, oldIndex, newIndex);
							_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
						}
					}

					if (Sortable.active) {
						// Drag end event
						_dispatchEvent(this, rootEl, 'end', dragEl, rootEl, oldIndex, newIndex);

						// Save sorting
						this.save();
					}
				}

				// Nulling
				rootEl = dragEl = ghostEl = nextEl = cloneEl = scrollEl = scrollParentEl = tapEvt = touchEvt = lastEl = lastCSS = activeGroup = Sortable.active = null;
			}
		},

		handleEvent: function handleEvent( /**Event*/evt) {
			var type = evt.type;

			if (type === 'dragover' || type === 'dragenter') {
				if (dragEl) {
					this._onDragOver(evt);
					_globalDragOver(evt);
				}
			} else if (type === 'drop' || type === 'dragend') {
				this._onDrop(evt);
			}
		},

		/**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
		toArray: function toArray() {
			var order = [],
			    el,
			    children = this.el.children,
			    i = 0,
			    n = children.length,
			    options = this.options;

			for (; i < n; i++) {
				el = children[i];
				if (_closest(el, options.draggable, this.el)) {
					order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
				}
			}

			return order;
		},

		/**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
		sort: function sort(order) {
			var items = {},
			    rootEl = this.el;

			this.toArray().forEach(function (id, i) {
				var el = rootEl.children[i];

				if (_closest(el, this.options.draggable, rootEl)) {
					items[id] = el;
				}
			}, this);

			order.forEach(function (id) {
				if (items[id]) {
					rootEl.removeChild(items[id]);
					rootEl.appendChild(items[id]);
				}
			});
		},

		/**
   * Save the current sorting
   */
		save: function save() {
			var store = this.options.store;
			store && store.set(this);
		},

		/**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
		closest: function closest(el, selector) {
			return _closest(el, selector || this.options.draggable, this.el);
		},

		/**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
		option: function option(name, value) {
			var options = this.options;

			if (value === void 0) {
				return options[name];
			} else {
				options[name] = value;
			}
		},

		/**
   * Destroy
   */
		destroy: function destroy() {
			var el = this.el;

			el[expando] = null;

			_off(el, 'mousedown', this._onTapStart);
			_off(el, 'touchstart', this._onTapStart);

			_off(el, 'dragover', this);
			_off(el, 'dragenter', this);

			// Remove draggable attributes
			Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
				el.removeAttribute('draggable');
			});

			touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);

			this._onDrop();

			this.el = el = null;
		}
	};

	function _cloneHide(state) {
		if (cloneEl && cloneEl.state !== state) {
			_css(cloneEl, 'display', state ? 'none' : '');
			!state && cloneEl.state && rootEl.insertBefore(cloneEl, dragEl);
			cloneEl.state = state;
		}
	}

	function _bind(ctx, fn) {
		var args = slice.call(arguments, 2);
		return fn.bind ? fn.bind.apply(fn, [ctx].concat(args)) : function () {
			return fn.apply(ctx, args.concat(slice.call(arguments)));
		};
	}

	function _closest( /**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
		if (el) {
			ctx = ctx || document;
			selector = selector.split('.');

			var tag = selector.shift().toUpperCase(),
			    re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');

			do {
				if (tag === '>*' && el.parentNode === ctx || (tag === '' || el.nodeName.toUpperCase() == tag) && (!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)) {
					return el;
				}
			} while (el !== ctx && (el = el.parentNode));
		}

		return null;
	}

	function _globalDragOver( /**Event*/evt) {
		evt.dataTransfer.dropEffect = 'move';
		evt.preventDefault();
	}

	function _on(el, event, fn) {
		el.addEventListener(event, fn, false);
	}

	function _off(el, event, fn) {
		el.removeEventListener(event, fn, false);
	}

	function _toggleClass(el, name, state) {
		if (el) {
			if (el.classList) {
				el.classList[state ? 'add' : 'remove'](name);
			} else {
				var className = (' ' + el.className + ' ').replace(RSPACE, ' ').replace(' ' + name + ' ', ' ');
				el.className = (className + (state ? ' ' + name : '')).replace(RSPACE, ' ');
			}
		}
	}

	function _css(el, prop, val) {
		var style = el && el.style;

		if (style) {
			if (val === void 0) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					val = document.defaultView.getComputedStyle(el, '');
				} else if (el.currentStyle) {
					val = el.currentStyle;
				}

				return prop === void 0 ? val : val[prop];
			} else {
				if (!(prop in style)) {
					prop = '-webkit-' + prop;
				}

				style[prop] = val + (typeof val === 'string' ? '' : 'px');
			}
		}
	}

	function _find(ctx, tagName, iterator) {
		if (ctx) {
			var list = ctx.getElementsByTagName(tagName),
			    i = 0,
			    n = list.length;

			if (iterator) {
				for (; i < n; i++) {
					iterator(list[i], i);
				}
			}

			return list;
		}

		return [];
	}

	function _dispatchEvent(sortable, rootEl, name, targetEl, fromEl, startIndex, newIndex) {
		var evt = document.createEvent('Event'),
		    options = (sortable || rootEl[expando]).options,
		    onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

		evt.initEvent(name, true, true);

		evt.to = rootEl;
		evt.from = fromEl || rootEl;
		evt.item = targetEl || rootEl;
		evt.clone = cloneEl;

		evt.oldIndex = startIndex;
		evt.newIndex = newIndex;

		rootEl.dispatchEvent(evt);

		if (options[onName]) {
			options[onName].call(sortable, evt);
		}
	}

	function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect) {
		var evt,
		    sortable = fromEl[expando],
		    onMoveFn = sortable.options.onMove,
		    retVal;

		if (onMoveFn) {
			evt = document.createEvent('Event');
			evt.initEvent('move', true, true);

			evt.to = toEl;
			evt.from = fromEl;
			evt.dragged = dragEl;
			evt.draggedRect = dragRect;
			evt.related = targetEl || toEl;
			evt.relatedRect = targetRect || toEl.getBoundingClientRect();

			retVal = onMoveFn.call(sortable, evt);
		}

		return retVal;
	}

	function _disableDraggable(el) {
		el.draggable = false;
	}

	function _unsilent() {
		_silent = false;
	}

	/** @returns {HTMLElement|false} */
	function _ghostInBottom(el, evt) {
		var lastEl = el.lastElementChild,
		    rect = lastEl.getBoundingClientRect();

		return evt.clientY - (rect.top + rect.height) > 5 && lastEl; // min delta
	}

	/**
  * Generate id
  * @param   {HTMLElement} el
  * @returns {String}
  * @private
  */
	function _generateId(el) {
		var str = el.tagName + el.className + el.src + el.href + el.textContent,
		    i = str.length,
		    sum = 0;

		while (i--) {
			sum += str.charCodeAt(i);
		}

		return sum.toString(36);
	}

	/**
  * Returns the index of an element within its parent
  * @param el
  * @returns {number}
  * @private
  */
	function _index( /**HTMLElement*/el) {
		var index = 0;
		while (el && (el = el.previousElementSibling)) {
			if (el.nodeName.toUpperCase() !== 'TEMPLATE') {
				index++;
			}
		}
		return index;
	}

	function _throttle(callback, ms) {
		var args, _this;

		return function () {
			if (args === void 0) {
				args = arguments;
				_this = this;

				setTimeout(function () {
					if (args.length === 1) {
						callback.call(_this, args[0]);
					} else {
						callback.apply(_this, args);
					}

					args = void 0;
				}, ms);
			}
		};
	}

	function _extend(dst, src) {
		if (dst && src) {
			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					dst[key] = src[key];
				}
			}
		}

		return dst;
	}

	// Export utils
	Sortable.utils = {
		on: _on,
		off: _off,
		css: _css,
		find: _find,
		bind: _bind,
		is: function is(el, selector) {
			return !!_closest(el, selector, el);
		},
		extend: _extend,
		throttle: _throttle,
		closest: _closest,
		toggleClass: _toggleClass,
		index: _index
	};

	Sortable.version = '1.2.1';

	/**
  * Create sortable instance
  * @param {HTMLElement}  el
  * @param {Object}      [options]
  */
	Sortable.create = function (el, options) {
		return new Sortable(el, options);
	};

	// Export
	return Sortable;
});


},{}],"/home/cheton/github/webappengine/web/vendor/async/lib/async.js":[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
'use strict';

(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self || typeof global === 'object' && global.global === global && global || this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function () {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function () {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function _isObject(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) ||
        // has a positive integer length property
        typeof arr.length === "number" && arr.length >= 0 && arr.length % 1 === 0;
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ? _arrayEach(coll, iterator) : _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) {
            return i;
        });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function () {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0:
                    return func.call(this, rest);
                case 1:
                    return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function (fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function (fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;

    async.forEach = async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries = async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };

    async.forEachLimit = async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf = async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            } else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
            }
        }
    };

    async.forEachOfSeries = async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                } else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.nextTick(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };

    async.forEachOfLimit = async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish() {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        } else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }

    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject = async.foldl = async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr = async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({ index: index, value: x });
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select = async.filter = doParallel(_filter);

    async.selectLimit = async.filterLimit = doParallelLimit(_filter);

    async.selectSeries = async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function (value, cb) {
            iterator(value, function (v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function (arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any = async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all = async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, { value: x, criteria: criteria });
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            } else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }
        });

        function comparator(left, right) {
            var a = left.criteria,
                b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k] : [tasks[k]];
            var taskCallback = _restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function (val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                } else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return a && results.hasOwnProperty(x);
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            } else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };

    async.retry = function (times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t) {
            if (typeof t === 'number') {
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if (typeof t === 'object') {
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function (seriesCallback) {
                    task(function (err, result) {
                        seriesCallback(!err || finalAttempt, { err: err, result: result });
                    }, wrappedResults);
                };
            }

            function retryInterval(interval) {
                return function (seriesCallback) {
                    setTimeout(function () {
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times -= 1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if (!finalAttempt && opts.interval > 0) {
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function (done, data) {
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                } else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    } else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function (tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function (tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return index < tasks.length - 1 ? makeCallback(index + 1) : null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(null, args.concat(callArgs));
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function (err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback(null);
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function () {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function () {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function () {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function (err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function check(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function (next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        } else if (concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if (data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function () {
                    q.drain();
                });
            }
            _arrayEach(data, function (task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function () {
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function push(data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function kill() {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function unshift(data, callback) {
                _insert(q, data, true, callback);
            },
            process: function process() {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while (workers < q.concurrency && q.tasks.length) {
                        var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function length() {
                return q.tasks.length;
            },
            running: function running() {
                return workers;
            },
            idle: function idle() {
                return q.tasks.length + workers === 0;
            },
            pause: function pause() {
                q.paused = true;
            },
            resume: function resume() {
                if (q.paused === false) {
                    return;
                }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b) {
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + (end - beg + 1 >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if (data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function () {
                    q.drain();
                });
            }
            _arrayEach(data, function (task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    } else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            } else if (key in queues) {
                queues[key].push(callback);
            } else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function () /* functions... */{
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            }, function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function () /* functions... */{
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    function _applyEach(eachfn) {
        return _restParam(function (fns, args) {
            var go = _restParam(function (args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                }, callback);
            });
            if (args.length) {
                return go.apply(this, args);
            } else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);

    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function (values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync = async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function (value) {
                    callback(null, value);
                })["catch"](function (err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
            define([], function () {
                return async;
            });
        }
        // included directly via <script> tag
        else {
                root.async = async;
            }
})();


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2NoZXRvbi9naXRodWIvd2ViYXBwZW5naW5lL3dlYi92ZW5kb3IvYXN5bmMvbGliL2FzeW5jLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztHQUVHO0FBQ0gsWUFBWSxDQUFDOztBQUViLENBQUMsWUFBWTs7SUFFVCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixTQUFTLElBQUksR0FBRyxFQUFFO0lBQ2xCLFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtRQUNqQixPQUFPLENBQUMsQ0FBQztLQUNaO0lBQ0QsU0FBUyxNQUFNLENBQUMsQ0FBQyxFQUFFO1FBQ2YsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2Q7SUFDRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDZCxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLEtBQUs7QUFDTDs7QUFFQSxJQUFJLElBQUksY0FBYyxDQUFDO0FBQ3ZCO0FBQ0E7QUFDQTs7QUFFQSxJQUFJLElBQUksSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUM7O0lBRTlJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtRQUNkLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3BDLEtBQUs7O0lBRUQsS0FBSyxDQUFDLFVBQVUsR0FBRyxZQUFZO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0FBQ3JCLEtBQUssQ0FBQzs7SUFFRixTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUU7UUFDbkIsT0FBTyxZQUFZO1lBQ2YsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLE1BQU0sSUFB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QUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNoRCxDQUFDLENBQUM7YUFDTixNQUFNO2dCQUNILFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDMUI7U0FDSixDQUFDLENBQUM7QUFDWCxLQUFLLENBQUM7QUFDTjs7SUFFSSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQzlDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQy9CLEtBQUs7O1NBRUksSUFBSSxPQUFPLE1BQU0sS0FBSyxVQUFVLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUM3QyxNQUFNLENBQUMsRUFBRSxFQUFFLFlBQVk7Z0JBQ25CLE9BQU8sS0FBSyxDQUFDO2FBQ2hCLENBQUMsQ0FBQztBQUNmLFNBQVM7O2FBRUk7Z0JBQ0csSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7YUFDdEI7Q0FDWixHQUFHLENBQUM7QUFDTCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4ndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgYXN5bmMgPSB7fTtcbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICBmdW5jdGlvbiBpZGVudGl0eSh2KSB7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b0Jvb2wodikge1xuICAgICAgICByZXR1cm4gISF2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBub3RJZCh2KSB7XG4gICAgICAgIHJldHVybiAhdjtcbiAgICB9XG5cbiAgICAvLyBnbG9iYWwgb24gdGhlIHNlcnZlciwgd2luZG93IGluIHRoZSBicm93c2VyXG4gICAgdmFyIHByZXZpb3VzX2FzeW5jO1xuXG4gICAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gICAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAgIC8vIGluc3RlYWQgb2YgYHdpbmRvd2AgZm9yIGBXZWJXb3JrZXJgIHN1cHBvcnQuXG4gICAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZi5zZWxmID09PSBzZWxmICYmIHNlbGYgfHwgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fCB0aGlzO1xuXG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICBwcmV2aW91c19hc3luYyA9IHJvb3QuYXN5bmM7XG4gICAgfVxuXG4gICAgYXN5bmMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IHByZXZpb3VzX2FzeW5jO1xuICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubHlfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vLy8gY3Jvc3MtYnJvd3NlciBjb21wYXRpYmxpdHkgZnVuY3Rpb25zIC8vLy9cblxuICAgIHZhciBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4gICAgdmFyIF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBfdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH07XG5cbiAgICAvLyBQb3J0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzIGlzT2JqZWN0XG4gICAgdmFyIF9pc09iamVjdCA9IGZ1bmN0aW9uIF9pc09iamVjdChvYmopIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fFxuICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICB0eXBlb2YgYXJyLmxlbmd0aCA9PT0gXCJudW1iZXJcIiAmJiBhcnIubGVuZ3RoID49IDAgJiYgYXJyLmxlbmd0aCAlIDEgPT09IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2VhY2goY29sbCwgaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5TGlrZShjb2xsKSA/IF9hcnJheUVhY2goY29sbCwgaXRlcmF0b3IpIDogX2ZvckVhY2hPZihjb2xsLCBpdGVyYXRvcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVkdWNlKGFyciwgaXRlcmF0b3IsIG1lbW8pIHtcbiAgICAgICAgX2FycmF5RWFjaChhcnIsIGZ1bmN0aW9uICh4LCBpLCBhKSB7XG4gICAgICAgICAgICBtZW1vID0gaXRlcmF0b3IobWVtbywgeCwgaSwgYSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZm9yRWFjaE9mKG9iamVjdCwgaXRlcmF0b3IpIHtcbiAgICAgICAgX2FycmF5RWFjaChfa2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luZGV4T2YoYXJyLCBpdGVtKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgdmFyIF9rZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5cztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2tleUl0ZXJhdG9yKGNvbGwpIHtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIGtleXM7XG4gICAgICAgIGlmIChfaXNBcnJheUxpa2UoY29sbCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8gaSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IF9rZXlzKGNvbGwpO1xuICAgICAgICAgICAgbGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBrZXlzW2ldIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTaW1pbGFyIHRvIEVTNidzIHJlc3QgcGFyYW0gKGh0dHA6Ly9hcml5YS5vZmlsYWJzLmNvbS8yMDEzLzAzL2VzNi1hbmQtcmVzdC1wYXJhbWV0ZXIuaHRtbClcbiAgICAvLyBUaGlzIGFjY3VtdWxhdGVzIHRoZSBhcmd1bWVudHMgcGFzc2VkIGludG8gYW4gYXJyYXksIGFmdGVyIGEgZ2l2ZW4gaW5kZXguXG4gICAgLy8gRnJvbSB1bmRlcnNjb3JlLmpzIChodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmUvcHVsbC8yMTQwKS5cbiAgICBmdW5jdGlvbiBfcmVzdFBhcmFtKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICAgICAgc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXggPT0gbnVsbCA/IGZ1bmMubGVuZ3RoIC0gMSA6ICtzdGFydEluZGV4O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHByb2Nlc3MubmV4dFRpY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBwcm9jZXNzLm5leHRUaWNrO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gX2RlbGF5O1xuICAgIH1cbiAgICBhc3luYy5zZXRJbW1lZGlhdGUgPSBfc2V0SW1tZWRpYXRlID8gX2RlbGF5IDogYXN5bmMubmV4dFRpY2s7XG5cbiAgICBhc3luYy5mb3JFYWNoID0gYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9IGFzeW5jLmVhY2hTZXJpZXMgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9IGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPSBhc3luYy5lYWNoT2YgPSBmdW5jdGlvbiAob2JqZWN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqZWN0ID0gb2JqZWN0IHx8IFtdO1xuICAgICAgICB2YXIgc2l6ZSA9IF9pc0FycmF5TGlrZShvYmplY3QpID8gb2JqZWN0Lmxlbmd0aCA6IF9rZXlzKG9iamVjdCkubGVuZ3RoO1xuICAgICAgICB2YXIgY29tcGxldGVkID0gMDtcbiAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgX2VhY2gob2JqZWN0LCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSwgb25seV9vbmNlKGRvbmUpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIGRvbmUoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBzaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2ZTZXJpZXMgPSBhc3luYy5lYWNoT2ZTZXJpZXMgPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICBmdW5jdGlvbiBpdGVyYXRlKCkge1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5uZXh0VGljayhpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mTGltaXQgPSBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSAmJiBydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHdoaWxlIChydW5uaW5nIDwgbGltaXQgJiYgIWVycm9yZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcnVubmluZyArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2YsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbExpbWl0KGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oX2VhY2hPZkxpbWl0KGxpbWl0KSwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1Nlcmllcyhmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mU2VyaWVzLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FzeW5jTWFwKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMubWFwID0gZG9QYXJhbGxlbChfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcFNlcmllcyA9IGRvU2VyaWVzKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2FzeW5jTWFwKTtcblxuICAgIC8vIHJlZHVjZSBvbmx5IGhhcyBhIHNlcmllcyB2ZXJzaW9uLCBhcyBkb2luZyByZWR1Y2UgaW4gcGFyYWxsZWwgd29uJ3RcbiAgICAvLyB3b3JrIGluIG1hbnkgc2l0dWF0aW9ucy5cbiAgICBhc3luYy5pbmplY3QgPSBhc3luYy5mb2xkbCA9IGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciB8fCBudWxsLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvbGRyID0gYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHsgaW5kZXg6IGluZGV4LCB2YWx1ZTogeCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPSBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPSBhc3luYy5maWx0ZXJMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdFNlcmllcyA9IGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGNiKCF2KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGFzeW5jLnJlamVjdCA9IGRvUGFyYWxsZWwoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0TGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX3JlamVjdCk7XG4gICAgYXN5bmMucmVqZWN0U2VyaWVzID0gZG9TZXJpZXMoX3JlamVjdCk7XG5cbiAgICBmdW5jdGlvbiBfY3JlYXRlVGVzdGVyKGVhY2hmbiwgY2hlY2ssIGdldFJlc3VsdCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIGNiKGdldFJlc3VsdChmYWxzZSwgdm9pZCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBpdGVyYXRlZSh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghY2IpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYiAmJiBjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoZ2V0UmVzdWx0KHRydWUsIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IGxpbWl0O1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy5hbnkgPSBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPSBhc3luYy5ldmVyeSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBub3RJZCwgbm90SWQpO1xuXG4gICAgYXN5bmMuZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgICBhc3luYy5kZXRlY3QgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcbiAgICBhc3luYy5kZXRlY3RMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG5cbiAgICBhc3luYy5zb3J0QnkgPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMubWFwKGFyciwgZnVuY3Rpb24gKHgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAoZXJyLCBjcml0ZXJpYSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7IHZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWEgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLFxuICAgICAgICAgICAgICAgIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXSA6IFt0YXNrc1trXV07XG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9mb3JFYWNoT2YocmVzdWx0cywgZnVuY3Rpb24gKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgaW5leGlzdGFudCBkZXBlbmRlbmN5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCk7XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSkgJiYgIXJlc3VsdHMuaGFzT3duUHJvcGVydHkoayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLnJldHJ5ID0gZnVuY3Rpb24gKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LnRpbWVzLCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgICAgICBhY2MuaW50ZXJ2YWwgPSBwYXJzZUludCh0LmludGVydmFsLCAxMCkgfHwgREVGQVVMVF9JTlRFUlZBTDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBhcmd1bWVudCB0eXBlIGZvciBcXCd0aW1lc1xcJzogJyArIHR5cGVvZiB0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuZ3RoIDwgMSB8fCBsZW5ndGggPiAzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnRzIC0gbXVzdCBiZSBlaXRoZXIgKHRhc2spLCAodGFzaywgY2FsbGJhY2spLCAodGltZXMsIHRhc2spIG9yICh0aW1lcywgdGFzaywgY2FsbGJhY2spJyk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoIDw9IDIgJiYgdHlwZW9mIHRpbWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRhc2s7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcGFyc2VUaW1lcyhvcHRzLCB0aW1lcyk7XG4gICAgICAgIH1cbiAgICAgICAgb3B0cy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICBvcHRzLnRhc2sgPSB0YXNrO1xuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZWRUYXNrKHdyYXBwZWRDYWxsYmFjaywgd3JhcHBlZFJlc3VsdHMpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5QXR0ZW1wdCh0YXNrLCBmaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGZpbmFsQXR0ZW1wdCwgeyBlcnI6IGVyciwgcmVzdWx0OiByZXN1bHQgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMgLT0gMSk7XG4gICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQob3B0cy50YXNrLCBmaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbiAoZG9uZSwgZGF0YSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uICh0YXNrcywgbGltaXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChfZWFjaE9mTGltaXQobGltaXQpLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXJpZXMgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4IDwgdGFza3MubGVuZ3RoIC0gMSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gZm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1ha2VDYWxsYmFjaygwKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuYXBwbHkgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoY2FsbEFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChjYWxsQXJncykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiArK2NhbGxzIDw9IDEgfHwgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy51bnRpbCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjaGVjayk7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGNoZWNrID0gZnVuY3Rpb24gY2hlY2soZXJyLCB0cnV0aCkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRydXRoKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRlc3QoY2hlY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kb0R1cmluZyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgYXN5bmMuZHVyaW5nKGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCAmJiBxLmlkbGUoKSkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIF9hcnJheUVhY2godGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHEgPSB7XG4gICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICBjb25jdXJyZW5jeTogY29uY3VycmVuY3ksXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgZW1wdHk6IG5vb3AsXG4gICAgICAgICAgICBkcmFpbjogbm9vcCxcbiAgICAgICAgICAgIHN0YXJ0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGF1c2VkOiBmYWxzZSxcbiAgICAgICAgICAgIHB1c2g6IGZ1bmN0aW9uIHB1c2goZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24ga2lsbCgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gdW5zaGlmdChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgdHJ1ZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAod29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/IHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOiBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzay5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHEuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd29ya2VyKGRhdGEsIGNiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uIGxlbmd0aCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gcnVubmluZygpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VycztcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpZGxlOiBmdW5jdGlvbiBpZGxlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uIHJlc3VtZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdW1lQ291bnQgPSBNYXRoLm1pbihxLmNvbmN1cnJlbmN5LCBxLnRhc2tzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjYWxsIHEucHJvY2VzcyBvbmNlIHBlciBjb25jdXJyZW50XG4gICAgICAgICAgICAgICAgLy8gd29ya2VyIHRvIHByZXNlcnZlIGZ1bGwgY29uY3VycmVuY3kgYWZ0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB3ID0gMTsgdyA8PSByZXN1bWVDb3VudDsgdysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfVxuXG4gICAgYXN5bmMucXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICB2YXIgcSA9IF9xdWV1ZShmdW5jdGlvbiAoaXRlbXMsIGNiKSB7XG4gICAgICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgICAgfSwgY29uY3VycmVuY3ksIDEpO1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5wcmlvcml0eVF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcblxuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoZW5kIC0gYmVnICsgMSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoa2V5IGluIG1lbW8pIHtcbiAgICAgICAgICAgICAgICBhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIG1lbW9ba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSBpbiBxdWV1ZXMpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH07XG5cbiAgICBhc3luYy51bm1lbW9pemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAoZm4udW5tZW1vaXplZCB8fCBmbikuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3RpbWVzKG1hcHBlcikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGNvdW50LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIG1hcHBlcihfcmFuZ2UoY291bnQpLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jLnRpbWVzID0gX3RpbWVzKGFzeW5jLm1hcCk7XG4gICAgYXN5bmMudGltZXNTZXJpZXMgPSBfdGltZXMoYXN5bmMubWFwU2VyaWVzKTtcbiAgICBhc3luYy50aW1lc0xpbWl0ID0gZnVuY3Rpb24gKGNvdW50LCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5tYXBMaW1pdChfcmFuZ2UoY291bnQpLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VxID0gZnVuY3Rpb24gKCkgLyogZnVuY3Rpb25zLi4uICove1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5jb21wb3NlID0gZnVuY3Rpb24gKCkgLyogZnVuY3Rpb25zLi4uICove1xuICAgICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9hcHBseUVhY2goZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ28uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuYXBwbHlFYWNoID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2YpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mU2VyaWVzKTtcblxuICAgIGFzeW5jLmZvcmV2ZXIgPSBmdW5jdGlvbiAoZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkb25lID0gb25seV9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcbiAgICAgICAgZnVuY3Rpb24gbmV4dChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFzayhuZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGVuc3VyZUFzeW5jKGZuKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgYXJncy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5uZXJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG5cbiAgICBhc3luYy5jb25zdGFudCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPSBhc3luYy5hc3luY2lmeSA9IGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKF9pc09iamVjdChyZXN1bHQpICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByb290LmFzeW5jID0gYXN5bmM7XG4gICAgICAgICAgICB9XG59KSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDJOb1pYUnZiaTluYVhSb2RXSXZkMlZpWVhCd1pXNW5hVzVsTDNkbFlpOTJaVzVrYjNJdllYTjVibU12YkdsaUwyRnplVzVqTG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096czdPenM3T3p0QlFVOUJMRUZCUVVNc1EwRkJRU3haUVVGWk96dEJRVVZVTEZGQlFVa3NTMEZCU3l4SFFVRkhMRVZCUVVVc1EwRkJRenRCUVVObUxHRkJRVk1zU1VGQlNTeEhRVUZITEVWQlFVVTdRVUZEYkVJc1lVRkJVeXhSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZGTzBGQlEycENMR1ZCUVU4c1EwRkJReXhEUVVGRE8wdEJRMW83UVVGRFJDeGhRVUZUTEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVN1FVRkRaaXhsUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdTMEZEWkR0QlFVTkVMR0ZCUVZNc1MwRkJTeXhEUVVGRExFTkJRVU1zUlVGQlJUdEJRVU5rTEdWQlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1MwRkRZanM3TzBGQlIwUXNVVUZCU1N4alFVRmpMRU5CUVVNN096czdPMEZCUzI1Q0xGRkJRVWtzU1VGQlNTeEhRVUZITEU5QlFVOHNTVUZCU1N4TFFVRkxMRkZCUVZFc1NVRkJTU3hKUVVGSkxFTkJRVU1zU1VGQlNTeExRVUZMTEVsQlFVa3NTVUZCU1N4SlFVRkpMRWxCUTNwRUxFOUJRVThzVFVGQlRTeExRVUZMTEZGQlFWRXNTVUZCU1N4TlFVRk5MRU5CUVVNc1RVRkJUU3hMUVVGTExFMUJRVTBzU1VGQlNTeE5RVUZOTEVsQlEyaEZMRWxCUVVrc1EwRkJRenM3UVVGRllpeFJRVUZKTEVsQlFVa3NTVUZCU1N4SlFVRkpMRVZCUVVVN1FVRkRaQ3h6UWtGQll5eEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNN1MwRkRMMEk3TzBGQlJVUXNVMEZCU3l4RFFVRkRMRlZCUVZVc1IwRkJSeXhaUVVGWk8wRkJRek5DTEZsQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1kwRkJZeXhEUVVGRE8wRkJRelZDTEdWQlFVOHNTMEZCU3l4RFFVRkRPMHRCUTJoQ0xFTkJRVU03TzBGQlJVWXNZVUZCVXl4VFFVRlRMRU5CUVVNc1JVRkJSU3hGUVVGRk8wRkJRMjVDTEdWQlFVOHNXVUZCVnp0QlFVTmtMR2RDUVVGSkxFVkJRVVVzUzBGQlN5eEpRVUZKTEVWQlFVVXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXc0UWtGQk9FSXNRMEZCUXl4RFFVRkRPMEZCUTJwRkxHTkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8wRkJRekZDTEdOQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNN1UwRkRZaXhEUVVGRE8wdEJRMHc3TzBGQlJVUXNZVUZCVXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hGUVVGRk8wRkJRMllzWlVGQlR5eFpRVUZYTzBGQlEyUXNaMEpCUVVrc1JVRkJSU3hMUVVGTExFbEJRVWtzUlVGQlJTeFBRVUZQTzBGQlEzaENMR05CUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMEZCUXpGQ0xHTkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTTdVMEZEWWl4RFFVRkRPMHRCUTB3N096czdRVUZKUkN4UlFVRkpMRk5CUVZNc1IwRkJSeXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXpzN1FVRkZNVU1zVVVGQlNTeFJRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTlCUVU4c1NVRkJTU3hWUVVGVkxFZEJRVWNzUlVGQlJUdEJRVU16UXl4bFFVRlBMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NaMEpCUVdkQ0xFTkJRVU03UzBGRGJrUXNRMEZCUXpzN08wRkJSMFlzVVVGQlNTeFRRVUZUTEVkQlFVY3NVMEZCV2l4VFFVRlRMRU5CUVZrc1IwRkJSeXhGUVVGRk8wRkJRekZDTEZsQlFVa3NTVUZCU1N4SFFVRkhMRTlCUVU4c1IwRkJSeXhEUVVGRE8wRkJRM1JDTEdWQlFVOHNTVUZCU1N4TFFVRkxMRlZCUVZVc1NVRkJTU3hKUVVGSkxFdEJRVXNzVVVGQlVTeEpRVUZKTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNN1MwRkROVVFzUTBGQlF6czdRVUZGUml4aFFVRlRMRmxCUVZrc1EwRkJReXhIUVVGSExFVkJRVVU3UVVGRGRrSXNaVUZCVHl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRE96dEJRVVZvUWl4bFFVRlBMRWRCUVVjc1EwRkJReXhOUVVGTkxFdEJRVXNzVVVGQlVTeEpRVU01UWl4SFFVRkhMRU5CUVVNc1RVRkJUU3hKUVVGSkxFTkJRVU1zU1VGRFppeEhRVUZITEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1MwRkJTeXhEUVVGRExFRkJRM1pDTEVOQlFVTTdTMEZEVERzN1FVRkZSQ3hoUVVGVExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpOQ0xHVkJRVThzV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVTnlRaXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZGQlFWRXNRMEZCUXl4SFFVTXhRaXhWUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMHRCUTJ4RE96dEJRVVZFTEdGQlFWTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGREwwSXNXVUZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRE8xbEJRMVlzVFVGQlRTeEhRVUZITEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNN08wRkJSWGhDTEdWQlFVOHNSVUZCUlN4TFFVRkxMRWRCUVVjc1RVRkJUU3hGUVVGRk8wRkJRM0pDTEc5Q1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVOd1F6dExRVU5LT3p0QlFVVkVMR0ZCUVZNc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZWtJc1dVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzFsQlExWXNUVUZCVFN4SFFVRkhMRWRCUVVjc1EwRkJReXhOUVVGTk8xbEJRMjVDTEUxQlFVMHNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03TzBGQlJUTkNMR1ZCUVU4c1JVRkJSU3hMUVVGTExFZEJRVWNzVFVGQlRTeEZRVUZGTzBGQlEzSkNMR3RDUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NVVUZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeExRVUZMTEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1UwRkRjRVE3UVVGRFJDeGxRVUZQTEUxQlFVMHNRMEZCUXp0TFFVTnFRanM3UVVGRlJDeGhRVUZUTEUxQlFVMHNRMEZCUXl4TFFVRkxMRVZCUVVVN1FVRkRia0lzWlVGQlR5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRkxGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0QlFVRkZMRzFDUVVGUExFTkJRVU1zUTBGQlF6dFRRVUZGTEVOQlFVTXNRMEZCUXp0TFFVTTFSRHM3UVVGRlJDeGhRVUZUTEU5QlFVOHNRMEZCUXl4SFFVRkhMRVZCUVVVc1VVRkJVU3hGUVVGRkxFbEJRVWtzUlVGQlJUdEJRVU5zUXl4clFrRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeFZRVUZWTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRk8wRkJReTlDTEdkQ1FVRkpMRWRCUVVjc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8xTkJRMnhETEVOQlFVTXNRMEZCUXp0QlFVTklMR1ZCUVU4c1NVRkJTU3hEUVVGRE8wdEJRMlk3TzBGQlJVUXNZVUZCVXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU5zUXl4clFrRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4VlFVRlZMRWRCUVVjc1JVRkJSVHRCUVVOeVF5eHZRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXp0VFFVTTVRaXhEUVVGRExFTkJRVU03UzBGRFRqczdRVUZGUkN4aFFVRlRMRkZCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzU1VGQlNTeEZRVUZGTzBGQlEzcENMR0ZCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4SFFVRkhMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTzBGQlEycERMR2RDUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03VTBGRGFrTTdRVUZEUkN4bFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRMkk3TzBGQlJVUXNVVUZCU1N4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeFZRVUZWTEVkQlFVY3NSVUZCUlR0QlFVTjBReXhaUVVGSkxFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTTdRVUZEWkN4aFFVRkxMRWxCUVVrc1EwRkJReXhKUVVGSkxFZEJRVWNzUlVGQlJUdEJRVU5tTEdkQ1FVRkpMRWRCUVVjc1EwRkJReXhqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVTdRVUZEZGtJc2IwSkJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRhRUk3VTBGRFNqdEJRVU5FTEdWQlFVOHNTVUZCU1N4RFFVRkRPMHRCUTJZc1EwRkJRenM3UVVGRlJpeGhRVUZUTEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVN1FVRkRlRUlzV1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkRXQ3haUVVGSkxFZEJRVWNzUTBGQlF6dEJRVU5TTEZsQlFVa3NTVUZCU1N4RFFVRkRPMEZCUTFRc1dVRkJTU3haUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVTdRVUZEY0VJc1pVRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTTdRVUZEYkVJc2JVSkJRVThzVTBGQlV5eEpRVUZKTEVkQlFVYzdRVUZEYmtJc2FVSkJRVU1zUlVGQlJTeERRVUZETzBGQlEwb3NkVUpCUVU4c1EwRkJReXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRPMkZCUXpkQ0xFTkJRVU03VTBGRFRDeE5RVUZOTzBGQlEwZ3NaMEpCUVVrc1IwRkJSeXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdRVUZEYmtJc1pVRkJSeXhIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTTdRVUZEYkVJc2JVSkJRVThzVTBGQlV5eEpRVUZKTEVkQlFVYzdRVUZEYmtJc2FVSkJRVU1zUlVGQlJTeERRVUZETzBGQlEwb3NkVUpCUVU4c1EwRkJReXhIUVVGSExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRE8yRkJRMjVETEVOQlFVTTdVMEZEVER0TFFVTktPenM3T3p0QlFVdEVMR0ZCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeFZRVUZWTEVWQlFVVTdRVUZEYkVNc2EwSkJRVlVzUjBGQlJ5eFZRVUZWTEVsQlFVa3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4RFFVRkRPMEZCUTJoRkxHVkJRVThzV1VGQlZ6dEJRVU5rTEdkQ1FVRkpMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZOQlFWTXNRMEZCUXl4TlFVRk5MRWRCUVVjc1ZVRkJWU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETzBGQlEzaEVMR2RDUVVGSkxFbEJRVWtzUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1FVRkRla0lzYVVKQlFVc3NTVUZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhGUVVGRkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVWQlFVVXNTMEZCU3l4RlFVRkZMRVZCUVVVN1FVRkRla01zYjBKQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhUUVVGVExFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXl4RFFVRkRPMkZCUXk5RE8wRkJRMFFzYjBKQlFWRXNWVUZCVlR0QlFVTmtMSEZDUVVGTExFTkJRVU03UVVGQlJTd3lRa0ZCVHl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0QlFVRkJMRUZCUTNKRExIRkNRVUZMTEVOQlFVTTdRVUZCUlN3eVFrRkJUeXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZCUVN4aFFVTjBSRHM3T3pzN096czdVMEZSU2l4RFFVRkRPMHRCUTB3N08wRkJSVVFzWVVGQlV5eGhRVUZoTEVOQlFVTXNVVUZCVVN4RlFVRkZPMEZCUXpkQ0xHVkJRVThzVlVGQlZTeExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOeVF5eHRRa0ZCVHl4UlFVRlJMRU5CUVVNc1MwRkJTeXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzFOQlEzQkRMRU5CUVVNN1MwRkRURHM3T3pzN096dEJRVTlFTEZGQlFVa3NZVUZCWVN4SFFVRkhMRTlCUVU4c1dVRkJXU3hMUVVGTExGVkJRVlVzU1VGQlNTeFpRVUZaTEVOQlFVTTdPMEZCUlhaRkxGRkJRVWtzVFVGQlRTeEhRVUZITEdGQlFXRXNSMEZCUnl4VlFVRlRMRVZCUVVVc1JVRkJSVHM3UVVGRmRFTXNjVUpCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6dExRVU55UWl4SFFVRkhMRlZCUVZNc1JVRkJSU3hGUVVGRk8wRkJRMklzYTBKQlFWVXNRMEZCUXl4RlFVRkZMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGNrSXNRMEZCUXpzN1FVRkZSaXhSUVVGSkxFOUJRVThzVDBGQlR5eExRVUZMTEZGQlFWRXNTVUZCU1N4UFFVRlBMRTlCUVU4c1EwRkJReXhSUVVGUkxFdEJRVXNzVlVGQlZTeEZRVUZGTzBGQlEzWkZMR0ZCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXp0TFFVTnlReXhOUVVGTk8wRkJRMGdzWVVGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4TlFVRk5MRU5CUVVNN1MwRkRNMEk3UVVGRFJDeFRRVUZMTEVOQlFVTXNXVUZCV1N4SFFVRkhMR0ZCUVdFc1IwRkJSeXhOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXpzN1FVRkhOMFFzVTBGQlN5eERRVUZETEU5QlFVOHNSMEZEWWl4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExGVkJRVlVzUjBGQlJ5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkROVU1zWlVGQlR5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1JVRkJSU3hoUVVGaExFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN1MwRkRMMFFzUTBGQlF6czdRVUZGUml4VFFVRkxMRU5CUVVNc1lVRkJZU3hIUVVOdVFpeExRVUZMTEVOQlFVTXNWVUZCVlN4SFFVRkhMRlZCUVZVc1IwRkJSeXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEYkVRc1pVRkJUeXhMUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEVkQlFVY3NSVUZCUlN4aFFVRmhMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdTMEZEY2tVc1EwRkJRenM3UVVGSFJpeFRRVUZMTEVOQlFVTXNXVUZCV1N4SFFVTnNRaXhMUVVGTExFTkJRVU1zVTBGQlV5eEhRVUZITEZWQlFWVXNSMEZCUnl4RlFVRkZMRXRCUVVzc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEzaEVMR1ZCUVU4c1dVRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4aFFVRmhMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdTMEZEZEVVc1EwRkJRenM3UVVGRlJpeFRRVUZMTEVOQlFVTXNVMEZCVXl4SFFVTm1MRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzVlVGQlZTeE5RVUZOTEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOcVJDeG5Ra0ZCVVN4SFFVRkhMRXRCUVVzc1EwRkJReXhSUVVGUkxFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZEYmtNc1kwRkJUU3hIUVVGSExFMUJRVTBzU1VGQlNTeEZRVUZGTEVOQlFVTTdRVUZEZEVJc1dVRkJTU3hKUVVGSkxFZEJRVWNzV1VGQldTeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRTFCUVUwc1EwRkJReXhOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVOMlJTeFpRVUZKTEZOQlFWTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1FVRkRiRUlzV1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlR0QlFVTlFMRzFDUVVGUExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0VFFVTjZRanRCUVVORUxHRkJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNWVUZCVlN4TFFVRkxMRVZCUVVVc1IwRkJSeXhGUVVGRk8wRkJRMmhETEc5Q1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dFRRVU12UXl4RFFVRkRMRU5CUVVNN1FVRkRTQ3hwUWtGQlV5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMEZCUTJZc1owSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NkMEpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5xUWl4TlFVTkpPMEZCUTBRc2VVSkJRVk1zU1VGQlNTeERRVUZETEVOQlFVTTdRVUZEWml4dlFrRkJTU3hUUVVGVExFbEJRVWtzU1VGQlNTeEZRVUZGTzBGQlEyNUNMRFJDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdhVUpCUTJ4Q08yRkJRMG83VTBGRFNqdExRVU5LTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExHVkJRV1VzUjBGRGNrSXNTMEZCU3l4RFFVRkRMRmxCUVZrc1IwRkJSeXhWUVVGVkxFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNCRUxHZENRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRMRkZCUVZFc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU51UXl4WFFVRkhMRWRCUVVjc1IwRkJSeXhKUVVGSkxFVkJRVVVzUTBGQlF6dEJRVU5vUWl4WlFVRkpMRTlCUVU4c1IwRkJSeXhaUVVGWkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEYUVNc1dVRkJTU3hIUVVGSExFZEJRVWNzVDBGQlR5eEZRVUZGTEVOQlFVTTdRVUZEY0VJc2FVSkJRVk1zVDBGQlR5eEhRVUZITzBGQlEyWXNaMEpCUVVrc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU5vUWl4blFrRkJTU3hIUVVGSExFdEJRVXNzU1VGQlNTeEZRVUZGTzBGQlEyUXNkVUpCUVU4c1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJGQlEzcENPMEZCUTBRc2IwSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1IwRkJSeXhGUVVGRkxGTkJRVk1zUTBGQlF5eFZRVUZWTEVkQlFVY3NSVUZCUlR0QlFVTTNReXh2UWtGQlNTeEhRVUZITEVWQlFVVTdRVUZEVEN3MFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJsQ1FVTnFRaXhOUVVOSk8wRkJRMFFzZFVKQlFVY3NSMEZCUnl4UFFVRlBMRVZCUVVVc1EwRkJRenRCUVVOb1FpeDNRa0ZCU1N4SFFVRkhMRXRCUVVzc1NVRkJTU3hGUVVGRk8wRkJRMlFzSzBKQlFVOHNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zRkNRVU42UWl4TlFVRk5PMEZCUTBnc05FSkJRVWtzU1VGQlNTeEZRVUZGTzBGQlEwNHNhVU5CUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdlVUpCUXpOQ0xFMUJRVTA3UVVGRFNDeHRRMEZCVHl4RlFVRkZMRU5CUVVNN2VVSkJRMkk3Y1VKQlEwbzdhVUpCUTBvN1lVRkRTaXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU5LTEdkQ1FVRkpMRWRCUVVjc1MwRkJTeXhEUVVGRE8xTkJRMmhDTzBGQlEwUXNaVUZCVHl4RlFVRkZMRU5CUVVNN1MwRkRZaXhEUVVGRE96dEJRVWxHTEZOQlFVc3NRMEZCUXl4alFVRmpMRWRCUTNCQ0xFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NWVUZCVlN4SFFVRkhMRVZCUVVVc1MwRkJTeXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZETVVRc2IwSkJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzB0QlEyaEVMRU5CUVVNN08wRkJSVVlzWVVGQlV5eFpRVUZaTEVOQlFVTXNTMEZCU3l4RlFVRkZPenRCUVVWNlFpeGxRVUZQTEZWQlFWVXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGRFTXNiMEpCUVZFc1IwRkJSeXhMUVVGTExFTkJRVU1zVVVGQlVTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRPMEZCUTI1RExHVkJRVWNzUjBGQlJ5eEhRVUZITEVsQlFVa3NSVUZCUlN4RFFVRkRPMEZCUTJoQ0xHZENRVUZKTEU5QlFVOHNSMEZCUnl4WlFVRlpMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGFFTXNaMEpCUVVrc1MwRkJTeXhKUVVGSkxFTkJRVU1zUlVGQlJUdEJRVU5hTEhWQ1FVRlBMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU42UWp0QlFVTkVMR2RDUVVGSkxFbEJRVWtzUjBGQlJ5eExRVUZMTEVOQlFVTTdRVUZEYWtJc1owSkJRVWtzVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTm9RaXhuUWtGQlNTeFBRVUZQTEVkQlFVY3NTMEZCU3l4RFFVRkRPenRCUVVWd1FpeGhRVUZETEZOQlFWTXNVMEZCVXl4SFFVRkpPMEZCUTI1Q0xHOUNRVUZKTEVsQlFVa3NTVUZCU1N4UFFVRlBMRWxCUVVrc1EwRkJReXhGUVVGRk8wRkJRM1JDTERKQ1FVRlBMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHBRa0ZEZWtJN08wRkJSVVFzZFVKQlFVOHNUMEZCVHl4SFFVRkhMRXRCUVVzc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJUdEJRVU5vUXl4M1FrRkJTU3hIUVVGSExFZEJRVWNzVDBGQlR5eEZRVUZGTEVOQlFVTTdRVUZEY0VJc2QwSkJRVWtzUjBGQlJ5eExRVUZMTEVsQlFVa3NSVUZCUlR0QlFVTmtMRFJDUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETzBGQlExb3NORUpCUVVrc1QwRkJUeXhKUVVGSkxFTkJRVU1zUlVGQlJUdEJRVU5rTEc5RFFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03ZVVKQlEyeENPMEZCUTBRc0swSkJRVTg3Y1VKQlExWTdRVUZEUkN3eVFrRkJUeXhKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU5pTERSQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4VFFVRlRMRU5CUVVNc1ZVRkJWU3hIUVVGSExFVkJRVVU3UVVGRE4wTXNLMEpCUVU4c1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRFlpdzBRa0ZCU1N4SFFVRkhMRVZCUVVVN1FVRkRUQ3h2UTBGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMEZCUTJRc2JVTkJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdlVUpCUTJ4Q0xFMUJRMGs3UVVGRFJDeHhRMEZCVXl4RlFVRkZMRU5CUVVNN2VVSkJRMlk3Y1VKQlEwb3NRMEZCUXl4RFFVRkRMRU5CUVVNN2FVSkJRMUE3WVVGRFNpeERRVUZCTEVWQlFVY3NRMEZCUXp0VFFVTlNMRU5CUVVNN1MwRkRURHM3UVVGSFJDeGhRVUZUTEZWQlFWVXNRMEZCUXl4RlFVRkZMRVZCUVVVN1FVRkRjRUlzWlVGQlR5eFZRVUZWTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRM1JETEcxQ1FVRlBMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03VTBGRGNFUXNRMEZCUXp0TFFVTk1PMEZCUTBRc1lVRkJVeXhsUVVGbExFTkJRVU1zUlVGQlJTeEZRVUZGTzBGQlEzcENMR1ZCUVU4c1ZVRkJWU3hIUVVGSExFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkROME1zYlVKQlFVOHNSVUZCUlN4RFFVRkRMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8xTkJRek5FTEVOQlFVTTdTMEZEVER0QlFVTkVMR0ZCUVZNc1VVRkJVU3hEUVVGRExFVkJRVVVzUlVGQlJUdEJRVU5zUWl4bFFVRlBMRlZCUVZVc1IwRkJSeXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZEVNc2JVSkJRVThzUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4WlFVRlpMRVZCUVVVc1IwRkJSeXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0VFFVTXhSQ3hEUVVGRE8wdEJRMHc3TzBGQlJVUXNZVUZCVXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTJoRUxHZENRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRMRkZCUVZFc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU51UXl4WlFVRkpMRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGFrSXNZMEZCVFN4RFFVRkRMRWRCUVVjc1JVRkJSU3hWUVVGVkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpGRExHOUNRVUZSTEVOQlFVTXNTMEZCU3l4RlFVRkZMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU1zUlVGQlJUdEJRVU01UWl4MVFrRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTnVRaXgzUWtGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMkZCUTJwQ0xFTkJRVU1zUTBGQlF6dFRRVU5PTEVWQlFVVXNWVUZCVlN4SFFVRkhMRVZCUVVVN1FVRkRaQ3h2UWtGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRUUVVNeFFpeERRVUZETEVOQlFVTTdTMEZEVGpzN1FVRkZSQ3hUUVVGTExFTkJRVU1zUjBGQlJ5eEhRVUZITEZWQlFWVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJRenRCUVVOc1F5eFRRVUZMTEVOQlFVTXNVMEZCVXl4SFFVRkhMRkZCUVZFc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF6dEJRVU4wUXl4VFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExHVkJRV1VzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXpzN096dEJRVWsxUXl4VFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVOYUxFdEJRVXNzUTBGQlF5eExRVUZMTEVkQlExZ3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOd1JDeGhRVUZMTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hWUVVGVkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpsRExHOUNRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNc1JVRkJSU3hWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVTdRVUZEYUVNc2IwSkJRVWtzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEVkN4M1FrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJGQlEycENMRU5CUVVNc1EwRkJRenRUUVVOT0xFVkJRVVVzVlVGQlZTeEhRVUZITEVWQlFVVTdRVUZEWkN4dlFrRkJVU3hEUVVGRExFZEJRVWNzU1VGQlNTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1UwRkRMMElzUTBGQlF5eERRVUZETzB0QlEwNHNRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zUzBGQlN5eEhRVU5ZTEV0QlFVc3NRMEZCUXl4WFFVRlhMRWRCUVVjc1ZVRkJWU3hIUVVGSExFVkJRVVVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRla1FzV1VGQlNTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF5eFBRVUZQTEVWQlFVVXNRMEZCUXp0QlFVTTNReXhoUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNSVUZCUlN4SlFVRkpMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzB0QlEzQkVMRU5CUVVNN08wRkJSVVlzWVVGQlV5eFBRVUZQTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF6bERMRmxCUVVrc1QwRkJUeXhIUVVGSExFVkJRVVVzUTBGQlF6dEJRVU5xUWl4alFVRk5MRU5CUVVNc1IwRkJSeXhGUVVGRkxGVkJRVlVzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRkRU1zYjBKQlFWRXNRMEZCUXl4RFFVRkRMRVZCUVVVc1ZVRkJWU3hEUVVGRExFVkJRVVU3UVVGRGNrSXNiMEpCUVVrc1EwRkJReXhGUVVGRk8wRkJRMGdzTWtKQlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRE8ybENRVU14UXp0QlFVTkVMSGRDUVVGUkxFVkJRVVVzUTBGQlF6dGhRVU5rTEVOQlFVTXNRMEZCUXp0VFFVTk9MRVZCUVVVc1dVRkJXVHRCUVVOWUxHOUNRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZPMEZCUTNaRExIVkNRVUZQTEVOQlFVTXNRMEZCUXl4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF6dGhRVU0xUWl4RFFVRkRMRVZCUVVVc1ZVRkJWU3hEUVVGRExFVkJRVVU3UVVGRFlpeDFRa0ZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRE8yRkJRMnhDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMU5CUTFBc1EwRkJReXhEUVVGRE8wdEJRMDQ3TzBGQlJVUXNVMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkRXaXhMUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEZWQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenM3UVVGRmJrTXNVMEZCU3l4RFFVRkRMRmRCUVZjc1IwRkRha0lzUzBGQlN5eERRVUZETEZkQlFWY3NSMEZCUnl4bFFVRmxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03TzBGQlJUZERMRk5CUVVzc1EwRkJReXhaUVVGWkxFZEJRMnhDTEV0QlFVc3NRMEZCUXl4WlFVRlpMRWRCUVVjc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZET3p0QlFVVjJReXhoUVVGVExFOUJRVThzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRE9VTXNaVUZCVHl4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFVkJRVVVzVlVGQlV5eExRVUZMTEVWQlFVVXNSVUZCUlN4RlFVRkZPMEZCUTNKRExHOUNRVUZSTEVOQlFVTXNTMEZCU3l4RlFVRkZMRlZCUVZNc1EwRkJReXhGUVVGRk8wRkJRM2hDTEd0Q1FVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU5XTEVOQlFVTXNRMEZCUXp0VFFVTk9MRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03UzBGRGFFSTdRVUZEUkN4VFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExGVkJRVlVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXp0QlFVTnVReXhUUVVGTExFTkJRVU1zVjBGQlZ5eEhRVUZITEdWQlFXVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRCUVVNM1F5eFRRVUZMTEVOQlFVTXNXVUZCV1N4SFFVRkhMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6czdRVUZGZGtNc1lVRkJVeXhoUVVGaExFTkJRVU1zVFVGQlRTeEZRVUZGTEV0QlFVc3NSVUZCUlN4VFFVRlRMRVZCUVVVN1FVRkROME1zWlVGQlR5eFZRVUZUTEVkQlFVY3NSVUZCUlN4TFFVRkxMRVZCUVVVc1VVRkJVU3hGUVVGRkxFVkJRVVVzUlVGQlJUdEJRVU4wUXl4eFFrRkJVeXhKUVVGSkxFZEJRVWM3UVVGRFdpeHZRa0ZCU1N4RlFVRkZMRVZCUVVVc1JVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJRM2hETzBGQlEwUXNjVUpCUVZNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpsQ0xHOUNRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZMRTlCUVU4c1VVRkJVU3hGUVVGRkxFTkJRVU03UVVGRE0wSXNkMEpCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzVlVGQlZTeERRVUZETEVWQlFVVTdRVUZEY2tJc2QwSkJRVWtzUlVGQlJTeEpRVUZKTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSVHRCUVVOb1Fpd3dRa0ZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTjJRaXd3UWtGQlJTeEhRVUZITEZGQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNN2NVSkJRM3BDTzBGQlEwUXNORUpCUVZFc1JVRkJSU3hEUVVGRE8ybENRVU5rTEVOQlFVTXNRMEZCUXp0aFFVTk9PMEZCUTBRc1owSkJRVWtzVTBGQlV5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVN1FVRkRkRUlzYzBKQlFVMHNRMEZCUXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhGUVVGRkxGRkJRVkVzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0aFFVTjBReXhOUVVGTk8wRkJRMGdzYTBKQlFVVXNSMEZCUnl4UlFVRlJMRU5CUVVNN1FVRkRaQ3gzUWtGQlVTeEhRVUZITEV0QlFVc3NRMEZCUXp0QlFVTnFRaXh6UWtGQlRTeERRVUZETEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03WVVGREwwSTdVMEZEU2l4RFFVRkRPMHRCUTB3N08wRkJSVVFzVTBGQlN5eERRVUZETEVkQlFVY3NSMEZEVkN4TFFVRkxMRU5CUVVNc1NVRkJTU3hIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6czdRVUZGTTBRc1UwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlJ5eGhRVUZoTEVOQlFVTXNTMEZCU3l4RFFVRkRMRmRCUVZjc1JVRkJSU3hOUVVGTkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdPMEZCUlhKRkxGTkJRVXNzUTBGQlF5eEhRVUZITEVkQlExUXNTMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhoUVVGaExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03TzBGQlJYaEVMRk5CUVVzc1EwRkJReXhWUVVGVkxFZEJRVWNzWVVGQllTeERRVUZETEV0QlFVc3NRMEZCUXl4WFFVRlhMRVZCUVVVc1MwRkJTeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZET3p0QlFVVnNSU3hoUVVGVExHTkJRV01zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZPMEZCUXpGQ0xHVkJRVThzUTBGQlF5eERRVUZETzB0QlExbzdRVUZEUkN4VFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRkZCUVZFc1JVRkJSU3hqUVVGakxFTkJRVU1zUTBGQlF6dEJRVU55UlN4VFFVRkxMRU5CUVVNc1dVRkJXU3hIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRkZCUVZFc1JVRkJSU3hqUVVGakxFTkJRVU1zUTBGQlF6dEJRVU5xUml4VFFVRkxMRU5CUVVNc1YwRkJWeXhIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hqUVVGakxFTkJRVU1zUTBGQlF6czdRVUZGTDBVc1UwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRemxETEdGQlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhGUVVGRkxGVkJRVlVzUTBGQlF5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTnNReXh2UWtGQlVTeERRVUZETEVOQlFVTXNSVUZCUlN4VlFVRlZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGFrTXNiMEpCUVVrc1IwRkJSeXhGUVVGRk8wRkJRMHdzTkVKQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRwUWtGRGFrSXNUVUZEU1R0QlFVTkVMRFJDUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZETEVOQlFVTXNRMEZCUXp0cFFrRkRiRVE3WVVGRFNpeERRVUZETEVOQlFVTTdVMEZEVGl4RlFVRkZMRlZCUVZVc1IwRkJSeXhGUVVGRkxFOUJRVThzUlVGQlJUdEJRVU4yUWl4blFrRkJTU3hIUVVGSExFVkJRVVU3UVVGRFRDeDFRa0ZCVHl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WVVGRGVFSXNUVUZEU1R0QlFVTkVMSGRDUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEZRVUZGTEZWQlFWVXNRMEZCUXl4RlFVRkZPMEZCUTNaRUxESkNRVUZQTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNN2FVSkJRMnhDTEVOQlFVTXNRMEZCUXl4RFFVRkRPMkZCUTFBN1UwRkZTaXhEUVVGRExFTkJRVU03TzBGQlJVZ3NhVUpCUVZNc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVWQlFVVTdRVUZETjBJc1owSkJRVWtzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlJPMmRDUVVGRkxFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRPMEZCUXpGRExHMUNRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xTkJRM0pETzB0QlEwb3NRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zU1VGQlNTeEhRVUZITEZWQlFWVXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOd1F5eG5Ra0ZCVVN4SFFVRkhMRXRCUVVzc1EwRkJReXhSUVVGUkxFbEJRVWtzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZEYmtNc1dVRkJTU3hKUVVGSkxFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMEZCUTNoQ0xGbEJRVWtzWTBGQll5eEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNN1FVRkRha01zV1VGQlNTeERRVUZETEdOQlFXTXNSVUZCUlR0QlFVTnFRaXh0UWtGQlR5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1UwRkRla0k3TzBGQlJVUXNXVUZCU1N4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE96dEJRVVZxUWl4WlFVRkpMRk5CUVZNc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGJrSXNhVUpCUVZNc1YwRkJWeXhEUVVGRExFVkJRVVVzUlVGQlJUdEJRVU55UWl4eFFrRkJVeXhEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXp0VFFVTjZRanRCUVVORUxHbENRVUZUTEdOQlFXTXNRMEZCUXl4RlFVRkZMRVZCUVVVN1FVRkRlRUlzWjBKQlFVa3NSMEZCUnl4SFFVRkhMRkZCUVZFc1EwRkJReXhUUVVGVExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdRVUZEYkVNc1owSkJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4VFFVRlRMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTXhRenRCUVVORUxHbENRVUZUTEZsQlFWa3NSMEZCUnp0QlFVTndRaXd3UWtGQll5eEZRVUZGTEVOQlFVTTdRVUZEYWtJc2MwSkJRVlVzUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxGVkJRVlVzUlVGQlJTeEZRVUZGTzBGQlEzcERMR3RDUVVGRkxFVkJRVVVzUTBGQlF6dGhRVU5TTEVOQlFVTXNRMEZCUXp0VFFVTk9PenRCUVVWRUxHMUNRVUZYTEVOQlFVTXNXVUZCV1R0QlFVTndRaXhuUWtGQlNTeERRVUZETEdOQlFXTXNSVUZCUlR0QlFVTnFRaXgzUWtGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRoUVVNelFqdFRRVU5LTEVOQlFVTXNRMEZCUXpzN1FVRkZTQ3hyUWtGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4VlFVRlZMRU5CUVVNc1JVRkJSVHRCUVVNeFFpeG5Ra0ZCU1N4SlFVRkpMRWRCUVVjc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM0pFTEdkQ1FVRkpMRmxCUVZrc1IwRkJSeXhWUVVGVkxFTkJRVU1zVlVGQlV5eEhRVUZITEVWQlFVVXNTVUZCU1N4RlFVRkZPMEZCUXpsRExHOUNRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhGUVVGRk8wRkJRMnhDTEhkQ1FVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJsQ1FVTnNRanRCUVVORUxHOUNRVUZKTEVkQlFVY3NSVUZCUlR0QlFVTk1MSGRDUVVGSkxGZEJRVmNzUjBGQlJ5eEZRVUZGTEVOQlFVTTdRVUZEY2tJc09FSkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNWVUZCVXl4SFFVRkhMRVZCUVVVc1NVRkJTU3hGUVVGRk8wRkJRM0JETEcxRFFVRlhMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eERRVUZETzNGQ1FVTXpRaXhEUVVGRExFTkJRVU03UVVGRFNDd3JRa0ZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU4wUWl3MFFrRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeFhRVUZYTEVOQlFVTXNRMEZCUXp0cFFrRkRPVUlzVFVGRFNUdEJRVU5FTERKQ1FVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETzBGQlEyeENMSGxDUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRPMmxDUVVOd1F6dGhRVU5LTEVOQlFVTXNRMEZCUXp0QlFVTklMR2RDUVVGSkxGRkJRVkVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVVNVF5eG5Ra0ZCU1N4SFFVRkhMRWRCUVVjc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF6dEJRVU14UWl4blFrRkJTU3hIUVVGSExFTkJRVU03UVVGRFVpeHRRa0ZCVHl4SFFVRkhMRVZCUVVVc1JVRkJSVHRCUVVOV0xHOUNRVUZKTEVWQlFVVXNSMEZCUnl4SFFVRkhMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRVZCUVVVN1FVRkRMMElzTUVKQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNRMEZCUXp0cFFrRkRhRVE3UVVGRFJDeHZRa0ZCU1N4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzVVVGQlVTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVU3UVVGRGVFTXNNRUpCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zZVVKQlFYbENMRU5CUVVNc1EwRkJRenRwUWtGRE9VTTdZVUZEU2p0QlFVTkVMSEZDUVVGVExFdEJRVXNzUjBGQlJ6dEJRVU5pTEhWQ1FVRlBMRTlCUVU4c1EwRkJReXhSUVVGUkxFVkJRVVVzVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZPMEZCUTNKRExESkNRVUZSTEVOQlFVTXNTVUZCU1N4UFFVRlBMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZGTzJsQ1FVTXpReXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU14UXp0QlFVTkVMR2RDUVVGSkxFdEJRVXNzUlVGQlJTeEZRVUZGTzBGQlExUXNiMEpCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRMRmxCUVZrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dGhRVU5vUkN4TlFVTkpPMEZCUTBRc01rSkJRVmNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0aFFVTjZRanRCUVVORUxIRkNRVUZUTEZGQlFWRXNSMEZCUnp0QlFVTm9RaXh2UWtGQlNTeExRVUZMTEVWQlFVVXNSVUZCUlR0QlFVTlVMR3REUVVGakxFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdRVUZEZWtJc2QwSkJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExGbEJRVmtzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXp0cFFrRkRhRVE3WVVGRFNqdFRRVU5LTEVOQlFVTXNRMEZCUXp0TFFVTk9MRU5CUVVNN08wRkJTVVlzVTBGQlN5eERRVUZETEV0QlFVc3NSMEZCUnl4VlFVRlRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF6RkRMRmxCUVVrc1lVRkJZU3hIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU4wUWl4WlFVRkpMR2RDUVVGblFpeEhRVUZITEVOQlFVTXNRMEZCUXpzN1FVRkZla0lzV1VGQlNTeFJRVUZSTEVkQlFVY3NSVUZCUlN4RFFVRkRPenRCUVVWc1FpeFpRVUZKTEVsQlFVa3NSMEZCUnp0QlFVTlFMR2xDUVVGTExFVkJRVVVzWVVGQllUdEJRVU53UWl4dlFrRkJVU3hGUVVGRkxHZENRVUZuUWp0VFFVTTNRaXhEUVVGRE96dEJRVVZHTEdsQ1FVRlRMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eEZRVUZETzBGQlEzWkNMR2RDUVVGSExFOUJRVThzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUXp0QlFVTnlRaXh0UWtGQlJ5eERRVUZETEV0QlFVc3NSMEZCUnl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eEpRVUZKTEdGQlFXRXNRMEZCUXp0aFFVTm9SQ3hOUVVGTkxFbEJRVWNzVDBGQlR5eERRVUZETEV0QlFVc3NVVUZCVVN4RlFVRkRPMEZCUXpWQ0xHMUNRVUZITEVOQlFVTXNTMEZCU3l4SFFVRkhMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEVWQlFVVXNRMEZCUXl4SlFVRkpMR0ZCUVdFc1EwRkJRenRCUVVOdVJDeHRRa0ZCUnl4RFFVRkRMRkZCUVZFc1IwRkJSeXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNSVUZCUlN4RlFVRkZMRU5CUVVNc1NVRkJTU3huUWtGQlowSXNRMEZCUXp0aFFVTXZSQ3hOUVVGTk8wRkJRMGdzYzBKQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc01rTkJRVEpETEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVNelJUdFRRVU5LT3p0QlFVVkVMRmxCUVVrc1RVRkJUU3hIUVVGSExGTkJRVk1zUTBGQlF5eE5RVUZOTEVOQlFVTTdRVUZET1VJc1dVRkJTU3hOUVVGTkxFZEJRVWNzUTBGQlF5eEpRVUZKTEUxQlFVMHNSMEZCUnl4RFFVRkRMRVZCUVVVN1FVRkRNVUlzYTBKQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc2RVZEJRWFZITEVOQlFVTXNRMEZCUXp0VFFVTTFTQ3hOUVVGTkxFbEJRVWtzVFVGQlRTeEpRVUZKTEVOQlFVTXNTVUZCU1N4UFFVRlBMRXRCUVVzc1MwRkJTeXhWUVVGVkxFVkJRVVU3UVVGRGJrUXNiMEpCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGFFSXNaMEpCUVVrc1IwRkJSeXhMUVVGTExFTkJRVU03VTBGRGFFSTdRVUZEUkN4WlFVRkpMRTlCUVU4c1MwRkJTeXhMUVVGTExGVkJRVlVzUlVGQlJUdEJRVU0zUWl4elFrRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0VFFVTXpRanRCUVVORUxGbEJRVWtzUTBGQlF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRPMEZCUTNwQ0xGbEJRVWtzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPenRCUVVWcVFpeHBRa0ZCVXl4WFFVRlhMRU5CUVVNc1pVRkJaU3hGUVVGRkxHTkJRV01zUlVGQlJUdEJRVU5zUkN4eFFrRkJVeXhaUVVGWkxFTkJRVU1zU1VGQlNTeEZRVUZGTEZsQlFWa3NSVUZCUlR0QlFVTjBReXgxUWtGQlR5eFZRVUZUTEdOQlFXTXNSVUZCUlR0QlFVTTFRaXgzUWtGQlNTeERRVUZETEZWQlFWTXNSMEZCUnl4RlFVRkZMRTFCUVUwc1JVRkJRenRCUVVOMFFpeHpRMEZCWXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxGbEJRVmtzUlVGQlJTeEZRVUZETEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1RVRkJUU3hGUVVGRkxFMUJRVTBzUlVGQlF5eERRVUZETEVOQlFVTTdjVUpCUTNCRkxFVkJRVVVzWTBGQll5eERRVUZETEVOQlFVTTdhVUpCUTNSQ0xFTkJRVU03WVVGRFREczdRVUZGUkN4eFFrRkJVeXhoUVVGaExFTkJRVU1zVVVGQlVTeEZRVUZETzBGQlF6VkNMSFZDUVVGUExGVkJRVk1zWTBGQll5eEZRVUZETzBGQlF6TkNMRGhDUVVGVkxFTkJRVU1zV1VGQlZUdEJRVU5xUWl4elEwRkJZeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzNGQ1FVTjRRaXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzJsQ1FVTm9RaXhEUVVGRE8yRkJRMHc3TzBGQlJVUXNiVUpCUVU4c1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJUczdRVUZGWml4dlFrRkJTU3haUVVGWkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNTMEZCU3l4SlFVRkZMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVU03UVVGRGNFTXNkMEpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1dVRkJXU3hEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU55UkN4dlFrRkJSeXhEUVVGRExGbEJRVmtzU1VGQlNTeEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRU5CUVVNc1JVRkJRenRCUVVOc1F5dzBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNN2FVSkJReTlETzJGQlEwbzdPMEZCUlVRc2FVSkJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4RlFVRkZMRlZCUVZNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlF6dEJRVU4yUXl4dlFrRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRemRDTEdsQ1FVRkRMR1ZCUVdVc1NVRkJTU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZCTEVOQlFVVXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdZVUZETjBRc1EwRkJReXhEUVVGRE8xTkJRMDQ3T3p0QlFVZEVMR1ZCUVU4c1NVRkJTU3hEUVVGRExGRkJRVkVzUjBGQlJ5eFhRVUZYTEVWQlFVVXNSMEZCUnl4WFFVRlhMRU5CUVVNN1MwRkRkRVFzUTBGQlF6czdRVUZGUml4VFFVRkxMRU5CUVVNc1UwRkJVeXhIUVVGSExGVkJRVlVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTjZReXhuUWtGQlVTeEhRVUZITEV0QlFVc3NRMEZCUXl4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRGJrTXNXVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU5zUWl4blFrRkJTU3hIUVVGSExFZEJRVWNzU1VGQlNTeExRVUZMTEVOQlFVTXNNa1JCUVRKRUxFTkJRVU1zUTBGQlF6dEJRVU5xUml4dFFrRkJUeXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZEZUVJN1FVRkRSQ3haUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlR0QlFVTm1MRzFDUVVGUExGRkJRVkVzUlVGQlJTeERRVUZETzFOQlEzSkNPMEZCUTBRc2FVSkJRVk1zV1VGQldTeERRVUZETEZGQlFWRXNSVUZCUlR0QlFVTTFRaXh0UWtGQlR5eFZRVUZWTEVOQlFVTXNWVUZCVlN4SFFVRkhMRVZCUVVVc1NVRkJTU3hGUVVGRk8wRkJRMjVETEc5Q1FVRkpMRWRCUVVjc1JVRkJSVHRCUVVOTUxEUkNRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRE8ybENRVU0xUXl4TlFVTkpPMEZCUTBRc2QwSkJRVWtzU1VGQlNTeEhRVUZITEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRCUVVNelFpeDNRa0ZCU1N4SlFVRkpMRVZCUVVVN1FVRkRUaXcwUWtGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF6dHhRa0ZEYWtNc1RVRkRTVHRCUVVORUxEUkNRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8zRkNRVU4yUWp0QlFVTkVMQ3RDUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dHBRa0ZETTBNN1lVRkRTaXhEUVVGRExFTkJRVU03VTBGRFRqdEJRVU5FTEc5Q1FVRlpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1MwRkRla01zUTBGQlF6czdRVUZGUml4aFFVRlRMRk5CUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTjRReXhuUWtGQlVTeEhRVUZITEZGQlFWRXNTVUZCU1N4SlFVRkpMRU5CUVVNN1FVRkROVUlzV1VGQlNTeFBRVUZQTEVkQlFVY3NXVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEVOQlFVTTdPMEZCUlRWRExHTkJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNWVUZCVlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU42UXl4blFrRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVN1FVRkRha01zYjBKQlFVa3NTVUZCU1N4RFFVRkRMRTFCUVUwc1NVRkJTU3hEUVVGRExFVkJRVVU3UVVGRGJFSXNkMEpCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdhVUpCUTJ4Q08wRkJRMFFzZFVKQlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGNFSXNkMEpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5xUWl4RFFVRkRMRU5CUVVNc1EwRkJRenRUUVVOUUxFVkJRVVVzVlVGQlZTeEhRVUZITEVWQlFVVTdRVUZEWkN4dlFrRkJVU3hEUVVGRExFZEJRVWNzUlVGQlJTeFBRVUZQTEVOQlFVTXNRMEZCUXp0VFFVTXhRaXhEUVVGRExFTkJRVU03UzBGRFRqczdRVUZGUkN4VFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExGVkJRVlVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTjRReXhwUWtGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRVZCUVVVc1MwRkJTeXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzB0QlF6VkRMRU5CUVVNN08wRkJSVVlzVTBGQlN5eERRVUZETEdGQlFXRXNSMEZCUnl4VlFVRlRMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEyNUVMR2xDUVVGVExFTkJRVU1zV1VGQldTeERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dExRVU51UkN4RFFVRkRPenRCUVVWR0xGTkJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NWVUZCVXl4TFFVRkxMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRM0pETEdsQ1FVRlRMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVmtzUlVGQlJTeExRVUZMTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN1MwRkRiRVFzUTBGQlF6czdRVUZGUml4VFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExGVkJRVlVzUzBGQlN5eEZRVUZGTzBGQlF6bENMR2xDUVVGVExGbEJRVmtzUTBGQlF5eExRVUZMTEVWQlFVVTdRVUZEZWtJc2NVSkJRVk1zUlVGQlJTeEhRVUZITzBGQlExWXNiMEpCUVVrc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJUdEJRVU5rTEhsQ1FVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRwUWtGRGRrTTdRVUZEUkN4MVFrRkJUeXhGUVVGRkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTTdZVUZEY0VJN1FVRkRSQ3hqUVVGRkxFTkJRVU1zU1VGQlNTeEhRVUZITEZsQlFWazdRVUZEYkVJc2RVSkJRVThzUVVGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFZEJRVWtzV1VGQldTeERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNc1IwRkJSU3hKUVVGSkxFTkJRVU03WVVGRGNrVXNRMEZCUXp0QlFVTkdMRzFDUVVGUExFVkJRVVVzUTBGQlF6dFRRVU5pTzBGQlEwUXNaVUZCVHl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRE1VSXNRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJSU3hKUVVGSkxFVkJRVVU3UVVGRGVrTXNaVUZCVHl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hSUVVGUkxFVkJRVVU3UVVGRGJFTXNiVUpCUVU4c1JVRkJSU3hEUVVGRExFdEJRVXNzUTBGRFdDeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGRE9VSXNRMEZCUXp0VFFVTk1MRU5CUVVNc1EwRkJRenRMUVVOT0xFTkJRVU1zUTBGQlF6czdRVUZGU0N4aFFVRlRMRTlCUVU4c1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEZRVUZGTEVWQlFVVXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRlRU1zV1VGQlNTeE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRPMEZCUTJoQ0xHTkJRVTBzUTBGQlF5eEhRVUZITEVWQlFVVXNWVUZCVlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhGUVVGRkxFVkJRVVVzUlVGQlJUdEJRVU5vUXl4alFVRkZMRU5CUVVNc1EwRkJReXhGUVVGRkxGVkJRVlVzUjBGQlJ5eEZRVUZGTEVOQlFVTXNSVUZCUlR0QlFVTndRaXh6UWtGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETzBGQlEyaERMR3RDUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdZVUZEV0N4RFFVRkRMRU5CUVVNN1UwRkRUaXhGUVVGRkxGVkJRVlVzUjBGQlJ5eEZRVUZGTzBGQlEyUXNiMEpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdVMEZEZWtJc1EwRkJReXhEUVVGRE8wdEJRMDQ3UVVGRFJDeFRRVUZMTEVOQlFVTXNUVUZCVFN4SFFVRkhMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dEJRVU51UXl4VFFVRkxMRU5CUVVNc1dVRkJXU3hIUVVGSExGRkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXpzN1FVRkZka01zVTBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4VlFVRlZMRWxCUVVrc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF5OURMR2RDUVVGUkxFZEJRVWNzVVVGQlVTeEpRVUZKTEVsQlFVa3NRMEZCUXp0QlFVTTFRaXhaUVVGSkxFbEJRVWtzUlVGQlJTeEZRVUZGTzBGQlExSXNaMEpCUVVrc1NVRkJTU3hIUVVGSExGVkJRVlVzUTBGQlF5eFZRVUZUTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVN1FVRkRkRU1zYjBKQlFVa3NSMEZCUnl4RlFVRkZPMEZCUTB3c05FSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0cFFrRkRha0lzVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEZRVUZGTzBGQlF5OUNMRFJDUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdhVUpCUTJ4Q0xFMUJRVTA3UVVGRFNDdzBRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8ybENRVU5zUWp0aFFVTktMRU5CUVVNc1EwRkJRenRCUVVOSUxHOUNRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1UwRkRiRUlzVFVGQlRUdEJRVU5JTEc5Q1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03VTBGRGJFSTdTMEZEU2l4RFFVRkRPenRCUVVWR0xGTkJRVXNzUTBGQlF5eFJRVUZSTEVkQlFVY3NWVUZCVlN4UlFVRlJMRVZCUVVVc1NVRkJTU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU5xUkN4WlFVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRFpDeGxRVUZQTEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1dVRkJWenRCUVVNelFpeHRRa0ZCVHl4RlFVRkZMRXRCUVVzc1NVRkJTU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03VTBGRGRFUXNSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03UzBGRE1VSXNRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zUzBGQlN5eEhRVUZITEZWQlFWVXNTVUZCU1N4RlFVRkZMRkZCUVZFc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRE9VTXNaVUZCVHl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExGbEJRVmM3UVVGRE0wSXNiVUpCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRUUVVOMlF5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRU5CUVVNc1EwRkJRenRMUVVNeFFpeERRVUZET3p0QlFVVkdMRk5CUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzVlVGQlZTeFJRVUZSTEVWQlFVVXNTVUZCU1N4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOb1JDeGxRVUZQTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hGUVVGRkxGbEJRVmM3UVVGRGRrTXNiVUpCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRUUVVOMlF5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMHRCUTJoQ0xFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXk5RExHZENRVUZSTEVkQlFVY3NVVUZCVVN4SlFVRkpMRWxCUVVrc1EwRkJRenM3UVVGRk5VSXNXVUZCU1N4SlFVRkpMRWRCUVVjc1ZVRkJWU3hEUVVGRExGVkJRVk1zUjBGQlJ5eEZRVUZGTEVsQlFVa3NSVUZCUlR0QlFVTjBReXhuUWtGQlNTeEhRVUZITEVWQlFVVTdRVUZEVEN4M1FrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJGQlEycENMRTFCUVUwN1FVRkRTQ3h2UWtGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRCUVVOcVFpeHZRa0ZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdZVUZETVVJN1UwRkRTaXhEUVVGRExFTkJRVU03TzBGQlJVZ3NXVUZCU1N4TFFVRkxMRWRCUVVjc1UwRkJVaXhMUVVGTExFTkJRVmtzUjBGQlJ5eEZRVUZGTEV0QlFVc3NSVUZCUlR0QlFVTTNRaXhuUWtGQlNTeEhRVUZITEVWQlFVVTdRVUZEVEN4M1FrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJGQlEycENMRTFCUVUwc1NVRkJTU3hMUVVGTExFVkJRVVU3UVVGRFpDeDNRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJRMnhDTEUxQlFVMDdRVUZEU0N4M1FrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJGQlEyeENPMU5CUTBvc1EwRkJRenM3UVVGRlJpeFpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1MwRkRaaXhEUVVGRE96dEJRVVZHTEZOQlFVc3NRMEZCUXl4UlFVRlJMRWRCUVVjc1ZVRkJWU3hSUVVGUkxFVkJRVVVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTnFSQ3haUVVGSkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEWkN4aFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExGVkJRVk1zU1VGQlNTeEZRVUZGTzBGQlEzaENMR2RDUVVGSkxFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNSVUZCUlR0QlFVTmlMRzlDUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMkZCUTNCQ0xFMUJRVTA3UVVGRFNDeHZRa0ZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzVTBGQlV5eERRVUZETEVOQlFVTTdZVUZETDBJN1UwRkRTaXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0TFFVTXhRaXhEUVVGRE96dEJRVVZHTEdGQlFWTXNUVUZCVFN4RFFVRkRMRTFCUVUwc1JVRkJSU3hYUVVGWExFVkJRVVVzVDBGQlR5eEZRVUZGTzBGQlF6RkRMRmxCUVVrc1YwRkJWeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU55UWl4MVFrRkJWeXhIUVVGSExFTkJRVU1zUTBGQlF6dFRRVU51UWl4TlFVTkpMRWxCUVVjc1YwRkJWeXhMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU4yUWl4clFrRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5dzRRa0ZCT0VJc1EwRkJReXhEUVVGRE8xTkJRMjVFTzBGQlEwUXNhVUpCUVZNc1QwRkJUeXhEUVVGRExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOeVF5eG5Ra0ZCU1N4UlFVRlJMRWxCUVVrc1NVRkJTU3hKUVVGSkxFOUJRVThzVVVGQlVTeExRVUZMTEZWQlFWVXNSVUZCUlR0QlFVTndSQ3h6UWtGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl4clEwRkJhME1zUTBGQlF5eERRVUZETzJGQlEzWkVPMEZCUTBRc1lVRkJReXhEUVVGRExFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZEYWtJc1owSkJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVN1FVRkRha0lzYjBKQlFVa3NSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJRMnBDTzBGQlEwUXNaMEpCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hGUVVGRk96dEJRVVU1UWl4MVFrRkJUeXhMUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEZsQlFWYzdRVUZEYWtNc2NVSkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0cFFrRkRZaXhEUVVGRExFTkJRVU03WVVGRFRqdEJRVU5FTEhOQ1FVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxGVkJRVk1zU1VGQlNTeEZRVUZGTzBGQlF6VkNMRzlDUVVGSkxFbEJRVWtzUjBGQlJ6dEJRVU5RTEhkQ1FVRkpMRVZCUVVVc1NVRkJTVHRCUVVOV0xEUkNRVUZSTEVWQlFVVXNVVUZCVVN4SlFVRkpMRWxCUVVrN2FVSkJRemRDTEVOQlFVTTdPMEZCUlVZc2IwSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NjVUpCUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmxDUVVONlFpeE5RVUZOTzBGQlEwZ3NjVUpCUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMmxDUVVOMFFqczdRVUZGUkN4dlFrRkJTU3hEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRU5CUVVNc1YwRkJWeXhGUVVGRk8wRkJRMnhETEhGQ1FVRkRMRU5CUVVNc1UwRkJVeXhGUVVGRkxFTkJRVU03YVVKQlEycENPMkZCUTBvc1EwRkJReXhEUVVGRE8wRkJRMGdzYVVKQlFVc3NRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzFOQlEycERPMEZCUTBRc2FVSkJRVk1zUzBGQlN5eERRVUZETEVOQlFVTXNSVUZCUlN4TFFVRkxMRVZCUVVVN1FVRkRja0lzYlVKQlFVOHNXVUZCVlR0QlFVTmlMSFZDUVVGUExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEySXNiMEpCUVVrc1NVRkJTU3hIUVVGSExGTkJRVk1zUTBGQlF6dEJRVU55UWl3d1FrRkJWU3hEUVVGRExFdEJRVXNzUlVGQlJTeFZRVUZWTEVsQlFVa3NSVUZCUlR0QlFVTTVRaXgzUWtGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzJsQ1FVTnVReXhEUVVGRExFTkJRVU03UVVGRFNDeHZRa0ZCU1N4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFBRVUZQTEV0QlFVc3NRMEZCUXl4RlFVRkZPMEZCUTJoRExIRkNRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN2FVSkJRMkk3UVVGRFJDeHBRa0ZCUXl4RFFVRkRMRTlCUVU4c1JVRkJSU3hEUVVGRE8yRkJRMllzUTBGQlF6dFRRVU5NT3p0QlFVVkVMRmxCUVVrc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU5vUWl4WlFVRkpMRU5CUVVNc1IwRkJSenRCUVVOS0xHbENRVUZMTEVWQlFVVXNSVUZCUlR0QlFVTlVMSFZDUVVGWExFVkJRVVVzVjBGQlZ6dEJRVU40UWl4dFFrRkJUeXhGUVVGRkxFOUJRVTg3UVVGRGFFSXNjVUpCUVZNc1JVRkJSU3hKUVVGSk8wRkJRMllzYVVKQlFVc3NSVUZCUlN4SlFVRkpPMEZCUTFnc2FVSkJRVXNzUlVGQlJTeEpRVUZKTzBGQlExZ3NiVUpCUVU4c1JVRkJSU3hMUVVGTE8wRkJRMlFzYTBKQlFVMHNSVUZCUlN4TFFVRkxPMEZCUTJJc1owSkJRVWtzUlVGQlJTeGpRVUZWTEVsQlFVa3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkROVUlzZFVKQlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0aFFVTnlRenRCUVVORUxHZENRVUZKTEVWQlFVVXNaMEpCUVZrN1FVRkRaQ3hwUWtGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNN1FVRkRaaXhwUWtGQlF5eERRVUZETEV0QlFVc3NSMEZCUnl4RlFVRkZMRU5CUVVNN1lVRkRhRUk3UVVGRFJDeHRRa0ZCVHl4RlFVRkZMR2xDUVVGVkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZETDBJc2RVSkJRVThzUTBGQlF5eERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dGhRVU53UXp0QlFVTkVMRzFDUVVGUExFVkJRVVVzYlVKQlFWazdRVUZEYWtJc2IwSkJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkpMRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zVjBGQlZ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRk8wRkJRM2hFTERKQ1FVRk5MRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zVjBGQlZ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRE8wRkJRelZETERSQ1FVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVU5xUWl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVNMVFpeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenM3UVVGRmRFTXNORUpCUVVrc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNWVUZCVlN4SlFVRkpMRVZCUVVVN1FVRkRia01zYlVOQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJRenQ1UWtGRGNFSXNRMEZCUXl4RFFVRkRPenRCUVVWSUxEUkNRVUZKTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU4wUWl3MlFrRkJReXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzNsQ1FVTmlPMEZCUTBRc0swSkJRVThzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZEWWl3MFFrRkJTU3hGUVVGRkxFZEJRVWNzVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU53UXl3NFFrRkJUU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0eFFrRkRjRUk3YVVKQlEwbzdZVUZEU2p0QlFVTkVMR3RDUVVGTkxFVkJRVVVzYTBKQlFWazdRVUZEYUVJc2RVSkJRVThzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNN1lVRkRla0k3UVVGRFJDeHRRa0ZCVHl4RlFVRkZMRzFDUVVGWk8wRkJRMnBDTEhWQ1FVRlBMRTlCUVU4c1EwRkJRenRoUVVOc1FqdEJRVU5FTEdkQ1FVRkpMRVZCUVVVc1owSkJRVmM3UVVGRFlpeDFRa0ZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFBRVUZQTEV0QlFVc3NRMEZCUXl4RFFVRkRPMkZCUTNwRE8wRkJRMFFzYVVKQlFVc3NSVUZCUlN4cFFrRkJXVHRCUVVObUxHbENRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkhMRWxCUVVrc1EwRkJRenRoUVVOdVFqdEJRVU5FTEd0Q1FVRk5MRVZCUVVVc2EwSkJRVms3UVVGRGFFSXNiMEpCUVVrc1EwRkJReXhEUVVGRExFMUJRVTBzUzBGQlN5eExRVUZMTEVWQlFVVTdRVUZCUlN3eVFrRkJUenRwUWtGQlJUdEJRVU51UXl4cFFrRkJReXhEUVVGRExFMUJRVTBzUjBGQlJ5eExRVUZMTEVOQlFVTTdRVUZEYWtJc2IwSkJRVWtzVjBGQlZ5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUlVGQlJTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE96czdRVUZITVVRc2NVSkJRVXNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJTU3hYUVVGWExFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVTdRVUZEYmtNc2VVSkJRVXNzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE8ybENRVU5xUXp0aFFVTktPMU5CUTBvc1EwRkJRenRCUVVOR0xHVkJRVThzUTBGQlF5eERRVUZETzB0QlExbzdPMEZCUlVRc1UwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEUxQlFVMHNSVUZCUlN4WFFVRlhMRVZCUVVVN1FVRkRla01zV1VGQlNTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRMRlZCUVZVc1MwRkJTeXhGUVVGRkxFVkJRVVVzUlVGQlJUdEJRVU5vUXl4clFrRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRUUVVONFFpeEZRVUZGTEZkQlFWY3NSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenM3UVVGRmJrSXNaVUZCVHl4RFFVRkRMRU5CUVVNN1MwRkRXaXhEUVVGRE96dEJRVVZHTEZOQlFVc3NRMEZCUXl4aFFVRmhMRWRCUVVjc1ZVRkJWU3hOUVVGTkxFVkJRVVVzVjBGQlZ5eEZRVUZGT3p0QlFVVnFSQ3hwUWtGQlV5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJRenRCUVVONFFpeHRRa0ZCVHl4RFFVRkRMRU5CUVVNc1VVRkJVU3hIUVVGSExFTkJRVU1zUTBGQlF5eFJRVUZSTEVOQlFVTTdVMEZEYkVNN08wRkJSVVFzYVVKQlFWTXNZVUZCWVN4RFFVRkRMRkZCUVZFc1JVRkJSU3hKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTzBGQlF6VkRMR2RDUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTTdaMEpCUTFJc1IwRkJSeXhIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RFFVRkRPMEZCUXpsQ0xHMUNRVUZQTEVkQlFVY3NSMEZCUnl4SFFVRkhMRVZCUVVVN1FVRkRaQ3h2UWtGQlNTeEhRVUZITEVkQlFVY3NSMEZCUnl4SlFVRkpMRUZCUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUjBGQlJ5eERRVUZETEV0QlFVMHNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRenRCUVVONFF5eHZRa0ZCU1N4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRkxGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSVHRCUVVOdVF5eDFRa0ZCUnl4SFFVRkhMRWRCUVVjc1EwRkJRenRwUWtGRFlpeE5RVUZOTzBGQlEwZ3NkVUpCUVVjc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETzJsQ1FVTnFRanRoUVVOS08wRkJRMFFzYlVKQlFVOHNSMEZCUnl4RFFVRkRPMU5CUTJRN08wRkJSVVFzYVVKQlFWTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVVVGQlVTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTXhReXhuUWtGQlNTeFJRVUZSTEVsQlFVa3NTVUZCU1N4SlFVRkpMRTlCUVU4c1VVRkJVU3hMUVVGTExGVkJRVlVzUlVGQlJUdEJRVU53UkN4elFrRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eHJRMEZCYTBNc1EwRkJReXhEUVVGRE8yRkJRM1pFTzBGQlEwUXNZVUZCUXl4RFFVRkRMRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGFrSXNaMEpCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVTdRVUZEYWtJc2IwSkJRVWtzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMkZCUTJwQ08wRkJRMFFzWjBKQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFVkJRVVU3TzBGQlJXeENMSFZDUVVGUExFdEJRVXNzUTBGQlF5eFpRVUZaTEVOQlFVTXNXVUZCVnp0QlFVTnFReXh4UWtGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMmxDUVVOaUxFTkJRVU1zUTBGQlF6dGhRVU5PTzBGQlEwUXNjMEpCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzVlVGQlV5eEpRVUZKTEVWQlFVVTdRVUZETlVJc2IwSkJRVWtzU1VGQlNTeEhRVUZITzBGQlExQXNkMEpCUVVrc1JVRkJSU3hKUVVGSk8wRkJRMVlzTkVKQlFWRXNSVUZCUlN4UlFVRlJPMEZCUTJ4Q0xEUkNRVUZSTEVWQlFVVXNUMEZCVHl4UlFVRlJMRXRCUVVzc1ZVRkJWU3hIUVVGSExGRkJRVkVzUjBGQlJ5eEpRVUZKTzJsQ1FVTTNSQ3hEUVVGRE96dEJRVVZHTEdsQ1FVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eGhRVUZoTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFVkJRVVVzWVVGQllTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6czdRVUZGZWtVc2IwSkJRVWtzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXhEUVVGRExGZEJRVmNzUlVGQlJUdEJRVU5zUXl4eFFrRkJReXhEUVVGRExGTkJRVk1zUlVGQlJTeERRVUZETzJsQ1FVTnFRanRCUVVORUxIRkNRVUZMTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dGhRVU5xUXl4RFFVRkRMRU5CUVVNN1UwRkRUanM3TzBGQlIwUXNXVUZCU1N4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNWMEZCVnl4RFFVRkRMRU5CUVVNN096dEJRVWQ2UXl4VFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGSExGVkJRVlVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRla01zYlVKQlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0VFFVTjRReXhEUVVGRE96czdRVUZIUml4bFFVRlBMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU03TzBGQlJXcENMR1ZCUVU4c1EwRkJReXhEUVVGRE8wdEJRMW9zUTBGQlF6czdRVUZGUml4VFFVRkxMRU5CUVVNc1MwRkJTeXhIUVVGSExGVkJRVlVzVFVGQlRTeEZRVUZGTEU5QlFVOHNSVUZCUlR0QlFVTnlReXhsUVVGUExFMUJRVTBzUTBGQlF5eE5RVUZOTEVWQlFVVXNRMEZCUXl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8wdEJRM0pETEVOQlFVTTdPMEZCUlVZc1lVRkJVeXhYUVVGWExFTkJRVU1zU1VGQlNTeEZRVUZGTzBGQlEzWkNMR1ZCUVU4c1ZVRkJWU3hEUVVGRExGVkJRVlVzUlVGQlJTeEZRVUZGTEVsQlFVa3NSVUZCUlR0QlFVTnNReXhqUVVGRkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEZWQlFWVXNSMEZCUnl4RlFVRkZMRWxCUVVrc1JVRkJSVHRCUVVONFJDeHZRa0ZCU1N4UFFVRlBMRTlCUVU4c1MwRkJTeXhSUVVGUkxFVkJRVVU3UVVGRE4wSXNkMEpCUVVrc1IwRkJSeXhGUVVGRk8wRkJRMHdzTkVKQlFVa3NUMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSVHRCUVVObUxHMURRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8zbENRVU4wUWp0eFFrRkRTaXhOUVVOSkxFbEJRVWtzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZPMEZCUTNCQ0xHdERRVUZWTEVOQlFVTXNTVUZCU1N4RlFVRkZMRlZCUVZVc1EwRkJReXhGUVVGRk8wRkJRekZDTEcxRFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdlVUpCUTNCQ0xFTkJRVU1zUTBGQlF6dHhRa0ZEVGp0cFFrRkRTanRoUVVOS0xFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTlVMRU5CUVVNc1EwRkJRenRMUVVOT08wRkJRMFFzVTBGQlN5eERRVUZETEVkQlFVY3NSMEZCUnl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UVVGREwwSXNVMEZCU3l4RFFVRkRMRWRCUVVjc1IwRkJSeXhYUVVGWExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdPenM3TzBGQlN5OUNMRk5CUVVzc1EwRkJReXhQUVVGUExFZEJRVWNzVlVGQlZTeEZRVUZGTEVWQlFVVXNUVUZCVFN4RlFVRkZPMEZCUTJ4RExGbEJRVWtzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVTmtMRmxCUVVrc1RVRkJUU3hIUVVGSExFVkJRVVVzUTBGQlF6dEJRVU5vUWl4alFVRk5MRWRCUVVjc1RVRkJUU3hKUVVGSkxGRkJRVkVzUTBGQlF6dEJRVU0xUWl4WlFVRkpMRkZCUVZFc1IwRkJSeXhWUVVGVkxFTkJRVU1zVTBGQlV5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZPMEZCUXpsRExHZENRVUZKTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRE1VSXNaMEpCUVVrc1IwRkJSeXhIUVVGSExFMUJRVTBzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8wRkJRMjVETEdkQ1FVRkpMRWRCUVVjc1NVRkJTU3hKUVVGSkxFVkJRVVU3UVVGRFlpeHhRa0ZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhaUVVGWk8wRkJRM1pDTERSQ1FVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRwUWtGRGJrTXNRMEZCUXl4RFFVRkRPMkZCUTA0c1RVRkRTU3hKUVVGSkxFZEJRVWNzU1VGQlNTeE5RVUZOTEVWQlFVVTdRVUZEY0VJc2MwSkJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU03WVVGRE9VSXNUVUZEU1R0QlFVTkVMSE5DUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenRCUVVONlFpeHJRa0ZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJReXhWUVVGVkxFbEJRVWtzUlVGQlJUdEJRVU51UkN4M1FrRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTnFRaXgzUWtGQlNTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRM0JDTERKQ1FVRlBMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEJRVU51UWl4NVFrRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJSVHRCUVVOMFF5eDVRa0ZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN2NVSkJRekZDTzJsQ1FVTktMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dGhRVU5VTzFOQlEwb3NRMEZCUXl4RFFVRkRPMEZCUTBnc1owSkJRVkVzUTBGQlF5eEpRVUZKTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUTNKQ0xHZENRVUZSTEVOQlFVTXNWVUZCVlN4SFFVRkhMRVZCUVVVc1EwRkJRenRCUVVONlFpeGxRVUZQTEZGQlFWRXNRMEZCUXp0TFFVTnVRaXhEUVVGRE96dEJRVVZHTEZOQlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1ZVRkJWU3hGUVVGRkxFVkJRVVU3UVVGRE5VSXNaVUZCVHl4WlFVRlpPMEZCUTJZc2JVSkJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNWVUZCVlN4SlFVRkpMRVZCUVVVc1EwRkJRU3hEUVVGRkxFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1UwRkRka1FzUTBGQlF6dExRVU5NTEVOQlFVTTdPMEZCUlVZc1lVRkJVeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEZRVUZGTzBGQlEzQkNMR1ZCUVU4c1ZVRkJWU3hMUVVGTExFVkJRVVVzVVVGQlVTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTjRReXhyUWtGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdVMEZETjBNc1EwRkJRenRMUVVOTU96dEJRVVZFTEZOQlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTm9ReXhUUVVGTExFTkJRVU1zVjBGQlZ5eEhRVUZITEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03UVVGRE5VTXNVMEZCU3l4RFFVRkRMRlZCUVZVc1IwRkJSeXhWUVVGVkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVNelJDeGxRVUZQTEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTEV0QlFVc3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03UzBGRGJrVXNRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zUjBGQlJ5eEhRVUZITERoQ1FVRTRRanRCUVVOMFF5eFpRVUZKTEVkQlFVY3NSMEZCUnl4VFFVRlRMRU5CUVVNN1FVRkRjRUlzWlVGQlR5eFZRVUZWTEVOQlFVTXNWVUZCVlN4SlFVRkpMRVZCUVVVN1FVRkRPVUlzWjBKQlFVa3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJRenM3UVVGRmFFSXNaMEpCUVVrc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM0pETEdkQ1FVRkpMRTlCUVU4c1VVRkJVU3hKUVVGSkxGVkJRVlVzUlVGQlJUdEJRVU12UWl4dlFrRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETzJGQlEyUXNUVUZCVFR0QlFVTklMSGRDUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETzJGQlEyNUNPenRCUVVWRUxHbENRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWRCUVVjc1JVRkJSU3hKUVVGSkxFVkJRVVVzVlVGQlZTeFBRVUZQTEVWQlFVVXNSVUZCUlN4RlFVRkZMRVZCUVVVc1JVRkJSVHRCUVVNdlF5eHJRa0ZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzVDBGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRlZCUVZVc1EwRkJReXhWUVVGVkxFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZETDBRc2MwSkJRVVVzUTBGQlF5eEhRVUZITEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN2FVSkJRM0pDTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOVUxFVkJRMFFzVlVGQlZTeEhRVUZITEVWQlFVVXNUMEZCVHl4RlFVRkZPMEZCUTNCQ0xIZENRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRE8yRkJReTlETEVOQlFVTXNRMEZCUXp0VFFVTk9MRU5CUVVNc1EwRkJRenRMUVVOT0xFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJSeXc0UWtGQk9FSTdRVUZETVVNc1pVRkJUeXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExGTkJRVk1zUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU03UzBGRGVrVXNRMEZCUXpzN1FVRkhSaXhoUVVGVExGVkJRVlVzUTBGQlF5eE5RVUZOTEVWQlFVVTdRVUZEZUVJc1pVRkJUeXhWUVVGVkxFTkJRVU1zVlVGQlV5eEhRVUZITEVWQlFVVXNTVUZCU1N4RlFVRkZPMEZCUTJ4RExHZENRVUZKTEVWQlFVVXNSMEZCUnl4VlFVRlZMRU5CUVVNc1ZVRkJVeXhKUVVGSkxFVkJRVVU3UVVGREwwSXNiMEpCUVVrc1NVRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU5vUWl4dlFrRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMEZCUXpGQ0xIVkNRVUZQTEUxQlFVMHNRMEZCUXl4SFFVRkhMRVZCUVVVc1ZVRkJWU3hGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCUlR0QlFVTndReXh6UWtGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRwUWtGRGNrTXNSVUZEUkN4UlFVRlJMRU5CUVVNc1EwRkJRenRoUVVOaUxFTkJRVU1zUTBGQlF6dEJRVU5JTEdkQ1FVRkpMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGRFlpeDFRa0ZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0aFFVTXZRaXhOUVVOSk8wRkJRMFFzZFVKQlFVOHNSVUZCUlN4RFFVRkRPMkZCUTJJN1UwRkRTaXhEUVVGRExFTkJRVU03UzBGRFRqczdRVUZGUkN4VFFVRkxMRU5CUVVNc1UwRkJVeXhIUVVGSExGVkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1FVRkRNME1zVTBGQlN5eERRVUZETEdWQlFXVXNSMEZCUnl4VlFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eERRVUZET3p0QlFVZDJSQ3hUUVVGTExFTkJRVU1zVDBGQlR5eEhRVUZITEZWQlFWVXNSVUZCUlN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOd1F5eFpRVUZKTEVsQlFVa3NSMEZCUnl4VFFVRlRMRU5CUVVNc1VVRkJVU3hKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEzWkRMRmxCUVVrc1NVRkJTU3hIUVVGSExGZEJRVmNzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXp0QlFVTXpRaXhwUWtGQlV5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMEZCUTJZc1owSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NkVUpCUVU4c1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJGQlEzQkNPMEZCUTBRc1owSkJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0VFFVTmtPMEZCUTBRc1dVRkJTU3hGUVVGRkxFTkJRVU03UzBGRFZpeERRVUZET3p0QlFVVkdMR0ZCUVZNc1YwRkJWeXhEUVVGRExFVkJRVVVzUlVGQlJUdEJRVU55UWl4bFFVRlBMRlZCUVZVc1EwRkJReXhWUVVGVkxFbEJRVWtzUlVGQlJUdEJRVU01UWl4blFrRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRPMEZCUXpGQ0xHZENRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRmxCUVZrN1FVRkRiRUlzYjBKQlFVa3NVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJRenRCUVVNeFFpeHZRa0ZCU1N4SlFVRkpMRVZCUVVVN1FVRkRUaXg1UWtGQlN5eERRVUZETEZsQlFWa3NRMEZCUXl4WlFVRlpPMEZCUXpOQ0xHZERRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hUUVVGVExFTkJRVU1zUTBGQlF6dHhRa0ZEYmtNc1EwRkJReXhEUVVGRE8ybENRVU5PTEUxQlFVMDdRVUZEU0N3MFFrRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN2FVSkJRMjVETzJGQlEwb3NRMEZCUXl4RFFVRkRPMEZCUTBnc1owSkJRVWtzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTm9RaXhqUVVGRkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRCUVVOeVFpeG5Ra0ZCU1N4SFFVRkhMRXRCUVVzc1EwRkJRenRUUVVOb1FpeERRVUZETEVOQlFVTTdTMEZEVGpzN1FVRkZSQ3hUUVVGTExFTkJRVU1zVjBGQlZ5eEhRVUZITEZkQlFWY3NRMEZCUXpzN1FVRkZhRU1zVTBGQlN5eERRVUZETEZGQlFWRXNSMEZCUnl4VlFVRlZMRU5CUVVNc1ZVRkJVeXhOUVVGTkxFVkJRVVU3UVVGRGVrTXNXVUZCU1N4SlFVRkpMRWRCUVVjc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1FVRkRha01zWlVGQlR5eFZRVUZWTEZGQlFWRXNSVUZCUlR0QlFVTjJRaXh0UWtGQlR5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dFRRVU55UXl4RFFVRkRPMHRCUTB3c1EwRkJReXhEUVVGRE96dEJRVVZJTEZOQlFVc3NRMEZCUXl4UlFVRlJMRWRCUTJRc1MwRkJTeXhEUVVGRExGRkJRVkVzUjBGQlJ5eFRRVUZUTEZGQlFWRXNRMEZCUXl4SlFVRkpMRVZCUVVVN1FVRkRja01zWlVGQlR5eFZRVUZWTEVOQlFVTXNWVUZCVlN4SlFVRkpMRVZCUVVVN1FVRkRPVUlzWjBKQlFVa3NVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dEJRVU14UWl4blFrRkJTU3hOUVVGTkxFTkJRVU03UVVGRFdDeG5Ra0ZCU1R0QlFVTkJMSE5DUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03WVVGRGJrTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSVHRCUVVOU0xIVkNRVUZQTEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVOMFFqczdRVUZGUkN4blFrRkJTU3hUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NUMEZCVHl4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExGVkJRVlVzUlVGQlJUdEJRVU40UkN4elFrRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZUTEV0QlFVc3NSVUZCUlR0QlFVTjRRaXcwUWtGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRwUWtGRGVrSXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExGVkJRVk1zUjBGQlJ5eEZRVUZGTzBGQlEzUkNMRFJDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEU5QlFVOHNSMEZCUnl4SFFVRkhMRWRCUVVjc1NVRkJTU3hMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0cFFrRkRhRVFzUTBGQlF5eERRVUZETzJGQlEwNHNUVUZCVFR0QlFVTklMSGRDUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMkZCUXpGQ08xTkJRMG9zUTBGQlF5eERRVUZETzB0QlEwNHNRMEZCUXpzN08wRkJSMFlzVVVGQlNTeFBRVUZQTEUxQlFVMHNTMEZCU3l4UlFVRlJMRWxCUVVrc1RVRkJUU3hEUVVGRExFOUJRVThzUlVGQlJUdEJRVU01UXl4alFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGSExFdEJRVXNzUTBGQlF6dExRVU14UWpzN1UwRkZTU3hKUVVGSkxFOUJRVThzVFVGQlRTeExRVUZMTEZWQlFWVXNTVUZCU1N4TlFVRk5MRU5CUVVNc1IwRkJSeXhGUVVGRk8wRkJRMnBFTEd0Q1FVRk5MRU5CUVVNc1JVRkJSU3hGUVVGRkxGbEJRVms3UVVGRGJrSXNkVUpCUVU4c1MwRkJTeXhEUVVGRE8yRkJRMmhDTEVOQlFVTXNRMEZCUXp0VFFVTk9PenRoUVVWSk8wRkJRMFFzYjBKQlFVa3NRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTeXhEUVVGRE8yRkJRM1JDTzBOQlJVb3NRMEZCUVN4RlFVRkZMRU5CUVVVaUxDSm1hV3hsSWpvaUwyaHZiV1V2WTJobGRHOXVMMmRwZEdoMVlpOTNaV0poY0hCbGJtZHBibVV2ZDJWaUwzWmxibVJ2Y2k5aGMzbHVZeTlzYVdJdllYTjVibU11YW5NaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SXZLaUZjYmlBcUlHRnplVzVqWEc0Z0tpQm9kSFJ3Y3pvdkwyZHBkR2gxWWk1amIyMHZZMkZ2YkdGdUwyRnplVzVqWEc0Z0tseHVJQ29nUTI5d2VYSnBaMmgwSURJd01UQXRNakF4TkNCRFlXOXNZVzRnVFdOTllXaHZibHh1SUNvZ1VtVnNaV0Z6WldRZ2RXNWtaWElnZEdobElFMUpWQ0JzYVdObGJuTmxYRzRnS2k5Y2JpaG1kVzVqZEdsdmJpQW9LU0I3WEc1Y2JpQWdJQ0IyWVhJZ1lYTjVibU1nUFNCN2ZUdGNiaUFnSUNCbWRXNWpkR2x2YmlCdWIyOXdLQ2tnZTMxY2JpQWdJQ0JtZFc1amRHbHZiaUJwWkdWdWRHbDBlU2gyS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCMk8xeHVJQ0FnSUgxY2JpQWdJQ0JtZFc1amRHbHZiaUIwYjBKdmIyd29kaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnSVNGMk8xeHVJQ0FnSUgxY2JpQWdJQ0JtZFc1amRHbHZiaUJ1YjNSSlpDaDJLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUFoZGp0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THlCbmJHOWlZV3dnYjI0Z2RHaGxJSE5sY25abGNpd2dkMmx1Wkc5M0lHbHVJSFJvWlNCaWNtOTNjMlZ5WEc0Z0lDQWdkbUZ5SUhCeVpYWnBiM1Z6WDJGemVXNWpPMXh1WEc0Z0lDQWdMeThnUlhOMFlXSnNhWE5vSUhSb1pTQnliMjkwSUc5aWFtVmpkQ3dnWUhkcGJtUnZkMkFnS0dCelpXeG1ZQ2tnYVc0Z2RHaGxJR0p5YjNkelpYSXNJR0JuYkc5aVlXeGdYRzRnSUNBZ0x5OGdiMjRnZEdobElITmxjblpsY2l3Z2IzSWdZSFJvYVhOZ0lHbHVJSE52YldVZ2RtbHlkSFZoYkNCdFlXTm9hVzVsY3k0Z1YyVWdkWE5sSUdCelpXeG1ZRnh1SUNBZ0lDOHZJR2x1YzNSbFlXUWdiMllnWUhkcGJtUnZkMkFnWm05eUlHQlhaV0pYYjNKclpYSmdJSE4xY0hCdmNuUXVYRzRnSUNBZ2RtRnlJSEp2YjNRZ1BTQjBlWEJsYjJZZ2MyVnNaaUE5UFQwZ0oyOWlhbVZqZENjZ0ppWWdjMlZzWmk1elpXeG1JRDA5UFNCelpXeG1JQ1ltSUhObGJHWWdmSHhjYmlBZ0lDQWdJQ0FnSUNBZ0lIUjVjR1Z2WmlCbmJHOWlZV3dnUFQwOUlDZHZZbXBsWTNRbklDWW1JR2RzYjJKaGJDNW5iRzlpWVd3Z1BUMDlJR2RzYjJKaGJDQW1KaUJuYkc5aVlXd2dmSHhjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE03WEc1Y2JpQWdJQ0JwWmlBb2NtOXZkQ0FoUFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUhCeVpYWnBiM1Z6WDJGemVXNWpJRDBnY205dmRDNWhjM2x1WXp0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NXViME52Ym1ac2FXTjBJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQnliMjkwTG1GemVXNWpJRDBnY0hKbGRtbHZkWE5mWVhONWJtTTdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXp0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnYjI1c2VWOXZibU5sS0dadUtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2htYmlBOVBUMGdiblZzYkNrZ2RHaHliM2NnYm1WM0lFVnljbTl5S0Z3aVEyRnNiR0poWTJzZ2QyRnpJR0ZzY21WaFpIa2dZMkZzYkdWa0xsd2lLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozVnRaVzUwY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtYmlBOUlHNTFiR3c3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDI5dVkyVW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHWnVJRDA5UFNCdWRXeHNLU0J5WlhSMWNtNDdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWJpNWhjSEJzZVNoMGFHbHpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdabTRnUFNCdWRXeHNPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJQzh2THk4Z1kzSnZjM010WW5KdmQzTmxjaUJqYjIxd1lYUnBZbXhwZEhrZ1puVnVZM1JwYjI1eklDOHZMeTljYmx4dUlDQWdJSFpoY2lCZmRHOVRkSEpwYm1jZ1BTQlBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bk8xeHVYRzRnSUNBZ2RtRnlJRjlwYzBGeWNtRjVJRDBnUVhKeVlYa3VhWE5CY25KaGVTQjhmQ0JtZFc1amRHbHZiaUFvYjJKcUtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmZkRzlUZEhKcGJtY3VZMkZzYkNodlltb3BJRDA5UFNBblcyOWlhbVZqZENCQmNuSmhlVjBuTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0F2THlCUWIzSjBaV1FnWm5KdmJTQjFibVJsY25OamIzSmxMbXB6SUdselQySnFaV04wWEc0Z0lDQWdkbUZ5SUY5cGMwOWlhbVZqZENBOUlHWjFibU4wYVc5dUtHOWlhaWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdkSGx3WlNBOUlIUjVjR1Z2WmlCdlltbzdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQjBlWEJsSUQwOVBTQW5ablZ1WTNScGIyNG5JSHg4SUhSNWNHVWdQVDA5SUNkdlltcGxZM1FuSUNZbUlDRWhiMkpxTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmYVhOQmNuSmhlVXhwYTJVb1lYSnlLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmYVhOQmNuSmhlU2hoY25JcElIeDhJQ2hjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJR2hoY3lCaElIQnZjMmwwYVhabElHbHVkR1ZuWlhJZ2JHVnVaM1JvSUhCeWIzQmxjblI1WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBlWEJsYjJZZ1lYSnlMbXhsYm1kMGFDQTlQVDBnWENKdWRXMWlaWEpjSWlBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnWVhKeUxteGxibWQwYUNBK1BTQXdJQ1ltWEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjbkl1YkdWdVozUm9JQ1VnTVNBOVBUMGdNRnh1SUNBZ0lDQWdJQ0FwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlsWVdOb0tHTnZiR3dzSUdsMFpYSmhkRzl5S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCZmFYTkJjbkpoZVV4cGEyVW9ZMjlzYkNrZ1AxeHVJQ0FnSUNBZ0lDQWdJQ0FnWDJGeWNtRjVSV0ZqYUNoamIyeHNMQ0JwZEdWeVlYUnZjaWtnT2x4dUlDQWdJQ0FnSUNBZ0lDQWdYMlp2Y2tWaFkyaFBaaWhqYjJ4c0xDQnBkR1Z5WVhSdmNpazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyRnljbUY1UldGamFDaGhjbklzSUdsMFpYSmhkRzl5S1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJwYm1SbGVDQTlJQzB4TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdiR1Z1WjNSb0lEMGdZWEp5TG14bGJtZDBhRHRjYmx4dUlDQWdJQ0FnSUNCM2FHbHNaU0FvS3l0cGJtUmxlQ0E4SUd4bGJtZDBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9ZWEp5VzJsdVpHVjRYU3dnYVc1a1pYZ3NJR0Z5Y2lrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZmJXRndLR0Z5Y2l3Z2FYUmxjbUYwYjNJcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdsdVpHVjRJRDBnTFRFc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlc1bmRHZ2dQU0JoY25JdWJHVnVaM1JvTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdjbVZ6ZFd4MElEMGdRWEp5WVhrb2JHVnVaM1JvS1R0Y2JseHVJQ0FnSUNBZ0lDQjNhR2xzWlNBb0t5dHBibVJsZUNBOElHeGxibWQwYUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WemRXeDBXMmx1WkdWNFhTQTlJR2wwWlhKaGRHOXlLR0Z5Y2x0cGJtUmxlRjBzSUdsdVpHVjRMQ0JoY25JcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnlaWE4xYkhRN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNKaGJtZGxLR052ZFc1MEtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmZiV0Z3S0VGeWNtRjVLR052ZFc1MEtTd2dablZ1WTNScGIyNGdLSFlzSUdrcElIc2djbVYwZFhKdUlHazdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjl5WldSMVkyVW9ZWEp5TENCcGRHVnlZWFJ2Y2l3Z2JXVnRieWtnZTF4dUlDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tHRnljaXdnWm5WdVkzUnBiMjRnS0hnc0lHa3NJR0VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRzFsYlc4Z1BTQnBkR1Z5WVhSdmNpaHRaVzF2TENCNExDQnBMQ0JoS1R0Y2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnRaVzF2TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjltYjNKRllXTm9UMllvYjJKcVpXTjBMQ0JwZEdWeVlYUnZjaWtnZTF4dUlDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tGOXJaWGx6S0c5aWFtVmpkQ2tzSUdaMWJtTjBhVzl1SUNoclpYa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtHOWlhbVZqZEZ0clpYbGRMQ0JyWlhrcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZhVzVrWlhoUFppaGhjbklzSUdsMFpXMHBJSHRjYmlBZ0lDQWdJQ0FnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCaGNuSXViR1Z1WjNSb095QnBLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoaGNuSmJhVjBnUFQwOUlHbDBaVzBwSUhKbGRIVnliaUJwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlBdE1UdGNiaUFnSUNCOVhHNWNiaUFnSUNCMllYSWdYMnRsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeUI4ZkNCbWRXNWpkR2x2YmlBb2IySnFLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnJaWGx6SUQwZ1cxMDdYRzRnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR3NnYVc0Z2IySnFLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYjJKcUxtaGhjMDkzYmxCeWIzQmxjblI1S0dzcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhMlY1Y3k1d2RYTm9LR3NwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJyWlhsek8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZmEyVjVTWFJsY21GMGIzSW9ZMjlzYkNrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnYVNBOUlDMHhPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2JHVnVPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVjenRjYmlBZ0lDQWdJQ0FnYVdZZ0tGOXBjMEZ5Y21GNVRHbHJaU2hqYjJ4c0tTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JHVnVJRDBnWTI5c2JDNXNaVzVuZEdnN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNGdibVY0ZENncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBLeXM3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR2tnUENCc1pXNGdQeUJwSURvZ2JuVnNiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCclpYbHpJRDBnWDJ0bGVYTW9ZMjlzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlc0Z1BTQnJaWGx6TG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdrckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2FTQThJR3hsYmlBL0lHdGxlWE5iYVYwZ09pQnVkV3hzTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJQzh2SUZOcGJXbHNZWElnZEc4Z1JWTTJKM01nY21WemRDQndZWEpoYlNBb2FIUjBjRG92TDJGeWFYbGhMbTltYVd4aFluTXVZMjl0THpJd01UTXZNRE12WlhNMkxXRnVaQzF5WlhOMExYQmhjbUZ0WlhSbGNpNW9kRzFzS1Z4dUlDQWdJQzh2SUZSb2FYTWdZV05qZFcxMWJHRjBaWE1nZEdobElHRnlaM1Z0Wlc1MGN5QndZWE56WldRZ2FXNTBieUJoYmlCaGNuSmhlU3dnWVdaMFpYSWdZU0JuYVhabGJpQnBibVJsZUM1Y2JpQWdJQ0F2THlCR2NtOXRJSFZ1WkdWeWMyTnZjbVV1YW5NZ0tHaDBkSEJ6T2k4dloybDBhSFZpTG1OdmJTOXFZWE5vYTJWdVlYTXZkVzVrWlhKelkyOXlaUzl3ZFd4c0x6SXhOREFwTGx4dUlDQWdJR1oxYm1OMGFXOXVJRjl5WlhOMFVHRnlZVzBvWm5WdVl5d2djM1JoY25SSmJtUmxlQ2tnZTF4dUlDQWdJQ0FnSUNCemRHRnlkRWx1WkdWNElEMGdjM1JoY25SSmJtUmxlQ0E5UFNCdWRXeHNJRDhnWm5WdVl5NXNaVzVuZEdnZ0xTQXhJRG9nSzNOMFlYSjBTVzVrWlhnN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnNaVzVuZEdnZ1BTQk5ZWFJvTG0xaGVDaGhjbWQxYldWdWRITXViR1Z1WjNSb0lDMGdjM1JoY25SSmJtUmxlQ3dnTUNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NtVnpkQ0E5SUVGeWNtRjVLR3hsYm1kMGFDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcGJtUmxlQ0E5SURBN0lHbHVaR1Y0SUR3Z2JHVnVaM1JvT3lCcGJtUmxlQ3NyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpkRnRwYm1SbGVGMGdQU0JoY21kMWJXVnVkSE5iYVc1a1pYZ2dLeUJ6ZEdGeWRFbHVaR1Y0WFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lITjNhWFJqYUNBb2MzUmhjblJKYm1SbGVDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYzJVZ01Eb2djbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6TENCeVpYTjBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVhObElERTZJSEpsZEhWeWJpQm1kVzVqTG1OaGJHd29kR2hwY3l3Z1lYSm5kVzFsYm5Seld6QmRMQ0J5WlhOMEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQzh2SUVOMWNuSmxiblJzZVNCMWJuVnpaV1FnWW5WMElHaGhibVJzWlNCallYTmxjeUJ2ZFhSemFXUmxJRzltSUhSb1pTQnpkMmwwWTJnZ2MzUmhkR1Z0Wlc1ME9seHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2RtRnlJR0Z5WjNNZ1BTQkJjbkpoZVNoemRHRnlkRWx1WkdWNElDc2dNU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJtYjNJZ0tHbHVaR1Y0SUQwZ01Ec2dhVzVrWlhnZ1BDQnpkR0Z5ZEVsdVpHVjRPeUJwYm1SbGVDc3JLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUFnSUNBZ1lYSm5jMXRwYm1SbGVGMGdQU0JoY21kMWJXVnVkSE5iYVc1a1pYaGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdZWEpuYzF0emRHRnlkRWx1WkdWNFhTQTlJSEpsYzNRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCeVpYUjFjbTRnWm5WdVl5NWhjSEJzZVNoMGFHbHpMQ0JoY21kektUdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZkMmwwYUc5MWRFbHVaR1Y0S0dsMFpYSmhkRzl5S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlBb2RtRnNkV1VzSUdsdVpHVjRMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHbDBaWEpoZEc5eUtIWmhiSFZsTENCallXeHNZbUZqYXlrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OHZMeUJsZUhCdmNuUmxaQ0JoYzNsdVl5QnRiMlIxYkdVZ1puVnVZM1JwYjI1eklDOHZMeTljYmx4dUlDQWdJQzh2THk4Z2JtVjRkRlJwWTJzZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnZDJsMGFDQmljbTkzYzJWeUxXTnZiWEJoZEdsaWJHVWdabUZzYkdKaFkyc2dMeTh2TDF4dVhHNGdJQ0FnTHk4Z1kyRndkSFZ5WlNCMGFHVWdaMnh2WW1Gc0lISmxabVZ5Wlc1alpTQjBieUJuZFdGeVpDQmhaMkZwYm5OMElHWmhhMlZVYVcxbGNpQnRiMk5yYzF4dUlDQWdJSFpoY2lCZmMyVjBTVzF0WldScFlYUmxJRDBnZEhsd1pXOW1JSE5sZEVsdGJXVmthV0YwWlNBOVBUMGdKMloxYm1OMGFXOXVKeUFtSmlCelpYUkpiVzFsWkdsaGRHVTdYRzVjYmlBZ0lDQjJZWElnWDJSbGJHRjVJRDBnWDNObGRFbHRiV1ZrYVdGMFpTQS9JR1oxYm1OMGFXOXVLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lDOHZJRzV2ZENCaElHUnBjbVZqZENCaGJHbGhjeUJtYjNJZ1NVVXhNQ0JqYjIxd1lYUnBZbWxzYVhSNVhHNGdJQ0FnSUNBZ0lGOXpaWFJKYlcxbFpHbGhkR1VvWm00cE8xeHVJQ0FnSUgwZ09pQm1kVzVqZEdsdmJpaG1iaWtnZTF4dUlDQWdJQ0FnSUNCelpYUlVhVzFsYjNWMEtHWnVMQ0F3S1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnYVdZZ0tIUjVjR1Z2WmlCd2NtOWpaWE56SUQwOVBTQW5iMkpxWldOMEp5QW1KaUIwZVhCbGIyWWdjSEp2WTJWemN5NXVaWGgwVkdsamF5QTlQVDBnSjJaMWJtTjBhVzl1SnlrZ2UxeHVJQ0FnSUNBZ0lDQmhjM2x1WXk1dVpYaDBWR2xqYXlBOUlIQnliMk5sYzNNdWJtVjRkRlJwWTJzN1hHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnWVhONWJtTXVibVY0ZEZScFkyc2dQU0JmWkdWc1lYazdYRzRnSUNBZ2ZWeHVJQ0FnSUdGemVXNWpMbk5sZEVsdGJXVmthV0YwWlNBOUlGOXpaWFJKYlcxbFpHbGhkR1VnUHlCZlpHVnNZWGtnT2lCaGMzbHVZeTV1WlhoMFZHbGphenRjYmx4dVhHNGdJQ0FnWVhONWJtTXVabTl5UldGamFDQTlYRzRnSUNBZ1lYTjVibU11WldGamFDQTlJR1oxYm1OMGFXOXVJQ2hoY25Jc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdVpXRmphRTltS0dGeWNpd2dYM2RwZEdodmRYUkpibVJsZUNocGRHVnlZWFJ2Y2lrc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wm05eVJXRmphRk5sY21sbGN5QTlYRzRnSUNBZ1lYTjVibU11WldGamFGTmxjbWxsY3lBOUlHWjFibU4wYVc5dUlDaGhjbklzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1lYTjVibU11WldGamFFOW1VMlZ5YVdWektHRnljaXdnWDNkcGRHaHZkWFJKYm1SbGVDaHBkR1Z5WVhSdmNpa3NJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQjlPMXh1WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0pGWVdOb1RHbHRhWFFnUFZ4dUlDQWdJR0Z6ZVc1akxtVmhZMmhNYVcxcGRDQTlJR1oxYm1OMGFXOXVJQ2hoY25Jc0lHeHBiV2wwTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOWxZV05vVDJaTWFXMXBkQ2hzYVcxcGRDa29ZWEp5TENCZmQybDBhRzkxZEVsdVpHVjRLR2wwWlhKaGRHOXlLU3dnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0pGWVdOb1QyWWdQVnh1SUNBZ0lHRnplVzVqTG1WaFkyaFBaaUE5SUdaMWJtTjBhVzl1SUNodlltcGxZM1FzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5QTlJRjl2Ym1ObEtHTmhiR3hpWVdOcklIeDhJRzV2YjNBcE8xeHVJQ0FnSUNBZ0lDQnZZbXBsWTNRZ1BTQnZZbXBsWTNRZ2ZId2dXMTA3WEc0Z0lDQWdJQ0FnSUhaaGNpQnphWHBsSUQwZ1gybHpRWEp5WVhsTWFXdGxLRzlpYW1WamRDa2dQeUJ2WW1wbFkzUXViR1Z1WjNSb0lEb2dYMnRsZVhNb2IySnFaV04wS1M1c1pXNW5kR2c3WEc0Z0lDQWdJQ0FnSUhaaGNpQmpiMjF3YkdWMFpXUWdQU0F3TzF4dUlDQWdJQ0FnSUNCcFppQW9JWE5wZW1VcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JmWldGamFDaHZZbXBsWTNRc0lHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2EyVjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaHZZbXBsWTNSYmEyVjVYU3dnYTJWNUxDQnZibXg1WDI5dVkyVW9aRzl1WlNrcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWkc5dVpTaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyOXRjR3hsZEdWa0lDczlJREU3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTnZiWEJzWlhSbFpDQStQU0J6YVhwbEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSkZZV05vVDJaVFpYSnBaWE1nUFZ4dUlDQWdJR0Z6ZVc1akxtVmhZMmhQWmxObGNtbGxjeUE5SUdaMWJtTjBhVzl1SUNodlltb3NJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCallXeHNZbUZqYXlBOUlGOXZibU5sS0dOaGJHeGlZV05ySUh4OElHNXZiM0FwTzF4dUlDQWdJQ0FnSUNCdlltb2dQU0J2WW1vZ2ZId2dXMTA3WEc0Z0lDQWdJQ0FnSUhaaGNpQnVaWGgwUzJWNUlEMGdYMnRsZVVsMFpYSmhkRzl5S0c5aWFpazdYRzRnSUNBZ0lDQWdJSFpoY2lCclpYa2dQU0J1WlhoMFMyVjVLQ2s3WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUdsMFpYSmhkR1VvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2MzbHVZeUE5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hMlY1SUQwOVBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYjJKcVcydGxlVjBzSUd0bGVTd2diMjVzZVY5dmJtTmxLR1oxYm1OMGFXOXVJQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JyWlhrZ1BTQnVaWGgwUzJWNUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHJaWGtnUFQwOUlHNTFiR3dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoemVXNWpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYTjVibU11Ym1WNGRGUnBZMnNvYVhSbGNtRjBaU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkR1VvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lITjVibU1nUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcGRHVnlZWFJsS0NrN1hHNGdJQ0FnZlR0Y2JseHVYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSkZZV05vVDJaTWFXMXBkQ0E5WEc0Z0lDQWdZWE41Ym1NdVpXRmphRTltVEdsdGFYUWdQU0JtZFc1amRHbHZiaUFvYjJKcUxDQnNhVzFwZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJRjlsWVdOb1QyWk1hVzFwZENoc2FXMXBkQ2tvYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZaV0ZqYUU5bVRHbHRhWFFvYkdsdGFYUXBJSHRjYmx4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRnS0c5aWFpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5QTlJRjl2Ym1ObEtHTmhiR3hpWVdOcklIeDhJRzV2YjNBcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYjJKcUlEMGdiMkpxSUh4OElGdGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJRzVsZUhSTFpYa2dQU0JmYTJWNVNYUmxjbUYwYjNJb2IySnFLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hzYVcxcGRDQThQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHUnZibVVnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5ZFc1dWFXNW5JRDBnTUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCbGNuSnZjbVZrSUQwZ1ptRnNjMlU3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ2htZFc1amRHbHZiaUJ5WlhCc1pXNXBjMmdnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hrYjI1bElDWW1JSEoxYm01cGJtY2dQRDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tISjFibTVwYm1jZ1BDQnNhVzFwZENBbUppQWhaWEp5YjNKbFpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdhMlY1SUQwZ2JtVjRkRXRsZVNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2EyVjVJRDA5UFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrYjI1bElEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHlkVzV1YVc1bklEdzlJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnlianRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5ZFc1dWFXNW5JQ3M5SURFN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzlpYWx0clpYbGRMQ0JyWlhrc0lHOXViSGxmYjI1alpTaG1kVzVqZEdsdmJpQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeWRXNXVhVzVuSUMwOUlERTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsY25KdmNtVmtJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxjR3hsYm1semFDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTa29LVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUdSdlVHRnlZV3hzWld3b1ptNHBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2h2WW1vc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadUtHRnplVzVqTG1WaFkyaFBaaXdnYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmlBZ0lDQm1kVzVqZEdsdmJpQmtiMUJoY21Gc2JHVnNUR2x0YVhRb1ptNHBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2h2WW1vc0lHeHBiV2wwTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJtYmloZlpXRmphRTltVEdsdGFYUW9iR2x0YVhRcExDQnZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVJQ0FnSUdaMWJtTjBhVzl1SUdSdlUyVnlhV1Z6S0dadUtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQW9iMkpxTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJtYmloaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNc0lHOWlhaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZllYTjVibU5OWVhBb1pXRmphR1p1TENCaGNuSXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCallXeHNZbUZqYXlBOUlGOXZibU5sS0dOaGJHeGlZV05ySUh4OElHNXZiM0FwTzF4dUlDQWdJQ0FnSUNCMllYSWdjbVZ6ZFd4MGN5QTlJRnRkTzF4dUlDQWdJQ0FnSUNCbFlXTm9abTRvWVhKeUxDQm1kVzVqZEdsdmJpQW9kbUZzZFdVc0lHbHVaR1Y0TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvZG1Gc2RXVXNJR1oxYm1OMGFXOXVJQ2hsY25Jc0lIWXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUnpXMmx1WkdWNFhTQTlJSFk3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JtZFc1amRHbHZiaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXNJSEpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NXRZWEFnUFNCa2IxQmhjbUZzYkdWc0tGOWhjM2x1WTAxaGNDazdYRzRnSUNBZ1lYTjVibU11YldGd1UyVnlhV1Z6SUQwZ1pHOVRaWEpwWlhNb1gyRnplVzVqVFdGd0tUdGNiaUFnSUNCaGMzbHVZeTV0WVhCTWFXMXBkQ0E5SUdSdlVHRnlZV3hzWld4TWFXMXBkQ2hmWVhONWJtTk5ZWEFwTzF4dVhHNGdJQ0FnTHk4Z2NtVmtkV05sSUc5dWJIa2dhR0Z6SUdFZ2MyVnlhV1Z6SUhabGNuTnBiMjRzSUdGeklHUnZhVzVuSUhKbFpIVmpaU0JwYmlCd1lYSmhiR3hsYkNCM2IyNG5kRnh1SUNBZ0lDOHZJSGR2Y21zZ2FXNGdiV0Z1ZVNCemFYUjFZWFJwYjI1ekxseHVJQ0FnSUdGemVXNWpMbWx1YW1WamRDQTlYRzRnSUNBZ1lYTjVibU11Wm05c1pHd2dQVnh1SUNBZ0lHRnplVzVqTG5KbFpIVmpaU0E5SUdaMWJtTjBhVzl1SUNoaGNuSXNJRzFsYlc4c0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0JoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1vWVhKeUxDQm1kVzVqZEdsdmJpQW9lQ3dnYVN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0cxbGJXOHNJSGdzSUdaMWJtTjBhVzl1SUNobGNuSXNJSFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdFpXMXZJRDBnZGp0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDBzSUdaMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaUI4ZkNCdWRXeHNMQ0J0WlcxdktUdGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtWnZiR1J5SUQxY2JpQWdJQ0JoYzNsdVl5NXlaV1IxWTJWU2FXZG9kQ0E5SUdaMWJtTjBhVzl1SUNoaGNuSXNJRzFsYlc4c0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NtVjJaWEp6WldRZ1BTQmZiV0Z3S0dGeWNpd2dhV1JsYm5ScGRIa3BMbkpsZG1WeWMyVW9LVHRjYmlBZ0lDQWdJQ0FnWVhONWJtTXVjbVZrZFdObEtISmxkbVZ5YzJWa0xDQnRaVzF2TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZlptbHNkR1Z5S0dWaFkyaG1iaXdnWVhKeUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZEhNZ1BTQmJYVHRjYmlBZ0lDQWdJQ0FnWldGamFHWnVLR0Z5Y2l3Z1puVnVZM1JwYjI0Z0tIZ3NJR2x1WkdWNExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2VDd2dablZ1WTNScGIyNGdLSFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhSekxuQjFjMmdvZTJsdVpHVjRPaUJwYm1SbGVDd2dkbUZzZFdVNklIaDlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOUxDQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGZiV0Z3S0hKbGMzVnNkSE11YzI5eWRDaG1kVzVqZEdsdmJpQW9ZU3dnWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaExtbHVaR1Y0SUMwZ1lpNXBibVJsZUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTENCbWRXNWpkR2x2YmlBb2VDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjRMblpoYkhWbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1elpXeGxZM1FnUFZ4dUlDQWdJR0Z6ZVc1akxtWnBiSFJsY2lBOUlHUnZVR0Z5WVd4c1pXd29YMlpwYkhSbGNpazdYRzVjYmlBZ0lDQmhjM2x1WXk1elpXeGxZM1JNYVcxcGRDQTlYRzRnSUNBZ1lYTjVibU11Wm1sc2RHVnlUR2x0YVhRZ1BTQmtiMUJoY21Gc2JHVnNUR2x0YVhRb1gyWnBiSFJsY2lrN1hHNWNiaUFnSUNCaGMzbHVZeTV6Wld4bFkzUlRaWEpwWlhNZ1BWeHVJQ0FnSUdGemVXNWpMbVpwYkhSbGNsTmxjbWxsY3lBOUlHUnZVMlZ5YVdWektGOW1hV3gwWlhJcE8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxhbVZqZENobFlXTm9abTRzSUdGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUY5bWFXeDBaWElvWldGamFHWnVMQ0JoY25Jc0lHWjFibU4wYVc5dUtIWmhiSFZsTENCallpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2RtRnNkV1VzSUdaMWJtTjBhVzl1S0hZcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZaWdoZGlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMWNiaUFnSUNCaGMzbHVZeTV5WldwbFkzUWdQU0JrYjFCaGNtRnNiR1ZzS0Y5eVpXcGxZM1FwTzF4dUlDQWdJR0Z6ZVc1akxuSmxhbVZqZEV4cGJXbDBJRDBnWkc5UVlYSmhiR3hsYkV4cGJXbDBLRjl5WldwbFkzUXBPMXh1SUNBZ0lHRnplVzVqTG5KbGFtVmpkRk5sY21sbGN5QTlJR1J2VTJWeWFXVnpLRjl5WldwbFkzUXBPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMk55WldGMFpWUmxjM1JsY2lobFlXTm9abTRzSUdOb1pXTnJMQ0JuWlhSU1pYTjFiSFFwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0dGeWNpd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdaRzl1WlNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTJJcElHTmlLR2RsZEZKbGMzVnNkQ2htWVd4elpTd2dkbTlwWkNBd0tTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJwZEdWeVlYUmxaU2g0TENCZkxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaFkySXBJSEpsZEhWeWJpQmpZV3hzWW1GamF5Z3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLSGdzSUdaMWJtTjBhVzl1SUNoMktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGpZaUFtSmlCamFHVmpheWgyS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySW9aMlYwVW1WemRXeDBLSFJ5ZFdVc0lIZ3BLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05pSUQwZ2FYUmxjbUYwYjNJZ1BTQm1ZV3h6WlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BpQXpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWldGamFHWnVLR0Z5Y2l3Z2JHbHRhWFFzSUdsMFpYSmhkR1ZsTENCa2IyNWxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySWdQU0JwZEdWeVlYUnZjanRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaUE5SUd4cGJXbDBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZoWTJobWJpaGhjbklzSUdsMFpYSmhkR1ZsTENCa2IyNWxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1aGJua2dQVnh1SUNBZ0lHRnplVzVqTG5OdmJXVWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaaXdnZEc5Q2IyOXNMQ0JwWkdWdWRHbDBlU2s3WEc1Y2JpQWdJQ0JoYzNsdVl5NXpiMjFsVEdsdGFYUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaa3hwYldsMExDQjBiMEp2YjJ3c0lHbGtaVzUwYVhSNUtUdGNibHh1SUNBZ0lHRnplVzVqTG1Gc2JDQTlYRzRnSUNBZ1lYTjVibU11WlhabGNua2dQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaaXdnYm05MFNXUXNJRzV2ZEVsa0tUdGNibHh1SUNBZ0lHRnplVzVqTG1WMlpYSjVUR2x0YVhRZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFpreHBiV2wwTENCdWIzUkpaQ3dnYm05MFNXUXBPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMlpwYm1SSFpYUlNaWE4xYkhRb2Rpd2dlQ2tnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZUR0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdVpHVjBaV04wSUQwZ1gyTnlaV0YwWlZSbGMzUmxjaWhoYzNsdVl5NWxZV05vVDJZc0lHbGtaVzUwYVhSNUxDQmZabWx1WkVkbGRGSmxjM1ZzZENrN1hHNGdJQ0FnWVhONWJtTXVaR1YwWldOMFUyVnlhV1Z6SUQwZ1gyTnlaV0YwWlZSbGMzUmxjaWhoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1zSUdsa1pXNTBhWFI1TENCZlptbHVaRWRsZEZKbGMzVnNkQ2s3WEc0Z0lDQWdZWE41Ym1NdVpHVjBaV04wVEdsdGFYUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaa3hwYldsMExDQnBaR1Z1ZEdsMGVTd2dYMlpwYm1SSFpYUlNaWE4xYkhRcE8xeHVYRzRnSUNBZ1lYTjVibU11YzI5eWRFSjVJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbTFoY0NoaGNuSXNJR1oxYm1OMGFXOXVJQ2g0TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvZUN3Z1puVnVZM1JwYjI0Z0tHVnljaXdnWTNKcGRHVnlhV0VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCN2RtRnNkV1U2SUhnc0lHTnlhWFJsY21saE9pQmpjbWwwWlhKcFlYMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5TENCbWRXNWpkR2x2YmlBb1pYSnlMQ0J5WlhOMWJIUnpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0xDQmZiV0Z3S0hKbGMzVnNkSE11YzI5eWRDaGpiMjF3WVhKaGRHOXlLU3dnWm5WdVkzUnBiMjRnS0hncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSGd1ZG1Gc2RXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUgwcE8xeHVYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR052YlhCaGNtRjBiM0lvYkdWbWRDd2djbWxuYUhRcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmhJRDBnYkdWbWRDNWpjbWwwWlhKcFlTd2dZaUE5SUhKcFoyaDBMbU55YVhSbGNtbGhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdFZ1BDQmlJRDhnTFRFZ09pQmhJRDRnWWlBL0lERWdPaUF3TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbUYxZEc4Z1BTQm1kVzVqZEdsdmJpQW9kR0Z6YTNNc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJSFpoY2lCclpYbHpJRDBnWDJ0bGVYTW9kR0Z6YTNNcE8xeHVJQ0FnSUNBZ0lDQjJZWElnY21WdFlXbHVhVzVuVkdGemEzTWdQU0JyWlhsekxteGxibWQwYUR0Y2JpQWdJQ0FnSUNBZ2FXWWdLQ0Z5WlcxaGFXNXBibWRVWVhOcmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0I3ZlR0Y2JseHVJQ0FnSUNBZ0lDQjJZWElnYkdsemRHVnVaWEp6SUQwZ1cxMDdYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR0ZrWkV4cGMzUmxibVZ5S0dadUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCc2FYTjBaVzVsY25NdWRXNXphR2xtZENobWJpazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnY21WdGIzWmxUR2x6ZEdWdVpYSW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCcFpIZ2dQU0JmYVc1a1pYaFBaaWhzYVhOMFpXNWxjbk1zSUdadUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHBaSGdnUGowZ01Da2diR2x6ZEdWdVpYSnpMbk53YkdsalpTaHBaSGdzSURFcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJSFJoYzJ0RGIyMXdiR1YwWlNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGJXRnBibWx1WjFSaGMydHpMUzA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LR3hwYzNSbGJtVnljeTV6YkdsalpTZ3dLU3dnWm5WdVkzUnBiMjRnS0dadUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdZV1JrVEdsemRHVnVaWElvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRnlaVzFoYVc1cGJtZFVZWE5yY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dzSUhKbGMzVnNkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5S1R0Y2JseHVJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LR3RsZVhNc0lHWjFibU4wYVc5dUlDaHJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnZEdGemF5QTlJRjlwYzBGeWNtRjVLSFJoYzJ0elcydGRLU0EvSUhSaGMydHpXMnRkT2lCYmRHRnphM05iYTExZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlIUmhjMnREWVd4c1ltRmpheUE5SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0b1pYSnlMQ0JoY21kektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVozTXViR1Z1WjNSb0lEdzlJREVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWEpuY3lBOUlHRnlaM05iTUYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlITmhabVZTWlhOMWJIUnpJRDBnZTMwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRjltYjNKRllXTm9UMllvY21WemRXeDBjeXdnWm5WdVkzUnBiMjRvZG1Gc0xDQnlhMlY1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCellXWmxVbVZ6ZFd4MGMxdHlhMlY1WFNBOUlIWmhiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOaFptVlNaWE4xYkhSelcydGRJRDBnWVhKbmN6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUxDQnpZV1psVW1WemRXeDBjeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFJ6VzJ0ZElEMGdZWEpuY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWE41Ym1NdWMyVjBTVzF0WldScFlYUmxLSFJoYzJ0RGIyMXdiR1YwWlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NtVnhkV2x5WlhNZ1BTQjBZWE5yTG5Oc2FXTmxLREFzSUhSaGMyc3ViR1Z1WjNSb0lDMGdNU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJ3Y21WMlpXNTBJR1JsWVdRdGJHOWphM05jYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJzWlc0Z1BTQnlaWEYxYVhKbGN5NXNaVzVuZEdnN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHVndPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2QyaHBiR1VnS0d4bGJpMHRLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRW9aR1Z3SUQwZ2RHRnphM05iY21WeGRXbHlaWE5iYkdWdVhWMHBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblNHRnpJR2x1WlhocGMzUmhiblFnWkdWd1pXNWtaVzVqZVNjcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWDJselFYSnlZWGtvWkdWd0tTQW1KaUJmYVc1a1pYaFBaaWhrWlhBc0lHc3BJRDQ5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RJWVhNZ1kzbGpiR2xqSUdSbGNHVnVaR1Z1WTJsbGN5Y3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUhKbFlXUjVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJmY21Wa2RXTmxLSEpsY1hWcGNtVnpMQ0JtZFc1amRHbHZiaUFvWVN3Z2VDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnS0dFZ0ppWWdjbVZ6ZFd4MGN5NW9ZWE5QZDI1UWNtOXdaWEowZVNoNEtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU3dnZEhKMVpTa2dKaVlnSVhKbGMzVnNkSE11YUdGelQzZHVVSEp2Y0dWeWRIa29heWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jbVZoWkhrb0tTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJoYzJ0YmRHRnpheTVzWlc1bmRHZ2dMU0F4WFNoMFlYTnJRMkZzYkdKaFkyc3NJSEpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZV1JrVEdsemRHVnVaWElvYkdsemRHVnVaWElwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z2JHbHpkR1Z1WlhJb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hKbFlXUjVLQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ0YjNabFRHbHpkR1Z1WlhJb2JHbHpkR1Z1WlhJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWVhOclczUmhjMnN1YkdWdVozUm9JQzBnTVYwb2RHRnphME5oYkd4aVlXTnJMQ0J5WlhOMWJIUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDA3WEc1Y2JseHVYRzRnSUNBZ1lYTjVibU11Y21WMGNua2dQU0JtZFc1amRHbHZiaWgwYVcxbGN5d2dkR0Z6YXl3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUVSRlJrRlZURlJmVkVsTlJWTWdQU0ExTzF4dUlDQWdJQ0FnSUNCMllYSWdSRVZHUVZWTVZGOUpUbFJGVWxaQlRDQTlJREE3WEc1Y2JpQWdJQ0FnSUNBZ2RtRnlJR0YwZEdWdGNIUnpJRDBnVzEwN1hHNWNiaUFnSUNBZ0lDQWdkbUZ5SUc5d2RITWdQU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhVzFsY3pvZ1JFVkdRVlZNVkY5VVNVMUZVeXhjYmlBZ0lDQWdJQ0FnSUNBZ0lHbHVkR1Z5ZG1Gc09pQkVSVVpCVlV4VVgwbE9WRVZTVmtGTVhHNGdJQ0FnSUNBZ0lIMDdYRzVjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnY0dGeWMyVlVhVzFsY3loaFkyTXNJSFFwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lvZEhsd1pXOW1JSFFnUFQwOUlDZHVkVzFpWlhJbktYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhZMk11ZEdsdFpYTWdQU0J3WVhKelpVbHVkQ2gwTENBeE1Da2dmSHdnUkVWR1FWVk1WRjlVU1UxRlV6dGNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0JwWmloMGVYQmxiMllnZENBOVBUMGdKMjlpYW1WamRDY3BlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0ZqWXk1MGFXMWxjeUE5SUhCaGNuTmxTVzUwS0hRdWRHbHRaWE1zSURFd0tTQjhmQ0JFUlVaQlZVeFVYMVJKVFVWVE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRmpZeTVwYm5SbGNuWmhiQ0E5SUhCaGNuTmxTVzUwS0hRdWFXNTBaWEoyWVd3c0lERXdLU0I4ZkNCRVJVWkJWVXhVWDBsT1ZFVlNWa0ZNTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0oxVnVjM1Z3Y0c5eWRHVmtJR0Z5WjNWdFpXNTBJSFI1Y0dVZ1ptOXlJRnhjSjNScGJXVnpYRnduT2lBbklDc2dkSGx3Wlc5bUlIUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnZG1GeUlHeGxibWQwYUNBOUlHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnN1hHNGdJQ0FnSUNBZ0lHbG1JQ2hzWlc1bmRHZ2dQQ0F4SUh4OElHeGxibWQwYUNBK0lETXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblNXNTJZV3hwWkNCaGNtZDFiV1Z1ZEhNZ0xTQnRkWE4wSUdKbElHVnBkR2hsY2lBb2RHRnpheWtzSUNoMFlYTnJMQ0JqWVd4c1ltRmpheWtzSUNoMGFXMWxjeXdnZEdGemF5a2diM0lnS0hScGJXVnpMQ0IwWVhOckxDQmpZV3hzWW1GamF5a25LVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNoc1pXNW5kR2dnUEQwZ01pQW1KaUIwZVhCbGIyWWdkR2x0WlhNZ1BUMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnZEdGemF6dGNiaUFnSUNBZ0lDQWdJQ0FnSUhSaGMyc2dQU0IwYVcxbGN6dGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUhScGJXVnpJQ0U5UFNBblpuVnVZM1JwYjI0bktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCd1lYSnpaVlJwYldWektHOXdkSE1zSUhScGJXVnpLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCdmNIUnpMbU5oYkd4aVlXTnJJRDBnWTJGc2JHSmhZMnM3WEc0Z0lDQWdJQ0FnSUc5d2RITXVkR0Z6YXlBOUlIUmhjMnM3WEc1Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z2QzSmhjSEJsWkZSaGMyc29kM0poY0hCbFpFTmhiR3hpWVdOckxDQjNjbUZ3Y0dWa1VtVnpkV3gwY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnY21WMGNubEJkSFJsYlhCMEtIUmhjMnNzSUdacGJtRnNRWFIwWlcxd2RDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpaHpaWEpwWlhORFlXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWVhOcktHWjFibU4wYVc5dUtHVnljaXdnY21WemRXeDBLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sY21sbGMwTmhiR3hpWVdOcktDRmxjbklnZkh3Z1ptbHVZV3hCZEhSbGJYQjBMQ0I3WlhKeU9pQmxjbklzSUhKbGMzVnNkRG9nY21WemRXeDBmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHNJSGR5WVhCd1pXUlNaWE4xYkhSektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCeVpYUnllVWx1ZEdWeWRtRnNLR2x1ZEdWeWRtRnNLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNG9jMlZ5YVdWelEyRnNiR0poWTJzcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J6WlhSVWFXMWxiM1YwS0daMWJtTjBhVzl1S0NsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCelpYSnBaWE5EWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2FXNTBaWEoyWVd3cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0FnSUhkb2FXeGxJQ2h2Y0hSekxuUnBiV1Z6S1NCN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWm1sdVlXeEJkSFJsYlhCMElEMGdJU2h2Y0hSekxuUnBiV1Z6TFQweEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhkSFJsYlhCMGN5NXdkWE5vS0hKbGRISjVRWFIwWlcxd2RDaHZjSFJ6TG5SaGMyc3NJR1pwYm1Gc1FYUjBaVzF3ZENrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1LQ0ZtYVc1aGJFRjBkR1Z0Y0hRZ0ppWWdiM0IwY3k1cGJuUmxjblpoYkNBK0lEQXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGRIUmxiWEIwY3k1d2RYTm9LSEpsZEhKNVNXNTBaWEoyWVd3b2IzQjBjeTVwYm5SbGNuWmhiQ2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdZWE41Ym1NdWMyVnlhV1Z6S0dGMGRHVnRjSFJ6TENCbWRXNWpkR2x2Ymloa2IyNWxMQ0JrWVhSaEtYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoSUQwZ1pHRjBZVnRrWVhSaExteGxibWQwYUNBdElERmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ2gzY21Gd2NHVmtRMkZzYkdKaFkyc2dmSHdnYjNCMGN5NWpZV3hzWW1GamF5a29aR0YwWVM1bGNuSXNJR1JoZEdFdWNtVnpkV3gwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdMeThnU1dZZ1lTQmpZV3hzWW1GamF5QnBjeUJ3WVhOelpXUXNJSEoxYmlCMGFHbHpJR0Z6SUdFZ1kyOXVkSEp2Ykd3Z1pteHZkMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdiM0IwY3k1allXeHNZbUZqYXlBL0lIZHlZWEJ3WldSVVlYTnJLQ2tnT2lCM2NtRndjR1ZrVkdGemF6dGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11ZDJGMFpYSm1ZV3hzSUQwZ1puVnVZM1JwYjI0Z0tIUmhjMnR6TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5QTlJRjl2Ym1ObEtHTmhiR3hpWVdOcklIeDhJRzV2YjNBcE8xeHVJQ0FnSUNBZ0lDQnBaaUFvSVY5cGMwRnljbUY1S0hSaGMydHpLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdWeWNpQTlJRzVsZHlCRmNuSnZjaWduUm1seWMzUWdZWEpuZFcxbGJuUWdkRzhnZDJGMFpYSm1ZV3hzSUcxMWMzUWdZbVVnWVc0Z1lYSnlZWGtnYjJZZ1puVnVZM1JwYjI1ekp5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb0lYUmhjMnR6TG14bGJtZDBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnZDNKaGNFbDBaWEpoZEc5eUtHbDBaWEpoZEc5eUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1pYSnlMQ0JoY21kektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXk1aGNIQnNlU2h1ZFd4c0xDQmJaWEp5WFM1amIyNWpZWFFvWVhKbmN5a3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHNWxlSFFnUFNCcGRHVnlZWFJ2Y2k1dVpYaDBLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h1WlhoMEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjbWR6TG5CMWMyZ29kM0poY0VsMFpYSmhkRzl5S0c1bGVIUXBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnlaM011Y0hWemFDaGpZV3hzWW1GamF5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaVzV6ZFhKbFFYTjVibU1vYVhSbGNtRjBiM0lwTG1Gd2NHeDVLRzUxYkd3c0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIZHlZWEJKZEdWeVlYUnZjaWhoYzNsdVl5NXBkR1Z5WVhSdmNpaDBZWE5yY3lrcEtDazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXdZWEpoYkd4bGJDaGxZV05vWm00c0lIUmhjMnR6TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5QTlJR05oYkd4aVlXTnJJSHg4SUc1dmIzQTdYRzRnSUNBZ0lDQWdJSFpoY2lCeVpYTjFiSFJ6SUQwZ1gybHpRWEp5WVhsTWFXdGxLSFJoYzJ0ektTQS9JRnRkSURvZ2UzMDdYRzVjYmlBZ0lDQWdJQ0FnWldGamFHWnVLSFJoYzJ0ekxDQm1kVzVqZEdsdmJpQW9kR0Z6YXl3Z2EyVjVMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR0Z6YXloZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUlDaGxjbklzSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1lYSm5jeTVzWlc1bmRHZ2dQRDBnTVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoY21keklEMGdZWEpuYzFzd1hUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ6ZFd4MGMxdHJaWGxkSUQwZ1lYSm5jenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JtZFc1amRHbHZiaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXNJSEpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NXdZWEpoYkd4bGJDQTlJR1oxYm1OMGFXOXVJQ2gwWVhOcmN5d2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWDNCaGNtRnNiR1ZzS0dGemVXNWpMbVZoWTJoUFppd2dkR0Z6YTNNc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Y0dGeVlXeHNaV3hNYVcxcGRDQTlJR1oxYm1OMGFXOXVLSFJoYzJ0ekxDQnNhVzFwZEN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdYM0JoY21Gc2JHVnNLRjlsWVdOb1QyWk1hVzFwZENoc2FXMXBkQ2tzSUhSaGMydHpMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxuTmxjbWxsY3lBOUlHWjFibU4wYVc5dUtIUmhjMnR6TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmZjR0Z5WVd4c1pXd29ZWE41Ym1NdVpXRmphRTltVTJWeWFXVnpMQ0IwWVhOcmN5d2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1cGRHVnlZWFJ2Y2lBOUlHWjFibU4wYVc5dUlDaDBZWE5yY3lrZ2UxeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnRZV3RsUTJGc2JHSmhZMnNvYVc1a1pYZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHWnVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaDBZWE5yY3k1c1pXNW5kR2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR0Z6YTNOYmFXNWtaWGhkTG1Gd2NHeDVLRzUxYkd3c0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1iaTV1WlhoMEtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JtYmk1dVpYaDBJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlBb2FXNWtaWGdnUENCMFlYTnJjeTVzWlc1bmRHZ2dMU0F4S1NBL0lHMWhhMlZEWVd4c1ltRmpheWhwYm1SbGVDQXJJREVwT2lCdWRXeHNPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJtYmp0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2JXRnJaVU5oYkd4aVlXTnJLREFwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NWhjSEJzZVNBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR1p1TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1SUNoallXeHNRWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1p1TG1Gd2NHeDVLRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzUxYkd3c0lHRnlaM011WTI5dVkyRjBLR05oYkd4QmNtZHpLVnh1SUNBZ0lDQWdJQ0FnSUNBZ0tUdGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmU2s3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWTI5dVkyRjBLR1ZoWTJobWJpd2dZWEp5TENCbWJpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZENBOUlGdGRPMXh1SUNBZ0lDQWdJQ0JsWVdOb1ptNG9ZWEp5TENCbWRXNWpkR2x2YmlBb2VDd2dhVzVrWlhnc0lHTmlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1iaWg0TENCbWRXNWpkR2x2YmlBb1pYSnlMQ0I1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpkV3gwSUQwZ2NtVnpkV3gwTG1OdmJtTmhkQ2g1SUh4OElGdGRLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWWlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDBzSUdaMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaXdnY21WemRXeDBLVHRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlZ4dUlDQWdJR0Z6ZVc1akxtTnZibU5oZENBOUlHUnZVR0Z5WVd4c1pXd29YMk52Ym1OaGRDazdYRzRnSUNBZ1lYTjVibU11WTI5dVkyRjBVMlZ5YVdWeklEMGdaRzlUWlhKcFpYTW9YMk52Ym1OaGRDazdYRzVjYmlBZ0lDQmhjM2x1WXk1M2FHbHNjM1FnUFNCbWRXNWpkR2x2YmlBb2RHVnpkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdZMkZzYkdKaFkyc2dmSHdnYm05dmNEdGNiaUFnSUNBZ0lDQWdhV1lnS0hSbGMzUW9LU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUc1bGVIUWdQU0JmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1S0dWeWNpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFJsYzNRdVlYQndiSGtvZEdocGN5d2dZWEpuY3lrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYm1WNGRDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2lodVpYaDBLVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbVJ2VjJocGJITjBJRDBnWm5WdVkzUnBiMjRnS0dsMFpYSmhkRzl5TENCMFpYTjBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdZMkZzYkhNZ1BTQXdPMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWQyaHBiSE4wS0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ3NyWTJGc2JITWdQRDBnTVNCOGZDQjBaWE4wTG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJSDBzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMblZ1ZEdsc0lEMGdablZ1WTNScGIyNGdLSFJsYzNRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWQyaHBiSE4wS0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ0YwWlhOMExtRndjR3g1S0hSb2FYTXNJR0Z5WjNWdFpXNTBjeWs3WEc0Z0lDQWdJQ0FnSUgwc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1SdlZXNTBhV3dnUFNCbWRXNWpkR2x2YmlBb2FYUmxjbUYwYjNJc0lIUmxjM1FzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTVrYjFkb2FXeHpkQ2hwZEdWeVlYUnZjaXdnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdJWFJsYzNRdVlYQndiSGtvZEdocGN5d2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnZlN3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTVrZFhKcGJtY2dQU0JtZFc1amRHbHZiaUFvZEdWemRDd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1kyRnNiR0poWTJzZ2ZId2dibTl2Y0R0Y2JseHVJQ0FnSUNBZ0lDQjJZWElnYm1WNGRDQTlJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRvWlhKeUxDQmhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5NXdkWE5vS0dOb1pXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWlhOMExtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOUtUdGNibHh1SUNBZ0lDQWdJQ0IyWVhJZ1kyaGxZMnNnUFNCbWRXNWpkR2x2YmlobGNuSXNJSFJ5ZFhSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCcFppQW9kSEoxZEdncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaHVaWGgwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwN1hHNWNiaUFnSUNBZ0lDQWdkR1Z6ZENoamFHVmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtUnZSSFZ5YVc1bklEMGdablZ1WTNScGIyNGdLR2wwWlhKaGRHOXlMQ0IwWlhOMExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ1kyRnNiSE1nUFNBd08xeHVJQ0FnSUNBZ0lDQmhjM2x1WXk1a2RYSnBibWNvWm5WdVkzUnBiMjRvYm1WNGRDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR05oYkd4ekt5c2dQQ0F4S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JtVjRkQ2h1ZFd4c0xDQjBjblZsS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkR1Z6ZEM1aGNIQnNlU2gwYUdsekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmY1hWbGRXVW9kMjl5YTJWeUxDQmpiMjVqZFhKeVpXNWplU3dnY0dGNWJHOWhaQ2tnZTF4dUlDQWdJQ0FnSUNCcFppQW9ZMjl1WTNWeWNtVnVZM2tnUFQwZ2JuVnNiQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1WTNWeWNtVnVZM2tnUFNBeE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR1ZzYzJVZ2FXWW9ZMjl1WTNWeWNtVnVZM2tnUFQwOUlEQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblEyOXVZM1Z5Y21WdVkza2diWFZ6ZENCdWIzUWdZbVVnZW1WeWJ5Y3BPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUY5cGJuTmxjblFvY1N3Z1pHRjBZU3dnY0c5ekxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR05oYkd4aVlXTnJJQ0U5SUc1MWJHd2dKaVlnZEhsd1pXOW1JR05oYkd4aVlXTnJJQ0U5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0owWVhOcklHTmhiR3hpWVdOcklHMTFjM1FnWW1VZ1lTQm1kVzVqZEdsdmJsd2lLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhFdWMzUmhjblJsWkNBOUlIUnlkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVY5cGMwRnljbUY1S0dSaGRHRXBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlTQTlJRnRrWVhSaFhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtS0dSaGRHRXViR1Z1WjNSb0lEMDlQU0F3SUNZbUlIRXVhV1JzWlNncEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMeThnWTJGc2JDQmtjbUZwYmlCcGJXMWxaR2xoZEdWc2VTQnBaaUIwYUdWeVpTQmhjbVVnYm04Z2RHRnphM05jYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWMyVjBTVzF0WldScFlYUmxLR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbVJ5WVdsdUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tHUmhkR0VzSUdaMWJtTjBhVzl1S0hSaGMyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2FYUmxiU0E5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ2RHRnpheXhjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzNklHTmhiR3hpWVdOcklIeDhJRzV2YjNCY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hCdmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuUmhjMnR6TG5WdWMyaHBablFvYVhSbGJTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1M1MFlYTnJjeTV3ZFhOb0tHbDBaVzBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h4TG5SaGMydHpMbXhsYm1kMGFDQTlQVDBnY1M1amIyNWpkWEp5Wlc1amVTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuTmhkSFZ5WVhSbFpDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1lYTjVibU11YzJWMFNXMXRaV1JwWVhSbEtIRXVjSEp2WTJWemN5azdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWDI1bGVIUW9jU3dnZEdGemEzTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlncGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHZjbXRsY25NZ0xUMGdNVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1lYSm5jeUE5SUdGeVozVnRaVzUwY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tIUmhjMnR6TENCbWRXNWpkR2x2YmlBb2RHRnpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBZWE5yTG1OaGJHeGlZV05yTG1Gd2NHeDVLSFJoYzJzc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h4TG5SaGMydHpMbXhsYm1kMGFDQXJJSGR2Y210bGNuTWdQVDA5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1M1a2NtRnBiaWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuQnliMk5sYzNNb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0IyWVhJZ2QyOXlhMlZ5Y3lBOUlEQTdYRzRnSUNBZ0lDQWdJSFpoY2lCeElEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHRnphM002SUZ0ZExGeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dVkzVnljbVZ1WTNrNklHTnZibU4xY25KbGJtTjVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2NHRjViRzloWkRvZ2NHRjViRzloWkN4Y2JpQWdJQ0FnSUNBZ0lDQWdJSE5oZEhWeVlYUmxaRG9nYm05dmNDeGNiaUFnSUNBZ0lDQWdJQ0FnSUdWdGNIUjVPaUJ1YjI5d0xGeHVJQ0FnSUNBZ0lDQWdJQ0FnWkhKaGFXNDZJRzV2YjNBc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J6ZEdGeWRHVmtPaUJtWVd4elpTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhCaGRYTmxaRG9nWm1Gc2MyVXNYRzRnSUNBZ0lDQWdJQ0FnSUNCd2RYTm9PaUJtZFc1amRHbHZiaUFvWkdGMFlTd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmYVc1elpYSjBLSEVzSUdSaGRHRXNJR1poYkhObExDQmpZV3hzWW1GamF5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnYTJsc2JEb2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdVpISmhhVzRnUFNCdWIyOXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1ZEdGemEzTWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQjFibk5vYVdaME9pQm1kVzVqZEdsdmJpQW9aR0YwWVN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmZhVzV6WlhKMEtIRXNJR1JoZEdFc0lIUnlkV1VzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQndjbTlqWlhOek9pQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tDRnhMbkJoZFhObFpDQW1KaUIzYjNKclpYSnpJRHdnY1M1amIyNWpkWEp5Wlc1amVTQW1KaUJ4TG5SaGMydHpMbXhsYm1kMGFDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCM2FHbHNaU2gzYjNKclpYSnpJRHdnY1M1amIyNWpkWEp5Wlc1amVTQW1KaUJ4TG5SaGMydHpMbXhsYm1kMGFDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnZEdGemEzTWdQU0J4TG5CaGVXeHZZV1FnUDF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVkR0Z6YTNNdWMzQnNhV05sS0RBc0lIRXVjR0Y1Ykc5aFpDa2dPbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWRHRnphM011YzNCc2FXTmxLREFzSUhFdWRHRnphM011YkdWdVozUm9LVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHUmhkR0VnUFNCZmJXRndLSFJoYzJ0ekxDQm1kVzVqZEdsdmJpQW9kR0Z6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQjBZWE5yTG1SaGRHRTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NTNWxiWEIwZVNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QyOXlhMlZ5Y3lBclBTQXhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaUlEMGdiMjVzZVY5dmJtTmxLRjl1WlhoMEtIRXNJSFJoYzJ0ektTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNiM0pyWlhJb1pHRjBZU3dnWTJJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxibWQwYURvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnhMblJoYzJ0ekxteGxibWQwYUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnlkVzV1YVc1bk9pQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSGR2Y210bGNuTTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdSc1pUb2dablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEV1ZEdGemEzTXViR1Z1WjNSb0lDc2dkMjl5YTJWeWN5QTlQVDBnTUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQndZWFZ6WlRvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1Y0dGMWMyVmtJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJXVTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jUzV3WVhWelpXUWdQVDA5SUdaaGJITmxLU0I3SUhKbGRIVnlianNnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWNHRjFjMlZrSUQwZ1ptRnNjMlU3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISmxjM1Z0WlVOdmRXNTBJRDBnVFdGMGFDNXRhVzRvY1M1amIyNWpkWEp5Wlc1amVTd2djUzUwWVhOcmN5NXNaVzVuZEdncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJRTVsWldRZ2RHOGdZMkZzYkNCeExuQnliMk5sYzNNZ2IyNWpaU0J3WlhJZ1kyOXVZM1Z5Y21WdWRGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJSGR2Y210bGNpQjBieUJ3Y21WelpYSjJaU0JtZFd4c0lHTnZibU4xY25KbGJtTjVJR0ZtZEdWeUlIQmhkWE5sWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWm05eUlDaDJZWElnZHlBOUlERTdJSGNnUEQwZ2NtVnpkVzFsUTI5MWJuUTdJSGNyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCeE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbkYxWlhWbElEMGdablZ1WTNScGIyNGdLSGR2Y210bGNpd2dZMjl1WTNWeWNtVnVZM2twSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEVnUFNCZmNYVmxkV1VvWm5WdVkzUnBiMjRnS0dsMFpXMXpMQ0JqWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnlLR2wwWlcxeld6QmRMQ0JqWWlrN1hHNGdJQ0FnSUNBZ0lIMHNJR052Ym1OMWNuSmxibU41TENBeEtUdGNibHh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWNISnBiM0pwZEhsUmRXVjFaU0E5SUdaMWJtTjBhVzl1SUNoM2IzSnJaWElzSUdOdmJtTjFjbkpsYm1ONUtTQjdYRzVjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWDJOdmJYQmhjbVZVWVhOcmN5aGhMQ0JpS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhMbkJ5YVc5eWFYUjVJQzBnWWk1d2NtbHZjbWwwZVR0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJRjlpYVc1aGNubFRaV0Z5WTJnb2MyVnhkV1Z1WTJVc0lHbDBaVzBzSUdOdmJYQmhjbVVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaVpXY2dQU0F0TVN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJtUWdQU0J6WlhGMVpXNWpaUzVzWlc1bmRHZ2dMU0F4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tHSmxaeUE4SUdWdVpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCdGFXUWdQU0JpWldjZ0t5QW9LR1Z1WkNBdElHSmxaeUFySURFcElENCtQaUF4S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZMjl0Y0dGeVpTaHBkR1Z0TENCelpYRjFaVzVqWlZ0dGFXUmRLU0ErUFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdKbFp5QTlJRzFwWkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxibVFnUFNCdGFXUWdMU0F4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaVpXYzdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCZmFXNXpaWEowS0hFc0lHUmhkR0VzSUhCeWFXOXlhWFI1TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTmhiR3hpWVdOcklDRTlJRzUxYkd3Z0ppWWdkSGx3Wlc5bUlHTmhiR3hpWVdOcklDRTlQU0JjSW1aMWJtTjBhVzl1WENJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb1hDSjBZWE5ySUdOaGJHeGlZV05ySUcxMWMzUWdZbVVnWVNCbWRXNWpkR2x2Ymx3aUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSEV1YzNSaGNuUmxaQ0E5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9JVjlwYzBGeWNtRjVLR1JoZEdFcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVNBOUlGdGtZWFJoWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1LR1JoZEdFdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1kyRnNiQ0JrY21GcGJpQnBiVzFsWkdsaGRHVnNlU0JwWmlCMGFHVnlaU0JoY21VZ2JtOGdkR0Z6YTNOY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWVhONWJtTXVjMlYwU1cxdFpXUnBZWFJsS0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG1SeVlXbHVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LR1JoZEdFc0lHWjFibU4wYVc5dUtIUmhjMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdhWFJsYlNBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlUb2dkR0Z6YXl4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjSEpwYjNKcGRIazZJSEJ5YVc5eWFYUjVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXpvZ2RIbHdaVzltSUdOaGJHeGlZV05ySUQwOVBTQW5ablZ1WTNScGIyNG5JRDhnWTJGc2JHSmhZMnNnT2lCdWIyOXdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWRHRnphM011YzNCc2FXTmxLRjlpYVc1aGNubFRaV0Z5WTJnb2NTNTBZWE5yY3l3Z2FYUmxiU3dnWDJOdmJYQmhjbVZVWVhOcmN5a2dLeUF4TENBd0xDQnBkR1Z0S1R0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h4TG5SaGMydHpMbXhsYm1kMGFDQTlQVDBnY1M1amIyNWpkWEp5Wlc1amVTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuTmhkSFZ5WVhSbFpDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdMeThnVTNSaGNuUWdkMmwwYUNCaElHNXZjbTFoYkNCeGRXVjFaVnh1SUNBZ0lDQWdJQ0IyWVhJZ2NTQTlJR0Z6ZVc1akxuRjFaWFZsS0hkdmNtdGxjaXdnWTI5dVkzVnljbVZ1WTNrcE8xeHVYRzRnSUNBZ0lDQWdJQzh2SUU5MlpYSnlhV1JsSUhCMWMyZ2dkRzhnWVdOalpYQjBJSE5sWTI5dVpDQndZWEpoYldWMFpYSWdjbVZ3Y21WelpXNTBhVzVuSUhCeWFXOXlhWFI1WEc0Z0lDQWdJQ0FnSUhFdWNIVnphQ0E5SUdaMWJtTjBhVzl1SUNoa1lYUmhMQ0J3Y21sdmNtbDBlU3dnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRjlwYm5ObGNuUW9jU3dnWkdGMFlTd2djSEpwYjNKcGRIa3NJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQXZMeUJTWlcxdmRtVWdkVzV6YUdsbWRDQm1kVzVqZEdsdmJseHVJQ0FnSUNBZ0lDQmtaV3hsZEdVZ2NTNTFibk5vYVdaME8xeHVYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnhPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1allYSm5ieUE5SUdaMWJtTjBhVzl1SUNoM2IzSnJaWElzSUhCaGVXeHZZV1FwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5eGRXVjFaU2gzYjNKclpYSXNJREVzSUhCaGVXeHZZV1FwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWTI5dWMyOXNaVjltYmlodVlXMWxLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1SUNobWJpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm00dVlYQndiSGtvYm5Wc2JDd2dZWEpuY3k1amIyNWpZWFFvVzE5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHVnljaXdnWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoMGVYQmxiMllnWTI5dWMyOXNaU0E5UFQwZ0oyOWlhbVZqZENjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTnZibk52YkdVdVpYSnliM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCcFppQW9ZMjl1YzI5c1pWdHVZVzFsWFNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1gyRnljbUY1UldGamFDaGhjbWR6TENCbWRXNWpkR2x2YmlBb2VDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1ZiYm1GdFpWMG9lQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBYU2twTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNGdJQ0FnWVhONWJtTXViRzluSUQwZ1gyTnZibk52YkdWZlptNG9KMnh2WnljcE8xeHVJQ0FnSUdGemVXNWpMbVJwY2lBOUlGOWpiMjV6YjJ4bFgyWnVLQ2RrYVhJbktUdGNiaUFnSUNBdkttRnplVzVqTG1sdVptOGdQU0JmWTI5dWMyOXNaVjltYmlnbmFXNW1ieWNwTzF4dUlDQWdJR0Z6ZVc1akxuZGhjbTRnUFNCZlkyOXVjMjlzWlY5bWJpZ25kMkZ5YmljcE8xeHVJQ0FnSUdGemVXNWpMbVZ5Y205eUlEMGdYMk52Ym5OdmJHVmZabTRvSjJWeWNtOXlKeWs3S2k5Y2JseHVJQ0FnSUdGemVXNWpMbTFsYlc5cGVtVWdQU0JtZFc1amRHbHZiaUFvWm00c0lHaGhjMmhsY2lrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnYldWdGJ5QTlJSHQ5TzF4dUlDQWdJQ0FnSUNCMllYSWdjWFZsZFdWeklEMGdlMzA3WEc0Z0lDQWdJQ0FnSUdoaGMyaGxjaUE5SUdoaGMyaGxjaUI4ZkNCcFpHVnVkR2wwZVR0Y2JpQWdJQ0FnSUNBZ2RtRnlJRzFsYlc5cGVtVmtJRDBnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlCdFpXMXZhWHBsWkNoaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWTJGc2JHSmhZMnNnUFNCaGNtZHpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHdGxlU0E5SUdoaGMyaGxjaTVoY0hCc2VTaHVkV3hzTENCaGNtZHpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hyWlhrZ2FXNGdiV1Z0YnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG01bGVIUlVhV05yS0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnN1WVhCd2JIa29iblZzYkN3Z2JXVnRiMXRyWlhsZEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdhV1lnS0d0bGVTQnBiaUJ4ZFdWMVpYTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4ZFdWMVpYTmJhMlY1WFM1d2RYTm9LR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEYxWlhWbGMxdHJaWGxkSUQwZ1cyTmhiR3hpWVdOclhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1iaTVoY0hCc2VTaHVkV3hzTENCaGNtZHpMbU52Ym1OaGRDaGJYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdFpXMXZXMnRsZVYwZ1BTQmhjbWR6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnY1NBOUlIRjFaWFZsYzF0clpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1pXeGxkR1VnY1hWbGRXVnpXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd0xDQnNJRDBnY1M1c1pXNW5kR2c3SUdrZ1BDQnNPeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRmJhVjB1WVhCd2JIa29iblZzYkN3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVjBwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lHMWxiVzlwZW1Wa0xtMWxiVzhnUFNCdFpXMXZPMXh1SUNBZ0lDQWdJQ0J0WlcxdmFYcGxaQzUxYm0xbGJXOXBlbVZrSUQwZ1ptNDdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnRaVzF2YVhwbFpEdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11ZFc1dFpXMXZhWHBsSUQwZ1puVnVZM1JwYjI0Z0tHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdLR1p1TG5WdWJXVnRiMmw2WldRZ2ZId2dabTRwTG1Gd2NHeDVLRzUxYkd3c0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjkwYVcxbGN5aHRZWEJ3WlhJcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaGpiM1Z1ZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCdFlYQndaWElvWDNKaGJtZGxLR052ZFc1MEtTd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NTBhVzFsY3lBOUlGOTBhVzFsY3loaGMzbHVZeTV0WVhBcE8xeHVJQ0FnSUdGemVXNWpMblJwYldWelUyVnlhV1Z6SUQwZ1gzUnBiV1Z6S0dGemVXNWpMbTFoY0ZObGNtbGxjeWs3WEc0Z0lDQWdZWE41Ym1NdWRHbHRaWE5NYVcxcGRDQTlJR1oxYm1OMGFXOXVJQ2hqYjNWdWRDd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWJXRndUR2x0YVhRb1gzSmhibWRsS0dOdmRXNTBLU3dnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxuTmxjU0E5SUdaMWJtTjBhVzl1SUNndktpQm1kVzVqZEdsdmJuTXVMaTRnS2k4cElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdadWN5QTlJR0Z5WjNWdFpXNTBjenRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUIwYUdGMElEMGdkR2hwY3p0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuYzF0aGNtZHpMbXhsYm1kMGFDQXRJREZkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hSNWNHVnZaaUJqWVd4c1ltRmpheUE5UFNBblpuVnVZM1JwYjI0bktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQnViMjl3TzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1eVpXUjFZMlVvWm01ekxDQmhjbWR6TENCbWRXNWpkR2x2YmlBb2JtVjNZWEpuY3l3Z1ptNHNJR05pS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1ptNHVZWEJ3Ykhrb2RHaGhkQ3dnYm1WM1lYSm5jeTVqYjI1allYUW9XMTl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dWeWNpd2dibVY0ZEdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySW9aWEp5TENCdVpYaDBZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTbGRLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z0tHVnljaXdnY21WemRXeDBjeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yTG1Gd2NHeDVLSFJvWVhRc0lGdGxjbkpkTG1OdmJtTmhkQ2h5WlhOMWJIUnpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbU52YlhCdmMyVWdQU0JtZFc1amRHbHZiaUFvTHlvZ1puVnVZM1JwYjI1ekxpNHVJQ292S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTV6WlhFdVlYQndiSGtvYm5Wc2JDd2dRWEp5WVhrdWNISnZkRzkwZVhCbExuSmxkbVZ5YzJVdVkyRnNiQ2hoY21kMWJXVnVkSE1wS1R0Y2JpQWdJQ0I5TzF4dVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZllYQndiSGxGWVdOb0tHVmhZMmhtYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpaG1ibk1zSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJuYnlBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUIwYUdGMElEMGdkR2hwY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZMkZzYkdKaFkyc2dQU0JoY21kekxuQnZjQ2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJsWVdOb1ptNG9abTV6TENCbWRXNWpkR2x2YmlBb1ptNHNJRjhzSUdOaUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadUxtRndjR3g1S0hSb1lYUXNJR0Z5WjNNdVkyOXVZMkYwS0Z0allsMHBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVozTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHZHZMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHZHZPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1aGNIQnNlVVZoWTJnZ1BTQmZZWEJ3YkhsRllXTm9LR0Z6ZVc1akxtVmhZMmhQWmlrN1hHNGdJQ0FnWVhONWJtTXVZWEJ3YkhsRllXTm9VMlZ5YVdWeklEMGdYMkZ3Y0d4NVJXRmphQ2hoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1wTzF4dVhHNWNiaUFnSUNCaGMzbHVZeTVtYjNKbGRtVnlJRDBnWm5WdVkzUnBiMjRnS0dadUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ1pHOXVaU0E5SUc5dWJIbGZiMjVqWlNoallXeHNZbUZqYXlCOGZDQnViMjl3S1R0Y2JpQWdJQ0FnSUNBZ2RtRnlJSFJoYzJzZ1BTQmxibk4xY21WQmMzbHVZeWhtYmlrN1hHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHNWxlSFFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdSdmJtVW9aWEp5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnNvYm1WNGRDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnYm1WNGRDZ3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmxibk4xY21WQmMzbHVZeWhtYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHRnlaM011Y0hWemFDaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHbHVibVZ5UVhKbmN5QTlJR0Z5WjNWdFpXNTBjenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2MzbHVZeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9ablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnN1WVhCd2JIa29iblZzYkN3Z2FXNXVaWEpCY21kektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc3VZWEJ3Ykhrb2JuVnNiQ3dnYVc1dVpYSkJjbWR6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCemVXNWpJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadUxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNsdVl5QTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1bGJuTjFjbVZCYzNsdVl5QTlJR1Z1YzNWeVpVRnplVzVqTzF4dVhHNGdJQ0FnWVhONWJtTXVZMjl1YzNSaGJuUWdQU0JmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1S0haaGJIVmxjeWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdZWEpuY3lBOUlGdHVkV3hzWFM1amIyNWpZWFFvZG1Gc2RXVnpLVHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2hqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOckxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMHBPMXh1WEc0Z0lDQWdZWE41Ym1NdWQzSmhjRk41Ym1NZ1BWeHVJQ0FnSUdGemVXNWpMbUZ6ZVc1amFXWjVJRDBnWm5WdVkzUnBiMjRnWVhONWJtTnBabmtvWm5WdVl5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05oYkd4aVlXTnJJRDBnWVhKbmN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCeVpYTjFiSFE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGMzVnNkQ0E5SUdaMWJtTXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2FXWWdjbVZ6ZFd4MElHbHpJRkJ5YjIxcGMyVWdiMkpxWldOMFhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1gybHpUMkpxWldOMEtISmxjM1ZzZENrZ0ppWWdkSGx3Wlc5bUlISmxjM1ZzZEM1MGFHVnVJRDA5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUXVkR2hsYmlobWRXNWpkR2x2YmloMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCMllXeDFaU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNsYlhDSmpZWFJqYUZ3aVhTaG1kVzVqZEdsdmJpaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5TG0xbGMzTmhaMlVnUHlCbGNuSWdPaUJ1WlhjZ1JYSnliM0lvWlhKeUtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dzSUhKbGMzVnNkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0F2THlCT2IyUmxMbXB6WEc0Z0lDQWdhV1lnS0hSNWNHVnZaaUJ0YjJSMWJHVWdQVDA5SUNkdlltcGxZM1FuSUNZbUlHMXZaSFZzWlM1bGVIQnZjblJ6S1NCN1hHNGdJQ0FnSUNBZ0lHMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1lYTjVibU03WEc0Z0lDQWdmVnh1SUNBZ0lDOHZJRUZOUkNBdklGSmxjWFZwY21WS1UxeHVJQ0FnSUdWc2MyVWdhV1lnS0hSNWNHVnZaaUJrWldacGJtVWdQVDA5SUNkbWRXNWpkR2x2YmljZ0ppWWdaR1ZtYVc1bExtRnRaQ2tnZTF4dUlDQWdJQ0FnSUNCa1pXWnBibVVvVzEwc0lHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZenRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlZ4dUlDQWdJQzh2SUdsdVkyeDFaR1ZrSUdScGNtVmpkR3g1SUhacFlTQThjMk55YVhCMFBpQjBZV2RjYmlBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2NtOXZkQzVoYzNsdVl5QTlJR0Z6ZVc1ak8xeHVJQ0FnSUgxY2JseHVmU2dwS1R0Y2JpSmRmUT09Il19
},{"_process":"/home/cheton/github/webappengine/node_modules/browserify/node_modules/process/browser.js"}],"/home/cheton/github/webappengine/web/vendor/i18next/i18next.js":[function(require,module,exports){
// i18next, v1.10.2
// Copyright (c)2015 Jan Mühlemann (jamuhl).
// Distributed under MIT license
"use strict";

(function (root) {

    // add indexOf to non ECMA-262 standard compliant browsers
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n != n) {
                    // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n != 0 && n != Infinity && n != -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

    // add lastIndexOf to non ECMA-262 standard compliant browsers
    if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
            "use strict";
            if (this == null) {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = len;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) {
                    n = 0;
                } else if (n != 0 && n != 1 / 0 && n != -(1 / 0)) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }
            var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
            for (; k >= 0; k--) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }

    // Add string trim for IE8.
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    var $ = root.jQuery || root.Zepto,
        i18n = {},
        resStore = {},
        currentLng,
        replacementCounter = 0,
        languages = [],
        initialized = false,
        sync = {},
        conflictReference = null;

    // Export the i18next object for **CommonJS**.
    // If we're not in CommonJS, add `i18n` to the
    // global object or to jquery.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = i18n;
    } else {
        if ($) {
            $.i18n = $.i18n || i18n;
        }

        if (root.i18n) {
            conflictReference = root.i18n;
        }
        root.i18n = i18n;
    }
    sync = {

        load: function load(lngs, options, cb) {
            if (options.useLocalStorage) {
                sync._loadLocal(lngs, options, function (err, store) {
                    var missingLngs = [];
                    for (var i = 0, len = lngs.length; i < len; i++) {
                        if (!store[lngs[i]]) missingLngs.push(lngs[i]);
                    }

                    if (missingLngs.length > 0) {
                        sync._fetch(missingLngs, options, function (err, fetched) {
                            f.extend(store, fetched);
                            sync._storeLocal(fetched);

                            cb(err, store);
                        });
                    } else {
                        cb(err, store);
                    }
                });
            } else {
                sync._fetch(lngs, options, function (err, store) {
                    cb(err, store);
                });
            }
        },

        _loadLocal: function _loadLocal(lngs, options, cb) {
            var store = {},
                nowMS = new Date().getTime();

            if (window.localStorage) {

                var todo = lngs.length;

                f.each(lngs, function (key, lng) {
                    var local = f.localStorage.getItem('res_' + lng);

                    if (local) {
                        local = JSON.parse(local);

                        if (local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS) {
                            store[lng] = local;
                        }
                    }

                    todo--; // wait for all done befor callback
                    if (todo === 0) cb(null, store);
                });
            }
        },

        _storeLocal: function _storeLocal(store) {
            if (window.localStorage) {
                for (var m in store) {
                    store[m].i18nStamp = new Date().getTime();
                    f.localStorage.setItem('res_' + m, JSON.stringify(store[m]));
                }
            }
            return;
        },

        _fetch: function _fetch(lngs, options, cb) {
            var ns = options.ns,
                store = {};

            if (!options.dynamicLoad) {
                var todo = ns.namespaces.length * lngs.length,
                    errors;

                // load each file individual
                f.each(ns.namespaces, function (nsIndex, nsValue) {
                    f.each(lngs, function (lngIndex, lngValue) {

                        // Call this once our translation has returned.
                        var loadComplete = function loadComplete(err, data) {
                            if (err) {
                                errors = errors || [];
                                errors.push(err);
                            }
                            store[lngValue] = store[lngValue] || {};
                            store[lngValue][nsValue] = data;

                            todo--; // wait for all done befor callback
                            if (todo === 0) cb(errors, store);
                        };

                        if (typeof options.customLoad == 'function') {
                            // Use the specified custom callback.
                            options.customLoad(lngValue, nsValue, options, loadComplete);
                        } else {
                            //~ // Use our inbuilt sync.
                            sync._fetchOne(lngValue, nsValue, options, loadComplete);
                        }
                    });
                });
            } else {
                // Call this once our translation has returned.
                var loadComplete = function loadComplete(err, data) {
                    cb(err, data);
                };

                if (typeof options.customLoad == 'function') {
                    // Use the specified custom callback.
                    options.customLoad(lngs, ns.namespaces, options, loadComplete);
                } else {
                    var url = applyReplacement(options.resGetPath, { lng: lngs.join('+'), ns: ns.namespaces.join('+') });
                    // load all needed stuff once
                    f.ajax({
                        url: url,
                        cache: options.cache,
                        success: function success(data, status, xhr) {
                            f.log('loaded: ' + url);
                            loadComplete(null, data);
                        },
                        error: function error(xhr, status, _error) {
                            f.log('failed loading: ' + url);
                            loadComplete('failed loading resource.json error: ' + _error);
                        },
                        dataType: "json",
                        async: options.getAsync,
                        timeout: options.ajaxTimeout
                    });
                }
            }
        },

        _fetchOne: function _fetchOne(lng, ns, options, done) {
            var url = applyReplacement(options.resGetPath, { lng: lng, ns: ns });
            f.ajax({
                url: url,
                cache: options.cache,
                success: function success(data, status, xhr) {
                    f.log('loaded: ' + url);
                    done(null, data);
                },
                error: function error(xhr, status, _error2) {
                    if (status && status == 200 || xhr && xhr.status && xhr.status == 200) {
                        // file loaded but invalid json, stop waste time !
                        f.error('There is a typo in: ' + url);
                    } else if (status && status == 404 || xhr && xhr.status && xhr.status == 404) {
                        f.log('Does not exist: ' + url);
                    } else {
                        var theStatus = status ? status : xhr && xhr.status ? xhr.status : null;
                        f.log(theStatus + ' when loading ' + url);
                    }

                    done(_error2, {});
                },
                dataType: "json",
                async: options.getAsync,
                timeout: options.ajaxTimeout
            });
        },

        postMissing: function postMissing(lng, ns, key, defaultValue, lngs) {
            var payload = {};
            payload[key] = defaultValue;

            var urls = [];

            if (o.sendMissingTo === 'fallback' && o.fallbackLng[0] !== false) {
                for (var i = 0; i < o.fallbackLng.length; i++) {
                    urls.push({ lng: o.fallbackLng[i], url: applyReplacement(o.resPostPath, { lng: o.fallbackLng[i], ns: ns }) });
                }
            } else if (o.sendMissingTo === 'current' || o.sendMissingTo === 'fallback' && o.fallbackLng[0] === false) {
                urls.push({ lng: lng, url: applyReplacement(o.resPostPath, { lng: lng, ns: ns }) });
            } else if (o.sendMissingTo === 'all') {
                for (var i = 0, l = lngs.length; i < l; i++) {
                    urls.push({ lng: lngs[i], url: applyReplacement(o.resPostPath, { lng: lngs[i], ns: ns }) });
                }
            }

            for (var y = 0, len = urls.length; y < len; y++) {
                var item = urls[y];
                f.ajax({
                    url: item.url,
                    type: o.sendType,
                    data: payload,
                    success: function success(data, status, xhr) {
                        f.log('posted missing key \'' + key + '\' to: ' + item.url);

                        // add key to resStore
                        var keys = key.split('.');
                        var x = 0;
                        var value = resStore[item.lng][ns];
                        while (keys[x]) {
                            if (x === keys.length - 1) {
                                value = value[keys[x]] = defaultValue;
                            } else {
                                value = value[keys[x]] = value[keys[x]] || {};
                            }
                            x++;
                        }
                    },
                    error: function error(xhr, status, _error3) {
                        f.log('failed posting missing key \'' + key + '\' to: ' + item.url);
                    },
                    dataType: "json",
                    async: o.postAsync,
                    timeout: o.ajaxTimeout
                });
            }
        },

        reload: reload
    };
    // defaults
    var o = {
        lng: undefined,
        load: 'all',
        preload: [],
        lowerCaseLng: false,
        returnObjectTrees: false,
        fallbackLng: ['dev'],
        fallbackNS: [],
        detectLngQS: 'setLng',
        detectLngFromLocalStorage: false,
        ns: {
            namespaces: ['translation'],
            defaultNs: 'translation'
        },
        fallbackOnNull: true,
        fallbackOnEmpty: false,
        fallbackToDefaultNS: false,
        showKeyIfEmpty: false,
        nsseparator: ':',
        keyseparator: '.',
        selectorAttr: 'data-i18n',
        debug: false,

        resGetPath: 'locales/__lng__/__ns__.json',
        resPostPath: 'locales/add/__lng__/__ns__',

        getAsync: true,
        postAsync: true,

        resStore: undefined,
        useLocalStorage: false,
        localStorageExpirationTime: 7 * 24 * 60 * 60 * 1000,

        dynamicLoad: false,
        sendMissing: false,
        sendMissingTo: 'fallback', // current | all
        sendType: 'POST',

        interpolationPrefix: '__',
        interpolationSuffix: '__',
        defaultVariables: false,
        reusePrefix: '$t(',
        reuseSuffix: ')',
        pluralSuffix: '_plural',
        pluralNotFound: ['plural_not_found', Math.random()].join(''),
        contextNotFound: ['context_not_found', Math.random()].join(''),
        escapeInterpolation: false,
        indefiniteSuffix: '_indefinite',
        indefiniteNotFound: ['indefinite_not_found', Math.random()].join(''),

        setJqueryExt: true,
        defaultValueFromContent: true,
        useDataAttrOptions: false,
        cookieExpirationTime: undefined,
        useCookie: true,
        cookieName: 'i18next',
        cookieDomain: undefined,

        objectTreeKeyHandler: undefined,
        postProcess: undefined,
        parseMissingKey: undefined,
        missingKeyHandler: sync.postMissing,
        ajaxTimeout: 0,

        shortcutFunction: 'sprintf' // or: defaultValue
    };
    function _extend(target, source) {
        if (!source || typeof source === 'function') {
            return target;
        }

        for (var attr in source) {
            target[attr] = source[attr];
        }
        return target;
    }

    function _deepExtend(target, source) {
        for (var prop in source) if (prop in target) _deepExtend(target[prop], source[prop]);else target[prop] = source[prop];
        return target;
    }

    function _each(object, callback, args) {
        var name,
            i = 0,
            length = object.length,
            isObj = length === undefined || Object.prototype.toString.apply(object) !== '[object Array]' || typeof object === "function";

        if (args) {
            if (isObj) {
                for (name in object) {
                    if (callback.apply(object[name], args) === false) {
                        break;
                    }
                }
            } else {
                for (; i < length;) {
                    if (callback.apply(object[i++], args) === false) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
                if (isObj) {
                    for (name in object) {
                        if (callback.call(object[name], name, object[name]) === false) {
                            break;
                        }
                    }
                } else {
                    for (; i < length;) {
                        if (callback.call(object[i], i, object[i++]) === false) {
                            break;
                        }
                    }
                }
            }

        return object;
    }

    var _entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function _escape(data) {
        if (typeof data === 'string') {
            return data.replace(/[&<>"'\/]/g, function (s) {
                return _entityMap[s];
            });
        } else {
            return data;
        }
    }

    function _ajax(options) {

        // v0.5.0 of https://github.com/goloroden/http.js
        var getXhr = function getXhr(callback) {
            // Use the native XHR object if the browser supports it.
            if (window.XMLHttpRequest) {
                return callback(null, new XMLHttpRequest());
            } else if (window.ActiveXObject) {
                // In Internet Explorer check for ActiveX versions of the XHR object.
                try {
                    return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
                } catch (e) {
                    return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
                }
            }

            // If no XHR support was found, throw an error.
            return callback(new Error());
        };

        var encodeUsingUrlEncoding = function encodeUsingUrlEncoding(data) {
            if (typeof data === 'string') {
                return data;
            }

            var result = [];
            for (var dataItem in data) {
                if (data.hasOwnProperty(dataItem)) {
                    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
                }
            }

            return result.join('&');
        };

        var utf8 = function utf8(text) {
            text = text.replace(/\r\n/g, '\n');
            var result = '';

            for (var i = 0; i < text.length; i++) {
                var c = text.charCodeAt(i);

                if (c < 128) {
                    result += String.fromCharCode(c);
                } else if (c > 127 && c < 2048) {
                    result += String.fromCharCode(c >> 6 | 192);
                    result += String.fromCharCode(c & 63 | 128);
                } else {
                    result += String.fromCharCode(c >> 12 | 224);
                    result += String.fromCharCode(c >> 6 & 63 | 128);
                    result += String.fromCharCode(c & 63 | 128);
                }
            }

            return result;
        };

        var base64 = function base64(text) {
            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

            text = utf8(text);
            var result = '',
                chr1,
                chr2,
                chr3,
                enc1,
                enc2,
                enc3,
                enc4,
                i = 0;

            do {
                chr1 = text.charCodeAt(i++);
                chr2 = text.charCodeAt(i++);
                chr3 = text.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                result += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            } while (i < text.length);

            return result;
        };

        var mergeHeaders = function mergeHeaders() {
            // Use the first header object as base.
            var result = arguments[0];

            // Iterate through the remaining header objects and add them.
            for (var i = 1; i < arguments.length; i++) {
                var currentHeaders = arguments[i];
                for (var header in currentHeaders) {
                    if (currentHeaders.hasOwnProperty(header)) {
                        result[header] = currentHeaders[header];
                    }
                }
            }

            // Return the merged headers.
            return result;
        };

        var ajax = function ajax(method, url, options, callback) {
            // Adjust parameters.
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }

            // Set default parameter values.
            options.cache = options.cache || false;
            options.data = options.data || {};
            options.headers = options.headers || {};
            options.jsonp = options.jsonp || false;
            options.async = options.async === undefined ? true : options.async;

            // Merge the various header objects.
            var headers = mergeHeaders({
                'accept': '*/*',
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }, ajax.headers, options.headers);

            // Encode the data according to the content-type.
            var payload;
            if (headers['content-type'] === 'application/json') {
                payload = JSON.stringify(options.data);
            } else {
                payload = encodeUsingUrlEncoding(options.data);
            }

            // Specially prepare GET requests: Setup the query string, handle caching and make a JSONP call
            // if neccessary.
            if (method === 'GET') {
                // Setup the query string.
                var queryString = [];
                if (payload) {
                    queryString.push(payload);
                    payload = null;
                }

                // Handle caching.
                if (!options.cache) {
                    queryString.push('_=' + new Date().getTime());
                }

                // If neccessary prepare the query string for a JSONP call.
                if (options.jsonp) {
                    queryString.push('callback=' + options.jsonp);
                    queryString.push('jsonp=' + options.jsonp);
                }

                // Merge the query string and attach it to the url.
                queryString = queryString.join('&');
                if (queryString.length > 1) {
                    if (url.indexOf('?') > -1) {
                        url += '&' + queryString;
                    } else {
                        url += '?' + queryString;
                    }
                }

                // Make a JSONP call if neccessary.
                if (options.jsonp) {
                    var head = document.getElementsByTagName('head')[0];
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = url;
                    head.appendChild(script);
                    return;
                }
            }

            // Since we got here, it is no JSONP request, so make a normal XHR request.
            getXhr(function (err, xhr) {
                if (err) return callback(err);

                // Open the request.
                xhr.open(method, url, options.async);

                // Set the request headers.
                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header, headers[header]);
                    }
                }

                // Handle the request events.
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        var data = xhr.responseText || '';

                        // If no callback is given, return.
                        if (!callback) {
                            return;
                        }

                        // Return an object that provides access to the data as text and JSON.
                        callback(xhr.status, {
                            text: function text() {
                                return data;
                            },

                            json: function json() {
                                try {
                                    return JSON.parse(data);
                                } catch (e) {
                                    f.error('Can not parse JSON. URL: ' + url);
                                    return {};
                                }
                            }
                        });
                    }
                };

                // Actually send the XHR request.
                xhr.send(payload);
            });
        };

        // Define the external interface.
        var http = {
            authBasic: function authBasic(username, password) {
                ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
            },

            connect: function connect(url, options, callback) {
                return ajax('CONNECT', url, options, callback);
            },

            del: function del(url, options, callback) {
                return ajax('DELETE', url, options, callback);
            },

            get: function get(url, options, callback) {
                return ajax('GET', url, options, callback);
            },

            head: function head(url, options, callback) {
                return ajax('HEAD', url, options, callback);
            },

            headers: function headers(_headers) {
                ajax.headers = _headers || {};
            },

            isAllowed: function isAllowed(url, verb, callback) {
                this.options(url, function (status, data) {
                    callback(data.text().indexOf(verb) !== -1);
                });
            },

            options: function options(url, _options, callback) {
                return ajax('OPTIONS', url, _options, callback);
            },

            patch: function patch(url, options, callback) {
                return ajax('PATCH', url, options, callback);
            },

            post: function post(url, options, callback) {
                return ajax('POST', url, options, callback);
            },

            put: function put(url, options, callback) {
                return ajax('PUT', url, options, callback);
            },

            trace: function trace(url, options, callback) {
                return ajax('TRACE', url, options, callback);
            }
        };

        var methode = options.type ? options.type.toLowerCase() : 'get';

        http[methode](options.url, options, function (status, data) {
            // file: protocol always gives status code 0, so check for data
            if (status === 200 || status === 0 && data.text()) {
                options.success(data.json(), status, null);
            } else {
                options.error(data.text(), status, null);
            }
        });
    }

    var _cookie = {
        create: function create(name, value, minutes, domain) {
            var expires;
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime() + minutes * 60 * 1000);
                expires = "; expires=" + date.toGMTString();
            } else expires = "";
            domain = domain ? "domain=" + domain + ";" : "";
            document.cookie = name + "=" + value + expires + ";" + domain + "path=/";
        },

        read: function read(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },

        remove: function remove(name) {
            this.create(name, "", -1);
        }
    };

    var cookie_noop = {
        create: function create(name, value, minutes, domain) {},
        read: function read(name) {
            return null;
        },
        remove: function remove(name) {}
    };

    // move dependent functions to a container so that
    // they can be overriden easier in no jquery environment (node.js)
    var f = {
        extend: $ ? $.extend : _extend,
        deepExtend: _deepExtend,
        each: $ ? $.each : _each,
        ajax: $ ? $.ajax : typeof document !== 'undefined' ? _ajax : function () {},
        cookie: typeof document !== 'undefined' ? _cookie : cookie_noop,
        detectLanguage: detectLanguage,
        escape: _escape,
        log: function log(str) {
            if (o.debug && typeof console !== "undefined") console.log(str);
        },
        error: function error(str) {
            if (typeof console !== "undefined") console.error(str);
        },
        getCountyIndexOfLng: function getCountyIndexOfLng(lng) {
            var lng_index = 0;
            if (lng === 'nb-NO' || lng === 'nn-NO' || lng === 'nb-no' || lng === 'nn-no') lng_index = 1;
            return lng_index;
        },
        toLanguages: function toLanguages(lng, fallbackLng) {
            var log = this.log;

            fallbackLng = fallbackLng || o.fallbackLng;
            if (typeof fallbackLng === 'string') fallbackLng = [fallbackLng];

            function applyCase(l) {
                var ret = l;

                if (typeof l === 'string' && l.indexOf('-') > -1) {
                    var parts = l.split('-');

                    ret = o.lowerCaseLng ? parts[0].toLowerCase() + '-' + parts[1].toLowerCase() : parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
                } else {
                    ret = o.lowerCaseLng ? l.toLowerCase() : l;
                }

                return ret;
            }

            var languages = [];
            var whitelist = o.lngWhitelist || false;
            var addLanguage = function addLanguage(language) {
                //reject langs not whitelisted
                if (!whitelist || whitelist.indexOf(language) > -1) {
                    languages.push(language);
                } else {
                    log('rejecting non-whitelisted language: ' + language);
                }
            };
            if (typeof lng === 'string' && lng.indexOf('-') > -1) {
                var parts = lng.split('-');

                if (o.load !== 'unspecific') addLanguage(applyCase(lng));
                if (o.load !== 'current') addLanguage(applyCase(parts[this.getCountyIndexOfLng(lng)]));
            } else {
                addLanguage(applyCase(lng));
            }

            for (var i = 0; i < fallbackLng.length; i++) {
                if (languages.indexOf(fallbackLng[i]) === -1 && fallbackLng[i]) languages.push(applyCase(fallbackLng[i]));
            }
            return languages;
        },
        regexEscape: function regexEscape(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        },
        regexReplacementEscape: function regexReplacementEscape(strOrFn) {
            if (typeof strOrFn === 'string') {
                return strOrFn.replace(/\$/g, "$$$$");
            } else {
                return strOrFn;
            }
        },
        localStorage: {
            setItem: function setItem(key, value) {
                if (window.localStorage) {
                    try {
                        window.localStorage.setItem(key, value);
                    } catch (e) {
                        f.log('failed to set value for key "' + key + '" to localStorage.');
                    }
                }
            },
            getItem: function getItem(key, value) {
                if (window.localStorage) {
                    try {
                        return window.localStorage.getItem(key, value);
                    } catch (e) {
                        f.log('failed to get value for key "' + key + '" from localStorage.');
                        return undefined;
                    }
                }
            }
        }
    };
    function init(options, cb) {

        if (typeof options === 'function') {
            cb = options;
            options = {};
        }
        options = options || {};

        // override defaults with passed in options
        f.extend(o, options);
        delete o.fixLng; /* passed in each time */

        // override functions: .log(), .detectLanguage(), etc
        if (o.functions) {
            delete o.functions;
            f.extend(f, options.functions);
        }

        // create namespace object if namespace is passed in as string
        if (typeof o.ns == 'string') {
            o.ns = { namespaces: [o.ns], defaultNs: o.ns };
        }

        // fallback namespaces
        if (typeof o.fallbackNS == 'string') {
            o.fallbackNS = [o.fallbackNS];
        }

        // fallback languages
        if (typeof o.fallbackLng == 'string' || typeof o.fallbackLng == 'boolean') {
            o.fallbackLng = [o.fallbackLng];
        }

        // escape prefix/suffix
        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix);
        o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix);

        if (!o.lng) o.lng = f.detectLanguage();

        languages = f.toLanguages(o.lng);
        currentLng = languages[0];
        f.log('currentLng set to: ' + currentLng);

        if (o.useCookie && f.cookie.read(o.cookieName) !== currentLng) {
            //cookie is unset or invalid
            f.cookie.create(o.cookieName, currentLng, o.cookieExpirationTime, o.cookieDomain);
        }
        if (o.detectLngFromLocalStorage && typeof document !== 'undefined' && window.localStorage) {
            f.localStorage.setItem('i18next_lng', currentLng);
        }

        var lngTranslate = translate;
        if (options.fixLng) {
            lngTranslate = function (key, options) {
                options = options || {};
                options.lng = options.lng || lngTranslate.lng;
                return translate(key, options);
            };
            lngTranslate.lng = currentLng;
        }

        pluralExtensions.setCurrentLng(currentLng);

        // add JQuery extensions
        if ($ && o.setJqueryExt) {
            addJqueryFunct && addJqueryFunct();
        } else {
            addJqueryLikeFunctionality && addJqueryLikeFunctionality();
        }

        // jQuery deferred
        var deferred;
        if ($ && $.Deferred) {
            deferred = $.Deferred();
        }

        // return immidiatly if res are passed in
        if (o.resStore) {
            resStore = o.resStore;
            initialized = true;
            if (cb) cb(null, lngTranslate);
            if (deferred) deferred.resolve(lngTranslate);
            if (deferred) return deferred.promise();
            return;
        }

        // languages to load
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string') o.preload = [o.preload];
        for (var i = 0, l = o.preload.length; i < l; i++) {
            var pres = f.toLanguages(o.preload[i]);
            for (var y = 0, len = pres.length; y < len; y++) {
                if (lngsToLoad.indexOf(pres[y]) < 0) {
                    lngsToLoad.push(pres[y]);
                }
            }
        }

        // else load them
        i18n.sync.load(lngsToLoad, o, function (err, store) {
            resStore = store;
            initialized = true;

            if (cb) cb(err, lngTranslate);
            if (deferred) (!err ? deferred.resolve : deferred.reject)(err || lngTranslate);
        });

        if (deferred) return deferred.promise();
    }

    function isInitialized() {
        return initialized;
    }
    function preload(lngs, cb) {
        if (typeof lngs === 'string') lngs = [lngs];
        for (var i = 0, l = lngs.length; i < l; i++) {
            if (o.preload.indexOf(lngs[i]) < 0) {
                o.preload.push(lngs[i]);
            }
        }
        return init(cb);
    }

    function addResourceBundle(lng, ns, resources, deep) {
        if (typeof ns !== 'string') {
            resources = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }

        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};

        if (deep) {
            f.deepExtend(resStore[lng][ns], resources);
        } else {
            f.extend(resStore[lng][ns], resources);
        }
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }

    function hasResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }

        resStore[lng] = resStore[lng] || {};
        var res = resStore[lng][ns] || {};

        var hasValues = false;
        for (var prop in res) {
            if (res.hasOwnProperty(prop)) {
                hasValues = true;
            }
        }

        return hasValues;
    }

    function getResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }

        resStore[lng] = resStore[lng] || {};
        return f.extend({}, resStore[lng][ns]);
    }

    function removeResourceBundle(lng, ns) {
        if (typeof ns !== 'string') {
            ns = o.ns.defaultNs;
        }

        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = {};
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }

    function addResource(lng, ns, key, value) {
        if (typeof ns !== 'string') {
            resource = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }

        resStore[lng] = resStore[lng] || {};
        resStore[lng][ns] = resStore[lng][ns] || {};

        var keys = key.split(o.keyseparator);
        var x = 0;
        var node = resStore[lng][ns];
        var origRef = node;

        while (keys[x]) {
            if (x == keys.length - 1) node[keys[x]] = value;else {
                if (node[keys[x]] == null) node[keys[x]] = {};

                node = node[keys[x]];
            }
            x++;
        }
        if (o.useLocalStorage) {
            sync._storeLocal(resStore);
        }
    }

    function addResources(lng, ns, resources) {
        if (typeof ns !== 'string') {
            resource = ns;
            ns = o.ns.defaultNs;
        } else if (o.ns.namespaces.indexOf(ns) < 0) {
            o.ns.namespaces.push(ns);
        }

        for (var m in resources) {
            if (typeof resources[m] === 'string') addResource(lng, ns, m, resources[m]);
        }
    }

    function setDefaultNamespace(ns) {
        o.ns.defaultNs = ns;
    }

    function loadNamespace(namespace, cb) {
        loadNamespaces([namespace], cb);
    }

    function loadNamespaces(namespaces, cb) {
        var opts = {
            dynamicLoad: o.dynamicLoad,
            resGetPath: o.resGetPath,
            getAsync: o.getAsync,
            customLoad: o.customLoad,
            ns: { namespaces: namespaces, defaultNs: '' } /* new namespaces to load */
        };

        // languages to load
        var lngsToLoad = f.toLanguages(o.lng);
        if (typeof o.preload === 'string') o.preload = [o.preload];
        for (var i = 0, l = o.preload.length; i < l; i++) {
            var pres = f.toLanguages(o.preload[i]);
            for (var y = 0, len = pres.length; y < len; y++) {
                if (lngsToLoad.indexOf(pres[y]) < 0) {
                    lngsToLoad.push(pres[y]);
                }
            }
        }

        // check if we have to load
        var lngNeedLoad = [];
        for (var a = 0, lenA = lngsToLoad.length; a < lenA; a++) {
            var needLoad = false;
            var resSet = resStore[lngsToLoad[a]];
            if (resSet) {
                for (var b = 0, lenB = namespaces.length; b < lenB; b++) {
                    if (!resSet[namespaces[b]]) needLoad = true;
                }
            } else {
                needLoad = true;
            }

            if (needLoad) lngNeedLoad.push(lngsToLoad[a]);
        }

        if (lngNeedLoad.length) {
            i18n.sync._fetch(lngNeedLoad, opts, function (err, store) {
                var todo = namespaces.length * lngNeedLoad.length;

                // load each file individual
                f.each(namespaces, function (nsIndex, nsValue) {

                    // append namespace to namespace array
                    if (o.ns.namespaces.indexOf(nsValue) < 0) {
                        o.ns.namespaces.push(nsValue);
                    }

                    f.each(lngNeedLoad, function (lngIndex, lngValue) {
                        resStore[lngValue] = resStore[lngValue] || {};
                        resStore[lngValue][nsValue] = store[lngValue][nsValue];

                        todo--; // wait for all done befor callback
                        if (todo === 0 && cb) {
                            if (o.useLocalStorage) i18n.sync._storeLocal(resStore);
                            cb();
                        }
                    });
                });
            });
        } else {
            if (cb) cb();
        }
    }

    function setLng(lng, options, cb) {
        if (typeof options === 'function') {
            cb = options;
            options = {};
        } else if (!options) {
            options = {};
        }

        options.lng = lng;
        return init(options, cb);
    }

    function lng() {
        return currentLng;
    }

    function reload(cb) {
        resStore = {};
        setLng(currentLng, cb);
    }

    function noConflict() {

        window.i18next = window.i18n;

        if (conflictReference) {
            window.i18n = conflictReference;
        } else {
            delete window.i18n;
        }
    }
    function addJqueryFunct() {
        // $.t shortcut
        $.t = $.t || translate;

        function parse(ele, key, options) {
            if (key.length === 0) return;

            var attr = 'text';

            if (key.indexOf('[') === 0) {
                var parts = key.split(']');
                key = parts[1];
                attr = parts[0].substr(1, parts[0].length - 1);
            }

            if (key.indexOf(';') === key.length - 1) {
                key = key.substr(0, key.length - 2);
            }

            var optionsToUse;
            if (attr === 'html') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.html($.t(key, optionsToUse));
            } else if (attr === 'text') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.text() }, options) : options;
                ele.text($.t(key, optionsToUse));
            } else if (attr === 'prepend') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.prepend($.t(key, optionsToUse));
            } else if (attr === 'append') {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
                ele.append($.t(key, optionsToUse));
            } else if (attr.indexOf("data-") === 0) {
                var dataAttr = attr.substr("data-".length);
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.data(dataAttr) }, options) : options;
                var translated = $.t(key, optionsToUse);
                //we change into the data cache
                ele.data(dataAttr, translated);
                //we change into the dom
                ele.attr(attr, translated);
            } else {
                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.attr(attr) }, options) : options;
                ele.attr(attr, $.t(key, optionsToUse));
            }
        }

        function localize(ele, options) {
            var key = ele.attr(o.selectorAttr);
            if (!key && typeof key !== 'undefined' && key !== false) key = ele.text() || ele.val();
            if (!key) return;

            var target = ele,
                targetSelector = ele.data("i18n-target");
            if (targetSelector) {
                target = ele.find(targetSelector) || ele;
            }

            if (!options && o.useDataAttrOptions === true) {
                options = ele.data("i18n-options");
            }
            options = options || {};

            if (key.indexOf(';') >= 0) {
                var keys = key.split(';');

                $.each(keys, function (m, k) {
                    if (k !== '') parse(target, k, options);
                });
            } else {
                parse(target, key, options);
            }

            if (o.useDataAttrOptions === true) ele.data("i18n-options", options);
        }

        // fn
        $.fn.i18n = function (options) {
            return this.each(function () {
                // localize element itself
                localize($(this), options);

                // localize childs
                var elements = $(this).find('[' + o.selectorAttr + ']');
                elements.each(function () {
                    localize($(this), options);
                });
            });
        };
    }
    function addJqueryLikeFunctionality() {

        function parse(ele, key, options) {
            if (key.length === 0) return;

            var attr = 'text';

            if (key.indexOf('[') === 0) {
                var parts = key.split(']');
                key = parts[1];
                attr = parts[0].substr(1, parts[0].length - 1);
            }

            if (key.indexOf(';') === key.length - 1) {
                key = key.substr(0, key.length - 2);
            }

            if (attr === 'html') {
                ele.innerHTML = translate(key, options);
            } else if (attr === 'text') {
                ele.textContent = translate(key, options);
            } else if (attr === 'prepend') {
                ele.insertAdjacentHTML(translate(key, options), 'afterbegin');
            } else if (attr === 'append') {
                ele.insertAdjacentHTML(translate(key, options), 'beforeend');
            } else {
                ele.setAttribute(attr, translate(key, options));
            }
        }

        function localize(ele, options) {
            var key = ele.getAttribute(o.selectorAttr);
            if (!key && typeof key !== 'undefined' && key !== false) key = ele.textContent || ele.value;
            if (!key) return;

            var target = ele,
                targetSelector = ele.getAttribute("i18n-target");
            if (targetSelector) {
                target = ele.querySelector(targetSelector) || ele;
            }

            if (key.indexOf(';') >= 0) {
                var keys = key.split(';'),
                    index = 0,
                    length = keys.length;

                for (; index < length; index++) {
                    if (keys[index] !== '') parse(target, keys[index], options);
                }
            } else {
                parse(target, key, options);
            }
        }

        // fn
        i18n.translateObject = function (object, options) {
            // localize childs
            var elements = object.querySelectorAll('[' + o.selectorAttr + ']');
            var index = 0,
                length = elements.length;
            for (; index < length; index++) {
                localize(elements[index], options);
            }
        };
    }
    function applyReplacement(str, replacementHash, nestedKey, options) {
        if (!str) return str;

        options = options || replacementHash; // first call uses replacement hash combined with options
        if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;

        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped,
            suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped,
            unEscapingSuffix = 'HTML' + suffix;

        var hash = replacementHash.replace && typeof replacementHash.replace === 'object' ? replacementHash.replace : replacementHash;
        f.each(hash, function (key, value) {
            var nextKey = nestedKey ? nestedKey + o.keyseparator + key : key;
            if (typeof value === 'object' && value !== null) {
                str = applyReplacement(str, value, nextKey, options);
            } else {
                if (options.escapeInterpolation || o.escapeInterpolation) {
                    str = str.replace(new RegExp([prefix, nextKey, unEscapingSuffix].join(''), 'g'), f.regexReplacementEscape(value));
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(f.escape(value)));
                } else {
                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(value));
                }
                // str = options.escapeInterpolation;
            }
        });
        return str;
    }

    // append it to functions
    f.applyReplacement = applyReplacement;

    function applyReuse(translated, options) {
        var comma = ',';
        var options_open = '{';
        var options_close = '}';

        var opts = f.extend({}, options);
        delete opts.postProcess;

        while (translated.indexOf(o.reusePrefix) != -1) {
            replacementCounter++;
            if (replacementCounter > o.maxRecursion) {
                break;
            } // safety net for too much recursion
            var index_of_opening = translated.lastIndexOf(o.reusePrefix);
            var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
            var token = translated.substring(index_of_opening, index_of_end_of_closing);
            var token_without_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');

            if (index_of_end_of_closing <= index_of_opening) {
                f.error('there is an missing closing in following translation value', translated);
                return '';
            }

            if (token_without_symbols.indexOf(comma) != -1) {
                var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);
                if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
                    var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing);
                    var index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
                    try {
                        opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing)));
                        token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);
                    } catch (e) {}
                }
            }

            var translated_token = _translate(token_without_symbols, opts);
            translated = translated.replace(token, f.regexReplacementEscape(translated_token));
        }
        return translated;
    }

    function hasContext(options) {
        return options.context && (typeof options.context == 'string' || typeof options.context == 'number');
    }

    function needsPlural(options, lng) {
        return options.count !== undefined && typeof options.count != 'string' /* && pluralExtensions.needsPlural(lng, options.count)*/;
    }

    function needsIndefiniteArticle(options) {
        return options.indefinite_article !== undefined && typeof options.indefinite_article != 'string' && options.indefinite_article;
    }

    function exists(key, options) {
        options = options || {};

        var notFound = _getDefaultValue(key, options),
            found = _find(key, options);

        return found !== undefined || found === notFound;
    }

    function translate(key, options) {
        options = options || {};

        if (!initialized) {
            f.log('i18next not finished initialization. you might have called t function before loading resources finished.');
            return options.defaultValue || '';
        };
        replacementCounter = 0;
        return _translate.apply(null, arguments);
    }

    function _getDefaultValue(key, options) {
        return options.defaultValue !== undefined ? options.defaultValue : key;
    }

    function _injectSprintfProcessor() {

        var values = [];

        // mh: build array from second argument onwards
        for (var i = 1; i < arguments.length; i++) {
            values.push(arguments[i]);
        }

        return {
            postProcess: 'sprintf',
            sprintf: values
        };
    }

    function _translate(potentialKeys, options) {
        if (options && typeof options !== 'object') {
            if (o.shortcutFunction === 'sprintf') {
                // mh: gettext like sprintf syntax found, automatically create sprintf processor
                options = _injectSprintfProcessor.apply(null, arguments);
            } else if (o.shortcutFunction === 'defaultValue') {
                options = {
                    defaultValue: options
                };
            }
        } else {
            options = options || {};
        }

        if (typeof o.defaultVariables === 'object') {
            options = f.extend({}, o.defaultVariables, options);
        }

        if (potentialKeys === undefined || potentialKeys === null || potentialKeys === '') return '';

        if (typeof potentialKeys === 'number') {
            potentialKeys = String(potentialKeys);
        }

        if (typeof potentialKeys === 'string') {
            potentialKeys = [potentialKeys];
        }

        var key = potentialKeys[0];

        if (potentialKeys.length > 1) {
            for (var i = 0; i < potentialKeys.length; i++) {
                key = potentialKeys[i];
                if (exists(key, options)) {
                    break;
                }
            }
        }

        var notFound = _getDefaultValue(key, options),
            found = _find(key, options),
            lngs = options.lng ? f.toLanguages(options.lng, options.fallbackLng) : languages,
            ns = options.ns || o.ns.defaultNs,
            parts;

        // split ns and key
        if (key.indexOf(o.nsseparator) > -1) {
            parts = key.split(o.nsseparator);
            ns = parts[0];
            key = parts[1];
        }

        if (found === undefined && o.sendMissing && typeof o.missingKeyHandler === 'function') {
            if (options.lng) {
                o.missingKeyHandler(lngs[0], ns, key, notFound, lngs);
            } else {
                o.missingKeyHandler(o.lng, ns, key, notFound, lngs);
            }
        }

        var postProcessorsToApply;
        if (typeof o.postProcess === 'string' && o.postProcess !== '') {
            postProcessorsToApply = [o.postProcess];
        } else if (typeof o.postProcess === 'array' || typeof o.postProcess === 'object') {
            postProcessorsToApply = o.postProcess;
        } else {
            postProcessorsToApply = [];
        }

        if (typeof options.postProcess === 'string' && options.postProcess !== '') {
            postProcessorsToApply = postProcessorsToApply.concat([options.postProcess]);
        } else if (typeof options.postProcess === 'array' || typeof options.postProcess === 'object') {
            postProcessorsToApply = postProcessorsToApply.concat(options.postProcess);
        }

        if (found !== undefined && postProcessorsToApply.length) {
            postProcessorsToApply.forEach(function (postProcessor) {
                if (postProcessors[postProcessor]) {
                    found = postProcessors[postProcessor](found, key, options);
                }
            });
        }

        // process notFound if function exists
        var splitNotFound = notFound;
        if (notFound.indexOf(o.nsseparator) > -1) {
            parts = notFound.split(o.nsseparator);
            splitNotFound = parts[1];
        }
        if (splitNotFound === key && o.parseMissingKey) {
            notFound = o.parseMissingKey(notFound);
        }

        if (found === undefined) {
            notFound = applyReplacement(notFound, options);
            notFound = applyReuse(notFound, options);

            if (postProcessorsToApply.length) {
                var val = _getDefaultValue(key, options);
                postProcessorsToApply.forEach(function (postProcessor) {
                    if (postProcessors[postProcessor]) {
                        found = postProcessors[postProcessor](val, key, options);
                    }
                });
            }
        }

        return found !== undefined ? found : notFound;
    }

    function _find(key, options) {
        options = options || {};

        var optionWithoutCount,
            translated,
            notFound = _getDefaultValue(key, options),
            lngs = languages;

        if (!resStore) {
            return notFound;
        } // no resStore to translate from

        // CI mode
        if (lngs[0].toLowerCase() === 'cimode') return notFound;

        // passed in lng
        if (options.lngs) lngs = options.lngs;
        if (options.lng) {
            lngs = f.toLanguages(options.lng, options.fallbackLng);

            if (!resStore[lngs[0]]) {
                var oldAsync = o.getAsync;
                o.getAsync = false;

                i18n.sync.load(lngs, o, function (err, store) {
                    f.extend(resStore, store);
                    o.getAsync = oldAsync;
                });
            }
        }

        var ns = options.ns || o.ns.defaultNs;
        if (key.indexOf(o.nsseparator) > -1) {
            var parts = key.split(o.nsseparator);
            ns = parts[0];
            key = parts[1];
        }

        if (hasContext(options)) {
            optionWithoutCount = f.extend({}, options);
            delete optionWithoutCount.context;
            optionWithoutCount.defaultValue = o.contextNotFound;

            var contextKey = ns + o.nsseparator + key + '_' + options.context;

            translated = translate(contextKey, optionWithoutCount);
            if (translated != o.contextNotFound) {
                return applyReplacement(translated, { context: options.context }); // apply replacement for context only
            } // else continue translation with original/nonContext key
        }

        if (needsPlural(options, lngs[0])) {
            optionWithoutCount = f.extend({ lngs: [lngs[0]] }, options);
            delete optionWithoutCount.count;
            optionWithoutCount._origLng = optionWithoutCount._origLng || optionWithoutCount.lng || lngs[0];
            delete optionWithoutCount.lng;
            optionWithoutCount.defaultValue = o.pluralNotFound;

            var pluralKey;
            if (!pluralExtensions.needsPlural(lngs[0], options.count)) {
                pluralKey = ns + o.nsseparator + key;
            } else {
                pluralKey = ns + o.nsseparator + key + o.pluralSuffix;
                var pluralExtension = pluralExtensions.get(lngs[0], options.count);
                if (pluralExtension >= 0) {
                    pluralKey = pluralKey + '_' + pluralExtension;
                } else if (pluralExtension === 1) {
                    pluralKey = ns + o.nsseparator + key; // singular
                }
            }

            translated = translate(pluralKey, optionWithoutCount);

            if (translated != o.pluralNotFound) {
                return applyReplacement(translated, {
                    count: options.count,
                    interpolationPrefix: options.interpolationPrefix,
                    interpolationSuffix: options.interpolationSuffix
                }); // apply replacement for count only
            } else if (lngs.length > 1) {
                    // remove failed lng
                    var clone = lngs.slice();
                    clone.shift();
                    options = f.extend(options, { lngs: clone });
                    options._origLng = optionWithoutCount._origLng;
                    delete options.lng;
                    // retry with fallbacks
                    translated = translate(ns + o.nsseparator + key, options);
                    if (translated != o.pluralNotFound) return translated;
                } else {
                    optionWithoutCount.lng = optionWithoutCount._origLng;
                    delete optionWithoutCount._origLng;
                    translated = translate(ns + o.nsseparator + key, optionWithoutCount);

                    return applyReplacement(translated, {
                        count: options.count,
                        interpolationPrefix: options.interpolationPrefix,
                        interpolationSuffix: options.interpolationSuffix
                    });
                }
        }

        if (needsIndefiniteArticle(options)) {
            var optionsWithoutIndef = f.extend({}, options);
            delete optionsWithoutIndef.indefinite_article;
            optionsWithoutIndef.defaultValue = o.indefiniteNotFound;
            // If we don't have a count, we want the indefinite, if we do have a count, and needsPlural is false
            var indefiniteKey = ns + o.nsseparator + key + (options.count && !needsPlural(options, lngs[0]) || !options.count ? o.indefiniteSuffix : "");
            translated = translate(indefiniteKey, optionsWithoutIndef);
            if (translated != o.indefiniteNotFound) {
                return translated;
            }
        }

        var found;
        var keys = key.split(o.keyseparator);
        for (var i = 0, len = lngs.length; i < len; i++) {
            if (found !== undefined) break;

            var l = lngs[i];

            var x = 0;
            var value = resStore[l] && resStore[l][ns];
            while (keys[x]) {
                value = value && value[keys[x]];
                x++;
            }
            if (value !== undefined && (!o.showKeyIfEmpty || value !== '')) {
                var valueType = Object.prototype.toString.apply(value);
                if (typeof value === 'string') {
                    value = applyReplacement(value, options);
                    value = applyReuse(value, options);
                } else if (valueType === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {
                    value = value.join('\n');
                    value = applyReplacement(value, options);
                    value = applyReuse(value, options);
                } else if (value === null && o.fallbackOnNull === true) {
                    value = undefined;
                } else if (value !== null) {
                    if (!o.returnObjectTrees && !options.returnObjectTrees) {
                        if (o.objectTreeKeyHandler && typeof o.objectTreeKeyHandler == 'function') {
                            value = o.objectTreeKeyHandler(key, value, l, ns, options);
                        } else {
                            value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' + 'returned an object instead of string.';
                            f.log(value);
                        }
                    } else if (valueType !== '[object Number]' && valueType !== '[object Function]' && valueType !== '[object RegExp]') {
                        var copy = valueType === '[object Array]' ? [] : {}; // apply child translation on a copy
                        f.each(value, function (m) {
                            copy[m] = _translate(ns + o.nsseparator + key + o.keyseparator + m, options);
                        });
                        value = copy;
                    }
                }

                if (typeof value === 'string' && value.trim() === '' && o.fallbackOnEmpty === true) value = undefined;

                found = value;
            }
        }

        if (found === undefined && !options.isFallbackLookup && (o.fallbackToDefaultNS === true || o.fallbackNS && o.fallbackNS.length > 0)) {
            // set flag for fallback lookup - avoid recursion
            options.isFallbackLookup = true;

            if (o.fallbackNS.length) {

                for (var y = 0, lenY = o.fallbackNS.length; y < lenY; y++) {
                    found = _find(o.fallbackNS[y] + o.nsseparator + key, options);

                    if (found || found === "" && o.fallbackOnEmpty === false) {
                        /* compare value without namespace */
                        var foundValue = found.indexOf(o.nsseparator) > -1 ? found.split(o.nsseparator)[1] : found,
                            notFoundValue = notFound.indexOf(o.nsseparator) > -1 ? notFound.split(o.nsseparator)[1] : notFound;

                        if (foundValue !== notFoundValue) break;
                    }
                }
            } else {
                options.ns = o.ns.defaultNs;
                found = _find(key, options); // fallback to default NS
            }
            options.isFallbackLookup = false;
        }

        return found;
    }
    function detectLanguage() {
        var detectedLng;
        var whitelist = o.lngWhitelist || [];
        var userLngChoices = [];

        // get from qs
        var qsParm = [];
        if (typeof window !== 'undefined') {
            (function () {
                var query = window.location.search.substring(1);
                var params = query.split('&');
                for (var i = 0; i < params.length; i++) {
                    var pos = params[i].indexOf('=');
                    if (pos > 0) {
                        var key = params[i].substring(0, pos);
                        if (key == o.detectLngQS) {
                            userLngChoices.push(params[i].substring(pos + 1));
                        }
                    }
                }
            })();
        }

        // get from cookie
        if (o.useCookie && typeof document !== 'undefined') {
            var c = f.cookie.read(o.cookieName);
            if (c) userLngChoices.push(c);
        }

        // get from localStorage
        if (o.detectLngFromLocalStorage && typeof window !== 'undefined' && window.localStorage) {
            var lang = f.localStorage.getItem('i18next_lng');
            if (lang) {
                userLngChoices.push(lang);
            }
        }

        // get from navigator
        if (typeof navigator !== 'undefined') {
            if (navigator.languages) {
                // chrome only; not an array, so can't use .push.apply instead of iterating
                for (var i = 0; i < navigator.languages.length; i++) {
                    userLngChoices.push(navigator.languages[i]);
                }
            }
            if (navigator.userLanguage) {
                userLngChoices.push(navigator.userLanguage);
            }
            if (navigator.language) {
                userLngChoices.push(navigator.language);
            }
        }

        (function () {
            for (var i = 0; i < userLngChoices.length; i++) {
                var lng = userLngChoices[i];

                if (lng.indexOf('-') > -1) {
                    var parts = lng.split('-');
                    lng = o.lowerCaseLng ? parts[0].toLowerCase() + '-' + parts[1].toLowerCase() : parts[0].toLowerCase() + '-' + parts[1].toUpperCase();
                }

                if (whitelist.length === 0 || whitelist.indexOf(lng) > -1) {
                    detectedLng = lng;
                    break;
                }
            }
        })();

        //fallback
        if (!detectedLng) {
            detectedLng = o.fallbackLng[0];
        }

        return detectedLng;
    }
    // definition http://translate.sourceforge.net/wiki/l10n/pluralforms

    /* [code, name, numbers, pluralsType] */
    var _rules = [["ach", "Acholi", [1, 2], 1], ["af", "Afrikaans", [1, 2], 2], ["ak", "Akan", [1, 2], 1], ["am", "Amharic", [1, 2], 1], ["an", "Aragonese", [1, 2], 2], ["ar", "Arabic", [0, 1, 2, 3, 11, 100], 5], ["arn", "Mapudungun", [1, 2], 1], ["ast", "Asturian", [1, 2], 2], ["ay", "Aymará", [1], 3], ["az", "Azerbaijani", [1, 2], 2], ["be", "Belarusian", [1, 2, 5], 4], ["bg", "Bulgarian", [1, 2], 2], ["bn", "Bengali", [1, 2], 2], ["bo", "Tibetan", [1], 3], ["br", "Breton", [1, 2], 1], ["bs", "Bosnian", [1, 2, 5], 4], ["ca", "Catalan", [1, 2], 2], ["cgg", "Chiga", [1], 3], ["cs", "Czech", [1, 2, 5], 6], ["csb", "Kashubian", [1, 2, 5], 7], ["cy", "Welsh", [1, 2, 3, 8], 8], ["da", "Danish", [1, 2], 2], ["de", "German", [1, 2], 2], ["dev", "Development Fallback", [1, 2], 2], ["dz", "Dzongkha", [1], 3], ["el", "Greek", [1, 2], 2], ["en", "English", [1, 2], 2], ["eo", "Esperanto", [1, 2], 2], ["es", "Spanish", [1, 2], 2], ["es_ar", "Argentinean Spanish", [1, 2], 2], ["et", "Estonian", [1, 2], 2], ["eu", "Basque", [1, 2], 2], ["fa", "Persian", [1], 3], ["fi", "Finnish", [1, 2], 2], ["fil", "Filipino", [1, 2], 1], ["fo", "Faroese", [1, 2], 2], ["fr", "French", [1, 2], 9], ["fur", "Friulian", [1, 2], 2], ["fy", "Frisian", [1, 2], 2], ["ga", "Irish", [1, 2, 3, 7, 11], 10], ["gd", "Scottish Gaelic", [1, 2, 3, 20], 11], ["gl", "Galician", [1, 2], 2], ["gu", "Gujarati", [1, 2], 2], ["gun", "Gun", [1, 2], 1], ["ha", "Hausa", [1, 2], 2], ["he", "Hebrew", [1, 2], 2], ["hi", "Hindi", [1, 2], 2], ["hr", "Croatian", [1, 2, 5], 4], ["hu", "Hungarian", [1, 2], 2], ["hy", "Armenian", [1, 2], 2], ["ia", "Interlingua", [1, 2], 2], ["id", "Indonesian", [1], 3], ["is", "Icelandic", [1, 2], 12], ["it", "Italian", [1, 2], 2], ["ja", "Japanese", [1], 3], ["jbo", "Lojban", [1], 3], ["jv", "Javanese", [0, 1], 13], ["ka", "Georgian", [1], 3], ["kk", "Kazakh", [1], 3], ["km", "Khmer", [1], 3], ["kn", "Kannada", [1, 2], 2], ["ko", "Korean", [1], 3], ["ku", "Kurdish", [1, 2], 2], ["kw", "Cornish", [1, 2, 3, 4], 14], ["ky", "Kyrgyz", [1], 3], ["lb", "Letzeburgesch", [1, 2], 2], ["ln", "Lingala", [1, 2], 1], ["lo", "Lao", [1], 3], ["lt", "Lithuanian", [1, 2, 10], 15], ["lv", "Latvian", [1, 2, 0], 16], ["mai", "Maithili", [1, 2], 2], ["mfe", "Mauritian Creole", [1, 2], 1], ["mg", "Malagasy", [1, 2], 1], ["mi", "Maori", [1, 2], 1], ["mk", "Macedonian", [1, 2], 17], ["ml", "Malayalam", [1, 2], 2], ["mn", "Mongolian", [1, 2], 2], ["mnk", "Mandinka", [0, 1, 2], 18], ["mr", "Marathi", [1, 2], 2], ["ms", "Malay", [1], 3], ["mt", "Maltese", [1, 2, 11, 20], 19], ["nah", "Nahuatl", [1, 2], 2], ["nap", "Neapolitan", [1, 2], 2], ["nb", "Norwegian Bokmal", [1, 2], 2], ["ne", "Nepali", [1, 2], 2], ["nl", "Dutch", [1, 2], 2], ["nn", "Norwegian Nynorsk", [1, 2], 2], ["no", "Norwegian", [1, 2], 2], ["nso", "Northern Sotho", [1, 2], 2], ["oc", "Occitan", [1, 2], 1], ["or", "Oriya", [2, 1], 2], ["pa", "Punjabi", [1, 2], 2], ["pap", "Papiamento", [1, 2], 2], ["pl", "Polish", [1, 2, 5], 7], ["pms", "Piemontese", [1, 2], 2], ["ps", "Pashto", [1, 2], 2], ["pt", "Portuguese", [1, 2], 2], ["pt_br", "Brazilian Portuguese", [1, 2], 2], ["rm", "Romansh", [1, 2], 2], ["ro", "Romanian", [1, 2, 20], 20], ["ru", "Russian", [1, 2, 5], 4], ["sah", "Yakut", [1], 3], ["sco", "Scots", [1, 2], 2], ["se", "Northern Sami", [1, 2], 2], ["si", "Sinhala", [1, 2], 2], ["sk", "Slovak", [1, 2, 5], 6], ["sl", "Slovenian", [5, 1, 2, 3], 21], ["so", "Somali", [1, 2], 2], ["son", "Songhay", [1, 2], 2], ["sq", "Albanian", [1, 2], 2], ["sr", "Serbian", [1, 2, 5], 4], ["su", "Sundanese", [1], 3], ["sv", "Swedish", [1, 2], 2], ["sw", "Swahili", [1, 2], 2], ["ta", "Tamil", [1, 2], 2], ["te", "Telugu", [1, 2], 2], ["tg", "Tajik", [1, 2], 1], ["th", "Thai", [1], 3], ["ti", "Tigrinya", [1, 2], 1], ["tk", "Turkmen", [1, 2], 2], ["tr", "Turkish", [1, 2], 1], ["tt", "Tatar", [1], 3], ["ug", "Uyghur", [1], 3], ["uk", "Ukrainian", [1, 2, 5], 4], ["ur", "Urdu", [1, 2], 2], ["uz", "Uzbek", [1, 2], 1], ["vi", "Vietnamese", [1], 3], ["wa", "Walloon", [1, 2], 1], ["wo", "Wolof", [1], 3], ["yo", "Yoruba", [1, 2], 2], ["zh", "Chinese", [1], 3]];

    var _rulesPluralsTypes = {
        1: function _(n) {
            return Number(n > 1);
        },
        2: function _(n) {
            return Number(n != 1);
        },
        3: function _(n) {
            return 0;
        },
        4: function _(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        5: function _(n) {
            return Number(n === 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);
        },
        6: function _(n) {
            return Number(n == 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2);
        },
        7: function _(n) {
            return Number(n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        8: function _(n) {
            return Number(n == 1 ? 0 : n == 2 ? 1 : n != 8 && n != 11 ? 2 : 3);
        },
        9: function _(n) {
            return Number(n >= 2);
        },
        10: function _(n) {
            return Number(n == 1 ? 0 : n == 2 ? 1 : n < 7 ? 2 : n < 11 ? 3 : 4);
        },
        11: function _(n) {
            return Number(n == 1 || n == 11 ? 0 : n == 2 || n == 12 ? 1 : n > 2 && n < 20 ? 2 : 3);
        },
        12: function _(n) {
            return Number(n % 10 != 1 || n % 100 == 11);
        },
        13: function _(n) {
            return Number(n !== 0);
        },
        14: function _(n) {
            return Number(n == 1 ? 0 : n == 2 ? 1 : n == 3 ? 2 : 3);
        },
        15: function _(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);
        },
        16: function _(n) {
            return Number(n % 10 == 1 && n % 100 != 11 ? 0 : n !== 0 ? 1 : 2);
        },
        17: function _(n) {
            return Number(n == 1 || n % 10 == 1 ? 0 : 1);
        },
        18: function _(n) {
            return Number(0 ? 0 : n == 1 ? 1 : 2);
        },
        19: function _(n) {
            return Number(n == 1 ? 0 : n === 0 || n % 100 > 1 && n % 100 < 11 ? 1 : n % 100 > 10 && n % 100 < 20 ? 2 : 3);
        },
        20: function _(n) {
            return Number(n == 1 ? 0 : n === 0 || n % 100 > 0 && n % 100 < 20 ? 1 : 2);
        },
        21: function _(n) {
            return Number(n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);
        }
    };

    var pluralExtensions = {

        rules: (function () {
            var l,
                rules = {};
            for (l = _rules.length; l--;) {
                rules[_rules[l][0]] = {
                    name: _rules[l][1],
                    numbers: _rules[l][2],
                    plurals: _rulesPluralsTypes[_rules[l][3]]
                };
            }
            return rules;
        })(),

        // you can add your own pluralExtensions
        addRule: function addRule(lng, obj) {
            pluralExtensions.rules[lng] = obj;
        },

        setCurrentLng: function setCurrentLng(lng) {
            if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {
                var parts = lng.split('-');

                pluralExtensions.currentRule = {
                    lng: lng,
                    rule: pluralExtensions.rules[parts[0]]
                };
            }
        },

        needsPlural: function needsPlural(lng, count) {
            var parts = lng.split('-');

            var ext;
            if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
                ext = pluralExtensions.currentRule.rule;
            } else {
                ext = pluralExtensions.rules[parts[f.getCountyIndexOfLng(lng)]];
            }

            if (ext && ext.numbers.length <= 1) {
                return false;
            } else {
                return this.get(lng, count) !== 1;
            }
        },

        get: function get(lng, count) {
            var parts = lng.split('-');

            function getResult(l, c) {
                var ext;
                if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
                    ext = pluralExtensions.currentRule.rule;
                } else {
                    ext = pluralExtensions.rules[l];
                }
                if (ext) {
                    var i;
                    if (ext.noAbs) {
                        i = ext.plurals(c);
                    } else {
                        i = ext.plurals(Math.abs(c));
                    }

                    var number = ext.numbers[i];
                    if (ext.numbers.length === 2 && ext.numbers[0] === 1) {
                        if (number === 2) {
                            number = -1; // regular plural
                        } else if (number === 1) {
                                number = 1; // singular
                            }
                    } //console.log(count + '-' + number);
                    return number;
                } else {
                    return c === 1 ? '1' : '-1';
                }
            }

            return getResult(parts[f.getCountyIndexOfLng(lng)], count);
        }

    };
    var postProcessors = {};
    var addPostProcessor = function addPostProcessor(name, fc) {
        postProcessors[name] = fc;
    };
    // sprintf support
    var sprintf = (function () {
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
            for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
            return output.join('');
        }

        var str_format = function str_format() {
            if (!str_format.cache.hasOwnProperty(arguments[0])) {
                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
            }
            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };

        str_format.format = function (parse_tree, argv) {
            var cursor = 1,
                tree_length = parse_tree.length,
                node_type = '',
                arg,
                output = [],
                i,
                k,
                match,
                pad,
                pad_character,
                pad_length;
            for (i = 0; i < tree_length; i++) {
                node_type = get_type(parse_tree[i]);
                if (node_type === 'string') {
                    output.push(parse_tree[i]);
                } else if (node_type === 'array') {
                    match = parse_tree[i]; // convenience purposes only
                    if (match[2]) {
                        // keyword argument
                        arg = argv[cursor];
                        for (k = 0; k < match[2].length; k++) {
                            if (!arg.hasOwnProperty(match[2][k])) {
                                throw sprintf('[sprintf] property "%s" does not exist', match[2][k]);
                            }
                            arg = arg[match[2][k]];
                        }
                    } else if (match[1]) {
                        // positional argument (explicit)
                        arg = argv[match[1]];
                    } else {
                        // positional argument (implicit)
                        arg = argv[cursor++];
                    }

                    if (/[^s]/.test(match[8]) && get_type(arg) != 'number') {
                        throw sprintf('[sprintf] expecting number but found %s', get_type(arg));
                    }
                    switch (match[8]) {
                        case 'b':
                            arg = arg.toString(2);break;
                        case 'c':
                            arg = String.fromCharCode(arg);break;
                        case 'd':
                            arg = parseInt(arg, 10);break;
                        case 'e':
                            arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();break;
                        case 'f':
                            arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);break;
                        case 'o':
                            arg = arg.toString(8);break;
                        case 's':
                            arg = (arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg;break;
                        case 'u':
                            arg = Math.abs(arg);break;
                        case 'x':
                            arg = arg.toString(16);break;
                        case 'X':
                            arg = arg.toString(16).toUpperCase();break;
                    }
                    arg = /[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg;
                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                    pad_length = match[6] - String(arg).length;
                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                    output.push(match[5] ? arg + pad : pad + arg);
                }
            }
            return output.join('');
        };

        str_format.cache = {};

        str_format.parse = function (fmt) {
            var _fmt = fmt,
                match = [],
                parse_tree = [],
                arg_names = 0;
            while (_fmt) {
                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                    parse_tree.push(match[0]);
                } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                    parse_tree.push('%');
                } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                    if (match[2]) {
                        arg_names |= 1;
                        var field_list = [],
                            replacement_field = match[2],
                            field_match = [];
                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else {
                                    throw '[sprintf] huh?';
                                }
                            }
                        } else {
                            throw '[sprintf] huh?';
                        }
                        match[2] = field_list;
                    } else {
                        arg_names |= 2;
                    }
                    if (arg_names === 3) {
                        throw '[sprintf] mixing positional and named placeholders is not (yet) supported';
                    }
                    parse_tree.push(match);
                } else {
                    throw '[sprintf] huh?';
                }
                _fmt = _fmt.substring(match[0].length);
            }
            return parse_tree;
        };

        return str_format;
    })();

    var vsprintf = function vsprintf(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    addPostProcessor("sprintf", function (val, key, opts) {
        if (!opts.sprintf) return val;

        if (Object.prototype.toString.apply(opts.sprintf) === '[object Array]') {
            return vsprintf(val, opts.sprintf);
        } else if (typeof opts.sprintf === 'object') {
            return sprintf(val, opts.sprintf);
        }

        return val;
    });
    // public api interface
    i18n.init = init;
    i18n.isInitialized = isInitialized;
    i18n.setLng = setLng;
    i18n.preload = preload;
    i18n.addResourceBundle = addResourceBundle;
    i18n.hasResourceBundle = hasResourceBundle;
    i18n.getResourceBundle = getResourceBundle;
    i18n.addResource = addResource;
    i18n.addResources = addResources;
    i18n.removeResourceBundle = removeResourceBundle;
    i18n.loadNamespace = loadNamespace;
    i18n.loadNamespaces = loadNamespaces;
    i18n.setDefaultNamespace = setDefaultNamespace;
    i18n.t = translate;
    i18n.translate = translate;
    i18n.exists = exists;
    i18n.detectLanguage = f.detectLanguage;
    i18n.pluralExtensions = pluralExtensions;
    i18n.sync = sync;
    i18n.functions = f;
    i18n.lng = lng;
    i18n.addPostProcessor = addPostProcessor;
    i18n.applyReplacement = f.applyReplacement;
    i18n.options = o;
    i18n.noConflict = noConflict;
})(typeof exports === 'undefined' ? window : exports);
// http://i18next.com


},{}],"/home/cheton/github/webappengine/web/vendor/jsUri/Uri.js":[function(require,module,exports){
/*!
 * jsUri
 * https://github.com/derek-watson/jsUri
 *
 * Copyright 2013, Derek Watson
 * Released under the MIT license.
 *
 * Includes parseUri regular expressions
 * http://blog.stevenlevithan.com/archives/parseuri
 * Copyright 2007, Steven Levithan
 * Released under the MIT license.
 */

'use strict';

(function (global) {

  var re = {
    starts_with_slashes: /^\/+/,
    ends_with_slashes: /\/+$/,
    pluses: /\+/g,
    query_separator: /[&;]/,
    uri_parser: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*)(?::([^:@]*))?)?@)?(\[[0-9a-fA-F:.]+\]|[^:\/?#]*)(?::(\d+|(?=:)))?(:)?)((((?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  };

  /**
   * Define forEach for older js environments
   * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach#Compatibility
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
      var T, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;

      if (typeof callback !== "function") {
        throw new TypeError(callback + ' is not a function');
      }

      if (arguments.length > 1) {
        T = thisArg;
      }

      k = 0;

      while (k < len) {
        var kValue;
        if (k in O) {
          kValue = O[k];
          callback.call(T, kValue, k, O);
        }
        k++;
      }
    };
  }

  /**
   * unescape a query param value
   * @param  {string} s encoded value
   * @return {string}   decoded value
   */
  function decode(s) {
    if (s) {
      s = s.toString().replace(re.pluses, '%20');
      s = decodeURIComponent(s);
    }
    return s;
  }

  /**
   * Breaks a uri string down into its individual parts
   * @param  {string} str uri
   * @return {object}     parts
   */
  function parseUri(str) {
    var parser = re.uri_parser;
    var parserKeys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "isColonUri", "relative", "path", "directory", "file", "query", "anchor"];
    var m = parser.exec(str || '');
    var parts = {};

    parserKeys.forEach(function (key, i) {
      parts[key] = m[i] || '';
    });

    return parts;
  }

  /**
   * Breaks a query string down into an array of key/value pairs
   * @param  {string} str query
   * @return {array}      array of arrays (key/value pairs)
   */
  function parseQuery(str) {
    var i, ps, p, n, k, v, l;
    var pairs = [];

    if (typeof str === 'undefined' || str === null || str === '') {
      return pairs;
    }

    if (str.indexOf('?') === 0) {
      str = str.substring(1);
    }

    ps = str.toString().split(re.query_separator);

    for (i = 0, l = ps.length; i < l; i++) {
      p = ps[i];
      n = p.indexOf('=');

      if (n !== 0) {
        k = decode(p.substring(0, n));
        v = decode(p.substring(n + 1));
        pairs.push(n === -1 ? [p, null] : [k, v]);
      }
    }
    return pairs;
  }

  /**
   * Creates a new Uri object
   * @constructor
   * @param {string} str
   */
  function Uri(str) {
    this.uriParts = parseUri(str);
    this.queryPairs = parseQuery(this.uriParts.query);
    this.hasAuthorityPrefixUserPref = null;
  }

  /**
   * Define getter/setter methods
   */
  ['protocol', 'userInfo', 'host', 'port', 'path', 'anchor'].forEach(function (key) {
    Uri.prototype[key] = function (val) {
      if (typeof val !== 'undefined') {
        this.uriParts[key] = val;
      }
      return this.uriParts[key];
    };
  });

  /**
   * if there is no protocol, the leading // can be enabled or disabled
   * @param  {Boolean}  val
   * @return {Boolean}
   */
  Uri.prototype.hasAuthorityPrefix = function (val) {
    if (typeof val !== 'undefined') {
      this.hasAuthorityPrefixUserPref = val;
    }

    if (this.hasAuthorityPrefixUserPref === null) {
      return this.uriParts.source.indexOf('//') !== -1;
    } else {
      return this.hasAuthorityPrefixUserPref;
    }
  };

  Uri.prototype.isColonUri = function (val) {
    if (typeof val !== 'undefined') {
      this.uriParts.isColonUri = !!val;
    } else {
      return !!this.uriParts.isColonUri;
    }
  };

  /**
   * Serializes the internal state of the query pairs
   * @param  {string} [val]   set a new query string
   * @return {string}         query string
   */
  Uri.prototype.query = function (val) {
    var s = '',
        i,
        param,
        l;

    if (typeof val !== 'undefined') {
      this.queryPairs = parseQuery(val);
    }

    for (i = 0, l = this.queryPairs.length; i < l; i++) {
      param = this.queryPairs[i];
      if (s.length > 0) {
        s += '&';
      }
      if (param[1] === null) {
        s += param[0];
      } else {
        s += param[0];
        s += '=';
        if (typeof param[1] !== 'undefined') {
          s += encodeURIComponent(param[1]);
        }
      }
    }
    return s.length > 0 ? '?' + s : s;
  };

  /**
   * returns the first query param value found for the key
   * @param  {string} key query key
   * @return {string}     first value found for key
   */
  Uri.prototype.getQueryParamValue = function (key) {
    var param, i, l;
    for (i = 0, l = this.queryPairs.length; i < l; i++) {
      param = this.queryPairs[i];
      if (key === param[0]) {
        return param[1];
      }
    }
  };

  /**
   * returns an array of query param values for the key
   * @param  {string} key query key
   * @return {array}      array of values
   */
  Uri.prototype.getQueryParamValues = function (key) {
    var arr = [],
        i,
        param,
        l;
    for (i = 0, l = this.queryPairs.length; i < l; i++) {
      param = this.queryPairs[i];
      if (key === param[0]) {
        arr.push(param[1]);
      }
    }
    return arr;
  };

  /**
   * removes query parameters
   * @param  {string} key     remove values for key
   * @param  {val}    [val]   remove a specific value, otherwise removes all
   * @return {Uri}            returns self for fluent chaining
   */
  Uri.prototype.deleteQueryParam = function (key, val) {
    var arr = [],
        i,
        param,
        keyMatchesFilter,
        valMatchesFilter,
        l;

    for (i = 0, l = this.queryPairs.length; i < l; i++) {

      param = this.queryPairs[i];
      keyMatchesFilter = decode(param[0]) === decode(key);
      valMatchesFilter = param[1] === val;

      if (arguments.length === 1 && !keyMatchesFilter || arguments.length === 2 && (!keyMatchesFilter || !valMatchesFilter)) {
        arr.push(param);
      }
    }

    this.queryPairs = arr;

    return this;
  };

  /**
   * adds a query parameter
   * @param  {string}  key        add values for key
   * @param  {string}  val        value to add
   * @param  {integer} [index]    specific index to add the value at
   * @return {Uri}                returns self for fluent chaining
   */
  Uri.prototype.addQueryParam = function (key, val, index) {
    if (arguments.length === 3 && index !== -1) {
      index = Math.min(index, this.queryPairs.length);
      this.queryPairs.splice(index, 0, [key, val]);
    } else if (arguments.length > 0) {
      this.queryPairs.push([key, val]);
    }
    return this;
  };

  /**
   * test for the existence of a query parameter
   * @param  {string}  key        check values for key
   * @return {Boolean}            true if key exists, otherwise false
   */
  Uri.prototype.hasQueryParam = function (key) {
    var i,
        len = this.queryPairs.length;
    for (i = 0; i < len; i++) {
      if (this.queryPairs[i][0] == key) return true;
    }
    return false;
  };

  /**
   * replaces query param values
   * @param  {string} key         key to replace value for
   * @param  {string} newVal      new value
   * @param  {string} [oldVal]    replace only one specific value (otherwise replaces all)
   * @return {Uri}                returns self for fluent chaining
   */
  Uri.prototype.replaceQueryParam = function (key, newVal, oldVal) {
    var index = -1,
        len = this.queryPairs.length,
        i,
        param;

    if (arguments.length === 3) {
      for (i = 0; i < len; i++) {
        param = this.queryPairs[i];
        if (decode(param[0]) === decode(key) && decodeURIComponent(param[1]) === decode(oldVal)) {
          index = i;
          break;
        }
      }
      if (index >= 0) {
        this.deleteQueryParam(key, decode(oldVal)).addQueryParam(key, newVal, index);
      }
    } else {
      for (i = 0; i < len; i++) {
        param = this.queryPairs[i];
        if (decode(param[0]) === decode(key)) {
          index = i;
          break;
        }
      }
      this.deleteQueryParam(key);
      this.addQueryParam(key, newVal, index);
    }
    return this;
  };

  /**
   * Define fluent setter methods (setProtocol, setHasAuthorityPrefix, etc)
   */
  ['protocol', 'hasAuthorityPrefix', 'isColonUri', 'userInfo', 'host', 'port', 'path', 'query', 'anchor'].forEach(function (key) {
    var method = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
    Uri.prototype[method] = function (val) {
      this[key](val);
      return this;
    };
  });

  /**
   * Scheme name, colon and doubleslash, as required
   * @return {string} http:// or possibly just //
   */
  Uri.prototype.scheme = function () {
    var s = '';

    if (this.protocol()) {
      s += this.protocol();
      if (this.protocol().indexOf(':') !== this.protocol().length - 1) {
        s += ':';
      }
      s += '//';
    } else {
      if (this.hasAuthorityPrefix() && this.host()) {
        s += '//';
      }
    }

    return s;
  };

  /**
   * Same as Mozilla nsIURI.prePath
   * @return {string} scheme://user:password@host:port
   * @see  https://developer.mozilla.org/en/nsIURI
   */
  Uri.prototype.origin = function () {
    var s = this.scheme();

    if (this.userInfo() && this.host()) {
      s += this.userInfo();
      if (this.userInfo().indexOf('@') !== this.userInfo().length - 1) {
        s += '@';
      }
    }

    if (this.host()) {
      s += this.host();
      if (this.port() || this.path() && this.path().substr(0, 1).match(/[0-9]/)) {
        s += ':' + this.port();
      }
    }

    return s;
  };

  /**
   * Adds a trailing slash to the path
   */
  Uri.prototype.addTrailingSlash = function () {
    var path = this.path() || '';

    if (path.substr(-1) !== '/') {
      this.path(path + '/');
    }

    return this;
  };

  /**
   * Serializes the internal state of the Uri object
   * @return {string}
   */
  Uri.prototype.toString = function () {
    var path,
        s = this.origin();

    if (this.isColonUri()) {
      if (this.path()) {
        s += ':' + this.path();
      }
    } else if (this.path()) {
      path = this.path();
      if (!(re.ends_with_slashes.test(s) || re.starts_with_slashes.test(path))) {
        s += '/';
      } else {
        if (s) {
          s.replace(re.ends_with_slashes, '/');
        }
        path = path.replace(re.starts_with_slashes, '/');
      }
      s += path;
    } else {
      if (this.host() && (this.query().toString() || this.anchor())) {
        s += '/';
      }
    }
    if (this.query().toString()) {
      s += this.query().toString();
    }

    if (this.anchor()) {
      if (this.anchor().indexOf('#') !== 0) {
        s += '#';
      }
      s += this.anchor();
    }

    return s;
  };

  /**
   * Clone a Uri object
   * @return {Uri} duplicate copy of the Uri
   */
  Uri.prototype.clone = function () {
    return new Uri(this.toString());
  };

  /**
   * export via AMD or CommonJS, otherwise leak a global
   */
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return Uri;
    });
  } else if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Uri;
  } else {
    global.Uri = Uri;
  }
})(undefined);
/*globals define, module */


},{}],"/home/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js":[function(require,module,exports){
'use strict';(function webpackUniversalModuleDefinition(root,factory){if(typeof exports === 'object' && typeof module === 'object')module.exports = factory(require("react"));else if(typeof define === 'function' && define.amd)define(["react"],factory);else if(typeof exports === 'object')exports["ReactRouter"] = factory(require("react"));else root["ReactRouter"] = factory(root["React"]);})(undefined,function(__WEBPACK_EXTERNAL_MODULE_21__){return  (/******/(function(modules){ // webpackBootstrap
/******/ // The module cache
/******/var installedModules={}; /******/ /******/ // The require function
/******/function __webpack_require__(moduleId){ /******/ /******/ // Check if module is in cache
/******/if(installedModules[moduleId]) /******/return installedModules[moduleId].exports; /******/ /******/ // Create a new module (and put it into the cache)
/******/var module=installedModules[moduleId] = { /******/exports:{}, /******/id:moduleId, /******/loaded:false /******/}; /******/ /******/ // Execute the module function
/******/modules[moduleId].call(module.exports,module,module.exports,__webpack_require__); /******/ /******/ // Flag the module as loaded
/******/module.loaded = true; /******/ /******/ // Return the exports of the module
/******/return module.exports; /******/} /******/ /******/ /******/ // expose the modules object (__webpack_modules__)
/******/__webpack_require__.m = modules; /******/ /******/ // expose the module cache
/******/__webpack_require__.c = installedModules; /******/ /******/ // __webpack_public_path__
/******/__webpack_require__.p = ""; /******/ /******/ // Load entry module and return exports
/******/return __webpack_require__(0); /******/})( /************************************************************************/ /******/[ /* 0 */function(module,exports,__webpack_require__){'use strict';exports.DefaultRoute = __webpack_require__(1);exports.Link = __webpack_require__(2);exports.NotFoundRoute = __webpack_require__(3);exports.Redirect = __webpack_require__(4);exports.Route = __webpack_require__(5);exports.ActiveHandler = __webpack_require__(6);exports.RouteHandler = exports.ActiveHandler;exports.HashLocation = __webpack_require__(7);exports.HistoryLocation = __webpack_require__(8);exports.RefreshLocation = __webpack_require__(9);exports.StaticLocation = __webpack_require__(10);exports.TestLocation = __webpack_require__(11);exports.ImitateBrowserBehavior = __webpack_require__(12);exports.ScrollToTopBehavior = __webpack_require__(13);exports.History = __webpack_require__(14);exports.Navigation = __webpack_require__(15);exports.State = __webpack_require__(16);exports.createRoute = __webpack_require__(17).createRoute;exports.createDefaultRoute = __webpack_require__(17).createDefaultRoute;exports.createNotFoundRoute = __webpack_require__(17).createNotFoundRoute;exports.createRedirect = __webpack_require__(17).createRedirect;exports.createRoutesFromReactChildren = __webpack_require__(18);exports.create = __webpack_require__(19);exports.run = __webpack_require__(20); /***/}, /* 1 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var PropTypes=__webpack_require__(22);var RouteHandler=__webpack_require__(6);var Route=__webpack_require__(5); /**
	 * A <DefaultRoute> component is a special kind of <Route> that
	 * renders when its parent matches but none of its siblings do.
	 * Only one such route may be used at any given level in the
	 * route hierarchy.
	 */var DefaultRoute=(function(_Route){function DefaultRoute(){_classCallCheck(this,DefaultRoute);if(_Route != null){_Route.apply(this,arguments);}}_inherits(DefaultRoute,_Route);return DefaultRoute;})(Route); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
DefaultRoute.propTypes = {name:PropTypes.string,path:PropTypes.falsy,children:PropTypes.falsy,handler:PropTypes.func.isRequired};DefaultRoute.defaultProps = {handler:RouteHandler};module.exports = DefaultRoute; /***/}, /* 2 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var React=__webpack_require__(21);var assign=__webpack_require__(33);var PropTypes=__webpack_require__(22);function isLeftClickEvent(event){return event.button === 0;}function isModifiedEvent(event){return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);} /**
	 * <Link> components are used to create an <a> element that links to a route.
	 * When that route is active, the link gets an "active" class name (or the
	 * value of its `activeClassName` prop).
	 *
	 * For example, assuming you have the following route:
	 *
	 *   <Route name="showPost" path="/posts/:postID" handler={Post}/>
	 *
	 * You could use the following component to link to that route:
	 *
	 *   <Link to="showPost" params={{ postID: "123" }} />
	 *
	 * In addition to params, links may pass along query string parameters
	 * using the `query` prop.
	 *
	 *   <Link to="showPost" params={{ postID: "123" }} query={{ show:true }}/>
	 */var Link=(function(_React$Component){function Link(){_classCallCheck(this,Link);if(_React$Component != null){_React$Component.apply(this,arguments);}}_inherits(Link,_React$Component);_createClass(Link,[{key:'handleClick',value:function handleClick(event){var allowTransition=true;var clickResult;if(this.props.onClick)clickResult = this.props.onClick(event);if(isModifiedEvent(event) || !isLeftClickEvent(event)){return;}if(clickResult === false || event.defaultPrevented === true)allowTransition = false;event.preventDefault();if(allowTransition)this.context.router.transitionTo(this.props.to,this.props.params,this.props.query);}},{key:'getHref', /**
	     * Returns the value of the "href" attribute to use on the DOM element.
	     */value:function getHref(){return this.context.router.makeHref(this.props.to,this.props.params,this.props.query);}},{key:'getClassName', /**
	     * Returns the value of the "class" attribute to use on the DOM element, which contains
	     * the value of the activeClassName property when this <Link> is active.
	     */value:function getClassName(){var className=this.props.className;if(this.getActiveState())className += ' ' + this.props.activeClassName;return className;}},{key:'getActiveState',value:function getActiveState(){return this.context.router.isActive(this.props.to,this.props.params,this.props.query);}},{key:'render',value:function render(){var props=assign({},this.props,{href:this.getHref(),className:this.getClassName(),onClick:this.handleClick.bind(this)});if(props.activeStyle && this.getActiveState())props.style = props.activeStyle;return React.DOM.a(props,this.props.children);}}]);return Link;})(React.Component); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
Link.contextTypes = {router:PropTypes.router.isRequired};Link.propTypes = {activeClassName:PropTypes.string.isRequired,to:PropTypes.oneOfType([PropTypes.string,PropTypes.route]).isRequired,params:PropTypes.object,query:PropTypes.object,activeStyle:PropTypes.object,onClick:PropTypes.func};Link.defaultProps = {activeClassName:'active',className:''};module.exports = Link; /***/}, /* 3 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var PropTypes=__webpack_require__(22);var RouteHandler=__webpack_require__(6);var Route=__webpack_require__(5); /**
	 * A <NotFoundRoute> is a special kind of <Route> that
	 * renders when the beginning of its parent's path matches
	 * but none of its siblings do, including any <DefaultRoute>.
	 * Only one such route may be used at any given level in the
	 * route hierarchy.
	 */var NotFoundRoute=(function(_Route){function NotFoundRoute(){_classCallCheck(this,NotFoundRoute);if(_Route != null){_Route.apply(this,arguments);}}_inherits(NotFoundRoute,_Route);return NotFoundRoute;})(Route); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
NotFoundRoute.propTypes = {name:PropTypes.string,path:PropTypes.falsy,children:PropTypes.falsy,handler:PropTypes.func.isRequired};NotFoundRoute.defaultProps = {handler:RouteHandler};module.exports = NotFoundRoute; /***/}, /* 4 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var PropTypes=__webpack_require__(22);var Route=__webpack_require__(5); /**
	 * A <Redirect> component is a special kind of <Route> that always
	 * redirects to another route when it matches.
	 */var Redirect=(function(_Route){function Redirect(){_classCallCheck(this,Redirect);if(_Route != null){_Route.apply(this,arguments);}}_inherits(Redirect,_Route);return Redirect;})(Route); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
Redirect.propTypes = {path:PropTypes.string,from:PropTypes.string, // Alias for path.
to:PropTypes.string,handler:PropTypes.falsy}; // Redirects should not have a default handler
Redirect.defaultProps = {};module.exports = Redirect; /***/}, /* 5 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var React=__webpack_require__(21);var invariant=__webpack_require__(34);var PropTypes=__webpack_require__(22);var RouteHandler=__webpack_require__(6); /**
	 * <Route> components specify components that are rendered to the page when the
	 * URL matches a given pattern.
	 *
	 * Routes are arranged in a nested tree structure. When a new URL is requested,
	 * the tree is searched depth-first to find a route whose path matches the URL.
	 * When one is found, all routes in the tree that lead to it are considered
	 * "active" and their components are rendered into the DOM, nested in the same
	 * order as they are in the tree.
	 *
	 * The preferred way to configure a router is using JSX. The XML-like syntax is
	 * a great way to visualize how routes are laid out in an application.
	 *
	 *   var routes = [
	 *     <Route handler={App}>
	 *       <Route name="login" handler={Login}/>
	 *       <Route name="logout" handler={Logout}/>
	 *       <Route name="about" handler={About}/>
	 *     </Route>
	 *   ];
	 *   
	 *   Router.run(routes, function (Handler) {
	 *     React.render(<Handler/>, document.body);
	 *   });
	 *
	 * Handlers for Route components that contain children can render their active
	 * child route using a <RouteHandler> element.
	 *
	 *   var App = React.createClass({
	 *     render: function () {
	 *       return (
	 *         <div class="application">
	 *           <RouteHandler/>
	 *         </div>
	 *       );
	 *     }
	 *   });
	 *
	 * If no handler is provided for the route, it will render a matched child route.
	 */var Route=(function(_React$Component){function Route(){_classCallCheck(this,Route);if(_React$Component != null){_React$Component.apply(this,arguments);}}_inherits(Route,_React$Component);_createClass(Route,[{key:'render',value:function render(){invariant(false,'%s elements are for router configuration only and should not be rendered',this.constructor.name);}}]);return Route;})(React.Component); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
Route.propTypes = {name:PropTypes.string,path:PropTypes.string,handler:PropTypes.func,ignoreScrollBehavior:PropTypes.bool};Route.defaultProps = {handler:RouteHandler};module.exports = Route; /***/}, /* 6 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;};var React=__webpack_require__(21);var ContextWrapper=__webpack_require__(23);var assign=__webpack_require__(33);var PropTypes=__webpack_require__(22);var REF_NAME='__routeHandler__'; /**
	 * A <RouteHandler> component renders the active child route handler
	 * when routes are nested.
	 */var RouteHandler=(function(_React$Component){function RouteHandler(){_classCallCheck(this,RouteHandler);if(_React$Component != null){_React$Component.apply(this,arguments);}}_inherits(RouteHandler,_React$Component);_createClass(RouteHandler,[{key:'getChildContext',value:function getChildContext(){return {routeDepth:this.context.routeDepth + 1};}},{key:'componentDidMount',value:function componentDidMount(){this._updateRouteComponent(this.refs[REF_NAME]);}},{key:'componentDidUpdate',value:function componentDidUpdate(){this._updateRouteComponent(this.refs[REF_NAME]);}},{key:'componentWillUnmount',value:function componentWillUnmount(){this._updateRouteComponent(null);}},{key:'_updateRouteComponent',value:function _updateRouteComponent(component){this.context.router.setRouteComponentAtDepth(this.getRouteDepth(),component);}},{key:'getRouteDepth',value:function getRouteDepth(){return this.context.routeDepth;}},{key:'createChildRouteHandler',value:function createChildRouteHandler(props){var route=this.context.router.getRouteAtDepth(this.getRouteDepth());if(route == null){return null;}var childProps=assign({},props || this.props,{ref:REF_NAME,params:this.context.router.getCurrentParams(),query:this.context.router.getCurrentQuery()});return React.createElement(route.handler,childProps);}},{key:'render',value:function render(){var handler=this.createChildRouteHandler(); // <script/> for things like <CSSTransitionGroup/> that don't like null
return handler?React.createElement(ContextWrapper,null,handler):React.createElement('script',null);}}]);return RouteHandler;})(React.Component); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
RouteHandler.contextTypes = {routeDepth:PropTypes.number.isRequired,router:PropTypes.router.isRequired};RouteHandler.childContextTypes = {routeDepth:PropTypes.number.isRequired};module.exports = RouteHandler; /***/}, /* 7 */function(module,exports,__webpack_require__){'use strict';var LocationActions=__webpack_require__(24);var History=__webpack_require__(14);var _listeners=[];var _isListening=false;var _actionType;function notifyChange(type){if(type === LocationActions.PUSH)History.length += 1;var change={path:HashLocation.getCurrentPath(),type:type};_listeners.forEach(function(listener){listener.call(HashLocation,change);});}function ensureSlash(){var path=HashLocation.getCurrentPath();if(path.charAt(0) === '/'){return true;}HashLocation.replace('/' + path);return false;}function onHashChange(){if(ensureSlash()){ // If we don't have an _actionType then all we know is the hash
// changed. It was probably caused by the user clicking the Back
// button, but may have also been the Forward button or manual
// manipulation. So just guess 'pop'.
var curActionType=_actionType;_actionType = null;notifyChange(curActionType || LocationActions.POP);}} /**
	 * A Location that uses `window.location.hash`.
	 */var HashLocation={addChangeListener:function addChangeListener(listener){_listeners.push(listener); // Do this BEFORE listening for hashchange.
ensureSlash();if(!_isListening){if(window.addEventListener){window.addEventListener('hashchange',onHashChange,false);}else {window.attachEvent('onhashchange',onHashChange);}_isListening = true;}},removeChangeListener:function removeChangeListener(listener){_listeners = _listeners.filter(function(l){return l !== listener;});if(_listeners.length === 0){if(window.removeEventListener){window.removeEventListener('hashchange',onHashChange,false);}else {window.removeEvent('onhashchange',onHashChange);}_isListening = false;}},push:function push(path){_actionType = LocationActions.PUSH;window.location.hash = path;},replace:function replace(path){_actionType = LocationActions.REPLACE;window.location.replace(window.location.pathname + window.location.search + '#' + path);},pop:function pop(){_actionType = LocationActions.POP;History.back();},getCurrentPath:function getCurrentPath(){return decodeURI( // We can't use window.location.hash here because it's not
// consistent across browsers - Firefox will pre-decode it!
window.location.href.split('#')[1] || '');},toString:function toString(){return '<HashLocation>';}};module.exports = HashLocation; /***/}, /* 8 */function(module,exports,__webpack_require__){'use strict';var LocationActions=__webpack_require__(24);var History=__webpack_require__(14);var _listeners=[];var _isListening=false;function notifyChange(type){var change={path:HistoryLocation.getCurrentPath(),type:type};_listeners.forEach(function(listener){listener.call(HistoryLocation,change);});}function onPopState(event){if(event.state === undefined){return;} // Ignore extraneous popstate events in WebKit.
notifyChange(LocationActions.POP);} /**
	 * A Location that uses HTML5 history.
	 */var HistoryLocation={addChangeListener:function addChangeListener(listener){_listeners.push(listener);if(!_isListening){if(window.addEventListener){window.addEventListener('popstate',onPopState,false);}else {window.attachEvent('onpopstate',onPopState);}_isListening = true;}},removeChangeListener:function removeChangeListener(listener){_listeners = _listeners.filter(function(l){return l !== listener;});if(_listeners.length === 0){if(window.addEventListener){window.removeEventListener('popstate',onPopState,false);}else {window.removeEvent('onpopstate',onPopState);}_isListening = false;}},push:function push(path){window.history.pushState({path:path},'',path);History.length += 1;notifyChange(LocationActions.PUSH);},replace:function replace(path){window.history.replaceState({path:path},'',path);notifyChange(LocationActions.REPLACE);},pop:History.back,getCurrentPath:function getCurrentPath(){return decodeURI(window.location.pathname + window.location.search);},toString:function toString(){return '<HistoryLocation>';}};module.exports = HistoryLocation; /***/}, /* 9 */function(module,exports,__webpack_require__){'use strict';var HistoryLocation=__webpack_require__(8);var History=__webpack_require__(14); /**
	 * A Location that uses full page refreshes. This is used as
	 * the fallback for HistoryLocation in browsers that do not
	 * support the HTML5 history API.
	 */var RefreshLocation={push:function push(path){window.location = path;},replace:function replace(path){window.location.replace(path);},pop:History.back,getCurrentPath:HistoryLocation.getCurrentPath,toString:function toString(){return '<RefreshLocation>';}};module.exports = RefreshLocation; /***/}, /* 10 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var invariant=__webpack_require__(34);function throwCannotModify(){invariant(false,'You cannot modify a static location');} /**
	 * A location that only ever contains a single path. Useful in
	 * stateless environments like servers where there is no path history,
	 * only the path that was used in the request.
	 */var StaticLocation=(function(){function StaticLocation(path){_classCallCheck(this,StaticLocation);this.path = path;}_createClass(StaticLocation,[{key:'getCurrentPath',value:function getCurrentPath(){return this.path;}},{key:'toString',value:function toString(){return '<StaticLocation path="' + this.path + '">';}}]);return StaticLocation;})(); // TODO: Include these in the above class definition
// once we can use ES7 property initializers.
// https://github.com/babel/babel/issues/619
StaticLocation.prototype.push = throwCannotModify;StaticLocation.prototype.replace = throwCannotModify;StaticLocation.prototype.pop = throwCannotModify;module.exports = StaticLocation; /***/}, /* 11 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var invariant=__webpack_require__(34);var LocationActions=__webpack_require__(24);var History=__webpack_require__(14); /**
	 * A location that is convenient for testing and does not require a DOM.
	 */var TestLocation=(function(){function TestLocation(history){_classCallCheck(this,TestLocation);this.history = history || [];this.listeners = [];this._updateHistoryLength();}_createClass(TestLocation,[{key:'needsDOM',get:function get(){return false;}},{key:'_updateHistoryLength',value:function _updateHistoryLength(){History.length = this.history.length;}},{key:'_notifyChange',value:function _notifyChange(type){var change={path:this.getCurrentPath(),type:type};for(var i=0,len=this.listeners.length;i < len;++i) this.listeners[i].call(this,change);}},{key:'addChangeListener',value:function addChangeListener(listener){this.listeners.push(listener);}},{key:'removeChangeListener',value:function removeChangeListener(listener){this.listeners = this.listeners.filter(function(l){return l !== listener;});}},{key:'push',value:function push(path){this.history.push(path);this._updateHistoryLength();this._notifyChange(LocationActions.PUSH);}},{key:'replace',value:function replace(path){invariant(this.history.length,'You cannot replace the current path with no history');this.history[this.history.length - 1] = path;this._notifyChange(LocationActions.REPLACE);}},{key:'pop',value:function pop(){this.history.pop();this._updateHistoryLength();this._notifyChange(LocationActions.POP);}},{key:'getCurrentPath',value:function getCurrentPath(){return this.history[this.history.length - 1];}},{key:'toString',value:function toString(){return '<TestLocation>';}}]);return TestLocation;})();module.exports = TestLocation; /***/}, /* 12 */function(module,exports,__webpack_require__){'use strict';var LocationActions=__webpack_require__(24); /**
	 * A scroll behavior that attempts to imitate the default behavior
	 * of modern browsers.
	 */var ImitateBrowserBehavior={updateScrollPosition:function updateScrollPosition(position,actionType){switch(actionType){case LocationActions.PUSH:case LocationActions.REPLACE:window.scrollTo(0,0);break;case LocationActions.POP:if(position){window.scrollTo(position.x,position.y);}else {window.scrollTo(0,0);}break;}}};module.exports = ImitateBrowserBehavior; /***/}, /* 13 */function(module,exports,__webpack_require__){ /**
	 * A scroll behavior that always scrolls to the top of the page
	 * after a transition.
	 */"use strict";var ScrollToTopBehavior={updateScrollPosition:function updateScrollPosition(){window.scrollTo(0,0);}};module.exports = ScrollToTopBehavior; /***/}, /* 14 */function(module,exports,__webpack_require__){'use strict';var invariant=__webpack_require__(34);var canUseDOM=__webpack_require__(35).canUseDOM;var History={ /**
	   * The current number of entries in the history.
	   *
	   * Note: This property is read-only.
	   */length:1, /**
	   * Sends the browser back one entry in the history.
	   */back:function back(){invariant(canUseDOM,'Cannot use History.back without a DOM'); // Do this first so that History.length will
// be accurate in location change listeners.
History.length -= 1;window.history.back();}};module.exports = History; /***/}, /* 15 */function(module,exports,__webpack_require__){'use strict';var PropTypes=__webpack_require__(22); /**
	 * A mixin for components that modify the URL.
	 *
	 * Example:
	 *
	 *   var MyLink = React.createClass({
	 *     mixins: [ Router.Navigation ],
	 *     handleClick(event) {
	 *       event.preventDefault();
	 *       this.transitionTo('aRoute', { the: 'params' }, { the: 'query' });
	 *     },
	 *     render() {
	 *       return (
	 *         <a onClick={this.handleClick}>Click me!</a>
	 *       );
	 *     }
	 *   });
	 */var Navigation={contextTypes:{router:PropTypes.router.isRequired}, /**
	   * Returns an absolute URL path created from the given route
	   * name, URL parameters, and query values.
	   */makePath:function makePath(to,params,query){return this.context.router.makePath(to,params,query);}, /**
	   * Returns a string that may safely be used as the href of a
	   * link to the route with the given name.
	   */makeHref:function makeHref(to,params,query){return this.context.router.makeHref(to,params,query);}, /**
	   * Transitions to the URL specified in the arguments by pushing
	   * a new URL onto the history stack.
	   */transitionTo:function transitionTo(to,params,query){this.context.router.transitionTo(to,params,query);}, /**
	   * Transitions to the URL specified in the arguments by replacing
	   * the current URL in the history stack.
	   */replaceWith:function replaceWith(to,params,query){this.context.router.replaceWith(to,params,query);}, /**
	   * Transitions to the previous URL.
	   */goBack:function goBack(){return this.context.router.goBack();}};module.exports = Navigation; /***/}, /* 16 */function(module,exports,__webpack_require__){'use strict';var PropTypes=__webpack_require__(22); /**
	 * A mixin for components that need to know the path, routes, URL
	 * params and query that are currently active.
	 *
	 * Example:
	 *
	 *   var AboutLink = React.createClass({
	 *     mixins: [ Router.State ],
	 *     render() {
	 *       var className = this.props.className;
	 *
	 *       if (this.isActive('about'))
	 *         className += ' is-active';
	 *
	 *       return React.DOM.a({ className: className }, this.props.children);
	 *     }
	 *   });
	 */var State={contextTypes:{router:PropTypes.router.isRequired}, /**
	   * Returns the current URL path.
	   */getPath:function getPath(){return this.context.router.getCurrentPath();}, /**
	   * Returns the current URL path without the query string.
	   */getPathname:function getPathname(){return this.context.router.getCurrentPathname();}, /**
	   * Returns an object of the URL params that are currently active.
	   */getParams:function getParams(){return this.context.router.getCurrentParams();}, /**
	   * Returns an object of the query params that are currently active.
	   */getQuery:function getQuery(){return this.context.router.getCurrentQuery();}, /**
	   * Returns an array of the routes that are currently active.
	   */getRoutes:function getRoutes(){return this.context.router.getCurrentRoutes();}, /**
	   * A helper method to determine if a given route, params, and query
	   * are active.
	   */isActive:function isActive(to,params,query){return this.context.router.isActive(to,params,query);}};module.exports = State; /***/}, /* 17 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var assign=__webpack_require__(33);var invariant=__webpack_require__(34);var warning=__webpack_require__(36);var PathUtils=__webpack_require__(25);var _currentRoute;var Route=(function(){function Route(name,path,ignoreScrollBehavior,isDefault,isNotFound,onEnter,onLeave,handler){_classCallCheck(this,Route);this.name = name;this.path = path;this.paramNames = PathUtils.extractParamNames(this.path);this.ignoreScrollBehavior = !!ignoreScrollBehavior;this.isDefault = !!isDefault;this.isNotFound = !!isNotFound;this.onEnter = onEnter;this.onLeave = onLeave;this.handler = handler;}_createClass(Route,[{key:'appendChild', /**
	     * Appends the given route to this route's child routes.
	     */value:function appendChild(route){invariant(route instanceof Route,'route.appendChild must use a valid Route');if(!this.childRoutes)this.childRoutes = [];this.childRoutes.push(route);}},{key:'toString',value:function toString(){var string='<Route';if(this.name)string += ' name="' + this.name + '"';string += ' path="' + this.path + '">';return string;}}],[{key:'createRoute', /**
	     * Creates and returns a new route. Options may be a URL pathname string
	     * with placeholders for named params or an object with any of the following
	     * properties:
	     *
	     * - name                     The name of the route. This is used to lookup a
	     *                            route relative to its parent route and should be
	     *                            unique among all child routes of the same parent
	     * - path                     A URL pathname string with optional placeholders
	     *                            that specify the names of params to extract from
	     *                            the URL when the path matches. Defaults to `/${name}`
	     *                            when there is a name given, or the path of the parent
	     *                            route, or /
	     * - ignoreScrollBehavior     True to make this route (and all descendants) ignore
	     *                            the scroll behavior of the router
	     * - isDefault                True to make this route the default route among all
	     *                            its siblings
	     * - isNotFound               True to make this route the "not found" route among
	     *                            all its siblings
	     * - onEnter                  A transition hook that will be called when the
	     *                            router is going to enter this route
	     * - onLeave                  A transition hook that will be called when the
	     *                            router is going to leave this route
	     * - handler                  A React component that will be rendered when
	     *                            this route is active
	     * - parentRoute              The parent route to use for this route. This option
	     *                            is automatically supplied when creating routes inside
	     *                            the callback to another invocation of createRoute. You
	     *                            only ever need to use this when declaring routes
	     *                            independently of one another to manually piece together
	     *                            the route hierarchy
	     *
	     * The callback may be used to structure your route hierarchy. Any call to
	     * createRoute, createDefaultRoute, createNotFoundRoute, or createRedirect
	     * inside the callback automatically uses this route as its parent.
	     */value:function createRoute(options,callback){options = options || {};if(typeof options === 'string')options = {path:options};var parentRoute=_currentRoute;if(parentRoute){warning(options.parentRoute == null || options.parentRoute === parentRoute,'You should not use parentRoute with createRoute inside another route\'s child callback; it is ignored');}else {parentRoute = options.parentRoute;}var name=options.name;var path=options.path || name;if(path && !(options.isDefault || options.isNotFound)){if(PathUtils.isAbsolute(path)){if(parentRoute){invariant(path === parentRoute.path || parentRoute.paramNames.length === 0,'You cannot nest path "%s" inside "%s"; the parent requires URL parameters',path,parentRoute.path);}}else if(parentRoute){ // Relative paths extend their parent.
path = PathUtils.join(parentRoute.path,path);}else {path = '/' + path;}}else {path = parentRoute?parentRoute.path:'/';}if(options.isNotFound && !/\*$/.test(path))path += '*'; // Auto-append * to the path of not found routes.
var route=new Route(name,path,options.ignoreScrollBehavior,options.isDefault,options.isNotFound,options.onEnter,options.onLeave,options.handler);if(parentRoute){if(route.isDefault){invariant(parentRoute.defaultRoute == null,'%s may not have more than one default route',parentRoute);parentRoute.defaultRoute = route;}else if(route.isNotFound){invariant(parentRoute.notFoundRoute == null,'%s may not have more than one not found route',parentRoute);parentRoute.notFoundRoute = route;}parentRoute.appendChild(route);} // Any routes created in the callback
// use this route as their parent.
if(typeof callback === 'function'){var currentRoute=_currentRoute;_currentRoute = route;callback.call(route,route);_currentRoute = currentRoute;}return route;}},{key:'createDefaultRoute', /**
	     * Creates and returns a route that is rendered when its parent matches
	     * the current URL.
	     */value:function createDefaultRoute(options){return Route.createRoute(assign({},options,{isDefault:true}));}},{key:'createNotFoundRoute', /**
	     * Creates and returns a route that is rendered when its parent matches
	     * the current URL but none of its siblings do.
	     */value:function createNotFoundRoute(options){return Route.createRoute(assign({},options,{isNotFound:true}));}},{key:'createRedirect', /**
	     * Creates and returns a route that automatically redirects the transition
	     * to another route. In addition to the normal options to createRoute, this
	     * function accepts the following options:
	     *
	     * - from         An alias for the `path` option. Defaults to *
	     * - to           The path/route/route name to redirect to
	     * - params       The params to use in the redirect URL. Defaults
	     *                to using the current params
	     * - query        The query to use in the redirect URL. Defaults
	     *                to using the current query
	     */value:function createRedirect(options){return Route.createRoute(assign({},options,{path:options.path || options.from || '*',onEnter:function onEnter(transition,params,query){transition.redirect(options.to,options.params || params,options.query || query);}}));}}]);return Route;})();module.exports = Route; /***/}, /* 18 */function(module,exports,__webpack_require__){ /* jshint -W084 */'use strict';var React=__webpack_require__(21);var assign=__webpack_require__(33);var warning=__webpack_require__(36);var DefaultRoute=__webpack_require__(1);var NotFoundRoute=__webpack_require__(3);var Redirect=__webpack_require__(4);var Route=__webpack_require__(17);function checkPropTypes(componentName,propTypes,props){componentName = componentName || 'UnknownComponent';for(var propName in propTypes) {if(propTypes.hasOwnProperty(propName)){var error=propTypes[propName](props,propName,componentName);if(error instanceof Error)warning(false,error.message);}}}function createRouteOptions(props){var options=assign({},props);var handler=options.handler;if(handler){options.onEnter = handler.willTransitionTo;options.onLeave = handler.willTransitionFrom;}return options;}function createRouteFromReactElement(element){if(!React.isValidElement(element)){return;}var type=element.type;var props=assign({},type.defaultProps,element.props);if(type.propTypes)checkPropTypes(type.displayName,type.propTypes,props);if(type === DefaultRoute){return Route.createDefaultRoute(createRouteOptions(props));}if(type === NotFoundRoute){return Route.createNotFoundRoute(createRouteOptions(props));}if(type === Redirect){return Route.createRedirect(createRouteOptions(props));}return Route.createRoute(createRouteOptions(props),function(){if(props.children)createRoutesFromReactChildren(props.children);});} /**
	 * Creates and returns an array of routes created from the given
	 * ReactChildren, all of which should be one of <Route>, <DefaultRoute>,
	 * <NotFoundRoute>, or <Redirect>, e.g.:
	 *
	 *   var { createRoutesFromReactChildren, Route, Redirect } = require('react-router');
	 *
	 *   var routes = createRoutesFromReactChildren(
	 *     <Route path="/" handler={App}>
	 *       <Route name="user" path="/user/:userId" handler={User}>
	 *         <Route name="task" path="tasks/:taskId" handler={Task}/>
	 *         <Redirect from="todos/:taskId" to="task"/>
	 *       </Route>
	 *     </Route>
	 *   );
	 */function createRoutesFromReactChildren(children){var routes=[];React.Children.forEach(children,function(child){if(child = createRouteFromReactElement(child))routes.push(child);});return routes;}module.exports = createRoutesFromReactChildren; /***/}, /* 19 */function(module,exports,__webpack_require__){ /* jshint -W058 */'use strict';var React=__webpack_require__(21);var warning=__webpack_require__(36);var invariant=__webpack_require__(34);var canUseDOM=__webpack_require__(35).canUseDOM;var LocationActions=__webpack_require__(24);var ImitateBrowserBehavior=__webpack_require__(12);var HashLocation=__webpack_require__(7);var HistoryLocation=__webpack_require__(8);var RefreshLocation=__webpack_require__(9);var StaticLocation=__webpack_require__(10);var ScrollHistory=__webpack_require__(26);var createRoutesFromReactChildren=__webpack_require__(18);var isReactChildren=__webpack_require__(27);var Transition=__webpack_require__(28);var PropTypes=__webpack_require__(22);var Redirect=__webpack_require__(29);var History=__webpack_require__(14);var Cancellation=__webpack_require__(30);var Match=__webpack_require__(31);var Route=__webpack_require__(17);var supportsHistory=__webpack_require__(32);var PathUtils=__webpack_require__(25); /**
	 * The default location for new routers.
	 */var DEFAULT_LOCATION=canUseDOM?HashLocation:'/'; /**
	 * The default scroll behavior for new routers.
	 */var DEFAULT_SCROLL_BEHAVIOR=canUseDOM?ImitateBrowserBehavior:null;function hasProperties(object,properties){for(var propertyName in properties) if(properties.hasOwnProperty(propertyName) && object[propertyName] !== properties[propertyName]){return false;}return true;}function hasMatch(routes,route,prevParams,nextParams,prevQuery,nextQuery){return routes.some(function(r){if(r !== route)return false;var paramNames=route.paramNames;var paramName; // Ensure that all params the route cares about did not change.
for(var i=0,len=paramNames.length;i < len;++i) {paramName = paramNames[i];if(nextParams[paramName] !== prevParams[paramName])return false;} // Ensure the query hasn't changed.
return hasProperties(prevQuery,nextQuery) && hasProperties(nextQuery,prevQuery);});}function addRoutesToNamedRoutes(routes,namedRoutes){var route;for(var i=0,len=routes.length;i < len;++i) {route = routes[i];if(route.name){invariant(namedRoutes[route.name] == null,'You may not have more than one route named "%s"',route.name);namedRoutes[route.name] = route;}if(route.childRoutes)addRoutesToNamedRoutes(route.childRoutes,namedRoutes);}}function routeIsActive(activeRoutes,routeName){return activeRoutes.some(function(route){return route.name === routeName;});}function paramsAreActive(activeParams,params){for(var property in params) if(String(activeParams[property]) !== String(params[property])){return false;}return true;}function queryIsActive(activeQuery,query){for(var property in query) if(String(activeQuery[property]) !== String(query[property])){return false;}return true;} /**
	 * Creates and returns a new router using the given options. A router
	 * is a ReactComponent class that knows how to react to changes in the
	 * URL and keep the contents of the page in sync.
	 *
	 * Options may be any of the following:
	 *
	 * - routes           (required) The route config
	 * - location         The location to use. Defaults to HashLocation when
	 *                    the DOM is available, "/" otherwise
	 * - scrollBehavior   The scroll behavior to use. Defaults to ImitateBrowserBehavior
	 *                    when the DOM is available, null otherwise
	 * - onError          A function that is used to handle errors
	 * - onAbort          A function that is used to handle aborted transitions
	 *
	 * When rendering in a server-side environment, the location should simply
	 * be the URL path that was used in the request, including the query string.
	 */function createRouter(options){options = options || {};if(isReactChildren(options))options = {routes:options};var mountedComponents=[];var location=options.location || DEFAULT_LOCATION;var scrollBehavior=options.scrollBehavior || DEFAULT_SCROLL_BEHAVIOR;var state={};var nextState={};var pendingTransition=null;var dispatchHandler=null;if(typeof location === 'string')location = new StaticLocation(location);if(location instanceof StaticLocation){warning(!canUseDOM || "production" === 'test','You should not use a static location in a DOM environment because ' + 'the router will not be kept in sync with the current URL');}else {invariant(canUseDOM || location.needsDOM === false,'You cannot use %s without a DOM',location);} // Automatically fall back to full page refreshes in
// browsers that don't support the HTML history API.
if(location === HistoryLocation && !supportsHistory())location = RefreshLocation;var Router=React.createClass({displayName:'Router',statics:{isRunning:false,cancelPendingTransition:function cancelPendingTransition(){if(pendingTransition){pendingTransition.cancel();pendingTransition = null;}},clearAllRoutes:function clearAllRoutes(){Router.cancelPendingTransition();Router.namedRoutes = {};Router.routes = [];}, /**
	       * Adds routes to this router from the given children object (see ReactChildren).
	       */addRoutes:function addRoutes(routes){if(isReactChildren(routes))routes = createRoutesFromReactChildren(routes);addRoutesToNamedRoutes(routes,Router.namedRoutes);Router.routes.push.apply(Router.routes,routes);}, /**
	       * Replaces routes of this router from the given children object (see ReactChildren).
	       */replaceRoutes:function replaceRoutes(routes){Router.clearAllRoutes();Router.addRoutes(routes);Router.refresh();}, /**
	       * Performs a match of the given path against this router and returns an object
	       * with the { routes, params, pathname, query } that match. Returns null if no
	       * match can be made.
	       */match:function match(path){return Match.findMatch(Router.routes,path);}, /**
	       * Returns an absolute URL path created from the given route
	       * name, URL parameters, and query.
	       */makePath:function makePath(to,params,query){var path;if(PathUtils.isAbsolute(to)){path = to;}else {var route=to instanceof Route?to:Router.namedRoutes[to];invariant(route instanceof Route,'Cannot find a route named "%s"',to);path = route.path;}return PathUtils.withQuery(PathUtils.injectParams(path,params),query);}, /**
	       * Returns a string that may safely be used as the href of a link
	       * to the route with the given name, URL parameters, and query.
	       */makeHref:function makeHref(to,params,query){var path=Router.makePath(to,params,query);return location === HashLocation?'#' + path:path;}, /**
	       * Transitions to the URL specified in the arguments by pushing
	       * a new URL onto the history stack.
	       */transitionTo:function transitionTo(to,params,query){var path=Router.makePath(to,params,query);if(pendingTransition){ // Replace so pending location does not stay in history.
location.replace(path);}else {location.push(path);}}, /**
	       * Transitions to the URL specified in the arguments by replacing
	       * the current URL in the history stack.
	       */replaceWith:function replaceWith(to,params,query){location.replace(Router.makePath(to,params,query));}, /**
	       * Transitions to the previous URL if one is available. Returns true if the
	       * router was able to go back, false otherwise.
	       *
	       * Note: The router only tracks history entries in your application, not the
	       * current browser session, so you can safely call this function without guarding
	       * against sending the user back to some other site. However, when using
	       * RefreshLocation (which is the fallback for HistoryLocation in browsers that
	       * don't support HTML5 history) this method will *always* send the client back
	       * because we cannot reliably track history length.
	       */goBack:function goBack(){if(History.length > 1 || location === RefreshLocation){location.pop();return true;}warning(false,'goBack() was ignored because there is no router history');return false;},handleAbort:options.onAbort || function(abortReason){if(location instanceof StaticLocation)throw new Error('Unhandled aborted transition! Reason: ' + abortReason);if(abortReason instanceof Cancellation){return;}else if(abortReason instanceof Redirect){location.replace(Router.makePath(abortReason.to,abortReason.params,abortReason.query));}else {location.pop();}},handleError:options.onError || function(error){ // Throw so we don't silently swallow async errors.
throw error; // This error probably originated in a transition hook.
},handleLocationChange:function handleLocationChange(change){Router.dispatch(change.path,change.type);}, /**
	       * Performs a transition to the given path and calls callback(error, abortReason)
	       * when the transition is finished. If both arguments are null the router's state
	       * was updated. Otherwise the transition did not complete.
	       *
	       * In a transition, a router first determines which routes are involved by beginning
	       * with the current route, up the route tree to the first parent route that is shared
	       * with the destination route, and back down the tree to the destination route. The
	       * willTransitionFrom hook is invoked on all route handlers we're transitioning away
	       * from, in reverse nesting order. Likewise, the willTransitionTo hook is invoked on
	       * all route handlers we're transitioning to.
	       *
	       * Both willTransitionFrom and willTransitionTo hooks may either abort or redirect the
	       * transition. To resolve asynchronously, they may use the callback argument. If no
	       * hooks wait, the transition is fully synchronous.
	       */dispatch:function dispatch(path,action){Router.cancelPendingTransition();var prevPath=state.path;var isRefreshing=action == null;if(prevPath === path && !isRefreshing){return;} // Nothing to do!
// Record the scroll position as early as possible to
// get it before browsers try update it automatically.
if(prevPath && action === LocationActions.PUSH)Router.recordScrollPosition(prevPath);var match=Router.match(path);warning(match != null,'No route matches path "%s". Make sure you have <Route path="%s"> somewhere in your routes',path,path);if(match == null)match = {};var prevRoutes=state.routes || [];var prevParams=state.params || {};var prevQuery=state.query || {};var nextRoutes=match.routes || [];var nextParams=match.params || {};var nextQuery=match.query || {};var fromRoutes,toRoutes;if(prevRoutes.length){fromRoutes = prevRoutes.filter(function(route){return !hasMatch(nextRoutes,route,prevParams,nextParams,prevQuery,nextQuery);});toRoutes = nextRoutes.filter(function(route){return !hasMatch(prevRoutes,route,prevParams,nextParams,prevQuery,nextQuery);});}else {fromRoutes = [];toRoutes = nextRoutes;}var transition=new Transition(path,Router.replaceWith.bind(Router,path));pendingTransition = transition;var fromComponents=mountedComponents.slice(prevRoutes.length - fromRoutes.length);Transition.from(transition,fromRoutes,fromComponents,function(error){if(error || transition.abortReason)return dispatchHandler.call(Router,error,transition); // No need to continue.
Transition.to(transition,toRoutes,nextParams,nextQuery,function(error){dispatchHandler.call(Router,error,transition,{path:path,action:action,pathname:match.pathname,routes:nextRoutes,params:nextParams,query:nextQuery});});});}, /**
	       * Starts this router and calls callback(router, state) when the route changes.
	       *
	       * If the router's location is static (i.e. a URL path in a server environment)
	       * the callback is called only once. Otherwise, the location should be one of the
	       * Router.*Location objects (e.g. Router.HashLocation or Router.HistoryLocation).
	       */run:function run(callback){invariant(!Router.isRunning,'Router is already running');dispatchHandler = function(error,transition,newState){if(error)Router.handleError(error);if(pendingTransition !== transition)return;pendingTransition = null;if(transition.abortReason){Router.handleAbort(transition.abortReason);}else {callback.call(Router,Router,nextState = newState);}};if(!(location instanceof StaticLocation)){if(location.addChangeListener)location.addChangeListener(Router.handleLocationChange);Router.isRunning = true;} // Bootstrap using the current path.
Router.refresh();},refresh:function refresh(){Router.dispatch(location.getCurrentPath(),null);},stop:function stop(){Router.cancelPendingTransition();if(location.removeChangeListener)location.removeChangeListener(Router.handleLocationChange);Router.isRunning = false;},getLocation:function getLocation(){return location;},getScrollBehavior:function getScrollBehavior(){return scrollBehavior;},getRouteAtDepth:function getRouteAtDepth(routeDepth){var routes=state.routes;return routes && routes[routeDepth];},setRouteComponentAtDepth:function setRouteComponentAtDepth(routeDepth,component){mountedComponents[routeDepth] = component;}, /**
	       * Returns the current URL path + query string.
	       */getCurrentPath:function getCurrentPath(){return state.path;}, /**
	       * Returns the current URL path without the query string.
	       */getCurrentPathname:function getCurrentPathname(){return state.pathname;}, /**
	       * Returns an object of the currently active URL parameters.
	       */getCurrentParams:function getCurrentParams(){return state.params;}, /**
	       * Returns an object of the currently active query parameters.
	       */getCurrentQuery:function getCurrentQuery(){return state.query;}, /**
	       * Returns an array of the currently active routes.
	       */getCurrentRoutes:function getCurrentRoutes(){return state.routes;}, /**
	       * Returns true if the given route, params, and query are active.
	       */isActive:function isActive(to,params,query){if(PathUtils.isAbsolute(to)){return to === state.path;}return routeIsActive(state.routes,to) && paramsAreActive(state.params,params) && (query == null || queryIsActive(state.query,query));}},mixins:[ScrollHistory],propTypes:{children:PropTypes.falsy},childContextTypes:{routeDepth:PropTypes.number.isRequired,router:PropTypes.router.isRequired},getChildContext:function getChildContext(){return {routeDepth:1,router:Router};},getInitialState:function getInitialState(){return state = nextState;},componentWillReceiveProps:function componentWillReceiveProps(){this.setState(state = nextState);},componentWillUnmount:function componentWillUnmount(){Router.stop();},render:function render(){var route=Router.getRouteAtDepth(0);return route?React.createElement(route.handler,this.props):null;}});Router.clearAllRoutes();if(options.routes)Router.addRoutes(options.routes);return Router;}module.exports = createRouter; /***/}, /* 20 */function(module,exports,__webpack_require__){'use strict';var createRouter=__webpack_require__(19); /**
	 * A high-level convenience method that creates, configures, and
	 * runs a router in one shot. The method signature is:
	 *
	 *   Router.run(routes[, location ], callback);
	 *
	 * Using `window.location.hash` to manage the URL, you could do:
	 *
	 *   Router.run(routes, function (Handler) {
	 *     React.render(<Handler/>, document.body);
	 *   });
	 * 
	 * Using HTML5 history and a custom "cursor" prop:
	 * 
	 *   Router.run(routes, Router.HistoryLocation, function (Handler) {
	 *     React.render(<Handler cursor={cursor}/>, document.body);
	 *   });
	 *
	 * Returns the newly created router.
	 *
	 * Note: If you need to specify further options for your router such
	 * as error/abort handling or custom scroll behavior, use Router.create
	 * instead.
	 *
	 *   var router = Router.create(options);
	 *   router.run(function (Handler) {
	 *     // ...
	 *   });
	 */function runRouter(routes,location,callback){if(typeof location === 'function'){callback = location;location = null;}var router=createRouter({routes:routes,location:location});router.run(callback);return router;}module.exports = runRouter; /***/}, /* 21 */function(module,exports,__webpack_require__){module.exports = __WEBPACK_EXTERNAL_MODULE_21__; /***/}, /* 22 */function(module,exports,__webpack_require__){'use strict';var assign=__webpack_require__(33);var ReactPropTypes=__webpack_require__(21).PropTypes;var Route=__webpack_require__(17);var PropTypes=assign({},ReactPropTypes,{ /**
	   * Indicates that a prop should be falsy.
	   */falsy:function falsy(props,propName,componentName){if(props[propName]){return new Error('<' + componentName + '> should not have a "' + propName + '" prop');}}, /**
	   * Indicates that a prop should be a Route object.
	   */route:ReactPropTypes.instanceOf(Route), /**
	   * Indicates that a prop should be a Router object.
	   */ //router: ReactPropTypes.instanceOf(Router) // TODO
router:ReactPropTypes.func});module.exports = PropTypes; /***/}, /* 23 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _inherits=function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)subClass.__proto__ = superClass;}; /**
	 * This component is necessary to get around a context warning
	 * present in React 0.13.0. It sovles this by providing a separation
	 * between the "owner" and "parent" contexts.
	 */var React=__webpack_require__(21);var ContextWrapper=(function(_React$Component){function ContextWrapper(){_classCallCheck(this,ContextWrapper);if(_React$Component != null){_React$Component.apply(this,arguments);}}_inherits(ContextWrapper,_React$Component);_createClass(ContextWrapper,[{key:'render',value:function render(){return this.props.children;}}]);return ContextWrapper;})(React.Component);module.exports = ContextWrapper; /***/}, /* 24 */function(module,exports,__webpack_require__){ /**
	 * Actions that modify the URL.
	 */'use strict';var LocationActions={ /**
	   * Indicates a new location is being pushed to the history stack.
	   */PUSH:'push', /**
	   * Indicates the current location should be replaced.
	   */REPLACE:'replace', /**
	   * Indicates the most recent entry should be removed from the history stack.
	   */POP:'pop'};module.exports = LocationActions; /***/}, /* 25 */function(module,exports,__webpack_require__){'use strict';var invariant=__webpack_require__(34);var assign=__webpack_require__(38);var qs=__webpack_require__(39);var paramCompileMatcher=/:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;var paramInjectMatcher=/:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;var paramInjectTrailingSlashMatcher=/\/\/\?|\/\?\/|\/\?/g;var queryMatcher=/\?(.*)$/;var _compiledPatterns={};function compilePattern(pattern){if(!(pattern in _compiledPatterns)){var paramNames=[];var source=pattern.replace(paramCompileMatcher,function(match,paramName){if(paramName){paramNames.push(paramName);return '([^/?#]+)';}else if(match === '*'){paramNames.push('splat');return '(.*?)';}else {return '\\' + match;}});_compiledPatterns[pattern] = {matcher:new RegExp('^' + source + '$','i'),paramNames:paramNames};}return _compiledPatterns[pattern];}var PathUtils={ /**
	   * Returns true if the given path is absolute.
	   */isAbsolute:function isAbsolute(path){return path.charAt(0) === '/';}, /**
	   * Joins two URL paths together.
	   */join:function join(a,b){return a.replace(/\/*$/,'/') + b;}, /**
	   * Returns an array of the names of all parameters in the given pattern.
	   */extractParamNames:function extractParamNames(pattern){return compilePattern(pattern).paramNames;}, /**
	   * Extracts the portions of the given URL path that match the given pattern
	   * and returns an object of param name => value pairs. Returns null if the
	   * pattern does not match the given path.
	   */extractParams:function extractParams(pattern,path){var _compilePattern=compilePattern(pattern);var matcher=_compilePattern.matcher;var paramNames=_compilePattern.paramNames;var match=path.match(matcher);if(!match){return null;}var params={};paramNames.forEach(function(paramName,index){params[paramName] = match[index + 1];});return params;}, /**
	   * Returns a version of the given route path with params interpolated. Throws
	   * if there is a dynamic segment of the route path for which there is no param.
	   */injectParams:function injectParams(pattern,params){params = params || {};var splatIndex=0;return pattern.replace(paramInjectMatcher,function(match,paramName){paramName = paramName || 'splat'; // If param is optional don't check for existence
if(paramName.slice(-1) === '?'){paramName = paramName.slice(0,-1);if(params[paramName] == null)return '';}else {invariant(params[paramName] != null,'Missing "%s" parameter for path "%s"',paramName,pattern);}var segment;if(paramName === 'splat' && Array.isArray(params[paramName])){segment = params[paramName][splatIndex++];invariant(segment != null,'Missing splat # %s for path "%s"',splatIndex,pattern);}else {segment = params[paramName];}return segment;}).replace(paramInjectTrailingSlashMatcher,'/');}, /**
	   * Returns an object that is the result of parsing any query string contained
	   * in the given path, null if the path contains no query string.
	   */extractQuery:function extractQuery(path){var match=path.match(queryMatcher);return match && qs.parse(match[1]);}, /**
	   * Returns a version of the given path without the query string.
	   */withoutQuery:function withoutQuery(path){return path.replace(queryMatcher,'');}, /**
	   * Returns a version of the given path with the parameters in the given
	   * query merged into the query string.
	   */withQuery:function withQuery(path,query){var existingQuery=PathUtils.extractQuery(path);if(existingQuery)query = query?assign(existingQuery,query):existingQuery;var queryString=qs.stringify(query,{arrayFormat:'brackets'});if(queryString){return PathUtils.withoutQuery(path) + '?' + queryString;}return PathUtils.withoutQuery(path);}};module.exports = PathUtils; /***/}, /* 26 */function(module,exports,__webpack_require__){'use strict';var invariant=__webpack_require__(34);var canUseDOM=__webpack_require__(35).canUseDOM;var getWindowScrollPosition=__webpack_require__(37);function shouldUpdateScroll(state,prevState){if(!prevState){return true;} // Don't update scroll position when only the query has changed.
if(state.pathname === prevState.pathname){return false;}var routes=state.routes;var prevRoutes=prevState.routes;var sharedAncestorRoutes=routes.filter(function(route){return prevRoutes.indexOf(route) !== -1;});return !sharedAncestorRoutes.some(function(route){return route.ignoreScrollBehavior;});} /**
	 * Provides the router with the ability to manage window scroll position
	 * according to its scroll behavior.
	 */var ScrollHistory={statics:{ /**
	     * Records curent scroll position as the last known position for the given URL path.
	     */recordScrollPosition:function recordScrollPosition(path){if(!this.scrollHistory)this.scrollHistory = {};this.scrollHistory[path] = getWindowScrollPosition();}, /**
	     * Returns the last known scroll position for the given URL path.
	     */getScrollPosition:function getScrollPosition(path){if(!this.scrollHistory)this.scrollHistory = {};return this.scrollHistory[path] || null;}},componentWillMount:function componentWillMount(){invariant(this.constructor.getScrollBehavior() == null || canUseDOM,'Cannot use scroll behavior without a DOM');},componentDidMount:function componentDidMount(){this._updateScroll();},componentDidUpdate:function componentDidUpdate(prevProps,prevState){this._updateScroll(prevState);},_updateScroll:function _updateScroll(prevState){if(!shouldUpdateScroll(this.state,prevState)){return;}var scrollBehavior=this.constructor.getScrollBehavior();if(scrollBehavior)scrollBehavior.updateScrollPosition(this.constructor.getScrollPosition(this.state.path),this.state.action);}};module.exports = ScrollHistory; /***/}, /* 27 */function(module,exports,__webpack_require__){'use strict';var React=__webpack_require__(21);function isValidChild(object){return object == null || React.isValidElement(object);}function isReactChildren(object){return isValidChild(object) || Array.isArray(object) && object.every(isValidChild);}module.exports = isReactChildren; /***/}, /* 28 */function(module,exports,__webpack_require__){ /* jshint -W058 */'use strict';var Cancellation=__webpack_require__(30);var Redirect=__webpack_require__(29); /**
	 * Encapsulates a transition to a given path.
	 *
	 * The willTransitionTo and willTransitionFrom handlers receive
	 * an instance of this class as their first argument.
	 */function Transition(path,retry){this.path = path;this.abortReason = null; // TODO: Change this to router.retryTransition(transition)
this.retry = retry.bind(this);}Transition.prototype.abort = function(reason){if(this.abortReason == null)this.abortReason = reason || 'ABORT';};Transition.prototype.redirect = function(to,params,query){this.abort(new Redirect(to,params,query));};Transition.prototype.cancel = function(){this.abort(new Cancellation());};Transition.from = function(transition,routes,components,callback){routes.reduce(function(callback,route,index){return function(error){if(error || transition.abortReason){callback(error);}else if(route.onLeave){try{route.onLeave(transition,components[index],callback); // If there is no callback in the argument list, call it automatically.
if(route.onLeave.length < 3)callback();}catch(e) {callback(e);}}else {callback();}};},callback)();};Transition.to = function(transition,routes,params,query,callback){routes.reduceRight(function(callback,route){return function(error){if(error || transition.abortReason){callback(error);}else if(route.onEnter){try{route.onEnter(transition,params,query,callback); // If there is no callback in the argument list, call it automatically.
if(route.onEnter.length < 4)callback();}catch(e) {callback(e);}}else {callback();}};},callback)();};module.exports = Transition; /***/}, /* 29 */function(module,exports,__webpack_require__){ /**
	 * Encapsulates a redirect to the given route.
	 */"use strict";function Redirect(to,params,query){this.to = to;this.params = params;this.query = query;}module.exports = Redirect; /***/}, /* 30 */function(module,exports,__webpack_require__){ /**
	 * Represents a cancellation caused by navigating away
	 * before the previous transition has fully resolved.
	 */"use strict";function Cancellation(){}module.exports = Cancellation; /***/}, /* 31 */function(module,exports,__webpack_require__){'use strict';var _classCallCheck=function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}};var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})(); /* jshint -W084 */var PathUtils=__webpack_require__(25);function deepSearch(route,pathname,query){ // Check the subtree first to find the most deeply-nested match.
var childRoutes=route.childRoutes;if(childRoutes){var match,childRoute;for(var i=0,len=childRoutes.length;i < len;++i) {childRoute = childRoutes[i];if(childRoute.isDefault || childRoute.isNotFound)continue; // Check these in order later.
if(match = deepSearch(childRoute,pathname,query)){ // A route in the subtree matched! Add this route and we're done.
match.routes.unshift(route);return match;}}} // No child routes matched; try the default route.
var defaultRoute=route.defaultRoute;if(defaultRoute && (params = PathUtils.extractParams(defaultRoute.path,pathname))){return new Match(pathname,params,query,[route,defaultRoute]);} // Does the "not found" route match?
var notFoundRoute=route.notFoundRoute;if(notFoundRoute && (params = PathUtils.extractParams(notFoundRoute.path,pathname))){return new Match(pathname,params,query,[route,notFoundRoute]);} // Last attempt: check this route.
var params=PathUtils.extractParams(route.path,pathname);if(params){return new Match(pathname,params,query,[route]);}return null;}var Match=(function(){function Match(pathname,params,query,routes){_classCallCheck(this,Match);this.pathname = pathname;this.params = params;this.query = query;this.routes = routes;}_createClass(Match,null,[{key:'findMatch', /**
	     * Attempts to match depth-first a route in the given route's
	     * subtree against the given path and returns the match if it
	     * succeeds, null if no match can be made.
	     */value:function findMatch(routes,path){var pathname=PathUtils.withoutQuery(path);var query=PathUtils.extractQuery(path);var match=null;for(var i=0,len=routes.length;match == null && i < len;++i) match = deepSearch(routes[i],pathname,query);return match;}}]);return Match;})();module.exports = Match; /***/}, /* 32 */function(module,exports,__webpack_require__){'use strict';function supportsHistory(){ /*! taken from modernizr
	   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
	   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
	   * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
	   */var ua=navigator.userAgent;if((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1){return false;}return window.history && 'pushState' in window.history;}module.exports = supportsHistory; /***/}, /* 33 */function(module,exports,__webpack_require__){ /**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule Object.assign
	 */ // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign
'use strict';function assign(target,sources){if(target == null){throw new TypeError('Object.assign target cannot be null or undefined');}var to=Object(target);var hasOwnProperty=Object.prototype.hasOwnProperty;for(var nextIndex=1;nextIndex < arguments.length;nextIndex++) {var nextSource=arguments[nextIndex];if(nextSource == null){continue;}var from=Object(nextSource); // We don't currently support accessors nor proxies. Therefore this
// copy cannot throw. If we ever supported this then we must handle
// exceptions and side-effects. We don't support symbols so they won't
// be transferred.
for(var key in from) {if(hasOwnProperty.call(from,key)){to[key] = from[key];}}}return to;}module.exports = assign; /***/}, /* 34 */function(module,exports,__webpack_require__){ /**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */"use strict"; /**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */var invariant=function invariant(condition,format,a,b,c,d,e,f){if(false){if(format === undefined){throw new Error("invariant requires an error message argument");}}if(!condition){var error;if(format === undefined){error = new Error("Minified exception occurred; use the non-minified dev environment " + "for the full error message and additional helpful warnings.");}else {var args=[a,b,c,d,e,f];var argIndex=0;error = new Error("Invariant Violation: " + format.replace(/%s/g,function(){return args[argIndex++];}));}error.framesToPop = 1; // we don't care about invariant's own frame
throw error;}};module.exports = invariant; /***/}, /* 35 */function(module,exports,__webpack_require__){ /**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ExecutionEnvironment
	 */ /*jslint evil: true */'use strict';var canUseDOM=!!(typeof window !== 'undefined' && window.document && window.document.createElement); /**
	 * Simple, lightweight module assisting with the detection and context of
	 * Worker. Helps avoid circular dependencies and allows code to reason about
	 * whether or not they are in a Worker, even if they never include the main
	 * `ReactWorker` dependency.
	 */var ExecutionEnvironment={canUseDOM:canUseDOM,canUseWorkers:typeof Worker !== 'undefined',canUseEventListeners:canUseDOM && !!(window.addEventListener || window.attachEvent),canUseViewport:canUseDOM && !!window.screen,isInWorker:!canUseDOM // For now, this is true - might change in the future.
};module.exports = ExecutionEnvironment; /***/}, /* 36 */function(module,exports,__webpack_require__){ /**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule warning
	 */"use strict";var emptyFunction=__webpack_require__(40); /**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */var warning=emptyFunction;if(false){warning = function(condition,format){for(var args=[],$__0=2,$__1=arguments.length;$__0 < $__1;$__0++) args.push(arguments[$__0]);if(format === undefined){throw new Error("`warning(condition, format, ...args)` requires a warning " + "message argument");}if(format.length < 10 || /^[s\W]*$/.test(format)){throw new Error("The warning format should be able to uniquely identify this " + "warning. Please, use a more descriptive format than: " + format);}if(format.indexOf("Failed Composite propType: ") === 0){return; // Ignore CompositeComponent proptype check.
}if(!condition){var argIndex=0;var message="Warning: " + format.replace(/%s/g,function(){return args[argIndex++];});console.warn(message);try{ // --- Welcome to debugging React ---
// This error was thrown as a convenience so that you can use this stack
// to find the callsite that caused this warning to fire.
throw new Error(message);}catch(x) {}}};}module.exports = warning; /***/}, /* 37 */function(module,exports,__webpack_require__){'use strict';var invariant=__webpack_require__(34);var canUseDOM=__webpack_require__(35).canUseDOM; /**
	 * Returns the current scroll position of the window as { x, y }.
	 */function getWindowScrollPosition(){invariant(canUseDOM,'Cannot get current scroll position without a DOM');return {x:window.pageXOffset || document.documentElement.scrollLeft,y:window.pageYOffset || document.documentElement.scrollTop};}module.exports = getWindowScrollPosition; /***/}, /* 38 */function(module,exports,__webpack_require__){'use strict';function ToObject(val){if(val == null){throw new TypeError('Object.assign cannot be called with null or undefined');}return Object(val);}module.exports = Object.assign || function(target,source){var from;var keys;var to=ToObject(target);for(var s=1;s < arguments.length;s++) {from = arguments[s];keys = Object.keys(Object(from));for(var i=0;i < keys.length;i++) {to[keys[i]] = from[keys[i]];}}return to;}; /***/}, /* 39 */function(module,exports,__webpack_require__){'use strict';module.exports = __webpack_require__(41); /***/}, /* 40 */function(module,exports,__webpack_require__){ /**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule emptyFunction
	 */"use strict";function makeEmptyFunction(arg){return function(){return arg;};} /**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */function emptyFunction(){}emptyFunction.thatReturns = makeEmptyFunction;emptyFunction.thatReturnsFalse = makeEmptyFunction(false);emptyFunction.thatReturnsTrue = makeEmptyFunction(true);emptyFunction.thatReturnsNull = makeEmptyFunction(null);emptyFunction.thatReturnsThis = function(){return this;};emptyFunction.thatReturnsArgument = function(arg){return arg;};module.exports = emptyFunction; /***/}, /* 41 */function(module,exports,__webpack_require__){ // Load modules
'use strict';var Stringify=__webpack_require__(42);var Parse=__webpack_require__(43); // Declare internals
var internals={};module.exports = {stringify:Stringify,parse:Parse}; /***/}, /* 42 */function(module,exports,__webpack_require__){ // Load modules
'use strict';var Utils=__webpack_require__(44); // Declare internals
var internals={delimiter:'&',arrayPrefixGenerators:{brackets:function brackets(prefix,key){return prefix + '[]';},indices:function indices(prefix,key){return prefix + '[' + key + ']';},repeat:function repeat(prefix,key){return prefix;}}};internals.stringify = function(obj,prefix,generateArrayPrefix){if(Utils.isBuffer(obj)){obj = obj.toString();}else if(obj instanceof Date){obj = obj.toISOString();}else if(obj === null){obj = '';}if(typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean'){return [encodeURIComponent(prefix) + '=' + encodeURIComponent(obj)];}var values=[];if(typeof obj === 'undefined'){return values;}var objKeys=Object.keys(obj);for(var i=0,il=objKeys.length;i < il;++i) {var key=objKeys[i];if(Array.isArray(obj)){values = values.concat(internals.stringify(obj[key],generateArrayPrefix(prefix,key),generateArrayPrefix));}else {values = values.concat(internals.stringify(obj[key],prefix + '[' + key + ']',generateArrayPrefix));}}return values;};module.exports = function(obj,options){options = options || {};var delimiter=typeof options.delimiter === 'undefined'?internals.delimiter:options.delimiter;var keys=[];if(typeof obj !== 'object' || obj === null){return '';}var arrayFormat;if(options.arrayFormat in internals.arrayPrefixGenerators){arrayFormat = options.arrayFormat;}else if('indices' in options){arrayFormat = options.indices?'indices':'repeat';}else {arrayFormat = 'indices';}var generateArrayPrefix=internals.arrayPrefixGenerators[arrayFormat];var objKeys=Object.keys(obj);for(var i=0,il=objKeys.length;i < il;++i) {var key=objKeys[i];keys = keys.concat(internals.stringify(obj[key],key,generateArrayPrefix));}return keys.join(delimiter);}; /***/}, /* 43 */function(module,exports,__webpack_require__){ // Load modules
'use strict';var Utils=__webpack_require__(44); // Declare internals
var internals={delimiter:'&',depth:5,arrayLimit:20,parameterLimit:1000};internals.parseValues = function(str,options){var obj={};var parts=str.split(options.delimiter,options.parameterLimit === Infinity?undefined:options.parameterLimit);for(var i=0,il=parts.length;i < il;++i) {var part=parts[i];var pos=part.indexOf(']=') === -1?part.indexOf('='):part.indexOf(']=') + 1;if(pos === -1){obj[Utils.decode(part)] = '';}else {var key=Utils.decode(part.slice(0,pos));var val=Utils.decode(part.slice(pos + 1));if(Object.prototype.hasOwnProperty(key)){continue;}if(!obj.hasOwnProperty(key)){obj[key] = val;}else {obj[key] = [].concat(obj[key]).concat(val);}}}return obj;};internals.parseObject = function(chain,val,options){if(!chain.length){return val;}var root=chain.shift();var obj={};if(root === '[]'){obj = [];obj = obj.concat(internals.parseObject(chain,val,options));}else {var cleanRoot=root[0] === '[' && root[root.length - 1] === ']'?root.slice(1,root.length - 1):root;var index=parseInt(cleanRoot,10);var indexString='' + index;if(!isNaN(index) && root !== cleanRoot && indexString === cleanRoot && index >= 0 && index <= options.arrayLimit){obj = [];obj[index] = internals.parseObject(chain,val,options);}else {obj[cleanRoot] = internals.parseObject(chain,val,options);}}return obj;};internals.parseKeys = function(key,val,options){if(!key){return;} // The regex chunks
var parent=/^([^\[\]]*)/;var child=/(\[[^\[\]]*\])/g; // Get the parent
var segment=parent.exec(key); // Don't allow them to overwrite object prototype properties
if(Object.prototype.hasOwnProperty(segment[1])){return;} // Stash the parent if it exists
var keys=[];if(segment[1]){keys.push(segment[1]);} // Loop through children appending to the array until we hit depth
var i=0;while((segment = child.exec(key)) !== null && i < options.depth) {++i;if(!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g,''))){keys.push(segment[1]);}} // If there's a remainder, just add whatever is left
if(segment){keys.push('[' + key.slice(segment.index) + ']');}return internals.parseObject(keys,val,options);};module.exports = function(str,options){if(str === '' || str === null || typeof str === 'undefined'){return {};}options = options || {};options.delimiter = typeof options.delimiter === 'string' || Utils.isRegExp(options.delimiter)?options.delimiter:internals.delimiter;options.depth = typeof options.depth === 'number'?options.depth:internals.depth;options.arrayLimit = typeof options.arrayLimit === 'number'?options.arrayLimit:internals.arrayLimit;options.parameterLimit = typeof options.parameterLimit === 'number'?options.parameterLimit:internals.parameterLimit;var tempObj=typeof str === 'string'?internals.parseValues(str,options):str;var obj={}; // Iterate over the keys and setup the new object
var keys=Object.keys(tempObj);for(var i=0,il=keys.length;i < il;++i) {var key=keys[i];var newObj=internals.parseKeys(key,tempObj[key],options);obj = Utils.merge(obj,newObj);}return Utils.compact(obj);}; /***/}, /* 44 */function(module,exports,__webpack_require__){ // Load modules
// Declare internals
'use strict';var internals={};exports.arrayToObject = function(source){var obj={};for(var i=0,il=source.length;i < il;++i) {if(typeof source[i] !== 'undefined'){obj[i] = source[i];}}return obj;};exports.merge = function(target,source){if(!source){return target;}if(typeof source !== 'object'){if(Array.isArray(target)){target.push(source);}else {target[source] = true;}return target;}if(typeof target !== 'object'){target = [target].concat(source);return target;}if(Array.isArray(target) && !Array.isArray(source)){target = exports.arrayToObject(target);}var keys=Object.keys(source);for(var k=0,kl=keys.length;k < kl;++k) {var key=keys[k];var value=source[key];if(!target[key]){target[key] = value;}else {target[key] = exports.merge(target[key],value);}}return target;};exports.decode = function(str){try{return decodeURIComponent(str.replace(/\+/g,' '));}catch(e) {return str;}};exports.compact = function(obj,refs){if(typeof obj !== 'object' || obj === null){return obj;}refs = refs || [];var lookup=refs.indexOf(obj);if(lookup !== -1){return refs[lookup];}refs.push(obj);if(Array.isArray(obj)){var compacted=[];for(var i=0,il=obj.length;i < il;++i) {if(typeof obj[i] !== 'undefined'){compacted.push(obj[i]);}}return compacted;}var keys=Object.keys(obj);for(i = 0,il = keys.length;i < il;++i) {var key=keys[i];obj[key] = exports.compact(obj[key],refs);}return obj;};exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]';};exports.isBuffer = function(obj){if(obj === null || typeof obj === 'undefined'){return false;}return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));}; /***/} /******/]));}); /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/ /***/


},{"react":"react"}],"/home/cheton/github/webappengine/web/vendor/stacktrace-js/stacktrace.js":[function(require,module,exports){
// Domain Public by Eric Wendelin http://www.eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)
'use strict';

(function (global, factory) {
    if (typeof exports === 'object') {
        // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.printStackTrace = factory();
    }
})(undefined, function () {
    /**
     * Main function giving a function stack trace with a forced or passed in Error
     *
     * @cfg {Error} e The error to create a stacktrace from (optional)
     * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
     * @return {Array} of Strings with functions, lines, files, and arguments where possible
     */
    function printStackTrace(options) {
        options = options || { guess: true };
        var ex = options.e || null,
            guess = !!options.guess,
            mode = options.mode || null;
        var p = new printStackTrace.implementation(),
            result = p.run(ex, mode);
        return guess ? p.guessAnonymousFunctions(result) : result;
    }

    printStackTrace.implementation = function () {};

    printStackTrace.implementation.prototype = {
        /**
         * @param {Error} [ex] The error to create a stacktrace from (optional)
         * @param {String} [mode] Forced mode (optional, mostly for unit tests)
         */
        run: function run(ex, mode) {
            ex = ex || this.createException();
            mode = mode || this.mode(ex);
            if (mode === 'other') {
                return this.other(arguments.callee);
            } else {
                return this[mode](ex);
            }
        },

        createException: function createException() {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        },

        /**
         * Mode could differ for different exception, e.g.
         * exceptions in Chrome may or may not have arguments or stack.
         *
         * @return {String} mode of operation for the exception
         */
        mode: function mode(e) {
            if (typeof window !== 'undefined' && window.navigator.userAgent.indexOf('PhantomJS') > -1) {
                return 'phantomjs';
            }

            if (e['arguments'] && e.stack) {
                return 'chrome';
            }

            if (e.stack && e.sourceURL) {
                return 'safari';
            }

            if (e.stack && e.number) {
                return 'ie';
            }

            if (e.stack && e.fileName) {
                return 'firefox';
            }

            if (e.message && e['opera#sourceloc']) {
                // e.message.indexOf("Backtrace:") > -1 -> opera9
                // 'opera#sourceloc' in e -> opera9, opera10a
                // !e.stacktrace -> opera9
                if (!e.stacktrace) {
                    return 'opera9'; // use e.message
                }
                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    // e.message may have more stack entries than e.stacktrace
                    return 'opera9'; // use e.message
                }
                return 'opera10a'; // use e.stacktrace
            }

            if (e.message && e.stack && e.stacktrace) {
                // e.stacktrace && e.stack -> opera10b
                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
                }
                // e.stacktrace && e.stack -> opera11
                return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
            }

            if (e.stack && !e.fileName) {
                // Chrome 27 does not have e.arguments as earlier versions,
                // but still does not have e.fileName as Firefox
                return 'chrome';
            }

            return 'other';
        },

        /**
         * Given a context, function name, and callback function, overwrite it so that it calls
         * printStackTrace() first with a callback and then runs the rest of the body.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to instrument
         * @param {Function} callback function to call with a stack trace on invocation
         */
        instrumentFunction: function instrumentFunction(context, functionName, callback) {
            context = context || window;
            var original = context[functionName];
            context[functionName] = function instrumented() {
                callback.call(this, printStackTrace().slice(4));
                return context[functionName]._instrumented.apply(this, arguments);
            };
            context[functionName]._instrumented = original;
        },

        /**
         * Given a context and function name of a function that has been
         * instrumented, revert the function to it's original (non-instrumented)
         * state.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to de-instrument
         */
        deinstrumentFunction: function deinstrumentFunction(context, functionName) {
            if (context[functionName].constructor === Function && context[functionName]._instrumented && context[functionName]._instrumented.constructor === Function) {
                context[functionName] = context[functionName]._instrumented;
            }
        },

        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function chrome(e) {
            return (e.stack + '\n').replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
            .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
            .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)').replace(/^(.+) \((.+)\)$/gm, '$1@$2').split('\n').slice(0, -1);
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function safari(e) {
            return e.stack.replace(/\[native code\]\n/m, '').replace(/^(?=\w+Error\:).*$\n/m, '').replace(/^@/gm, '{anonymous}()@').split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function ie(e) {
            return e.stack.replace(/^\s*at\s+(.*)$/gm, '$1').replace(/^Anonymous function\s+/gm, '{anonymous}() ').replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2').split('\n').slice(1);
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function firefox(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@').split('\n');
        },

        opera11: function opera11(e) {
            var ANON = '{anonymous}',
                lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'),
                result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        opera10b: function opera10b(e) {
            // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
            // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
            // "@file://localhost/G:/js/test/functional/testcase1.html:15"
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'),
                result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1] ? match[1] + '()' : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function opera10a(e) {
            // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
            var ANON = '{anonymous}',
                lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'),
                result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Opera 7.x-9.2x only!
        opera9: function opera9(e) {
            // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
            var ANON = '{anonymous}',
                lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'),
                result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        phantomjs: function phantomjs(e) {
            var ANON = '{anonymous}',
                lineRE = /(\S+) \((\S+)\)/i;
            var lines = e.stack.split('\n'),
                result = [];

            for (var i = 1, len = lines.length; i < len; i++) {
                lines[i] = lines[i].replace(/^\s+at\s+/gm, '');
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(match[1] + '()@' + match[2]);
                } else {
                    result.push(ANON + '()@' + lines[i]);
                }
            }

            return result;
        },

        // Safari 5-, IE 9-, and others
        other: function other(curr) {
            var ANON = '{anonymous}',
                fnRE = /function(?:\s+([\w$]+))?\s*\(/,
                stack = [],
                fn,
                args,
                maxStackSize = 10;
            var slice = Array.prototype.slice;
            while (curr && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                try {
                    args = slice.call(curr['arguments'] || []);
                } catch (e) {
                    args = ['Cannot access arguments: ' + e];
                }
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                try {
                    curr = curr.caller;
                } catch (e) {
                    stack[stack.length] = 'Cannot access caller: ' + e;
                    break;
                }
            }
            return stack;
        },

        /**
         * Given arguments array as a String, substituting type names for non-string types.
         *
         * @param {Arguments,Array} args
         * @return {String} stringified arguments
         */
        stringifyArguments: function stringifyArguments(args) {
            var result = [];
            var slice = Array.prototype.slice;
            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = 'undefined';
                } else if (arg === null) {
                    result[i] = 'null';
                } else if (arg.constructor) {
                    // TODO constructor comparison does not work for iframes
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = '#object';
                    } else if (arg.constructor === Function) {
                        result[i] = '#function';
                    } else if (arg.constructor === String) {
                        result[i] = '"' + arg + '"';
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    } else {
                        result[i] = '?';
                    }
                }
            }
            return result.join(',');
        },

        sourceCache: {},

        /**
         * @return {String} the text from a given URL
         */
        ajax: function ajax(url) {
            var req = this.createXMLHTTPObject();
            if (req) {
                try {
                    req.open('GET', url, false);
                    //req.overrideMimeType('text/plain');
                    //req.overrideMimeType('text/javascript');
                    req.send(null);
                    //return req.status == 200 ? req.responseText : '';
                    return req.responseText;
                } catch (e) {}
            }
            return '';
        },

        /**
         * Try XHR methods in order and store XHR factory.
         *
         * @return {XMLHttpRequest} XHR function or equivalent
         */
        createXMLHTTPObject: function createXMLHTTPObject() {
            var xmlhttp,
                XMLHttpFactories = [function () {
                return new XMLHttpRequest();
            }, function () {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function () {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function () {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }];
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                    // Use memoization to cache the factory
                    this.createXMLHTTPObject = XMLHttpFactories[i];
                    return xmlhttp;
                } catch (e) {}
            }
        },

        /**
         * Given a URL, check if it is in the same domain (so we can get the source
         * via Ajax).
         *
         * @param url {String} source url
         * @return {Boolean} False if we need a cross-domain request
         */
        isSameDomain: function isSameDomain(url) {
            return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
        },

        /**
         * Get source code from given URL if in the same domain.
         *
         * @param url {String} JS source URL
         * @return {Array} Array of source code lines
         */
        getSource: function getSource(url) {
            // TODO reuse source from script tags?
            if (!(url in this.sourceCache)) {
                this.sourceCache[url] = this.ajax(url).split('\n');
            }
            return this.sourceCache[url];
        },

        guessAnonymousFunctions: function guessAnonymousFunctions(stack) {
            for (var i = 0; i < stack.length; ++i) {
                var reStack = /\{anonymous\}\(.*\)@(.*)/,
                    reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                    frame = stack[i],
                    ref = reStack.exec(frame);

                if (ref) {
                    var m = reRef.exec(ref[1]);
                    if (m) {
                        // If falsey, we did not get any file/line information
                        var file = m[1],
                            lineno = m[2],
                            charno = m[3] || 0;
                        if (file && this.isSameDomain(file) && lineno) {
                            var functionName = this.guessAnonymousFunction(file, lineno, charno);
                            stack[i] = frame.replace('{anonymous}', functionName);
                        }
                    }
                }
            }
            return stack;
        },

        guessAnonymousFunction: function guessAnonymousFunction(url, lineNo, charNo) {
            var ret;
            try {
                ret = this.findFunctionName(this.getSource(url), lineNo);
            } catch (e) {
                ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
            }
            return ret;
        },

        findFunctionName: function findFunctionName(source, lineNo) {
            // FIXME findFunctionName fails for compressed source
            // (more than one function on the same line)
            // function {name}({args}) m[1]=name m[2]=args
            var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
            // {name} = function ({args}) TODO args capture
            // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
            var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
            // {name} = eval()
            var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
            // Walk backwards in the source lines until we find
            // the line which matches one of the patterns above
            var code = "",
                line,
                maxLines = Math.min(lineNo, 20),
                m,
                commentPos;
            for (var i = 0; i < maxLines; ++i) {
                // lineNo is 1-based, source[] is 0-based
                line = source[lineNo - i - 1];
                commentPos = line.indexOf('//');
                if (commentPos >= 0) {
                    line = line.substr(0, commentPos);
                }
                // TODO check other types of comments? Commented code may lead to false positive
                if (line) {
                    code = line + code;
                    m = reFunctionExpression.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                    m = reFunctionDeclaration.exec(code);
                    if (m && m[1]) {
                        //return m[1] + "(" + (m[2] || "") + ")";
                        return m[1];
                    }
                    m = reFunctionEvaluation.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
            return '(?)';
        }
    };

    return printStackTrace;
});
/*global module, exports, define, ActiveXObject*/


},{}]},{},["./web/main.js"])


//# sourceMappingURL=app.js.map