# BufferQueue
The point of this JS library is to prioritise the download of a large number of binary files. It leverages the logic of a priority queue with multiple levels of priority. If `N` is the number of priority level you want, then `0` will be the highest priority and `n-1` will be the lowest.

Each level is a *first in first out* list and each element is identified by its URL.

## Usage
Instanciate the main object:
```javascript
let myBufferQ = new bufferqueue.BufferQueue({
  priorityLevels: 5, // the number of priority level, N (default: 4)
  concurentDownloads: 4, // the number of concurrent downloads you allow. (Chrome allows a max of 6) (default: 3)
  httpSettings: {} // object containing the http header and other stuff (default: {})
})
```
To know more about the 'httpSettings' object, refer to the *init* object from [Request documentation](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request).

Since downloading file is an asynchronous process in Javascript, *BufferQueue* relies on custom events of different kinds:
- `added`: when a file is just being added to the queue
```javascript
myBufferQ.on('added', function(url, priority){
  // do something with it
})
```

- `removed`: when a file is just being removed to the queue, without having started to get downloaded
```javascript
myBufferQ.on('removed', function(url){
  // do something with it
})
```

- `reseted`: When the whole priority queue has be reseted
```javascript
myBufferQ.on('reseted', function(){
  // do something with it
})
```

- `downloading`: when the download of a file is starting
```javascript
myBufferQ.on('downloading', function(url){
  // do something with it
})
```

- `failed`: when the download of a file has failed
```javascript
myBufferQ.on('failed', function(url, error){
  // do something with it
})
```

- `aborted`: when the download of a file has been explicitly aborted by the user
```javascript
myBufferQ.on('aborted', function(url){
  // do something with it
})
```

- `success`: when is a file download is completed successfully. `buffer` is an `ArrayBuffer` and `time` is the download time is in millisecond (you can then compute the actual download rate)
```javascript
myBufferQ.on('success', function(url, buffer, time){
  // do something with it
})
```

In addition to events, an instance of `BufferQueue` has some methods:

```javascript
myBufferQ.add(
  'http://example.com/some-file', // URL
  0 // level of priority
)
```
The other other methods can be found in the [documentation](http://me.jonathanlurie.fr/bufferqueue/doc/#bufferqueue).
