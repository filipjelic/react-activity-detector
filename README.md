# react-activity-detector 😴

[![npm](https://img.shields.io/npm/v/react-activity-detector)](https://www.npmjs.com/package/react-activity-detector)
[![License](https://img.shields.io/github/license/filipjelic/react-activity-detector)](LICENSE)
[![Build Status](https://github.com/filipjelic/react-activity-detector/actions/workflows/ci.yml/badge.svg)](https://github.com/filipjelic/react-activity-detector/actions)

## Small and simple library to check if the user is idle.

Works across browser tabs: activity in one tab keeps the user active in the others.

### Install
```bash
npm install --save react-activity-detector
```

### Requirements

- `react` and `react-dom` 16.8 or newer (peer dependencies). The detector uses React hooks, which were added in 16.8.

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
};

const onActive = () => {
    console.log("The user is active!");
};

<ActivityDetector activityEvents={customActivityEvents} enabled={true} timeout={5*1000} onIdle={onIdle} onActive={onActive} name="default"/>
```

### Next.js (App Router)

The package is marked with `"use client"`, so it runs as a Client Component. Because `onIdle` and `onActive` are functions, they can't be passed from a Server Component. Render the detector from your own Client Component instead:

```javascript
// app/IdleWatcher.js
"use client";

import ActivityDetector from 'react-activity-detector';
import { useRouter } from 'next/navigation';

export default function IdleWatcher() {
    const router = useRouter();

    return (
        <ActivityDetector
            enabled={true}
            timeout={15 * 60 * 1000}
            onIdle={() => router.push('/logout')}
        />
    );
}
```

Then use `<IdleWatcher />` anywhere, including in a Server Component such as `app/layout.js`.

### Parameter options

- `enabled`: Boolean value indicating if the A.D. is enabled. Default value is `false`. While disabled, `onIdle` is never called and the detector doesn't affect other tabs. Enabling it starts a fresh `timeout`.
- `timeout`: time in milliseconds of inactivity after which `onIdle` is called. Default value is `300000` (5 minutes).
- `onIdle`: function called when the user has been inactive for `timeout` milliseconds.
- `onActive`: function called on every tracked activity event.
- `activityEvents`: events used to detect if the user is active. Default list of Activity Events is `['click', 'mousemove', 'keydown', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'focus']`. If no events are passed, the default list is used. Any other window event name (for example `'scroll'`) can be used too.
- `name`: links detectors across browser tabs. Detectors with the same `name` share one idle deadline, so activity in one tab delays `onIdle` in the others. Use different names for detectors that should go idle independently. Default value is `default`.

All props can change while the detector is running; the new values are used right away.

### How it works

Each detector listens for the activity events on `window` and restarts its idle timer on activity. The idle deadline is also written to `localStorage` under a key based on `name`, and detectors in other tabs pick it up through the `storage` event.

Several detectors on the same page each keep their own timer, even when they share a `name`.

If `localStorage` is unavailable (for example when storage is blocked), the detector still works within the tab, just without syncing across tabs.
