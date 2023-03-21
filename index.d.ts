declare module "react-activity-detector" {
  import React from "react";

  export interface ActivityDetectorProps {
    activityEvents?: string[];
    timeout?: number;
    enabled?: boolean;
    onIdle?: () => void;
    onActive?: () => void;
  }

  const ActivityDetector: React.FC<ActivityDetectorProps>;
  export default ActivityDetector;
}
