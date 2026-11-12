// node_modules/@vot.js/shared/dist/data/config.js
var config_default = {
  host: "api.browser.yandex.ru",
  hostWorker: "vot-worker.toil.cc",
  mediaProxy: "media-proxy.toil.cc",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 YaBrowser/26.10.0.0 Safari/537.36",
  componentVersion: "26.10.0.1854",
  chromiumRevision: "1854",
  hmac: "bt8xH3VOlb4mqf0nqAibnDOoiPlXsisf",
  defaultDuration: 310,
  minChunkSize: 5295308,
  loggerLevel: 1,
  version: "3.2.2"
};

// node_modules/@vot.js/shared/dist/types/logger.js
var LoggerLevel;
(function(LoggerLevel2) {
  LoggerLevel2[LoggerLevel2["DEBUG"] = 0] = "DEBUG";
  LoggerLevel2[LoggerLevel2["INFO"] = 1] = "INFO";
  LoggerLevel2[LoggerLevel2["WARN"] = 2] = "WARN";
  LoggerLevel2[LoggerLevel2["ERROR"] = 3] = "ERROR";
  LoggerLevel2[LoggerLevel2["SILENCE"] = 4] = "SILENCE";
})(LoggerLevel || (LoggerLevel = {}));

// node_modules/@vot.js/shared/dist/utils/logger.js
var prefix = `[vot.js v${config_default.version}]`;
function canLog(level) {
  return config_default.loggerLevel <= level;
}
function log(...messages) {
  if (!canLog(LoggerLevel.DEBUG)) {
    return;
  }
  console.log(prefix, ...messages);
}
function info(...messages) {
  if (!canLog(LoggerLevel.INFO)) {
    return;
  }
  console.info(prefix, ...messages);
}
function warn(...messages) {
  if (!canLog(LoggerLevel.WARN)) {
    return;
  }
  console.warn(prefix, ...messages);
}
function error(...messages) {
  if (!canLog(LoggerLevel.ERROR)) {
    return;
  }
  console.error(prefix, ...messages);
}
var Logger = {
  canLog,
  log,
  info,
  warn,
  error
};
var logger_default = Logger;

// node_modules/@bufbuild/protobuf/dist/esm/wire/varint.js
function varint64read() {
  const buf = this.buf;
  let pos = this.pos;
  let lo = 0;
  let hi = 0;
  for (let shift = 0; shift < 28; shift += 7) {
    const b = buf[pos++];
    lo |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.pos = pos;
      this.assertBounds();
      this.varint64Lo = lo;
      this.varint64Hi = hi;
      return;
    }
  }
  const middleByte = buf[pos++];
  lo |= (middleByte & 15) << 28;
  hi = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.pos = pos;
    this.assertBounds();
    this.varint64Lo = lo;
    this.varint64Hi = hi;
    return;
  }
  for (let shift = 3; shift <= 31; shift += 7) {
    const b = buf[pos++];
    hi |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.pos = pos;
      this.assertBounds();
      this.varint64Lo = lo;
      this.varint64Hi = hi;
      return;
    }
  }
  throw new Error("invalid varint");
}
var TWO_PWR_32_DBL = 4294967296;
function int64FromString(dec) {
  const minus = dec[0] === "-";
  if (minus) {
    dec = dec.slice(1);
  }
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
}
function int64ToString(lo, hi) {
  let bits = newBits(lo, hi);
  const negative = bits.hi & 2147483648;
  if (negative) {
    bits = negate(bits.lo, bits.hi);
  }
  const result = uInt64ToString(bits.lo, bits.hi);
  return negative ? "-" + result : result;
}
function uInt64ToString(lo, hi) {
  ({ lo, hi } = toUnsigned(lo, hi));
  if (hi <= 2097151) {
    return String(TWO_PWR_32_DBL * hi + lo);
  }
  const low = lo & 16777215;
  const mid = (lo >>> 24 | hi << 8) & 16777215;
  const high = hi >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  const base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
}
function toUnsigned(lo, hi) {
  return { lo: lo >>> 0, hi: hi >>> 0 };
}
function newBits(lo, hi) {
  return { lo: lo | 0, hi: hi | 0 };
}
function negate(lowBits, highBits) {
  highBits = ~highBits;
  if (lowBits) {
    lowBits = ~lowBits + 1;
  } else {
    highBits += 1;
  }
  return newBits(lowBits, highBits);
}
var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
  const partial = String(digit1e7);
  return "0000000".slice(partial.length) + partial;
};
function varint32read() {
  let b = this.buf[this.pos++];
  if ((b & 128) === 0) {
    this.assertBounds();
    return b;
  }
  let result = b & 127;
  b = this.buf[this.pos++];
  result |= (b & 127) << 7;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 14;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 127) << 21;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result;
  }
  b = this.buf[this.pos++];
  result |= (b & 15) << 28;
  for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
    b = this.buf[this.pos++];
  if ((b & 128) !== 0)
    throw new Error("invalid varint");
  this.assertBounds();
  return result >>> 0;
}

// node_modules/@bufbuild/protobuf/dist/esm/proto-int64.js
var protoInt64 = /* @__PURE__ */ makeInt64Support();
function makeInt64Support() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = typeof BigInt === "function" && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function" && (!!globalThis.Deno || !!globalThis.Bun || typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
  if (ok) {
    const MIN = BigInt("-9223372036854775808");
    const MAX = BigInt("9223372036854775807");
    const UMIN = BigInt("0");
    const UMAX = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: true,
      parse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > MAX || bi < MIN) {
          throw new Error(`invalid int64: ${value}`);
        }
        return bi;
      },
      uParse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > UMAX || bi < UMIN) {
          throw new Error(`invalid uint64: ${value}`);
        }
        return bi;
      },
      enc(value) {
        dv.setBigInt64(0, this.parse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      uEnc(value) {
        dv.setBigInt64(0, this.uParse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      dec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigInt64(0, true);
      },
      uDec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigUint64(0, true);
      }
    };
  }
  return {
    zero: "0",
    supported: false,
    parse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return value;
    },
    uParse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return value;
    },
    enc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return int64FromString(value);
    },
    uEnc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return int64FromString(value);
    },
    dec(lo, hi) {
      return int64ToString(lo, hi);
    },
    uDec(lo, hi) {
      return uInt64ToString(lo, hi);
    }
  };
}
function assertInt64String(value) {
  if (!/^-?[0-9]+$/.test(value)) {
    throw new Error("invalid int64: " + value);
  }
}
function assertUInt64String(value) {
  if (!/^[0-9]+$/.test(value)) {
    throw new Error("invalid uint64: " + value);
  }
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/text-encoding.js
var te;
function configureTextEncoding(textEncoding) {
  var _a;
  te = Object.assign(Object.assign({}, textEncoding), { encodeUtf8Into: (_a = textEncoding.encodeUtf8Into) !== null && _a !== void 0 ? _a : emulateEncodeInto(textEncoding.encodeUtf8.bind(textEncoding)) });
}
function getTextEncoding() {
  if (!te) {
    const globals = globalThis;
    if (!globals.TextEncoder || !globals.TextDecoder) {
      throw new Error("encoding API missing: install TextEncoder and TextDecoder on globalThis");
    }
    const textEncoder = new globals.TextEncoder();
    const textDecoder = new globals.TextDecoder("utf-8", {
      ignoreBOM: true
    });
    let textDecoderStrict;
    const config = {
      encodeUtf8(text) {
        return textEncoder.encode(text);
      },
      decodeUtf8(bytes, strict) {
        if (strict) {
          if (!textDecoderStrict) {
            textDecoderStrict = new globals.TextDecoder("utf-8", {
              fatal: true,
              ignoreBOM: true
            });
          }
          return textDecoderStrict.decode(bytes);
        }
        return textDecoder.decode(bytes);
      },
      checkUtf8(text) {
        try {
          encodeURIComponent(text);
          return true;
        } catch (_) {
          return false;
        }
      }
    };
    if (textEncoder.encodeInto) {
      config.encodeUtf8Into = textEncoder.encodeInto.bind(textEncoder);
    }
    const nativeStringIsWellFormed = String.prototype.isWellFormed;
    if (nativeStringIsWellFormed) {
      config.checkUtf8 = (text) => {
        return nativeStringIsWellFormed.call(text);
      };
    }
    configureTextEncoding(config);
  }
  return te;
}
function emulateEncodeInto(encodeUtf8) {
  return (text, dest) => {
    const bytes = encodeUtf8(text);
    dest.set(bytes);
    return { written: bytes.byteLength };
  };
}

// node_modules/@bufbuild/protobuf/dist/esm/wire/binary-encoding.js
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
var BinaryWriter = class {
  constructor(encodeUtf8) {
    this.stackPos = [];
    this.encodeUtf8Into = encodeUtf8 ? emulateEncodeInto(encodeUtf8) : getTextEncoding().encodeUtf8Into;
    this.buffer = EMPTY_BUFFER;
    this.viewCache = EMPTY_VIEW;
    this.pos = 0;
  }
  ensureCapacity(size) {
    const required = this.pos + size;
    if (required > this.buffer.length) {
      let newLen = this.buffer.length || INITIAL_SIZE;
      while (newLen < required)
        newLen *= 2;
      const newBuf = new Uint8Array(newLen);
      if (this.pos > 0)
        newBuf.set(this.buffer);
      this.buffer = newBuf;
    }
  }
  /**
   * The DataView over `buffer`, rebuilt only if the buffer has grown since it
   * was last used.
   */
  view() {
    const bytes = this.buffer;
    const view = this.viewCache;
    if (view.byteLength === bytes.byteLength)
      return view;
    const newView = new DataView(bytes.buffer);
    this.viewCache = newView;
    return newView;
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    const result = this.buffer.slice(0, this.pos);
    this.pos = 0;
    this.stackPos = [];
    return result;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    this.stackPos.push(this.pos);
    this.ensureCapacity(DEFAULT_LEN_PREFIX_SIZE);
    this.buffer[this.pos++] = 0;
    return this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    const forkPos = this.stackPos.pop();
    if (forkPos === void 0)
      throw new Error("invalid state, fork stack empty");
    const len = this.pos - forkPos - DEFAULT_LEN_PREFIX_SIZE;
    const lenPrefixSize = varint32Size(len);
    if (lenPrefixSize > DEFAULT_LEN_PREFIX_SIZE) {
      this.ensureCapacity(lenPrefixSize - DEFAULT_LEN_PREFIX_SIZE);
      this.buffer.copyWithin(forkPos + lenPrefixSize, forkPos + DEFAULT_LEN_PREFIX_SIZE, this.pos);
    }
    this.pos = forkPos;
    this.uint32(len);
    this.pos += len;
    return this;
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(chunk) {
    this.ensureCapacity(chunk.length);
    this.buffer.set(chunk, this.pos);
    this.pos += chunk.length;
    return this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(value) {
    assertUInt32(value);
    this.ensureCapacity(5);
    if (value < 128) {
      this.buffer[this.pos++] = value;
      return this;
    }
    while (value > 127) {
      this.buffer[this.pos++] = value & 127 | 128;
      value >>>= 7;
    }
    this.buffer[this.pos++] = value;
    return this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(value) {
    assertInt32(value);
    if (value >= 0) {
      return this.uint32(value);
    }
    this.ensureCapacity(10);
    for (let i = 0; i < 9; i++) {
      this.buffer[this.pos++] = value & 127 | 128;
      value >>= 7;
    }
    this.buffer[this.pos++] = 1;
    return this;
  }
  /**
   * Write a `bool` value, a varint.
   */
  bool(value) {
    this.ensureCapacity(1);
    this.buffer[this.pos++] = value ? 1 : 0;
    return this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(value) {
    if (typeof value !== "string") {
      value = String(value);
    }
    const len = value.length;
    if (len <= ASCII_MAX_LENGTH) {
      this.ensureCapacity(len + 1);
      const ascii = this.buffer;
      let pos = this.pos;
      ascii[pos++] = len;
      let i = 0;
      for (; i < len; i++) {
        const code = value.charCodeAt(i);
        if (code > 127)
          break;
        ascii[pos++] = code;
      }
      if (i == len) {
        this.pos = pos;
        return this;
      }
    }
    this.ensureCapacity(len * 3 + 5);
    const lenPrefixSizeGuess = varint32Size(len);
    const buf = this.buffer;
    const start = this.pos;
    const { written } = this.encodeUtf8Into(value, buf.subarray(start + lenPrefixSizeGuess));
    const lenPrefixSize = varint32Size(written);
    if (lenPrefixSize != lenPrefixSizeGuess) {
      buf.copyWithin(start + lenPrefixSize, start + lenPrefixSizeGuess, start + lenPrefixSizeGuess + written);
    }
    this.uint32(written);
    this.pos += written;
    return this;
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(value) {
    assertFloat32(value);
    this.ensureCapacity(4);
    this.view().setFloat32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(value) {
    this.ensureCapacity(8);
    this.view().setFloat64(this.pos, value, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(value) {
    assertUInt32(value);
    this.ensureCapacity(4);
    this.view().setUint32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(value) {
    assertInt32(value);
    this.ensureCapacity(4);
    this.view().setInt32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(value) {
    assertInt32(value);
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
  }
  /**
   * Write a `sfixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(value) {
    const tc = protoInt64.enc(value);
    this.ensureCapacity(8);
    const view = this.view();
    view.setInt32(this.pos, tc.lo, true);
    view.setInt32(this.pos + 4, tc.hi, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(value) {
    const tc = protoInt64.uEnc(value);
    this.ensureCapacity(8);
    const view = this.view();
    view.setInt32(this.pos, tc.lo, true);
    view.setInt32(this.pos + 4, tc.hi, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(value) {
    const tc = protoInt64.enc(value);
    return this.writeVarint64(tc.lo, tc.hi);
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(value) {
    const tc = protoInt64.enc(value), sign = tc.hi >> 31, lo = tc.lo << 1 ^ sign, hi = (tc.hi << 1 | tc.lo >>> 31) ^ sign;
    return this.writeVarint64(lo, hi);
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(value) {
    const tc = protoInt64.uEnc(value);
    return this.writeVarint64(tc.lo, tc.hi);
  }
  /**
   * Write a 64-bit varint directly into the buffer. Accepts the value as
   * split low/high 32-bit words.
   *
   * Ported from varint64write() to avoid the intermediate number[] buffer.
   * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/writer.js#L344
   */
  writeVarint64(lo, hi) {
    this.ensureCapacity(10);
    const buf = this.buffer;
    let pos = this.pos;
    for (let i = 0; i < 28; i = i + 7) {
      const shift = lo >>> i;
      const hasNext = !(shift >>> 7 == 0 && hi == 0);
      buf[pos++] = (hasNext ? shift | 128 : shift) & 255;
      if (!hasNext) {
        this.pos = pos;
        return this;
      }
    }
    const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
    const hasMoreBits = !(hi >> 3 == 0);
    buf[pos++] = (hasMoreBits ? splitBits | 128 : splitBits) & 255;
    if (!hasMoreBits) {
      this.pos = pos;
      return this;
    }
    for (let i = 3; i < 31; i = i + 7) {
      const shift = hi >>> i;
      const hasNext = !(shift >>> 7 == 0);
      buf[pos++] = (hasNext ? shift | 128 : shift) & 255;
      if (!hasNext) {
        this.pos = pos;
        return this;
      }
    }
    buf[pos++] = hi >>> 31 & 1;
    this.pos = pos;
    return this;
  }
};
var INITIAL_SIZE = 128;
var DEFAULT_LEN_PREFIX_SIZE = 1;
var EMPTY_BUFFER = new Uint8Array(0);
var EMPTY_VIEW = new DataView(EMPTY_BUFFER.buffer);
var ASCII_MAX_LENGTH = 32;
function varint32Size(value) {
  if (value < 128)
    return 1;
  if (value < 16384)
    return 2;
  if (value < 2097152)
    return 3;
  if (value < 268435456)
    return 4;
  return 5;
}
var BinaryReader = class {
  constructor(buf, decodeUtf8 = getTextEncoding().decodeUtf8) {
    this.decodeUtf8 = decodeUtf8;
    this.varint64Lo = 0;
    this.varint64Hi = 0;
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  /**
   * Reads a tag - field number and wire type. Tags are uint32 varints; values
   * that do not fit in uint32 are rejected.
   */
  tag() {
    const start = this.pos;
    const tag = this.uint32();
    const bytesRead = this.pos - start;
    if (bytesRead > 5 || bytesRead == 5 && this.buf[this.pos - 1] > 15) {
      throw new Error("illegal tag: varint overflows uint32");
    }
    const fieldNo = tag >>> 3;
    const wireType = tag & 7;
    if (fieldNo <= 0 || wireType > 5) {
      throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    }
    return [fieldNo, wireType];
  }
  /**
   * Skip one element and return the skipped data.
   *
   * When skipping StartGroup, provide the tags field number to check for
   * matching field number in the EndGroup tag. Recursion into nested groups
   * is guarded by the `recursionLimit` argument: When the limit is reached,
   * this method throws.
   */
  skip(wireType, fieldNo, recursionLimit = 100) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {
        }
        break;
      // @ts-ignore TS7029: Fallthrough case in switch -- ignore instead of expect-error for compiler settings without noFallthroughCasesInSwitch: true
      case WireType.Bit64:
        this.pos += 4;
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        if (recursionLimit <= 0) {
          throw new Error("maximum recursion depth reached");
        }
        for (; ; ) {
          const [fn, wt] = this.tag();
          if (wt === WireType.EndGroup) {
            if (fieldNo !== void 0 && fn !== fieldNo) {
              throw new Error("invalid end group tag");
            }
            break;
          }
          this.skip(wt, fn, recursionLimit - 1);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    this.varint64();
    return protoInt64.dec(this.varint64Lo, this.varint64Hi);
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    this.varint64();
    return protoInt64.uDec(this.varint64Lo, this.varint64Hi);
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    this.varint64();
    let lo = this.varint64Lo;
    let hi = this.varint64Hi;
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return protoInt64.dec(lo, hi);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    const b = this.buf[this.pos];
    if (b < 128) {
      this.pos++;
      return b !== 0;
    }
    this.varint64();
    return this.varint64Lo !== 0 || this.varint64Hi !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return protoInt64.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return protoInt64.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let len = this.uint32(), start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text. If
   * `strict` is true, throw on invalid UTF-8 instead of substituting U+FFFD.
   */
  string(strict) {
    const len = this.uint32();
    const start = this.pos;
    this.pos += len;
    this.assertBounds();
    const buf = this.buf;
    if (len <= ASCII_MAX_LENGTH) {
      const codes = new Array(len);
      for (let i = 0; i < len; i++) {
        const byte = buf[start + i];
        if (byte > 127) {
          return this.decodeUtf8(buf.subarray(start, this.pos), strict);
        }
        codes[i] = byte;
      }
      return String.fromCharCode.apply(String, codes);
    }
    return this.decodeUtf8(buf.subarray(start, this.pos), strict);
  }
};
function assertInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid int32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid uint32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg == "string") {
    const o = arg;
    arg = Number(arg);
    if (Number.isNaN(arg) && o !== "NaN") {
      throw new Error("invalid float32: " + o);
    }
  } else if (typeof arg != "number") {
    throw new Error("invalid float32: " + typeof arg);
  }
  if (!Number.isFinite(Math.fround(arg)) && Number.isFinite(arg)) {
    throw new Error("invalid float32: " + arg);
  }
}

// node_modules/@vot.js/shared/dist/protos/yandex.js
var StreamInterval;
(function(StreamInterval2) {
  StreamInterval2[StreamInterval2["NO_CONNECTION"] = 0] = "NO_CONNECTION";
  StreamInterval2[StreamInterval2["TRANSLATING"] = 10] = "TRANSLATING";
  StreamInterval2[StreamInterval2["STREAMING"] = 20] = "STREAMING";
  StreamInterval2[StreamInterval2["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
})(StreamInterval || (StreamInterval = {}));
function streamIntervalFromJSON(object) {
  switch (object) {
    case 0:
    case "NO_CONNECTION":
      return StreamInterval.NO_CONNECTION;
    case 10:
    case "TRANSLATING":
      return StreamInterval.TRANSLATING;
    case 20:
    case "STREAMING":
      return StreamInterval.STREAMING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return StreamInterval.UNRECOGNIZED;
  }
}
function streamIntervalToJSON(object) {
  switch (object) {
    case StreamInterval.NO_CONNECTION:
      return "NO_CONNECTION";
    case StreamInterval.TRANSLATING:
      return "TRANSLATING";
    case StreamInterval.STREAMING:
      return "STREAMING";
    case StreamInterval.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
function createBaseVideoTranslationHelpObject() {
  return { target: "", targetUrl: "" };
}
var VideoTranslationHelpObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.target !== "") {
      writer.uint32(10).string(message.target);
    }
    if (message.targetUrl !== "") {
      writer.uint32(18).string(message.targetUrl);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationHelpObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.target = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.targetUrl = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      target: isSet(object.target) ? globalThis.String(object.target) : "",
      targetUrl: isSet(object.targetUrl) ? globalThis.String(object.targetUrl) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.target !== "") {
      obj.target = message.target;
    }
    if (message.targetUrl !== "") {
      obj.targetUrl = message.targetUrl;
    }
    return obj;
  },
  create(base) {
    return VideoTranslationHelpObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationHelpObject();
    message.target = object.target ?? "";
    message.targetUrl = object.targetUrl ?? "";
    return message;
  }
};
function createBaseVideoTranslationRequest() {
  return {
    url: "",
    deviceId: void 0,
    firstRequest: false,
    duration: 0,
    unknown0: false,
    language: "",
    forceSourceLang: false,
    unknown1: false,
    translationHelp: [],
    wasStream: false,
    responseLanguage: "",
    unknown2: false,
    configVersion: 0,
    bypassCache: false,
    useLivelyVoice: false,
    videoTitle: ""
  };
}
var VideoTranslationRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(26).string(message.url);
    }
    if (message.deviceId !== void 0) {
      writer.uint32(34).string(message.deviceId);
    }
    if (message.firstRequest !== false) {
      writer.uint32(40).bool(message.firstRequest);
    }
    if (message.duration !== 0) {
      writer.uint32(49).double(message.duration);
    }
    if (message.unknown0 !== false) {
      writer.uint32(56).bool(message.unknown0);
    }
    if (message.language !== "") {
      writer.uint32(66).string(message.language);
    }
    if (message.forceSourceLang !== false) {
      writer.uint32(72).bool(message.forceSourceLang);
    }
    if (message.unknown1 !== false) {
      writer.uint32(80).bool(message.unknown1);
    }
    for (const v of message.translationHelp) {
      VideoTranslationHelpObject.encode(v, writer.uint32(90).fork()).join();
    }
    if (message.wasStream !== false) {
      writer.uint32(104).bool(message.wasStream);
    }
    if (message.responseLanguage !== "") {
      writer.uint32(114).string(message.responseLanguage);
    }
    if (message.unknown2 !== false) {
      writer.uint32(120).bool(message.unknown2);
    }
    if (message.configVersion !== 0) {
      writer.uint32(128).int32(message.configVersion);
    }
    if (message.bypassCache !== false) {
      writer.uint32(136).bool(message.bypassCache);
    }
    if (message.useLivelyVoice !== false) {
      writer.uint32(144).bool(message.useLivelyVoice);
    }
    if (message.videoTitle !== "") {
      writer.uint32(154).string(message.videoTitle);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3: {
          if (tag !== 26) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }
          message.deviceId = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }
          message.firstRequest = reader.bool();
          continue;
        }
        case 6: {
          if (tag !== 49) {
            break;
          }
          message.duration = reader.double();
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }
          message.unknown0 = reader.bool();
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }
          message.language = reader.string();
          continue;
        }
        case 9: {
          if (tag !== 72) {
            break;
          }
          message.forceSourceLang = reader.bool();
          continue;
        }
        case 10: {
          if (tag !== 80) {
            break;
          }
          message.unknown1 = reader.bool();
          continue;
        }
        case 11: {
          if (tag !== 90) {
            break;
          }
          message.translationHelp.push(VideoTranslationHelpObject.decode(reader, reader.uint32()));
          continue;
        }
        case 13: {
          if (tag !== 104) {
            break;
          }
          message.wasStream = reader.bool();
          continue;
        }
        case 14: {
          if (tag !== 114) {
            break;
          }
          message.responseLanguage = reader.string();
          continue;
        }
        case 15: {
          if (tag !== 120) {
            break;
          }
          message.unknown2 = reader.bool();
          continue;
        }
        case 16: {
          if (tag !== 128) {
            break;
          }
          message.configVersion = reader.int32();
          continue;
        }
        case 17: {
          if (tag !== 136) {
            break;
          }
          message.bypassCache = reader.bool();
          continue;
        }
        case 18: {
          if (tag !== 144) {
            break;
          }
          message.useLivelyVoice = reader.bool();
          continue;
        }
        case 19: {
          if (tag !== 154) {
            break;
          }
          message.videoTitle = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      deviceId: isSet(object.deviceId) ? globalThis.String(object.deviceId) : void 0,
      firstRequest: isSet(object.firstRequest) ? globalThis.Boolean(object.firstRequest) : false,
      duration: isSet(object.duration) ? globalThis.Number(object.duration) : 0,
      unknown0: isSet(object.unknown0) ? globalThis.Boolean(object.unknown0) : false,
      language: isSet(object.language) ? globalThis.String(object.language) : "",
      forceSourceLang: isSet(object.forceSourceLang) ? globalThis.Boolean(object.forceSourceLang) : false,
      unknown1: isSet(object.unknown1) ? globalThis.Boolean(object.unknown1) : false,
      translationHelp: globalThis.Array.isArray(object?.translationHelp) ? object.translationHelp.map((e) => VideoTranslationHelpObject.fromJSON(e)) : [],
      wasStream: isSet(object.wasStream) ? globalThis.Boolean(object.wasStream) : false,
      responseLanguage: isSet(object.responseLanguage) ? globalThis.String(object.responseLanguage) : "",
      unknown2: isSet(object.unknown2) ? globalThis.Boolean(object.unknown2) : false,
      configVersion: isSet(object.configVersion) ? globalThis.Number(object.configVersion) : 0,
      bypassCache: isSet(object.bypassCache) ? globalThis.Boolean(object.bypassCache) : false,
      useLivelyVoice: isSet(object.useLivelyVoice) ? globalThis.Boolean(object.useLivelyVoice) : false,
      videoTitle: isSet(object.videoTitle) ? globalThis.String(object.videoTitle) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.deviceId !== void 0) {
      obj.deviceId = message.deviceId;
    }
    if (message.firstRequest !== false) {
      obj.firstRequest = message.firstRequest;
    }
    if (message.duration !== 0) {
      obj.duration = message.duration;
    }
    if (message.unknown0 !== false) {
      obj.unknown0 = message.unknown0;
    }
    if (message.language !== "") {
      obj.language = message.language;
    }
    if (message.forceSourceLang !== false) {
      obj.forceSourceLang = message.forceSourceLang;
    }
    if (message.unknown1 !== false) {
      obj.unknown1 = message.unknown1;
    }
    if (message.translationHelp?.length) {
      obj.translationHelp = message.translationHelp.map((e) => VideoTranslationHelpObject.toJSON(e));
    }
    if (message.wasStream !== false) {
      obj.wasStream = message.wasStream;
    }
    if (message.responseLanguage !== "") {
      obj.responseLanguage = message.responseLanguage;
    }
    if (message.unknown2 !== false) {
      obj.unknown2 = message.unknown2;
    }
    if (message.configVersion !== 0) {
      obj.configVersion = Math.round(message.configVersion);
    }
    if (message.bypassCache !== false) {
      obj.bypassCache = message.bypassCache;
    }
    if (message.useLivelyVoice !== false) {
      obj.useLivelyVoice = message.useLivelyVoice;
    }
    if (message.videoTitle !== "") {
      obj.videoTitle = message.videoTitle;
    }
    return obj;
  },
  create(base) {
    return VideoTranslationRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationRequest();
    message.url = object.url ?? "";
    message.deviceId = object.deviceId ?? void 0;
    message.firstRequest = object.firstRequest ?? false;
    message.duration = object.duration ?? 0;
    message.unknown0 = object.unknown0 ?? false;
    message.language = object.language ?? "";
    message.forceSourceLang = object.forceSourceLang ?? false;
    message.unknown1 = object.unknown1 ?? false;
    message.translationHelp = object.translationHelp?.map((e) => VideoTranslationHelpObject.fromPartial(e)) || [];
    message.wasStream = object.wasStream ?? false;
    message.responseLanguage = object.responseLanguage ?? "";
    message.unknown2 = object.unknown2 ?? false;
    message.configVersion = object.configVersion ?? 0;
    message.bypassCache = object.bypassCache ?? false;
    message.useLivelyVoice = object.useLivelyVoice ?? false;
    message.videoTitle = object.videoTitle ?? "";
    return message;
  }
};
function createBaseVideoTranslationResponse() {
  return {
    url: void 0,
    duration: void 0,
    status: 0,
    remainingTime: void 0,
    unknown0: void 0,
    translationId: "",
    language: void 0,
    message: void 0,
    isLivelyVoice: false,
    allowToTranslateVideo: void 0,
    shouldRetry: void 0,
    unknown3: void 0
  };
}
var VideoTranslationResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== void 0) {
      writer.uint32(10).string(message.url);
    }
    if (message.duration !== void 0) {
      writer.uint32(17).double(message.duration);
    }
    if (message.status !== 0) {
      writer.uint32(32).int32(message.status);
    }
    if (message.remainingTime !== void 0) {
      writer.uint32(40).int32(message.remainingTime);
    }
    if (message.unknown0 !== void 0) {
      writer.uint32(48).int32(message.unknown0);
    }
    if (message.translationId !== "") {
      writer.uint32(58).string(message.translationId);
    }
    if (message.language !== void 0) {
      writer.uint32(66).string(message.language);
    }
    if (message.message !== void 0) {
      writer.uint32(74).string(message.message);
    }
    if (message.isLivelyVoice !== false) {
      writer.uint32(80).bool(message.isLivelyVoice);
    }
    if (message.allowToTranslateVideo !== void 0) {
      writer.uint32(88).bool(message.allowToTranslateVideo);
    }
    if (message.shouldRetry !== void 0) {
      writer.uint32(96).int32(message.shouldRetry);
    }
    if (message.unknown3 !== void 0) {
      writer.uint32(104).int32(message.unknown3);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 17) {
            break;
          }
          message.duration = reader.double();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }
          message.status = reader.int32();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }
          message.remainingTime = reader.int32();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }
          message.unknown0 = reader.int32();
          continue;
        }
        case 7: {
          if (tag !== 58) {
            break;
          }
          message.translationId = reader.string();
          continue;
        }
        case 8: {
          if (tag !== 66) {
            break;
          }
          message.language = reader.string();
          continue;
        }
        case 9: {
          if (tag !== 74) {
            break;
          }
          message.message = reader.string();
          continue;
        }
        case 10: {
          if (tag !== 80) {
            break;
          }
          message.isLivelyVoice = reader.bool();
          continue;
        }
        case 11: {
          if (tag !== 88) {
            break;
          }
          message.allowToTranslateVideo = reader.bool();
          continue;
        }
        case 12: {
          if (tag !== 96) {
            break;
          }
          message.shouldRetry = reader.int32();
          continue;
        }
        case 13: {
          if (tag !== 104) {
            break;
          }
          message.unknown3 = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : void 0,
      duration: isSet(object.duration) ? globalThis.Number(object.duration) : void 0,
      status: isSet(object.status) ? globalThis.Number(object.status) : 0,
      remainingTime: isSet(object.remainingTime) ? globalThis.Number(object.remainingTime) : void 0,
      unknown0: isSet(object.unknown0) ? globalThis.Number(object.unknown0) : void 0,
      translationId: isSet(object.translationId) ? globalThis.String(object.translationId) : "",
      language: isSet(object.language) ? globalThis.String(object.language) : void 0,
      message: isSet(object.message) ? globalThis.String(object.message) : void 0,
      isLivelyVoice: isSet(object.isLivelyVoice) ? globalThis.Boolean(object.isLivelyVoice) : false,
      allowToTranslateVideo: isSet(object.allowToTranslateVideo) ? globalThis.Boolean(object.allowToTranslateVideo) : void 0,
      shouldRetry: isSet(object.shouldRetry) ? globalThis.Number(object.shouldRetry) : void 0,
      unknown3: isSet(object.unknown3) ? globalThis.Number(object.unknown3) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== void 0) {
      obj.url = message.url;
    }
    if (message.duration !== void 0) {
      obj.duration = message.duration;
    }
    if (message.status !== 0) {
      obj.status = Math.round(message.status);
    }
    if (message.remainingTime !== void 0) {
      obj.remainingTime = Math.round(message.remainingTime);
    }
    if (message.unknown0 !== void 0) {
      obj.unknown0 = Math.round(message.unknown0);
    }
    if (message.translationId !== "") {
      obj.translationId = message.translationId;
    }
    if (message.language !== void 0) {
      obj.language = message.language;
    }
    if (message.message !== void 0) {
      obj.message = message.message;
    }
    if (message.isLivelyVoice !== false) {
      obj.isLivelyVoice = message.isLivelyVoice;
    }
    if (message.allowToTranslateVideo !== void 0) {
      obj.allowToTranslateVideo = message.allowToTranslateVideo;
    }
    if (message.shouldRetry !== void 0) {
      obj.shouldRetry = Math.round(message.shouldRetry);
    }
    if (message.unknown3 !== void 0) {
      obj.unknown3 = Math.round(message.unknown3);
    }
    return obj;
  },
  create(base) {
    return VideoTranslationResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationResponse();
    message.url = object.url ?? void 0;
    message.duration = object.duration ?? void 0;
    message.status = object.status ?? 0;
    message.remainingTime = object.remainingTime ?? void 0;
    message.unknown0 = object.unknown0 ?? void 0;
    message.translationId = object.translationId ?? "";
    message.language = object.language ?? void 0;
    message.message = object.message ?? void 0;
    message.isLivelyVoice = object.isLivelyVoice ?? false;
    message.allowToTranslateVideo = object.allowToTranslateVideo ?? void 0;
    message.shouldRetry = object.shouldRetry ?? void 0;
    message.unknown3 = object.unknown3 ?? void 0;
    return message;
  }
};
function createBaseVideoTranslationCacheItem() {
  return { status: 0, remainingTime: void 0, message: void 0, unknown0: void 0, flags: [] };
}
var VideoTranslationCacheItem = {
  encode(message, writer = new BinaryWriter()) {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    if (message.remainingTime !== void 0) {
      writer.uint32(16).int32(message.remainingTime);
    }
    if (message.message !== void 0) {
      writer.uint32(26).string(message.message);
    }
    if (message.unknown0 !== void 0) {
      writer.uint32(32).int32(message.unknown0);
    }
    writer.uint32(42).fork();
    for (const v of message.flags) {
      writer.int32(v);
    }
    writer.join();
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationCacheItem();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.status = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }
          message.remainingTime = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }
          message.message = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }
          message.unknown0 = reader.int32();
          continue;
        }
        case 5: {
          if (tag === 40) {
            message.flags.push(reader.int32());
            continue;
          }
          if (tag === 42) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.flags.push(reader.int32());
            }
            continue;
          }
          break;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      status: isSet(object.status) ? globalThis.Number(object.status) : 0,
      remainingTime: isSet(object.remainingTime) ? globalThis.Number(object.remainingTime) : void 0,
      message: isSet(object.message) ? globalThis.String(object.message) : void 0,
      unknown0: isSet(object.unknown0) ? globalThis.Number(object.unknown0) : void 0,
      flags: globalThis.Array.isArray(object?.flags) ? object.flags.map((e) => globalThis.Number(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.status !== 0) {
      obj.status = Math.round(message.status);
    }
    if (message.remainingTime !== void 0) {
      obj.remainingTime = Math.round(message.remainingTime);
    }
    if (message.message !== void 0) {
      obj.message = message.message;
    }
    if (message.unknown0 !== void 0) {
      obj.unknown0 = Math.round(message.unknown0);
    }
    if (message.flags?.length) {
      obj.flags = message.flags.map((e) => Math.round(e));
    }
    return obj;
  },
  create(base) {
    return VideoTranslationCacheItem.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationCacheItem();
    message.status = object.status ?? 0;
    message.remainingTime = object.remainingTime ?? void 0;
    message.message = object.message ?? void 0;
    message.unknown0 = object.unknown0 ?? void 0;
    message.flags = object.flags?.map((e) => e) || [];
    return message;
  }
};
function createBaseVideoTranslationCacheRequest() {
  return { url: "", duration: 0, language: "", responseLanguage: "" };
}
var VideoTranslationCacheRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.duration !== 0) {
      writer.uint32(17).double(message.duration);
    }
    if (message.language !== "") {
      writer.uint32(26).string(message.language);
    }
    if (message.responseLanguage !== "") {
      writer.uint32(34).string(message.responseLanguage);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationCacheRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 17) {
            break;
          }
          message.duration = reader.double();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }
          message.language = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }
          message.responseLanguage = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      duration: isSet(object.duration) ? globalThis.Number(object.duration) : 0,
      language: isSet(object.language) ? globalThis.String(object.language) : "",
      responseLanguage: isSet(object.responseLanguage) ? globalThis.String(object.responseLanguage) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.duration !== 0) {
      obj.duration = message.duration;
    }
    if (message.language !== "") {
      obj.language = message.language;
    }
    if (message.responseLanguage !== "") {
      obj.responseLanguage = message.responseLanguage;
    }
    return obj;
  },
  create(base) {
    return VideoTranslationCacheRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationCacheRequest();
    message.url = object.url ?? "";
    message.duration = object.duration ?? 0;
    message.language = object.language ?? "";
    message.responseLanguage = object.responseLanguage ?? "";
    return message;
  }
};
function createBaseVideoTranslationCacheResponse() {
  return { default: void 0, cloning: void 0 };
}
var VideoTranslationCacheResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.default !== void 0) {
      VideoTranslationCacheItem.encode(message.default, writer.uint32(10).fork()).join();
    }
    if (message.cloning !== void 0) {
      VideoTranslationCacheItem.encode(message.cloning, writer.uint32(18).fork()).join();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationCacheResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.default = VideoTranslationCacheItem.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.cloning = VideoTranslationCacheItem.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      default: isSet(object.default) ? VideoTranslationCacheItem.fromJSON(object.default) : void 0,
      cloning: isSet(object.cloning) ? VideoTranslationCacheItem.fromJSON(object.cloning) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.default !== void 0) {
      obj.default = VideoTranslationCacheItem.toJSON(message.default);
    }
    if (message.cloning !== void 0) {
      obj.cloning = VideoTranslationCacheItem.toJSON(message.cloning);
    }
    return obj;
  },
  create(base) {
    return VideoTranslationCacheResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationCacheResponse();
    message.default = object.default !== void 0 && object.default !== null ? VideoTranslationCacheItem.fromPartial(object.default) : void 0;
    message.cloning = object.cloning !== void 0 && object.cloning !== null ? VideoTranslationCacheItem.fromPartial(object.cloning) : void 0;
    return message;
  }
};
function createBaseVideoLangCacheRequest() {
  return { url: "", title: "" };
}
var VideoLangCacheRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.title !== "") {
      writer.uint32(18).string(message.title);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoLangCacheRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.title = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      title: isSet(object.title) ? globalThis.String(object.title) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.title !== "") {
      obj.title = message.title;
    }
    return obj;
  },
  create(base) {
    return VideoLangCacheRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoLangCacheRequest();
    message.url = object.url ?? "";
    message.title = object.title ?? "";
    return message;
  }
};
function createBaseVideoLangCacheResponse() {
  return { url: "", status: 0, unknown1: 0 };
}
var VideoLangCacheResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.status !== 0) {
      writer.uint32(24).int32(message.status);
    }
    if (message.unknown1 !== 0) {
      writer.uint32(40).int32(message.unknown1);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoLangCacheResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }
          message.status = reader.int32();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }
          message.unknown1 = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      status: isSet(object.status) ? globalThis.Number(object.status) : 0,
      unknown1: isSet(object.unknown1) ? globalThis.Number(object.unknown1) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.status !== 0) {
      obj.status = Math.round(message.status);
    }
    if (message.unknown1 !== 0) {
      obj.unknown1 = Math.round(message.unknown1);
    }
    return obj;
  },
  create(base) {
    return VideoLangCacheResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoLangCacheResponse();
    message.url = object.url ?? "";
    message.status = object.status ?? 0;
    message.unknown1 = object.unknown1 ?? 0;
    return message;
  }
};
function createBaseAudioBufferObject() {
  return { audioFile: new Uint8Array(0), fileId: "" };
}
var AudioBufferObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.audioFile.length !== 0) {
      writer.uint32(18).bytes(message.audioFile);
    }
    if (message.fileId !== "") {
      writer.uint32(10).string(message.fileId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseAudioBufferObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.audioFile = reader.bytes();
          continue;
        }
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.fileId = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      audioFile: isSet(object.audioFile) ? bytesFromBase64(object.audioFile) : new Uint8Array(0),
      fileId: isSet(object.fileId) ? globalThis.String(object.fileId) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.audioFile.length !== 0) {
      obj.audioFile = base64FromBytes(message.audioFile);
    }
    if (message.fileId !== "") {
      obj.fileId = message.fileId;
    }
    return obj;
  },
  create(base) {
    return AudioBufferObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseAudioBufferObject();
    message.audioFile = object.audioFile ?? new Uint8Array(0);
    message.fileId = object.fileId ?? "";
    return message;
  }
};
function createBasePartialAudioBufferObject() {
  return { audioFile: new Uint8Array(0), chunkId: 0 };
}
var PartialAudioBufferObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.audioFile.length !== 0) {
      writer.uint32(18).bytes(message.audioFile);
    }
    if (message.chunkId !== 0) {
      writer.uint32(8).int32(message.chunkId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBasePartialAudioBufferObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.audioFile = reader.bytes();
          continue;
        }
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.chunkId = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      audioFile: isSet(object.audioFile) ? bytesFromBase64(object.audioFile) : new Uint8Array(0),
      chunkId: isSet(object.chunkId) ? globalThis.Number(object.chunkId) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.audioFile.length !== 0) {
      obj.audioFile = base64FromBytes(message.audioFile);
    }
    if (message.chunkId !== 0) {
      obj.chunkId = Math.round(message.chunkId);
    }
    return obj;
  },
  create(base) {
    return PartialAudioBufferObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBasePartialAudioBufferObject();
    message.audioFile = object.audioFile ?? new Uint8Array(0);
    message.chunkId = object.chunkId ?? 0;
    return message;
  }
};
function createBaseChunkAudioObject() {
  return { audioBuffer: void 0, audioPartsLength: 0, fileId: "", version: 0 };
}
var ChunkAudioObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.audioBuffer !== void 0) {
      PartialAudioBufferObject.encode(message.audioBuffer, writer.uint32(10).fork()).join();
    }
    if (message.audioPartsLength !== 0) {
      writer.uint32(16).int32(message.audioPartsLength);
    }
    if (message.fileId !== "") {
      writer.uint32(26).string(message.fileId);
    }
    if (message.version !== 0) {
      writer.uint32(32).int32(message.version);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseChunkAudioObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.audioBuffer = PartialAudioBufferObject.decode(reader, reader.uint32());
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }
          message.audioPartsLength = reader.int32();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }
          message.fileId = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 32) {
            break;
          }
          message.version = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      audioBuffer: isSet(object.audioBuffer) ? PartialAudioBufferObject.fromJSON(object.audioBuffer) : void 0,
      audioPartsLength: isSet(object.audioPartsLength) ? globalThis.Number(object.audioPartsLength) : 0,
      fileId: isSet(object.fileId) ? globalThis.String(object.fileId) : "",
      version: isSet(object.version) ? globalThis.Number(object.version) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.audioBuffer !== void 0) {
      obj.audioBuffer = PartialAudioBufferObject.toJSON(message.audioBuffer);
    }
    if (message.audioPartsLength !== 0) {
      obj.audioPartsLength = Math.round(message.audioPartsLength);
    }
    if (message.fileId !== "") {
      obj.fileId = message.fileId;
    }
    if (message.version !== 0) {
      obj.version = Math.round(message.version);
    }
    return obj;
  },
  create(base) {
    return ChunkAudioObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseChunkAudioObject();
    message.audioBuffer = object.audioBuffer !== void 0 && object.audioBuffer !== null ? PartialAudioBufferObject.fromPartial(object.audioBuffer) : void 0;
    message.audioPartsLength = object.audioPartsLength ?? 0;
    message.fileId = object.fileId ?? "";
    message.version = object.version ?? 0;
    return message;
  }
};
function createBaseVideoTranslationAudioRequest() {
  return { translationId: "", url: "", partialAudioInfo: void 0, audioInfo: void 0 };
}
var VideoTranslationAudioRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.translationId !== "") {
      writer.uint32(10).string(message.translationId);
    }
    if (message.url !== "") {
      writer.uint32(18).string(message.url);
    }
    if (message.partialAudioInfo !== void 0) {
      ChunkAudioObject.encode(message.partialAudioInfo, writer.uint32(34).fork()).join();
    }
    if (message.audioInfo !== void 0) {
      AudioBufferObject.encode(message.audioInfo, writer.uint32(50).fork()).join();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationAudioRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.translationId = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }
          message.partialAudioInfo = ChunkAudioObject.decode(reader, reader.uint32());
          continue;
        }
        case 6: {
          if (tag !== 50) {
            break;
          }
          message.audioInfo = AudioBufferObject.decode(reader, reader.uint32());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      translationId: isSet(object.translationId) ? globalThis.String(object.translationId) : "",
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      partialAudioInfo: isSet(object.partialAudioInfo) ? ChunkAudioObject.fromJSON(object.partialAudioInfo) : void 0,
      audioInfo: isSet(object.audioInfo) ? AudioBufferObject.fromJSON(object.audioInfo) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.translationId !== "") {
      obj.translationId = message.translationId;
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.partialAudioInfo !== void 0) {
      obj.partialAudioInfo = ChunkAudioObject.toJSON(message.partialAudioInfo);
    }
    if (message.audioInfo !== void 0) {
      obj.audioInfo = AudioBufferObject.toJSON(message.audioInfo);
    }
    return obj;
  },
  create(base) {
    return VideoTranslationAudioRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationAudioRequest();
    message.translationId = object.translationId ?? "";
    message.url = object.url ?? "";
    message.partialAudioInfo = object.partialAudioInfo !== void 0 && object.partialAudioInfo !== null ? ChunkAudioObject.fromPartial(object.partialAudioInfo) : void 0;
    message.audioInfo = object.audioInfo !== void 0 && object.audioInfo !== null ? AudioBufferObject.fromPartial(object.audioInfo) : void 0;
    return message;
  }
};
function createBaseVideoTranslationAudioResponse() {
  return { status: 0, remainingChunks: [] };
}
var VideoTranslationAudioResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.status !== 0) {
      writer.uint32(8).int32(message.status);
    }
    for (const v of message.remainingChunks) {
      writer.uint32(18).string(v);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseVideoTranslationAudioResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.status = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.remainingChunks.push(reader.string());
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      status: isSet(object.status) ? globalThis.Number(object.status) : 0,
      remainingChunks: globalThis.Array.isArray(object?.remainingChunks) ? object.remainingChunks.map((e) => globalThis.String(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.status !== 0) {
      obj.status = Math.round(message.status);
    }
    if (message.remainingChunks?.length) {
      obj.remainingChunks = message.remainingChunks;
    }
    return obj;
  },
  create(base) {
    return VideoTranslationAudioResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseVideoTranslationAudioResponse();
    message.status = object.status ?? 0;
    message.remainingChunks = object.remainingChunks?.map((e) => e) || [];
    return message;
  }
};
function createBaseSubtitlesObject() {
  return {
    language: "",
    url: "",
    hasTranslation: false,
    translatedLanguage: "",
    translatedUrl: "",
    unknown1: false,
    subtitleId: 0
  };
}
var SubtitlesObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.language !== "") {
      writer.uint32(10).string(message.language);
    }
    if (message.url !== "") {
      writer.uint32(18).string(message.url);
    }
    if (message.hasTranslation !== false) {
      writer.uint32(24).bool(message.hasTranslation);
    }
    if (message.translatedLanguage !== "") {
      writer.uint32(34).string(message.translatedLanguage);
    }
    if (message.translatedUrl !== "") {
      writer.uint32(42).string(message.translatedUrl);
    }
    if (message.unknown1 !== false) {
      writer.uint32(48).bool(message.unknown1);
    }
    if (message.subtitleId !== 0) {
      writer.uint32(56).uint32(message.subtitleId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSubtitlesObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.language = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }
          message.hasTranslation = reader.bool();
          continue;
        }
        case 4: {
          if (tag !== 34) {
            break;
          }
          message.translatedLanguage = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 42) {
            break;
          }
          message.translatedUrl = reader.string();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }
          message.unknown1 = reader.bool();
          continue;
        }
        case 7: {
          if (tag !== 56) {
            break;
          }
          message.subtitleId = reader.uint32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      language: isSet(object.language) ? globalThis.String(object.language) : "",
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      hasTranslation: isSet(object.hasTranslation) ? globalThis.Boolean(object.hasTranslation) : false,
      translatedLanguage: isSet(object.translatedLanguage) ? globalThis.String(object.translatedLanguage) : "",
      translatedUrl: isSet(object.translatedUrl) ? globalThis.String(object.translatedUrl) : "",
      unknown1: isSet(object.unknown1) ? globalThis.Boolean(object.unknown1) : false,
      subtitleId: isSet(object.subtitleId) ? globalThis.Number(object.subtitleId) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.language !== "") {
      obj.language = message.language;
    }
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.hasTranslation !== false) {
      obj.hasTranslation = message.hasTranslation;
    }
    if (message.translatedLanguage !== "") {
      obj.translatedLanguage = message.translatedLanguage;
    }
    if (message.translatedUrl !== "") {
      obj.translatedUrl = message.translatedUrl;
    }
    if (message.unknown1 !== false) {
      obj.unknown1 = message.unknown1;
    }
    if (message.subtitleId !== 0) {
      obj.subtitleId = Math.round(message.subtitleId);
    }
    return obj;
  },
  create(base) {
    return SubtitlesObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubtitlesObject();
    message.language = object.language ?? "";
    message.url = object.url ?? "";
    message.hasTranslation = object.hasTranslation ?? false;
    message.translatedLanguage = object.translatedLanguage ?? "";
    message.translatedUrl = object.translatedUrl ?? "";
    message.unknown1 = object.unknown1 ?? false;
    message.subtitleId = object.subtitleId ?? 0;
    return message;
  }
};
function createBaseSubtitlesRequest() {
  return { url: "", language: "" };
}
var SubtitlesRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.language !== "") {
      writer.uint32(18).string(message.language);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSubtitlesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.language = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      language: isSet(object.language) ? globalThis.String(object.language) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.language !== "") {
      obj.language = message.language;
    }
    return obj;
  },
  create(base) {
    return SubtitlesRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubtitlesRequest();
    message.url = object.url ?? "";
    message.language = object.language ?? "";
    return message;
  }
};
function createBaseSubtitlesResponse() {
  return { waiting: false, subtitles: [] };
}
var SubtitlesResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.waiting !== false) {
      writer.uint32(8).bool(message.waiting);
    }
    for (const v of message.subtitles) {
      SubtitlesObject.encode(v, writer.uint32(18).fork()).join();
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseSubtitlesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.waiting = reader.bool();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.subtitles.push(SubtitlesObject.decode(reader, reader.uint32()));
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      waiting: isSet(object.waiting) ? globalThis.Boolean(object.waiting) : false,
      subtitles: globalThis.Array.isArray(object?.subtitles) ? object.subtitles.map((e) => SubtitlesObject.fromJSON(e)) : []
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.waiting !== false) {
      obj.waiting = message.waiting;
    }
    if (message.subtitles?.length) {
      obj.subtitles = message.subtitles.map((e) => SubtitlesObject.toJSON(e));
    }
    return obj;
  },
  create(base) {
    return SubtitlesResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseSubtitlesResponse();
    message.waiting = object.waiting ?? false;
    message.subtitles = object.subtitles?.map((e) => SubtitlesObject.fromPartial(e)) || [];
    return message;
  }
};
function createBaseStreamTranslationObject() {
  return { url: "", timestamp: "" };
}
var StreamTranslationObject = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.timestamp !== "") {
      writer.uint32(18).string(message.timestamp);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStreamTranslationObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.timestamp = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      timestamp: isSet(object.timestamp) ? globalThis.String(object.timestamp) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.timestamp !== "") {
      obj.timestamp = message.timestamp;
    }
    return obj;
  },
  create(base) {
    return StreamTranslationObject.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStreamTranslationObject();
    message.url = object.url ?? "";
    message.timestamp = object.timestamp ?? "";
    return message;
  }
};
function createBaseStreamTranslationRequest() {
  return { url: "", language: "", responseLanguage: "", unknown0: 0, unknown1: 0 };
}
var StreamTranslationRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.url !== "") {
      writer.uint32(10).string(message.url);
    }
    if (message.language !== "") {
      writer.uint32(18).string(message.language);
    }
    if (message.responseLanguage !== "") {
      writer.uint32(26).string(message.responseLanguage);
    }
    if (message.unknown0 !== 0) {
      writer.uint32(40).int32(message.unknown0);
    }
    if (message.unknown1 !== 0) {
      writer.uint32(48).int32(message.unknown1);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStreamTranslationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.url = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.language = reader.string();
          continue;
        }
        case 3: {
          if (tag !== 26) {
            break;
          }
          message.responseLanguage = reader.string();
          continue;
        }
        case 5: {
          if (tag !== 40) {
            break;
          }
          message.unknown0 = reader.int32();
          continue;
        }
        case 6: {
          if (tag !== 48) {
            break;
          }
          message.unknown1 = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      url: isSet(object.url) ? globalThis.String(object.url) : "",
      language: isSet(object.language) ? globalThis.String(object.language) : "",
      responseLanguage: isSet(object.responseLanguage) ? globalThis.String(object.responseLanguage) : "",
      unknown0: isSet(object.unknown0) ? globalThis.Number(object.unknown0) : 0,
      unknown1: isSet(object.unknown1) ? globalThis.Number(object.unknown1) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.url !== "") {
      obj.url = message.url;
    }
    if (message.language !== "") {
      obj.language = message.language;
    }
    if (message.responseLanguage !== "") {
      obj.responseLanguage = message.responseLanguage;
    }
    if (message.unknown0 !== 0) {
      obj.unknown0 = Math.round(message.unknown0);
    }
    if (message.unknown1 !== 0) {
      obj.unknown1 = Math.round(message.unknown1);
    }
    return obj;
  },
  create(base) {
    return StreamTranslationRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStreamTranslationRequest();
    message.url = object.url ?? "";
    message.language = object.language ?? "";
    message.responseLanguage = object.responseLanguage ?? "";
    message.unknown0 = object.unknown0 ?? 0;
    message.unknown1 = object.unknown1 ?? 0;
    return message;
  }
};
function createBaseStreamTranslationResponse() {
  return { interval: 0, translatedInfo: void 0, pingId: void 0 };
}
var StreamTranslationResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.interval !== 0) {
      writer.uint32(8).int32(message.interval);
    }
    if (message.translatedInfo !== void 0) {
      StreamTranslationObject.encode(message.translatedInfo, writer.uint32(18).fork()).join();
    }
    if (message.pingId !== void 0) {
      writer.uint32(24).int32(message.pingId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStreamTranslationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.interval = reader.int32();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.translatedInfo = StreamTranslationObject.decode(reader, reader.uint32());
          continue;
        }
        case 3: {
          if (tag !== 24) {
            break;
          }
          message.pingId = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      interval: isSet(object.interval) ? streamIntervalFromJSON(object.interval) : 0,
      translatedInfo: isSet(object.translatedInfo) ? StreamTranslationObject.fromJSON(object.translatedInfo) : void 0,
      pingId: isSet(object.pingId) ? globalThis.Number(object.pingId) : void 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.interval !== 0) {
      obj.interval = streamIntervalToJSON(message.interval);
    }
    if (message.translatedInfo !== void 0) {
      obj.translatedInfo = StreamTranslationObject.toJSON(message.translatedInfo);
    }
    if (message.pingId !== void 0) {
      obj.pingId = Math.round(message.pingId);
    }
    return obj;
  },
  create(base) {
    return StreamTranslationResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStreamTranslationResponse();
    message.interval = object.interval ?? 0;
    message.translatedInfo = object.translatedInfo !== void 0 && object.translatedInfo !== null ? StreamTranslationObject.fromPartial(object.translatedInfo) : void 0;
    message.pingId = object.pingId ?? void 0;
    return message;
  }
};
function createBaseStreamPingRequest() {
  return { pingId: 0 };
}
var StreamPingRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.pingId !== 0) {
      writer.uint32(8).int32(message.pingId);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseStreamPingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 8) {
            break;
          }
          message.pingId = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return { pingId: isSet(object.pingId) ? globalThis.Number(object.pingId) : 0 };
  },
  toJSON(message) {
    const obj = {};
    if (message.pingId !== 0) {
      obj.pingId = Math.round(message.pingId);
    }
    return obj;
  },
  create(base) {
    return StreamPingRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseStreamPingRequest();
    message.pingId = object.pingId ?? 0;
    return message;
  }
};
function createBaseYandexSessionRequest() {
  return { uuid: "", module: "" };
}
var YandexSessionRequest = {
  encode(message, writer = new BinaryWriter()) {
    if (message.uuid !== "") {
      writer.uint32(10).string(message.uuid);
    }
    if (message.module !== "") {
      writer.uint32(18).string(message.module);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseYandexSessionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.uuid = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 18) {
            break;
          }
          message.module = reader.string();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      uuid: isSet(object.uuid) ? globalThis.String(object.uuid) : "",
      module: isSet(object.module) ? globalThis.String(object.module) : ""
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.uuid !== "") {
      obj.uuid = message.uuid;
    }
    if (message.module !== "") {
      obj.module = message.module;
    }
    return obj;
  },
  create(base) {
    return YandexSessionRequest.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseYandexSessionRequest();
    message.uuid = object.uuid ?? "";
    message.module = object.module ?? "";
    return message;
  }
};
function createBaseYandexSessionResponse() {
  return { secretKey: "", expires: 0 };
}
var YandexSessionResponse = {
  encode(message, writer = new BinaryWriter()) {
    if (message.secretKey !== "") {
      writer.uint32(10).string(message.secretKey);
    }
    if (message.expires !== 0) {
      writer.uint32(16).int32(message.expires);
    }
    return writer;
  },
  decode(input, length) {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === void 0 ? reader.len : reader.pos + length;
    const message = createBaseYandexSessionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1: {
          if (tag !== 10) {
            break;
          }
          message.secretKey = reader.string();
          continue;
        }
        case 2: {
          if (tag !== 16) {
            break;
          }
          message.expires = reader.int32();
          continue;
        }
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },
  fromJSON(object) {
    return {
      secretKey: isSet(object.secretKey) ? globalThis.String(object.secretKey) : "",
      expires: isSet(object.expires) ? globalThis.Number(object.expires) : 0
    };
  },
  toJSON(message) {
    const obj = {};
    if (message.secretKey !== "") {
      obj.secretKey = message.secretKey;
    }
    if (message.expires !== 0) {
      obj.expires = Math.round(message.expires);
    }
    return obj;
  },
  create(base) {
    return YandexSessionResponse.fromPartial(base ?? {});
  },
  fromPartial(object) {
    const message = createBaseYandexSessionResponse();
    message.secretKey = object.secretKey ?? "";
    message.expires = object.expires ?? 0;
    return message;
  }
};
function bytesFromBase64(b64) {
  if (globalThis.Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}
function base64FromBytes(arr) {
  if (globalThis.Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}
function isSet(value) {
  return value !== null && value !== void 0;
}

// node_modules/@vot.js/shared/dist/types/helpers/bannedvideo.js
var TypeName;
(function(TypeName2) {
  TypeName2["Channel"] = "Channel";
  TypeName2["Video"] = "Video";
})(TypeName || (TypeName = {}));

// node_modules/@vot.js/shared/dist/utils/utils.js
async function fetchWithTimeout(url, options = {
  headers: {
    "User-Agent": config_default.userAgent
  }
}) {
  let { timeout = 3e3, signal, ...fetchOptions } = options;
  if (!signal && (!timeout || timeout <= 0)) {
    return await fetch(url, fetchOptions);
  }
  signal ??= AbortSignal.timeout(timeout);
  return await fetch(url, {
    ...fetchOptions,
    signal
  });
}
function getTimestamp() {
  return Math.floor(Date.now() / 1e3);
}

// node_modules/@vot.js/shared/dist/secure.js
var { componentVersion, chromiumRevision } = config_default;
async function getCrypto() {
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto;
  }
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }
  return globalThis.crypto;
}
var utf8Encoder = new TextEncoder();
async function signHMAC(hashName, hmac, data) {
  const crypto = await getCrypto();
  const key = await crypto.subtle.importKey("raw", utf8Encoder.encode(hmac), { name: "HMAC", hash: { name: hashName } }, false, ["sign", "verify"]);
  return await crypto.subtle.sign("HMAC", key, data);
}
async function getSignature(body) {
  const signature = await signHMAC("SHA-256", config_default.hmac, body);
  return new Uint8Array(signature).reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}
async function getSecYaHeaders(secType, session, body, path) {
  const { secretKey, uuid } = session;
  const token = `${uuid}:${path}:${componentVersion}`;
  const tokenBody = utf8Encoder.encode(token);
  const tokenSign = await getSignature(tokenBody);
  if (secType === "Ya-Summary") {
    return {
      [`X-${secType}-Sk`]: secretKey,
      [`X-${secType}-Token`]: `${tokenSign}:${token}`
    };
  }
  if (!body) {
    throw new TypeError(`Body is required for sec type ${secType}`);
  }
  const sign = await getSignature(body);
  return {
    [`${secType}-Signature`]: sign,
    [`Sec-${secType}-Sk`]: secretKey,
    [`Sec-${secType}-Token`]: `${tokenSign}:${token}`
  };
}
function getUUID() {
  const hexDigits = "0123456789ABCDEF";
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    const randomDigit = Math.floor(Math.random() * 16);
    uuid += hexDigits[randomDigit];
  }
  return uuid;
}
var browserSecHeaders = {
  "sec-ch-ua": `"Chromium";v="152", "Not?A_Brand";v="24", "YaBrowser";v="${componentVersion.slice(0, 5)}", "Yowser";v="2.5"`,
  "sec-ch-ua-full-version-list": `"Chromium";v="152.0.7977.${chromiumRevision}", "Not?A_Brand";v="24.0.0.0", "YaBrowser";v="${componentVersion}", "Yowser";v="2.5"`,
  "Sec-Fetch-Mode": "no-cors"
};

// node_modules/@vot.js/core/dist/providers/base.js
var BaseProvider = class {
  host;
  schema;
  /**
   * If you don't want to use the classic fetch
   * @includeExample examples/with_ofetch.ts[1:13]
   */
  fetch;
  fetchOpts;
  userAgent = config_default.userAgent;
  // default langs
  requestLang;
  responseLang;
  /**
   * Headers for interacting with API
   */
  headers = {
    "User-Agent": this.userAgent,
    "Accept-Language": "en",
    Pragma: "no-cache",
    "Cache-Control": "no-cache"
  };
  hostSchemaRe = /(http(s)?):\/\//;
  constructor({ host = config_default.host, fetchFn = fetchWithTimeout, fetchOpts = {}, headers = {}, requestLang = "en", responseLang = "ru" } = {}) {
    const schema = this.hostSchemaRe.exec(host)?.[1];
    this.host = schema ? host.replace(`${schema}://`, "") : host;
    this.schema = schema ?? "https";
    this.fetch = fetchFn;
    this.fetchOpts = fetchOpts;
    this.headers = { ...this.headers, ...headers };
    this.requestLang = requestLang;
    this.responseLang = responseLang;
  }
  /**
   * The standard method for requesting the Yandex API, if necessary, you can override how it is done in the example
   * @includeExample examples/with_axios.ts[4:41]
   */
  async request(path, body, headers = {}, method = "POST", fetchOpts = {}) {
    const options = this.getOpts(new Blob([body]), headers, method, fetchOpts);
    try {
      const res = await this.fetch(`${this.schema}://${this.host}${path}`, options);
      const data = await res.arrayBuffer();
      return {
        success: res.status === 200,
        data
      };
    } catch (err) {
      return {
        success: false,
        data: err?.message
      };
    }
  }
  async requestJSON(path, body = null, headers = {}, method = "POST", fetchOpts = {}) {
    const options = this.getOpts(body, {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
    }, method, fetchOpts);
    try {
      const res = await this.fetch(`${this.schema}://${this.host}${path}`, options);
      const data = await res.json();
      return {
        success: res.status === 200,
        data
      };
    } catch (err) {
      return {
        success: false,
        data: err?.message
      };
    }
  }
  getOpts(body, headers = {}, method = "POST", fetchOpts = {}) {
    return {
      method,
      headers: {
        ...this.headers,
        ...headers
      },
      body,
      ...this.fetchOpts,
      ...fetchOpts
    };
  }
};

// node_modules/@vot.js/core/dist/utils/videoData.js
var isCustomLink = (url) => {
  return !!/\.(m3u8|m4(a|v)|mpd)/.exec(url);
};

// node_modules/@vot.js/core/dist/protobuf.js
function encodeTranslationRequest(url, duration, requestLang, responseLang, translationHelp, { forceSourceLang = false, wasStream = false, videoTitle = "", bypassCache = false, useLivelyVoice = false, firstRequest = true } = {}) {
  return VideoTranslationRequest.encode({
    url,
    firstRequest,
    duration,
    unknown0: true,
    language: requestLang,
    forceSourceLang,
    unknown1: false,
    translationHelp: translationHelp ?? [],
    responseLanguage: responseLang,
    wasStream,
    unknown2: true,
    configVersion: 2,
    bypassCache,
    useLivelyVoice,
    videoTitle
  }).finish();
}
function decodeTranslationResponse(response) {
  return VideoTranslationResponse.decode(new Uint8Array(response));
}
function encodeTranslationCacheRequest(url, duration, requestLang, responseLang) {
  return VideoTranslationCacheRequest.encode({
    url,
    duration,
    language: requestLang,
    responseLanguage: responseLang
  }).finish();
}
function decodeTranslationCacheResponse(response) {
  return VideoTranslationCacheResponse.decode(new Uint8Array(response));
}
function isPartialAudioBuffer(audioBuffer) {
  return "chunkId" in audioBuffer;
}
function encodeTranslationAudioRequest(url, translationId, audioBuffer, partialAudio) {
  if (partialAudio && isPartialAudioBuffer(audioBuffer)) {
    return VideoTranslationAudioRequest.encode({
      url,
      translationId,
      partialAudioInfo: {
        ...partialAudio,
        audioBuffer
      }
    }).finish();
  }
  return VideoTranslationAudioRequest.encode({
    url,
    translationId,
    audioInfo: audioBuffer
  }).finish();
}
function decodeTranslationAudioResponse(response) {
  return VideoTranslationAudioResponse.decode(new Uint8Array(response));
}
function encodeSubtitlesRequest(url, requestLang) {
  return SubtitlesRequest.encode({
    url,
    language: requestLang
  }).finish();
}
function decodeSubtitlesResponse(response) {
  return SubtitlesResponse.decode(new Uint8Array(response));
}
function encodeStreamPingRequest(pingId) {
  return StreamPingRequest.encode({
    pingId
  }).finish();
}
function encodeStreamRequest(url, requestLang, responseLang) {
  return StreamTranslationRequest.encode({
    url,
    language: requestLang,
    responseLanguage: responseLang,
    unknown0: 1,
    unknown1: 0
  }).finish();
}
function decodeStreamResponse(response) {
  return StreamTranslationResponse.decode(new Uint8Array(response));
}
function encodeVideoLangCacheRequest(url, title) {
  return VideoLangCacheRequest.encode({
    url,
    title
  }).finish();
}
function decodeVideoLangCacheResponse(response) {
  return VideoLangCacheResponse.decode(new Uint8Array(response));
}
var YandexVOTProtobuf = {
  encodeTranslationRequest,
  decodeTranslationResponse,
  encodeTranslationCacheRequest,
  decodeTranslationCacheResponse,
  isPartialAudioBuffer,
  encodeTranslationAudioRequest,
  decodeTranslationAudioResponse,
  encodeSubtitlesRequest,
  decodeSubtitlesResponse,
  encodeStreamPingRequest,
  encodeStreamRequest,
  decodeStreamResponse,
  encodeVideoLangCacheRequest,
  decodeVideoLangCacheResponse
};
function encodeSessionRequest(uuid, module) {
  return YandexSessionRequest.encode({
    uuid,
    module
  }).finish();
}
function decodeSessionResponse(response) {
  return YandexSessionResponse.decode(new Uint8Array(response));
}
var YandexSessionProtobuf = {
  encodeSessionRequest,
  decodeSessionResponse
};

// node_modules/@vot.js/core/dist/types/providers/yandex.js
var VideoTranslationStatus;
(function(VideoTranslationStatus2) {
  VideoTranslationStatus2[VideoTranslationStatus2["FAILED"] = 0] = "FAILED";
  VideoTranslationStatus2[VideoTranslationStatus2["FINISHED"] = 1] = "FINISHED";
  VideoTranslationStatus2[VideoTranslationStatus2["WAITING"] = 2] = "WAITING";
  VideoTranslationStatus2[VideoTranslationStatus2["LONG_WAITING"] = 3] = "LONG_WAITING";
  VideoTranslationStatus2[VideoTranslationStatus2["PART_CONTENT"] = 5] = "PART_CONTENT";
  VideoTranslationStatus2[VideoTranslationStatus2["AUDIO_REQUESTED"] = 6] = "AUDIO_REQUESTED";
  VideoTranslationStatus2[VideoTranslationStatus2["SESSION_REQUIRED"] = 7] = "SESSION_REQUIRED";
})(VideoTranslationStatus || (VideoTranslationStatus = {}));
var AudioDownloadType;
(function(AudioDownloadType2) {
  AudioDownloadType2["WEB_API_VIDEO_SRC_FROM_IFRAME"] = "web_api_video_src_from_iframe";
  AudioDownloadType2["WEB_API_VIDEO_SRC"] = "web_api_video_src";
  AudioDownloadType2["WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME"] = "web_api_get_all_generating_urls_data_from_iframe";
  AudioDownloadType2["WEB_API_GET_ALL_GENERATING_URLS_DATA_FROM_IFRAME_TMP_EXP"] = "web_api_get_all_generating_urls_data_from_iframe_tmp_exp";
  AudioDownloadType2["WEB_API_REPLACED_FETCH_INSIDE_IFRAME"] = "web_api_replaced_fetch_inside_iframe";
  AudioDownloadType2["ANDROID_API"] = "android_api";
  AudioDownloadType2["WEB_API_SLOW"] = "web_api_slow";
  AudioDownloadType2["WEB_API_STEAL_SIG_AND_N"] = "web_api_steal_sig_and_n";
  AudioDownloadType2["WEB_API_COMBINED"] = "web_api_get_all_generating_urls_data_from_iframe,web_api_steal_sig_and_n";
  AudioDownloadType2["WEB_ABR"] = "web_abr";
  AudioDownloadType2["WEB_SABR"] = "web_sabr";
  AudioDownloadType2["WEB_MSE_PROXY"] = "web_mse_proxy";
  AudioDownloadType2["EMPTY_PLUG"] = "empty_plug";
})(AudioDownloadType || (AudioDownloadType = {}));

// node_modules/@vot.js/core/dist/providers/yandex.js
var YandexProvider = class extends BaseProvider {
  /**
   * Headers for interacting with Yandex API
   */
  headers = {
    "User-Agent": this.userAgent,
    Accept: "application/x-protobuf",
    "Accept-Language": "en",
    "Content-Type": "application/x-protobuf",
    Pragma: "no-cache",
    "Cache-Control": "no-cache"
  };
  paths = {
    videoTranslation: "/video-translation/translate",
    videoTranslationFailAudio: "/video-translation/fail-audio-js",
    videoTranslationAudio: "/video-translation/audio",
    videoTranslationCache: "/video-translation/cache",
    videoSubtitles: "/video-subtitles/get-subtitles",
    streamPing: "/stream-translation/ping-stream",
    streamTranslation: "/stream-translation/translate-stream"
  };
  sessions = {};
  apiToken;
  constructor({ apiToken, ...baseOpts } = {}) {
    super(baseOpts);
    this.apiToken = apiToken;
  }
  get apiTokenHeader() {
    if (!this.apiToken) {
      return {};
    }
    return {
      // idk it's bug or not, but thanks who left it <3
      Authorization: `OAuth ${this.apiToken}`
    };
  }
  mergeHeaders(...headers) {
    return Object.assign({}, ...headers);
  }
  async getSession(module) {
    const timestamp = getTimestamp();
    const session = this.sessions[module];
    if (session && session.timestamp + session.expires > timestamp) {
      return session;
    }
    const { secretKey, expires, uuid } = await this.createSession(module);
    this.sessions[module] = {
      secretKey,
      expires,
      timestamp,
      uuid
    };
    return this.sessions[module];
  }
  async createSession(module) {
    const uuid = getUUID();
    const body = YandexSessionProtobuf.encodeSessionRequest(uuid, module);
    const res = await this.request("/session/create", body, this.mergeHeaders({
      "Vtrans-Signature": await getSignature(body)
    }));
    if (!res.success) {
      throw new VOTJSError("Failed to request create session", res);
    }
    const sessionResponse = YandexSessionProtobuf.decodeSessionResponse(res.data);
    return {
      ...sessionResponse,
      uuid
    };
  }
  async requestVtransFailAudio(url, fetchOpts = {}) {
    const res = await this.requestJSON(this.paths.videoTranslationFailAudio, JSON.stringify({
      video_url: url
    }), this.mergeHeaders({
      Accept: "application/json"
    }), "PUT", fetchOpts);
    if (!res.data || typeof res.data === "string" || res.data.status !== 1) {
      throw new VOTJSError("Failed to request to fake video translation fail audio js", res);
    }
    return res;
  }
  async translateVideo({ videoData, requestLang = this.requestLang, responseLang = this.responseLang, translationHelp = null, headers = {}, extraOpts = {}, shouldSendFailedAudio = true, fetchOpts = {} }) {
    const { url, duration = config_default.defaultDuration } = videoData;
    const session = await this.getSession("video-translation");
    const body = YandexVOTProtobuf.encodeTranslationRequest(url, duration, requestLang, responseLang, translationHelp, extraOpts);
    const path = this.paths.videoTranslation;
    const vtransHeaders = await getSecYaHeaders("Vtrans", session, body, path);
    const apiTokenHeader = extraOpts.useLivelyVoice ? this.apiTokenHeader : {};
    const res = await this.request(path, body, this.mergeHeaders(vtransHeaders, apiTokenHeader, headers), void 0, fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request video translation", res);
    }
    const translationData = YandexVOTProtobuf.decodeTranslationResponse(res.data);
    logger_default.log("translateVideo", translationData);
    const { status, translationId } = translationData;
    switch (status) {
      case VideoTranslationStatus.FAILED:
        throw new VOTJSError("Yandex couldn't translate video", translationData);
      case VideoTranslationStatus.FINISHED:
      case VideoTranslationStatus.PART_CONTENT:
        if (!translationData.url) {
          throw new VOTJSError("Audio link wasn't received from Yandex response", translationData);
        }
        return {
          translationId,
          translated: true,
          url: translationData.url,
          status,
          remainingTime: translationData.remainingTime ?? -1
        };
      case VideoTranslationStatus.WAITING:
      case VideoTranslationStatus.LONG_WAITING:
        return {
          translationId,
          translated: false,
          status,
          remainingTime: translationData.remainingTime ?? -1
        };
      case VideoTranslationStatus.AUDIO_REQUESTED:
        if (url.startsWith("https://youtu.be/") && shouldSendFailedAudio) {
          await this.requestVtransFailAudio(url, fetchOpts);
          await this.requestVtransAudio(url, translationData.translationId, {
            audioFile: new Uint8Array(0),
            fileId: `fallback-empty-audio:video-translation:${videoData.videoId}`
          }, void 0, void 0, fetchOpts);
          return await this.translateVideo({
            videoData,
            requestLang,
            responseLang,
            translationHelp,
            headers,
            extraOpts,
            shouldSendFailedAudio: false,
            fetchOpts
          });
        }
        return {
          translationId,
          translated: false,
          status,
          remainingTime: translationData.remainingTime ?? -1
        };
      case VideoTranslationStatus.SESSION_REQUIRED:
        throw new VOTJSError("Yandex auth required to translate video. See docs for more info", translationData);
      default:
        logger_default.error("Unknown response", translationData);
        throw new VOTJSError("Unknown response from Yandex", translationData);
    }
  }
  async requestVtransAudio(url, translationId, audioBuffer, partialAudio, headers = {}, fetchOpts = {}) {
    const session = await this.getSession("video-translation");
    let body;
    if (YandexVOTProtobuf.isPartialAudioBuffer(audioBuffer)) {
      if (!partialAudio) {
        throw new VOTJSError("Partial audio metadata is required for partial audio buffer", audioBuffer);
      }
      body = YandexVOTProtobuf.encodeTranslationAudioRequest(url, translationId, audioBuffer, partialAudio);
    } else {
      body = YandexVOTProtobuf.encodeTranslationAudioRequest(url, translationId, audioBuffer, void 0);
    }
    const path = this.paths.videoTranslationAudio;
    const vtransHeaders = await getSecYaHeaders("Vtrans", session, body, path);
    const res = await this.request(path, body, this.mergeHeaders(vtransHeaders, headers), "PUT", fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request video translation audio", res);
    }
    return YandexVOTProtobuf.decodeTranslationAudioResponse(res.data);
  }
  async getSubtitles({ videoData, requestLang = this.requestLang, headers = {}, fetchOpts = {} }) {
    const { url } = videoData;
    const session = await this.getSession("video-translation");
    const body = YandexVOTProtobuf.encodeSubtitlesRequest(url, requestLang);
    const path = this.paths.videoSubtitles;
    const vsubsHeaders = await getSecYaHeaders("Vsubs", session, body, path);
    const res = await this.request(path, body, this.mergeHeaders(vsubsHeaders, headers), void 0, fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request video subtitles", res);
    }
    const subtitlesData = YandexVOTProtobuf.decodeSubtitlesResponse(res.data);
    const subtitles = subtitlesData.subtitles.map((subtitle) => {
      const { language, url: url2, translatedLanguage, translatedUrl } = subtitle;
      return {
        language,
        url: url2,
        translatedLanguage,
        translatedUrl
      };
    });
    return {
      waiting: subtitlesData.waiting,
      subtitles
    };
  }
  /**
   * @includeExample examples/stream.ts[7:44]
   */
  async pingStream({ pingId, headers = {}, fetchOpts = {} }) {
    const session = await this.getSession("video-translation");
    const body = YandexVOTProtobuf.encodeStreamPingRequest(pingId);
    const path = this.paths.streamPing;
    const vtransHeaders = await getSecYaHeaders("Vtrans", session, body, path);
    const res = await this.request(path, body, this.mergeHeaders(vtransHeaders, headers), void 0, fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request stream ping", res);
    }
    return true;
  }
  /**
   * @includeExample examples/stream.ts[7:44]
   */
  async translateStream({ videoData, requestLang = this.requestLang, responseLang = this.responseLang, headers = {}, fetchOpts = {} }) {
    const { url } = videoData;
    if (isCustomLink(url)) {
      throw new VOTJSError("Unsupported video URL for getting stream translation");
    }
    const session = await this.getSession("video-translation");
    const body = YandexVOTProtobuf.encodeStreamRequest(url, requestLang, responseLang);
    const path = this.paths.streamTranslation;
    const vtransHeaders = await getSecYaHeaders("Vtrans", session, body, path);
    const res = await this.request(path, body, this.mergeHeaders(vtransHeaders, headers), void 0, fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request stream translation", res);
    }
    const translateResponse = YandexVOTProtobuf.decodeStreamResponse(res.data);
    const interval = translateResponse.interval;
    switch (interval) {
      case StreamInterval.NO_CONNECTION:
      case StreamInterval.TRANSLATING:
        return {
          translated: false,
          interval,
          message: interval === StreamInterval.NO_CONNECTION ? "streamNoConnectionToServer" : "translationTakeFewMinutes"
        };
      case StreamInterval.STREAMING: {
        if (translateResponse.pingId === void 0) {
          throw new VOTJSError("Stream ping id wasn't received from Yandex response", translateResponse);
        }
        if (!translateResponse.translatedInfo) {
          throw new VOTJSError("Stream translation info wasn't received from Yandex response", translateResponse);
        }
        return {
          translated: true,
          interval,
          pingId: translateResponse.pingId,
          result: translateResponse.translatedInfo
        };
      }
      default:
        logger_default.error("Unknown response", translateResponse);
        throw new VOTJSError("Unknown response from Yandex", translateResponse);
    }
  }
  async translateVideoCache({ videoData, requestLang = this.requestLang, responseLang = this.responseLang, headers = {}, fetchOpts = {} }) {
    const { url, duration = config_default.defaultDuration } = videoData;
    const session = await this.getSession("video-translation");
    const body = YandexVOTProtobuf.encodeTranslationCacheRequest(url, duration, requestLang, responseLang);
    const path = this.paths.videoTranslationCache;
    const vtransHeaders = await getSecYaHeaders("Vtrans", session, body, path);
    const res = await this.request(path, body, this.mergeHeaders(vtransHeaders, headers), "POST", fetchOpts);
    if (!res.success) {
      throw new VOTJSError("Failed to request video translation cache", res);
    }
    return YandexVOTProtobuf.decodeTranslationCacheResponse(res.data);
  }
};

// node_modules/@vot.js/core/dist/client.js
var VOTJSError = class extends Error {
  data;
  constructor(message, data = void 0) {
    super(message);
    this.data = data;
    this.name = "VOTJSError";
  }
};
var VOTClient = class {
  provider;
  constructor({ provider, host, fetchFn, fetchOpts, requestLang = "en", responseLang = "ru", apiToken, headers } = {}) {
    const ProviderClass = provider ?? YandexProvider;
    this.provider = new ProviderClass({
      host,
      fetchFn,
      fetchOpts,
      headers,
      apiToken,
      requestLang,
      responseLang
    });
  }
  async translateVideo(opts) {
    return await this.provider.translateVideo(opts);
  }
  async translateStream(opts) {
    return await this.provider.translateStream(opts);
  }
  async getSubtitles(opts) {
    return await this.provider.getSubtitles(opts);
  }
  get requestLang() {
    return this.provider.requestLang;
  }
  set requestLang(lang) {
    this.provider.requestLang = lang;
  }
  get responseLang() {
    return this.provider.responseLang;
  }
  set responseLang(lang) {
    this.provider.responseLang = lang;
  }
};

// node_modules/@vot.js/core/dist/providers/votworker.js
var VOTNextWorkerProvider = class extends YandexProvider {
  constructor(opts = {}) {
    opts.host = opts.host ?? config_default.hostWorker;
    super(opts);
  }
  mergeHeaders(...headers) {
    const data = Object.assign({}, this.headers, ...headers);
    try {
      return {
        "User-Agent": `vot.js/${config_default.version}`,
        "X-VOT-Headers": btoa(JSON.stringify(data))
      };
    } catch {
      throw new VOTJSError("Failed to encode headers for VOT Worker request");
    }
  }
};

// src/cf-translate-fn.js
function normalizeVideoInput(rawInput) {
  let input = (rawInput || "").trim();
  if (!input) {
    throw new Error("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0432\u0438\u0434\u0435\u043E YouTube");
  }
  const urlMatch = input.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    input = urlMatch[0];
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    input = `https://www.youtube.com/watch?v=${input}`;
  } else if (!/^https?:\/\//i.test(input)) {
    input = `https://${input}`;
  }
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0441\u0441\u044B\u043B\u043A\u0438 \u043D\u0430 \u0432\u0438\u0434\u0435\u043E");
  }
  let youtubeId = null;
  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (host === "youtu.be") {
    youtubeId = parsed.pathname.split("/").filter(Boolean)[0] || null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      youtubeId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/v/")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      youtubeId = parts[1] || null;
    }
  }
  if (youtubeId) {
    youtubeId = youtubeId.substring(0, 11);
    return {
      normalizedUrl: `https://youtu.be/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId
    };
  }
  throw new Error("\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0432\u0438\u0434\u0435\u043E YouTube");
}
async function fetchYouTubeMeta(youtubeId) {
  if (!youtubeId) return null;
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(
      youtubeId
    )}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || `YouTube \u0432\u0438\u0434\u0435\u043E (${youtubeId})`,
      author: data.author_name || "YouTube",
      thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    };
  } catch {
    return {
      title: `YouTube \u0432\u0438\u0434\u0435\u043E (${youtubeId})`,
      author: "YouTube",
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    };
  }
}
async function fetchSubtitleCues(subtitlesList, responseLang = "ru") {
  if (!Array.isArray(subtitlesList) || subtitlesList.length === 0) {
    return { availableTracks: [], cues: [] };
  }
  const targetTrack = subtitlesList.find((s) => s.translatedLanguage === responseLang) || subtitlesList.find((s) => s.language === responseLang) || subtitlesList[0];
  if (!targetTrack) {
    return { availableTracks: subtitlesList, cues: [] };
  }
  try {
    const [transRes, origRes] = await Promise.all([
      targetTrack.translatedUrl ? fetch(targetTrack.translatedUrl).then((r) => r.ok ? r.json() : null) : Promise.resolve(null),
      targetTrack.url ? fetch(targetTrack.url).then((r) => r.ok ? r.json() : null) : Promise.resolve(null)
    ]);
    const transSubs = transRes?.subtitles || [];
    const origSubs = origRes?.subtitles || [];
    const cues = transSubs.map((item, idx) => {
      const origMatch = origSubs[idx] && Math.abs((origSubs[idx].startMs || 0) - (item.startMs || 0)) < 2500 ? origSubs[idx] : origSubs.find(
        (o) => Math.abs((o.startMs || 0) - (item.startMs || 0)) < 1500
      );
      return {
        text: item.text || "",
        origText: origMatch ? origMatch.text || "" : "",
        startMs: item.startMs || 0,
        durationMs: item.durationMs || 2e3,
        endMs: (item.startMs || 0) + (item.durationMs || 2e3),
        speakerId: item.speakerId || "0"
      };
    });
    return {
      availableTracks: subtitlesList.map((s) => ({
        language: s.language,
        translatedLanguage: s.translatedLanguage
      })),
      sourceLang: targetTrack.language,
      targetLang: targetTrack.translatedLanguage,
      cues
    };
  } catch {
    return { availableTracks: [], cues: [] };
  }
}
async function fetchYouTubeInfo(youtubeId) {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${youtubeId}&hl=en`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (!res.ok) return { duration: null };
    const html = await res.text();
    const m = html.match(/"lengthSeconds":"(\d+)"/) || html.match(/"approxDurationMs":"(\d+)"/);
    let duration = null;
    if (m) {
      const n = Number(m[1]);
      duration = m[0].includes("approx") ? Math.round(n / 1e3) : n;
    }
    return { duration };
  } catch {
    return { duration: null };
  }
}
function humanizeError(err) {
  const msg = err && err.message || "";
  if (/create session/i.test(msg)) {
    return "\u042F\u043D\u0434\u0435\u043A\u0441 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B (\u0441\u0435\u0441\u0441\u0438\u044F). \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438\xBB \u0435\u0449\u0451 \u0440\u0430\u0437 \u0447\u0435\u0440\u0435\u0437 \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434.";
  }
  if (/too long|длин/i.test(msg)) {
    return "\u0412\u0438\u0434\u0435\u043E \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0434\u043B\u0438\u043D\u043D\u043E\u0435 \u2014 \u042F\u043D\u0434\u0435\u043A\u0441 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0438\u0442 \u0432\u0438\u0434\u0435\u043E \u0434\u043E ~4 \u0447\u0430\u0441\u043E\u0432.";
  }
  if (/live|стрим|трансляц/i.test(msg)) {
    return "\u041F\u0440\u044F\u043C\u044B\u0435 \u0442\u0440\u0430\u043D\u0441\u043B\u044F\u0446\u0438\u0438 \u042F\u043D\u0434\u0435\u043A\u0441 \u043D\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0438\u0442.";
  }
  if (/couldn't translate|не смог перевести/i.test(msg)) {
    return "\u042D\u0442\u043E \u0432\u0438\u0434\u0435\u043E \u0435\u0449\u0451 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0432 \u043E\u0431\u043B\u0430\u0447\u043D\u0443\u044E \u0431\u0430\u0437\u0443 \u042F\u043D\u0434\u0435\u043A\u0441\u0430 (YouTube \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0438\u043B \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0430\u0443\u0434\u0438\u043E\u0434\u043E\u0440\u043E\u0436\u043A\u0438 \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u0430). \u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C: \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u044D\u0442\u0443 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 1 \u043C\u0438\u043D\u0443\u0442\u0443 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 \u042F\u043D\u0434\u0435\u043A\u0441 \u0411\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0432\u0438\u0434\u0435\u043E\xBB \u2014 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442 \u0430\u0443\u0434\u0438\u043E \u0432 \u043E\u0431\u043B\u0430\u043A\u043E \u042F\u043D\u0434\u0435\u043A\u0441\u0430, \u043F\u043E\u0441\u043B\u0435 \u0447\u0435\u0433\u043E \u0432\u0438\u0434\u0435\u043E \u0441\u0440\u0430\u0437\u0443 \u0437\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0437\u0434\u0435\u0441\u044C \u0441 0% \u0437\u0432\u0443\u043A\u0430 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u0430!";
  }
  return msg ? `\u042F\u043D\u0434\u0435\u043A\u0441 \u043D\u0435 \u0441\u043C\u043E\u0433 \u043F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0432\u0438\u0434\u0435\u043E: ${msg}` : "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0432\u0438\u0434\u0435\u043E \u043E\u0442 \u042F\u043D\u0434\u0435\u043A\u0441\u0430";
}
async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json; charset=utf-8"
  };
  let firstErr = null;
  try {
    const body = await context.request.json();
    const {
      url,
      requestLang = "en",
      responseLang = "ru",
      isPolling = false
    } = body || {};
    const { normalizedUrl, watchUrl, youtubeId } = normalizeVideoInput(url);
    const [ytInfo, meta] = await Promise.all([
      fetchYouTubeInfo(youtubeId),
      fetchYouTubeMeta(youtubeId)
    ]);
    const videoData = {
      url: normalizedUrl,
      videoId: youtubeId,
      host: "youtube",
      duration: ytInfo.duration || 343
    };
    let client = new VOTClient({ provider: YandexProvider });
    const translateWithClient = async (vot, curLang = requestLang, bypassCache = false) => {
      const extraOpts = {
        firstRequest: !isPolling,
        bypassCache
      };
      try {
        return await vot.translateVideo({
          videoData,
          requestLang: curLang,
          responseLang,
          translationHelp: null,
          shouldSendFailedAudio: !isPolling,
          extraOpts
        });
      } catch (err) {
        if (err.message && err.message.includes("fake video translation fail audio")) {
          return await vot.translateVideo({
            videoData,
            requestLang: curLang,
            responseLang,
            translationHelp: null,
            shouldSendFailedAudio: false,
            extraOpts
          });
        }
        throw err;
      }
    };
    let translationRes;
    for (let attempt = 0; attempt < 3 && !translationRes; attempt++) {
      try {
        if (attempt > 0) client = new VOTClient({ provider: YandexProvider });
        const useBypass = attempt === 1 && firstErr?.message && /couldn't translate/i.test(firstErr.message);
        translationRes = await translateWithClient(
          client,
          requestLang,
          useBypass
        );
      } catch (e) {
        firstErr = firstErr || e;
        await new Promise((r) => setTimeout(r, 700));
      }
    }
    if (!translationRes && firstErr?.data?.language && firstErr.data.language !== requestLang) {
      try {
        client = new VOTClient({ provider: YandexProvider });
        translationRes = await translateWithClient(
          client,
          firstErr.data.language
        );
      } catch {
      }
    }
    if (!translationRes) {
      try {
        client = new VOTClient({ provider: VOTNextWorkerProvider });
        translationRes = await translateWithClient(client);
      } catch {
        throw new Error(humanizeError(firstErr));
      }
    }
    const subsRes = await client.getSubtitles({ videoData, requestLang }).catch(() => ({ waiting: false, subtitles: [] }));
    const subtitleData = await fetchSubtitleCues(
      subsRes?.subtitles || [],
      responseLang
    );
    const proxiedAudioUrl = translationRes.url ? `/api/audio?url=${encodeURIComponent(
      translationRes.url
    )}&videoId=${encodeURIComponent(youtubeId)}` : null;
    return new Response(
      JSON.stringify({
        success: true,
        video: {
          videoId: youtubeId,
          host: "youtube",
          url: watchUrl,
          normalizedUrl,
          title: meta?.title || `YouTube (${youtubeId})`,
          author: meta?.author || "YouTube",
          thumbnail: meta?.thumbnail || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
        },
        translation: {
          translated: Boolean(translationRes.translated),
          status: translationRes.status,
          remainingTime: typeof translationRes.remainingTime === "number" ? translationRes.remainingTime : -1,
          translationId: translationRes.translationId || null,
          rawAudioUrl: translationRes.url || null,
          audioUrl: translationRes.url || proxiedAudioUrl,
          downloadUrl: proxiedAudioUrl ? `${proxiedAudioUrl}&download=1` : null
        },
        subtitles: subtitleData
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0432\u0438\u0434\u0435\u043E \u043E\u0442 \u042F\u043D\u0434\u0435\u043A\u0441\u0430",
        debug: {
          firstErrMsg: firstErr?.message,
          firstErrData: firstErr?.data,
          errData: err?.data
        }
      }),
      { status: 400, headers: corsHeaders }
    );
  }
}
export {
  onRequestOptions,
  onRequestPost
};
