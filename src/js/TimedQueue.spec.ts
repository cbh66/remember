import TimedQueue from './TimedQueue';
import { expect } from 'chai';
import * as sinon from 'sinon';

/**
 * Creates a new date `ms` milliseconds after the given date
 * @param  {number} ms   Milliseconds to add
 * @param  {Date}   date Base date
 * @return {Date}        A new date `ms` milliseconds after `date`.
 */
function millisecondsFrom(ms: number, date: Date): Date {
    return new Date(date.getTime() + ms);
}


describe('TimedQueue', function () {
    let clock: sinon.SinonFakeTimers;

    before(function () {
        clock = sinon.useFakeTimers();
    });

    after(function () {
        clock.restore();
    });

    describe('constructor', function () {
        it('should initialize properly', function () {
            expect(new TimedQueue()).to.be.an.instanceof(TimedQueue);
        });
    });

    describe('#addLatest', function () {
        it('should be an error to add things out of order', function () {
            let testQueue = new TimedQueue<number>();
            testQueue.addLatest(10, millisecondsFrom(10, new Date()));
            let outOfOrderAddition = testQueue.addLatest.bind(testQueue, 10, new Date());
            expect(outOfOrderAddition).to.throw(TimedQueue.OutOfOrderDateError);
        });
    });

    describe('callback', function () {
        it('gets called immediately if before current time', function () {
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({ callback: spy });
            testQueue.addLatest(-1, millisecondsFrom(-1, new Date()));
            expect(spy.calledOnce).to.be.true;
        });

        it('gets called when time is up', function () {
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({ callback: spy });
            testQueue.addLatest(5, millisecondsFrom(5, new Date()));

            clock.tick(4);
            expect(spy.called).to.be.false;
            clock.tick(1);
            expect(spy.calledOnce).to.be.true;
        });

        it('processes multiple items scheduled for the same time');
    });

    describe('#getLatestScheduledTime', function () {
        it('should not exist if no dates were added', function () {
            expect(new TimedQueue().getLatestScheduledTime()).to.not.exist;
        });

        it('should return the most recently added time');

        it('should no longer exist after last item has been processed');
    });
});

