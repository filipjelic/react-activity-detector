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
  IDLE_TIMER: 'React_Activity_Detector_Idle_Timer',
};

const storeLastActivityIntoStorage = (time, id) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.IDLE_TIMER + '-' + id, time);
};

const getLastActivityFromStorage = (id) => {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.IDLE_TIMER + '-' + id);
};

const getCurrentTime = () => new Date().getTime();

let scheduledIdleTimeout = {},
  activityEventInterval = {};

const ActivityDetector = ({
  activityEvents,
  timeout,
  enabled,
  onIdle,
  onActive,
  id,
}) => {
  const [timeoutScheduled, setTimeoutScheduled] = useState(false);

  id = id ?? 'default';

  const scheduleIdleHandler = (time) => {
    clearTimeout(scheduledIdleTimeout[id]);

    scheduledIdleTimeout[id] = setTimeout(() => {
      const scheduledInactivityCheck = getLastActivityFromStorage(id);
      const currentTime = getCurrentTime();

      if (currentTime >= scheduledInactivityCheck) {
        // if already passed scheduled time, call onIdle
        if (onIdle) onIdle();
      }
    }, time);
  };

  const resetTimer = () => {
    clearTimeout(activityEventInterval[id]);
    activityEventInterval[id] = setTimeout(
      () => setTimeoutScheduled(false),
      200
    );
  };

  const handleUserActivityEvent = () => {
    resetTimer();
    if (onActive) onActive();
  };

  const handleStorageChangeEvent = ({ key, newValue }) => {
    if (key === LOCAL_STORAGE_KEYS.IDLE_TIMER + '-' + id) {
      scheduleIdleHandler(newValue - getCurrentTime());
    }
  };

  const stop = () => {
    detachListeners();
    clearTimeout(scheduledIdleTimeout[id]);
    clearTimeout(activityEventInterval[id]);
  };

  const attachListeners = () => {
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleUserActivityEvent)
    );

    window.addEventListener('storage', handleStorageChangeEvent);
  };

  const detachListeners = () => {
    activityEvents.forEach((eventName) =>
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
      storeLastActivityIntoStorage(getCurrentTime() + timeout, id);
    }
    setTimeoutScheduled(true);
  }, [timeoutScheduled, timeout]);

  return timeoutScheduled;
};

ActivityDetector.defaultProps = {
  activityEvents: DEFAULT_ACTIVITY_EVENTS,
  timeout: 5 * 60 * 1000,
  enabled: false,
};

export default ActivityDetector;
