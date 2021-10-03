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

let ACTIVITY_EVENTS = [];

export const LOCAL_STORAGE_KEYS = {
    SIGNOUT_TIMER: 1,
}

export const storeLastActivityIntoStorage = time => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIGNOUT_TIMER, time);
};

export const getLastActivityFromStorage = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.SIGNOUT_TIMER);
};

const getCurrentTime = () => new Date().getTime();

let scheduledSignoutTimeout, activityEventInterval;

function ActivityDetector({ activityEvents, timeout = 5 * 60 * 1000, isActive=false, signOut }) {

    ACTIVITY_EVENTS = Object.values(activityEvents).length > 0 ? activityEvents : DEFAULT_ACTIVITY_EVENTS;

    const [timeoutScheduled, setTimeoutScheduled] = useState(false);

    const scheduleSignout = time => {

        clearTimeout(scheduledSignoutTimeout);

        scheduledSignoutTimeout = setTimeout(() => {
            const scheduledInactivityCheck = getLastActivityFromStorage();
            const currentTime = getCurrentTime();

            if (currentTime >= scheduledInactivityCheck) {
                // if already passed scheduled time, do signout
                signOut("User has loged out due to inactivity");
            }
        }, time);
    };

    const resetTimer = () => {
        clearTimeout(activityEventInterval);
        activityEventInterval = setTimeout(() => setTimeoutScheduled(false), 200);
    };

    const handleUserActivityEvent = () => {
        resetTimer();
    };

    const handleStorageChangeEvent = ({ key, newValue }) => {
        if (key === LOCAL_STORAGE_KEYS.SIGNOUT_TIMER) {
            scheduleSignout(newValue - getCurrentTime());
        }
    };

    const stop = () => {
        detachListeners();
        clearTimeout(scheduledSignoutTimeout);
        clearTimeout(activityEventInterval);
    };

    const attachListeners = () => {
        ACTIVITY_EVENTS.forEach(eventName =>
            window.addEventListener(eventName, handleUserActivityEvent)
        );

        window.addEventListener('storage', handleStorageChangeEvent);
    };

    const detachListeners = () => {
        ACTIVITY_EVENTS.forEach(eventName =>
            window.removeEventListener(eventName, handleUserActivityEvent)
        );

        window.removeEventListener('storage', handleStorageChangeEvent);
    };

    useEffect(() => {
        //user loged in
        if (isActive === true) {
            attachListeners();
            // schedule initial timeout
            setTimeoutScheduled(false);
        }
        return () => {
            stop();
        };
    }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!timeoutScheduled) {
            // on every user activity schedule a new signout
            scheduleSignout(timeout);

            // store scheduled time for other clients
            storeLastActivityIntoStorage(getCurrentTime() + timeout);
        }
        setTimeoutScheduled(true);
    }, [timeoutScheduled, timeout]); // eslint-disable-line react-hooks/exhaustive-deps

    return timeoutScheduled;
}

export default ActivityDetector;
