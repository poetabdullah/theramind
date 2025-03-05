import React from 'react';
import BannerSlider from '../components/BannerSlider';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import MeditationSection from '../components/MeditationSection';
import FeatureSection from '../components/FeatureSection';
import Testimonial from '../components/Testimonial';
import TestPrompt from '../components/TestPrompt';
import GlobalTarget from '../components/GlobalTarget';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const HomePage = () => (
  <>
    <BannerSlider />
    <Services />
    <HowItWorks />
    <TestPrompt />
    <MeditationSection/>
    <FeatureSection/>
    <GlobalTarget/>
    <Testimonial />
    <FAQ />
    <Footer />
  </>
);

export default HomePage;
