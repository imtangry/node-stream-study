```javascript
const stream = require('node:stream');
```

流是 Node.js 中处理流数据的抽象接口。 node:stream 模块提供了用于实现流接口的API。 流可以是可读的、可写的或两者兼而有之。所有流都是 EventEmitter 的实例。

## Node内置四种基础的流

- Writable ：可以写入数据的流（例如 `fs.createWriteStream()` ）。
- Readable ：可以从中读取数据的流（例如 `fs.createReadStream()` ）。
- Duplex ：同时是 Readable 和 Writable 的流（例如 `net.Socket` ）。
- Transform ： Duplex 流，可以在写入和读取数据时修改或转换数据（例如 `zlib.createDeflate()` ）。

## Buffering

`Writable` 和 `Readable` 流都将数据存储在内部缓冲区中。  
其中`Duplex`和`Transform` 流都是 Readable 和 Writable，所以他们都会维护两个缓冲区。各自合适且高效的处理数据流。

可能缓冲的数据量取决于传递到流构造函数中的 `highWaterMark` 选项。（它是一个阈值，不是一个限制，一般来说不会执行强制的内存限制）
- 普通流， highWaterMark 选项指定总字节数。
- 对象模式操作的流， highWaterMark 指定对象总数。
- 字符串进行操作（但不解码）的流， highWaterMark 指定 UTF-16 代码单元的总数。

当stream的实例调用`stream.push(chunk)`方法时，数据会被缓存再Readable流中。如果消费者不调用`stream.read()`，数据会一直位于 internal queue中。当缓冲区占满时，流将停止从 underlying resource读取数据（即`readable._read()`方法不会执行）。

重复调用`writable.write(chunk)`方法时，数据会被缓存在Writeable流中。当write buffer大小小于阈值时，`writable.write()` 的调用将返回 true 。反之将返回 false。

Node的程序一般都会用到Stream，比如一个HTTP服务：
```javascript
const http = require('node:http');

const server = http.createServer((req, res) => {
  // `req` is an http.IncomingMessage, which is a readable stream.
  // `res` is an http.ServerResponse, which is a writable stream.

  let body = '';
  // Get the data as utf8 strings.
  // If an encoding is not set, Buffer objects will be received.
  req.setEncoding('utf8');

  // Readable streams emit 'data' events once a listener is added.
  req.on('data', (chunk) => {
    body += chunk;
  });

  // The 'end' event indicates that the entire body has been received.
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // Write back something interesting to the user:
      res.write(typeof data);
      res.end();
    } catch (er) {
      // uh oh! bad json!
      res.statusCode = 400;
      return res.end(`error: ${er.message}`);
    }
  });
});

server.listen(1337);

// $ curl localhost:1337 -d "{}"
// object
// $ curl localhost:1337 -d "\"foo\""
// string
// $ curl localhost:1337 -d "not json"
// error: Unexpected token 'o', "not json" is not valid JSON 
```




