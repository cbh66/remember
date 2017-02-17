import Queue from './Queue';

// TODO:
//   Specify how you need to schedule things in order
//   In comments, compare to PriorityQueue implementation, which allows any
//       order.  A more robust design could allow the underlying implementation
//       to be input.  This one is just a PriorityQueue that throws an
//       exception if you try to add something out of order.
// When using, maybe except for the initial one, the time should be, like,
//   scheduledTime - timeToFade out.  So, when it's popped off the queue,
//   that's the signal to fade out then present the next one on time.
//   This means that no name will fade out until another one is ready.
// Can maybe pass a callback per object, ie. so the same callback doesn't
//   process all objects; then the callback property would just be a default.

/**
 * A structure used for adding objects that need to be processed at a specific
 *   time.  When the time comes, the object is removed and passed to a
 *   callback.  One limitation (imposed so insertion and removal are O(1) ops)
 *   is that objects must be inserted in the order they will be removed.
 */
class TimedQueue<T> {
    /**
     * Contains the objects to be removed, and the times they should be
     *   removed, in the order they should be removed.
     * @type {Queue<[Date, T]>}
     */
    protected queue = new Queue<[Date, T]>();
    /**
     * The most recent time inserted into the queue (or null iff the queue
     * is empty).
     * @type {Date}
     */
    protected latestTime: Date = null;
    /**
     * The function called when an object's time is up.  It is passed the
     * object; any return value is ignored.
     * @type {TimedQueue.CallbackType<T>}
     */
    protected callback: TimedQueue.CallbackType<T>;
    /**
     * Not yet used; may eventually indicate a frequency to check the current
     * time if the next object in the queue isn't due for a while.
     * @type {number}
     */
    protected updateFrequency: number;

    /**
     * @constructor
     * @param {TimedQueue.Options<T>?} opts
     */
    public constructor(opts?: TimedQueue.Options<T>) {
        this.setOptions(opts || {});
    }

    /**
     * Sets values for the class; sets others to defaults.
     * TODO: maybe only the constructor should set defaults?  Otherwise you
     *   might try to overwrite just one value but see others reset.
     * @param {TimedQueue.Options<T>} opts Options to set.
     */
    public setOptions(opts: TimedQueue.Options<T>): void {
        this.callback = opts.callback || function (x: T) {}   // noop
        this.updateFrequency = opts.updateFrequency || 1000;
    }

    /**
     * Adds an object to the queue to be processed at the specified time.  This
     *   time must be later than any other time in the queue.
     * @param {T}    object        The object to add.
     * @param {Date} scheduledTime The time at which it should be processed.
     * @throws {TimedQueue.OutOfOrderDateError} Throws an error if this object
     *   is scheduled for an earlier time than the latest item in the queue.
     */
    public addLatest(object: T, scheduledTime: Date): void {
        if (this.latestTime && scheduledTime < this.latestTime) {
            throw new TimedQueue.OutOfOrderDateError('Date ' + scheduledTime +
                    ' is earlier than prior added date ' + this.latestTime);
        }
        this.queue.enqueue([scheduledTime, object]);
        this.latestTime = scheduledTime;
        if (this.queue.getLength() === 1) {  // First object added
            this.watch();
        }
    }

    /**
     * Returns the latest time any object has been scheduled for so far.
     * @return {Date} The latest time an object has been scheduled for.
     */
    public getLatestScheduledTime(): Date {
        return this.latestTime;
    }

    /**
     * @return {number} The number of items left in the queue.
     */
    public length(): number {
        return this.queue.getLength();
    }

    /**
     * Watches the queue, waiting until the next items have to be processed,
     *   and removing them when that time comes.  Is recursive, but is
     *   asynchronous if objects do not need to be immediately processed.
     *   The call stack size is bounded by O(this.queue.length)
     * @private
     */
    private watch(): void {
        let nextPair = this.queue.peek();
        if (nextPair) {
            let [nextTime, ] = nextPair;
            let waitTime = nextTime.getTime() - new Date().getTime();
            if (waitTime <= 0) {
                this.processNextObject();
            } else {
                setTimeout(this.watch.bind(this), waitTime);
            }
        } else {
            this.latestTime = null;
        }

    }

    /**
     * Processes the next object on the queue, removing it and passing it to
     *   the appropriate callback.  Sets up a watch for the next object.
     * @private
     */
    private processNextObject(): void {
        let nextPair = this.queue.dequeue();
        if (!nextPair) return;
        let [ , nextObject] = nextPair;
        this.callback(nextObject);
        this.watch();      // Keep watching for the next objects
    }
}


module TimedQueue {
    /**
     * An error thrown when dates are inserted out of order.
     */
    export class OutOfOrderDateError extends RangeError {
        public name = "OutOfOrderDateError";
        constructor(public message: string) {
            super(message);
            this.message = this.name + ": " + message;
        }
    };
    /**
     * A type for callbacks that can process T objects.
     */
    export interface CallbackType<T> {
        (object: T): void;
    }
    /**
     * Options that can be specified for a TimedQueue.
     */
    export interface Options<T> {
        callback?: TimedQueue.CallbackType<T>;
        updateFrequency?: number;      // In milliseconds, I would think
    }
}


export default TimedQueue;
