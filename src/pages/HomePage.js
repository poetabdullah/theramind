import React from 'react';
import Banner from '../components/Banner';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import MeditationSection from '../components/MeditationSection';
import FeatureSection from '../components/FeatureSection';
import Testimonial from '../components/Testimonial';
import TestPrompt from '../components/TestPrompt';
import Footer from '../components/Footer';

const HomePage = () => (
  <>
    <Banner />
    <Services />
    <HowItWorks />
    <TestPrompt />
    <MeditationSection/>
    <FeatureSection/>
    <Testimonial />
    <Footer />
  </>
);

export default HomePage;
