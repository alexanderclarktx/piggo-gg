console.log("hello world");
while (true) { }
var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
rl.on('line', function (line) {
    console.log(line);
});
rl.once('close', function () {
    // end of input
});
