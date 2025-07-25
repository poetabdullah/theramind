import React from "react";
import Footer from "../components/Footer";
import BreathingExercise from "../components/BreathingExercise";
import GuidedMeditation from "../components/GuidedMeditation";
import MeditationHeader from "../components/MeditationHeader";
import MeditationImportance from "../components/MeditationImportance";
import MeditationBenefits from "../components/MeditationBenefits";
import VideoGallery from "../components/VideoGallery";

const Meditation = () => {
  return (
    <>
      <div className="meditation-container">
        <MeditationHeader />
        <MeditationImportance />
        <MeditationBenefits />
        <GuidedMeditation />
        <BreathingExercise />
        <VideoGallery />
      </div>
      <Footer />
    </>
  );
};

export default Meditation;
