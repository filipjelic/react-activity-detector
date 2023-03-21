declare module "react-activity-detector" {
  import React from "react";

  type ActivityEvent = keyof WindowEventMap;

  export interface ActivityDetectorProps {
    /**
     * Array of possible events that trigger user activity
     * Defaults to ["click", "keydown", "DOMMouseScroll", "mousewheel", "mousedown", "touchstart", "touchmove", "focus"]
     */
    activityEvents?: ActivityEvent[];
    /**
     * Time in milliseconds before user is considered idle
     * Defaults to 300000 (5 minutes)
     */
    timeout?: number;
    /**
     * Whether to start the detector in an idle state
     * Defaults to false
     */
    enabled?: boolean;
    /**
     * Set a unique id for the detector to allow for multiple detectors
     */
    id?: string;
    /** Event that triggers when user is declared idle */
    onIdle?: () => void;
    /** Event that triggers when user is declared active */
    onActive?: () => void;
  }

  const ActivityDetector: React.FC<ActivityDetectorProps>;
  export default ActivityDetector;
}
