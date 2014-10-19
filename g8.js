/**
 * github.com/bucaran/g8
 *
 * Logic gates via closures in JS.
 *
 * @copyright (c) 2014 Jorge Bucaran
 * @license MIT
 */
var g8 = module.exports = {
  /**
   * Every register in a memory cluster is read, but only one is written.
   * Voltage variations in the real world propagate almost instantaneously,
   * whereas every cell of an array must be addressed in the simulation.
   * In order to keep one's sanity leave turbo mode enabled by default,
   * but try setting it to false if you feel unhurried.
   *
   * @type {Boolean}
   */
   turbo: true,
  /**
   * Due to physical constraints, real world sequential circuits operate at
   * different speeds. Clock signals are used to synchronize these systems.
   * Circuits here execute orderly, and auto-feeback is done via closures.
   * A multi-threaded simulation running several interdependent circuits
   * asynchronously could use this flag to syncronize the system.
   *
   * @private
   * @type {String}
   */
  _clock: '1'
};
/**
 * Toggle the clock signal. Return the clock state.
 *
 * @return {String}
 */
g8.tick = function() {
  return g8._clock = (g8._clock === '0' ? '1' : '0');
};
/**
 * Create a width-length array filled with value.
 *
 * @param {Number} width Length of the bus.
 * @param {String} value 1-bit binary number.
 * @return {Array}
 */
g8.bus = function(width, value) {
  width = width || 1;
  var out = [];
  while (width) out[--width] = value;
  return out;
};
/**
 * Return a logic 0 of width-length.
 *
 * @param {Number} width
 * @return {String}
 */
g8.lo = function(width) {
  return (1 === width) ? '0' : g8.bus(width, '0').join('');
};
/**
 * Return a logic 1 of width-length.
 *
 * @param {Number} width
 * @return {String}
 */
g8.hi = function(width) {
  if (1 === width) return '1';
  var out = g8.bus(width, '0');
  return out[out.length - 1] = '1', out.join('');
};
/**
 * Compute !(a & b) where a and b are binary numbers of equal N-length.
 * This behavior propagates consistently across other gates built upon
 * NAND gates. If b is undefined compute !(!(a₀ & a₁) ... & aᵢ).
 *
 * @param {String} a N-bit binary number.
 * @param {String} b N-bit binary number.
 * @return {String} N-bit binary number.
 * @see en.wikipedia.org/wiki/Logic_gate
 * @see en.wikipedia.org/wiki/NAND_gate
 */
g8.nand = function(a, b) {
  if (a && b) {
    for (var width = a.length, ret = [], i = 0; i < width; i++)
      ret[i] = a[i] & b[i] ? '0' : '1';
    return ret.join('');
  } else if (a) {
    return a.indexOf('0') < 0 ? '0' : '1';
  }
};
/**
 * Compute !a.
 *
 * @param {String} a N-bit binary number.
 * @return {String} N-bit binary number.
 */
g8.not = function(a) {
  return g8.nand(a, a);
}
/**
 * Compute a & b.
 *
 * @param {String} a N-bit binary number.
 * @param {String} b N-bit binary number.
 * @return {String} N-bit binary number.
 */
g8.and = function(a, b) {
  return g8.not(g8.nand(a, b));
};
/**
 * Compute a | b.
 *
 * @param {String} a N-bit binary number.
 * @param {String} b N-bit binary number.
 * @return {String} N-bit binary number.
 */
g8.or = function(a, b) {
  return g8.nand(g8.not(a), g8.not(b));
};
/**
 * Compute !(a | b).
 *
 * @param {String} a N-bit binary number.
 * @param {String} b N-bit binary number.
 * @return {String} N-bit binary number.
 */
g8.nor = function(a, b) {
  return g8.not(g8.or(a, b));
};
/*
 * Compute a ^ b.
 *
 * @param {String} a
 * @param {String} b
 * @return {String} N-bit binary number.
 */
g8.xor = function(a, b) {
  return g8.or( g8.and(a, g8.not(b)),
                 g8.and(g8.not(a), b) );
};
/**
 * N-length multiplexer. Use a variadic array and a log2(args-1)-wide flag to
 * filter only one of the inputs.
 *
 * @note This function and g8.dsel were made recursive to provide a simple API
 * when working with systems of variable length IO.
 *
 * @param {...String} Inputs and selector flag.
 * @return {String} N-bit binary number.
 * @see en.wikipedia.org/wiki/Multiplexer#Digital_multiplexers
 */
g8.sel = function() {
  var args = [].slice.call(arguments, 0),
       sel = args[args.length-1];
  if (args.length > 3) {
    var half = (args.length-1) / 2,
          hi = args.slice(0, half),
          lo = args.slice(half, args.length-1);

    hi[hi.length] = lo[lo.length] = sel.slice(1);
    return g8.sel(g8.sel.apply(0, hi),
                     g8.sel.apply(0, lo), sel[0]);
  } else {
    sel = g8.bus(args[0].length, sel);
    return g8.nand(g8.nand(g8.not(sel), args[0]),
                      g8.nand(args[1], sel));
  }
};
/**
 * N-length demultiplexer. Return a 2^sel.length-wide array with data at index
 * parseInt(sel).
 *
 * @param {String} data
 * @param {String} sel
 * @return {Array} of length 2^sel.length
 * @see en.wikipedia.org/wiki/Multiplexer#Digital_demultiplexers
 */
g8.dsel = function(data, sel) {
  if (sel.length > 1) {
    var hilo = g8.dsel(data, sel[0]),
          hi = g8.dsel(hilo[0], sel.slice(1)),
          lo = g8.dsel(hilo[1], sel.slice(1)),
        half = Math.pow(2, sel.length) / 2,
         ret = [];

    for (var i = 0; i < half; i++)
      ret[i] = hi[i], ret[i+half] = lo[i];
    return ret;
  } else {
    sel = g8.bus(data.length, sel);
    return [g8.not(g8.nand(data, g8.not(sel))), g8.and(data, sel)];
  }
};
/**
* Fixed 1-bit demultiplexer. Route data to index 0 or 1 of array.
*
* @param {String} data
* @param {String} sel 1-bit binary number.
* @param {Array} of length 2
*/
g8.dsel2 = function(data, sel) {
  var sel = g8.bus(data.length, sel);
  return [g8.not(g8.nand(data, g8.not(sel))),
          g8.and(data, sel)];
};
/**
* Fixed 2-bit demultiplexer. Route data to index 0..3 of output array.
*
* @param {String} data
* @param {String} sel 2-bit binary number.
* @param {Array} of length 4
*/
g8.dsel4 = function(data, sel) {
  var abcd = g8.dsel2(data, sel[0]),
        ab = g8.dsel2( abcd[0], sel[1] ),
        cd = g8.dsel2( abcd[1], sel[1] );
  return [ab[0], ab[1], cd[0], cd[1]];
};
/**
* Fixed 3-bit demultiplexer. Route data to index 0..7 of output array.
*
* @param {String} data
* @param {String} sel 3-bit binary number.
* @param {Array} of length 8
*/
g8.dsel8 = function(data, sel) {
  var a_h = g8.dsel2(data, sel[0]),
      a_d = g8.dsel4(a_h[0], sel[1] + sel[2]),
      e_h = g8.dsel4(a_h[1], sel[1] + sel[2]);
  return [a_d[0], a_d[1], a_d[2], a_d[3],
          e_h[0], e_h[1], e_h[2], e_h[3]];
};
/**
 * Compute a + b, where a and b are 1-bit binary numbers. Return the sum and
 * carry bits.
 *
 * @param {String} a 1-bit binary number.
 * @param {String} b 1-bit binary number.
 * @return {String} obj.sum Result of a + b.
 * @return {String} obj.carry Carry over bit.
 * @see en.wikipedia.org/wiki/Adder_(electronics)#Half_adder
 */
g8.halfAdd = function(a, b) {
  return { sum: g8.xor(a, b), carry: g8.and(a, b) };
};
/**
 * Compute a + b + c, where a, b and c are 1-bit binary numbers. Return the
 * sum and carry bits.
 *
 * @param {String} a 1-bit binary number.
 * @param {String} b 1-bit binary number.
 * @param {String} c 1-bit binary number.
 * @return {String} obj.sum Result of a + b + c.
 * @return {String} obj.carry Carry over bit.
 * @see en.wikipedia.org/wiki/Adder_(electronics)#Full_adder
 */
g8.fullAdd = function(a, b, c) {
  a = g8.halfAdd(a, b);
  b = g8.halfAdd(a.sum, c);
  return { sum: b.sum, carry: g8.xor(a.carry, b.carry) };
};
/**
 * Compute a + b, where a and b are N-length binary numbers.
 *
 * @param {String} a N-bit binary number.
 * @param {String} b N-bit binary number.
 * @return {String} sum.
 * @see en.wikipedia.org/wiki/Adder_(electronics)#Ripple-carry_adder
 */
g8.add = function(a, b) {
  if (g8.turbo) {
    var ret = (parseInt(a, 2) + parseInt(b, 2)).toString(2),
        len = a.length - ret.length;
    return (len > 0) ? g8.lo(len) + ret : ret.slice(-len);
  } else {
    var width = a.length, carry = '0', ret = [], obj;
    while(width--) {
      obj = g8.fullAdd(a[width], b[width], carry);
      ret[width] = obj.sum;
      carry = obj.carry;
    }
    return ret.join('');
  }
};
/**
 * Compute a + 1.
 *
 * @param {String} a N-length binary number.
 * @return {String}
 */
g8.inc = function(a) {
  return g8.add(a, g8.hi(a.length));
};
/**
 * Inverted SR Latch. Latches are toggle switches whose outputs are fed as
 * inputs to itself. If set is 0, the output will be latched to 1, and the
 * latch will continue to output 1 unless reset is set to 0, that latches
 * the output to 0. This behavior causes the latch to store its last input.
 *
 * @param {String}
 * @return {String} 1-bit binary number.
 * @see en.wikipedia.org/wiki/Flip-flop_(electronics)#SR_NAND_latch
 */
g8.latch = function() {
  var out = g8.lo();
  return function(set, reset) {
    return out = g8.nand(set, g8.nand(out, reset));
  }
};
/**
 * Store 1-bit of data. Enable / disable via the clock signal.
 *
 * @param {String} data
 * @return {String} data if _clock == 1, else its last input.
 *
 * @see www.nand2tetris.org/chapters/chapter%2003.pdf
 * @see en.wikipedia.org/wiki/Flip-flop_(electronics)#Gated_D_latch
 */
g8.dff = function() {
  var latch = g8.latch();
  return function(data) {
    return latch(g8.nand(data, g8._clock),          //set
                 g8.nand(g8.not(data), g8._clock)); //reset
  }
};
/**
 * Store 1-bit of data if load is 1, else return the previous data.
 *
 * @param {String} data 1-bit binary number.
 * @param {String} load 1-bit binary number.
 * @return {String} 1-bit binary number.
 */
g8.bit = function() {
  var out = g8.lo(), dff = g8.dff();
  return function(data, load) {
    if (g8.turbo) {
      return out = load === '1' ? data : out;
    } else {
      return out = dff(g8.sel(out, data, load));
    }
  };
};
/**
 * Store N-length data if load is 1, else return the previous data.
 *
 * @param {String} width Size of the word in bits.
 * @param {String} data N-length binary number.
 * @param {String} load 1-bit binary number.
 * @return {String} N-length binary number.
 */
g8.word = function(width) {
  for (var bits = [], ret = [], i = 0; i < width; i++)
    bits[i] = g8.bit(); // new 1-bit register
  return function(data, load) {
    for (var i = 0; i < width; i++)
      ret[i] = bits[i](data[i], load);
    return ret.join('');
  };
};
/**
 * Increment, load or reset the counter. If inc is 1, counter++. If load is 1,
 * let counter = data. If reset is 1, counter = 0. From above, the precedence
 * is: reset > load > inc.
 *
 * @param {String} data N-length binary number.
 * @param {String} load 1-bit binary number.
 * @param {String} inc 1-bit binary number.
 * @param {String} reset 1-bit binary number.
 * @return {String}
 */
g8.counter = function() {
  var word, next;
  return function(data, load, inc, reset) {
    if (!word) word = g8.word(data.length), next = g8.lo(data.length);
    next = g8.sel(next, g8.inc(next), inc);
    next = g8.sel(next, data, load);
    next = g8.sel(next, g8.lo(data.length), reset);
    return next = word(next, g8.hi());
  };
};
/**
 * N-length word cluster. Store data to address if load is 1, else return the
 * previous data.
 *
 * @param {Number} width Register size.
 * @param {Number} count Register number.
 * @param {String} data N-bit binary number.
 * @param {String} address log2(count)-bit binary address.
 * @param {String} load Enable flag.
 * @return {String}
 */
g8.cluster = function(width, count) {
  for (var cluster = [], i = 0; i < count; i++)
    cluster[i] = g8.word(width);
  return function(data, address, load) {
    if (g8.turbo)
      return cluster[parseInt(address, 2)](data, load);
    load = g8.dsel(load, address), ret = [];
    for (var i = 0; i < count; i++)
      ret[i] = cluster[i](data, load[i]);
    ret[ret.length] = address;
    return g8.sel.apply(0, ret);
  };
};
