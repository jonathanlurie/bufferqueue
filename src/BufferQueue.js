import PriorityQueue from './PriorityQueue'
import EventManager from './EventManager'
import { getOption } from './Tools'


/**
 * This is the main object of the BufferQueue library.
 *
 * Emitted events:
 * - 'added': when a new element to download is added to the queue
 * - 'removed': when an element is removed (and will not be downloaded)
 * - 'reseted': when the whole queue is reseted
 * - 'downloading': when a file is starting to be downloading (after being popped from the queue)
 * - 'failed': when a file could not be downloaded properly (status above 2xx)
 * - 'aborted': when a file download is aborted by an explicit abort() call
 * - 'success': when a file has been successfully downloaded and converted into an ArrayBuffer. Callback arguments are URL, ArrayBuffer, downloadTimeMs
 *
 */
class BufferQueue extends EventManager {

  /**
   * @param {Object} options - the option object
   * @param {number} options.priorityLevels - Number of levels of priority to have in the priority queue (default: 3)
   * @param {number} options.concurentDownloads - number of concurent downloads possible (default: 4)
   * @param {Headers} options.httpSettings - the optional settings for the HTTP request (default: {}) see 'init' object from https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
   */
  constructor(options) {
    super()
    this._concurentDownloads = getOption(options, 'concurentDownloads', 4)
    this._pq = new PriorityQueue(getOption(options, 'priorityLevels', 3))
    this._httpSettings = getOption(options, 'httpSettings', {})
    this._dlControllers = {} // keeps the 'signal' and tracks which files are currently being downloaded

    let that = this
    setInterval(function(){
      that._tryNext()
    }, 200)
  }


  /**
   * Get the level of priority of a given file
   * @param {string} str - URL of the file to check
   * @return {number} zero is the highest priority, -1 means the element is NOT
   * in the queue
   */
  getPriority(str) {
    return this._pq.getPriority(str)
  }


  /**
   * Checks if a string is in the queue. Optionally, we can verify a specific
   * level only.
   * @param {string} str - string to verify the presence in the queue
   * @param {number} priority - OPTIONAL the priority (must be in [0, level-1])
   * @return {boolean}
   */
  has(str, priority=-1) {
    return this._pq.has(str, priority)
  }


  /**
   * Checks if a given url is currently being downloaded
   * @param {string} str - string to verify
   * @return {boolean} true if being downloaded, false if not
   */
  isDownloadInProcess(str){
    return (str in this._dlControllers)
  }


  /**
   * Add a string to the queue with a given priority.
   * If the string is already present in the queue with the same level of priority or higher, then nothing is done.
   * If the string is already present but with a different level of priority, then
   * it is removed and added with the provided level or priority.
   *
   * Emits the event 'added' with the str as argument if properly added.
   *
   * @param {string} str - the string to add
   * @param {number} priority - the priority (must be in [0, level-1])
   * @param {boolean} true if added, false if not (because already in with a higher priority)
   */
  add(str, priority, priorityScore=Infinity) {
    if(this.isDownloadInProcess(str)){
      return
    }

    if(this._pq.add(str, priority, priorityScore)){
      this.emit('added', [str, priority])
      this._tryNext()
    }
  }


  /**
   * Check if the priority queue is empty (= if all the per-level-queues are all empty)
   * @return {boolean} true if empty, false if not empty
   */
  isEmpty() {
    return this._pq.isEmpty()
  }


  /**
   * Get the total number of elements in the priority queue, or optionnaly, for a specific
   * level of priority
   * @param {number} priority - OPTIONAL level of priority
   * @param {number} number of elements
   */
  size() {
    return this._pq.size()
  }


  /**
   * Get the size of the queue for each priority level
   * @return {array}
   */
  sizePerPriority() {
    return this._pq.sizePerPriority()
  }


  /**
   * Note: this should be used as rarely as possible since it does not respect the logic
   * of a queue.
   * Remove an element. If null is returned, this means the element was not in the queue.
   *
   * Emits the event 'removed' if the str as argument if properly removed
   *
   * @param {string} - str, the element to remove
   * @return {string|null} the element that was jsut removed
   */
  remove(str){
    if(this._pq.remove(str)) {
      this.emit('removed', [str])
    }
  }


  /**
   * Reset the whole priority queue, empty it all. No value returned.
   *
   * Emits the event 'reseted' without any argument
   */
  reset() {
    this._pq.reset()
    // this._dlControllers = {} // if we reset _dlControllers then we may relaunch a DL that is already in process
    this.emit('reseted', [])
  }


  /**
   * Abort the download of a specific file. If the file was actually being downloaded,
   * the `aborted` event will be emitted.
   * Note: once a file is aborted, it is no longer in a queue.
   * @param {string} str - the URL of the file to abort
   */
  abort(str) {
    if(str in this._dlControllers) {
      this._dlControllers[str].abort()
      delete this._dlControllers[str]
    }
  }


  /**
   * Abort all the current downloads. `aborted` event will be emitted.
   */
  abortAll() {
    let k = Object.keys(this._dlControllers)
    for(let i=0; i<k.length; i++) {
      this._dlControllers[k[i]].abort()
      delete this._dlControllers[k[i]]
    }
  }


  /**
   * @private
   */
  _tryNext() {
    let nbCurrentDl = Object.keys(this._dlControllers).length
    if(nbCurrentDl >= this._concurentDownloads)
      return

    let toBeDl = this._pq.pop()

    if(toBeDl) {
      this._startDownload(toBeDl)
    }
  }


  /**
   * @private
   */
  _startDownload(str){
    let that = this


    let myRequest = new Request(str ,this._httpSettings)

    //let signal = new AbortController()
    //this._dlControllers[str] = signal
    this._dlControllers[str] = myRequest.signal

    this.emit('downloading', [str])

    let t0 = performance.now()
    let t1 = t0

    fetch(myRequest/*, { signal }*/).then(response => {
      if(!response.ok){
        that.emit('failed', [url, response])
        return null
      }
      t1 = performance.now()


      return response.blob()
    }).then(myBlob => {
      delete that._dlControllers[str]

      if(!myBlob)
        return

      let fileReader = new FileReader()
      fileReader.onload = function(event) {
        let buf = event.target.result
        //that._tryNext()
        that.emit('success', [str, buf, (t1 - t0)])
      }
      fileReader.readAsArrayBuffer(myBlob)
      that._tryNext()
    }).catch(function(err) {
      delete that._dlControllers[str]
      that._tryNext()

      if(err.code === 20){
        that.emit('aborted', [str])
      } else {
        that.emit('failed', [str, err])
      }
    })
  }


  /**
   * Get a string status of the prioirty queue size per level and the number of
   * files currently being downloaded.
   * @return {string}
   */
  getStatus() {
    return `${this._pq.getStatus()}Current downloads: ${Object.keys(this._dlControllers).length}`
  }


  /**
   * If priority scores are given, elements can be sorted based on that.
   */
  sortWithinLevel(){
    this._pq.sortWithinLevel()
  }

}

export default BufferQueue
