/**
 * The EventManager deals with events, create them, call them.
 * This class is mostly for being inherited from.
 */
class EventManager {
  /**
   * Constructor
   */
  constructor() {
    this._events = {}
  }


  /**
   * Define an event, with a name associated with a function
   * @param  {String} eventName - Name to give to the event
   * @param  {Function} callback - function associated to the even
   */
  on(eventName, callback) {
    if (typeof callback === 'function') {
      if (!(eventName in this._events)) {
        this._events[eventName] = []
      }
      this._events[eventName].push(callback)
    } else {
      console.warn('The callback must be of type Function')
    }
  }


  /**
   * Emit the event(s). If multiple callbacks are tied to this event,
   * they will be called in the order they were declared.
   * @param {string} eventName - name of the event to fire.
   * @param {array} args - argument to call the callback with.
   * Note that within the callback, those arguments will be "flattened" and not as an array.
   */
  emit(eventName, args = []) {
    // the event must exist and be non null
    if ((eventName in this._events) && (this._events[eventName].length > 0)) {
      const events = this._events[eventName]
      for (let i = 0; i < events.length; i += 1) {
        events[i](...args)
      }
    } else {
      //console.warn(`No function associated to the event ${eventName}`)
    }
  }
}

export default EventManager
