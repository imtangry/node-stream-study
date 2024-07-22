> node:stream 模块 API 的设计目的是让使用 JavaScript 的原型继承模型轻松实现流成为可能。



```javascript
const { Writable } = require('node:stream');

class MyWritable extends Writable {
  constructor({ highWaterMark, ...options }) {
    super({ highWaterMark });
    // ...
  }
} 

```

下面方法是是在继承的时候要重写的。

| Use-case                                      | Class     | Method(s) to implement                                             |
|:--------------------------------------------- |:---------:| ------------------------------------------------------------------:|
| Reading only                                  | Readable  | _read()                                                            |
| Writing only                                  | Writable  | _write(), _writev(), _final()                                      |
| Reading and writing                           | Duplex    | _read(), _write(), _writev(), _final() |
| Operate on written data, then read the result | Transform | _transform(), _flush(), _final()                                   |



注意点：

- 继承中不要调用流的公共方法
- 避免重写公共方法，例如 write() 、 end() 、 cork() 、 uncork() 、 read() 和 destroy() 、 'data' 、 'end' 、 'finish' 和 'close' .emit() 。这样做可能会破坏当前和未来的流不变量，从而导致与其他流、流实用程序和用户期望的行为和/或兼容性问题。

对于许多简单的情况，可以在不依赖继承的情况下创建流。这可以通过直接创建 stream.Writable 、 stream.Readable 、 stream.Duplex 或 stream.Transform 对象的实例并传递适当的方法作为构造函数选项来完成。



```javascript
const { Writable } = require('node:stream');

const myWritable = new Writable({
  construct(callback) {
    // Initialize state and load resources...
  },
  write(chunk, encoding, callback) {
    // ...
  },
  destroy() {
    // Free resources...
  },
}); 
```
