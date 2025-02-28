import React from "react";

const MeditationSection = () => {
  return (
    <div className="hpmeditation-container">
      <div className="image-section">
        <img src="https://img.freepik.com/free-vector/yoga-school-instructor-meditation-practice-relaxation-techniques-body-stretching-exercises-female-yogi-lotus-pose-spiritual-balance-guru_335657-3611.jpg?t=st=1740750744~exp=1740754344~hmac=1ed13d23b577be54fab3d87a4518af3408b12449e81d799a9394e9b0e4480c56&w=740" alt="Peaceful Meditation" className="hpmeditation-image" />
      </div>
      <div className="text-section">
        <h2 className="title">What is Mindfulness Meditation?</h2>
        <p className="description">
          Join us and learn the science behind mindfulness, as well as practical,
          scientifically-proven techniques for reducing stress and cultivating well-being.
        </p>
        <a href="/meditation" className="cta-button">Explore Meditation</a>
      </div>
    </div>
  );
};

export default MeditationSection;