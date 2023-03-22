import { useState, useEffect } from "react";

const DEFAULT_ACTIVITY_EVENTS = [
  "click",
  "keydown",
  "DOMMouseScroll",
  "mousewheel",
  "mousedown",
  "touchstart",
  "touchmove",
  "focus",
];

const LOCAL_STORAGE_KEYS = {
  IDLE_TIMER: "React_Activity_Detector_Idle_Timer",
};

const storeLastActivityIntoStorage = (time, name) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.IDLE_TIMER + "-" + name, time);
};

const getLastActivityFromStorage = (name) => {
  return localStorage.getItem(LOCAL_STORAGE_KEYS.IDLE_TIMER + "-" + name);
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
  name,
}) => {
  const [timeoutScheduled, setTimeoutScheduled] = useState(false);
  const scheduleIdleHandler = (time) => {
    clearTimeout(scheduledIdleTimeout[name]);

    scheduledIdleTimeout[name] = setTimeout(() => {
      const scheduledInactivityCheck = getLastActivityFromStorage(name);
      const currentTime = getCurrentTime();

      if (currentTime >= scheduledInactivityCheck) {
        // if already passed scheduled time, call onIdle
        if (onIdle) onIdle();
      }
    }, time);
  };

  const resetTimer = () => {
    clearTimeout(activityEventInterval[name]);
    activityEventInterval[name] = setTimeout(
      () => setTimeoutScheduled(false),
      200
    );
  };

  const handleUserActivityEvent = () => {
    resetTimer();
    if (onActive) onActive();
  };

  const handleStorageChangeEvent = ({ key, newValue }) => {
    if (key === LOCAL_STORAGE_KEYS.IDLE_TIMER + "-" + name) {
      scheduleIdleHandler(newValue - getCurrentTime());
    }
  };

  const stop = () => {
    detachListeners();
    clearTimeout(scheduledIdleTimeout[name]);
    clearTimeout(activityEventInterval[name]);
  };

  const attachListeners = () => {
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleUserActivityEvent)
    );

    window.addEventListener("storage", handleStorageChangeEvent);
  };

  const detachListeners = () => {
    activityEvents.forEach((eventName) =>
      window.removeEventListener(eventName, handleUserActivityEvent)
    );

    window.removeEventListener("storage", handleStorageChangeEvent);
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
      storeLastActivityIntoStorage(getCurrentTime() + timeout, name);
    }
    setTimeoutScheduled(true);
  }, [timeoutScheduled, timeout]);

  return timeoutScheduled;
};

ActivityDetector.defaultProps = {
  activityEvents: DEFAULT_ACTIVITY_EVENTS,
  timeout: 5 * 60 * 1000,
  enabled: false,
  name: "default",
};

export default ActivityDetector;
