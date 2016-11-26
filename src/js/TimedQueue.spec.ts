import TimedQueue from './TimedQueue';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as _ from "lodash";


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
            let outOfOrderAddition = _.bindKey(testQueue, "addLatest", 10, new Date());
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

        it('processes multiple items scheduled for the same time', function () {
            let timesToTest = 100;
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({ callback: spy });
            let time = millisecondsFrom(5, new Date())
            _.times(timesToTest, function (i) {
                testQueue.addLatest(i, time);
            });

            clock.tick(4);
            expect(spy.called).to.be.false;
            clock.tick(1);
            expect(spy.callCount).to.equal(timesToTest);
        });

        it('gets called on each object in order', function () {
            let timesToTest = 100;
            let actualTime = 0;
            let spy = sinon.spy();
            let testQueue = new TimedQueue<number>({
                callback: function (scheduledTime) {
                    expect(scheduledTime).to.equal(actualTime);
                    spy();
                    ++actualTime;
                }
            });
            _.times(timesToTest, function (i) {
                testQueue.addLatest(i, millisecondsFrom(i, new Date()));
            });
            // for 0, should be called immediately
            while (actualTime < timesToTest) {
                let beforeTime = actualTime;
                clock.tick(1);  // callbacks should be called here
                expect(actualTime).to.equal(beforeTime + 1);
            }
        });
    });

    describe('#getLatestScheduledTime', function () {
        it('should not exist if no dates were added', function () {
            expect(new TimedQueue().getLatestScheduledTime()).to.not.exist;
        });

        it('should return the most recently added time', function () {
            let timesToTest = 100;
            let testQueue = new TimedQueue<number>();
            // If it started at 0, the first one would be processed immediately
            _.each(_.range(1, timesToTest), function (i) {
                let nextTime = millisecondsFrom(i, new Date());
                testQueue.addLatest(i, nextTime);
                expect(testQueue.getLatestScheduledTime()).to.equal(nextTime);
            });
        });

        it('has no return value after last item has been processed', function () {
            let allTestTimes = [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [3, 5, 6, 7, 10, 11],
                [1, 2, 4, 5, 7, 9, 11, 13, 14, 16],
                [4, 5, 5, 10, 14, 15],
                [1, 1, 2, 3, 5, 8, 13, 21],
                [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 6, 6, 7]
            ];
            let testQueue = new TimedQueue<number>();
            _.each(allTestTimes, function (timeList) {
                _.each(timeList, function (num) {
                    let time = millisecondsFrom(num, new Date());
                    testQueue.addLatest(num, time);
                });
                clock.tick(_.last(timeList));
                expect(testQueue.getLatestScheduledTime()).to.not.exist;
            });
        });
    });
});

