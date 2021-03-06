/**
 * A queue to add and pop string. It also provides an arbitrary remove function.
 * A queue is first-in-first-out.
 * Elements in this queue must be strings
 */
class Queue {

  constructor() {
    this._q = []
    // this is to support the has function in constant time
    this._keys = {}
  }


  /**
   * Add a string at the end of the queue. Not added again if already in there.
   * @param {string} str - some string to add
   */
  add(str, priorityScore=Infinity) {
    if (!(str in this._keys)){
      this._q.unshift({str: str, priorityScore: priorityScore})
      this._keys[str] = 1
    }
  }


  /**
   * Check if this queue contains a given string
   * @return {boolean} true if this queue has a given string, false if not
   */
  has(str) {
    return (str in this._keys)
  }


  /**
   * Extract the first element
   * @return {string} the first element
   */
  pop() {
    let str = null
    if(this._q.length){
      str = this._q.pop().str
      delete this._keys[str]
    }
    return str
  }


  /**
   * Is the queue empty?
   * @return {boolean} true if empty, false if not
   */
  isEmpty() {
    return !this._q.length
  }


  /**
   * Get the number of element in the queue
   * @param {number}
   */
  size() {
    return this._q.length
  }


  /**
   * Get the first element of the queue without removing it
   * (Not sure how useful is that)
   * @return {string}
   */
  first() {
    return this._q.length ? this._q[0].str : null
  }


  /**
   * Get the last element of the queue without removing it
   * (Not sure how useful is that)
   * @return {string}
   */
  last() {
    return this._q.length ? this._q[this._q.length - 1].str : null
  }


  /**
   * Remove an element from the queue and returns it
   * @param {string} str - an element to remove
   * @return {string | null}
   */
  remove(str) {
    let strToRem = null
    let index = -1

    for(let i=0; i<this._q.length; i++){
      if(this._q[i].str === str){
        index = i
        break
      }
    }

    if (index > -1) {
      strToRem = this._q.splice(index, 1)[0].str
      delete this._keys[strToRem]
    }
    return strToRem
  }


  /**
   * Remove all the elements of the queue
   */
  reset() {
    this._q = []
    this._keys = {}
  }


  /**
   * If a priority score is given to the elements, then we can sort the queue based on that
   */
  sortByPriorityScore(){
    this._q.sort(function(a, b){
      return b.priorityScore - a.priorityScore
    })
  }

}


export default Queue
