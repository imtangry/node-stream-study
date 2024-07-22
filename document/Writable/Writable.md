> Writable streams are an abstraction for a destination to which data is written



所有 Writable streams 都实现了 stream.Writable 类的接口。所有 Writable streams 都遵循基本的使用步骤:



```javascript
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data'); 
```

## Events

### drain

如果对 stream.write(chunk) 的调用返回 false ，便需要停止写数据，当可以恢复写数据时，stream会发出drain事件。

```javascript
// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 1000000;
  write();
  function write() {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        // Last time!
        writer.write(data, encoding, callback);
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write);
    }
  }
} 
```

## Methods

### writable.write(chunk[, encoding][, callback])

- chunk `<string> | <Buffer> | <TypedArray> | <DataView> | <any>`，非对象模式 chunk 必须是 `<string>, <Buffer>, <TypedArray> or <DataView>`。
- encoding `<string> | <null>`, 如果chunk是string类型. 默认是: 'utf8'
- callback `<Function>` Callback for when this chunk of data is flushed

write方法将一些数据写入流，并在数据处理完毕后调用callback，如果发生出错误，也会调用callback，并且第一个参数就是这个error。这个callback被异步调用，并且是在error事件被emit前调用的。
