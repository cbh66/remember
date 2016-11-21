import Queue from './Queue';

// TODO: write format for arguments to class; can be in constructor or not
//   Specify how you need to schedule things in order
//   In comments, compare to PriorityQueue implementation, which allows any
//       order.  A more robust design could allow the underlying implementation
//       to be input.  This one is just a PriorityQueue that throws an
//       exception if you try to add something out of order.
// When using, maybe except for the initial one, the time should be, like,
//   scheduledTime - timeToFade out.  So, when it's popped off the queue,
//   that's the signal to fade out then present the next one on time.
//   This means that no name will fade out until another one is ready.

class OutOfOrderDateError extends RangeError {}


interface TimedQueueOptions<T> {  // fuck this
    callback?: (object: T) => any;
    updateFrequency?: number;      // In milliseconds, I would think
}

export default class TimedQueue<T> {
    protected queue = new Queue<[Date, T]>();
    protected latestTime: Date = null;
    protected callback: (object: T) => any;
    protected updateFrequency: number;

    public constructor(opts?: TimedQueueOptions<T>) {
        this.setOptions(opts || {});
    }

    // Sets defaults if not given
    public setOptions(opts: TimedQueueOptions<T>): void {
        this.callback = opts.callback || function (x: T) {}   // noop
        this.updateFrequency = opts.updateFrequency || 1000;
    }

    public addLatest(object: T, scheduledTime: Date): void {
        if (this.latestTime && scheduledTime < this.latestTime) {
            throw new OutOfOrderDateError('Date ' + scheduledTime +
                    ' is earlier than prior added date ' + this.latestTime);
        }
        this.queue.enqueue([scheduledTime, object]);
        this.latestTime = scheduledTime;
        if (this.queue.getLength() === 1) {
            this.watch();
        }
    }

    public getLatestScheduledTime(): Date {
        return this.latestTime;
    }

    // Recursive, but call stack size bounded by O(this.queue.length)
    private watch(): void {
        let nextPair = this.queue.peek();
        if (!nextPair) return;
        let waitTime = nextPair[0].getTime() - new Date().getTime();
        if (waitTime <= 0) {
            this.processNextObject();
        } else {
            setTimeout(this.watch.bind(this), waitTime);
        }
    }

    private processNextObject(): void {
        let nextPair = this.queue.dequeue();
        if (!nextPair) return;
        let nextObject = nextPair[1];
        this.callback(nextObject);
        this.watch();
    }
}