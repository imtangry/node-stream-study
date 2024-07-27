// 解决 contentjs里面的 一些疑问
// 验证 pipeline 管道的起点是否只能是第一个节点
import { pipeline,  Duplex, Writable } from 'readable-stream';
import ObjectMultiplex from '@metamask/object-multiplex';

class TestChannel extends Duplex {
    // 模拟一个心跳 负责实现pipeline中的一个节点发起数据 看看会不会走到管道中的下一个节点 测试管道起点是否只能是第一个节点
    #interval

    _destroy(err, callback) {
        clearInterval(this.#interval);
        callback(err);
    }

    constructor(opts) {
        super({
            objectMode: true,
            ...opts,
        });
        this.#interval = setInterval(() => {
            // 把这个心跳名字为给CH1的子流
            this.push({
                name: 'CH1',
                data: {
                    desc: ['heartbeat from test channel'],
                },
            });
        }, 1000);
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
        super(options);
    }

    _write(chunk, encoding, callback) {
        // 在这里处理写入的每个数据块
        console.log(chunk.toString());
        callback(); // 确保调用回调以表示处理完成
    }
}

// the transport-specific streams for communication between inpage and background
const pageStream = new TestChannel();

// create and connect channel muxers
// so we can handle the channels individually
const pageMux = new ObjectMultiplex();
pageMux.setMaxListeners(25);

//这里 第二个 pageMux 只处理 write 事件么，这也是当初的一个疑问；pageChannel的write按道理都会触发这两个的push事件 我们可以继续实验（把第一个pageMux去掉即可, 或者在最后加一个TestWritable）
pipeline(pageMux, pageStream, pageMux, (err) =>
    console.log('pipeline ended with error:', err)
);

const pageChannel = pageMux.createStream('CH1');


// TEST 1 START 测试数据会不会从管道中间开始流动
// 发送一个数据
setInterval(() => {
    pageChannel.write({desc:['data from pageChannel setInterval']});
}, 5000)
// 发送之后应该会接受到数据
pageChannel.on('data', (data) => {
    console.log('pageChannel received data:',data);
});
// TEST 1 END
