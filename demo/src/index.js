import React from 'react';
import ReactDOM from 'react-dom';
import ActivityDetector from 'react-activity-detector';

const customActivityEvents = [
  'click',
  'keydown',
];

const signOut = () => {
console.log("The user is loged out");
}


ReactDOM.render(
  <React.StrictMode>
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App</code> and save to reload.
        </p>
        <ActivityDetector activityEvents={customActivityEvents} isActive={true} timeout={5*1000} signOut={signOut}/>
        </header>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);