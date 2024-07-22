> Readable streams are an abstraction for a source from which data is consumed.



所有 Readable streams 都实现了 stream.Readable 类的接口.



## 两种reading模式



Readable streams 以两种模式中的一个高效的运行: flowing and paused。并且是和对象模式是分开的，对象模式不会影响reading模式。

- 流动模式下，数据会自动从底层系统读取，并立即通过 event 将数据提供给application。
- 暂停模式下，如果需要从流里面获取数据，必须显示的调用`stream.read()`方法。

所有 Readable stream 都是以暂停模式开始的，但是通过下面的方法自动切换成流动模式

- 添加 'data' 事件监听。
- 调用 stream.resume() 方法。
- 调用 stream.pipe() 方法将数据发送到 Writable 。

事件监听 data：

```javascript
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn)
  if (ev === 'data' && false !== this._readableState.flowing) {
    this.resume()
  }

  // 处理readable事件的监听
  // 省略

  return res
}
```

可以使用以下方法之一切换回暂停模式：

- 如果没有 pipe destinations，调用 stream.pause() 方法。
- 如果有 pipe destinations, 则需要先移除. 可以调用 stream.unpipe() 方法移除多个pipe destinations。

## 重要的概念



在提供消耗或忽略数据的机制之前，Readable 不会生成数据。如果这些机制被删除或禁用，Readable会停止生产数据。
如果Readable在流动模式下没有消费者消费数据。则该数据会丢失。例如调用 readable.resume() 方法时，没有data类型的事件监听。或者从流中移除了data的事件监听。
添加 'readable' 事件处理程序会自动使流停止流动，并且必须通过 readable.read() 使用数据。如果删除 readable 事件处理程序，并且存在 data 事件处理程序，则流将再次开始流动。

## 三种状态



Readable stream 的两种模式是对流内部状态的抽象，Readable stream 中发生的更复杂的内部状态管理的简化抽象。
每个 Readable 都处于三种可能状态之一：

- readable.readableFlowing === null
- readable.readableFlowing === false
- readable.readableFlowing === true

当 readable.readableFlowing 为 null 时，并且不提供消费流数据的机制。因此，流不会生成数据。在此状态下，添加 data 事件监听、调用 readable.pipe() 方法或调用 readable.resume() 方法将切换 readable.readableFlowing 到 true ，并且 Readable 在生成数据时开始主动发出事件。  
调用 readable.pause() 、 readable.unpipe() 或接收反压将导致 readable.readableFlowing 被设置为 false ，会暂时停止事件流，但不会停止数据的生成。在此状态下，添加 'data' 事件监听不会将 readable.readableFlowing 切换到 true 。

```javascript
const { PassThrough, Writable } = require('node:stream');
const pass = new PassThrough();
const writable = new Writable();

pass.pipe(writable);
pass.unpipe(writable);
// readableFlowing is now false.

pass.on('data', (chunk) => { console.log(chunk.toString()); });
// readableFlowing is still false.
pass.write('ok');  // Will not emit 'data'.
pass.resume();     // Must be called to make stream emit 'data'.
// readableFlowing is now true. 
```

当 readable.readableFlowing 为 false 时，数据可能会在流的内部缓冲区中累积。
一般来说，开发人员应该选择一种消费数据的方法，而不应该使用多种方法来消费单个流中的数据。比如同时使用 on('data') 、 on('readable') 、 pipe() 或异步迭代器。

## Events



### end

除非数据完全消耗，否则 'end' 事件不会被触发。这可以通过将流切换到流动模式或重复调用 stream.read() 直到消耗完所有数据来完成。

### readable

当有数据可供从流中读取或到达流末尾时，将发出 'readable' 事件。实际上， 'readable' 事件表明流有新信息。如果数据可用， stream.read() 将返回该数据。

```javascript
const readable = getReadableStreamSomehow();
readable.on('readable', function() {
  // There is some data to read now.
  let data;

  while ((data = this.read()) !== null) {
    console.log(data);
  }
}); 
```

## Methods



### readable.read([size])

- size `<number>` 指定读取多少数据这是一个可选参数。size 参数必须小于或等于 1 GiB。

readable.read() 方法从内部缓冲区读取数据并将其返回。如果没有数据可供读取，则返回 null 。默认情况下，数据作为 Buffer 对象返回，除非使用 readable.setEncoding() 方法指定了编码或者流在对象模式下运行。  
如果未指定 size 参数，则将返回内部缓冲区中包含的所有数据。

readable.read() 方法只能在以暂停模式运行的 Readable 流上调用。在流动模式下， readable.read() 会自动调用，直到内部缓冲区完全耗尽。

读取大文件时，可能有数据还没有到缓冲区，但是缓冲区数据已经消耗完，会返回null。所以一般按下面这样处理：

```javascript
const chunks = [];

readable.on('readable', () => {
  let chunk;
  while (null !== (chunk = readable.read())) {
    chunks.push(chunk);
  }
});

readable.on('end', () => {
  const content = chunks.join('');
}); 
```
