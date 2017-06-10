/*

Queue.js

A function to represent a queue

Originallyreated by Stephen Morley - http://code.stephenmorley.org/ - and
released under the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

Modified by Colin Hamilton to convert to typescript
*/

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 */
export default class Queue<T> {

    // initialise the queue and offset
    protected queue: T[] = [];
    protected offset: number = 0;

    // Returns the length of the queue.
    public getLength(): number {
        return (this.queue.length - this.offset);
    }

    // Returns true if the queue is empty, and false otherwise.
    public isEmpty(): boolean {
        return (this.queue.length === 0);
    }

    /** Enqueues the specified item. The parameter is:
     *
     * item - the item to enqueue
     */
    public enqueue(item: T): void {
        this.queue.push(item);
    }

    /** Dequeues an item and returns it. If the queue is empty, the value
     * 'undefined' is returned.
     */
    public dequeue(): T | undefined {
        // if the queue is empty, return immediately
        if (this.queue.length === 0) {
            return undefined;
        }

        // store the item at the front of the queue
        const item: T = this.queue[this.offset];

        // increment the offset and remove the free space if necessary
        // TODO: maybe don't do this as frequently?
        if (++this.offset * 2 >= this.queue.length) {
            this.queue  = this.queue.slice(this.offset);
            this.offset = 0;
        }

        // return the dequeued item
        return item;
    }

    /** Returns the item at the front of the queue (without dequeuing it). If
     * the queue is empty then undefined is returned.
     */
    public peek(): T | undefined {
        return (this.queue.length > 0) ? this.queue[this.offset] : undefined;
    }

    /**
     * Returns a copy of all enqueued elements as an array, where those at
     * smaller indices were inserted earlier.  If an amount is included, the
     * array is truncated to that size.
     * @param {number} amount
     */
    public toArray(amount?: number): T[] {
        if (amount === 0) {
            return [];
        }
        if (amount) {
            amount = Math.min(amount, this.getLength());
        } else {
            amount = this.getLength();
        }
        return this.queue.slice(this.offset, this.offset + amount);
    }
}
