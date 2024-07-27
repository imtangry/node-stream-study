// 解决 contentjs里面的 一些疑问
// 验证 MUX 两次触发问题
import {pipeline, Duplex, Writable} from 'readable-stream';
import ObjectMultiplex from '@metamask/object-multiplex';

class TestChannel extends Duplex {
    constructor(opts) {
        super({
            objectMode: true,
            ...opts,
        });
    }

    // 接受消息都是其他地方主动触发的 这里我们生成有一个定时器 模拟其他人发的心跳
    _read() {
        return undefined;
    }

    // pipeline监听 data 事件，前一个节点有数据push会触发此事件，随后触发write，我们处理一下数据，然后再push到下一个节点
    _write(chunk, encoding, callback) {
        chunk.data.desc ? chunk.data.desc.push('data is from previous node') : chunk.data.desc = ['data is from test channel'];
        this.push(chunk);
        callback();
    }
}

class TestWritable extends Writable {
    constructor(options) {
        super({
            objectMode: true,
            ...options
        });
    }

    _write(chunk, encoding, callback) {
        console.log('TestWritable received data:', chunk);
        callback();
    }
}

// the transport-specific streams for communication between inpage and background
const pageStream = new TestChannel();

// create and connect channel muxers
// so we can handle the channels individually
const pageMux = new ObjectMultiplex();
pageMux.setMaxListeners(25);

//这里 第二个 pageMux 只处理 write 事件么，这也是当初的一个疑问；pageChannel的write按道理都会触发这两个的push事件 我们可以继续实验（把第一个pageMux去掉即可, 或者在最后加一个TestWritable）
pipeline(pageMux, pageStream, pageMux, new TestWritable(), (err) =>
    console.log('pipeline ended with error:', err)
);

const pageChannel = pageMux.createStream('CH1');


// TEST 2 START 测试pageChannel的write事件是否会触发管道中两个pageMux节点 如果是 name testWritable 节点会接收到数据两次
// 发送一个数据
setInterval(() => {
    pageChannel.write({desc: ['data from pageChannel setInterval']});
}, 5000)

// 这个目前只会触发一次
pageChannel.on('data', (data) => {
    console.log('pageChannel received data:', data);
});
// TEST 2 END

// 结果显示流还是从起点开始，并没有触发两次 可能pipeline的机制问题
