# Activity Detector

[![npm](https://img.shields.io/npm/l/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)
[![npm](https://img.shields.io/npm/v/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)

This components helps you detect when your user has become idle, or not interacting with your application. It is also cross-tab.

## Install
```
$ npm install --save react-activity-detector
```

## How to use

### Basic example
```javascript
const customActivityEvents = [
    'click',
    'keydown',
];

const signOut = () => {
console.log("The user is loged out");
}

<ActivityDetector activityEvents={customActivityEvents} isActive={true} timeout={5*1000} signOut={signOut}/>
```

### Parameter options

- `isActive`: Boolean value indicating if the AD is active or not.
- `activityEvents`: evnets used to detect if the user is active or not. Default list of activityEvents is `['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus']`