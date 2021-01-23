import React from 'react';
import { render } from 'react-dom';
import ActivityDetector from 'react-activity-detector';

const customActivityEvents = [
  'click',
  'keydown',
];

const signOut =()=> {
console.log("The user is loged out");
}

render(
  <div>
    <h2>React Boilerplate Demo</h2>
    <ActivityDetector activityEvents={customActivityEvents} isActive={true} timeout={5*1000} signOut={signOut}/>
  </div>, 
  document.getElementById('app')
);