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

    describe('callback', function () {
        it('gets called immediately if before current time', function () {
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({
                callback: function (x: number): void {
                    spy();
                }
            });
            testQueue.addLatest(1, millisecondsFrom(-1, new Date()));
            expect(spy.calledOnce).to.be.true;
        });

        it('gets called when time is up', function () {
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({
                callback: function (x: number): void {
                    spy();
                }
            });
            testQueue.addLatest(1, millisecondsFrom(5, new Date()));

            clock.tick(4);
            expect(spy.called).to.be.false;
            clock.tick(1);
            expect(spy.calledOnce).to.be.true;
        });
    });
});

