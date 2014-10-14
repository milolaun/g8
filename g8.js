/**
 * github.com/bucaran/g8
 *
 * Logic gates via closures in JS.
 *
 * @copyright (c) 2014 Jorge Bucaran
 * @license MIT
 */
module.exports = g8 = {
  /*
   * Unfortunately, simulating memory realistically performs poorly, since
   * every register in the cluster must be read to write only one. Voltage
   * variations in the real world propagate almost instantenously, whereas
   * every cell of an array must be addressed in this simulation. Another
   * possible bottleneck is the adder logic that uses a full adder on every
   * bit of two string buffers. In order to enjoy this simulation and keep
   * one's sanity the turbo mode is enabled by default. Try setting this
   * to false yourself if you feel unhurried.
   *
   * @type {Boolean}
   */
   turbo: true,
  /*
   *
   * The clock signal is used by the DFF to enable / disable it. This in turn
   * propagates across all sequential circuits in the library. Real world
   * computer clocks syncronize circuits, which due to physical constraints,
   * operate at slightly different speeds. One could naively conclude that
   * sequential systems run as fast as their slowest circuit part. In this
   * simulation, circuits execute orderly and syncronously so the clock is
   * enabled by default. A more complex simulation could run all the logic
   * asynchronously and use the clock cycle to syncronize the system.
   *
   * @type {String}
   */
  _clock: '1'
};
/**
 * Toggles the state of the clock.
 *
 * @return {String} State of the clock 0 or 1.
 */
g8.tick = function() {
  return g8._clock = (g8._clock === '0' ? '1' : '0');
};
/**
 * Returns an array of width length filled with @value.
 *
 * @param {Number} width
 * @param {String} value 1-bit binary number
 * @return {Array}
 */
g8.bus = function(width, value) {
  width = width || 1;
  var out = [];
  while (width) out[--width] = value;
  return out;
};
/**
 * Returns a string of 0's of the specified width.
 *
 * @param {Number} width
 * @return {String}
 */
g8.lo = function(width) {
  return g8.bus(width, '0').join('');
};
/**
 * Returns a string of 0s of the specified width where width - 1 is 1.
 *
 * @param {Number} width
 * @return {String}
 */
g8.hi = function(width) {
  var out = g8.bus(width, '0');
  out[out.length - 1] = '1';
  return out.join('');
};
/**
 * Computes a NAND b and returns the resulting string. a and b must be of equal
 * length, but the length can vary. This features propagates across all gates.
 *
 * @param {String} a n-bit binary number
 * @param {String} b n-bit binary number
 * @return {String} n-bit binary number
 * @see en.wikipedia.org/wiki/Logic_gate
 * @see en.wikipedia.org/wiki/NAND_gate
 */
g8.nand = function(a, b) {
  for (var width = a.length, ret = [], i = 0; i < width; i++)
    ret[i] = +!(a[i] & b[i])+'';
  return ret.join('');
};
/**
 * Computes NOT a and returns the resulting string.
 *
 * @param {String} a n-bit binary number
 * @return {String} n-bit binary number
 */
g8.not = function(a) {
  return g8.nand(a, a);
}
/**
 * Computes a AND b and returns the resulting string.
 *
 * @param {String} a n-bit binary number
 * @param {String} b n-bit binary number
 * @return {String} n-bit binary number
 */
g8.and = function(a, b) {
  return g8.not(g8.nand(a, b));
};
/**
 * Computes a OR b and returns the resulting string.
 *
 * @param {String} a n-bit binary number
 * @param {String} b n-bit binary number
 * @return {String} n-bit binary number
 */
g8.or = function(a, b) {
  return g8.nand(g8.not(a), g8.not(b));
};
/**
 * Computes a NOR b and returns the resulting string.
 *
 * @param {String} a n-bit binary number
 * @param {String} b n-bit binary number
 * @return {String} n-bit binary number
 */
g8.nor = function(a, b) {
  return g8.not(g8.or(a, b));
};
/**
 * Returns 1 if at least one bit of the a string is 1, else returns 0.
 *
 * @param {String} a n-bit binary number
 * @return {String} 1-bit binary number
 */
g8.orWay = function(a) {
  for (var width = a.length, i = 0; i < width; i++)
    if (a[i] === '1') return '1';
  return '0';
};
/**
 * Computes a XOR b and returns the resulting string.
 *
 * @param {String} a
 * @param {String} b
 * @return {String} n-bit binary number
 */
g8.xor = function(a, b) {
  return g8.or( g8.and(a, g8.not(b)),
                 g8.and(g8.not(a), b) );
};
/**
 * Implements a multiplexer circuit of variable length inputs. Takes an odd
 * number of arguments where args - 1 is the number of inputs to select one
 * from. The last argument specifies which input to select and its length is
 * the logarithm of base 2 of args-1.
 *
 * This function and g8.dsel were made recursive to provide a simple api when
 * working with systems of variable length IO. The goal of implementing a
 * realistic multiplexer circuit has not been compromised.
 *
 * @param {...String} Inputs and selector address.
 * @return {String} n-bit binary number
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
 * Implements a demultiplexer circuit of variable length inputs. Returns an
 * array of length 2 power @sel.length where @data has been routed (stored)
 * in the position specified by sel in binary.
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
* 1-bit wide sel demultiplexer.
*
* @param {String} data
* @param {String} sel 1-bit binary number
* @param {Array} of length 2
*/
g8.dsel2 = function(data, sel) {
  var sel = g8.bus(data.length, sel);
  return [g8.not(g8.nand(data, g8.not(sel))),
          g8.and(data, sel)];
};
/**
* 2-bit wide sel demultiplexer.
*
* @param {String} data
* @param {String} sel 2-bit binary number
* @param {Array} of length 4
*/
g8.dsel4 = function(data, sel) {
  var abcd = g8.dsel2(data, sel[0]),
        ab = g8.dsel2( abcd[0], sel[1] ),
        cd = g8.dsel2( abcd[1], sel[1] );
  return [ab[0], ab[1], cd[0], cd[1]];
};
/**
* 3-bit wide sel demultiplexer.
*
* @param {String} data
* @param {String} sel 3-bit binary number
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
 * Adds 2 bits and returns an object containing the sum and carry bits.
 *
 * @param {String} a 1-bit binary number
 * @param {String} b 1-bit binary number
 * @return {Object.<String, String>} sum and carry bits.
 * @see en.wikipedia.org/wiki/Adder_(electronics)#Half_adder
 */
g8.halfAdd = function(a, b) {
  return { sum: g8.xor(a, b), carry: g8.and(a, b) };
};
/**
 * Adds 3 bits and returns an object containing the sum and carry bits.
 *
 * @param {String} a 1-bit binary number
 * @param {String} b 1-bit binary number
 * @param {String} c 1-bit binary number
 * @return {Object.<String, String>} sum and carry bits.
 * @see en.wikipedia.org/wiki/Adder_(electronics)#Full_adder
 */
g8.fullAdd = function(a, b, c) {
  a = g8.halfAdd(a, b);
  b = g8.halfAdd(a.sum, c);
  return { sum: b.sum, carry: g8.xor(a.carry, b.carry) };
};
/**
 * Adds 2 variable bit length binary numbers and returns an object containing
 * the sum and carry bits.
 *
 * @param {String} a n-bit binary number
 * @param {String} b n-bit binary number
 * @return {Object.<String, String>} sum and carry bits.
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
 * Adds 1 to @a and returns the resulting binary number.
 *
 * @param {String} a n-bit binary number
 * @return {String} a + 1 as an n-bit binary number
 */
g8.inc = function(a) {
  return g8.add(a, g8.hi(a.length));
};
/**
 * Latches are toggle switches whose outputs are fed back as input to the
 * system. This particular one is an inverted SR latch. If the @set bit is
 * 0 the output will be 1 and will continue to be 1 until reset is set to
 * 0 in which case the output will be latched to again, this time to 0.
 * The latch doesn't remember its last input, it simply appears to do so,
 * because its output is continually fed back to itself.
 *
 * @param {String}
 * @return {String} 1-bit binary number
 * @see en.wikipedia.org/wiki/Flip-flop_(electronics)#SR_NAND_latch
 */
g8.latch = function() {
  var out = g8.lo();
  return function(set, reset) {
    return out = g8.nand(set, g8.nand(out, reset));
  }
};
/**
 * Data flip flops may be as well one of the cleverest inventions of the 20th
 * century. It adds a second level of nand gates to the inverted latch to re
 * invert it and an enable bit to control the system. The interesting part is
 * using a regular clock signal to enable / disable the flip flop. The result
 * is that circuits keep their previous state while the clock is down giving
 * slower circuits time to catch up with the faster ones. The system doesn't
 * deactivate while the clock is down, circuits keep their state ignoring
 * any invalid data produced while the system stabilizes.
 *
 * Flip flops are the central piece of memory, feeding the dff's output data
 * as an input to itself and using the clock to enable / disable the circuit.
 *
 * For a more thorough and robust explanation refer to the 3rd chapter of The
 * Elements of Computing Sience at nand2tetris.org and read the Time Matters
 * section.
 *
 * g8.dff returns a closure that takes a 1-bit binary number @data to set to
 * the internal latch and returns it.
 *
 * @param {String} data
 * @return {String} data if _clock==1, else its last output
 *
 * @see www.nand2tetris.org/chapters/chapter%2003.pdf
 * @see en.wikipedia.org/wiki/Flip-flop_(electronics)#Gated_D_latch
 */
g8.dff = function() {
  var latch = g8.latch();
  return function(data) {
    return latch(g8.nand(data, g8._clock), //set
                 g8.nand(g8.not(data), g8._clock)); //reset
  }
};
/**
 * Stores @data in the internal dff if @load is 1, else returns the data
 * previously stored.
 *
 * @param {String} data 1-bit binary number
 * @param {String} load 1-bit binary number
 * @return {String} 1-bit binary number
 */
g8.bit = function() {
  var out = g8.lo(), dff = g8.dff();
  return function(data, load) {
    return out = dff(g8.sel(out, data, load));
  };
};
/**
 * Creates a width-lenght array of bit registers and stores each bit of @data
 * if @load is 1, else returns the data previously stored.
 *
 * @param {String} width Number of bits of the word
 * @param {String} data width-bit binary number
 * @param {String} load 1-bit binary number
 * @return {String} width-bit binary number
 */
g8.word = function(width) {
  for (var bits = [], ret = [], i = 0; i < width; i++)
    bits[i] = g8.bit(); // new 1-bit register word
  return function(data, load) {
    for (var i = 0; i < width; i++)
      ret[i] = bits[i](data[i], load);
    return ret.join('');
  };
};
/**
 * A counter is similar to a word register with two extra arguments @inc and
 * @reset. If @inc is set, adds +1 to the stored data unless @load is set. If
 * @reset is set, the stored data is set to 0. The precedence order is as
 * follows: reset > load > inc.
 *
 * @param {String} data n-bit binary number
 * @param {String} load 1-bit binary number
 * @param {String} inc 1-bit binary number
 * @param {String} reset 1-bit binary number
 * @return {String} n-bit binary number
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
 * Implements a cluster of n-bit word registers, AKA RAM. @data is stored in
 * @address if @load is 1, else returns the data previously stored in @address.
 *
 * @param {Number} width Size of each register
 * @param {Number} count Number of total registers
 * @param {String} data n-bit binary number
 * @param {String} address log2(count)-bit address
 * @param {String} load If 1 @data is saved in @address.
 * @return {String} n-bit binary number @data in @address.
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
