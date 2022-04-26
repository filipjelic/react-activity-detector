# react-activity-detector 😴

[![npm](https://img.shields.io/npm/v/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)
[![License](https://img.shields.io/github/license/filipjelic/react-activity-detector)]((LICENSE))
[![Build Status](https://github.com/filipjelic/react-activity-detector/actions/workflows/CI-CD.yml/badge.svg)](https://github.com/filipjelic/react-activity-detector/actions)

## Small and simple library to check if the user is idle.

### Install
```
$ npm install --save react-activity-detector
```

## How to use

### Basic example
```javascript
import ActivityDetector from 'react-activity-detector';

const customActivityEvents = [
    'click',
    'keydown',
];

const onIdle = () => {
console.log("The user seems to be idle...");
}

const onActive = () => {
console.log("The user is active!");
}

<ActivityDetector activityEvents={customActivityEvents} enabled={true} timeout={5*1000} onIdle={onIdle} onActive={onActive}/>
```

### Parameter options

- `enabled`: Boolean value indicating if the A.D. is enabled.
- `timeout` time in milliseconds which will trigger `onIdle`
- `activityEvents`: events used to detect if the user is active. Default list of Activity Events is `['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus']`. If none event is sent the list will consume the default one.
