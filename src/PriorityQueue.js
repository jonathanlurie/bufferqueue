import Queue from './Queue'

/**
 * This priority queue works with levels of priority, 0 beeing the highest priority
 * and following level will be of decreasing priority.
 * In term of implementation, PriorityQueue instanciates N Queues, where N is the
 * number of priority levels. The number of priority levels has to be given at
 * the creation of a PriorityQueue instance.
 */
class PriorityQueue {
  constructor(levels=3) {
    this._qs = Array.from({length: levels}, () => new Queue())

  }

  /**
   * Get the level of priority of a given string
   * @return {number} zero is the highest priority, -1 means the element is NOT
   * in the queue
   */
  getPriority(str) {
    for(let i=0; i<this._qs.length; i++) {
      if(this._qs[i].has(str)){
        return i
      }
    }
    return -1
  }


  /**
   * Checks if a string is in the queue. Optionally, we can verify a specific
   * level only.
   * @param {string} str - string to verify the presence in the queue
   * @param {number} priority - OPTIONAL the priority (must be in [0, level-1])
   * @return {boolean}
   */
  has(str, priority=-1) {
    if(~priority) {
      return this._qs[priority].has(str)
    }

    for(let i=0; i<this._qs.length; i++) {
      if(this._qs[i].has(str)){
        return true
      }
    }
    return false
  }


  /**
   * Add a string to the queue with a given priority.
   * If the string is already present in the queue with the same level of priority or higher, then nothing is done.
   * If the string is already present but with a different level of priority, then
   * it is removed and added with the provided level or priority.
   * @param {string} str - the string to add
   * @param {number} priority - the priority (must be in [0, level-1])
   * @param {boolean} true if added, false if not (because already in with a higher priority)
   */
  add(str, priority) {
    let existingPriority = this.getPriority(str)

    if(existingPriority >= priority) {
      return false
    }

    if(existingPriority) {
      this.remove(str)
    }

    this._qs[priority].add(str)
    return true
  }


  /**
   * Get the the element with the highest priority and remove it from the queue
   * @return {string|null} can return null if the queue is empty
   */
  pop() {
    for(let i=0; i<this._qs.length; i++) {
      if(!this._qs[i].isEmpty()) {
        return this._qs[i].pop()
      }
    }

    return null
  }


  /**
   * Check if the priority queue is empty (= if all the per-level-queues are all empty)
   * @return {boolean} true if empty, false if not empty
   */
  isEmpty() {
    return this._qs.every(q => q.isEmpty())
  }


  /**
   * Get the total number of elements in the priority queue, or optionnaly, for a specific
   * level of priority
   * @param {number} priority - OPTIONAL level of priority
   * @param {number} number of elements
   */
  size(priority = -1) {
    if(~priority) {
      return this._qs[priority].size()
    }

    let s = 0
    for(let i=0; i<this._qs.length; i++) {
      s += this._qs[i].size()
    }
    return s
  }


  /**
   * Note: this should be used as rarely as possible since it does not respect the logic
   * of a queue.
   * Remove an element. If null is returned, this means the element was not in the queue.
   * @param {string} - str, the element to remove
   * @return {string|null} the element that was jsut removed
   */
  remove(str) {
    let elem = null
    for(let i=0; i<this._qs.length; i++) {
      elem = elem || this._qs[i].remove(str)
    }
    return elem
  }


  /**
   * Reset the whole priority queue, empty it all. No value returned.
   */
  reset() {
    for(let i=0; i<this._qs.length; i++) {
      this._qs[i].reset()
    }
  }

}

export default PriorityQueue
