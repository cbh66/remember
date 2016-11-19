import Queue from './Queue'
import * as chai from 'chai';
var expect = chai.expect;

describe('Queue', function () {
    // No good test for enqueueing; most of these rely on it working.
    // But if enqueueing is broken, it would likely break these tests too.

    describe('#isEmpty', function () {
        it('should start off empty', function () {
            expect(new Queue().isEmpty()).to.be.true;
        });

        it('should not be empty after enqueuing', function () {
            let testQueue: Queue<number> = new Queue<number>();
            testQueue.enqueue(0);
            expect(testQueue.isEmpty()).to.not.be.true;
        });

        it('should be empty after dequeueing all enqueued items', function () {
            let testQueue: Queue<number> = new Queue<number>();
            let max: number = 1;
            let increment: number = 1;
            while (max < 500) {
                for (let i = 0; i < max; ++i) {
                    testQueue.enqueue(i);
                }
                for (let i = 0; i < max; ++i) {
                    testQueue.dequeue();
                }
                expect(testQueue.isEmpty()).to.be.true;
                max += increment++;
            }
        });
    });

    describe('#dequeue', function () {
        it('should output undefined for empty queue');
        it('should always output the first item that went in');
        it('should dequeue the same items that went in');
    });

    describe('#length', function () {
        it('should begin as zero');
        it('should not change after a dequeue on an empty queue');
        it('should increase with each enqueue');
        it('should decrease with each dequeue');
    });

    describe('#peek', function () {
        it('should output the same item after multiple calls');
        it('should leave the length of the queue unchanged');
        it('should output the same item that dequeue would remove');
    });
});