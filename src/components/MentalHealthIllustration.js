// File: /components/MentalHealthIllustration.js
import React from "react";

const MentalHealthIllustration = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      className="w-full drop-shadow-2xl"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3e7ff" />
          <stop offset="100%" stopColor="#ffe8d9" />
        </linearGradient>

        {/* Glow effects */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Pattern for texture */}
        <pattern
          id="pattern-circles"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="20" cy="20" r="2" fill="#9333ea" opacity="0.1" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="800" height="600" fill="url(#bg-gradient)" />
      <rect
        width="800"
        height="600"
        fill="url(#pattern-circles)"
        opacity="0.5"
      />

      {/* Center circular platform */}
      <circle
        cx="400"
        cy="320"
        r="180"
        fill="#faf5ff"
        stroke="#d8b4fe"
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Brain outline representing mental health */}
      <path
        d="M460,220 C520,200 540,260 520,300 C550,330 530,380 490,390 C470,420 420,430 390,410 C350,430 310,400 310,370 C270,350 270,300 310,280 C300,240 330,200 370,210 C390,180 440,200 460,220 Z"
        fill="#f0dafa"
        stroke="#9333ea"
        strokeWidth="3"
        filter="url(#glow)"
      />

      {/* Abstract connections representing community and support */}
      <path
        d="M310,280 C240,260 220,320 240,370"
        fill="none"
        stroke="#fb923c"
        strokeWidth="3"
        strokeDasharray="5,5"
      />
      <path
        d="M490,390 C550,410 570,350 550,300"
        fill="none"
        stroke="#fb923c"
        strokeWidth="3"
        strokeDasharray="5,5"
      />
      <path
        d="M370,210 C330,160 260,190 240,240"
        fill="none"
        stroke="#9333ea"
        strokeWidth="3"
        strokeDasharray="5,5"
      />

      {/* People silhouettes representing community */}
      <circle cx="240" cy="430" r="30" fill="#9333ea" opacity="0.7" />
      <path d="M240,460 L240,520" stroke="#9333ea" strokeWidth="6" />
      <path d="M240,480 L210,510" stroke="#9333ea" strokeWidth="6" />
      <path d="M240,480 L270,510" stroke="#9333ea" strokeWidth="6" />

      <circle cx="320" cy="450" r="25" fill="#fb923c" opacity="0.7" />
      <path d="M320,475 L320,525" stroke="#fb923c" strokeWidth="5" />
      <path d="M320,490 L295,515" stroke="#fb923c" strokeWidth="5" />
      <path d="M320,490 L345,515" stroke="#fb923c" strokeWidth="5" />

      <circle cx="400" cy="460" r="28" fill="#9333ea" opacity="0.7" />
      <path d="M400,488 L400,540" stroke="#9333ea" strokeWidth="5" />
      <path d="M400,505 L375,530" stroke="#9333ea" strokeWidth="5" />
      <path d="M400,505 L425,530" stroke="#9333ea" strokeWidth="5" />

      <circle cx="480" cy="450" r="25" fill="#fb923c" opacity="0.7" />
      <path d="M480,475 L480,525" stroke="#fb923c" strokeWidth="5" />
      <path d="M480,490 L455,515" stroke="#fb923c" strokeWidth="5" />
      <path d="M480,490 L505,515" stroke="#fb923c" strokeWidth="5" />

      <circle cx="560" cy="430" r="30" fill="#9333ea" opacity="0.7" />
      <path d="M560,460 L560,520" stroke="#9333ea" strokeWidth="6" />
      <path d="M560,480 L530,510" stroke="#9333ea" strokeWidth="6" />
      <path d="M560,480 L590,510" stroke="#9333ea" strokeWidth="6" />

      {/* Floating elements representing mental health concepts */}
      <circle
        cx="330"
        cy="200"
        r="15"
        fill="#fb923c"
        opacity="0.6"
        filter="url(#glow)"
      />
      <circle
        cx="480"
        cy="180"
        r="12"
        fill="#9333ea"
        opacity="0.6"
        filter="url(#glow)"
      />
      <circle
        cx="270"
        cy="300"
        r="10"
        fill="#fb923c"
        opacity="0.6"
        filter="url(#glow)"
      />
      <circle
        cx="530"
        cy="320"
        r="14"
        fill="#9333ea"
        opacity="0.6"
        filter="url(#glow)"
      />
      <circle
        cx="450"
        cy="400"
        r="11"
        fill="#fb923c"
        opacity="0.6"
        filter="url(#glow)"
      />
      <circle
        cx="350"
        cy="380"
        r="13"
        fill="#9333ea"
        opacity="0.6"
        filter="url(#glow)"
      />

      {/* Heart symbol representing compassion */}
      <path
        d="M400,230 C430,190 490,200 500,240 C510,280 460,310 400,350 C340,310 290,280 300,240 C310,200 370,190 400,230 Z"
        fill="#fed7aa"
        stroke="#fb923c"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Text elements representing education */}
      <rect
        x="350"
        y="120"
        width="100"
        height="20"
        rx="10"
        fill="#9333ea"
        opacity="0.2"
      />
      <rect
        x="320"
        y="150"
        width="160"
        height="15"
        rx="7"
        fill="#9333ea"
        opacity="0.15"
      />
      <rect
        x="370"
        y="175"
        width="60"
        height="15"
        rx="7"
        fill="#9333ea"
        opacity="0.1"
      />
    </svg>
  );
};

export default MentalHealthIllustration;
