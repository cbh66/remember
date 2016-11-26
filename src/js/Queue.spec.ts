import Queue from './Queue';
import { expect } from 'chai';
import * as _ from 'lodash';

/**
 * Calls `callback` several times, each time passing a progressively larger
 *   number, no larger than `max`.  If `callback` returns truthy, the loop
 *   ends.
 * @param {number}   max
 * @param {(i: number) => any} callback
 */
function forManyNumbersUpTo(max: number,
                            callback: (i: number) => any): void {
    let increment = 1;
    for (let i = 1; i <= max; i += increment++) {  // i = 1,2,4,7,11,16,22,...
        if (callback(i)) {
            break;
        }
    }
}

/**
 * Makes and returns a queue containing every integer between `start` and
 *   `end`.  Successive numbers in the queue differ by 1, and are either all
 *   increasing (if start < end) or all decreasing (if start > end).
 * @param  {number}        start The first value in the queue
 * @param  {number}        end   The last value in the queue
 * @return {Queue<number>}
 */
function makeQueueBetween(start: number, end: number): Queue<number> {
    let returnQueue = new Queue<number>();
    _.each(_.range(start, end+1), (num) => returnQueue.enqueue(num));
    return returnQueue;
}

describe('Queue', function () {
    // No good test for enqueueing; most of these rely on it working.
    // But if enqueueing is broken, it would likely break these tests too.

    describe('constructor', function () {
        it('should initialize properly', function () {
            expect(new Queue()).to.be.an.instanceof(Queue);
        });
    });

    var largeQueue: Queue<number>;  // to be used later for dequeue test
    describe('#enqueue', function () {
        it('should not crash when enqueueing a million elements', function () {
            largeQueue = makeQueueBetween(1, 1000*1000);
            expect(largeQueue).to.be.ok;
        });
    });

    describe('#isEmpty', function () {
        it('should start off empty', function () {
            expect(new Queue().isEmpty(), 'isEmpty').to.be.true;
        });

        it('should not be empty after enqueuing', function () {
            let testQueue = new Queue<number>();
            testQueue.enqueue(0);
            expect(testQueue.isEmpty(), 'isEmpty').to.be.false;
        });

        it('should be empty after dequeueing all enqueued items', function () {
            forManyNumbersUpTo(500, function (max: number) {
                let testQueue = makeQueueBetween(1, max);
                _.times(max, function () {
                    expect(testQueue.isEmpty(), 'isEmpty').to.be.false;
                    testQueue.dequeue();
                });
                expect(testQueue.isEmpty(), 'isEmpty').to.be.true;
            });
        });
    });

    describe('#dequeue', function () {
        it('should output undefined for empty queue', function () {
            expect(new Queue().dequeue()).to.be.undefined;
        });

        it('should always output the first item that went in', function () {
            forManyNumbersUpTo(500, function (max: number) {
                let testQueue = makeQueueBetween(0, max);
                expect(testQueue.dequeue(), 'first item').to.equal(0);
            });
        });

        it('should permanently remove items when dequeued', function () {
            forManyNumbersUpTo(500, function (max: number) {
                let testQueue = makeQueueBetween(0, max);
                testQueue.dequeue();
                expect(testQueue.dequeue(), 'second item').to.not.equal(0);
            });
        });

        it('should dequeue the same items that went in', function () {
            forManyNumbersUpTo(500, function (max: number) {
                let testQueue = makeQueueBetween(0, max);
                _.each(_.range(0, max+1), function (i) {
                    expect(testQueue.dequeue()).to.equal(i);
                });
                expect(testQueue.dequeue()).to.be.undefined;
            });
        });

        it('should empty a queue of a million elements', function () {
            _.times(1000*1000, () => largeQueue.dequeue());
            expect(largeQueue.isEmpty()).to.be.true;
        });

        it('should support alternating enqueue/dequeues');
    });

    describe('#getLength', function () {
        it('should begin as zero', function () {
            expect(new Queue().getLength(), 'length').to.equal(0);
        });

        it('should not change after a dequeue on an empty queue', function () {
            let testQueue = new Queue();
            testQueue.dequeue();
            expect(testQueue.getLength(), 'length').to.equal(0);
        });

        it('should increase with each enqueue', function () {
            let testQueue = new Queue<number>();
            _.times(1000, function (num) {  // starts at 0, when length is 1
                testQueue.enqueue(num);
                expect(testQueue.getLength()).to.equal(num+1);
            });
        });

        it('should decrease with each dequeue', function () {
            let max = 1000;
            let testQueue = makeQueueBetween(1, max);
            _.each(_.range(max, 0), function (i) {
                testQueue.dequeue();
                expect(testQueue.getLength(), 'length').to.equal(i - 1);
            });
        });
    });

    describe('#peek', function () {
        it('should output the same item that dequeue would remove', function () {
            expect(new Queue().peek()).to.equal(new Queue().dequeue());
            forManyNumbersUpTo(500, function (max) {
                let testQueue = makeQueueBetween(1, max);
                _.times(max, function () {
                    expect(testQueue.peek()).to.equal(testQueue.dequeue());
                });
            });
        });

        it('should output the same item after multiple calls', function () {
            function verifyPeekValue(queue: Queue<any>): void {
                let firstResult = queue.peek();
                _.times(5, function () {
                    expect(queue.peek()).to.equal(firstResult);
                });
            }

            verifyPeekValue(new Queue());
            let testQueue = makeQueueBetween(1, 1000);
            _.times(500, function () {
                verifyPeekValue(testQueue);
                testQueue.dequeue();
            });
        });

        it('should leave the length of the queue unchanged', function () {
            function verifyLengthAfterPeek(queue: Queue<any>) {
                let lengthBefore = queue.getLength();
                queue.peek();
                expect(queue.getLength()).to.equal(lengthBefore);
            }

            verifyLengthAfterPeek(new Queue());
            let testQueue = makeQueueBetween(1, 1000);
            _.times(1000, function () {
                verifyLengthAfterPeek(testQueue);
                testQueue.dequeue();
            });
        });
    });
});
