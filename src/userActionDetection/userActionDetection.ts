export type UserActionDetection = (callBack: () => void, key?: string) => () => void;

export const detectKeyUpDown = (onKeyDown: () => void, onKeyUp: () => void, key = 'x') => {
  let isKeyPressed = false;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === key.toLowerCase() && !isKeyPressed) {
      isKeyPressed = true;
      onKeyDown();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === key.toLowerCase() && isKeyPressed) {
      isKeyPressed = false;
      onKeyUp();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
};
