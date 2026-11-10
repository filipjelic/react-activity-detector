declare module "react-activity-detector" {
  import React from "react";

  /** Default activity events. Any other window event name is accepted too. */
  type DefaultActivityEvent =
    | "click"
    | "mousemove"
    | "keydown"
    | "DOMMouseScroll"
    | "mousewheel"
    | "mousedown"
    | "touchstart"
    | "touchmove"
    | "focus";

  // `string & {}` accepts any event name while keeping autocomplete for the defaults.
  type ActivityEvent = DefaultActivityEvent | (string & {});

  export interface ActivityDetectorProps {
    /**
     * Window events that count as user activity.
     * Defaults to all of the default activity events.
     */
    activityEvents?: ActivityEvent[];
    /**
     * Time in milliseconds of inactivity before the user is considered idle.
     * Defaults to 300000 (5 minutes)
     */
    timeout?: number;
    /**
     * Whether the detector is running. While disabled, onIdle is never called
     * and other tabs are not affected. Enabling it starts a fresh timeout.
     * Defaults to false
     */
    enabled?: boolean;
    /**
     * Links detectors across browser tabs: detectors with the same name share
     * one idle deadline. Detectors on the same page keep their own timers.
     * Defaults to "default"
     */
    name?: string;
    /** Called when the user has been inactive for `timeout` milliseconds */
    onIdle?: () => void;
    /** Called on every tracked activity event */
    onActive?: () => void;
  }

  const ActivityDetector: React.FC<ActivityDetectorProps>;
  export default ActivityDetector;
}
