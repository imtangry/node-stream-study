const { Readable } = require('node:stream');

class Counter extends Readable {
    constructor(opt) {
        super(opt);
        this._max = 10;
        this._index = 1;
    }

    _read() {
        const i = this._index++;
        if (i > this._max)
            this.push(null);
        else {
            const str = String(i);
            // setTimeout(() => this.push(buf), 1000)
            this.push(str);
            console.log("_read: ",i)
        }
        // return undefined;
    }
}

const reader = new Counter({ objectMode: true });
reader.on('data', (chunk) => {
    console.log(chunk);
});

reader.on('end', () => {
    console.log('End of stream');
});

// readable 一般都是使用流动模式
