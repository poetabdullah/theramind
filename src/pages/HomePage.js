import React from 'react';
import Banner from '../components/Banner';
import Questionnaire from '../components/Questionnaire';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import Testimonial from '../components/Testimonial';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const HomePage = () => (
  <>
    <Banner />
    <Services />
    <Questionnaire />
    <HowItWorks />
    <Testimonial />
    <Contact />
    <Footer />
  </>
);

export default HomePage;
