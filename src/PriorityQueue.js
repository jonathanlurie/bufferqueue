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
    this._probabilityMap = new Array(levels)
    this._makeProbabilityMap()
  }

  _makeProbabilityMap() {
    let levels = this._qs.length
    let factors = Array.from({length: levels}, (x, i) => 1/Math.pow(2,i))
    let factorSum = factors.reduce((acc, x) => acc + x)

    for(let i=0; i<levels; i++) {
      this._probabilityMap[i] = factors[i] / factorSum

      if (i>0) {
        this._probabilityMap[i] += this._probabilityMap[i-1]
      }
    }

    console.log(this._probabilityMap)
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

    if(existingPriority >= 0) {
      this.remove(str)
    }

    this._qs[priority].add(str)
    return true
  }


  /**
   * Get the the element with the highest priority and remove it from the queue
   * @return {string|null} can return null if the queue is empty
   */
  pop_ORIG() {
    for(let i=0; i<this._qs.length; i++) {
      if(!this._qs[i].isEmpty()) {
        return this._qs[i].pop()
      }
    }

    return null
  }


  /**
   * This version of pop relies on the probability map to make sure that some lower
   * priorities items are getting popped every now and then, even if there are still
   * elements in higher priority queues
   */
  pop() {
    if(this.isEmpty()){
      return null
    }

    // if the first(s) priorities are empty, we dont want to have the random seed
    // within their range, so we pad if to make sure it lands in an area corresponding
    // to some non-empty priority level
    let probPadding = 0

    for(let i=0; i<this._qs.length; i++){
      if(this._qs[i].isEmpty()){
        probPadding = this._probabilityMap[i]
      } else if(probPadding !== 0) {
        // in case we have empty, non-empty, empty. We want to stop at the first non-empty
        break
      }
    }

    let seed = probPadding + Math.random() * (1 - probPadding)
    let levelToPop = 0

    // check the level corresponding to the seed
    for(let i=0; i<this._qs.length; i++){
      if(seed < this._probabilityMap[i]) {
        levelToPop = i
        break
      }
    }

    // if the seeded level is empty,
    // we pop the one of higher priority that is non-empty
    if(this._qs[levelToPop].isEmpty()) {
      for(let i=levelToPop; i==0; i--) {
        if(!this._qs[i].isEmpty()) {
          return this._qs[i].pop()
        }
      }
    }

    return this._qs[levelToPop].pop()
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
   * Get the size of the queue for each priority level
   * @return {array}
   */
  sizePerPriority() {
    return this._qs.map(q => q.size())
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


  /**
   * Get a string status about the queue length per level
   * @return {string}
   */
  getStatus() {
    let status = ''
    for(let i=0; i<this._qs.length; i++) {
      status += `level ${i} >> ${this._qs[i].size()} elements\n`
    }

    return status
  }

}

export default PriorityQueue
