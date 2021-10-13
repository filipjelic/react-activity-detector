# react-activity-detector 😴

[![npm](https://img.shields.io/npm/v/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)
[![npm](https://img.shields.io/npm/l/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)

## Activity detector is a package which makes it simple to track if your user is still idle or active.

### Install
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
- `activityEvents`: events used to detect if the user is active or not. Default list of Activity Events is `['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus']`. If none event is sent the list will consume the default one.
