import React from "react";

const images = [
  { src: "img1.jpg", text: "Reduces Stress" },
  { src: "img2.jpg", text: "Improves Focus" },
  { src: "img3.jpg", text: "Enhances Self-Awareness" }
];

const ImageGallery = () => {
  return (
    <section className="image-gallery">
      <h2 className="section-title">Why Meditation is Important?</h2>
      <div className="gallery">
        {images.map((image, index) => (
          <div key={index} className="gallery-item">
            <img src={image.src} alt={image.text} />
            <p>{image.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageGallery;