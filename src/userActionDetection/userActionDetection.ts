export type UserActionDetection = (callBack: () => void, key?: string) => () => void;

export const detectKeyPress: UserActionDetection = (callback, key = 'x') => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === key.toLowerCase()) {
      callback();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
};
