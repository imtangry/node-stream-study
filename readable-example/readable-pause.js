const { Readable } = require('node:stream');

class Counter extends Readable {
    constructor(opt) {
        super(opt);
        this._max = 2;
        this._index = 1;
    }

    _read() {
        const i = this._index++;
        if (i > this._max)
            this.push(null);
        else {
            const str = String(i);
            // setTimeout(() => this.push(str), 1000)
            this.push(str);
            console.log("_read: ",i)
        }
        // return undefined;
    }
}

const reader = new Counter({ objectMode: true });
reader.pause()
// reader.push('Hello, world!');
// 这里的逻辑看起来是缓冲区为空，先push数据到缓冲区。完成后继续调用_read方法push数据到缓冲区。然后data事件触发，可以读取数据

console.log(reader.read())
// console.log(reader.read())
// console.log(reader.read())

// reader.on('readable', () => {
//     let data;
//     while (data = reader.read()) {
//         console.log(data)
//     }
// });

reader.on('end', () => {
    console.log('End of stream');
});


// readable 的 push 方法可以将数据推送缓冲区,
// read(n)时，会从缓存中试图读取相应的字节数。 当n未指定时，会一次将缓存中的字节全部读取。
// 所有reader 都是以暂停模式开始 可以通过read()方法读取缓冲区的数据。（调用一次read方法便读取一次数据。 执行read()时，如果缓存中数据不够，会调用_read()去底层取。 _read方法中可以同步或异步地调用push(data)来将底层数据交给流处理）
// 因为push有可能是异步的,调用read方法会返回null 并且阻塞程序（直到push(null)），所以一般通过readable事件结合read方法来读取数据.
// _read() 将在每次调用 this.push(dataChunk) 后再次调用。

//所有 Readable 流实现都必须提供 readable._read()方法的实现，以从底层资源获取数据。_read() => 有数据 => readable.push(data)将数据推送到缓冲区 => _read()

