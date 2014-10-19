var g8 = require('../g8');

describe('g8', function() {
  it('should exist.', function() {
    expect(g8).not.toBe(null);
  });

  describe('Constants: true and false', function() {
    it('should evaluate to true and false respectively', function() {
      expect(g8.lo(1)).toBe('0');
      expect(g8.hi(1)).toBe('1');

      expect(g8.lo(2)).toBe('00');
      expect(g8.hi(2)).toBe('01');

      expect(g8.lo(4)).toBe('0000');
      expect(g8.hi(4)).toBe('0001');

      expect(g8.lo(8)).toBe('00000000');
      expect(g8.hi(8)).toBe('00000001');
    });
  });

  describe('Bus.', function() {
    it('should generate a bus of size n with value', function() {
      expect(g8.bus(2, '0').join('')).toBe('00');
      expect(g8.bus(2, '1').join('')).toBe('11');
      expect(g8.bus(4, '0').join('')).toBe('0000');
      expect(g8.bus(4, '1').join('')).toBe('1111');
    });
  });

  describe('NAND', function() {
    it('should behave like a NAND gate', function() {
      expect(g8.nand('0','0')).toBe('1');
      expect(g8.nand('0','1')).toBe('1');
      expect(g8.nand('1','0')).toBe('1');
      expect(g8.nand('1','1')).toBe('0');
    });

    it('should n-way or an n-wide bus', function() {
      expect(g8.nand('00000000')).toBe('1');
      expect(g8.nand('00000001')).toBe('1');
      expect(g8.nand('10000000')).toBe('1');
      expect(g8.nand('00010000')).toBe('1');
      expect(g8.nand('11111111')).toBe('0');
    });
  });

  describe('NOT', function() {
    it('should behave like a NOT gate', function() {
      expect(g8.not('0')).toBe('1');
      expect(g8.not('1')).toBe('0');
    });

    it('should behave like a NOT gate on a n-wide bus', function() {
      expect(g8.not('0110')).toBe('1001');
    });
  });

  describe('AND', function() {
    it('should behave like an AND gate', function() {
      expect(g8.and('0','0')).toBe('0');
      expect(g8.and('0','1')).toBe('0');
      expect(g8.and('1','0')).toBe('0');
      expect(g8.and('1','1')).toBe('1');
    });

    it('should behave like an AND gate on a n-wide bus', function() {
      expect(g8.and('0011','0101')).toBe('0001');
    });

    it('should n-way or an n-wide bus', function() {
      expect(g8.and('00000000')).toBe('0');
      expect(g8.and('00000001')).toBe('0');
      expect(g8.and('10000000')).toBe('0');
      expect(g8.and('00010000')).toBe('0');
      expect(g8.and('11111111')).toBe('1');
    });
  });

  describe('OR', function() {
    it('should behave like an OR gate', function() {
      expect(g8.or('0','0')).toBe('0');
      expect(g8.or('0','1')).toBe('1');
      expect(g8.or('1','0')).toBe('1');
      expect(g8.or('1','1')).toBe('1');
    });

    it('should behave like an OR gate on a n-wide bus', function() {
      expect(g8.or('0011','0101')).toBe('0111');
    });

    it('should n-way or an n-wide bus', function() {
      expect(g8.or('00000000')).toBe('0');
      expect(g8.or('00000001')).toBe('1');
      expect(g8.or('10000000')).toBe('1');
      expect(g8.or('00010000')).toBe('1');
    });
  });

  describe('XOR', function() {
    it('xor should behave like a XOR gate', function() {
      expect(g8.xor('0','0')).toBe('0');
      expect(g8.xor('0','1')).toBe('1');
      expect(g8.xor('1','0')).toBe('1');
      expect(g8.xor('1','1')).toBe('0');
    });
  });

  describe('Recursive Selector / Multiplexer', function() {
    it('sel should select a or b by q', function() {
      expect(g8.sel('0', '1', '0')).toBe('0');
      expect(g8.sel('0', '1', '1')).toBe('1');
      expect(g8.sel('1', '1', '0')).toBe('1');
      expect(g8.sel('1', '1', '1')).toBe('1');
      expect(g8.sel('0', '0', '1')).toBe('0');
    });

    it('sel should select a or b by q on n-wide buses', function() {
      expect(g8.sel('00001000', '10000000', '0')).toBe('00001000');
      expect(g8.sel('00001000', '10000000', '1')).toBe('10000000');

      expect(g8.sel('1111', '1010', '0')).toBe('1111');
      expect(g8.sel('1111', '1010', '1')).toBe('1010');
    });

    it('sel should select a, b, c or d by q:2', function() {
      expect(g8.sel('0', '0', '0', '0', '00')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '01')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '10')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '11')).toBe('0');

      expect(g8.sel('1', '0', '0', '0', '00')).toBe('1');
      expect(g8.sel('0', '1', '0', '0', '01')).toBe('1');
      expect(g8.sel('0', '0', '1', '0', '10')).toBe('1');
      expect(g8.sel('0', '0', '0', '1', '11')).toBe('1');

      expect(g8.sel('0', '1', '1', '1', '00')).toBe('0');
      expect(g8.sel('1', '0', '1', '1', '01')).toBe('0');
      expect(g8.sel('1', '1', '0', '1', '10')).toBe('0');
      expect(g8.sel('1', '1', '1', '0', '11')).toBe('0');
    });

    it('sel should select a, b, c, d, e, f, g or h by q:3', function() {
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '000')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '001')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '010')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '011')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '100')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '101')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '110')).toBe('0');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '0', '111')).toBe('0');

      expect(g8.sel('1', '0', '0', '0', '0', '0', '0', '0', '000')).toBe('1');
      expect(g8.sel('0', '1', '0', '0', '0', '0', '0', '0', '001')).toBe('1');
      expect(g8.sel('0', '0', '1', '0', '0', '0', '0', '0', '010')).toBe('1');
      expect(g8.sel('0', '0', '0', '1', '0', '0', '0', '0', '011')).toBe('1');
      expect(g8.sel('0', '0', '0', '0', '1', '0', '0', '0', '100')).toBe('1');
      expect(g8.sel('0', '0', '0', '0', '0', '1', '0', '0', '101')).toBe('1');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '1', '0', '110')).toBe('1');
      expect(g8.sel('0', '0', '0', '0', '0', '0', '0', '1', '111')).toBe('1');

      expect(g8.sel('0', '1', '1', '1', '1', '1', '1', '1', '000')).toBe('0');
      expect(g8.sel('1', '0', '1', '1', '1', '1', '1', '1', '001')).toBe('0');
      expect(g8.sel('1', '1', '0', '1', '1', '1', '1', '1', '010')).toBe('0');
      expect(g8.sel('1', '1', '1', '0', '1', '1', '1', '1', '011')).toBe('0');
      expect(g8.sel('1', '1', '1', '1', '0', '1', '1', '1', '100')).toBe('0');
      expect(g8.sel('1', '1', '1', '1', '1', '0', '1', '1', '101')).toBe('0');
      expect(g8.sel('1', '1', '1', '1', '1', '1', '0', '1', '110')).toBe('0');
      expect(g8.sel('1', '1', '1', '1', '1', '1', '1', '0', '111')).toBe('0');
    });

    it('sel should select a, b, c or d by q:2 on n-wide buses', function() {
      expect(g8.sel('0110', '0000', '0000', '0000', '00')).toBe('0110');
      expect(g8.sel('0000', '0110', '0000', '0000', '01')).toBe('0110');
      expect(g8.sel('0000', '0000', '0110', '0000', '10')).toBe('0110');
      expect(g8.sel('0000', '0000', '0000', '0110', '11')).toBe('0110');
    });

    it('sel should select a, b, c, d, e, f, g or h by q:3 on n-wide buses', function() {
      expect(g8.sel('1001', '0000', '0000', '0000', '0000', '0000', '0000', '0000', '000')).toBe('1001');
      expect(g8.sel('0000', '1001', '0000', '0000', '0000', '0000', '0000', '0000', '001')).toBe('1001');
      expect(g8.sel('0000', '0000', '1001', '0000', '0000', '0000', '0000', '0000', '010')).toBe('1001');
      expect(g8.sel('0000', '0000', '0000', '1001', '0000', '0000', '0000', '0000', '011')).toBe('1001');
      expect(g8.sel('0000', '0000', '0000', '0000', '1001', '0000', '0000', '0000', '100')).toBe('1001');
      expect(g8.sel('0000', '0000', '0000', '0000', '0000', '1001', '0000', '0000', '101')).toBe('1001');
      expect(g8.sel('0000', '0000', '0000', '0000', '0000', '0000', '1001', '0000', '110')).toBe('1001');
      expect(g8.sel('0000', '0000', '0000', '0000', '0000', '0000', '0000', '1001', '111')).toBe('1001');
    });

    it('sel should select from a n-list of inputs by q:log(n) on m-wide buses', function() {
      expect(g8.sel('101', '111', '101', '001',
                     '001', '100', '111', '101',
                     '100', '100', '101', '110',
                     '010', '000', '010', '101', '1110')).toBe('010');
    });
  });

  describe('Fixed Deselector / Demultiplexer / Router', function() {
    it('dsel2 should route i to a or b by q', function() {
      expect(g8.dsel2('0', '0')[0]).toBe('0');
      expect(g8.dsel2('0', '0')[1]).toBe('0');

      expect(g8.dsel2('0', '1')[0]).toBe('0');
      expect(g8.dsel2('0', '1')[1]).toBe('0');

      expect(g8.dsel2('1', '0')[0]).toBe('1');
      expect(g8.dsel2('1', '0')[1]).toBe('0');

      expect(g8.dsel2('1', '1')[0]).toBe('0');
      expect(g8.dsel2('1', '1')[1]).toBe('1');
    });

    it('dsel2 should route i to a or b by q on n-wide buses', function() {
      expect(g8.dsel2('00001010', '0')[0]).toBe('00001010');
      expect(g8.dsel2('00001010', '0')[1]).toBe('00000000');

      expect(g8.dsel2('00001010', '1')[0]).toBe('00000000');
      expect(g8.dsel2('00001010', '1')[1]).toBe('00001010');
    });

    it('dsel4 should route i to a, b, c or d by q:2', function() {
      expect(g8.dsel4('0', '00')[0]).toBe('0');
      expect(g8.dsel4('0', '01')[1]).toBe('0');
      expect(g8.dsel4('0', '10')[2]).toBe('0');
      expect(g8.dsel4('0', '11')[3]).toBe('0');

      expect(g8.dsel4('1', '00')[0]).toBe('1');
      expect(g8.dsel4('1', '01')[1]).toBe('1');
      expect(g8.dsel4('1', '10')[2]).toBe('1');
      expect(g8.dsel4('1', '11')[3]).toBe('1');
    });

    it('dsel8 should route i to a, b, c, d, e, f, g or h by q:3', function() {
      expect(g8.dsel8('0', '000')[0]).toBe('0');
      expect(g8.dsel8('0', '001')[1]).toBe('0');
      expect(g8.dsel8('0', '010')[2]).toBe('0');
      expect(g8.dsel8('0', '011')[3]).toBe('0');
      expect(g8.dsel8('0', '100')[4]).toBe('0');
      expect(g8.dsel8('0', '101')[5]).toBe('0');
      expect(g8.dsel8('0', '110')[6]).toBe('0');
      expect(g8.dsel8('0', '111')[7]).toBe('0');

      expect(g8.dsel8('1', '000')[0]).toBe('1');
      expect(g8.dsel8('1', '001')[1]).toBe('1');
      expect(g8.dsel8('1', '010')[2]).toBe('1');
      expect(g8.dsel8('1', '011')[3]).toBe('1');
      expect(g8.dsel8('1', '100')[4]).toBe('1');
      expect(g8.dsel8('1', '101')[5]).toBe('1');
      expect(g8.dsel8('1', '110')[6]).toBe('1');
      expect(g8.dsel8('1', '111')[7]).toBe('1');
    });
  });

  describe('Recursive Deselector / Demultiplexer / Router', function() {
    it('dsel should route i to a or b by q', function() {
      expect(g8.dsel('0', '0')[0]).toBe('0');
      expect(g8.dsel('0', '0')[1]).toBe('0');

      expect(g8.dsel('0', '1')[0]).toBe('0');
      expect(g8.dsel('0', '1')[1]).toBe('0');

      expect(g8.dsel('1', '0')[0]).toBe('1');
      expect(g8.dsel('1', '0')[1]).toBe('0');

      expect(g8.dsel('1', '1')[0]).toBe('0');
      expect(g8.dsel('1', '1')[1]).toBe('1');
    });

    it('dsel should route i to a or b by q on n-wide buses', function() {
      expect(g8.dsel('00001010', '0')[0]).toBe('00001010');
      expect(g8.dsel('00001010', '0')[1]).toBe('00000000');

      expect(g8.dsel('00001010', '1')[0]).toBe('00000000');
      expect(g8.dsel('00001010', '1')[1]).toBe('00001010');
    });

    it('dsel should route large buses in large selections', function() {
      expect(g8.dsel('110100000100101010101111001',
        '11111111')[255]).toBe('110100000100101010101111001');
    });

    it('dsel should route i to a, b, c or d by q:2', function() {
      expect(g8.dsel('0', '00')[0]).toBe('0');
      expect(g8.dsel('0', '01')[1]).toBe('0');
      expect(g8.dsel('0', '10')[2]).toBe('0');
      expect(g8.dsel('0', '11')[3]).toBe('0');

      expect(g8.dsel('1', '00')[0]).toBe('1');
      expect(g8.dsel('1', '01')[1]).toBe('1');
      expect(g8.dsel('1', '10')[2]).toBe('1');
      expect(g8.dsel('1', '11')[3]).toBe('1');
    });

    it('dsel should route i to a, b, c, d, e, f, g or h by q:3', function() {
      expect(g8.dsel('0', '000')[0]).toBe('0');
      expect(g8.dsel('0', '001')[1]).toBe('0');
      expect(g8.dsel('0', '010')[2]).toBe('0');
      expect(g8.dsel('0', '011')[3]).toBe('0');
      expect(g8.dsel('0', '100')[4]).toBe('0');
      expect(g8.dsel('0', '101')[5]).toBe('0');
      expect(g8.dsel('0', '110')[6]).toBe('0');
      expect(g8.dsel('0', '111')[7]).toBe('0');

      expect(g8.dsel('1', '000')[0]).toBe('1');
      expect(g8.dsel('1', '001')[1]).toBe('1');
      expect(g8.dsel('1', '010')[2]).toBe('1');
      expect(g8.dsel('1', '011')[3]).toBe('1');
      expect(g8.dsel('1', '100')[4]).toBe('1');
      expect(g8.dsel('1', '101')[5]).toBe('1');
      expect(g8.dsel('1', '110')[6]).toBe('1');
      expect(g8.dsel('1', '111')[7]).toBe('1');
    });
  });

  describe('Adders', function() {
    it('should add 2 bits and get the sum and carry', function() {
      expect(g8.halfAdd('0', '0').sum).toBe('0');
      expect(g8.halfAdd('0', '0').carry).toBe('0');

      expect(g8.halfAdd('0', '1').sum).toBe('1');
      expect(g8.halfAdd('0', '1').carry).toBe('0');

      expect(g8.halfAdd('1', '0').sum).toBe('1');
      expect(g8.halfAdd('1', '0').carry).toBe('0');

      expect(g8.halfAdd('1', '1').sum).toBe('0');
      expect(g8.halfAdd('1', '1').carry).toBe('1');
    });

    it('should add 3 bits and get the sum and carry', function() {
      expect(g8.fullAdd('0', '0', '0').sum).toBe('0');
      expect(g8.fullAdd('0', '0', '0').carry).toBe('0');

      expect(g8.fullAdd('0', '0', '1').sum).toBe('1');
      expect(g8.fullAdd('0', '0', '1').carry).toBe('0');

      expect(g8.fullAdd('0', '1', '0').sum).toBe('1');
      expect(g8.fullAdd('0', '1', '0').carry).toBe('0');

      expect(g8.fullAdd('0', '1', '1').sum).toBe('0');
      expect(g8.fullAdd('0', '1', '1').carry).toBe('1');

      expect(g8.fullAdd('1', '0', '0').sum).toBe('1');
      expect(g8.fullAdd('1', '0', '0').carry).toBe('0');

      expect(g8.fullAdd('1', '0', '1').sum).toBe('0');
      expect(g8.fullAdd('1', '0', '1').carry).toBe('1');

      expect(g8.fullAdd('1', '1', '0').sum).toBe('0');
      expect(g8.fullAdd('1', '1', '0').carry).toBe('1');

      expect(g8.fullAdd('1', '1', '1').sum).toBe('1');
      expect(g8.fullAdd('1', '1', '1').carry).toBe('1');
    });

    it('should add 2 n-wide buses and return an n-wide bus ignoring the carry', function() {
      expect(g8.add('0000', '0000')).toBe('0000');
      expect(g8.add('0000', '0001')).toBe('0001');
      expect(g8.add('0001', '0000')).toBe('0001');
      expect(g8.add('0001', '0001')).toBe('0010');

      expect(g8.add('0010', '0001')).toBe('0011');
      expect(g8.add('0010', '0010')).toBe('0100');
      expect(g8.add('0011', '0011')).toBe('0110');
      expect(g8.add('1110', '0001')).toBe('1111');
      expect(g8.add('1111', '0001')).toBe('0000'); // overflow
    });
  });

  describe('Incrementer', function() {
    it('should increment the input by one', function() {
      var counter = g8.inc('000');
      expect(counter).toBe('001');

      counter = g8.inc(counter);
      expect(counter).toBe('010');

      counter = g8.inc(counter);
      expect(counter).toBe('011');

      counter = g8.inc(counter);
      expect(counter).toBe('100');

      counter = g8.inc(counter);
      expect(counter).toBe('101');

      counter = g8.inc(counter);
      expect(counter).toBe('110');

      counter = g8.inc(counter);
      expect(counter).toBe('111');

      counter = g8.inc(counter);
      expect(counter).toBe('000');

      counter = g8.inc(counter);
      expect(counter).toBe('001');
    });
  });

  describe('SR Latch', function() {
    it('should set, reset and store a previous set bit when both inputs are active lows', function() {
      var latch = g8.latch(); // new latch
      expect(latch('0', '0')).toBe('1'); // invalid state

      expect(latch('0', '1')).toBe('1'); // set & memory
      for (var i=0; i<10; i++) expect(latch('1', '1')).toBe('1');

      expect(latch('1', '0')).toBe('0'); // reset & memory
      for (var i=0; i<10; i++) expect(latch('1', '1')).toBe('0');
    });
  });

  describe('Data Flip Flop', function() {
    var dff = g8.dff();
    it('should latch to data when the clock signal is up', function() {
      expect(dff('0')).toBe('0');
      expect(dff('0')).toBe('0');
      expect(dff('1')).toBe('1');
      expect(dff('1')).toBe('1');
      g8.tick();
      expect(dff('0')).toBe('1');
      expect(dff('1')).toBe('1');
      expect(dff('0')).toBe('1');
      g8.tick();
      expect(dff('0')).toBe('0');
      g8.tick();
      expect(dff('1')).toBe('0');
      expect(dff('0')).toBe('0');
      expect(dff('1')).toBe('0');
      g8.tick();
      expect(dff('1')).toBe('1');
    });
  });

  describe('Words: store 1 / n-bit number if load is set', function() {
    it('should handle 1-bit registers', function() {
      var bit = g8.bit();
      expect(bit('1', '1')).toBe('1');
      expect(bit('0', '1')).toBe('0');
      expect(bit('0', '1')).toBe('0');
      expect(bit('0', '1')).toBe('0');
      expect(bit('1', '1')).toBe('1');
      expect(bit('1', '1')).toBe('1');
      expect(bit('0', '1')).toBe('0');
      expect(bit('1', '1')).toBe('1');
      expect(bit('1', '1')).toBe('1');
    });

    it('should handle n-bit words', function() {
      var word = g8.word(4);
      expect(word('0000', '1')).toBe('0000');
      expect(word('0001', '1')).toBe('0001');
      expect(word('0010', '1')).toBe('0010');
      expect(word('0011', '1')).toBe('0011');
      expect(word('0100', '1')).toBe('0100');
      expect(word('0101', '1')).toBe('0101');
      expect(word('0110', '1')).toBe('0110');
      expect(word('0111', '1')).toBe('0111');
      expect(word('1111', '1')).toBe('1111');

      word = g8.word(10);
      expect(word('0000000000', '1')).toBe('0000000000');
      expect(word('0101011011', '1')).toBe('0101011011');
      expect(word('1111011011', '1')).toBe('1111011011');
      expect(word('0111111011', '1')).toBe('0111111011');
      expect(word('1111111011', '1')).toBe('1111111011');
      expect(word('1111111111', '1')).toBe('1111111111');
    });
  });

  describe('Counter', function() {
    var counter = g8.counter();
    it('should output data if load is set', function() {
      expect(counter('111', '1', '0', '0')).toBe('111');
      expect(counter('000', '1', '0', '0')).toBe('000');
    });

    it('should count from last data if inc is set', function() {
      expect(counter('111', '0', '1', '0')).toBe('001');
      expect(counter('111', '0', '1', '0')).toBe('010');
      expect(counter('111', '0', '1', '0')).toBe('011');
      expect(counter('111', '0', '1', '0')).toBe('100');
      expect(counter('111', '0', '1', '0')).toBe('101');
      expect(counter('111', '0', '1', '0')).toBe('110');
      expect(counter('010', '0', '1', '0')).toBe('111');
      expect(counter('111', '0', '1', '0')).toBe('000');
    });

    it('should output 0 is reset is set', function() {
      expect(counter('111', '0', '1', '0')).toBe('001');
      expect(counter('111', '0', '1', '0')).toBe('010');
      expect(counter('111', '0', '1', '0')).toBe('011');
      expect(counter('111', '0', '1', '0')).toBe('100');
      expect(counter('111', '0', '1', '0')).toBe('101');
      expect(counter('111', '0', '1', '0')).toBe('110');
      expect(counter('010', '0', '1', '0')).toBe('111');
      expect(counter('111', '0', '1', '0')).toBe('000');
    });
  });

  describe('Clusters', function() {
    it('should output the register at address or set its value to data if load is set.', function() {
      var cluster = g8.cluster(4, 4); // 4 4-bit registers
      expect( cluster('1011', '00', '1') ).toBe('1011');
      expect( cluster('1111', '00', '0') ).toBe('1011');
      expect( cluster('1111', '00', '0') ).toBe('1011');
      expect( cluster('1111', '00', '1') ).toBe('1111');
      expect( cluster('0000', '00', '1') ).toBe('0000');
      expect( cluster('0110', '00', '1') ).toBe('0110');
      expect( cluster('1001', '11', '1') ).toBe('1001');
      expect( cluster('0000', '00', '0') ).toBe('0110');

      cluster = g8.cluster(10, 4); // 4 10-bit registers
      expect( cluster('0000100001', '00', '1') ).toBe('0000100001');
      expect( cluster('1111111000', '01', '1') ).toBe('1111111000');
      expect( cluster('0001111000', '10', '1') ).toBe('0001111000');
      expect( cluster('0101010101', '11', '1') ).toBe('0101010101');
      expect( cluster('0000000000', '00', '0') ).toBe('0000100001');
      expect( cluster('0000000000', '01', '0') ).toBe('1111111000');
      expect( cluster('0000000000', '10', '0') ).toBe('0001111000');
      expect( cluster('0101010101', '11', '0') ).toBe('0101010101');

      cluster = g8.cluster(20, 2); // 2 20-bit registers
      expect(cluster('00000101010101110001', '0', '1')).toBe('00000101010101110001');
      expect(cluster('11110111111001110001', '1', '1')).toBe('11110111111001110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');

      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');
      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');
      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('11110111111001110001', '1', '0')).toBe('11110111111001110001');
      expect(cluster('00000101010101110001', '0', '0')).toBe('00000101010101110001');
    });
  });
});
