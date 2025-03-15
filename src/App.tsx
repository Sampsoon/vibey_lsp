import { useEffect, useState } from 'react';
import './App.css';
import { detectKeyPress } from './userActionDetection';

function App() {
  const [keyPressCount, setKeyPressCount] = useState(0);

  useEffect(() => {
    const cleanup = detectKeyPress(() => {
      setKeyPressCount((prev) => prev + 1);
      console.log('X key was pressed!');
    });

    return cleanup;
  }, []);

  return (
    <>
      <div>hello Scribe app</div>
      <div>
        <p>Press the 'x' key to trigger the action</p>
        <p>X key pressed: {keyPressCount} times</p>
      </div>
    </>
  );
}

export default App;
