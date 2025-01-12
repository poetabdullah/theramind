import React from "react";

const Testimonial = () => {
  return (
    <section className="testimonial-section">
      <h2 className="testimonial-heading">
        Here is What the TheraMind Users Have to Say
      </h2>
      <div className="testimonial-content">
        <p>
          “It’s fantastic to see resources like this available. Mental health is
          just as important as physical health, and this website provides
          valuable information and support. Well done to everyone involved. I
          encourage everyone to visit this website and take advantage of the
          resources available. Let’s break the stigma surrounding mental health
          and prioritize our well-being. Together, we can create a more
          supportive and understanding environment for everyone. It’s important
          to remember that it’s okay to not be okay, and seeking help is a sign
          of strength, not weakness.”
        </p>
        <p>
          <strong>Pat Cummins</strong>
          <br />
          Australia Men’s Cricket Team Captain
        </p>
        <a href="#" className="testimonial-link">
          Learn More &rarr;
        </a>
      </div>
      <div className="testimonial-buttons">
        <button>?</button>
        <button>?</button>
      </div>
    </section>
  );
};

export default Testimonial;