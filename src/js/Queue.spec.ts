import Queue from './Queue'
import * as chai from 'chai';
var expect = chai.expect;

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
    for (let i = 1; i <= max; i += increment++) {  // i = 1,2,4,7,11,16,...
        if (callback(i)) {
            break;
        }
    }
}

function makeQueueBetween(min: number, max: number): Queue<number> {
    let returnQueue = new Queue<number>();
    for (let i = min; i <= max; ++i) {
        returnQueue.enqueue(i);
    }
    return returnQueue;
}

describe('Queue', function () {
    // No good test for enqueueing; most of these rely on it working.
    // But if enqueueing is broken, it would likely break these tests too.

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
                let testQueue = makeQueueBetween(0, max);
                for (let i = 0; i <= max; ++i) {
                    expect(testQueue.isEmpty(), 'isEmpty').to.be.false;
                    testQueue.dequeue();
                }
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
                for (let i = 0; i <= max; ++i) {
                    expect(testQueue.dequeue()).to.equal(i);
                }
                expect(testQueue.dequeue()).to.be.undefined;
            });
        });
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
            let max = 1000;
            for (let i = 1; i <= max; ++i) {
                testQueue.enqueue(i);
                expect(testQueue.getLength()).to.equal(i);
            }
        });

        it('should decrease with each dequeue', function () {
            let max = 1000;
            let testQueue = makeQueueBetween(1, max);
            for (let i = max; i > 0; --i) {
                testQueue.dequeue();
                expect(testQueue.getLength(), 'length').to.equal(i - 1);
            }
        });
    });

    describe('#peek', function () {
        it('should output the same item after multiple calls');
        it('should leave the length of the queue unchanged');
        it('should output the same item that dequeue would remove');
    });
});