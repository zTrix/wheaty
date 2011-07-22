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
        [getTime(), ' [', head, color, type, foot, '] [', head, tag, getPos(), foot, '] ', msg].join('')
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

