`Duplex` 流是同时实现 `Readable` 和 `Writable` 的流，例如 TCP 套接字连接。



自定义 `Duplex` 流必须调用 `new stream.Duplex([options])` 构造函数并实现 `readable._read()` 和 `writable._write()` 方法。



write 写入一些数据到缓冲里面，read 可以从缓冲中读取数据
