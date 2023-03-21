declare module "react-activity-detector" {
  import React from "react";

  type ActivityEvent =
    | "click"
    | "keydown"
    | "DOMMouseScroll"
    | "mousewheel"
    | "mousedown"
    | "touchstart"
    | "touchmove"
    | "focus";

  export interface ActivityDetectorProps {
    /**
     * Array of possible events that trigger user activity
     * Defaults to all events
     */
    activityEvents?: ActivityEvent[];
    /** Time in milliseconds before user is considered idle */
    timeout?: number;
    /** Whether to start the detector in an idle state */
    enabled?: boolean;
    /** Event that triggers when user is declared idle */
    onIdle?: () => void;
    /** Event that triggers when user is declared active */
    onActive?: () => void;
  }

  const ActivityDetector: React.FC<ActivityDetectorProps>;
  export default ActivityDetector;
}
