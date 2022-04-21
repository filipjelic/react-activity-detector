import { useState, useEffect } from 'react';

const DEFAULT_ACTIVITY_EVENTS = [
    'click',
    'keydown',
    'DOMMouseScroll',
    'mousewheel',
    'mousedown',
    'touchstart',
    'touchmove',
    'focus',
];

const LOCAL_STORAGE_KEYS = {
    IDLE_TIMER: 1,
}

const storeLastActivityIntoStorage = time => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.IDLE_TIMER, time);
};

const getLastActivityFromStorage = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.IDLE_TIMER);
};

const getCurrentTime = () => new Date().getTime();

let scheduledIdleTimeout, activityEventInterval;

const ActivityDetector =({ activityEvents, timeout, enabled, onIdle, onActive }) => {
    const [timeoutScheduled, setTimeoutScheduled] = useState(false);

    const scheduleIdleHandler = time => {

        clearTimeout(scheduledIdleTimeout);

        scheduledIdleTimeout = setTimeout(() => {
            const scheduledInactivityCheck = getLastActivityFromStorage();
            const currentTime = getCurrentTime();

            if (currentTime >= scheduledInactivityCheck) {
                // if already passed scheduled time, call onIdle
            if (onIdle) onIdle();
            }
        }, time);
    };

    const resetTimer = () => {
        clearTimeout(activityEventInterval);
        activityEventInterval = setTimeout(() => setTimeoutScheduled(false), 200);
    };

    const handleUserActivityEvent = () => {
        resetTimer();
        if (onActive) onActive();
    };

    const handleStorageChangeEvent = ({ key, newValue }) => {
        if (key === LOCAL_STORAGE_KEYS.IDLE_TIMER) {
            scheduleIdleHandler(newValue - getCurrentTime());
        }
    };

    const stop = () => {
        detachListeners();
        clearTimeout(scheduledIdleTimeout);
        clearTimeout(activityEventInterval);
    };

    const attachListeners = () => {
        activityEvents.forEach(eventName =>
            window.addEventListener(eventName, handleUserActivityEvent)
        );

        window.addEventListener('storage', handleStorageChangeEvent);
    };

    const detachListeners = () => {
        activityEvents.forEach(eventName =>
            window.removeEventListener(eventName, handleUserActivityEvent)
        );

        window.removeEventListener('storage', handleStorageChangeEvent);
    };

    useEffect(() => {
        //library active
        if (enabled) {
            attachListeners();
            // schedule initial timeout
            setTimeoutScheduled(false);
        }
        return () => {
            stop();
        };
    }, [enabled]);

    useEffect(() => {
        if (!timeoutScheduled) {
            // on every user activity schedule a new idle handler
            scheduleIdleHandler(timeout);

            // store scheduled time for other clients
            storeLastActivityIntoStorage(getCurrentTime() + timeout);
        }
        setTimeoutScheduled(true);
    }, [timeoutScheduled, timeout]);

    return timeoutScheduled;
}

ActivityDetector.defaultProps = {
    activityEvents: DEFAULT_ACTIVITY_EVENTS,
    timeout: 5 * 60 * 1000,
    enabled: false
}

export default ActivityDetector;
