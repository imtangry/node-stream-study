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
reader.pause()
// reader.push('Hello, world!');
// reader.on('data', (chunk) => {
//     console.log(chunk.toString());
// });

console.log(reader.read())
// console.log(reader.read())
// console.log(reader.read())

// reader.on('readable', () => {
//     console.log(`readable: ${reader.read()}`);
// });
reader.on('end', () => {
    console.log('End of stream');
});

// 简单的理解和使用 Readable
// 所有reader 都是以暂停模式开始 可以通过read()方法读取缓冲区的数据。（调用一次read方法便读取一次数据。 执行read()时，如果缓存中数据不够，会调用_read()去底层取。 _read方法中可以同步或异步地调用push(data)来将底层数据交给流处理）

// 当添加data事件监听时，readable流会自动切换到流动模式，自动调用read()方法从缓冲区读取数据。
// 添加readable.pipe(writable)也会切换为流动模式。 readable.pipe(writable)返回值是writable的引用。当readable流发出 'end' 事件时，会触发writable的end()方法

// _read() 将在每次调用 this.push(dataChunk) 后再次调用。

//所有 Readable 流实现都必须提供 readable._read()方法的实现，以从底层资源获取数据。_read() => 有数据 => readable.push(data)将数据推送到缓冲区 => readable.emit('data', data)触发data事件 => readable.push(null)结束流
// _read() => read.push() => readable.emit('data', data)
// readable 的 push方法可以将数据推送缓冲区,
