// > Brainloller is Brainfuck but represented as an image. If you're not
// familiar with Brainfuck already, go checkout http://minond.xyz/brainfuck/.
// Brainloller gives you the eight commands that you have in Brainfuck with two
// additional commands for rotating the direction in which the program is
// evaluated.
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./common"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    // - https://esolangs.org/wiki/Brainloller
    var common_1 = require("./common");
    var pixel = function (opt) {
        var _a = JSON.parse(opt), r = _a[0], g = _a[1], b = _a[2];
        return { r: r, g: g, b: b };
    };
    var optcode = function (cell) {
        return !cell
            ? "[0,0,0]" /* NOOP */
            : JSON.stringify([cell.r, cell.g, cell.b]);
    };
    var exec = function (prog, userHooks, buff) {
        var steps = 0;
        var cmd;
        var coor = [0, 0];
        var direction = 3 /* RIGHT */;
        var jumps = [];
        var memory = [];
        var pointer = 0;
        var curr = function () {
            return memory[pointer] || 0;
        };
        var save = function (val) {
            return memory[pointer] = val;
        };
        var dump = function (cmd) {
            return console.log('[%s:%s]\t\tcmd: %s\t\tcurr: %s[%s]\t\tmem: %s', steps, coor, cmd, pointer, curr(), JSON.stringify(memory));
        };
        // Find the matching CBRACKET while following ROTPOS90 and ROTNEG90 updates
        // but ignoring everything else.
        var findEnd = function (coor) {
            var peekDir = direction;
            var peekCoor = nextCoor(coor, direction);
            var peekJump = 1;
            while (prog[peekCoor[1]] && prog[peekCoor[1]][peekCoor[0]]) {
                switch (optcode(prog[peekCoor[1]][peekCoor[0]])) {
                    case "[255,255,0]" /* OBRACKET */:
                        peekJump++;
                        break;
                    case "[128,128,0]" /* CBRACKET */:
                        peekJump--;
                        if (peekJump === 0) {
                            return [peekCoor, peekDir];
                        }
                        break;
                    case "[0,255,255]" /* ROTPOS90 */:
                        peekDir = nextRotation(peekDir);
                        break;
                    case "[0,128,128]" /* ROTNEG90 */:
                        peekDir = prevRotation(peekDir);
                        break;
                }
                peekCoor = nextCoor(peekCoor, peekDir);
            }
            throw new Error('Found OBRACKET but no CBRACKET');
        };
        var nextRotation = function (dir) {
            switch (dir) {
                case 3 /* RIGHT */: return 1 /* DOWN */;
                case 1 /* DOWN */: return 2 /* LEFT */;
                case 2 /* LEFT */: return 0 /* UP */;
                case 0 /* UP */: return 3 /* RIGHT */;
                default: throw new Error("Invalid direction: " + dir);
            }
        };
        var prevRotation = function (dir) {
            switch (dir) {
                case 3 /* RIGHT */: return 0 /* UP */;
                case 0 /* UP */: return 2 /* LEFT */;
                case 2 /* LEFT */: return 1 /* DOWN */;
                case 1 /* DOWN */: return 3 /* RIGHT */;
                default: throw new Error("Invalid direction: " + dir);
            }
        };
        var nextCoor = function (coor, dir) {
            switch (dir) {
                case 3 /* RIGHT */: return moveRight(coor);
                case 1 /* DOWN */: return moveDown(coor);
                case 2 /* LEFT */: return moveLeft(coor);
                case 0 /* UP */: return moveUp(coor);
                default: throw new Error("Invalid direction: " + direction);
            }
        };
        var moveRight = function (coor) {
            return [coor[0] + 1, coor[1]];
        };
        var moveDown = function (coor) {
            return [coor[0], coor[1] + 1];
        };
        var moveLeft = function (coor) {
            return [coor[0] - 1, coor[1]];
        };
        var moveUp = function (coor) {
            return [coor[0], coor[1] - 1];
        };
        var internalUpdate = function (state) {
            direction = common_1.isset(state.direction) ? state.direction : direction;
            memory = common_1.isset(state.memory) ? state.memory : memory;
            pointer = common_1.isset(state.pointer) ? state.pointer : pointer;
            coor = common_1.isset(state.coor) ? state.coor : coor;
        };
        // Moves on to the next command. Checks that we still have commands left to
        // read and also show debugging information. In a `process.nextTick` (or one
        // of its siblings) to prevent call stack overflows.
        var internalTick = function () {
            if (process.env.DEBUG) {
                dump(cmd);
            }
            steps++;
            coor = nextCoor(coor, direction);
            if (!prog[coor[1]] || !prog[coor[1]][coor[0]]) {
                hooks.done();
            }
            else {
                process.nextTick(run, 0);
            }
        };
        var tick = function () {
            return hooks.tick(internalTick, internalUpdate, {
                steps: steps,
                direction: direction,
                coor: coor,
                pointer: pointer,
                memory: memory.slice(0)
            });
        };
        var readBuff = function (cb) {
            return common_1.read(cb, buff || new common_1.ReadBuffer());
        };
        var hooks = Object.assign({ read: readBuff, write: common_1.write, tick: common_1.call, done: common_1.pass }, userHooks);
        var ops = (_a = {},
            _a["[0,255,0]" /* PLUS */] = function () { return save((curr() === 255 ? 0 : curr() + 1)); },
            _a["[0,128,0]" /* MINUS */] = function () { return save((curr() || 256) - 1); },
            _a["[128,0,0]" /* LT */] = function () { return --pointer; },
            _a["[255,0,0]" /* GT */] = function () { return ++pointer; },
            _a["[0,0,255]" /* PERIOD */] = function () { return hooks.write(String.fromCharCode(curr())); },
            _a["[255,255,0]" /* OBRACKET */] = function () {
                if (curr() === 0) {
                    _a = findEnd(coor), coor = _a[0], direction = _a[1];
                }
                else {
                    jumps.push([coor, direction]);
                }
                var _a;
            },
            _a["[128,128,0]" /* CBRACKET */] = function () {
                if (curr() !== 0) {
                    _a = jumps[jumps.length - 1], coor = _a[0], direction = _a[1];
                }
                else {
                    jumps.pop();
                }
                var _a;
            },
            _a["[0,255,255]" /* ROTPOS90 */] = function () {
                direction = nextRotation(direction);
            },
            _a["[0,128,128]" /* ROTNEG90 */] = function () {
                direction = prevRotation(direction);
            },
            _a);
        var run = function () {
            cmd = optcode(prog[coor[1]][coor[0]]);
            if (cmd in ops) {
                ops[cmd]();
                tick();
            }
            else if (cmd === "[0,0,128]" /* COMMA */) {
                hooks.read(function (input) {
                    save(input.charCodeAt(0));
                    tick();
                });
            }
            else {
                tick();
            }
        };
        run();
        var _a;
    };
    exports.exec = exec;
});
