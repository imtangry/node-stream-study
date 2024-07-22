## 实现可写流

### `new stream.Writable([options])`



所有 `Writable` 流实现都必须提供 `writable._write()` 和/或 `writable._writev()` 方法来将数据发送到底层资源。
