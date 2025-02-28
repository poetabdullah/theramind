import React from "react";

const Testimonial = () => {
  return (
    <section className="testimonial-section">
      <h2 className="testimonial-heading">
        Here is What the TheraMind Users Have to Say
      </h2>
      <div className="testimonial-content">
        <p>
          Its fantastic to see resources like this available. Mental health is
          just as important as physical health, and this website provides
          valuable information and support. Well done to everyone involved. I
          encourage everyone to visit this website and take advantage of the
          resources available. Lets break the stigma surrounding mental health
          and prioritize our well-being. Together, we can create a more
          supportive and understanding environment for everyone.
        </p>
        <p>
          <strong>Pat Cummins</strong>
          <br />
          Australia Mens Cricket Team Captain
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