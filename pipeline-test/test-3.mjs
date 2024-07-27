// 解决 contentjs里面的 一些疑问
// 验证只有一个MUX的情况
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

pipeline(pageStream, pageMux, new TestWritable(), (err) =>
    console.log('pipeline ended with error:', err)
);

const pageChannel = pageMux.createStream('CH1');


// TEST 3 START 上一个测试 write方法只从 开始的MUX流动 我们去掉第一个MUX 看下情况
// 发送一个数据
setInterval(() => {
    pageChannel.write({desc: ['data from pageChannel setInterval']});
}, 5000)

// 这个目前只会触发一次
pageChannel.on('data', (data) => {
    console.log('pageChannel received data:', data);
});
// TEST 3 END

// 结果显示流还是从起点开始，并没有触发两次 可能pipeline的机制问题
// 结论 可能是因为MUX pipe接收到消息回去确认 管道里这个节点是否是第一个节点 如果有其他此节点的引用 只从第一个节点流动 暂时猜测 需要看源码
