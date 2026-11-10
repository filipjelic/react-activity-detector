"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_ACTIVITY_EVENTS = [
  "click",
  "mousemove",
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

const getStorageKey = (name) => LOCAL_STORAGE_KEYS.IDLE_TIMER + "-" + name;

// Turns a stored idle deadline into a number. Missing or malformed values
// return null so they are never treated as "deadline 0" (i.e. idle right now).
const parseDeadline = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const deadline = Number(value);
  return Number.isFinite(deadline) ? deadline : null;
};

// localStorage can be unavailable or throw (storage blocked, some private
// browsing modes, quota exceeded). Cross-tab sync is best-effort: if storage
// fails, the detector keeps working in the current tab.
const storeDeadlineIntoStorage = (deadline, name) => {
  try {
    localStorage.setItem(getStorageKey(name), deadline);
  } catch (e) {
    // ignore: storage unavailable
  }
};

const getDeadlineFromStorage = (name) => {
  try {
    return parseDeadline(localStorage.getItem(getStorageKey(name)));
  } catch (e) {
    return null;
  }
};

const getCurrentTime = () => new Date().getTime();

const ActivityDetector = (props) => {
  const {
    activityEvents,
    timeout,
    enabled,
    onIdle,
    onActive,
    name,
  } = {
    activityEvents: DEFAULT_ACTIVITY_EVENTS,
    timeout: 5 * 60 * 1000,
    enabled: false,
    name: "default",
    ...props
  };
  const [timeoutScheduled, setTimeoutScheduled] = useState(false);
  // Per-instance timer handles. These must NOT be module-scoped: module-scoped
  // state would be shared across every component instance, letting unrelated
  // instances clobber each other's timers.
  const scheduledIdleTimeoutRef = useRef(null);
  const activityEventIntervalRef = useRef(null);
  // Deadline of the idle timer this instance scheduled last. Used when the
  // shared value in localStorage is missing or unreadable.
  const deadlineRef = useRef(null);
  // Latest props, so long-lived listeners and timers never call stale callbacks
  // or read a stale name.
  const latestPropsRef = useRef(null);
  latestPropsRef.current = { onIdle, onActive, name };

  const scheduleIdleHandler = (deadline) => {
    clearTimeout(scheduledIdleTimeoutRef.current);
    deadlineRef.current = deadline;

    scheduledIdleTimeoutRef.current = setTimeout(() => {
      const { onIdle: latestOnIdle, name: latestName } = latestPropsRef.current;
      const sharedDeadline = getDeadlineFromStorage(latestName);
      const effectiveDeadline =
        sharedDeadline !== null ? sharedDeadline : deadlineRef.current;

      if (getCurrentTime() >= effectiveDeadline) {
        // if already passed scheduled time, call onIdle
        if (latestOnIdle) latestOnIdle();
      }
    }, Math.max(0, deadline - getCurrentTime()));
  };

  // Re-attach listeners only when the list of events actually changes, not
  // whenever the caller passes a new array with the same contents.
  const activityEventsKey = activityEvents.join("|");

  useEffect(() => {
    if (!enabled) return undefined;

    const storageKey = getStorageKey(name);
    const events = activityEvents;

    const handleUserActivityEvent = () => {
      clearTimeout(activityEventIntervalRef.current);
      activityEventIntervalRef.current = setTimeout(
        () => setTimeoutScheduled(false),
        200
      );
      const { onActive: latestOnActive } = latestPropsRef.current;
      if (latestOnActive) latestOnActive();
    };

    const handleStorageChangeEvent = ({ key, newValue }) => {
      if (key !== storageKey) return;
      const deadline = parseDeadline(newValue);
      // A removed or malformed value says nothing about user activity, so keep
      // the current timer instead of firing onIdle immediately.
      if (deadline === null) return;
      scheduleIdleHandler(deadline);
    };

    events.forEach((eventName) =>
      window.addEventListener(eventName, handleUserActivityEvent)
    );
    window.addEventListener("storage", handleStorageChangeEvent);

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, handleUserActivityEvent)
      );
      window.removeEventListener("storage", handleStorageChangeEvent);
    };
  }, [enabled, name, activityEventsKey]);

  useEffect(() => {
    if (!enabled) return undefined;

    // schedule initial timeout
    setTimeoutScheduled(false);

    return () => {
      clearTimeout(scheduledIdleTimeoutRef.current);
      clearTimeout(activityEventIntervalRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    if (!timeoutScheduled) {
      // A disabled detector must not schedule onIdle or write to storage,
      // since other tabs would pick up that write as activity.
      if (enabled) {
        // on every user activity schedule a new idle handler
        const deadline = getCurrentTime() + timeout;
        scheduleIdleHandler(deadline);

        // store scheduled time for other clients
        storeDeadlineIntoStorage(deadline, name);
      }
      setTimeoutScheduled(true);
    }
  }, [timeoutScheduled, timeout, enabled, name]);

  return timeoutScheduled;
};

export default ActivityDetector;
