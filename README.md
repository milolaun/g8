# g8 is for _Gate_

> Logic gates via closures in JavaScript. Inspired by [nand2tetris][0].

[![Build Status](https://travis-ci.org/bucaran/g8.svg?branch=master)](https://travis-ci.org/bucaran/g8)

## Install

```sh
npm install --save-dev g8
```

## What is this?
g8 is a standalone library offering just a handful of common logic gates that can be used as building blocks to implement more complex systems, such as the [Nu](http://github.com/bucaran/nu) CPU and the [Mu](http://github.com/bucaran/mu) computer.

## Latches
Latches are toggle switches whose outputs are fed to itself. This behavior causes the latch to keep its state. The inverted SR latch implemented in the library is just one [of several][1]. If set is _0_, the output will be latched to _1_, and the circuit will continue to output _1_ unless reset is set instead, which latches the output to _0_. The latch is therefore a very simple form of memory.

## Data Flip Flops
Data flip flops add a second level of nand gates to a SR latch inverting its set / reset inputs and a control bit to enable / disable the circuit. The control bit is usually an oscillating clock signal, carefully calibrated to synchronize faster circuits with slower ones. The result is that circuits keep their previous state while the clock is down giving slower circuits time to catch up with the faster ones. Circuits maintain their state ignoring any invalid data until the system stabilizes.

For a more thorough and robust explanation refer to the [third chapter][2] of _The Elements of Computing Science_ and see the section titled Time Matters.

## Turbo Mode
Every register in a memory cluster is read, but only one is written. Voltage variations in the real world propagate almost instantaneously, whereas every cell of an array must be addressed in the simulation. In order to keep one's sanity leave turbo mode enabled by default, but try setting it to false if you feel unhurried.

## The Clock

Due to physical constraints, real world sequential circuits operate at different speeds. Clock signals are used to synchronize these systems. Circuits here execute orderly, and auto-feeback is done via [closures][5]. A multi-threaded simulation running several interdependent circuits asynchronously could use this flag to syncronize the system.

## Other Useful Links

* [nand2tetris.org][0]
* [Sequential Logic][3]
* [Clock Rate][4]

## License

MIT © [Jorge Bucaran](http://bucaran.me)

[0]: http://nand2tetris.org
[1]:  http://en.wikipedia.org/wiki/Flip-flop_(electronics)#Simple_set-reset_latches
[2]: www.nand2tetris.org/chapters/chapter%2003.pdf
[3]: http://en.wikipedia.org/wiki/Sequential_logic
[4]: http://en.wikipedia.org/wiki/Clock_rate
[5]: http://stackoverflow.com/questions/111102/how-do-javascript-closures-work
