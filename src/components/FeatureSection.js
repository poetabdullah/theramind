import React from "react";

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
    return (
      <div className="feature-card">
        <div className="icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    );
  };
  
  // Feature Section
  export const FeatureSection = () => {
    const features = [
      { icon: "📦", title: "Complete Toolbox", description: "We’re not like other therapy websites! You get all the tools and support you need to be happier - now and in the future." },
      { icon: "⭐", title: "Top Quality Therapy", description: "Our program is based on proven, well-researched treatments drawn from CBT. Our therapists are highly qualified with a wide range of credentials." },
      { icon: "🔒", title: "Secure & Confidential", description: "All your information is transferred end-to-end encrypted to our secure server, where only you and your therapist can access it." },
      { icon: "🕒", title: "Accessible & Time-saving", description: "There is no hassle with traveling or keeping an appointment. You can get help from wherever you are in the world." }
    ];
    
    return (
      <div className="feature-section">
        <h2>Why should I choose TheraMind</h2>
        <div className="features-container">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    );
  };
  
  export default FeatureSection;