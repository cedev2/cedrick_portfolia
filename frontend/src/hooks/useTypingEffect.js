import { useEffect, useRef, useState } from 'react';

/**
 * Types a list of phrases one character at a time, then pauses before
 * restarting with the next phrase. Mirrors the legacy hero typewriter.
 */
export const useTypingEffect = (phrases = [], options = {}) => {
  const { typeSpeed = 90, deleteSpeed = 45, pauseTime = 1600, loop = true } = options;

  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!phrases.length) return undefined;

    const current = phrases[index % phrases.length];

    const tick = () => {
      if (!isDeleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);

        if (next === current) {
          setIsDeleting(true);
          timerRef.current = window.setTimeout(tick, pauseTime);
          return;
        }
        timerRef.current = window.setTimeout(tick, typeSpeed);
        return;
      }

      const next = current.slice(0, text.length - 1);
      setText(next);

      if (next === '') {
        setIsDeleting(false);
        setIndex((value) => (loop ? (value + 1) % phrases.length : value));
        return;
      }

      timerRef.current = window.setTimeout(tick, deleteSpeed);
    };

    timerRef.current = window.setTimeout(tick, typeSpeed);

    return () => window.clearTimeout(timerRef.current);
  }, [phrases, index, isDeleting, text, typeSpeed, deleteSpeed, pauseTime, loop]);

  return text;
};

export default useTypingEffect;
