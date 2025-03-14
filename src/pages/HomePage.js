import React from 'react';
import BannerSlider from '../components/BannerSlider';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import MythCards from '../components/MythCards';
import MeditationSection from '../components/MeditationSection';
import FeatureSection from '../components/FeatureSection';
import Testimonial from '../components/Testimonial';
import TestPrompt from '../components/TestPrompt';
import GlobalTarget from '../components/GlobalTarget';
import TheraChatSection from '../components/TheraChatSection';
import EducationSection from '../components/EducationSection';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const HomePage = () => (
  <>
    <BannerSlider />
    <Services />
    <HowItWorks />
    <MythCards />
    <TestPrompt />
    <MeditationSection/>
    <EducationSection/>
    <TheraChatSection/>
    <FeatureSection/>
    <GlobalTarget/>
    <Testimonial />
    <FAQ />
    <Footer />
  </>
);

export default HomePage;
