import { motion } from 'framer-motion';
import { useState } from 'react';

const exercises = [
    { title: "Deep Breathing", steps: ["Inhale deeply through your nose", "Hold for 4 seconds", "Exhale slowly through your mouth"], image: "/img/exercise1.png" },
    { title: "Body Scan", steps: ["Focus on your toes", "Move your attention upward", "Relax each body part as you go"], image: "/img/exercise2.png" },
    { title: "Visualization", steps: ["Close your eyes", "Imagine a peaceful place", "Engage all your senses in the visualization"], image: "/img/exercise3.png" }
];

export default function GuidedMeditation() {
    const [selected, setSelected] = useState(0);

    return (
        <div className="guided-meditation-container">
            <div className="medimage-slider">
                <motion.div 
                    className="medslider-content"
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                    style={{
                        display: 'flex',
                        position: 'relative',
                        width: '100%',
                        height: '400px',
                        overflow: 'hidden'
                    }}
                >
                    {exercises.map((exercise, index) => (
                        <motion.div
                            key={index}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                left: `${(index - selected) * 100}%`,
                                transition: 'all 0.5s ease'
                            }}
                        >
                            <motion.img 
                                src={exercise.image} 
                                alt={exercise.title} 
                                className={selected === index ? 'active' : ''}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginTop: '20px' 
                }}>
                    {exercises.map((_, index) => (
                        <button 
                            key={index}
                            onClick={() => setSelected(index)}
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                margin: '0 5px',
                                background: selected === index ? '#ff4081' : 'rgba(0,0,0,0.3)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            </div>
            <div className="medcontent">
                <h2 className="medtitle">Guided Meditation</h2>
                <div className="exercise">
                    {exercises.map((exercise, index) => (
                        <motion.div 
                            key={index} 
                            className={`exercise-card ${selected === index ? 'active' : ''}`} 
                            onClick={() => setSelected(index)}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="exercise-title" style={{ 
                                color: selected === index ? 'white' : '#d87093'  // Using darkpink equivalent
                            }}>
                                {exercise.title}
                            </h3>
                            <ul className="steps">
                                {exercise.steps.map((step, i) => (
                                    <motion.li 
                                        key={i} 
                                        style={{ 
                                            color: selected === index ? 'white' : '#d87093'  // Using darkpink equivalent
                                        }}
                                        whileHover={{ 
                                            x: 10, 
                                            color: selected === index ? '#ffffff' : '#ff4081' 
                                        }}
                                    >
                                        {step}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}