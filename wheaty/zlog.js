/*
Copyright (c) 2011 zTrix <i@ztrix.me>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var cwd = process.cwd() + '/';

function pad2(num) {
    return num > 9 ? num : '0' + num;
}

function getTime() {
    var t = new Date();
    return [t.getFullYear(), '-', pad2(t.getMonth() + 1) , '-', pad2(t.getDate()), ' ', pad2(t.getHours()), ':', pad2(t.getMinutes()), ':', pad2(t.getSeconds())].join('');
}

function getPos() {
    try {
        throw new Error();
    } catch(e) {
        var pos = e.stack.split('\n')[4].split(':');
        pos[0] = pos[0].trim();
        var lp = pos[0].lastIndexOf(' (');
        if (lp > -1) {
            pos[0] = pos[0].substr(lp + 2);
        }
        var left = pos[0].indexOf(cwd);
        if (left > 0) {
            pos[0] = pos[0].substr(left);
        }
        return pos[0].replace(cwd, '') + ':' + pos[1];
    }
    return 'unknown function'
}

function log(msg, type, color) {
    var head = tag = foot = '';
    if (color) {
        head = '\x1B[';
        foot = '\x1B[0m';
        tag = '36m';
        color = color + 'm';
    }
    console.log(
        getTime() + ' [' + head + color + type + foot + '] [' + head + tag + getPos() + foot + ']', msg
    );
}

module.exports = {
    info: function(s) {
        log(s, " II ", 38);
    },

    err: function(s) {
        log(s, " EE ", 31);
    }, 

    warn: function(s) {
        log(s, " WW ", 35);
    }
}

