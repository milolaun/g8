/*!
 *  github.com/bucaran/g8
 *
 *  Logic gates via closures in JS.
 *
 *  (c) 2014 Jorge Bucaran
 */
module.exports = Gates = {
  /**
   */
  turbo: true, // enabled by default
  /**
   */
  clock: '1', // enabled by default
};
/**
 */
Gates.tick = function() {
  return Gates.clock = (Gates.clock === '0' ? '1' : '0');
};
/**
 */
Gates.bus = function(width, value) {
  width = width || 1;
  var out = [];
  while (width) out[--width] = value;
  return out;
};
/**
 * Returns a string of  0's of the specified witdh size.
 * @param {Number} width
 * @return {String}
 */
Gates.lo = function(width) {
  return Gates.bus(width, '0').join('');
};
/**
 */
Gates.hi = function(width) {
  var out = Gates.bus(width, '0');
  out[out.length-1] = '1';
  return out.join('');
};
/**
 */
Gates.nand = function(a, b) {
  for (var width = a.length, ret = [], i = 0; i < width; i++)
    ret[i] = +!(a[i] & b[i])+'';
  return ret.join('');
};
/**
 */
Gates.not = function(a) {
  return Gates.nand(a, a);
}
/**
 */
Gates.and = function(a, b) {
  return Gates.not(Gates.nand(a, b));
};
/**
 */
Gates.or = function(a, b) {
  return Gates.nand(Gates.not(a), Gates.not(b));
};
/**
 */
Gates.nor = function(a, b) {
  return Gates.not(Gates.or(a, b));
};
/**
 */
Gates.orWay = function(a) {
  for (var width = a.length, i = 0; i < width; i++)
    if (a[i] === '1') return a[i];
  return '0';
};
/**
 */
Gates.xor = function(a, b) {
  return Gates.or( Gates.and(a, Gates.not(b)),
                 Gates.and(Gates.not(a), b) );
};
/**
 */
Gates.nxor = function(a, b) {
  return Gates.not(Gates.xor(a, b));
};
/**
 */
Gates.sel = function() {
  var args = [].slice.call(arguments, 0),
       sel = args[args.length-1];
  if (args.length > 3) {
    var half = (args.length-1) / 2,
          hi = args.slice(0, half),
          lo = args.slice(half, args.length-1);

    hi[hi.length] = lo[lo.length] = sel.slice(1);
    return Gates.sel(Gates.sel.apply(0, hi),
                     Gates.sel.apply(0, lo), sel[0]);
  } else {
    sel = Gates.bus(args[0].length, sel);
    return Gates.nand(Gates.nand(Gates.not(sel), args[0]),
                      Gates.nand(args[1], sel));
  }
};
/**
 */
Gates.dsel = function(data, sel) {
  if (sel.length > 1) {
    var hilo = Gates.dsel(data, sel[0]),
          hi = Gates.dsel(hilo[0], sel.slice(1)),
          lo = Gates.dsel(hilo[1], sel.slice(1)),
        half = Math.pow(2, sel.length) / 2,
         ret = [];

    for (var i = 0; i < half; i++)
      ret[i] = hi[i], ret[i+half] = lo[i];
    return ret;
  } else {
    sel = Gates.bus(data.length, sel);
    return [Gates.not(Gates.nand(data, Gates.not(sel))), Gates.and(data, sel)];
  }
};
/**
 */
Gates.dsel2 = function(data, sel) {
  var sel = Gates.bus(data.length, sel);
  return [Gates.not(Gates.nand(data, Gates.not(sel))),
          Gates.and(data, sel)];
};
/**
 */
Gates.dsel4 = function(data, sel) {
  var abcd = Gates.dsel2(data, sel[0]),
        ab = Gates.dsel2( abcd[0], sel[1] ),
        cd = Gates.dsel2( abcd[1], sel[1] );
  return [ab[0], ab[1], cd[0], cd[1]];
};
/**
 */
Gates.dsel8 = function(data, sel) {
  var a_h = Gates.dsel2(data, sel[0]),
      a_d = Gates.dsel4(a_h[0], sel[1] + sel[2]),
      e_h = Gates.dsel4(a_h[1], sel[1] + sel[2]);
  return [a_d[0], a_d[1], a_d[2], a_d[3],
          e_h[0], e_h[1], e_h[2], e_h[3]];
};
/**
 */
Gates.halfAdd = function(a, b) { // 1-bit
  return { sum: Gates.xor(a, b), carry: Gates.and(a, b) };
};
/**
 */
Gates.fullAdd = function(a, b, c) { // 1-bit
  a = Gates.halfAdd(a, b);
  b = Gates.halfAdd(a.sum, c);
  return { sum: b.sum, carry: Gates.xor(a.carry, b.carry) };
};
/**
 */
Gates.add = function(a, b) {
  if (Gates.turbo) {
    var ret = (parseInt(a, 2) + parseInt(b, 2)).toString(2),
        len = a.length - ret.length;
    return (len > 0) ? Gates.lo(len) + ret : ret.slice(-len);
  } else {
    var width = a.length, carry = '0', ret = [], obj;
    while(width--) {
      obj = Gates.fullAdd(a[width], b[width], carry);
      ret[width] = obj.sum;
      carry = obj.carry;
    }
    return ret.join('');
  }
};
/**
 */
Gates.inc = function(a) {
  return Gates.add(a, Gates.hi(a.length));
};
/**
 */
Gates.latch = function(out) {
  return function(set, reset) {
    return out = Gates.nand(set, Gates.nand(out, reset));
  }
};
/**
 */
Gates.dff = function() {
  var latch = Gates.latch(Gates.lo());
  return function(data) {
    return latch(Gates.nand(data, Gates.clock), //set
                 Gates.nand(Gates.not(data), Gates.clock)); //reset
  }
};
/**
 */
Gates.bit = function() {
  var out = Gates.lo(), dff = Gates.dff(); // new dff
  return function(data, load) {
    return out = dff(Gates.sel(out, data, load));
  };
};
/**
 */
Gates.word = function(width) {
  for (var bits = [], ret = [], i = 0; i < width; i++)
    bits[i] = Gates.bit(); // new 1-bit register
  return function(data, load) {
    for (var i = 0; i < width; i++)
      ret[i] = bits[i](data[i], load);
    return ret.join('');
  };
};
//
//
Gates.cluster = function(width, count) {
  for (var cluster = [], i = 0; i < count; i++)
    cluster[i] = Gates.word(width);
  return function(data, address, load) {
    if (Gates.turbo)
      return cluster[parseInt(address, 2)](data, load);
    load = Gates.dsel(load, address), ret = [];
    for (var i = 0; i < count; i++)
      ret[i] = cluster[i](data, load[i]);
    ret[ret.length] = address;
    return Gates.sel.apply(0, ret);
  };
};
/**
 */
Gates.counter = function() {
  var word, next;
  return function(data, load, inc, reset) {
    if (!word) word = Gates.word(data.length), next = Gates.lo(data.length);
    next = Gates.sel(next, Gates.inc(next), inc);
    next = Gates.sel(next, data, load);
    next = Gates.sel(next, Gates.lo(data.length), reset);
    return next = word(next, Gates.hi());
  };
};
/**
 */
Gates.cpu = function(data, addr, load, pc) {
  this.data = data || 0;
  this.addr = addr || 0;
  this.load = load || 0;
  this.pc   =  pc  || 0;
  return this;
};
