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


},{"./app":"/Users/cheton/github/webappengine/web/app.jsx","./config/settings":"/Users/cheton/github/webappengine/web/config/settings.js","./lib/log":"/Users/cheton/github/webappengine/web/lib/log.js","async":"/Users/cheton/github/webappengine/web/vendor/async/lib/async.js","i18next":"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js","jsUri":"/Users/cheton/github/webappengine/web/vendor/jsUri/Uri.js","lodash":"lodash","sha1":"/Users/cheton/github/webappengine/node_modules/sha1/sha1.js"}],"/Users/cheton/github/webappengine/node_modules/browserify-css/browser.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/index.js":[function(require,module,exports){
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
  var firstByte
  var secondByte
  var thirdByte
  var fourthByte
  var bytesPerSequence
  var tempCodePoint
  var codePoint
  var res = []
  var i = start

  for (; i < end; i += bytesPerSequence) {
    firstByte = buf[i]
    codePoint = 0xFFFD

    if (firstByte > 0xEF) {
      bytesPerSequence = 4
    } else if (firstByte > 0xDF) {
      bytesPerSequence = 3
    } else if (firstByte > 0xBF) {
      bytesPerSequence = 2
    } else {
      bytesPerSequence = 1
    }

    if (i + bytesPerSequence <= end) {
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

    if (codePoint === 0xFFFD) {
      // we generated an invalid codePoint so make sure to only advance by 1 byte
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
  }

  return String.fromCharCode.apply(String, res)
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

},{"base64-js":"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","ieee754":"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","is-array":"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js"}],"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/node_modules/is-array/index.js":[function(require,module,exports){

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

},{}],"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/sha1/node_modules/charenc/charenc.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/sha1/node_modules/crypt/crypt.js":[function(require,module,exports){
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

},{}],"/Users/cheton/github/webappengine/node_modules/sha1/sha1.js":[function(require,module,exports){
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
},{"buffer":"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/buffer/index.js","charenc":"/Users/cheton/github/webappengine/node_modules/sha1/node_modules/charenc/charenc.js","crypt":"/Users/cheton/github/webappengine/node_modules/sha1/node_modules/crypt/crypt.js"}],"/Users/cheton/github/webappengine/web/app.jsx":[function(require,module,exports){
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


},{"./components/dashboard":"/Users/cheton/github/webappengine/web/components/dashboard/index.jsx","./components/header":"/Users/cheton/github/webappengine/web/components/header/index.jsx","./components/home":"/Users/cheton/github/webappengine/web/components/home/index.jsx","./lib/log":"/Users/cheton/github/webappengine/web/lib/log.js","react":"react","react-router":"/Users/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js"}],"/Users/cheton/github/webappengine/web/components/dashboard/index.jsx":[function(require,module,exports){
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
                title: 'WIDGET 4',
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
                _react2['default'].createElement(Widget4, null),
                _react2['default'].createElement(Widget4, null),
                _react2['default'].createElement(Widget4, null)
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


},{"../widget":"/Users/cheton/github/webappengine/web/components/widget/index.jsx","Sortable":"/Users/cheton/github/webappengine/web/vendor/Sortable/Sortable.js","i18next":"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/Users/cheton/github/webappengine/web/components/header/index.jsx":[function(require,module,exports){
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


},{"i18next":"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react","react-router":"/Users/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js"}],"/Users/cheton/github/webappengine/web/components/home/index.jsx":[function(require,module,exports){
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


},{"i18next":"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/Users/cheton/github/webappengine/web/components/widget/index.jsx":[function(require,module,exports){
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
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            console.log('componentWillUnmount');
        }
    }, {
        key: 'componentDidUnmount',
        value: function componentDidUnmount() {
            console.log('componentDidUnmount');
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


},{"./widget.css":"/Users/cheton/github/webappengine/web/components/widget/widget.css","i18next":"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js","react":"react"}],"/Users/cheton/github/webappengine/web/components/widget/widget.css":[function(require,module,exports){
var css = ".widget{border-radius:3px;border-width:1px;border-style:solid;margin-bottom:20px;background-color:#fff;border-color:#d0d0d0}.widget.widget-no-header .widget-title{margin-top:0;font-size:14px;color:#6a6a6a}.widget .widget-header{padding:0 10px;border-bottom:1px solid #fff;background-color:#e9e9e9}.widget .widget-header .widget-header-title{margin-top:0;font-size:14px;color:#6a6a6a;display:inline-block;vertical-align:middle;margin-bottom:0;line-height:40px}.widget .widget-header .btn-group .dropdown-toggle .icon,.widget .widget-header .btn-group>a{color:#838383}.widget .widget-header .btn-group .dropdown-toggle .icon:focus,.widget .widget-header .btn-group .dropdown-toggle .icon:hover,.widget .widget-header .btn-group>a:focus,.widget .widget-header .btn-group>a:hover{color:#505050}.widget .widget-header .btn i{position:relative;top:0;margin-right:2px;font-size:16px;line-height:1}.widget .widget-header .widget-header-toolbar{float:right;width:auto;margin-left:15px}.widget .widget-header .widget-header-toolbar.btn-group{top:5px}.widget .widget-header .widget-header-toolbar .badge{margin-top:10px}.widget .widget-header .widget-header-toolbar .label{position:relative;top:11px;padding:5px;font-size:85%}.widget .widget-header .widget-header-toolbar .label i{font-size:14px}.widget .widget-header .widget-header-toolbar .btn-xs{top:5px}.widget .widget-header .widget-header-toolbar .btn-link{padding:0 0 0 15px}.widget .widget-header .widget-header-toolbar .btn-link:first-child{padding-left:0}.widget .widget-header .widget-header-toolbar .btn-link i{font-size:28px;line-height:1}@media screen and (max-width:480px){.widget .widget-header .widget-header-toolbar{display:block;position:inherit}.widget .widget-header .widget-header-toolbar.btn-group>.btn{top:-5px}.widget .widget-header .widget-header-toolbar .badge{margin-top:0}.widget .widget-header .widget-header-toolbar .label{top:0}}.widget .widget-content{padding:20px}.widget .widget-footer{padding:7px 10px;background-color:#e9e9e9}"; (require("browserify-css").createStyle(css, { "href": "components/widget/widget.css"})); module.exports = css;
},{"browserify-css":"/Users/cheton/github/webappengine/node_modules/browserify-css/browser.js"}],"/Users/cheton/github/webappengine/web/config/settings.js":[function(require,module,exports){
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


},{}],"/Users/cheton/github/webappengine/web/lib/browser.js":[function(require,module,exports){
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


},{}],"/Users/cheton/github/webappengine/web/lib/log.js":[function(require,module,exports){
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


},{"./browser":"/Users/cheton/github/webappengine/web/lib/browser.js","stacktrace":"/Users/cheton/github/webappengine/web/vendor/stacktrace-js/stacktrace.js"}],"/Users/cheton/github/webappengine/web/vendor/Sortable/Sortable.js":[function(require,module,exports){
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


},{}],"/Users/cheton/github/webappengine/web/vendor/async/lib/async.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGV0b24vZ2l0aHViL3dlYmFwcGVuZ2luZS93ZWIvdmVuZG9yL2FzeW5jL2xpYi9hc3luYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7R0FFRztBQUNILFlBQVksQ0FBQzs7QUFFYixDQUFDLFlBQVk7O0lBRVQsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ2YsU0FBUyxJQUFJLEdBQUcsRUFBRTtJQUNsQixTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUU7UUFDakIsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUNELFNBQVMsTUFBTSxDQUFDLENBQUMsRUFBRTtRQUNmLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNkO0lBQ0QsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2QsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNsQixLQUFLO0FBQ0w7O0FBRUEsSUFBSSxJQUFJLGNBQWMsQ0FBQztBQUN2QjtBQUNBO0FBQ0E7O0FBRUEsSUFBSSxJQUFJLElBQUksR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDOztJQUU5SSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDZCxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQyxLQUFLOztJQUVELEtBQUssQ0FBQyxVQUFVLEdBQUcsWUFBWTtRQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQztRQUM1QixPQUFPLEtBQUssQ0FBQztBQUNyQixLQUFLLENBQUM7O0lBRUYsU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFO1FBQ25CLE9BQU8sWUFBWTtZQUNmLElBQUksRUFBRSxLQUFLLElBQUksRUFBRSxNQUFNLElB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SUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDaEQsQ0FBQyxDQUFDO2FBQ04sTUFBTTtnQkFDSCxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzFCO1NBQ0osQ0FBQyxDQUFDO0FBQ1gsS0FBSyxDQUFDO0FBQ047O0lBRUksSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUM5QyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUMvQixLQUFLOztTQUVJLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDN0MsTUFBTSxDQUFDLEVBQUUsRUFBRSxZQUFZO2dCQUNuQixPQUFPLEtBQUssQ0FBQzthQUNoQixDQUFDLENBQUM7QUFDZixTQUFTOzthQUVJO2dCQUNHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2FBQ3RCO0NBQ1osR0FBRyxDQUFDO0FBQ0wiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodikge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9Cb29sKHYpIHtcbiAgICAgICAgcmV0dXJuICEhdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm90SWQodikge1xuICAgICAgICByZXR1cm4gIXY7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciBwcmV2aW91c19hc3luYztcblxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIChgc2VsZmApIGluIHRoZSBicm93c2VyLCBgZ2xvYmFsYFxuICAgIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICAgIHZhciByb290ID0gdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8IHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHwgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLy8gUG9ydGVkIGZyb20gdW5kZXJzY29yZS5qcyBpc09iamVjdFxuICAgIHZhciBfaXNPYmplY3QgPSBmdW5jdGlvbiBfaXNPYmplY3Qob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHxcbiAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiYgYXJyLmxlbmd0aCA+PSAwICYmIGFyci5sZW5ndGggJSAxID09PSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9lYWNoKGNvbGwsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBfaXNBcnJheUxpa2UoY29sbCkgPyBfYXJyYXlFYWNoKGNvbGwsIGl0ZXJhdG9yKSA6IF9mb3JFYWNoT2YoY29sbCwgaXRlcmF0b3IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcnJheUVhY2goYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21hcChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yYW5nZShjb3VudCkge1xuICAgICAgICByZXR1cm4gX21hcChBcnJheShjb3VudCksIGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uIChmbikge1xuICAgICAgICAvLyBub3QgYSBkaXJlY3QgYWxpYXMgZm9yIElFMTAgY29tcGF0aWJpbGl0eVxuICAgICAgICBfc2V0SW1tZWRpYXRlKGZuKTtcbiAgICB9IDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG4gICAgYXN5bmMuZm9yRWFjaCA9IGFzeW5jLmVhY2ggPSBmdW5jdGlvbiAoYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmVhY2hPZihhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hTZXJpZXMgPSBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPSBhc3luYy5lYWNoTGltaXQgPSBmdW5jdGlvbiAoYXJyLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBfZWFjaE9mTGltaXQobGltaXQpKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mID0gYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcbiAgICAgICAgdmFyIHNpemUgPSBfaXNBcnJheUxpa2Uob2JqZWN0KSA/IG9iamVjdC5sZW5ndGggOiBfa2V5cyhvYmplY3QpLmxlbmd0aDtcbiAgICAgICAgdmFyIGNvbXBsZXRlZCA9IDA7XG4gICAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIF9lYWNoKG9iamVjdCwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChjb21wbGV0ZWQgPj0gc2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mU2VyaWVzID0gYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzeW5jKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID0gYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2goKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXBsZW5pc2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID0gYXN5bmMuZm9sZGwgPSBhc3luYy5yZWR1Y2UgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIgfHwgbnVsbCwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9IGFzeW5jLnJlZHVjZVJpZ2h0ID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXZlcnNlZCA9IF9tYXAoYXJyLCBpZGVudGl0eSkucmV2ZXJzZSgpO1xuICAgICAgICBhc3luYy5yZWR1Y2UocmV2ZXJzZWQsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7IGluZGV4OiBpbmRleCwgdmFsdWU6IHggfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID0gYXN5bmMuZmlsdGVyID0gZG9QYXJhbGxlbChfZmlsdGVyKTtcblxuICAgIGFzeW5jLnNlbGVjdExpbWl0ID0gYXN5bmMuZmlsdGVyTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPSBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbiAodmFsdWUsIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZVRlc3RlcihlYWNoZm4sIGNoZWNrLCBnZXRSZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID0gYXN5bmMuc29tZSA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLnNvbWVMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mTGltaXQsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuYWxsID0gYXN5bmMuZXZlcnkgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgbm90SWQsIG5vdElkKTtcblxuICAgIGFzeW5jLmV2ZXJ5TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBub3RJZCwgbm90SWQpO1xuXG4gICAgZnVuY3Rpb24gX2ZpbmRHZXRSZXN1bHQodiwgeCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgYXN5bmMuZGV0ZWN0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0U2VyaWVzID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZTZXJpZXMsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgYXN5bmMuc29ydEJ5ID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLm1hcChhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKGVyciwgY3JpdGVyaWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgeyB2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIF9tYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmF0b3IobGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSxcbiAgICAgICAgICAgICAgICBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuYXV0byA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIHZhciB0YXNrID0gX2lzQXJyYXkodGFza3Nba10pID8gdGFza3Nba10gOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uICh2YWwsIHJrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW3JrZXldID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHRhc2tDb21wbGV0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcmVxdWlyZXMgPSB0YXNrLnNsaWNlKDAsIHRhc2subGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IGRlYWQtbG9ja3NcbiAgICAgICAgICAgIHZhciBsZW4gPSByZXF1aXJlcy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZGVwO1xuICAgICAgICAgICAgd2hpbGUgKGxlbi0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoZGVwID0gdGFza3NbcmVxdWlyZXNbbGVuXV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGluZXhpc3RhbnQgZGVwZW5kZW5jeScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoX2lzQXJyYXkoZGVwKSAmJiBfaW5kZXhPZihkZXAsIGspID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgY3ljbGljIGRlcGVuZGVuY2llcycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWR5KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfcmVkdWNlKHJlcXVpcmVzLCBmdW5jdGlvbiAoYSwgeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdGVuZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uICh0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHsgZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0IH0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB3cmFwcGVkUmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlJbnRlcnZhbChpbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzIC09IDEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUludGVydmFsKG9wdHMuaW50ZXJ2YWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFzeW5jLnNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24gKGRvbmUsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKHdyYXBJdGVyYXRvcihuZXh0KSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuc3VyZUFzeW5jKGl0ZXJhdG9yKS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB3cmFwSXRlcmF0b3IoYXN5bmMuaXRlcmF0b3IodGFza3MpKSgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcGFyYWxsZWwoZWFjaGZuLCB0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IF9pc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGVhY2hmbih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2soX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMucGFyYWxsZWwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2YsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnBhcmFsbGVsTGltaXQgPSBmdW5jdGlvbiAodGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEgPyBtYWtlQ2FsbGJhY2soaW5kZXggKyAxKSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5kb1doaWxzdCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgcmV0dXJuIGFzeW5jLndoaWxzdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZHVyaW5nID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG5cbiAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uIGNoZWNrKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbiAobmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbmN1cnJlbmN5ID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbmN1cnJlbmN5IG11c3Qgbm90IGJlIHplcm8nKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHBvcywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayB8fCBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGlmIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy51bnNoaWZ0KGl0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIGVtcHR5OiBub29wLFxuICAgICAgICAgICAgZHJhaW46IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiBwdXNoKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uIGtpbGwoKSB7XG4gICAgICAgICAgICAgICAgcS5kcmFpbiA9IG5vb3A7XG4gICAgICAgICAgICAgICAgcS50YXNrcyA9IFtdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVuc2hpZnQ6IGZ1bmN0aW9uIHVuc2hpZnQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiBwcm9jZXNzKCkge1xuICAgICAgICAgICAgICAgIGlmICghcS5wYXVzZWQgJiYgd29ya2VycyA8IHEuY29uY3VycmVuY3kgJiYgcS50YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFza3MgPSBxLnBheWxvYWQgPyBxLnRhc2tzLnNwbGljZSgwLCBxLnBheWxvYWQpIDogcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IF9tYXAodGFza3MsIGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5X29uY2UoX25leHQocSwgdGFza3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGVuZ3RoOiBmdW5jdGlvbiBsZW5ndGgoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJ1bm5pbmc6IGZ1bmN0aW9uIHJ1bm5pbmcoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaWRsZTogZnVuY3Rpb24gaWRsZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiByZXN1bWUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VtZUNvdW50ID0gTWF0aC5taW4ocS5jb25jdXJyZW5jeSwgcS50YXNrcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY2FsbCBxLnByb2Nlc3Mgb25jZSBwZXIgY29uY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcmVzdW1lQ291bnQ7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIGFzeW5jLnF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgdmFyIHEgPSBfcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICAgICAgd29ya2VyKGl0ZW1zWzBdLCBjYik7XG4gICAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gX2NvbXBhcmVUYXNrcyhhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKGVuZCAtIGJlZyArIDEgPj4+IDEpO1xuICAgICAgICAgICAgICAgIGlmIChjb21wYXJlKGl0ZW0sIHNlcXVlbmNlW21pZF0pID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYmVnID0gbWlkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1pZCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGJlZztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoX2JpbmFyeVNlYXJjaChxLnRhc2tzLCBpdGVtLCBfY29tcGFyZVRhc2tzKSArIDEsIDAsIGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShxLnByb2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTdGFydCB3aXRoIGEgbm9ybWFsIHF1ZXVlXG4gICAgICAgIHZhciBxID0gYXN5bmMucXVldWUod29ya2VyLCBjb25jdXJyZW5jeSk7XG5cbiAgICAgICAgLy8gT3ZlcnJpZGUgcHVzaCB0byBhY2NlcHQgc2Vjb25kIHBhcmFtZXRlciByZXByZXNlbnRpbmcgcHJpb3JpdHlcbiAgICAgICAgcS5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJlbW92ZSB1bnNoaWZ0IGZ1bmN0aW9uXG4gICAgICAgIGRlbGV0ZSBxLnVuc2hpZnQ7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLmNhcmdvID0gZnVuY3Rpb24gKHdvcmtlciwgcGF5bG9hZCkge1xuICAgICAgICByZXR1cm4gX3F1ZXVlKHdvcmtlciwgMSwgcGF5bG9hZCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25zb2xlX2ZuKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKGFyZ3MsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZVtuYW1lXSh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSldKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhc3luYy5sb2cgPSBfY29uc29sZV9mbignbG9nJyk7XG4gICAgYXN5bmMuZGlyID0gX2NvbnNvbGVfZm4oJ2RpcicpO1xuICAgIC8qYXN5bmMuaW5mbyA9IF9jb25zb2xlX2ZuKCdpbmZvJyk7XG4gICAgYXN5bmMud2FybiA9IF9jb25zb2xlX2ZuKCd3YXJuJyk7XG4gICAgYXN5bmMuZXJyb3IgPSBfY29uc29sZV9mbignZXJyb3InKTsqL1xuXG4gICAgYXN5bmMubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbiwgaGFzaGVyKSB7XG4gICAgICAgIHZhciBtZW1vID0ge307XG4gICAgICAgIHZhciBxdWV1ZXMgPSB7fTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGtleSBpbiBtZW1vKSB7XG4gICAgICAgICAgICAgICAgYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgaW4gcXVldWVzKSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgpIC8qIGZ1bmN0aW9ucy4uLiAqL3tcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhhdCwgW2Vycl0uY29uY2F0KHJlc3VsdHMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY29tcG9zZSA9IGZ1bmN0aW9uICgpIC8qIGZ1bmN0aW9ucy4uLiAqL3tcbiAgICAgICAgcmV0dXJuIGFzeW5jLnNlcS5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUucmV2ZXJzZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm5zLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZ28gPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVhY2hmbihmbnMsIGZ1bmN0aW9uIChmbiwgXywgY2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncy5jb25jYXQoW2NiXSkpO1xuICAgICAgICAgICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ287XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLmFwcGx5RWFjaCA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mKTtcbiAgICBhc3luYy5hcHBseUVhY2hTZXJpZXMgPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZlNlcmllcyk7XG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFzeW5jLndyYXBTeW5jID0gYXN5bmMuYXN5bmNpZnkgPSBmdW5jdGlvbiBhc3luY2lmeShmdW5jKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiByZXN1bHQgaXMgUHJvbWlzZSBvYmplY3RcbiAgICAgICAgICAgIGlmIChfaXNPYmplY3QocmVzdWx0KSAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgICAgIGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgICAgICAgICAgfVxufSkoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlWYzJWeWN5OWphR1YwYjI0dloybDBhSFZpTDNkbFltRndjR1Z1WjJsdVpTOTNaV0l2ZG1WdVpHOXlMMkZ6ZVc1akwyeHBZaTloYzNsdVl5NXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3T3pzN096czdRVUZQUVN4QlFVRkRMRU5CUVVFc1dVRkJXVHM3UVVGRlZDeFJRVUZKTEV0QlFVc3NSMEZCUnl4RlFVRkZMRU5CUVVNN1FVRkRaaXhoUVVGVExFbEJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEyeENMR0ZCUVZNc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlJUdEJRVU5xUWl4bFFVRlBMRU5CUVVNc1EwRkJRenRMUVVOYU8wRkJRMFFzWVVGQlV5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZPMEZCUTJZc1pVRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzB0QlEyUTdRVUZEUkN4aFFVRlRMRXRCUVVzc1EwRkJReXhEUVVGRExFVkJRVVU3UVVGRFpDeGxRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRPMHRCUTJJN096dEJRVWRFTEZGQlFVa3NZMEZCWXl4RFFVRkRPenM3T3p0QlFVdHVRaXhSUVVGSkxFbEJRVWtzUjBGQlJ5eFBRVUZQTEVsQlFVa3NTMEZCU3l4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFbEJRVWtzUzBGQlN5eEpRVUZKTEVsQlFVa3NTVUZCU1N4SlFVTjZSQ3hQUVVGUExFMUJRVTBzUzBGQlN5eFJRVUZSTEVsQlFVa3NUVUZCVFN4RFFVRkRMRTFCUVUwc1MwRkJTeXhOUVVGTkxFbEJRVWtzVFVGQlRTeEpRVU5vUlN4SlFVRkpMRU5CUVVNN08wRkJSV0lzVVVGQlNTeEpRVUZKTEVsQlFVa3NTVUZCU1N4RlFVRkZPMEZCUTJRc2MwSkJRV01zUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRPMHRCUXk5Q096dEJRVVZFTEZOQlFVc3NRMEZCUXl4VlFVRlZMRWRCUVVjc1dVRkJXVHRCUVVNelFpeFpRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMR05CUVdNc1EwRkJRenRCUVVNMVFpeGxRVUZQTEV0QlFVc3NRMEZCUXp0TFFVTm9RaXhEUVVGRE96dEJRVVZHTEdGQlFWTXNVMEZCVXl4RFFVRkRMRVZCUVVVc1JVRkJSVHRCUVVOdVFpeGxRVUZQTEZsQlFWYzdRVUZEWkN4blFrRkJTU3hGUVVGRkxFdEJRVXNzU1VGQlNTeEZRVUZGTEUxQlFVMHNTVUZCU1N4TFFVRkxMRU5CUVVNc09FSkJRVGhDTEVOQlFVTXNRMEZCUXp0QlFVTnFSU3hqUVVGRkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRU5CUVVNc1EwRkJRenRCUVVNeFFpeGpRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRPMU5CUTJJc1EwRkJRenRMUVVOTU96dEJRVVZFTEdGQlFWTXNTMEZCU3l4RFFVRkRMRVZCUVVVc1JVRkJSVHRCUVVObUxHVkJRVThzV1VGQlZ6dEJRVU5rTEdkQ1FVRkpMRVZCUVVVc1MwRkJTeXhKUVVGSkxFVkJRVVVzVDBGQlR6dEJRVU40UWl4alFVRkZMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUlVGQlJTeFRRVUZUTEVOQlFVTXNRMEZCUXp0QlFVTXhRaXhqUVVGRkxFZEJRVWNzU1VGQlNTeERRVUZETzFOQlEySXNRMEZCUXp0TFFVTk1PenM3TzBGQlNVUXNVVUZCU1N4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTTdPMEZCUlRGRExGRkJRVWtzVVVGQlVTeEhRVUZITEV0QlFVc3NRMEZCUXl4UFFVRlBMRWxCUVVrc1ZVRkJWU3hIUVVGSExFVkJRVVU3UVVGRE0wTXNaVUZCVHl4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eExRVUZMTEdkQ1FVRm5RaXhEUVVGRE8wdEJRMjVFTEVOQlFVTTdPenRCUVVkR0xGRkJRVWtzVTBGQlV5eEhRVUZITEZOQlFWb3NVMEZCVXl4RFFVRlpMRWRCUVVjc1JVRkJSVHRCUVVNeFFpeFpRVUZKTEVsQlFVa3NSMEZCUnl4UFFVRlBMRWRCUVVjc1EwRkJRenRCUVVOMFFpeGxRVUZQTEVsQlFVa3NTMEZCU3l4VlFVRlZMRWxCUVVrc1NVRkJTU3hMUVVGTExGRkJRVkVzU1VGQlNTeERRVUZETEVOQlFVTXNSMEZCUnl4RFFVRkRPMHRCUXpWRUxFTkJRVU03TzBGQlJVWXNZVUZCVXl4WlFVRlpMRU5CUVVNc1IwRkJSeXhGUVVGRk8wRkJRM1pDTEdWQlFVOHNVVUZCVVN4RFFVRkRMRWRCUVVjc1EwRkJRenM3UVVGRmFFSXNaVUZCVHl4SFFVRkhMRU5CUVVNc1RVRkJUU3hMUVVGTExGRkJRVkVzU1VGRE9VSXNSMEZCUnl4RFFVRkRMRTFCUVUwc1NVRkJTU3hEUVVGRExFbEJRMllzUjBGQlJ5eERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkJReXhCUVVOMlFpeERRVUZETzB0QlEwdzdPMEZCUlVRc1lVRkJVeXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTXpRaXhsUVVGUExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZEY2tJc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeFJRVUZSTEVOQlFVTXNSMEZETVVJc1ZVRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0TFFVTnNRenM3UVVGRlJDeGhRVUZUTEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJReTlDTEZsQlFVa3NTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJRenRaUVVOV0xFMUJRVTBzUjBGQlJ5eEhRVUZITEVOQlFVTXNUVUZCVFN4RFFVRkRPenRCUVVWNFFpeGxRVUZQTEVWQlFVVXNTMEZCU3l4SFFVRkhMRTFCUVUwc1JVRkJSVHRCUVVOeVFpeHZRa0ZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeExRVUZMTEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1UwRkRjRU03UzBGRFNqczdRVUZGUkN4aFFVRlRMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEzcENMRmxCUVVrc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6dFpRVU5XTEUxQlFVMHNSMEZCUnl4SFFVRkhMRU5CUVVNc1RVRkJUVHRaUVVOdVFpeE5RVUZOTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE96dEJRVVV6UWl4bFFVRlBMRVZCUVVVc1MwRkJTeXhIUVVGSExFMUJRVTBzUlVGQlJUdEJRVU55UWl4clFrRkJUU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVVzUzBGQlN5eEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPMU5CUTNCRU8wRkJRMFFzWlVGQlR5eE5RVUZOTEVOQlFVTTdTMEZEYWtJN08wRkJSVVFzWVVGQlV5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTI1Q0xHVkJRVThzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSU3hWUVVGVkxFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVTdRVUZCUlN4dFFrRkJUeXhEUVVGRExFTkJRVU03VTBGQlJTeERRVUZETEVOQlFVTTdTMEZETlVRN08wRkJSVVFzWVVGQlV5eFBRVUZQTEVOQlFVTXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hKUVVGSkxFVkJRVVU3UVVGRGJFTXNhMEpCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSVHRCUVVNdlFpeG5Ra0ZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhKUVVGSkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJRenRUUVVOc1F5eERRVUZETEVOQlFVTTdRVUZEU0N4bFFVRlBMRWxCUVVrc1EwRkJRenRMUVVObU96dEJRVVZFTEdGQlFWTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGJFTXNhMEpCUVZVc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNWVUZCVlN4SFFVRkhMRVZCUVVVN1FVRkRja01zYjBKQlFWRXNRMEZCUXl4TlFVRk5MRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZET1VJc1EwRkJReXhEUVVGRE8wdEJRMDQ3TzBGQlJVUXNZVUZCVXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRkxFbEJRVWtzUlVGQlJUdEJRVU42UWl4aFFVRkxMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlJUdEJRVU5xUXl4blFrRkJTU3hIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NTVUZCU1N4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xTkJRMnBETzBGQlEwUXNaVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRMUVVOaU96dEJRVVZFTEZGQlFVa3NTMEZCU3l4SFFVRkhMRTFCUVUwc1EwRkJReXhKUVVGSkxFbEJRVWtzVlVGQlZTeEhRVUZITEVWQlFVVTdRVUZEZEVNc1dVRkJTU3hKUVVGSkxFZEJRVWNzUlVGQlJTeERRVUZETzBGQlEyUXNZVUZCU3l4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFVkJRVVU3UVVGRFppeG5Ra0ZCU1N4SFFVRkhMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTzBGQlEzWkNMRzlDUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMkZCUTJoQ08xTkJRMG83UVVGRFJDeGxRVUZQTEVsQlFVa3NRMEZCUXp0TFFVTm1MRU5CUVVNN08wRkJSVVlzWVVGQlV5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZPMEZCUTNoQ0xGbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTFnc1dVRkJTU3hIUVVGSExFTkJRVU03UVVGRFVpeFpRVUZKTEVsQlFVa3NRMEZCUXp0QlFVTlVMRmxCUVVrc1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzBGQlEzQkNMR1ZCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzBGQlEyeENMRzFDUVVGUExGTkJRVk1zU1VGQlNTeEhRVUZITzBGQlEyNUNMR2xDUVVGRExFVkJRVVVzUTBGQlF6dEJRVU5LTEhWQ1FVRlBMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0aFFVTTNRaXhEUVVGRE8xTkJRMHdzVFVGQlRUdEJRVU5JTEdkQ1FVRkpMRWRCUVVjc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEyNUNMR1ZCUVVjc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzBGQlEyeENMRzFDUVVGUExGTkJRVk1zU1VGQlNTeEhRVUZITzBGQlEyNUNMR2xDUVVGRExFVkJRVVVzUTBGQlF6dEJRVU5LTEhWQ1FVRlBMRU5CUVVNc1IwRkJSeXhIUVVGSExFZEJRVWNzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJRenRoUVVOdVF5eERRVUZETzFOQlEwdzdTMEZEU2pzN096czdRVUZMUkN4aFFVRlRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzVlVGQlZTeEZRVUZGTzBGQlEyeERMR3RDUVVGVkxFZEJRVWNzVlVGQlZTeEpRVUZKTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEZWQlFWVXNRMEZCUXp0QlFVTm9SU3hsUVVGUExGbEJRVmM3UVVGRFpDeG5Ra0ZCU1N4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4SFFVRkhMRlZCUVZVc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU40UkN4blFrRkJTU3hKUVVGSkxFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMEZCUTNwQ0xHbENRVUZMTEVsQlFVa3NTMEZCU3l4SFFVRkhMRU5CUVVNc1JVRkJSU3hMUVVGTExFZEJRVWNzVFVGQlRTeEZRVUZGTEV0QlFVc3NSVUZCUlN4RlFVRkZPMEZCUTNwRExHOUNRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXp0aFFVTXZRenRCUVVORUxHOUNRVUZSTEZWQlFWVTdRVUZEWkN4eFFrRkJTeXhEUVVGRE8wRkJRVVVzTWtKQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdRVUZCUVN4QlFVTnlReXh4UWtGQlN5eERRVUZETzBGQlFVVXNNa0pCUVU4c1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzBGQlFVRXNZVUZEZEVRN096czdPenM3TzFOQlVVb3NRMEZCUXp0TFFVTk1PenRCUVVWRUxHRkJRVk1zWVVGQllTeERRVUZETEZGQlFWRXNSVUZCUlR0QlFVTTNRaXhsUVVGUExGVkJRVlVzUzBGQlN5eEZRVUZGTEV0QlFVc3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRja01zYlVKQlFVOHNVVUZCVVN4RFFVRkRMRXRCUVVzc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dFRRVU53UXl4RFFVRkRPMHRCUTB3N096czdPenM3UVVGUFJDeFJRVUZKTEdGQlFXRXNSMEZCUnl4UFFVRlBMRmxCUVZrc1MwRkJTeXhWUVVGVkxFbEJRVWtzV1VGQldTeERRVUZET3p0QlFVVjJSU3hSUVVGSkxFMUJRVTBzUjBGQlJ5eGhRVUZoTEVkQlFVY3NWVUZCVXl4RlFVRkZMRVZCUVVVN08wRkJSWFJETEhGQ1FVRmhMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03UzBGRGNrSXNSMEZCUnl4VlFVRlRMRVZCUVVVc1JVRkJSVHRCUVVOaUxHdENRVUZWTEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRM0pDTEVOQlFVTTdPMEZCUlVZc1VVRkJTU3hQUVVGUExFOUJRVThzUzBGQlN5eFJRVUZSTEVsQlFVa3NUMEZCVHl4UFFVRlBMRU5CUVVNc1VVRkJVU3hMUVVGTExGVkJRVlVzUlVGQlJUdEJRVU4yUlN4aFFVRkxMRU5CUVVNc1VVRkJVU3hIUVVGSExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTTdTMEZEY2tNc1RVRkJUVHRCUVVOSUxHRkJRVXNzUTBGQlF5eFJRVUZSTEVkQlFVY3NUVUZCVFN4RFFVRkRPMHRCUXpOQ08wRkJRMFFzVTBGQlN5eERRVUZETEZsQlFWa3NSMEZCUnl4aFFVRmhMRWRCUVVjc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eFJRVUZSTEVOQlFVTTdPMEZCUnpkRUxGTkJRVXNzUTBGQlF5eFBRVUZQTEVkQlEySXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhWUVVGVkxFZEJRVWNzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpWRExHVkJRVThzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRVZCUVVVc1lVRkJZU3hEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMHRCUXk5RUxFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMR0ZCUVdFc1IwRkRia0lzUzBGQlN5eERRVUZETEZWQlFWVXNSMEZCUnl4VlFVRlZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEyeEVMR1ZCUVU4c1MwRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eEhRVUZITEVWQlFVVXNZVUZCWVN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzB0QlEzSkZMRU5CUVVNN08wRkJSMFlzVTBGQlN5eERRVUZETEZsQlFWa3NSMEZEYkVJc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlJ5eFZRVUZWTEVkQlFVY3NSVUZCUlN4TFFVRkxMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU40UkN4bFFVRlBMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEhRVUZITEVWQlFVVXNZVUZCWVN4RFFVRkRMRkZCUVZFc1EwRkJReXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzB0QlEzUkZMRU5CUVVNN08wRkJSVVlzVTBGQlN5eERRVUZETEZOQlFWTXNSMEZEWml4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExGVkJRVlVzVFVGQlRTeEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRha1FzWjBKQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNc1VVRkJVU3hKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEyNURMR05CUVUwc1IwRkJSeXhOUVVGTkxFbEJRVWtzUlVGQlJTeERRVUZETzBGQlEzUkNMRmxCUVVrc1NVRkJTU3hIUVVGSExGbEJRVmtzUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUnl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNN1FVRkRka1VzV1VGQlNTeFRRVUZUTEVkQlFVY3NRMEZCUXl4RFFVRkRPMEZCUTJ4Q0xGbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVTdRVUZEVUN4dFFrRkJUeXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVMEZEZWtJN1FVRkRSQ3hoUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEZWQlFWVXNTMEZCU3l4RlFVRkZMRWRCUVVjc1JVRkJSVHRCUVVOb1F5eHZRa0ZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03VTBGREwwTXNRMEZCUXl4RFFVRkRPMEZCUTBnc2FVSkJRVk1zU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlR0QlFVTm1MR2RDUVVGSkxFZEJRVWNzUlVGQlJUdEJRVU5NTEhkQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WVVGRGFrSXNUVUZEU1R0QlFVTkVMSGxDUVVGVExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEyWXNiMEpCUVVrc1UwRkJVeXhKUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU51UWl3MFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJsQ1FVTnNRanRoUVVOS08xTkJRMG83UzBGRFNpeERRVUZET3p0QlFVVkdMRk5CUVVzc1EwRkJReXhsUVVGbExFZEJRM0pDTEV0QlFVc3NRMEZCUXl4WlFVRlpMRWRCUVVjc1ZVRkJWU3hIUVVGSExFVkJRVVVzVVVGQlVTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTndSQ3huUWtGQlVTeEhRVUZITEV0QlFVc3NRMEZCUXl4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRGJrTXNWMEZCUnl4SFFVRkhMRWRCUVVjc1NVRkJTU3hGUVVGRkxFTkJRVU03UVVGRGFFSXNXVUZCU1N4UFFVRlBMRWRCUVVjc1dVRkJXU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBGQlEyaERMRmxCUVVrc1IwRkJSeXhIUVVGSExFOUJRVThzUlVGQlJTeERRVUZETzBGQlEzQkNMR2xDUVVGVExFOUJRVThzUjBGQlJ6dEJRVU5tTEdkQ1FVRkpMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGFFSXNaMEpCUVVrc1IwRkJSeXhMUVVGTExFbEJRVWtzUlVGQlJUdEJRVU5rTEhWQ1FVRlBMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU42UWp0QlFVTkVMRzlDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRWRCUVVjc1JVRkJSU3hUUVVGVExFTkJRVU1zVlVGQlZTeEhRVUZITEVWQlFVVTdRVUZETjBNc2IwSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NORUpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dHBRa0ZEYWtJc1RVRkRTVHRCUVVORUxIVkNRVUZITEVkQlFVY3NUMEZCVHl4RlFVRkZMRU5CUVVNN1FVRkRhRUlzZDBKQlFVa3NSMEZCUnl4TFFVRkxMRWxCUVVrc1JVRkJSVHRCUVVOa0xDdENRVUZQTEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenR4UWtGRGVrSXNUVUZCVFR0QlFVTklMRFJDUVVGSkxFbEJRVWtzUlVGQlJUdEJRVU5PTEdsRFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETzNsQ1FVTXpRaXhOUVVGTk8wRkJRMGdzYlVOQlFVOHNSVUZCUlN4RFFVRkRPM2xDUVVOaU8zRkNRVU5LTzJsQ1FVTktPMkZCUTBvc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRFNpeG5Ra0ZCU1N4SFFVRkhMRXRCUVVzc1EwRkJRenRUUVVOb1FqdEJRVU5FTEdWQlFVOHNSVUZCUlN4RFFVRkRPMHRCUTJJc1EwRkJRenM3UVVGSlJpeFRRVUZMTEVOQlFVTXNZMEZCWXl4SFFVTndRaXhMUVVGTExFTkJRVU1zVjBGQlZ5eEhRVUZITEZWQlFWVXNSMEZCUnl4RlFVRkZMRXRCUVVzc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF6RkVMRzlDUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNSMEZCUnl4RlFVRkZMRkZCUVZFc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dExRVU5vUkN4RFFVRkRPenRCUVVWR0xHRkJRVk1zV1VGQldTeERRVUZETEV0QlFVc3NSVUZCUlRzN1FVRkZla0lzWlVGQlR5eFZRVUZWTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRM1JETEc5Q1FVRlJMRWRCUVVjc1MwRkJTeXhEUVVGRExGRkJRVkVzU1VGQlNTeEpRVUZKTEVOQlFVTXNRMEZCUXp0QlFVTnVReXhsUVVGSExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVWQlFVVXNRMEZCUXp0QlFVTm9RaXhuUWtGQlNTeFBRVUZQTEVkQlFVY3NXVUZCV1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRMmhETEdkQ1FVRkpMRXRCUVVzc1NVRkJTU3hEUVVGRExFVkJRVVU3UVVGRFdpeDFRa0ZCVHl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WVVGRGVrSTdRVUZEUkN4blFrRkJTU3hKUVVGSkxFZEJRVWNzUzBGQlN5eERRVUZETzBGQlEycENMR2RDUVVGSkxFOUJRVThzUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEYUVJc1owSkJRVWtzVDBGQlR5eEhRVUZITEV0QlFVc3NRMEZCUXpzN1FVRkZjRUlzWVVGQlF5eFRRVUZUTEZOQlFWTXNSMEZCU1R0QlFVTnVRaXh2UWtGQlNTeEpRVUZKTEVsQlFVa3NUMEZCVHl4SlFVRkpMRU5CUVVNc1JVRkJSVHRCUVVOMFFpd3lRa0ZCVHl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03YVVKQlEzcENPenRCUVVWRUxIVkNRVUZQTEU5QlFVOHNSMEZCUnl4TFFVRkxMRWxCUVVrc1EwRkJReXhQUVVGUExFVkJRVVU3UVVGRGFFTXNkMEpCUVVrc1IwRkJSeXhIUVVGSExFOUJRVThzUlVGQlJTeERRVUZETzBGQlEzQkNMSGRDUVVGSkxFZEJRVWNzUzBGQlN5eEpRVUZKTEVWQlFVVTdRVUZEWkN3MFFrRkJTU3hIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU5hTERSQ1FVRkpMRTlCUVU4c1NVRkJTU3hEUVVGRExFVkJRVVU3UVVGRFpDeHZRMEZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8zbENRVU5zUWp0QlFVTkVMQ3RDUVVGUE8zRkNRVU5XTzBGQlEwUXNNa0pCUVU4c1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRFlpdzBRa0ZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeEhRVUZITEVWQlFVVXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJSeXhGUVVGRk8wRkJRemRETEN0Q1FVRlBMRWxCUVVrc1EwRkJReXhEUVVGRE8wRkJRMklzTkVKQlFVa3NSMEZCUnl4RlFVRkZPMEZCUTB3c2IwTkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTmtMRzFEUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETzNsQ1FVTnNRaXhOUVVOSk8wRkJRMFFzY1VOQlFWTXNSVUZCUlN4RFFVRkRPM2xDUVVObU8zRkNRVU5LTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmxDUVVOUU8yRkJRMG9zUTBGQlFTeEZRVUZITEVOQlFVTTdVMEZEVWl4RFFVRkRPMHRCUTB3N08wRkJSMFFzWVVGQlV5eFZRVUZWTEVOQlFVTXNSVUZCUlN4RlFVRkZPMEZCUTNCQ0xHVkJRVThzVlVGQlZTeEhRVUZITEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOMFF5eHRRa0ZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8xTkJRM0JFTEVOQlFVTTdTMEZEVER0QlFVTkVMR0ZCUVZNc1pVRkJaU3hEUVVGRExFVkJRVVVzUlVGQlJUdEJRVU42UWl4bFFVRlBMRlZCUVZVc1IwRkJSeXhGUVVGRkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpkRExHMUNRVUZQTEVWQlFVVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVVzUjBGQlJ5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRU5CUVVNc1EwRkJRenRUUVVNelJDeERRVUZETzB0QlEwdzdRVUZEUkN4aFFVRlRMRkZCUVZFc1EwRkJReXhGUVVGRkxFVkJRVVU3UVVGRGJFSXNaVUZCVHl4VlFVRlZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEzUkRMRzFDUVVGUExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNXVUZCV1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdVMEZETVVRc1EwRkJRenRMUVVOTU96dEJRVVZFTEdGQlFWTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFVkJRVVVzVVVGQlVTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTm9SQ3huUWtGQlVTeEhRVUZITEV0QlFVc3NRMEZCUXl4UlFVRlJMRWxCUVVrc1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRGJrTXNXVUZCU1N4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8wRkJRMnBDTEdOQlFVMHNRMEZCUXl4SFFVRkhMRVZCUVVVc1ZVRkJWU3hMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTXhReXh2UWtGQlVTeERRVUZETEV0QlFVc3NSVUZCUlN4VlFVRlZMRWRCUVVjc1JVRkJSU3hEUVVGRExFVkJRVVU3UVVGRE9VSXNkVUpCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEYmtJc2QwSkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0aFFVTnFRaXhEUVVGRExFTkJRVU03VTBGRFRpeEZRVUZGTEZWQlFWVXNSMEZCUnl4RlFVRkZPMEZCUTJRc2IwSkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1UwRkRNVUlzUTBGQlF5eERRVUZETzB0QlEwNDdPMEZCUlVRc1UwRkJTeXhEUVVGRExFZEJRVWNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1FVRkRiRU1zVTBGQlN5eERRVUZETEZOQlFWTXNSMEZCUnl4UlFVRlJMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU03UVVGRGRFTXNVMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhsUVVGbExFTkJRVU1zVTBGQlV5eERRVUZETEVOQlFVTTdPenM3UVVGSk5VTXNVMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkRXaXhMUVVGTExFTkJRVU1zUzBGQlN5eEhRVU5ZTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1ZVRkJWU3hIUVVGSExFVkJRVVVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRjRVFzWVVGQlN5eERRVUZETEZsQlFWa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1ZVRkJWU3hEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTTVReXh2UWtGQlVTeERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRVZCUVVVc1ZVRkJWU3hIUVVGSExFVkJRVVVzUTBGQlF5eEZRVUZGTzBGQlEyaERMRzlDUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETzBGQlExUXNkMEpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5xUWl4RFFVRkRMRU5CUVVNN1UwRkRUaXhGUVVGRkxGVkJRVlVzUjBGQlJ5eEZRVUZGTzBGQlEyUXNiMEpCUVZFc1EwRkJReXhIUVVGSExFbEJRVWtzU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUXk5Q0xFTkJRVU1zUTBGQlF6dExRVU5PTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExFdEJRVXNzUjBGRFdDeExRVUZMTEVOQlFVTXNWMEZCVnl4SFFVRkhMRlZCUVZVc1IwRkJSeXhGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNwRUxGbEJRVWtzVVVGQlVTeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTTdRVUZETjBNc1lVRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVWQlFVVXNTVUZCU1N4RlFVRkZMRkZCUVZFc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dExRVU53UkN4RFFVRkRPenRCUVVWR0xHRkJRVk1zVDBGQlR5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU01UXl4WlFVRkpMRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGFrSXNZMEZCVFN4RFFVRkRMRWRCUVVjc1JVRkJSU3hWUVVGVkxFTkJRVU1zUlVGQlJTeExRVUZMTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNSRExHOUNRVUZSTEVOQlFVTXNRMEZCUXl4RlFVRkZMRlZCUVZVc1EwRkJReXhGUVVGRk8wRkJRM0pDTEc5Q1FVRkpMRU5CUVVNc1JVRkJSVHRCUVVOSUxESkNRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVNc1MwRkJTeXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVWQlFVVXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJRenRwUWtGRE1VTTdRVUZEUkN4M1FrRkJVU3hGUVVGRkxFTkJRVU03WVVGRFpDeERRVUZETEVOQlFVTTdVMEZEVGl4RlFVRkZMRmxCUVZrN1FVRkRXQ3h2UWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0QlFVTjJReXgxUWtGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU03WVVGRE5VSXNRMEZCUXl4RlFVRkZMRlZCUVZVc1EwRkJReXhGUVVGRk8wRkJRMklzZFVKQlFVOHNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJRenRoUVVOc1FpeERRVUZETEVOQlFVTXNRMEZCUXp0VFFVTlFMRU5CUVVNc1EwRkJRenRMUVVOT096dEJRVVZFTEZOQlFVc3NRMEZCUXl4TlFVRk5MRWRCUTFvc1MwRkJTeXhEUVVGRExFMUJRVTBzUjBGQlJ5eFZRVUZWTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN08wRkJSVzVETEZOQlFVc3NRMEZCUXl4WFFVRlhMRWRCUTJwQ0xFdEJRVXNzUTBGQlF5eFhRVUZYTEVkQlFVY3NaVUZCWlN4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRE96dEJRVVUzUXl4VFFVRkxMRU5CUVVNc1dVRkJXU3hIUVVOc1FpeExRVUZMTEVOQlFVTXNXVUZCV1N4SFFVRkhMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6czdRVUZGZGtNc1lVRkJVeXhQUVVGUExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRemxETEdWQlFVOHNRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhGUVVGRkxGVkJRVk1zUzBGQlN5eEZRVUZGTEVWQlFVVXNSVUZCUlR0QlFVTnlReXh2UWtGQlVTeERRVUZETEV0QlFVc3NSVUZCUlN4VlFVRlRMRU5CUVVNc1JVRkJSVHRCUVVONFFpeHJRa0ZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WVVGRFZpeERRVUZETEVOQlFVTTdVMEZEVGl4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8wdEJRMmhDTzBGQlEwUXNVMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhWUVVGVkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdRVUZEYmtNc1UwRkJTeXhEUVVGRExGZEJRVmNzUjBGQlJ5eGxRVUZsTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNN1FVRkROME1zVTBGQlN5eERRVUZETEZsQlFWa3NSMEZCUnl4UlFVRlJMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03TzBGQlJYWkRMR0ZCUVZNc1lVRkJZU3hEUVVGRExFMUJRVTBzUlVGQlJTeExRVUZMTEVWQlFVVXNVMEZCVXl4RlFVRkZPMEZCUXpkRExHVkJRVThzVlVGQlV5eEhRVUZITEVWQlFVVXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSU3hGUVVGRkxFVkJRVVU3UVVGRGRFTXNjVUpCUVZNc1NVRkJTU3hIUVVGSE8wRkJRMW9zYjBKQlFVa3NSVUZCUlN4RlFVRkZMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVONFF6dEJRVU5FTEhGQ1FVRlRMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTTVRaXh2UWtGQlNTeERRVUZETEVWQlFVVXNSVUZCUlN4UFFVRlBMRkZCUVZFc1JVRkJSU3hEUVVGRE8wRkJRek5DTEhkQ1FVRlJMRU5CUVVNc1EwRkJReXhGUVVGRkxGVkJRVlVzUTBGQlF5eEZRVUZGTzBGQlEzSkNMSGRDUVVGSkxFVkJRVVVzU1VGQlNTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVN1FVRkRhRUlzTUVKQlFVVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZGtJc01FSkJRVVVzUjBGQlJ5eFJRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRPM0ZDUVVONlFqdEJRVU5FTERSQ1FVRlJMRVZCUVVVc1EwRkJRenRwUWtGRFpDeERRVUZETEVOQlFVTTdZVUZEVGp0QlFVTkVMR2RDUVVGSkxGTkJRVk1zUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4RlFVRkZPMEZCUTNSQ0xITkNRVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRXRCUVVzc1JVRkJSU3hSUVVGUkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdZVUZEZEVNc1RVRkJUVHRCUVVOSUxHdENRVUZGTEVkQlFVY3NVVUZCVVN4RFFVRkRPMEZCUTJRc2QwSkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTTdRVUZEYWtJc2MwSkJRVTBzUTBGQlF5eEhRVUZITEVWQlFVVXNVVUZCVVN4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJReTlDTzFOQlEwb3NRMEZCUXp0TFFVTk1PenRCUVVWRUxGTkJRVXNzUTBGQlF5eEhRVUZITEVkQlExUXNTMEZCU3l4RFFVRkRMRWxCUVVrc1IwRkJSeXhoUVVGaExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03TzBGQlJUTkVMRk5CUVVzc1EwRkJReXhUUVVGVExFZEJRVWNzWVVGQllTeERRVUZETEV0QlFVc3NRMEZCUXl4WFFVRlhMRVZCUVVVc1RVRkJUU3hGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZET3p0QlFVVnlSU3hUUVVGTExFTkJRVU1zUjBGQlJ5eEhRVU5VTEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1lVRkJZU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVXNTMEZCU3l4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE96dEJRVVY0UkN4VFFVRkxMRU5CUVVNc1ZVRkJWU3hIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6czdRVUZGYkVVc1lVRkJVeXhqUVVGakxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0QlFVTXhRaXhsUVVGUExFTkJRVU1zUTBGQlF6dExRVU5hTzBGQlEwUXNVMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSeXhoUVVGaExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4UlFVRlJMRVZCUVVVc1kwRkJZeXhEUVVGRExFTkJRVU03UVVGRGNrVXNVMEZCU3l4RFFVRkRMRmxCUVZrc1IwRkJSeXhoUVVGaExFTkJRVU1zUzBGQlN5eERRVUZETEZsQlFWa3NSVUZCUlN4UlFVRlJMRVZCUVVVc1kwRkJZeXhEUVVGRExFTkJRVU03UVVGRGFrWXNVMEZCU3l4RFFVRkRMRmRCUVZjc1IwRkJSeXhoUVVGaExFTkJRVU1zUzBGQlN5eERRVUZETEZkQlFWY3NSVUZCUlN4UlFVRlJMRVZCUVVVc1kwRkJZeXhEUVVGRExFTkJRVU03TzBGQlJTOUZMRk5CUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzVlVGQlZTeEhRVUZITEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVNNVF5eGhRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1JVRkJSU3hWUVVGVkxFTkJRVU1zUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEYkVNc2IwSkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVXNWVUZCVlN4SFFVRkhMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRMnBETEc5Q1FVRkpMRWRCUVVjc1JVRkJSVHRCUVVOTUxEUkNRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN2FVSkJRMnBDTEUxQlEwazdRVUZEUkN3MFFrRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeEZRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUlVGQlF5eERRVUZETEVOQlFVTTdhVUpCUTJ4RU8yRkJRMG9zUTBGQlF5eERRVUZETzFOQlEwNHNSVUZCUlN4VlFVRlZMRWRCUVVjc1JVRkJSU3hQUVVGUExFVkJRVVU3UVVGRGRrSXNaMEpCUVVrc1IwRkJSeXhGUVVGRk8wRkJRMHdzZFVKQlFVOHNVVUZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8yRkJRM2hDTEUxQlEwazdRVUZEUkN4M1FrRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zUlVGQlJTeFZRVUZWTEVOQlFVTXNSVUZCUlR0QlFVTjJSQ3d5UWtGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRPMmxDUVVOc1FpeERRVUZETEVOQlFVTXNRMEZCUXp0aFFVTlFPMU5CUlVvc1EwRkJReXhEUVVGRE96dEJRVVZJTEdsQ1FVRlRMRlZCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEZRVUZGTzBGQlF6ZENMR2RDUVVGSkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNVVUZCVVR0blFrRkJSU3hEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETEZGQlFWRXNRMEZCUXp0QlFVTXhReXh0UWtGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRUUVVOeVF6dExRVU5LTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eFZRVUZWTEV0QlFVc3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRjRU1zWjBKQlFWRXNSMEZCUnl4TFFVRkxMRU5CUVVNc1VVRkJVU3hKUVVGSkxFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEyNURMRmxCUVVrc1NVRkJTU3hIUVVGSExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0QlFVTjRRaXhaUVVGSkxHTkJRV01zUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRPMEZCUTJwRExGbEJRVWtzUTBGQlF5eGpRVUZqTEVWQlFVVTdRVUZEYWtJc2JVSkJRVThzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTNwQ096dEJRVVZFTEZsQlFVa3NUMEZCVHl4SFFVRkhMRVZCUVVVc1EwRkJRenM3UVVGRmFrSXNXVUZCU1N4VFFVRlRMRWRCUVVjc1JVRkJSU3hEUVVGRE8wRkJRMjVDTEdsQ1FVRlRMRmRCUVZjc1EwRkJReXhGUVVGRkxFVkJRVVU3UVVGRGNrSXNjVUpCUVZNc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdVMEZEZWtJN1FVRkRSQ3hwUWtGQlV5eGpRVUZqTEVOQlFVTXNSVUZCUlN4RlFVRkZPMEZCUTNoQ0xHZENRVUZKTEVkQlFVY3NSMEZCUnl4UlFVRlJMRU5CUVVNc1UwRkJVeXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETzBGQlEyeERMR2RDUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEVWQlFVVXNVMEZCVXl4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdVMEZETVVNN1FVRkRSQ3hwUWtGQlV5eFpRVUZaTEVkQlFVYzdRVUZEY0VJc01FSkJRV01zUlVGQlJTeERRVUZETzBGQlEycENMSE5DUVVGVkxFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hWUVVGVkxFVkJRVVVzUlVGQlJUdEJRVU42UXl4clFrRkJSU3hGUVVGRkxFTkJRVU03WVVGRFVpeERRVUZETEVOQlFVTTdVMEZEVGpzN1FVRkZSQ3h0UWtGQlZ5eERRVUZETEZsQlFWazdRVUZEY0VJc1owSkJRVWtzUTBGQlF5eGpRVUZqTEVWQlFVVTdRVUZEYWtJc2QwSkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4RFFVRkRMRU5CUVVNN1lVRkRNMEk3VTBGRFNpeERRVUZETEVOQlFVTTdPMEZCUlVnc2EwSkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNWVUZCVlN4RFFVRkRMRVZCUVVVN1FVRkRNVUlzWjBKQlFVa3NTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOeVJDeG5Ra0ZCU1N4WlFVRlpMRWRCUVVjc1ZVRkJWU3hEUVVGRExGVkJRVk1zUjBGQlJ5eEZRVUZGTEVsQlFVa3NSVUZCUlR0QlFVTTVReXh2UWtGQlNTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SlFVRkpMRU5CUVVNc1JVRkJSVHRCUVVOc1FpeDNRa0ZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dHBRa0ZEYkVJN1FVRkRSQ3h2UWtGQlNTeEhRVUZITEVWQlFVVTdRVUZEVEN4M1FrRkJTU3hYUVVGWExFZEJRVWNzUlVGQlJTeERRVUZETzBGQlEzSkNMRGhDUVVGVkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZWQlFWTXNSMEZCUnl4RlFVRkZMRWxCUVVrc1JVRkJSVHRCUVVOd1F5eHRRMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFZEJRVWNzUTBGQlF6dHhRa0ZETTBJc1EwRkJReXhEUVVGRE8wRkJRMGdzSzBKQlFWY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGRFSXNORUpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzVjBGQlZ5eERRVUZETEVOQlFVTTdhVUpCUXpsQ0xFMUJRMGs3UVVGRFJDd3lRa0ZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF6dEJRVU5zUWl4NVFrRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXp0cFFrRkRjRU03WVVGRFNpeERRVUZETEVOQlFVTTdRVUZEU0N4blFrRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXpzN1FVRkZPVU1zWjBKQlFVa3NSMEZCUnl4SFFVRkhMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU03UVVGRE1VSXNaMEpCUVVrc1IwRkJSeXhEUVVGRE8wRkJRMUlzYlVKQlFVOHNSMEZCUnl4RlFVRkZMRVZCUVVVN1FVRkRWaXh2UWtGQlNTeEZRVUZGTEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVRXNRVUZCUXl4RlFVRkZPMEZCUXk5Q0xEQkNRVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMREpDUVVFeVFpeERRVUZETEVOQlFVTTdhVUpCUTJoRU8wRkJRMFFzYjBKQlFVa3NVVUZCVVN4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRk8wRkJRM2hETERCQ1FVRk5MRWxCUVVrc1MwRkJTeXhEUVVGRExIbENRVUY1UWl4RFFVRkRMRU5CUVVNN2FVSkJRemxETzJGQlEwbzdRVUZEUkN4eFFrRkJVeXhMUVVGTExFZEJRVWM3UVVGRFlpeDFRa0ZCVHl4UFFVRlBMRU5CUVVNc1VVRkJVU3hGUVVGRkxGVkJRVlVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0QlFVTnlReXd5UWtGQlVTeERRVUZETEVsQlFVa3NUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlJUdHBRa0ZETTBNc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WVVGRE1VTTdRVUZEUkN4blFrRkJTU3hMUVVGTExFVkJRVVVzUlVGQlJUdEJRVU5VTEc5Q1FVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRVZCUVVVc1QwRkJUeXhEUVVGRExFTkJRVU03WVVGRGFFUXNUVUZEU1R0QlFVTkVMREpDUVVGWExFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTTdZVUZEZWtJN1FVRkRSQ3h4UWtGQlV5eFJRVUZSTEVkQlFVYzdRVUZEYUVJc2IwSkJRVWtzUzBGQlN5eEZRVUZGTEVWQlFVVTdRVUZEVkN4clEwRkJZeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBGQlEzcENMSGRDUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdhVUpCUTJoRU8yRkJRMG83VTBGRFNpeERRVUZETEVOQlFVTTdTMEZEVGl4RFFVRkRPenRCUVVsR0xGTkJRVXNzUTBGQlF5eExRVUZMTEVkQlFVY3NWVUZCVXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU14UXl4WlFVRkpMR0ZCUVdFc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGRFSXNXVUZCU1N4blFrRkJaMElzUjBGQlJ5eERRVUZETEVOQlFVTTdPMEZCUlhwQ0xGbEJRVWtzVVVGQlVTeEhRVUZITEVWQlFVVXNRMEZCUXpzN1FVRkZiRUlzV1VGQlNTeEpRVUZKTEVkQlFVYzdRVUZEVUN4cFFrRkJTeXhGUVVGRkxHRkJRV0U3UVVGRGNFSXNiMEpCUVZFc1JVRkJSU3huUWtGQlowSTdVMEZETjBJc1EwRkJRenM3UVVGRlJpeHBRa0ZCVXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU1zUlVGQlF6dEJRVU4yUWl4blFrRkJSeXhQUVVGUExFTkJRVU1zUzBGQlN5eFJRVUZSTEVWQlFVTTdRVUZEY2tJc2JVSkJRVWNzUTBGQlF5eExRVUZMTEVkQlFVY3NVVUZCVVN4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zU1VGQlNTeGhRVUZoTEVOQlFVTTdZVUZEYUVRc1RVRkJUU3hKUVVGSExFOUJRVThzUTBGQlF5eExRVUZMTEZGQlFWRXNSVUZCUXp0QlFVTTFRaXh0UWtGQlJ5eERRVUZETEV0QlFVc3NSMEZCUnl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEVOQlFVTXNTVUZCU1N4aFFVRmhMRU5CUVVNN1FVRkRia1FzYlVKQlFVY3NRMEZCUXl4UlFVRlJMRWRCUVVjc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZSTEVWQlFVVXNSVUZCUlN4RFFVRkRMRWxCUVVrc1owSkJRV2RDTEVOQlFVTTdZVUZETDBRc1RVRkJUVHRCUVVOSUxITkNRVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMREpEUVVFeVF5eEhRVUZITEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRNMFU3VTBGRFNqczdRVUZGUkN4WlFVRkpMRTFCUVUwc1IwRkJSeXhUUVVGVExFTkJRVU1zVFVGQlRTeERRVUZETzBGQlF6bENMRmxCUVVrc1RVRkJUU3hIUVVGSExFTkJRVU1zU1VGQlNTeE5RVUZOTEVkQlFVY3NRMEZCUXl4RlFVRkZPMEZCUXpGQ0xHdENRVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMSFZIUVVGMVJ5eERRVUZETEVOQlFVTTdVMEZETlVnc1RVRkJUU3hKUVVGSkxFMUJRVTBzU1VGQlNTeERRVUZETEVsQlFVa3NUMEZCVHl4TFFVRkxMRXRCUVVzc1ZVRkJWU3hGUVVGRk8wRkJRMjVFTEc5Q1FVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRE8wRkJRMmhDTEdkQ1FVRkpMRWRCUVVjc1MwRkJTeXhEUVVGRE8xTkJRMmhDTzBGQlEwUXNXVUZCU1N4UFFVRlBMRXRCUVVzc1MwRkJTeXhWUVVGVkxFVkJRVVU3UVVGRE4wSXNjMEpCUVZVc1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdVMEZETTBJN1FVRkRSQ3haUVVGSkxFTkJRVU1zVVVGQlVTeEhRVUZITEZGQlFWRXNRMEZCUXp0QlFVTjZRaXhaUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXpzN1FVRkZha0lzYVVKQlFWTXNWMEZCVnl4RFFVRkRMR1ZCUVdVc1JVRkJSU3hqUVVGakxFVkJRVVU3UVVGRGJFUXNjVUpCUVZNc1dVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeFpRVUZaTEVWQlFVVTdRVUZEZEVNc2RVSkJRVThzVlVGQlV5eGpRVUZqTEVWQlFVVTdRVUZETlVJc2QwSkJRVWtzUTBGQlF5eFZRVUZUTEVkQlFVY3NSVUZCUlN4TlFVRk5MRVZCUVVNN1FVRkRkRUlzYzBOQlFXTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3haUVVGWkxFVkJRVVVzUlVGQlF5eEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRTFCUVUwc1JVRkJSU3hOUVVGTkxFVkJRVU1zUTBGQlF5eERRVUZETzNGQ1FVTndSU3hGUVVGRkxHTkJRV01zUTBGQlF5eERRVUZETzJsQ1FVTjBRaXhEUVVGRE8yRkJRMHc3TzBGQlJVUXNjVUpCUVZNc1lVRkJZU3hEUVVGRExGRkJRVkVzUlVGQlF6dEJRVU0xUWl4MVFrRkJUeXhWUVVGVExHTkJRV01zUlVGQlF6dEJRVU16UWl3NFFrRkJWU3hEUVVGRExGbEJRVlU3UVVGRGFrSXNjME5CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dHhRa0ZEZUVJc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dHBRa0ZEYUVJc1EwRkJRenRoUVVOTU96dEJRVVZFTEcxQ1FVRlBMRWxCUVVrc1EwRkJReXhMUVVGTExFVkJRVVU3TzBGQlJXWXNiMEpCUVVrc1dVRkJXU3hIUVVGSExFVkJRVVVzU1VGQlNTeERRVUZETEV0QlFVc3NTVUZCUlN4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGRE8wRkJRM0JETEhkQ1FVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExGbEJRVmtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRmxCUVZrc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGNrUXNiMEpCUVVjc1EwRkJReXhaUVVGWkxFbEJRVWtzU1VGQlNTeERRVUZETEZGQlFWRXNSMEZCUnl4RFFVRkRMRVZCUVVNN1FVRkRiRU1zTkVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRPMmxDUVVNdlF6dGhRVU5LT3p0QlFVVkVMR2xDUVVGTExFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNSVUZCUlN4VlFVRlRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVU03UVVGRGRrTXNiMEpCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVNM1FpeHBRa0ZCUXl4bFFVRmxMRWxCUVVrc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlFTeERRVUZGTEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzJGQlF6ZEVMRU5CUVVNc1EwRkJRenRUUVVOT096czdRVUZIUkN4bFFVRlBMRWxCUVVrc1EwRkJReXhSUVVGUkxFZEJRVWNzVjBGQlZ5eEZRVUZGTEVkQlFVY3NWMEZCVnl4RFFVRkRPMHRCUTNSRUxFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhWUVVGVkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZWtNc1owSkJRVkVzUjBGQlJ5eExRVUZMTEVOQlFVTXNVVUZCVVN4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRE8wRkJRMjVETEZsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVU3UVVGRGJFSXNaMEpCUVVrc1IwRkJSeXhIUVVGSExFbEJRVWtzUzBGQlN5eERRVUZETERKRVFVRXlSQ3hEUVVGRExFTkJRVU03UVVGRGFrWXNiVUpCUVU4c1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzFOQlEzaENPMEZCUTBRc1dVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVWQlFVVTdRVUZEWml4dFFrRkJUeXhSUVVGUkxFVkJRVVVzUTBGQlF6dFRRVU55UWp0QlFVTkVMR2xDUVVGVExGbEJRVmtzUTBGQlF5eFJRVUZSTEVWQlFVVTdRVUZETlVJc2JVSkJRVThzVlVGQlZTeERRVUZETEZWQlFWVXNSMEZCUnl4RlFVRkZMRWxCUVVrc1JVRkJSVHRCUVVOdVF5eHZRa0ZCU1N4SFFVRkhMRVZCUVVVN1FVRkRUQ3cwUWtGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJRenRwUWtGRE5VTXNUVUZEU1R0QlFVTkVMSGRDUVVGSkxFbEJRVWtzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRU5CUVVNN1FVRkRNMElzZDBKQlFVa3NTVUZCU1N4RlFVRkZPMEZCUTA0c05FSkJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03Y1VKQlEycERMRTFCUTBrN1FVRkRSQ3cwUWtGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJRenR4UWtGRGRrSTdRVUZEUkN3clFrRkJWeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03YVVKQlF6TkRPMkZCUTBvc1EwRkJReXhEUVVGRE8xTkJRMDQ3UVVGRFJDeHZRa0ZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMHRCUTNwRExFTkJRVU03TzBGQlJVWXNZVUZCVXl4VFFVRlRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZUVNc1owSkJRVkVzUjBGQlJ5eFJRVUZSTEVsQlFVa3NTVUZCU1N4RFFVRkRPMEZCUXpWQ0xGbEJRVWtzVDBGQlR5eEhRVUZITEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZET3p0QlFVVTFReXhqUVVGTkxFTkJRVU1zUzBGQlN5eEZRVUZGTEZWQlFWVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGVrTXNaMEpCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVlVGQlZTeEhRVUZITEVWQlFVVXNTVUZCU1N4RlFVRkZPMEZCUTJwRExHOUNRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRk5MRWxCUVVrc1EwRkJReXhGUVVGRk8wRkJRMnhDTEhkQ1FVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzJsQ1FVTnNRanRCUVVORUxIVkNRVUZQTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRE8wRkJRM0JDTEhkQ1FVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03WVVGRGFrSXNRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRVQ3hGUVVGRkxGVkJRVlVzUjBGQlJ5eEZRVUZGTzBGQlEyUXNiMEpCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdVMEZETVVJc1EwRkJReXhEUVVGRE8wdEJRMDQ3TzBGQlJVUXNVMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhWUVVGVkxFdEJRVXNzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZUVNc2FVSkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RlFVRkZMRXRCUVVzc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dExRVU0xUXl4RFFVRkRPenRCUVVWR0xGTkJRVXNzUTBGQlF5eGhRVUZoTEVkQlFVY3NWVUZCVXl4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU51UkN4cFFrRkJVeXhEUVVGRExGbEJRVmtzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlN4TFFVRkxMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03UzBGRGJrUXNRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zVFVGQlRTeEhRVUZITEZWQlFWTXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSVHRCUVVOeVF5eHBRa0ZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhaUVVGWkxFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMHRCUTJ4RUxFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMRkZCUVZFc1IwRkJSeXhWUVVGVkxFdEJRVXNzUlVGQlJUdEJRVU01UWl4cFFrRkJVeXhaUVVGWkxFTkJRVU1zUzBGQlN5eEZRVUZGTzBGQlEzcENMSEZDUVVGVExFVkJRVVVzUjBGQlJ6dEJRVU5XTEc5Q1FVRkpMRXRCUVVzc1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGRFpDeDVRa0ZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN2FVSkJRM1pETzBGQlEwUXNkVUpCUVU4c1JVRkJSU3hEUVVGRExFbEJRVWtzUlVGQlJTeERRVUZETzJGQlEzQkNPMEZCUTBRc1kwRkJSU3hEUVVGRExFbEJRVWtzUjBGQlJ5eFpRVUZaTzBGQlEyeENMSFZDUVVGUExFRkJRVU1zUzBGQlN5eEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhIUVVGSkxGbEJRVmtzUTBGQlF5eExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWRCUVVVc1NVRkJTU3hEUVVGRE8yRkJRM0pGTEVOQlFVTTdRVUZEUml4dFFrRkJUeXhGUVVGRkxFTkJRVU03VTBGRFlqdEJRVU5FTEdWQlFVOHNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRekZDTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNWVUZCVlN4RlFVRkZMRVZCUVVVc1NVRkJTU3hGUVVGRk8wRkJRM3BETEdWQlFVOHNWVUZCVlN4RFFVRkRMRlZCUVZVc1VVRkJVU3hGUVVGRk8wRkJRMnhETEcxQ1FVRlBMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRMWdzU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRemxDTEVOQlFVTTdVMEZEVEN4RFFVRkRMRU5CUVVNN1MwRkRUaXhEUVVGRExFTkJRVU03TzBGQlJVZ3NZVUZCVXl4UFFVRlBMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUlVGQlJTeEZRVUZGTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNoRExGbEJRVWtzVFVGQlRTeEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVTm9RaXhqUVVGTkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEZWQlFWVXNRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hGUVVGRkxFVkJRVVU3UVVGRGFFTXNZMEZCUlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hWUVVGVkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVTdRVUZEY0VJc2MwSkJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF6dEJRVU5vUXl4clFrRkJSU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzJGQlExZ3NRMEZCUXl4RFFVRkRPMU5CUTA0c1JVRkJSU3hWUVVGVkxFZEJRVWNzUlVGQlJUdEJRVU5rTEc5Q1FVRlJMRU5CUVVNc1IwRkJSeXhGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETzFOQlEzcENMRU5CUVVNc1EwRkJRenRMUVVOT08wRkJRMFFzVTBGQlN5eERRVUZETEUxQlFVMHNSMEZCUnl4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03UVVGRGJrTXNVMEZCU3l4RFFVRkRMRmxCUVZrc1IwRkJSeXhSUVVGUkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdPMEZCUlhaRExGTkJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NWVUZCVlN4SlFVRkpMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUlVGQlJUdEJRVU12UXl4blFrRkJVU3hIUVVGSExGRkJRVkVzU1VGQlNTeEpRVUZKTEVOQlFVTTdRVUZETlVJc1dVRkJTU3hKUVVGSkxFVkJRVVVzUlVGQlJUdEJRVU5TTEdkQ1FVRkpMRWxCUVVrc1IwRkJSeXhWUVVGVkxFTkJRVU1zVlVGQlV5eEhRVUZITEVWQlFVVXNTVUZCU1N4RlFVRkZPMEZCUTNSRExHOUNRVUZKTEVkQlFVY3NSVUZCUlR0QlFVTk1MRFJDUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdhVUpCUTJwQ0xFMUJRVTBzU1VGQlNTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUlVGQlJUdEJRVU12UWl3MFFrRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzJsQ1FVTnNRaXhOUVVGTk8wRkJRMGdzTkVKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRwUWtGRGJFSTdZVUZEU2l4RFFVRkRMRU5CUVVNN1FVRkRTQ3h2UWtGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMU5CUTJ4Q0xFMUJRVTA3UVVGRFNDeHZRa0ZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8xTkJRMnhDTzB0QlEwb3NRMEZCUXpzN1FVRkZSaXhUUVVGTExFTkJRVU1zVVVGQlVTeEhRVUZITEZWQlFWVXNVVUZCVVN4RlFVRkZMRWxCUVVrc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGFrUXNXVUZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRE8wRkJRMlFzWlVGQlR5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRmxCUVZjN1FVRkRNMElzYlVKQlFVOHNSVUZCUlN4TFFVRkxMRWxCUVVrc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8xTkJRM1JFTEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8wdEJRekZDTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVsQlFVa3NSVUZCUlN4UlFVRlJMRVZCUVVVc1VVRkJVU3hGUVVGRk8wRkJRemxETEdWQlFVOHNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhaUVVGWE8wRkJRek5DTEcxQ1FVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1UwRkRka01zUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RFFVRkRMRU5CUVVNN1MwRkRNVUlzUTBGQlF6czdRVUZGUml4VFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExGVkJRVlVzVVVGQlVTeEZRVUZGTEVsQlFVa3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRhRVFzWlVGQlR5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRkZCUVZFc1JVRkJSU3haUVVGWE8wRkJRM1pETEcxQ1FVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN1UwRkRka01zUlVGQlJTeFJRVUZSTEVOQlFVTXNRMEZCUXp0TFFVTm9RaXhEUVVGRE96dEJRVVZHTEZOQlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1ZVRkJWU3hKUVVGSkxFVkJRVVVzVVVGQlVTeEZRVUZGTEZGQlFWRXNSVUZCUlR0QlFVTXZReXhuUWtGQlVTeEhRVUZITEZGQlFWRXNTVUZCU1N4SlFVRkpMRU5CUVVNN08wRkJSVFZDTEZsQlFVa3NTVUZCU1N4SFFVRkhMRlZCUVZVc1EwRkJReXhWUVVGVExFZEJRVWNzUlVGQlJTeEpRVUZKTEVWQlFVVTdRVUZEZEVNc1owSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NkMEpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5xUWl4TlFVRk5PMEZCUTBnc2IwSkJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1FVRkRha0lzYjBKQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eERRVUZETzJGQlF6RkNPMU5CUTBvc1EwRkJReXhEUVVGRE96dEJRVVZJTEZsQlFVa3NTMEZCU3l4SFFVRkhMRk5CUVZJc1MwRkJTeXhEUVVGWkxFZEJRVWNzUlVGQlJTeExRVUZMTEVWQlFVVTdRVUZETjBJc1owSkJRVWtzUjBGQlJ5eEZRVUZGTzBGQlEwd3NkMEpCUVZFc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU5xUWl4TlFVRk5MRWxCUVVrc1MwRkJTeXhGUVVGRk8wRkJRMlFzZDBKQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRoUVVOc1FpeE5RVUZOTzBGQlEwZ3NkMEpCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dGhRVU5zUWp0VFFVTktMRU5CUVVNN08wRkJSVVlzV1VGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMHRCUTJZc1EwRkJRenM3UVVGRlJpeFRRVUZMTEVOQlFVTXNVVUZCVVN4SFFVRkhMRlZCUVZVc1VVRkJVU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEYWtRc1dVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzBGQlEyUXNZVUZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhWUVVGVExFbEJRVWtzUlVGQlJUdEJRVU40UWl4blFrRkJTU3hMUVVGTExFVkJRVVVzUjBGQlJ5eERRVUZETEVWQlFVVTdRVUZEWWl4dlFrRkJTU3hEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVOQlFVTXNRMEZCUXp0aFFVTndRaXhOUVVGTk8wRkJRMGdzYjBKQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxGTkJRVk1zUTBGQlF5eERRVUZETzJGQlF5OUNPMU5CUTBvc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdTMEZETVVJc1EwRkJRenM3UVVGRlJpeGhRVUZUTEUxQlFVMHNRMEZCUXl4TlFVRk5MRVZCUVVVc1YwRkJWeXhGUVVGRkxFOUJRVThzUlVGQlJUdEJRVU14UXl4WlFVRkpMRmRCUVZjc1NVRkJTU3hKUVVGSkxFVkJRVVU3UVVGRGNrSXNkVUpCUVZjc1IwRkJSeXhEUVVGRExFTkJRVU03VTBGRGJrSXNUVUZEU1N4SlFVRkhMRmRCUVZjc1MwRkJTeXhEUVVGRExFVkJRVVU3UVVGRGRrSXNhMEpCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zT0VKQlFUaENMRU5CUVVNc1EwRkJRenRUUVVOdVJEdEJRVU5FTEdsQ1FVRlRMRTlCUVU4c1EwRkJReXhEUVVGRExFVkJRVVVzU1VGQlNTeEZRVUZGTEVkQlFVY3NSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRja01zWjBKQlFVa3NVVUZCVVN4SlFVRkpMRWxCUVVrc1NVRkJTU3hQUVVGUExGRkJRVkVzUzBGQlN5eFZRVUZWTEVWQlFVVTdRVUZEY0VRc2MwSkJRVTBzU1VGQlNTeExRVUZMTEVOQlFVTXNhME5CUVd0RExFTkJRVU1zUTBGQlF6dGhRVU4yUkR0QlFVTkVMR0ZCUVVNc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETzBGQlEycENMR2RDUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZPMEZCUTJwQ0xHOUNRVUZKTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRoUVVOcVFqdEJRVU5FTEdkQ1FVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSVHM3UVVGRk9VSXNkVUpCUVU4c1MwRkJTeXhEUVVGRExGbEJRVmtzUTBGQlF5eFpRVUZYTzBGQlEycERMSEZDUVVGRExFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdhVUpCUTJJc1EwRkJReXhEUVVGRE8yRkJRMDQ3UVVGRFJDeHpRa0ZCVlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hWUVVGVExFbEJRVWtzUlVGQlJUdEJRVU0xUWl4dlFrRkJTU3hKUVVGSkxFZEJRVWM3UVVGRFVDeDNRa0ZCU1N4RlFVRkZMRWxCUVVrN1FVRkRWaXcwUWtGQlVTeEZRVUZGTEZGQlFWRXNTVUZCU1N4SlFVRkpPMmxDUVVNM1FpeERRVUZET3p0QlFVVkdMRzlDUVVGSkxFZEJRVWNzUlVGQlJUdEJRVU5NTEhGQ1FVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0cFFrRkRla0lzVFVGQlRUdEJRVU5JTEhGQ1FVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0cFFrRkRkRUk3TzBGQlJVUXNiMEpCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4RFFVRkRMRmRCUVZjc1JVRkJSVHRCUVVOc1F5eHhRa0ZCUXl4RFFVRkRMRk5CUVZNc1JVRkJSU3hEUVVGRE8ybENRVU5xUWp0aFFVTktMRU5CUVVNc1EwRkJRenRCUVVOSUxHbENRVUZMTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zUTBGQlF6dFRRVU5xUXp0QlFVTkVMR2xDUVVGVExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVXNTMEZCU3l4RlFVRkZPMEZCUTNKQ0xHMUNRVUZQTEZsQlFWVTdRVUZEWWl4MVFrRkJUeXhKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU5pTEc5Q1FVRkpMRWxCUVVrc1IwRkJSeXhUUVVGVExFTkJRVU03UVVGRGNrSXNNRUpCUVZVc1EwRkJReXhMUVVGTExFVkJRVVVzVlVGQlZTeEpRVUZKTEVWQlFVVTdRVUZET1VJc2QwSkJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zUTBGQlF6dHBRa0ZEYmtNc1EwRkJReXhEUVVGRE8wRkJRMGdzYjBKQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzVDBGQlR5eExRVUZMTEVOQlFVTXNSVUZCUlR0QlFVTm9ReXh4UWtGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMmxDUVVOaU8wRkJRMFFzYVVKQlFVTXNRMEZCUXl4UFFVRlBMRVZCUVVVc1EwRkJRenRoUVVObUxFTkJRVU03VTBGRFREczdRVUZGUkN4WlFVRkpMRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGFFSXNXVUZCU1N4RFFVRkRMRWRCUVVjN1FVRkRTaXhwUWtGQlN5eEZRVUZGTEVWQlFVVTdRVUZEVkN4MVFrRkJWeXhGUVVGRkxGZEJRVmM3UVVGRGVFSXNiVUpCUVU4c1JVRkJSU3hQUVVGUE8wRkJRMmhDTEhGQ1FVRlRMRVZCUVVVc1NVRkJTVHRCUVVObUxHbENRVUZMTEVWQlFVVXNTVUZCU1R0QlFVTllMR2xDUVVGTExFVkJRVVVzU1VGQlNUdEJRVU5ZTEcxQ1FVRlBMRVZCUVVVc1MwRkJTenRCUVVOa0xHdENRVUZOTEVWQlFVVXNTMEZCU3p0QlFVTmlMR2RDUVVGSkxFVkJRVVVzWTBGQlZTeEpRVUZKTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUXpWQ0xIVkNRVUZQTEVOQlFVTXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTExFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdZVUZEY2tNN1FVRkRSQ3huUWtGQlNTeEZRVUZGTEdkQ1FVRlpPMEZCUTJRc2FVSkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUTJZc2FVSkJRVU1zUTBGQlF5eExRVUZMTEVkQlFVY3NSVUZCUlN4RFFVRkRPMkZCUTJoQ08wRkJRMFFzYlVKQlFVOHNSVUZCUlN4cFFrRkJWU3hKUVVGSkxFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF5OUNMSFZDUVVGUExFTkJRVU1zUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1VVRkJVU3hEUVVGRExFTkJRVU03WVVGRGNFTTdRVUZEUkN4dFFrRkJUeXhGUVVGRkxHMUNRVUZaTzBGQlEycENMRzlDUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNTVUZCU1N4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJSVHRCUVVONFJDd3lRa0ZCVFN4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1JVRkJRenRCUVVNMVF5dzBRa0ZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFOUJRVThzUjBGRGFrSXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkROVUlzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN08wRkJSWFJETERSQ1FVRkpMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEZWQlFWVXNTVUZCU1N4RlFVRkZPMEZCUTI1RExHMURRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNN2VVSkJRM0JDTEVOQlFVTXNRMEZCUXpzN1FVRkZTQ3cwUWtGQlNTeERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFVkJRVVU3UVVGRGRFSXNOa0pCUVVNc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dDVRa0ZEWWp0QlFVTkVMQ3RDUVVGUExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEySXNORUpCUVVrc1JVRkJSU3hIUVVGSExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGNFTXNPRUpCUVUwc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTTdjVUpCUTNCQ08ybENRVU5LTzJGQlEwbzdRVUZEUkN4clFrRkJUU3hGUVVGRkxHdENRVUZaTzBGQlEyaENMSFZDUVVGUExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRPMkZCUTNwQ08wRkJRMFFzYlVKQlFVOHNSVUZCUlN4dFFrRkJXVHRCUVVOcVFpeDFRa0ZCVHl4UFFVRlBMRU5CUVVNN1lVRkRiRUk3UVVGRFJDeG5Ra0ZCU1N4RlFVRkZMR2RDUVVGWE8wRkJRMklzZFVKQlFVOHNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzVDBGQlR5eExRVUZMTEVOQlFVTXNRMEZCUXp0aFFVTjZRenRCUVVORUxHbENRVUZMTEVWQlFVVXNhVUpCUVZrN1FVRkRaaXhwUWtGQlF5eERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNN1lVRkRia0k3UVVGRFJDeHJRa0ZCVFN4RlFVRkZMR3RDUVVGWk8wRkJRMmhDTEc5Q1FVRkpMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVXNzUzBGQlN5eEZRVUZGTzBGQlFVVXNNa0pCUVU4N2FVSkJRVVU3UVVGRGJrTXNhVUpCUVVNc1EwRkJReXhOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETzBGQlEycENMRzlDUVVGSkxGZEJRVmNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVVzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenM3TzBGQlJ6RkVMSEZDUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1YwRkJWeXhGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTzBGQlEyNURMSGxDUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJRenRwUWtGRGFrTTdZVUZEU2p0VFFVTktMRU5CUVVNN1FVRkRSaXhsUVVGUExFTkJRVU1zUTBGQlF6dExRVU5hT3p0QlFVVkVMRk5CUVVzc1EwRkJReXhMUVVGTExFZEJRVWNzVlVGQlZTeE5RVUZOTEVWQlFVVXNWMEZCVnl4RlFVRkZPMEZCUTNwRExGbEJRVWtzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4VlFVRlZMRXRCUVVzc1JVRkJSU3hGUVVGRkxFVkJRVVU3UVVGRGFFTXNhMEpCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RFFVRkRMRU5CUVVNN1UwRkRlRUlzUlVGQlJTeFhRVUZYTEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN08wRkJSVzVDTEdWQlFVOHNRMEZCUXl4RFFVRkRPMHRCUTFvc1EwRkJRenM3UVVGRlJpeFRRVUZMTEVOQlFVTXNZVUZCWVN4SFFVRkhMRlZCUVZVc1RVRkJUU3hGUVVGRkxGZEJRVmNzUlVGQlJUczdRVUZGYWtRc2FVSkJRVk1zWVVGQllTeERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVNN1FVRkRlRUlzYlVKQlFVOHNRMEZCUXl4RFFVRkRMRkZCUVZFc1IwRkJSeXhEUVVGRExFTkJRVU1zVVVGQlVTeERRVUZETzFOQlEyeERPenRCUVVWRUxHbENRVUZUTEdGQlFXRXNRMEZCUXl4UlFVRlJMRVZCUVVVc1NVRkJTU3hGUVVGRkxFOUJRVThzUlVGQlJUdEJRVU0xUXl4blFrRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eERRVUZETzJkQ1FVTlNMRWRCUVVjc1IwRkJSeXhSUVVGUkxFTkJRVU1zVFVGQlRTeEhRVUZITEVOQlFVTXNRMEZCUXp0QlFVTTVRaXh0UWtGQlR5eEhRVUZITEVkQlFVY3NSMEZCUnl4RlFVRkZPMEZCUTJRc2IwSkJRVWtzUjBGQlJ5eEhRVUZITEVkQlFVY3NTVUZCU1N4QlFVRkRMRWRCUVVjc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eExRVUZOTEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVNN1FVRkRlRU1zYjBKQlFVa3NUMEZCVHl4RFFVRkRMRWxCUVVrc1JVRkJSU3hSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVN1FVRkRia01zZFVKQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNN2FVSkJRMklzVFVGQlRUdEJRVU5JTEhWQ1FVRkhMRWRCUVVjc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF6dHBRa0ZEYWtJN1lVRkRTanRCUVVORUxHMUNRVUZQTEVkQlFVY3NRMEZCUXp0VFFVTmtPenRCUVVWRUxHbENRVUZUTEU5QlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZETVVNc1owSkJRVWtzVVVGQlVTeEpRVUZKTEVsQlFVa3NTVUZCU1N4UFFVRlBMRkZCUVZFc1MwRkJTeXhWUVVGVkxFVkJRVVU3UVVGRGNFUXNjMEpCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zYTBOQlFXdERMRU5CUVVNc1EwRkJRenRoUVVOMlJEdEJRVU5FTEdGQlFVTXNRMEZCUXl4UFFVRlBMRWRCUVVjc1NVRkJTU3hEUVVGRE8wRkJRMnBDTEdkQ1FVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzBGQlEycENMRzlDUVVGSkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0aFFVTnFRanRCUVVORUxHZENRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5MRXRCUVVzc1EwRkJReXhGUVVGRk96dEJRVVZzUWl4MVFrRkJUeXhMUVVGTExFTkJRVU1zV1VGQldTeERRVUZETEZsQlFWYzdRVUZEYWtNc2NVSkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0cFFrRkRZaXhEUVVGRExFTkJRVU03WVVGRFRqdEJRVU5FTEhOQ1FVRlZMRU5CUVVNc1NVRkJTU3hGUVVGRkxGVkJRVk1zU1VGQlNTeEZRVUZGTzBGQlF6VkNMRzlDUVVGSkxFbEJRVWtzUjBGQlJ6dEJRVU5RTEhkQ1FVRkpMRVZCUVVVc1NVRkJTVHRCUVVOV0xEUkNRVUZSTEVWQlFVVXNVVUZCVVR0QlFVTnNRaXcwUWtGQlVTeEZRVUZGTEU5QlFVOHNVVUZCVVN4TFFVRkxMRlZCUVZVc1IwRkJSeXhSUVVGUkxFZEJRVWNzU1VGQlNUdHBRa0ZETjBRc1EwRkJRenM3UVVGRlJpeHBRa0ZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxHRkJRV0VzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03TzBGQlJYcEZMRzlDUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4TFFVRkxMRU5CUVVNc1EwRkJReXhYUVVGWExFVkJRVVU3UVVGRGJFTXNjVUpCUVVNc1EwRkJReXhUUVVGVExFVkJRVVVzUTBGQlF6dHBRa0ZEYWtJN1FVRkRSQ3h4UWtGQlN5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03WVVGRGFrTXNRMEZCUXl4RFFVRkRPMU5CUTA0N096dEJRVWRFTEZsQlFVa3NRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTEZkQlFWY3NRMEZCUXl4RFFVRkRPenM3UVVGSGVrTXNVMEZCUXl4RFFVRkRMRWxCUVVrc1IwRkJSeXhWUVVGVkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVXNVVUZCVVN4RlFVRkZPMEZCUTNwRExHMUNRVUZQTEVOQlFVTXNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hSUVVGUkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdVMEZEZUVNc1EwRkJRenM3TzBGQlIwWXNaVUZCVHl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRE96dEJRVVZxUWl4bFFVRlBMRU5CUVVNc1EwRkJRenRMUVVOYUxFTkJRVU03TzBGQlJVWXNVMEZCU3l4RFFVRkRMRXRCUVVzc1IwRkJSeXhWUVVGVkxFMUJRVTBzUlVGQlJTeFBRVUZQTEVWQlFVVTdRVUZEY2tNc1pVRkJUeXhOUVVGTkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNSVUZCUlN4UFFVRlBMRU5CUVVNc1EwRkJRenRMUVVOeVF5eERRVUZET3p0QlFVVkdMR0ZCUVZNc1YwRkJWeXhEUVVGRExFbEJRVWtzUlVGQlJUdEJRVU4yUWl4bFFVRlBMRlZCUVZVc1EwRkJReXhWUVVGVkxFVkJRVVVzUlVGQlJTeEpRVUZKTEVWQlFVVTdRVUZEYkVNc1kwRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVkQlFVY3NSVUZCUlN4SlFVRkpMRVZCUVVVN1FVRkRlRVFzYjBKQlFVa3NUMEZCVHl4UFFVRlBMRXRCUVVzc1VVRkJVU3hGUVVGRk8wRkJRemRDTEhkQ1FVRkpMRWRCUVVjc1JVRkJSVHRCUVVOTUxEUkNRVUZKTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVN1FVRkRaaXh0UTBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenQ1UWtGRGRFSTdjVUpCUTBvc1RVRkRTU3hKUVVGSkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlR0QlFVTndRaXhyUTBGQlZTeERRVUZETEVsQlFVa3NSVUZCUlN4VlFVRlZMRU5CUVVNc1JVRkJSVHRCUVVNeFFpeHRRMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzNsQ1FVTndRaXhEUVVGRExFTkJRVU03Y1VKQlEwNDdhVUpCUTBvN1lVRkRTaXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdVMEZEVkN4RFFVRkRMRU5CUVVNN1MwRkRUanRCUVVORUxGTkJRVXNzUTBGQlF5eEhRVUZITEVkQlFVY3NWMEZCVnl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wRkJReTlDTEZOQlFVc3NRMEZCUXl4SFFVRkhMRWRCUVVjc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZET3pzN096dEJRVXN2UWl4VFFVRkxMRU5CUVVNc1QwRkJUeXhIUVVGSExGVkJRVlVzUlVGQlJTeEZRVUZGTEUxQlFVMHNSVUZCUlR0QlFVTnNReXhaUVVGSkxFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTTdRVUZEWkN4WlFVRkpMRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGFFSXNZMEZCVFN4SFFVRkhMRTFCUVUwc1NVRkJTU3hSUVVGUkxFTkJRVU03UVVGRE5VSXNXVUZCU1N4UlFVRlJMRWRCUVVjc1ZVRkJWU3hEUVVGRExGTkJRVk1zVVVGQlVTeERRVUZETEVsQlFVa3NSVUZCUlR0QlFVTTVReXhuUWtGQlNTeFJRVUZSTEVkQlFVY3NTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRE8wRkJRekZDTEdkQ1FVRkpMRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRCUVVOdVF5eG5Ra0ZCU1N4SFFVRkhMRWxCUVVrc1NVRkJTU3hGUVVGRk8wRkJRMklzY1VKQlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1dVRkJXVHRCUVVOMlFpdzBRa0ZCVVN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNN2FVSkJRMjVETEVOQlFVTXNRMEZCUXp0aFFVTk9MRTFCUTBrc1NVRkJTU3hIUVVGSExFbEJRVWtzVFVGQlRTeEZRVUZGTzBGQlEzQkNMSE5DUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRE8yRkJRemxDTEUxQlEwazdRVUZEUkN4elFrRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNN1FVRkRla0lzYTBKQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hKUVVGSkxFVkJRVVU3UVVGRGJrUXNkMEpCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZEYWtJc2QwSkJRVWtzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenRCUVVOd1Fpd3lRa0ZCVHl4TlFVRk5MRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRGJrSXNlVUpCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRVZCUVVVN1FVRkRkRU1zZVVKQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRPM0ZDUVVNeFFqdHBRa0ZEU2l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03WVVGRFZEdFRRVU5LTEVOQlFVTXNRMEZCUXp0QlFVTklMR2RDUVVGUkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTnlRaXhuUWtGQlVTeERRVUZETEZWQlFWVXNSMEZCUnl4RlFVRkZMRU5CUVVNN1FVRkRla0lzWlVGQlR5eFJRVUZSTEVOQlFVTTdTMEZEYmtJc1EwRkJRenM3UVVGRlJpeFRRVUZMTEVOQlFVTXNVMEZCVXl4SFFVRkhMRlZCUVZVc1JVRkJSU3hGUVVGRk8wRkJRelZDTEdWQlFVOHNXVUZCV1R0QlFVTm1MRzFDUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEZWQlFWVXNTVUZCU1N4RlFVRkZMRU5CUVVFc1EwRkJSU3hMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMU5CUTNaRUxFTkJRVU03UzBGRFRDeERRVUZET3p0QlFVVkdMR0ZCUVZNc1RVRkJUU3hEUVVGRExFMUJRVTBzUlVGQlJUdEJRVU53UWl4bFFVRlBMRlZCUVZVc1MwRkJTeXhGUVVGRkxGRkJRVkVzUlVGQlJTeFJRVUZSTEVWQlFVVTdRVUZEZUVNc2EwSkJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVVc1VVRkJVU3hGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzFOQlF6ZERMRU5CUVVNN1MwRkRURHM3UVVGRlJDeFRRVUZMTEVOQlFVTXNTMEZCU3l4SFFVRkhMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdRVUZEYUVNc1UwRkJTeXhEUVVGRExGZEJRVmNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRE8wRkJRelZETEZOQlFVc3NRMEZCUXl4VlFVRlZMRWRCUVVjc1ZVRkJWU3hMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTEZGQlFWRXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRNMFFzWlVGQlR5eExRVUZMTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUlVGQlJTeExRVUZMTEVWQlFVVXNVVUZCVVN4RlFVRkZMRkZCUVZFc1EwRkJReXhEUVVGRE8wdEJRMjVGTEVOQlFVTTdPMEZCUlVZc1UwRkJTeXhEUVVGRExFZEJRVWNzUjBGQlJ5dzRRa0ZCT0VJN1FVRkRkRU1zV1VGQlNTeEhRVUZITEVkQlFVY3NVMEZCVXl4RFFVRkRPMEZCUTNCQ0xHVkJRVThzVlVGQlZTeERRVUZETEZWQlFWVXNTVUZCU1N4RlFVRkZPMEZCUXpsQ0xHZENRVUZKTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNN08wRkJSV2hDTEdkQ1FVRkpMRkZCUVZFc1IwRkJSeXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOeVF5eG5Ra0ZCU1N4UFFVRlBMRkZCUVZFc1NVRkJTU3hWUVVGVkxFVkJRVVU3UVVGREwwSXNiMEpCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dGhRVU5rTEUxQlFVMDdRVUZEU0N4M1FrRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF6dGhRVU51UWpzN1FVRkZSQ3hwUWtGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRVZCUVVVc1NVRkJTU3hGUVVGRkxGVkJRVlVzVDBGQlR5eEZRVUZGTEVWQlFVVXNSVUZCUlN4RlFVRkZMRVZCUVVVN1FVRkRMME1zYTBKQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hGUVVGRkxFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hIUVVGSExFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlF5OUVMSE5DUVVGRkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMmxDUVVOeVFpeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRWQ3hGUVVORUxGVkJRVlVzUjBGQlJ5eEZRVUZGTEU5QlFVOHNSVUZCUlR0QlFVTndRaXgzUWtGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVNdlF5eERRVUZETEVOQlFVTTdVMEZEVGl4RFFVRkRMRU5CUVVNN1MwRkRUaXhEUVVGRE96dEJRVVZHTEZOQlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVjc09FSkJRVGhDTzBGQlF6RkRMR1ZCUVU4c1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRE8wdEJRM3BGTEVOQlFVTTdPMEZCUjBZc1lVRkJVeXhWUVVGVkxFTkJRVU1zVFVGQlRTeEZRVUZGTzBGQlEzaENMR1ZCUVU4c1ZVRkJWU3hEUVVGRExGVkJRVk1zUjBGQlJ5eEZRVUZGTEVsQlFVa3NSVUZCUlR0QlFVTnNReXhuUWtGQlNTeEZRVUZGTEVkQlFVY3NWVUZCVlN4RFFVRkRMRlZCUVZNc1NVRkJTU3hGUVVGRk8wRkJReTlDTEc5Q1FVRkpMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU03UVVGRGFFSXNiMEpCUVVrc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVTXhRaXgxUWtGQlR5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRlZCUVZVc1JVRkJSU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVTdRVUZEY0VNc2MwSkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN2FVSkJRM0pETEVWQlEwUXNVVUZCVVN4RFFVRkRMRU5CUVVNN1lVRkRZaXhEUVVGRExFTkJRVU03UVVGRFNDeG5Ra0ZCU1N4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRk8wRkJRMklzZFVKQlFVOHNSVUZCUlN4RFFVRkRMRXRCUVVzc1EwRkJReXhKUVVGSkxFVkJRVVVzU1VGQlNTeERRVUZETEVOQlFVTTdZVUZETDBJc1RVRkRTVHRCUVVORUxIVkNRVUZQTEVWQlFVVXNRMEZCUXp0aFFVTmlPMU5CUTBvc1EwRkJReXhEUVVGRE8wdEJRMDQ3TzBGQlJVUXNVMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJSeXhWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMEZCUXpORExGTkJRVXNzUTBGQlF5eGxRVUZsTEVkQlFVY3NWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF6czdRVUZIZGtRc1UwRkJTeXhEUVVGRExFOUJRVThzUjBGQlJ5eFZRVUZWTEVWQlFVVXNSVUZCUlN4UlFVRlJMRVZCUVVVN1FVRkRjRU1zV1VGQlNTeEpRVUZKTEVkQlFVY3NVMEZCVXl4RFFVRkRMRkZCUVZFc1NVRkJTU3hKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVU4yUXl4WlFVRkpMRWxCUVVrc1IwRkJSeXhYUVVGWExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTTdRVUZETTBJc2FVSkJRVk1zU1VGQlNTeERRVUZETEVkQlFVY3NSVUZCUlR0QlFVTm1MR2RDUVVGSkxFZEJRVWNzUlVGQlJUdEJRVU5NTEhWQ1FVRlBMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dGhRVU53UWp0QlFVTkVMR2RDUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVMEZEWkR0QlFVTkVMRmxCUVVrc1JVRkJSU3hEUVVGRE8wdEJRMVlzUTBGQlF6czdRVUZGUml4aFFVRlRMRmRCUVZjc1EwRkJReXhGUVVGRkxFVkJRVVU3UVVGRGNrSXNaVUZCVHl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hKUVVGSkxFVkJRVVU3UVVGRE9VSXNaMEpCUVVrc1VVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0QlFVTXhRaXhuUWtGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4WlFVRlpPMEZCUTJ4Q0xHOUNRVUZKTEZOQlFWTXNSMEZCUnl4VFFVRlRMRU5CUVVNN1FVRkRNVUlzYjBKQlFVa3NTVUZCU1N4RlFVRkZPMEZCUTA0c2VVSkJRVXNzUTBGQlF5eFpRVUZaTEVOQlFVTXNXVUZCV1R0QlFVTXpRaXhuUTBGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFTkJRVU03Y1VKQlEyNURMRU5CUVVNc1EwRkJRenRwUWtGRFRpeE5RVUZOTzBGQlEwZ3NORUpCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zU1VGQlNTeEZRVUZGTEZOQlFWTXNRMEZCUXl4RFFVRkRPMmxDUVVOdVF6dGhRVU5LTEVOQlFVTXNRMEZCUXp0QlFVTklMR2RDUVVGSkxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTTdRVUZEYUVJc1kwRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRU5CUVVNN1FVRkRja0lzWjBKQlFVa3NSMEZCUnl4TFFVRkxMRU5CUVVNN1UwRkRhRUlzUTBGQlF5eERRVUZETzB0QlEwNDdPMEZCUlVRc1UwRkJTeXhEUVVGRExGZEJRVmNzUjBGQlJ5eFhRVUZYTEVOQlFVTTdPMEZCUldoRExGTkJRVXNzUTBGQlF5eFJRVUZSTEVkQlFVY3NWVUZCVlN4RFFVRkRMRlZCUVZNc1RVRkJUU3hGUVVGRk8wRkJRM3BETEZsQlFVa3NTVUZCU1N4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMEZCUTJwRExHVkJRVThzVlVGQlZTeFJRVUZSTEVWQlFVVTdRVUZEZGtJc2JVSkJRVThzVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFTkJRVU03VTBGRGNrTXNRMEZCUXp0TFFVTk1MRU5CUVVNc1EwRkJRenM3UVVGRlNDeFRRVUZMTEVOQlFVTXNVVUZCVVN4SFFVTmtMRXRCUVVzc1EwRkJReXhSUVVGUkxFZEJRVWNzVTBGQlV5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZPMEZCUTNKRExHVkJRVThzVlVGQlZTeERRVUZETEZWQlFWVXNTVUZCU1N4RlFVRkZPMEZCUXpsQ0xHZENRVUZKTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRE1VSXNaMEpCUVVrc1RVRkJUU3hEUVVGRE8wRkJRMWdzWjBKQlFVazdRVUZEUVN4elFrRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRE8yRkJRMjVETEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1FVRkRVaXgxUWtGQlR5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRkRUk3TzBGQlJVUXNaMEpCUVVrc1UwRkJVeXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEU5QlFVOHNUVUZCVFN4RFFVRkRMRWxCUVVrc1MwRkJTeXhWUVVGVkxFVkJRVVU3UVVGRGVFUXNjMEpCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlV5eExRVUZMTEVWQlFVVTdRVUZEZUVJc05FSkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN2FVSkJRM3BDTEVOQlFVTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhWUVVGVExFZEJRVWNzUlVGQlJUdEJRVU4wUWl3MFFrRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eFBRVUZQTEVkQlFVY3NSMEZCUnl4SFFVRkhMRWxCUVVrc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTTdhVUpCUTJoRUxFTkJRVU1zUTBGQlF6dGhRVU5PTEUxQlFVMDdRVUZEU0N4M1FrRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXp0aFFVTXhRanRUUVVOS0xFTkJRVU1zUTBGQlF6dExRVU5PTEVOQlFVTTdPenRCUVVkR0xGRkJRVWtzVDBGQlR5eE5RVUZOTEV0QlFVc3NVVUZCVVN4SlFVRkpMRTFCUVUwc1EwRkJReXhQUVVGUExFVkJRVVU3UVVGRE9VTXNZMEZCVFN4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03UzBGRE1VSTdPMU5CUlVrc1NVRkJTU3hQUVVGUExFMUJRVTBzUzBGQlN5eFZRVUZWTEVsQlFVa3NUVUZCVFN4RFFVRkRMRWRCUVVjc1JVRkJSVHRCUVVOcVJDeHJRa0ZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3haUVVGWk8wRkJRMjVDTEhWQ1FVRlBMRXRCUVVzc1EwRkJRenRoUVVOb1FpeERRVUZETEVOQlFVTTdVMEZEVGpzN1lVRkZTVHRCUVVORUxHOUNRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkhMRXRCUVVzc1EwRkJRenRoUVVOMFFqdERRVVZLTEVOQlFVRXNSVUZCUlN4RFFVRkZJaXdpWm1sc1pTSTZJaTlWYzJWeWN5OWphR1YwYjI0dloybDBhSFZpTDNkbFltRndjR1Z1WjJsdVpTOTNaV0l2ZG1WdVpHOXlMMkZ6ZVc1akwyeHBZaTloYzNsdVl5NXFjeUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cUlWeHVJQ29nWVhONWJtTmNiaUFxSUdoMGRIQnpPaTh2WjJsMGFIVmlMbU52YlM5allXOXNZVzR2WVhONWJtTmNiaUFxWEc0Z0tpQkRiM0I1Y21sbmFIUWdNakF4TUMweU1ERTBJRU5oYjJ4aGJpQk5ZMDFoYUc5dVhHNGdLaUJTWld4bFlYTmxaQ0IxYm1SbGNpQjBhR1VnVFVsVUlHeHBZMlZ1YzJWY2JpQXFMMXh1S0daMWJtTjBhVzl1SUNncElIdGNibHh1SUNBZ0lIWmhjaUJoYzNsdVl5QTlJSHQ5TzF4dUlDQWdJR1oxYm1OMGFXOXVJRzV2YjNBb0tTQjdmVnh1SUNBZ0lHWjFibU4wYVc5dUlHbGtaVzUwYVhSNUtIWXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSFk3WEc0Z0lDQWdmVnh1SUNBZ0lHWjFibU4wYVc5dUlIUnZRbTl2YkNoMktTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQWhJWFk3WEc0Z0lDQWdmVnh1SUNBZ0lHWjFibU4wYVc5dUlHNXZkRWxrS0hZcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlDRjJPMXh1SUNBZ0lIMWNibHh1SUNBZ0lDOHZJR2RzYjJKaGJDQnZiaUIwYUdVZ2MyVnlkbVZ5TENCM2FXNWtiM2NnYVc0Z2RHaGxJR0p5YjNkelpYSmNiaUFnSUNCMllYSWdjSEpsZG1sdmRYTmZZWE41Ym1NN1hHNWNiaUFnSUNBdkx5QkZjM1JoWW14cGMyZ2dkR2hsSUhKdmIzUWdiMkpxWldOMExDQmdkMmx1Wkc5M1lDQW9ZSE5sYkdaZ0tTQnBiaUIwYUdVZ1luSnZkM05sY2l3Z1lHZHNiMkpoYkdCY2JpQWdJQ0F2THlCdmJpQjBhR1VnYzJWeWRtVnlMQ0J2Y2lCZ2RHaHBjMkFnYVc0Z2MyOXRaU0IyYVhKMGRXRnNJRzFoWTJocGJtVnpMaUJYWlNCMWMyVWdZSE5sYkdaZ1hHNGdJQ0FnTHk4Z2FXNXpkR1ZoWkNCdlppQmdkMmx1Wkc5M1lDQm1iM0lnWUZkbFlsZHZjbXRsY21BZ2MzVndjRzl5ZEM1Y2JpQWdJQ0IyWVhJZ2NtOXZkQ0E5SUhSNWNHVnZaaUJ6Wld4bUlEMDlQU0FuYjJKcVpXTjBKeUFtSmlCelpXeG1Mbk5sYkdZZ1BUMDlJSE5sYkdZZ0ppWWdjMlZzWmlCOGZGeHVJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR2RzYjJKaGJDQTlQVDBnSjI5aWFtVmpkQ2NnSmlZZ1oyeHZZbUZzTG1kc2IySmhiQ0E5UFQwZ1oyeHZZbUZzSUNZbUlHZHNiMkpoYkNCOGZGeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN6dGNibHh1SUNBZ0lHbG1JQ2h5YjI5MElDRTlJRzUxYkd3cElIdGNiaUFnSUNBZ0lDQWdjSEpsZG1sdmRYTmZZWE41Ym1NZ1BTQnliMjkwTG1GemVXNWpPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG01dlEyOXVabXhwWTNRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUhKdmIzUXVZWE41Ym1NZ1BTQndjbVYyYVc5MWMxOWhjM2x1WXp0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdGemVXNWpPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQnZibXg1WDI5dVkyVW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHWnVJRDA5UFNCdWRXeHNLU0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0pEWVd4c1ltRmpheUIzWVhNZ1lXeHlaV0ZrZVNCallXeHNaV1F1WENJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWm00dVlYQndiSGtvZEdocGN5d2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZiMjVqWlNobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWm00Z1BUMDlJRzUxYkd3cElISmxkSFZ5Ymp0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p1TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWJpQTlJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OHZMeUJqY205emN5MWljbTkzYzJWeUlHTnZiWEJoZEdsaWJHbDBlU0JtZFc1amRHbHZibk1nTHk4dkwxeHVYRzRnSUNBZ2RtRnlJRjkwYjFOMGNtbHVaeUE5SUU5aWFtVmpkQzV3Y205MGIzUjVjR1V1ZEc5VGRISnBibWM3WEc1Y2JpQWdJQ0IyWVhJZ1gybHpRWEp5WVhrZ1BTQkJjbkpoZVM1cGMwRnljbUY1SUh4OElHWjFibU4wYVc5dUlDaHZZbW9wSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5MGIxTjBjbWx1Wnk1allXeHNLRzlpYWlrZ1BUMDlJQ2RiYjJKcVpXTjBJRUZ5Y21GNVhTYzdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lDOHZJRkJ2Y25SbFpDQm1jbTl0SUhWdVpHVnljMk52Y21VdWFuTWdhWE5QWW1wbFkzUmNiaUFnSUNCMllYSWdYMmx6VDJKcVpXTjBJRDBnWm5WdVkzUnBiMjRvYjJKcUtTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCMGVYQmxJRDBnZEhsd1pXOW1JRzlpYWp0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSNWNHVWdQVDA5SUNkbWRXNWpkR2x2YmljZ2ZId2dkSGx3WlNBOVBUMGdKMjlpYW1WamRDY2dKaVlnSVNGdlltbzdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXBjMEZ5Y21GNVRHbHJaU2hoY25JcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXBjMEZ5Y21GNUtHRnljaWtnZkh3Z0tGeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2FHRnpJR0VnY0c5emFYUnBkbVVnYVc1MFpXZGxjaUJzWlc1bmRHZ2djSEp2Y0dWeWRIbGNiaUFnSUNBZ0lDQWdJQ0FnSUhSNWNHVnZaaUJoY25JdWJHVnVaM1JvSUQwOVBTQmNJbTUxYldKbGNsd2lJQ1ltWEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjbkl1YkdWdVozUm9JRDQ5SURBZ0ppWmNiaUFnSUNBZ0lDQWdJQ0FnSUdGeWNpNXNaVzVuZEdnZ0pTQXhJRDA5UFNBd1hHNGdJQ0FnSUNBZ0lDazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyVmhZMmdvWTI5c2JDd2dhWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjlwYzBGeWNtRjVUR2xyWlNoamIyeHNLU0EvWEc0Z0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LR052Ykd3c0lHbDBaWEpoZEc5eUtTQTZYRzRnSUNBZ0lDQWdJQ0FnSUNCZlptOXlSV0ZqYUU5bUtHTnZiR3dzSUdsMFpYSmhkRzl5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWVhKeVlYbEZZV05vS0dGeWNpd2dhWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQWdJQ0FnSUNCc1pXNW5kR2dnUFNCaGNuSXViR1Z1WjNSb08xeHVYRzRnSUNBZ0lDQWdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2loaGNuSmJhVzVrWlhoZExDQnBibVJsZUN3Z1lYSnlLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjl0WVhBb1lYSnlMQ0JwZEdWeVlYUnZjaWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxibWQwYUNBOUlHRnljaTVzWlc1bmRHZ3NYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFFnUFNCQmNuSmhlU2hzWlc1bmRHZ3BPMXh1WEc0Z0lDQWdJQ0FnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhSYmFXNWtaWGhkSUQwZ2FYUmxjbUYwYjNJb1lYSnlXMmx1WkdWNFhTd2dhVzVrWlhnc0lHRnljaWs3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZjbUZ1WjJVb1kyOTFiblFwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5dFlYQW9RWEp5WVhrb1kyOTFiblFwTENCbWRXNWpkR2x2YmlBb2Rpd2dhU2tnZXlCeVpYUjFjbTRnYVRzZ2ZTazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxaSFZqWlNoaGNuSXNJR2wwWlhKaGRHOXlMQ0J0WlcxdktTQjdYRzRnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWVhKeUxDQm1kVzVqZEdsdmJpQW9lQ3dnYVN3Z1lTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JXVnRieUE5SUdsMFpYSmhkRzl5S0cxbGJXOHNJSGdzSUdrc0lHRXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUcxbGJXODdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyWnZja1ZoWTJoUFppaHZZbXBsWTNRc0lHbDBaWEpoZEc5eUtTQjdYRzRnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWDJ0bGVYTW9iMkpxWldOMEtTd2dablZ1WTNScGIyNGdLR3RsZVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYjJKcVpXTjBXMnRsZVYwc0lHdGxlU2s3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5cGJtUmxlRTltS0dGeWNpd2dhWFJsYlNrZ2UxeHVJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR0Z5Y2k1c1pXNW5kR2c3SUdrckt5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5Y2x0cFhTQTlQVDBnYVhSbGJTa2djbVYwZFhKdUlHazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJQzB4TzF4dUlDQWdJSDFjYmx4dUlDQWdJSFpoY2lCZmEyVjVjeUE5SUU5aWFtVmpkQzVyWlhseklIeDhJR1oxYm1OMGFXOXVJQ2h2WW1vcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUd0bGVYTWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2F5QnBiaUJ2WW1vcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaHZZbW91YUdGelQzZHVVSEp2Y0dWeWRIa29heWtwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCclpYbHpMbkIxYzJnb2F5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHdGxlWE03WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlyWlhsSmRHVnlZWFJ2Y2loamIyeHNLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnBJRDBnTFRFN1hHNGdJQ0FnSUNBZ0lIWmhjaUJzWlc0N1hHNGdJQ0FnSUNBZ0lIWmhjaUJyWlhsek8xeHVJQ0FnSUNBZ0lDQnBaaUFvWDJselFYSnlZWGxNYVd0bEtHTnZiR3dwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlc0Z1BTQmpiMnhzTG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlCdVpYaDBLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdrckt6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2FTQThJR3hsYmlBL0lHa2dPaUJ1ZFd4c08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3RsZVhNZ1BTQmZhMlY1Y3loamIyeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxiaUE5SUd0bGVYTXViR1Z1WjNSb08xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJRzVsZUhRb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhU3NyTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJwSUR3Z2JHVnVJRDhnYTJWNWMxdHBYU0E2SUc1MWJHdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OGdVMmx0YVd4aGNpQjBieUJGVXpZbmN5QnlaWE4wSUhCaGNtRnRJQ2hvZEhSd09pOHZZWEpwZVdFdWIyWnBiR0ZpY3k1amIyMHZNakF4TXk4d015OWxjell0WVc1a0xYSmxjM1F0Y0dGeVlXMWxkR1Z5TG1oMGJXd3BYRzRnSUNBZ0x5OGdWR2hwY3lCaFkyTjFiWFZzWVhSbGN5QjBhR1VnWVhKbmRXMWxiblJ6SUhCaGMzTmxaQ0JwYm5SdklHRnVJR0Z5Y21GNUxDQmhablJsY2lCaElHZHBkbVZ1SUdsdVpHVjRMbHh1SUNBZ0lDOHZJRVp5YjIwZ2RXNWtaWEp6WTI5eVpTNXFjeUFvYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJwaGMyaHJaVzVoY3k5MWJtUmxjbk5qYjNKbEwzQjFiR3d2TWpFME1Da3VYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzSmxjM1JRWVhKaGJTaG1kVzVqTENCemRHRnlkRWx1WkdWNEtTQjdYRzRnSUNBZ0lDQWdJSE4wWVhKMFNXNWtaWGdnUFNCemRHRnlkRWx1WkdWNElEMDlJRzUxYkd3Z1B5Qm1kVzVqTG14bGJtZDBhQ0F0SURFZ09pQXJjM1JoY25SSmJtUmxlRHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUd4bGJtZDBhQ0E5SUUxaGRHZ3ViV0Y0S0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnTFNCemRHRnlkRWx1WkdWNExDQXdLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5WlhOMElEMGdRWEp5WVhrb2JHVnVaM1JvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR2x1WkdWNElEMGdNRHNnYVc1a1pYZ2dQQ0JzWlc1bmRHZzdJR2x1WkdWNEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMFcybHVaR1Y0WFNBOUlHRnlaM1Z0Wlc1MGMxdHBibVJsZUNBcklITjBZWEowU1c1a1pYaGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNkcGRHTm9JQ2h6ZEdGeWRFbHVaR1Y0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnpaU0F3T2lCeVpYUjFjbTRnWm5WdVl5NWpZV3hzS0hSb2FYTXNJSEpsYzNRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhjMlVnTVRvZ2NtVjBkWEp1SUdaMWJtTXVZMkZzYkNoMGFHbHpMQ0JoY21kMWJXVnVkSE5iTUYwc0lISmxjM1FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdRM1Z5Y21WdWRHeDVJSFZ1ZFhObFpDQmlkWFFnYUdGdVpHeGxJR05oYzJWeklHOTFkSE5wWkdVZ2IyWWdkR2hsSUhOM2FYUmphQ0J6ZEdGMFpXMWxiblE2WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUIyWVhJZ1lYSm5jeUE5SUVGeWNtRjVLSE4wWVhKMFNXNWtaWGdnS3lBeEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklHWnZjaUFvYVc1a1pYZ2dQU0F3T3lCcGJtUmxlQ0E4SUhOMFlYSjBTVzVrWlhnN0lHbHVaR1Y0S3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklDQWdJQ0JoY21kelcybHVaR1Y0WFNBOUlHRnlaM1Z0Wlc1MGMxdHBibVJsZUYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCaGNtZHpXM04wWVhKMFNXNWtaWGhkSUQwZ2NtVnpkRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJSEpsZEhWeWJpQm1kVzVqTG1Gd2NHeDVLSFJvYVhNc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5M2FYUm9iM1YwU1c1a1pYZ29hWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2dhVzVrWlhnc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYVhSbGNtRjBiM0lvZG1Gc2RXVXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THk4dklHVjRjRzl5ZEdWa0lHRnplVzVqSUcxdlpIVnNaU0JtZFc1amRHbHZibk1nTHk4dkwxeHVYRzRnSUNBZ0x5OHZMeUJ1WlhoMFZHbGpheUJwYlhCc1pXMWxiblJoZEdsdmJpQjNhWFJvSUdKeWIzZHpaWEl0WTI5dGNHRjBhV0pzWlNCbVlXeHNZbUZqYXlBdkx5OHZYRzVjYmlBZ0lDQXZMeUJqWVhCMGRYSmxJSFJvWlNCbmJHOWlZV3dnY21WbVpYSmxibU5sSUhSdklHZDFZWEprSUdGbllXbHVjM1FnWm1GclpWUnBiV1Z5SUcxdlkydHpYRzRnSUNBZ2RtRnlJRjl6WlhSSmJXMWxaR2xoZEdVZ1BTQjBlWEJsYjJZZ2MyVjBTVzF0WldScFlYUmxJRDA5UFNBblpuVnVZM1JwYjI0bklDWW1JSE5sZEVsdGJXVmthV0YwWlR0Y2JseHVJQ0FnSUhaaGNpQmZaR1ZzWVhrZ1BTQmZjMlYwU1cxdFpXUnBZWFJsSUQ4Z1puVnVZM1JwYjI0b1ptNHBJSHRjYmlBZ0lDQWdJQ0FnTHk4Z2JtOTBJR0VnWkdseVpXTjBJR0ZzYVdGeklHWnZjaUJKUlRFd0lHTnZiWEJoZEdsaWFXeHBkSGxjYmlBZ0lDQWdJQ0FnWDNObGRFbHRiV1ZrYVdGMFpTaG1iaWs3WEc0Z0lDQWdmU0E2SUdaMWJtTjBhVzl1S0dadUtTQjdYRzRnSUNBZ0lDQWdJSE5sZEZScGJXVnZkWFFvWm00c0lEQXBPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JSEJ5YjJObGMzTWdQVDA5SUNkdlltcGxZM1FuSUNZbUlIUjVjR1Z2WmlCd2NtOWpaWE56TG01bGVIUlVhV05ySUQwOVBTQW5ablZ1WTNScGIyNG5LU0I3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbTVsZUhSVWFXTnJJRDBnY0hKdlkyVnpjeTV1WlhoMFZHbGphenRjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQmhjM2x1WXk1dVpYaDBWR2xqYXlBOUlGOWtaV3hoZVR0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdWMyVjBTVzF0WldScFlYUmxJRDBnWDNObGRFbHRiV1ZrYVdGMFpTQS9JRjlrWld4aGVTQTZJR0Z6ZVc1akxtNWxlSFJVYVdOck8xeHVYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSkZZV05vSUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vSUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTVsWVdOb1QyWW9ZWEp5TENCZmQybDBhRzkxZEVsdVpHVjRLR2wwWlhKaGRHOXlLU3dnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0pGWVdOb1UyVnlhV1Z6SUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vVTJWeWFXVnpJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1vWVhKeUxDQmZkMmwwYUc5MWRFbHVaR1Y0S0dsMFpYSmhkRzl5S1N3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNibHh1SUNBZ0lHRnplVzVqTG1admNrVmhZMmhNYVcxcGRDQTlYRzRnSUNBZ1lYTjVibU11WldGamFFeHBiV2wwSUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDJWaFkyaFBaa3hwYldsMEtHeHBiV2wwS1NoaGNuSXNJRjkzYVhSb2IzVjBTVzVrWlhnb2FYUmxjbUYwYjNJcExDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1admNrVmhZMmhQWmlBOVhHNGdJQ0FnWVhONWJtTXVaV0ZqYUU5bUlEMGdablZ1WTNScGIyNGdLRzlpYW1WamRDd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUc5aWFtVmpkQ0E5SUc5aWFtVmpkQ0I4ZkNCYlhUdGNiaUFnSUNBZ0lDQWdkbUZ5SUhOcGVtVWdQU0JmYVhOQmNuSmhlVXhwYTJVb2IySnFaV04wS1NBL0lHOWlhbVZqZEM1c1pXNW5kR2dnT2lCZmEyVjVjeWh2WW1wbFkzUXBMbXhsYm1kMGFEdGNiaUFnSUNBZ0lDQWdkbUZ5SUdOdmJYQnNaWFJsWkNBOUlEQTdYRzRnSUNBZ0lDQWdJR2xtSUNnaGMybDZaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lGOWxZV05vS0c5aWFtVmpkQ3dnWm5WdVkzUnBiMjRnS0haaGJIVmxMQ0JyWlhrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c5aWFtVmpkRnRyWlhsZExDQnJaWGtzSUc5dWJIbGZiMjVqWlNoa2IyNWxLU2s3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmtiMjVsS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqYjIxd2JHVjBaV1FnS3owZ01UdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTI5dGNHeGxkR1ZrSUQ0OUlITnBlbVVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbVp2Y2tWaFkyaFBabE5sY21sbGN5QTlYRzRnSUNBZ1lYTjVibU11WldGamFFOW1VMlZ5YVdWeklEMGdablZ1WTNScGIyNGdLRzlpYWl3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJRzlpYWlBOUlHOWlhaUI4ZkNCYlhUdGNiaUFnSUNBZ0lDQWdkbUZ5SUc1bGVIUkxaWGtnUFNCZmEyVjVTWFJsY21GMGIzSW9iMkpxS1R0Y2JpQWdJQ0FnSUNBZ2RtRnlJR3RsZVNBOUlHNWxlSFJMWlhrb0tUdGNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdhWFJsY21GMFpTZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ6ZVc1aklEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoclpYa2dQVDA5SUc1MWJHd3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaHZZbXBiYTJWNVhTd2dhMlY1TENCdmJteDVYMjl1WTJVb1puVnVZM1JwYjI0Z0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHdGxlU0E5SUc1bGVIUkxaWGtvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0d0bGVTQTlQVDBnYm5Wc2JDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSE41Ym1NcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXVaWGgwVkdsamF5aHBkR1Z5WVhSbEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMFpTZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNsdVl5QTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2wwWlhKaGRHVW9LVHRjYmlBZ0lDQjlPMXh1WEc1Y2JseHVJQ0FnSUdGemVXNWpMbVp2Y2tWaFkyaFBaa3hwYldsMElEMWNiaUFnSUNCaGMzbHVZeTVsWVdOb1QyWk1hVzFwZENBOUlHWjFibU4wYVc5dUlDaHZZbW9zSUd4cGJXbDBMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1gyVmhZMmhQWmt4cGJXbDBLR3hwYldsMEtTaHZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5bFlXTm9UMlpNYVcxcGRDaHNhVzFwZENrZ2UxeHVYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQW9iMkpxTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnZZbW9nUFNCdlltb2dmSHdnVzEwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JtVjRkRXRsZVNBOUlGOXJaWGxKZEdWeVlYUnZjaWh2WW1vcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHeHBiV2wwSUR3OUlEQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWkc5dVpTQTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISjFibTVwYm1jZ1BTQXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR1Z5Y205eVpXUWdQU0JtWVd4elpUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0tHWjFibU4wYVc5dUlISmxjR3hsYm1semFDQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUnZibVVnSmlZZ2NuVnVibWx1WnlBOFBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCM2FHbHNaU0FvY25WdWJtbHVaeUE4SUd4cGJXbDBJQ1ltSUNGbGNuSnZjbVZrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCclpYa2dQU0J1WlhoMFMyVjVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hyWlhrZ1BUMDlJRzUxYkd3cElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUnZibVVnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hKMWJtNXBibWNnUEQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISjFibTVwYm1jZ0t6MGdNVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2IySnFXMnRsZVYwc0lHdGxlU3dnYjI1c2VWOXZibU5sS0daMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEoxYm01cGJtY2dMVDBnTVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnljbTl5WldRZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21Wd2JHVnVhWE5vS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1NncE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1WEc0Z0lDQWdablZ1WTNScGIyNGdaRzlRWVhKaGJHeGxiQ2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHOWlhaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdabTRvWVhONWJtTXVaV0ZqYUU5bUxDQnZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVJQ0FnSUdaMWJtTjBhVzl1SUdSdlVHRnlZV3hzWld4TWFXMXBkQ2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHOWlhaXdnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVLRjlsWVdOb1QyWk1hVzFwZENoc2FXMXBkQ2tzSUc5aWFpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc0Z0lDQWdablZ1WTNScGIyNGdaRzlUWlhKcFpYTW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNodlltb3NJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVLR0Z6ZVc1akxtVmhZMmhQWmxObGNtbGxjeXdnYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjloYzNsdVkwMWhjQ2hsWVdOb1ptNHNJR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJSFpoY2lCeVpYTjFiSFJ6SUQwZ1cxMDdYRzRnSUNBZ0lDQWdJR1ZoWTJobWJpaGhjbklzSUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYVc1a1pYZ3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaDJZV3gxWlN3Z1puVnVZM1JwYjI0Z0tHVnljaXdnZGlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxjM1ZzZEhOYmFXNWtaWGhkSUQwZ2RqdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUgwc0lHWjFibU4wYVc5dUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2NtVnpkV3gwY3lrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG0xaGNDQTlJR1J2VUdGeVlXeHNaV3dvWDJGemVXNWpUV0Z3S1R0Y2JpQWdJQ0JoYzNsdVl5NXRZWEJUWlhKcFpYTWdQU0JrYjFObGNtbGxjeWhmWVhONWJtTk5ZWEFwTzF4dUlDQWdJR0Z6ZVc1akxtMWhjRXhwYldsMElEMGdaRzlRWVhKaGJHeGxiRXhwYldsMEtGOWhjM2x1WTAxaGNDazdYRzVjYmlBZ0lDQXZMeUJ5WldSMVkyVWdiMjVzZVNCb1lYTWdZU0J6WlhKcFpYTWdkbVZ5YzJsdmJpd2dZWE1nWkc5cGJtY2djbVZrZFdObElHbHVJSEJoY21Gc2JHVnNJSGR2YmlkMFhHNGdJQ0FnTHk4Z2QyOXlheUJwYmlCdFlXNTVJSE5wZEhWaGRHbHZibk11WEc0Z0lDQWdZWE41Ym1NdWFXNXFaV04wSUQxY2JpQWdJQ0JoYzNsdVl5NW1iMnhrYkNBOVhHNGdJQ0FnWVhONWJtTXVjbVZrZFdObElEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2JXVnRieXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHRnplVzVqTG1WaFkyaFBabE5sY21sbGN5aGhjbklzSUdaMWJtTjBhVzl1SUNoNExDQnBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9iV1Z0Ynl3Z2VDd2dablZ1WTNScGIyNGdLR1Z5Y2l3Z2Rpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzFsYlc4Z1BTQjJPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dablZ1WTNScGIyNGdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUlIeDhJRzUxYkd3c0lHMWxiVzhwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wm05c1pISWdQVnh1SUNBZ0lHRnplVzVqTG5KbFpIVmpaVkpwWjJoMElEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2JXVnRieXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ5WlhabGNuTmxaQ0E5SUY5dFlYQW9ZWEp5TENCcFpHVnVkR2wwZVNrdWNtVjJaWEp6WlNncE8xeHVJQ0FnSUNBZ0lDQmhjM2x1WXk1eVpXUjFZMlVvY21WMlpYSnpaV1FzSUcxbGJXOHNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjltYVd4MFpYSW9aV0ZqYUdadUxDQmhjbklzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnY21WemRXeDBjeUE5SUZ0ZE8xeHVJQ0FnSUNBZ0lDQmxZV05vWm00b1lYSnlMQ0JtZFc1amRHbHZiaUFvZUN3Z2FXNWtaWGdzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaWg0TENCbWRXNWpkR2x2YmlBb2Rpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoMktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGMzVnNkSE11Y0hWemFDaDdhVzVrWlhnNklHbHVaR1Y0TENCMllXeDFaVG9nZUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5Z3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDBzSUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0Y5dFlYQW9jbVZ6ZFd4MGN5NXpiM0owS0daMWJtTjBhVzl1SUNoaExDQmlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR0V1YVc1a1pYZ2dMU0JpTG1sdVpHVjRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTa3NJR1oxYm1OMGFXOXVJQ2g0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhndWRtRnNkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLU2s3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbk5sYkdWamRDQTlYRzRnSUNBZ1lYTjVibU11Wm1sc2RHVnlJRDBnWkc5UVlYSmhiR3hsYkNoZlptbHNkR1Z5S1R0Y2JseHVJQ0FnSUdGemVXNWpMbk5sYkdWamRFeHBiV2wwSUQxY2JpQWdJQ0JoYzNsdVl5NW1hV3gwWlhKTWFXMXBkQ0E5SUdSdlVHRnlZV3hzWld4TWFXMXBkQ2hmWm1sc2RHVnlLVHRjYmx4dUlDQWdJR0Z6ZVc1akxuTmxiR1ZqZEZObGNtbGxjeUE5WEc0Z0lDQWdZWE41Ym1NdVptbHNkR1Z5VTJWeWFXVnpJRDBnWkc5VFpYSnBaWE1vWDJacGJIUmxjaWs3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmY21WcVpXTjBLR1ZoWTJobWJpd2dZWEp5TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdYMlpwYkhSbGNpaGxZV05vWm00c0lHRnljaXdnWm5WdVkzUnBiMjRvZG1Gc2RXVXNJR05pS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaWgyWVd4MVpTd2dablZ1WTNScGIyNG9kaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaUtDRjJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlZ4dUlDQWdJR0Z6ZVc1akxuSmxhbVZqZENBOUlHUnZVR0Z5WVd4c1pXd29YM0psYW1WamRDazdYRzRnSUNBZ1lYTjVibU11Y21WcVpXTjBUR2x0YVhRZ1BTQmtiMUJoY21Gc2JHVnNUR2x0YVhRb1gzSmxhbVZqZENrN1hHNGdJQ0FnWVhONWJtTXVjbVZxWldOMFUyVnlhV1Z6SUQwZ1pHOVRaWEpwWlhNb1gzSmxhbVZqZENrN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZlkzSmxZWFJsVkdWemRHVnlLR1ZoWTJobWJpd2dZMmhsWTJzc0lHZGxkRkpsYzNWc2RDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdablZ1WTNScGIyNG9ZWEp5TENCc2FXMXBkQ3dnYVhSbGNtRjBiM0lzSUdOaUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCa2IyNWxLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGpZaWtnWTJJb1oyVjBVbVZ6ZFd4MEtHWmhiSE5sTENCMmIybGtJREFwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHbDBaWEpoZEdWbEtIZ3NJRjhzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLQ0ZqWWlrZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2VDd2dablZ1WTNScGIyNGdLSFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dOaUlDWW1JR05vWldOcktIWXBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWWloblpYUlNaWE4xYkhRb2RISjFaU3dnZUNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySWdQU0JwZEdWeVlYUnZjaUE5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWVhKbmRXMWxiblJ6TG14bGJtZDBhQ0ErSURNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxZV05vWm00b1lYSnlMQ0JzYVcxcGRDd2dhWFJsY21GMFpXVXNJR1J2Ym1VcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWWlBOUlHbDBaWEpoZEc5eU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUlEMGdiR2x0YVhRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pXRmphR1p1S0dGeWNpd2dhWFJsY21GMFpXVXNJR1J2Ym1VcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbUZ1ZVNBOVhHNGdJQ0FnWVhONWJtTXVjMjl0WlNBOUlGOWpjbVZoZEdWVVpYTjBaWElvWVhONWJtTXVaV0ZqYUU5bUxDQjBiMEp2YjJ3c0lHbGtaVzUwYVhSNUtUdGNibHh1SUNBZ0lHRnplVzVqTG5OdmJXVk1hVzFwZENBOUlGOWpjbVZoZEdWVVpYTjBaWElvWVhONWJtTXVaV0ZqYUU5bVRHbHRhWFFzSUhSdlFtOXZiQ3dnYVdSbGJuUnBkSGtwTzF4dVhHNGdJQ0FnWVhONWJtTXVZV3hzSUQxY2JpQWdJQ0JoYzNsdVl5NWxkbVZ5ZVNBOUlGOWpjbVZoZEdWVVpYTjBaWElvWVhONWJtTXVaV0ZqYUU5bUxDQnViM1JKWkN3Z2JtOTBTV1FwTzF4dVhHNGdJQ0FnWVhONWJtTXVaWFpsY25sTWFXMXBkQ0E5SUY5amNtVmhkR1ZVWlhOMFpYSW9ZWE41Ym1NdVpXRmphRTltVEdsdGFYUXNJRzV2ZEVsa0xDQnViM1JKWkNrN1hHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZlptbHVaRWRsZEZKbGMzVnNkQ2gyTENCNEtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQjRPMXh1SUNBZ0lIMWNiaUFnSUNCaGMzbHVZeTVrWlhSbFkzUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaaXdnYVdSbGJuUnBkSGtzSUY5bWFXNWtSMlYwVW1WemRXeDBLVHRjYmlBZ0lDQmhjM2x1WXk1a1pYUmxZM1JUWlhKcFpYTWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBabE5sY21sbGN5d2dhV1JsYm5ScGRIa3NJRjltYVc1a1IyVjBVbVZ6ZFd4MEtUdGNiaUFnSUNCaGMzbHVZeTVrWlhSbFkzUk1hVzFwZENBOUlGOWpjbVZoZEdWVVpYTjBaWElvWVhONWJtTXVaV0ZqYUU5bVRHbHRhWFFzSUdsa1pXNTBhWFI1TENCZlptbHVaRWRsZEZKbGMzVnNkQ2s3WEc1Y2JpQWdJQ0JoYzNsdVl5NXpiM0owUW5rZ1BTQm1kVzVqZEdsdmJpQW9ZWEp5TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdZWE41Ym1NdWJXRndLR0Z5Y2l3Z1puVnVZM1JwYjI0Z0tIZ3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaDRMQ0JtZFc1amRHbHZiaUFvWlhKeUxDQmpjbWwwWlhKcFlTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3NJSHQyWVd4MVpUb2dlQ3dnWTNKcGRHVnlhV0U2SUdOeWFYUmxjbWxoZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lIMHNJR1oxYm1OMGFXOXVJQ2hsY25Jc0lISmxjM1ZzZEhNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dzSUY5dFlYQW9jbVZ6ZFd4MGN5NXpiM0owS0dOdmJYQmhjbUYwYjNJcExDQm1kVzVqZEdsdmJpQW9lQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2VDNTJZV3gxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdmU2s3WEc1Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1kyOXRjR0Z5WVhSdmNpaHNaV1owTENCeWFXZG9kQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdFZ1BTQnNaV1owTG1OeWFYUmxjbWxoTENCaUlEMGdjbWxuYUhRdVkzSnBkR1Z5YVdFN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZU0E4SUdJZ1B5QXRNU0E2SUdFZ1BpQmlJRDhnTVNBNklEQTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVlYVjBieUE5SUdaMWJtTjBhVzl1SUNoMFlYTnJjeXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQmZiMjVqWlNoallXeHNZbUZqYXlCOGZDQnViMjl3S1R0Y2JpQWdJQ0FnSUNBZ2RtRnlJR3RsZVhNZ1BTQmZhMlY1Y3loMFlYTnJjeWs3WEc0Z0lDQWdJQ0FnSUhaaGNpQnlaVzFoYVc1cGJtZFVZWE5yY3lBOUlHdGxlWE11YkdWdVozUm9PMXh1SUNBZ0lDQWdJQ0JwWmlBb0lYSmxiV0ZwYm1sdVoxUmhjMnR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0IyWVhJZ2NtVnpkV3gwY3lBOUlIdDlPMXh1WEc0Z0lDQWdJQ0FnSUhaaGNpQnNhWE4wWlc1bGNuTWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1lXUmtUR2x6ZEdWdVpYSW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hwYzNSbGJtVnljeTUxYm5Ob2FXWjBLR1p1S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnlaVzF2ZG1WTWFYTjBaVzVsY2lobWJpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR2xrZUNBOUlGOXBibVJsZUU5bUtHeHBjM1JsYm1WeWN5d2dabTRwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dsa2VDQStQU0F3S1NCc2FYTjBaVzVsY25NdWMzQnNhV05sS0dsa2VDd2dNU2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z2RHRnphME52YlhCc1pYUmxLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVZ0WVdsdWFXNW5WR0Z6YTNNdExUdGNiaUFnSUNBZ0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb2JHbHpkR1Z1WlhKekxuTnNhV05sS0RBcExDQm1kVzVqZEdsdmJpQW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbWJpZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCaFpHUk1hWE4wWlc1bGNpaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVhKbGJXRnBibWx1WjFSaGMydHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDd2djbVZ6ZFd4MGN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMHBPMXh1WEc0Z0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb2EyVjVjeXdnWm5WdVkzUnBiMjRnS0dzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQjBZWE5ySUQwZ1gybHpRWEp5WVhrb2RHRnphM05iYTEwcElEOGdkR0Z6YTNOYmExMDZJRnQwWVhOcmMxdHJYVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnZEdGemEwTmhiR3hpWVdOcklEMGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaWhsY25Jc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZWEpuY3k1c1pXNW5kR2dnUEQwZ01Ta2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGNtZHpJRDBnWVhKbmMxc3dYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnYzJGbVpWSmxjM1ZzZEhNZ1BTQjdmVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1gyWnZja1ZoWTJoUFppaHlaWE4xYkhSekxDQm1kVzVqZEdsdmJpaDJZV3dzSUhKclpYa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5oWm1WU1pYTjFiSFJ6VzNKclpYbGRJRDBnZG1Gc08xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjMkZtWlZKbGMzVnNkSE5iYTEwZ1BTQmhjbWR6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklzSUhOaFptVlNaWE4xYkhSektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsYzNWc2RITmJhMTBnUFNCaGNtZHpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb2RHRnphME52YlhCc1pYUmxLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ5WlhGMWFYSmxjeUE5SUhSaGMyc3VjMnhwWTJVb01Dd2dkR0Z6YXk1c1pXNW5kR2dnTFNBeEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklIQnlaWFpsYm5RZ1pHVmhaQzFzYjJOcmMxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHeGxiaUE5SUhKbGNYVnBjbVZ6TG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJrWlhBN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IzYUdsc1pTQW9iR1Z1TFMwcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVNoa1pYQWdQU0IwWVhOcmMxdHlaWEYxYVhKbGMxdHNaVzVkWFNrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RJWVhNZ2FXNWxlR2x6ZEdGdWRDQmtaWEJsYm1SbGJtTjVKeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGZhWE5CY25KaGVTaGtaWEFwSUNZbUlGOXBibVJsZUU5bUtHUmxjQ3dnYXlrZ1BqMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owaGhjeUJqZVdOc2FXTWdaR1Z3Wlc1a1pXNWphV1Z6SnlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdjbVZoWkhrb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlGOXlaV1IxWTJVb2NtVnhkV2x5WlhNc0lHWjFibU4wYVc5dUlDaGhMQ0I0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQW9ZU0FtSmlCeVpYTjFiSFJ6TG1oaGMwOTNibEJ5YjNCbGNuUjVLSGdwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUxDQjBjblZsS1NBbUppQWhjbVZ6ZFd4MGN5NW9ZWE5QZDI1UWNtOXdaWEowZVNocktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoeVpXRmtlU2dwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHRnphMXQwWVhOckxteGxibWQwYUNBdElERmRLSFJoYzJ0RFlXeHNZbUZqYXl3Z2NtVnpkV3gwY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaFpHUk1hWE4wWlc1bGNpaHNhWE4wWlc1bGNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJzYVhOMFpXNWxjaWdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jbVZoWkhrb0tTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpXMXZkbVZNYVhOMFpXNWxjaWhzYVhOMFpXNWxjaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnRiZEdGemF5NXNaVzVuZEdnZ0xTQXhYU2gwWVhOclEyRnNiR0poWTJzc0lISmxjM1ZzZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZUdGNibHh1WEc1Y2JpQWdJQ0JoYzNsdVl5NXlaWFJ5ZVNBOUlHWjFibU4wYVc5dUtIUnBiV1Z6TENCMFlYTnJMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdSRVZHUVZWTVZGOVVTVTFGVXlBOUlEVTdYRzRnSUNBZ0lDQWdJSFpoY2lCRVJVWkJWVXhVWDBsT1ZFVlNWa0ZNSUQwZ01EdGNibHh1SUNBZ0lDQWdJQ0IyWVhJZ1lYUjBaVzF3ZEhNZ1BTQmJYVHRjYmx4dUlDQWdJQ0FnSUNCMllYSWdiM0IwY3lBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhScGJXVnpPaUJFUlVaQlZVeFVYMVJKVFVWVExGeHVJQ0FnSUNBZ0lDQWdJQ0FnYVc1MFpYSjJZV3c2SUVSRlJrRlZURlJmU1U1VVJWSldRVXhjYmlBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQndZWEp6WlZScGJXVnpLR0ZqWXl3Z2RDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppaDBlWEJsYjJZZ2RDQTlQVDBnSjI1MWJXSmxjaWNwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGall5NTBhVzFsY3lBOUlIQmhjbk5sU1c1MEtIUXNJREV3S1NCOGZDQkVSVVpCVlV4VVgxUkpUVVZUTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1LSFI1Y0dWdlppQjBJRDA5UFNBbmIySnFaV04wSnlsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lXTmpMblJwYldWeklEMGdjR0Z5YzJWSmJuUW9kQzUwYVcxbGN5d2dNVEFwSUh4OElFUkZSa0ZWVEZSZlZFbE5SVk03WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVdOakxtbHVkR1Z5ZG1Gc0lEMGdjR0Z5YzJWSmJuUW9kQzVwYm5SbGNuWmhiQ3dnTVRBcElIeDhJRVJGUmtGVlRGUmZTVTVVUlZKV1FVdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1emRYQndiM0owWldRZ1lYSm5kVzFsYm5RZ2RIbHdaU0JtYjNJZ1hGd25kR2x0WlhOY1hDYzZJQ2NnS3lCMGVYQmxiMllnZENrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQjJZWElnYkdWdVozUm9JRDBnWVhKbmRXMWxiblJ6TG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnYVdZZ0tHeGxibWQwYUNBOElERWdmSHdnYkdWdVozUm9JRDRnTXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RKYm5aaGJHbGtJR0Z5WjNWdFpXNTBjeUF0SUcxMWMzUWdZbVVnWldsMGFHVnlJQ2gwWVhOcktTd2dLSFJoYzJzc0lHTmhiR3hpWVdOcktTd2dLSFJwYldWekxDQjBZWE5yS1NCdmNpQW9kR2x0WlhNc0lIUmhjMnNzSUdOaGJHeGlZV05yS1NjcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLR3hsYm1kMGFDQThQU0F5SUNZbUlIUjVjR1Z2WmlCMGFXMWxjeUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQjBZWE5yTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR0Z6YXlBOUlIUnBiV1Z6TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdkR2x0WlhNZ0lUMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJoY25ObFZHbHRaWE1vYjNCMGN5d2dkR2x0WlhNcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJRzl3ZEhNdVkyRnNiR0poWTJzZ1BTQmpZV3hzWW1GamF6dGNiaUFnSUNBZ0lDQWdiM0IwY3k1MFlYTnJJRDBnZEdGemF6dGNibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUIzY21Gd2NHVmtWR0Z6YXloM2NtRndjR1ZrUTJGc2JHSmhZMnNzSUhkeVlYQndaV1JTWlhOMWJIUnpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnlaWFJ5ZVVGMGRHVnRjSFFvZEdGemF5d2dabWx1WVd4QmRIUmxiWEIwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0hObGNtbGxjME5oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnNvWm5WdVkzUnBiMjRvWlhKeUxDQnlaWE4xYkhRcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MyVnlhV1Z6UTJGc2JHSmhZMnNvSVdWeWNpQjhmQ0JtYVc1aGJFRjBkR1Z0Y0hRc0lIdGxjbkk2SUdWeWNpd2djbVZ6ZFd4ME9pQnlaWE4xYkhSOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2QzSmhjSEJsWkZKbGMzVnNkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJSEpsZEhKNVNXNTBaWEoyWVd3b2FXNTBaWEoyWVd3cGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmloelpYSnBaWE5EWVd4c1ltRmpheWw3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9ablZ1WTNScGIyNG9LWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sY21sbGMwTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlMQ0JwYm5SbGNuWmhiQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tHOXdkSE11ZEdsdFpYTXBJSHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQm1hVzVoYkVGMGRHVnRjSFFnUFNBaEtHOXdkSE11ZEdsdFpYTXRQVEVwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGMGRHVnRjSFJ6TG5CMWMyZ29jbVYwY25sQmRIUmxiWEIwS0c5d2RITXVkR0Z6YXl3Z1ptbHVZV3hCZEhSbGJYQjBLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZb0lXWnBibUZzUVhSMFpXMXdkQ0FtSmlCdmNIUnpMbWx1ZEdWeWRtRnNJRDRnTUNsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0YwZEdWdGNIUnpMbkIxYzJnb2NtVjBjbmxKYm5SbGNuWmhiQ2h2Y0hSekxtbHVkR1Z5ZG1Gc0tTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhKcFpYTW9ZWFIwWlcxd2RITXNJR1oxYm1OMGFXOXVLR1J2Ym1Vc0lHUmhkR0VwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSaGRHRWdQU0JrWVhSaFcyUmhkR0V1YkdWdVozUm9JQzBnTVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0tIZHlZWEJ3WldSRFlXeHNZbUZqYXlCOGZDQnZjSFJ6TG1OaGJHeGlZV05yS1Noa1lYUmhMbVZ5Y2l3Z1pHRjBZUzV5WlhOMWJIUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBdkx5QkpaaUJoSUdOaGJHeGlZV05ySUdseklIQmhjM05sWkN3Z2NuVnVJSFJvYVhNZ1lYTWdZU0JqYjI1MGNtOXNiQ0JtYkc5M1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCdmNIUnpMbU5oYkd4aVlXTnJJRDhnZDNKaGNIQmxaRlJoYzJzb0tTQTZJSGR5WVhCd1pXUlVZWE5yTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NTNZWFJsY21aaGJHd2dQU0JtZFc1amRHbHZiaUFvZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hYMmx6UVhKeVlYa29kR0Z6YTNNcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdaWEp5SUQwZ2JtVjNJRVZ5Y205eUtDZEdhWEp6ZENCaGNtZDFiV1Z1ZENCMGJ5QjNZWFJsY21aaGJHd2diWFZ6ZENCaVpTQmhiaUJoY25KaGVTQnZaaUJtZFc1amRHbHZibk1uS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdGemEzTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQjNjbUZ3U1hSbGNtRjBiM0lvYVhSbGNtRjBiM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmZjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVJQ2hsY25Jc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJMbUZ3Y0d4NUtHNTFiR3dzSUZ0bGNuSmRMbU52Ym1OaGRDaGhjbWR6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnYm1WNGRDQTlJR2wwWlhKaGRHOXlMbTVsZUhRb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHNWxlSFFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGeVozTXVjSFZ6YUNoM2NtRndTWFJsY21GMGIzSW9ibVY0ZENrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5NXdkWE5vS0dOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJuTjFjbVZCYzNsdVl5aHBkR1Z5WVhSdmNpa3VZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZDNKaGNFbDBaWEpoZEc5eUtHRnplVzVqTG1sMFpYSmhkRzl5S0hSaGMydHpLU2tvS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNCaGNtRnNiR1ZzS0dWaFkyaG1iaXdnZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1kyRnNiR0poWTJzZ2ZId2dibTl2Y0R0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0JmYVhOQmNuSmhlVXhwYTJVb2RHRnphM01wSUQ4Z1cxMGdPaUI3ZlR0Y2JseHVJQ0FnSUNBZ0lDQmxZV05vWm00b2RHRnphM01zSUdaMWJtTjBhVzl1SUNoMFlYTnJMQ0JyWlhrc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJLRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dWeWNpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hoY21kekxteGxibWQwYUNBOFBTQXhLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnlaM01nUFNCaGNtZHpXekJkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFJ6VzJ0bGVWMGdQU0JoY21kek8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLU2s3WEc0Z0lDQWdJQ0FnSUgwc0lHWjFibU4wYVc5dUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2NtVnpkV3gwY3lrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG5CaGNtRnNiR1ZzSUQwZ1puVnVZM1JwYjI0Z0tIUmhjMnR6TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmZjR0Z5WVd4c1pXd29ZWE41Ym1NdVpXRmphRTltTENCMFlYTnJjeXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NXdZWEpoYkd4bGJFeHBiV2wwSUQwZ1puVnVZM1JwYjI0b2RHRnphM01zSUd4cGJXbDBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCZmNHRnlZV3hzWld3b1gyVmhZMmhQWmt4cGJXbDBLR3hwYldsMEtTd2dkR0Z6YTNNc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11YzJWeWFXVnpJRDBnWm5WdVkzUnBiMjRvZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUY5d1lYSmhiR3hsYkNoaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNc0lIUmhjMnR6TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbWwwWlhKaGRHOXlJRDBnWm5WdVkzUnBiMjRnS0hSaGMydHpLU0I3WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUcxaGEyVkRZV3hzWW1GamF5aHBibVJsZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWm00b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hSaGMydHpMbXhsYm1kMGFDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJjMXRwYm1SbGVGMHVZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadUxtNWxlSFFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVMbTVsZUhRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2hwYm1SbGVDQThJSFJoYzJ0ekxteGxibWQwYUNBdElERXBJRDhnYldGclpVTmhiR3hpWVdOcktHbHVaR1Y0SUNzZ01TazZJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ0WVd0bFEyRnNiR0poWTJzb01DazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1Gd2NHeDVJRDBnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1ptNHNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR05oYkd4QmNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1ptNHVZWEJ3Ykhrb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JuVnNiQ3dnWVhKbmN5NWpiMjVqWVhRb1kyRnNiRUZ5WjNNcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOUtUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWpiMjVqWVhRb1pXRmphR1p1TENCaGNuSXNJR1p1TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnY21WemRXeDBJRDBnVzEwN1hHNGdJQ0FnSUNBZ0lHVmhZMmhtYmloaGNuSXNJR1oxYm1OMGFXOXVJQ2g0TENCcGJtUmxlQ3dnWTJJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadUtIZ3NJR1oxYm1OMGFXOXVJQ2hsY25Jc0lIa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUWdQU0J5WlhOMWJIUXVZMjl1WTJGMEtIa2dmSHdnVzEwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmlLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dablZ1WTNScGIyNGdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUxDQnlaWE4xYkhRcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzRnSUNBZ1lYTjVibU11WTI5dVkyRjBJRDBnWkc5UVlYSmhiR3hsYkNoZlkyOXVZMkYwS1R0Y2JpQWdJQ0JoYzNsdVl5NWpiMjVqWVhSVFpYSnBaWE1nUFNCa2IxTmxjbWxsY3loZlkyOXVZMkYwS1R0Y2JseHVJQ0FnSUdGemVXNWpMbmRvYVd4emRDQTlJR1oxYm1OMGFXOXVJQ2gwWlhOMExDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCallXeHNZbUZqYXlCOGZDQnViMjl3TzF4dUlDQWdJQ0FnSUNCcFppQW9kR1Z6ZENncEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdibVY0ZENBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9aWEp5TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RHVnpkQzVoY0hCc2VTaDBhR2x6TENCaGNtZHpLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaHVaWGgwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzVsZUhRcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVpHOVhhR2xzYzNRZ1BTQm1kVzVqZEdsdmJpQW9hWFJsY21GMGIzSXNJSFJsYzNRc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCallXeHNjeUE5SURBN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTUzYUdsc2MzUW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0t5dGpZV3hzY3lBOFBTQXhJSHg4SUhSbGMzUXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWRXNTBhV3dnUFNCbWRXNWpkR2x2YmlBb2RHVnpkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTUzYUdsc2MzUW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0lYUmxjM1F1WVhCd2JIa29kR2hwY3l3Z1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdmU3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVaRzlWYm5ScGJDQTlJR1oxYm1OMGFXOXVJQ2hwZEdWeVlYUnZjaXdnZEdWemRDd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR0Z6ZVc1akxtUnZWMmhwYkhOMEtHbDBaWEpoZEc5eUxDQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlBaGRHVnpkQzVoY0hCc2VTaDBhR2x6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtUjFjbWx1WnlBOUlHWjFibU4wYVc5dUlDaDBaWE4wTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0JqWVd4c1ltRmpheUI4ZkNCdWIyOXdPMXh1WEc0Z0lDQWdJQ0FnSUhaaGNpQnVaWGgwSUQwZ1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpaGxjbklzSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjbWR6TG5CMWMyZ29ZMmhsWTJzcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmxjM1F1WVhCd2JIa29kR2hwY3l3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBwTzF4dVhHNGdJQ0FnSUNBZ0lIWmhjaUJqYUdWamF5QTlJR1oxYm1OMGFXOXVLR1Z5Y2l3Z2RISjFkR2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNoMGNuVjBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c1bGVIUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNCMFpYTjBLR05vWldOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wkc5RWRYSnBibWNnUFNCbWRXNWpkR2x2YmlBb2FYUmxjbUYwYjNJc0lIUmxjM1FzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJqWVd4c2N5QTlJREE3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbVIxY21sdVp5aG1kVzVqZEdsdmJpaHVaWGgwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyRnNiSE1yS3lBOElERXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J1WlhoMEtHNTFiR3dzSUhSeWRXVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFpYTjBMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozVnRaVzUwY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXhkV1YxWlNoM2IzSnJaWElzSUdOdmJtTjFjbkpsYm1ONUxDQndZWGxzYjJGa0tTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoamIyNWpkWEp5Wlc1amVTQTlQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNWpkWEp5Wlc1amVTQTlJREU3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ1pXeHpaU0JwWmloamIyNWpkWEp5Wlc1amVTQTlQVDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2REYjI1amRYSnlaVzVqZVNCdGRYTjBJRzV2ZENCaVpTQjZaWEp2SnlrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdYMmx1YzJWeWRDaHhMQ0JrWVhSaExDQndiM01zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyRnNiR0poWTJzZ0lUMGdiblZzYkNBbUppQjBlWEJsYjJZZ1kyRnNiR0poWTJzZ0lUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2loY0luUmhjMnNnWTJGc2JHSmhZMnNnYlhWemRDQmlaU0JoSUdaMWJtTjBhVzl1WENJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdjUzV6ZEdGeWRHVmtJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hYMmx6UVhKeVlYa29aR0YwWVNrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoSUQwZ1cyUmhkR0ZkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWW9aR0YwWVM1c1pXNW5kR2dnUFQwOUlEQWdKaVlnY1M1cFpHeGxLQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdkx5QmpZV3hzSUdSeVlXbHVJR2x0YldWa2FXRjBaV3g1SUdsbUlIUm9aWEpsSUdGeVpTQnVieUIwWVhOcmMxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdVpISmhhVzRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWkdGMFlTd2dablZ1WTNScGIyNG9kR0Z6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJwZEdWdElEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhPaUIwWVhOckxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmphem9nWTJGc2JHSmhZMnNnZkh3Z2JtOXZjRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDA3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jRzl6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1ZEdGemEzTXVkVzV6YUdsbWRDaHBkR1Z0S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMblJoYzJ0ekxuQjFjMmdvYVhSbGJTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUQwOVBTQnhMbU52Ym1OMWNuSmxibU41S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1YzJGMGRYSmhkR1ZrS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmZibVY0ZENoeExDQjBZWE5yY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnljeUF0UFNBeE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJoY21keklEMGdZWEpuZFcxbGJuUnpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvZEdGemEzTXNJR1oxYm1OMGFXOXVJQ2gwWVhOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSaGMyc3VZMkZzYkdKaFkyc3VZWEJ3Ykhrb2RHRnpheXdnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUNzZ2QyOXlhMlZ5Y3lBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbVJ5WVdsdUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1Y0hKdlkyVnpjeWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lIWmhjaUIzYjNKclpYSnpJRDBnTUR0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEVnUFNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwWVhOcmN6b2dXMTBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjVqZFhKeVpXNWplVG9nWTI5dVkzVnljbVZ1WTNrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3WVhsc2IyRmtPaUJ3WVhsc2IyRmtMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2MyRjBkWEpoZEdWa09pQnViMjl3TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdaVzF3ZEhrNklHNXZiM0FzWEc0Z0lDQWdJQ0FnSUNBZ0lDQmtjbUZwYmpvZ2JtOXZjQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lITjBZWEowWldRNklHWmhiSE5sTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdjR0YxYzJWa09pQm1ZV3h6WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJSEIxYzJnNklHWjFibU4wYVc5dUlDaGtZWFJoTENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lGOXBibk5sY25Rb2NTd2daR0YwWVN3Z1ptRnNjMlVzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnJhV3hzT2lCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjUzVrY21GcGJpQTlJRzV2YjNBN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NTNTBZWE5yY3lBOUlGdGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhWdWMyaHBablE2SUdaMWJtTjBhVzl1SUNoa1lYUmhMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUY5cGJuTmxjblFvY1N3Z1pHRjBZU3dnZEhKMVpTd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhCeWIyTmxjM002SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvSVhFdWNHRjFjMlZrSUNZbUlIZHZjbXRsY25NZ1BDQnhMbU52Ym1OMWNuSmxibU41SUNZbUlIRXVkR0Z6YTNNdWJHVnVaM1JvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGRvYVd4bEtIZHZjbXRsY25NZ1BDQnhMbU52Ym1OMWNuSmxibU41SUNZbUlIRXVkR0Z6YTNNdWJHVnVaM1JvS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQjBZWE5yY3lBOUlIRXVjR0Y1Ykc5aFpDQS9YRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1M1MFlYTnJjeTV6Y0d4cFkyVW9NQ3dnY1M1d1lYbHNiMkZrS1NBNlhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjUzUwWVhOcmN5NXpjR3hwWTJVb01Dd2djUzUwWVhOcmN5NXNaVzVuZEdncE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWkdGMFlTQTlJRjl0WVhBb2RHRnphM01zSUdaMWJtTjBhVzl1SUNoMFlYTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSaGMyc3VaR0YwWVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvY1M1MFlYTnJjeTVzWlc1bmRHZ2dQVDA5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG1WdGNIUjVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IzYjNKclpYSnpJQ3M5SURFN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZMklnUFNCdmJteDVYMjl1WTJVb1gyNWxlSFFvY1N3Z2RHRnphM01wS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkdmNtdGxjaWhrWVhSaExDQmpZaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnYkdWdVozUm9PaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhFdWRHRnphM011YkdWdVozUm9PMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhKMWJtNXBibWM2SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2QyOXlhMlZ5Y3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaR3hsT2lCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2NTNTBZWE5yY3k1c1pXNW5kR2dnS3lCM2IzSnJaWEp6SUQwOVBTQXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUhCaGRYTmxPaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NTNXdZWFZ6WldRZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxjM1Z0WlRvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoeExuQmhkWE5sWkNBOVBUMGdabUZzYzJVcElIc2djbVYwZFhKdU95QjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjUzV3WVhWelpXUWdQU0JtWVd4elpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnY21WemRXMWxRMjkxYm5RZ1BTQk5ZWFJvTG0xcGJpaHhMbU52Ym1OMWNuSmxibU41TENCeExuUmhjMnR6TG14bGJtZDBhQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1RtVmxaQ0IwYnlCallXeHNJSEV1Y0hKdlkyVnpjeUJ2Ym1ObElIQmxjaUJqYjI1amRYSnlaVzUwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2QyOXlhMlZ5SUhSdklIQnlaWE5sY25abElHWjFiR3dnWTI5dVkzVnljbVZ1WTNrZ1lXWjBaWElnY0dGMWMyVmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQjNJRDBnTVRzZ2R5QThQU0J5WlhOMWJXVkRiM1Z1ZERzZ2R5c3JLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG5ObGRFbHRiV1ZrYVdGMFpTaHhMbkJ5YjJObGMzTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSEU3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZWE41Ym1NdWNYVmxkV1VnUFNCbWRXNWpkR2x2YmlBb2QyOXlhMlZ5TENCamIyNWpkWEp5Wlc1amVTa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NTQTlJRjl4ZFdWMVpTaG1kVzVqZEdsdmJpQW9hWFJsYlhNc0lHTmlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjNiM0pyWlhJb2FYUmxiWE5iTUYwc0lHTmlLVHRjYmlBZ0lDQWdJQ0FnZlN3Z1kyOXVZM1Z5Y21WdVkza3NJREVwTzF4dVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCeE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTV3Y21sdmNtbDBlVkYxWlhWbElEMGdablZ1WTNScGIyNGdLSGR2Y210bGNpd2dZMjl1WTNWeWNtVnVZM2twSUh0Y2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmZZMjl0Y0dGeVpWUmhjMnR6S0dFc0lHSXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdFdWNISnBiM0pwZEhrZ0xTQmlMbkJ5YVc5eWFYUjVPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1gySnBibUZ5ZVZObFlYSmphQ2h6WlhGMVpXNWpaU3dnYVhSbGJTd2dZMjl0Y0dGeVpTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0psWnlBOUlDMHhMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1Z1WkNBOUlITmxjWFZsYm1ObExteGxibWQwYUNBdElERTdYRzRnSUNBZ0lDQWdJQ0FnSUNCM2FHbHNaU0FvWW1WbklEd2daVzVrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJRzFwWkNBOUlHSmxaeUFySUNnb1pXNWtJQzBnWW1WbklDc2dNU2tnUGo0K0lERXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoamIyMXdZWEpsS0dsMFpXMHNJSE5sY1hWbGJtTmxXMjFwWkYwcElENDlJREFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZbVZuSUQwZ2JXbGtPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWdVpDQTlJRzFwWkNBdElERTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR0psWnp0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJRjlwYm5ObGNuUW9jU3dnWkdGMFlTd2djSEpwYjNKcGRIa3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTJGc2JHSmhZMnNnSVQwZ2JuVnNiQ0FtSmlCMGVYQmxiMllnWTJGc2JHSmhZMnNnSVQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWhjSW5SaGMyc2dZMkZzYkdKaFkyc2diWFZ6ZENCaVpTQmhJR1oxYm1OMGFXOXVYQ0lwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2NTNXpkR0Z5ZEdWa0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaFgybHpRWEp5WVhrb1pHRjBZU2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhJRDBnVzJSaGRHRmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZb1pHRjBZUzVzWlc1bmRHZ2dQVDA5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXZMeUJqWVd4c0lHUnlZV2x1SUdsdGJXVmthV0YwWld4NUlHbG1JSFJvWlhKbElHRnlaU0J1YnlCMFlYTnJjMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVaSEpoYVc0b0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb1pHRjBZU3dnWm5WdVkzUnBiMjRvZEdGemF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCcGRHVnRJRDBnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoT2lCMFlYTnJMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd2NtbHZjbWwwZVRvZ2NISnBiM0pwZEhrc1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJPaUIwZVhCbGIyWWdZMkZzYkdKaFkyc2dQVDA5SUNkbWRXNWpkR2x2YmljZ1B5QmpZV3hzWW1GamF5QTZJRzV2YjNCY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOU8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjUzUwWVhOcmN5NXpjR3hwWTJVb1gySnBibUZ5ZVZObFlYSmphQ2h4TG5SaGMydHpMQ0JwZEdWdExDQmZZMjl0Y0dGeVpWUmhjMnR6S1NBcklERXNJREFzSUdsMFpXMHBPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUQwOVBTQnhMbU52Ym1OMWNuSmxibU41S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1YzJGMGRYSmhkR1ZrS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG5ObGRFbHRiV1ZrYVdGMFpTaHhMbkJ5YjJObGMzTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBdkx5QlRkR0Z5ZENCM2FYUm9JR0VnYm05eWJXRnNJSEYxWlhWbFhHNGdJQ0FnSUNBZ0lIWmhjaUJ4SUQwZ1lYTjVibU11Y1hWbGRXVW9kMjl5YTJWeUxDQmpiMjVqZFhKeVpXNWplU2s3WEc1Y2JpQWdJQ0FnSUNBZ0x5OGdUM1psY25KcFpHVWdjSFZ6YUNCMGJ5QmhZMk5sY0hRZ2MyVmpiMjVrSUhCaGNtRnRaWFJsY2lCeVpYQnlaWE5sYm5ScGJtY2djSEpwYjNKcGRIbGNiaUFnSUNBZ0lDQWdjUzV3ZFhOb0lEMGdablZ1WTNScGIyNGdLR1JoZEdFc0lIQnlhVzl5YVhSNUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1gybHVjMlZ5ZENoeExDQmtZWFJoTENCd2NtbHZjbWwwZVN3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1WEc0Z0lDQWdJQ0FnSUM4dklGSmxiVzkyWlNCMWJuTm9hV1owSUdaMWJtTjBhVzl1WEc0Z0lDQWdJQ0FnSUdSbGJHVjBaU0J4TG5WdWMyaHBablE3WEc1Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUhFN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbU5oY21kdklEMGdablZ1WTNScGIyNGdLSGR2Y210bGNpd2djR0Y1Ykc5aFpDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM0YxWlhWbEtIZHZjbXRsY2l3Z01Td2djR0Y1Ykc5aFpDazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWpiMjV6YjJ4bFgyWnVLRzVoYldVcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR1p1TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1iaTVoY0hCc2VTaHVkV3hzTENCaGNtZHpMbU52Ym1OaGRDaGJYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWlhKeUxDQmhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSFI1Y0dWdlppQmpiMjV6YjJ4bElEMDlQU0FuYjJKcVpXTjBKeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTI5dWMyOXNaUzVsY25KdmNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1WlhKeWIzSW9aWEp5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJR2xtSUNoamIyNXpiMnhsVzI1aGJXVmRLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmWVhKeVlYbEZZV05vS0dGeVozTXNJR1oxYm1OMGFXOXVJQ2g0S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pWdHVZVzFsWFNoNEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNsZEtTazdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmlBZ0lDQmhjM2x1WXk1c2IyY2dQU0JmWTI5dWMyOXNaVjltYmlnbmJHOW5KeWs3WEc0Z0lDQWdZWE41Ym1NdVpHbHlJRDBnWDJOdmJuTnZiR1ZmWm00b0oyUnBjaWNwTzF4dUlDQWdJQzhxWVhONWJtTXVhVzVtYnlBOUlGOWpiMjV6YjJ4bFgyWnVLQ2RwYm1adkp5azdYRzRnSUNBZ1lYTjVibU11ZDJGeWJpQTlJRjlqYjI1emIyeGxYMlp1S0NkM1lYSnVKeWs3WEc0Z0lDQWdZWE41Ym1NdVpYSnliM0lnUFNCZlkyOXVjMjlzWlY5bWJpZ25aWEp5YjNJbktUc3FMMXh1WEc0Z0lDQWdZWE41Ym1NdWJXVnRiMmw2WlNBOUlHWjFibU4wYVc5dUlDaG1iaXdnYUdGemFHVnlLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQnRaVzF2SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJSFpoY2lCeGRXVjFaWE1nUFNCN2ZUdGNiaUFnSUNBZ0lDQWdhR0Z6YUdWeUlEMGdhR0Z6YUdWeUlIeDhJR2xrWlc1MGFYUjVPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2JXVnRiMmw2WldRZ1BTQmZjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVJRzFsYlc5cGVtVmtLR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmpZV3hzWW1GamF5QTlJR0Z5WjNNdWNHOXdLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYTJWNUlEMGdhR0Z6YUdWeUxtRndjR3g1S0c1MWJHd3NJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHdGxlU0JwYmlCdFpXMXZLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhONWJtTXVibVY0ZEZScFkyc29ablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5NWhjSEJzZVNodWRXeHNMQ0J0WlcxdlcydGxlVjBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCcFppQW9hMlY1SUdsdUlIRjFaWFZsY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRjFaWFZsYzF0clpYbGRMbkIxYzJnb1kyRnNiR0poWTJzcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NYVmxkV1Z6VzJ0bGVWMGdQU0JiWTJGc2JHSmhZMnRkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadUxtRndjR3g1S0c1MWJHd3NJR0Z5WjNNdVkyOXVZMkYwS0Z0ZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUlDaGhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRzFsYlc5YmEyVjVYU0E5SUdGeVozTTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQnhJRDBnY1hWbGRXVnpXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JsYkdWMFpTQnhkV1YxWlhOYmEyVjVYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1ptOXlJQ2gyWVhJZ2FTQTlJREFzSUd3Z1BTQnhMbXhsYm1kMGFEc2dhU0E4SUd3N0lHa3JLeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY1Z0cFhTNWhjSEJzZVNodWRXeHNMQ0JoY21kektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcFhTa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnYldWdGIybDZaV1F1YldWdGJ5QTlJRzFsYlc4N1hHNGdJQ0FnSUNBZ0lHMWxiVzlwZW1Wa0xuVnViV1Z0YjJsNlpXUWdQU0JtYmp0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUcxbGJXOXBlbVZrTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NTFibTFsYlc5cGVtVWdQU0JtZFc1amRHbHZiaUFvWm00cElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlBb1ptNHVkVzV0WlcxdmFYcGxaQ0I4ZkNCbWJpa3VZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gzUnBiV1Z6S0cxaGNIQmxjaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRnS0dOdmRXNTBMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRzFoY0hCbGNpaGZjbUZ1WjJVb1kyOTFiblFwTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG5ScGJXVnpJRDBnWDNScGJXVnpLR0Z6ZVc1akxtMWhjQ2s3WEc0Z0lDQWdZWE41Ym1NdWRHbHRaWE5UWlhKcFpYTWdQU0JmZEdsdFpYTW9ZWE41Ym1NdWJXRndVMlZ5YVdWektUdGNiaUFnSUNCaGMzbHVZeTUwYVcxbGMweHBiV2wwSUQwZ1puVnVZM1JwYjI0Z0tHTnZkVzUwTENCc2FXMXBkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTV0WVhCTWFXMXBkQ2hmY21GdVoyVW9ZMjkxYm5RcExDQnNhVzFwZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11YzJWeElEMGdablZ1WTNScGIyNGdLQzhxSUdaMWJtTjBhVzl1Y3k0dUxpQXFMeWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdabTV6SUQwZ1lYSm5kVzFsYm5Sek8xeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlIUm9ZWFFnUFNCMGFHbHpPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWTJGc2JHSmhZMnNnUFNCaGNtZHpXMkZ5WjNNdWJHVnVaM1JvSUMwZ01WMDdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9kSGx3Wlc5bUlHTmhiR3hpWVdOcklEMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGNtZHpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheUE5SUc1dmIzQTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdJQ0FnSUdGemVXNWpMbkpsWkhWalpTaG1ibk1zSUdGeVozTXNJR1oxYm1OMGFXOXVJQ2h1WlhkaGNtZHpMQ0JtYml3Z1kySXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JtYmk1aGNIQnNlU2gwYUdGMExDQnVaWGRoY21kekxtTnZibU5oZENoYlgzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9aWEp5TENCdVpYaDBZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWWlobGNuSXNJRzVsZUhSaGNtZHpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1YwcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUFvWlhKeUxDQnlaWE4xYkhSektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc3VZWEJ3Ykhrb2RHaGhkQ3dnVzJWeWNsMHVZMjl1WTJGMEtISmxjM1ZzZEhNcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVkyOXRjRzl6WlNBOUlHWjFibU4wYVc5dUlDZ3ZLaUJtZFc1amRHbHZibk11TGk0Z0tpOHBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR0Z6ZVc1akxuTmxjUzVoY0hCc2VTaHVkV3hzTENCQmNuSmhlUzV3Y205MGIzUjVjR1V1Y21WMlpYSnpaUzVqWVd4c0tHRnlaM1Z0Wlc1MGN5a3BPMXh1SUNBZ0lIMDdYRzVjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjloY0hCc2VVVmhZMmdvWldGamFHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1S0dadWN5d2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHZHZJRDBnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmloaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlIUm9ZWFFnUFNCMGFHbHpPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCallXeHNZbUZqYXlBOUlHRnlaM011Y0c5d0tDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHVmhZMmhtYmlobWJuTXNJR1oxYm1OMGFXOXVJQ2htYml3Z1h5d2dZMklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTR1WVhCd2JIa29kR2hoZEN3Z1lYSm5jeTVqYjI1allYUW9XMk5pWFNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZWEpuY3k1c1pXNW5kR2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWjI4dVlYQndiSGtvZEdocGN5d2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWjI4N1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbUZ3Y0d4NVJXRmphQ0E5SUY5aGNIQnNlVVZoWTJnb1lYTjVibU11WldGamFFOW1LVHRjYmlBZ0lDQmhjM2x1WXk1aGNIQnNlVVZoWTJoVFpYSnBaWE1nUFNCZllYQndiSGxGWVdOb0tHRnplVzVqTG1WaFkyaFBabE5sY21sbGN5azdYRzVjYmx4dUlDQWdJR0Z6ZVc1akxtWnZjbVYyWlhJZ1BTQm1kVzVqZEdsdmJpQW9abTRzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJrYjI1bElEMGdiMjVzZVY5dmJtTmxLR05oYkd4aVlXTnJJSHg4SUc1dmIzQXBPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2RHRnpheUE5SUdWdWMzVnlaVUZ6ZVc1aktHWnVLVHRjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnYm1WNGRDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdaRzl1WlNobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdGemF5aHVaWGgwS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQnVaWGgwS0NrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUdWdWMzVnlaVUZ6ZVc1aktHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1SUNoaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWTJGc2JHSmhZMnNnUFNCaGNtZHpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5NXdkWE5vS0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnYVc1dVpYSkJjbWR6SUQwZ1lYSm5kVzFsYm5Sek8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h6ZVc1aktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGemVXNWpMbk5sZEVsdGJXVmthV0YwWlNobWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5NWhjSEJzZVNodWRXeHNMQ0JwYm01bGNrRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXk1aGNIQnNlU2h1ZFd4c0xDQnBibTVsY2tGeVozTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSE41Ym1NZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdabTR1WVhCd2JIa29kR2hwY3l3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnplVzVqSUQwZ1ptRnNjMlU3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbVZ1YzNWeVpVRnplVzVqSUQwZ1pXNXpkWEpsUVhONWJtTTdYRzVjYmlBZ0lDQmhjM2x1WXk1amIyNXpkR0Z1ZENBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9kbUZzZFdWektTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCaGNtZHpJRDBnVzI1MWJHeGRMbU52Ym1OaGRDaDJZV3gxWlhNcE8xeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnN1WVhCd2JIa29kR2hwY3l3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlNrN1hHNWNiaUFnSUNCaGMzbHVZeTUzY21Gd1UzbHVZeUE5WEc0Z0lDQWdZWE41Ym1NdVlYTjVibU5wWm5rZ1BTQm1kVzVqZEdsdmJpQmhjM2x1WTJsbWVTaG1kVzVqS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUlDaGhjbWR6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1kyRnNiR0poWTJzZ1BTQmhjbWR6TG5CdmNDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2REdGNiaUFnSUNBZ0lDQWdJQ0FnSUhSeWVTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ6ZFd4MElEMGdablZ1WXk1aGNIQnNlU2gwYUdsekxDQmhjbWR6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWTJGMFkyZ2dLR1VwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvWlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJwWmlCeVpYTjFiSFFnYVhNZ1VISnZiV2x6WlNCdlltcGxZM1JjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hmYVhOUFltcGxZM1FvY21WemRXeDBLU0FtSmlCMGVYQmxiMllnY21WemRXeDBMblJvWlc0Z1BUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxjM1ZzZEM1MGFHVnVLR1oxYm1OMGFXOXVLSFpoYkhWbEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3NJSFpoYkhWbEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVnRjSW1OaGRHTm9YQ0pkS0daMWJtTjBhVzl1S0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXViV1Z6YzJGblpTQS9JR1Z5Y2lBNklHNWxkeUJGY25KdmNpaGxjbklwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDd2djbVZ6ZFd4MEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lDOHZJRTV2WkdVdWFuTmNiaUFnSUNCcFppQW9kSGx3Wlc5bUlHMXZaSFZzWlNBOVBUMGdKMjlpYW1WamRDY2dKaVlnYlc5a2RXeGxMbVY0Y0c5eWRITXBJSHRjYmlBZ0lDQWdJQ0FnYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JoYzNsdVl6dGNiaUFnSUNCOVhHNGdJQ0FnTHk4Z1FVMUVJQzhnVW1WeGRXbHlaVXBUWEc0Z0lDQWdaV3h6WlNCcFppQW9kSGx3Wlc5bUlHUmxabWx1WlNBOVBUMGdKMloxYm1OMGFXOXVKeUFtSmlCa1pXWnBibVV1WVcxa0tTQjdYRzRnSUNBZ0lDQWdJR1JsWm1sdVpTaGJYU3dnWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR0Z6ZVc1ak8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzRnSUNBZ0x5OGdhVzVqYkhWa1pXUWdaR2x5WldOMGJIa2dkbWxoSUR4elkzSnBjSFErSUhSaFoxeHVJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0J5YjI5MExtRnplVzVqSUQwZ1lYTjVibU03WEc0Z0lDQWdmVnh1WEc1OUtDa3BPMXh1SWwxOSJdfQ==
},{"_process":"/Users/cheton/github/webappengine/node_modules/browserify/node_modules/process/browser.js"}],"/Users/cheton/github/webappengine/web/vendor/i18next/i18next.js":[function(require,module,exports){
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


},{}],"/Users/cheton/github/webappengine/web/vendor/jsUri/Uri.js":[function(require,module,exports){
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


},{}],"/Users/cheton/github/webappengine/web/vendor/react-router/build/umd/ReactRouter.js":[function(require,module,exports){
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


},{"react":"react"}],"/Users/cheton/github/webappengine/web/vendor/stacktrace-js/stacktrace.js":[function(require,module,exports){
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