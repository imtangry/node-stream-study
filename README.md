先来回忆一下Java里面的流。

node中的read，write等可以理解成缓冲流。

JAVA的流以程序为中心：[程序] <——> [文件，数据库，网络连接，数组........]

不同的维度分类：
1.  流向：输入流，输出流。
2.  数据：字节流（二进制）可以处理一切文件；字符流（文本文件）只能处理纯文本。
3.  功能：节点流（离源头近的）；处理流（增强功能，提高性能）。

## 字节流（抽象类）及主要方法：

### 输入流：InputStream；
- read(byte[] b) ：从输入流中读取一定数量的字节，并将其存储在缓冲区数组 b 中。
- read(byte[] b, int off, int len)：将输入流中最多 len 个数据字节读入 byte 数组。
- close()：关闭此输入流并释放与该流关联的所有系统资源。

### 输出流：OutputStream；
- write	(byte[] b) ：从输入流中读取一定数量的字节，并将其存储在缓冲区数组 b 中。
- write(byte[] b, int off, int len)：将输入流中最多 len 个数据字节读入 byte 数组。
- flush()：刷新此输出流并强制写出所有缓冲的输出字节
- close()：关闭此输出流并释放与该流关联的所有系统资源。

## 字符流：

###输入流：Reader；
- read(char[] cbuf)：将字符读入数组。
- read(char[] cbuf, int off, int len)：将字符读入数组的某一部分。
- close()：关闭该流并释放与之的所有资源。

### 输出流：Writer；
- write(char[] cbuf)：写入字符数组。
- write(char[] cbuf, int off, int len)：写入字符数组的某一部分。
- flush()：刷新该流的缓冲。
- close()：关闭此流，但要先刷新它。

## 文件处理的几大步骤：
1. 建立联系（File类）。
2. 选择流的类型（字节或字符）。
3. 设置流的大小和种类（数组大小和write或read）。
4. 完成处理，关闭流。

## 缓冲流：
### 字节流：字节缓冲流
- BufferedInputStream
- BufferedOutputStream
### 字符流：字符缓冲流
- BufferedReader
    - 新增方法：readLine()；读取一个文本行。
- BufferedWriter
    - 新增方法：newLine()；写入一个行分隔符。

使用方法很简单，直接创建流的时候包裹就行
InputStream ipt =new BufferedInput(new FileInputStream);

如果要是要使用新增方法，需要声明为缓冲流
BufferedReader bfr =new BufferedReader(new FileReader);
BufferedWriter bfw = new BufferedWriter(new FileWriter);

```java
String line =null;
while(null!=(line=bfr.readLine())){
    bfw.writer(line);
    bfw.newline
}
```

