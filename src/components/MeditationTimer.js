import React, { useState, useEffect } from "react";

const MeditationTimer = () => {
  const [time, setTime] = useState(300);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (running && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (!running && time !== 0) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [running, time]);

  const startTimer = () => setRunning(true);
  const stopTimer = () => setRunning(false);
  const resetTimer = () => {
    setTime(300);
    setRunning(false);
  };

  return (
    <section className="meditation-timer">
      <h2>Meditation Timer</h2>
      <div className="timer-content">
        <div className="timer">
          <span>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</span>
        </div>
        <div className="timer-buttons">
          <button onClick={startTimer}>Start</button>
          <button onClick={stopTimer}>Stop</button>
          <button onClick={resetTimer}>Reset</button>
        </div>
      </div>
    </section>
  );
};

export default MeditationTimer;
