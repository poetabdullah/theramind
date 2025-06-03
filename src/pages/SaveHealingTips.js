import { db } from "../firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";

const saveQuestionsToFirestore = async () => {
  const healing_tips_meditations = {
    //Subtype # 1
    "Checking OCD": {
      meditation: [
        {
          title: "Meditation to Reduce Urges and Compulsions (15 Minutes)",
          url: "https://www.youtube.com/watch?v=o_hsmXRy7ls"
        },
        {
          title: "This simple trick can STOP compulsions",
          url: "https://www.youtube.com/watch?v=OxgIC08cpWY"
        }
      ],
      tips: [
        "1. Delay the urge – Wait 5–10 minutes before checking; gradually increase this delay.",
        "2. Limit checks – Set a rule (e.g., “I’ll check the lock only once”) and stick to it.",
        "3. Use breathing – Deep, slow breaths can help reduce anxiety before a compulsion."
      ]
    },
    //Subtype # 2
    "Symmetry OCD": {
      meditation: [
        {
          title: "5-minute meditation for OCD",
          url: "https://www.youtube.com/watch?v=Lf6FpYcsziw&t=94s"
        },
        {
          title: "OCD Meditation – 5 You Are Not Your Thoughts",
          url: "https://www.youtube.com/watch?v=NfeXlf4bZOs"
        }
      ],
      tips: [
        "1. Break the pattern – Intentionally leave things slightly asymmetrical.",
        "2. Delay symmetry acts – Wait before adjusting things; build tolerance.",
        "3. Use exposure – Gradually expose yourself to imbalance (e.g., misaligned objects)."
      ]
    },
    //Subtype # 3
    "Contamination OCD": {
      meditation: [
        {
          title: "Contamination or Health OCD Guided Meditation (15 Minutes). Let Go Germ Anxiety & Intrusive Fears.",
          url: "https://www.youtube.com/watch?v=tRQIdZqwrc0"
        },
        {
          title: "Mindfulness Exercises for OCD",
          url: "https://www.youtube.com/watch?v=-jn7FRIEYv0"
        }
      ],
      tips: [
        "1. Resist extra washing – Wash once, not repeatedly; trust that it's enough.",
        "2. Touch feared items – Gradually expose yourself to “contaminated” objects.",
        "3. Use “just right” tolerance – Practice leaving things slightly “dirty” or “off."
      ]
    },
    //Subtype # 4
    "Acute Stress": {
      meditation: [
        {
          title: "10 Minute Meditation to Release Stress & Anxiety | Total Body Relaxation",
          url: "https://www.youtube.com/watch?v=H_uc-uQ3Nkc"
        },
        {
          title: "4-7-8 Calm Breathing Exercise | 10 Minutes of Deep Relaxation | Anxiety Relief | Pranayama Exercise",
          url: "https://www.youtube.com/watch?v=LiUnFJ8P4gM"
        }
      ],
      tips: [
        "1. Breathe deeply – Inhale for 4, hold for 4, exhale for 4 to calm your system.",
        "2. Ground yourself – Use the 5-4-3-2-1 method to stay present (see, hear, feel, etc.).",
        "3. Limit stimulation – Step away from screens, noise, and crowds briefly."
      ]
    },
    //Subtype # 5
    "Chronic Stress": {
      meditation: [
        {
          title: "Quick Anxiety Relief Techniques: Vagus Nerve Reset With Yoga Nidra",
          url: "https://www.youtube.com/watch?v=yFx9APS3_iU"
        },
        {
          title: "Relieve Stress & Anxiety with Simple Breathing Techniques",
          url: "https://www.youtube.com/watch?v=odADwWzHR24"
        }
      ],
      tips: [
        "1. Exercise regularly – Even 15–20 minutes of movement lowers stress hormones.",
        "2. Create routines – A predictable daily rhythm reduces mental overload.",
        "3. Practice mindfulness – Spend a few minutes each day focused on your breath or senses."
      ]
    },
    //Subtype # 6
    "Episodic Acute Stress": {
      meditation: [
        {
          title: "10 Minute Meditation to Release Stress & Anxiety | Total Body Relaxation",
          url: "https://www.youtube.com/watch?v=H_uc-uQ3Nkc&t=3s"
        },
        {
          title: "4-7-8 Calm Breathing Exercise | 10 Minutes of Deep Relaxation | Anxiety Relief | Pranayama Exercise",
          url: "https://www.youtube.com/watch?v=LiUnFJ8P4gM"
        }
      ],
      tips: [
        "1. Identify patterns – Notice what repeatedly triggers your stress episodes.",
        "2. Declutter commitments – Avoid overloading your calendar or saying yes too often.",
        "3. Celebrate calm – Acknowledge and reinforce peaceful stretches between episodes."
      ]
    },
    //Subtype # 7
    "Major Depressive Disorder": {
      meditation: [
        {
          title: "10-Minute Meditation For Depression",
          url: "https://www.youtube.com/watch?v=xRxT9cOKiM8"
        },
        {
          title: "How To Use Mindfulness For Depression",
          url: "https://www.youtube.com/watch?v=6SAFvliImdU"
        }
      ],
      tips: [
        "1. Set small goals – Break tasks into tiny, doable steps to avoid overwhelm.",
        "2. Limit negative input – Reduce exposure to distressing news or social media.",
        "3. Engage in enjoyable activities – Do things that once brought joy, even if it feels hard."
      ]
    },
    //Subtype # 8
    "Postpartum Depression": {
      meditation: [
        {
          title: "POST PARTUM DEPRESSION - A Short Guided MEDITATION, Supporting New Moms",
          url: "https://www.youtube.com/watch?v=zAzlxEZv3Uk"
        },
        {
          title: "DE-STRESS Affirmation Meditation | Postpartum Guided Meditation",
          url: "https://www.youtube.com/watch?v=bXk916CpGxw"
        }
      ],
      tips: [
        "1. Ask for help – Let family or friends support you with baby care or chores.",
        "2. Avoid comparisons – Every mom and baby journey is unique.",
        "3. Share your feelings – Talk openly with loved ones or a counselor."
      ]
    },
    //Subtype # 9
    "Atypical Depression": {
      meditation: [
        {
          title: "The Sunrise: meditation and visualization exercise. Included in depression treatment - Flow",
          url: "https://www.youtube.com/watch?v=uWEvseYTpVs"
        },
        {
          title: "10-Minute Meditation For Depression",
          url: "https://www.youtube.com/watch?v=xRxT9cOKiM8"
        }
      ],
      tips: [
        "1. Stay socially connected – Reach out to friends or family regularly.",
        "2. Limit caffeine and sugar – Avoid spikes and crashes that affect mood.",
        "3. Keep a sleep routine – Aim for consistent sleep to stabilize mood."
      ]
    },
    //Subtype # 10
    "Generalized Anxiety Disorder": {
      meditation: [
        {
          title: "Guided Meditation for Anxiety | The Hourglass",
          url: "https://www.youtube.com/watch?v=pU80BEm43JM"
        },
        {
          title: "Mindful Breathing for Anxiety",
          url: "https://www.youtube.com/watch?v=v-w-vSvi-24"
        }
      ],
      tips: [
        "1. Practice deep breathing – Slow, steady breaths to calm your nervous system.",
        "2. Create a worry time – Set aside 10–15 minutes daily to focus on worries, then move on.",
        "3. Avoid avoidance – Face feared situations gradually to build confidence."
      ]
    },
    //Subtype # 11
    "Separation Anxiety Disorder": {
      meditation: [
        {
          title: "GUIDED MEDITATION for Healing Anxiety, PTSD, Panic & Stress",
          url: "https://www.youtube.com/watch?v=YzRUEmqDJd8"
        },
        {
          title: "5 Minute Quick Anxiety Reduction - Guided Mindfulness Meditation",
          url: "https://www.youtube.com/watch?v=MR57rug8NsM"
        }
      ],
      tips: [
        "1. Practice gradual separation – Start with short, manageable separations and build up.",
        "2. Prepare for separation – Plan activities to look forward to when apart.",
        "3. Create goodbye rituals – A special wave, hug, or phrase can ease parting stress."
      ]
    },
    //Subtype # 12
    "Panic Disorder": {
      meditation: [
        {
          title: "Guided Breathing Exercise Meditation Panic Attacks & Anxiety",
          url: "https://www.youtube.com/watch?v=uQ6n9ypZu1s"
        },
        {
          title: "Use this Video to Stop a Panic Attack",
          url: "https://www.youtube.com/watch?v=vXZ5l7G6T2I"
        }
      ],
      tips: [
        "1. Recognize panic signs – Remind yourself it’s a panic attack, not a heart attack.",
        "2. Avoid caffeine and stimulants – They can trigger or worsen panic attacks.",
        "3. Create a safe space – Find or imagine a calming place during attacks."
      ]
    },
    //Subtype # 13
    "Single Event Trauma": {
      meditation: [
        {
          title: "Guided Meditation for Trauma Healing & PTSD",
          url: "https://www.youtube.com/watch?v=eiB-ibIwJN4"
        },
        {
          title: "Safe Place Meditation for PTSD and Trauma | The Nature Reserve",
          url: "https://www.youtube.com/watch?v=wgsEKBXMiPI"
        }
      ],
      tips: [
        "1. Allow yourself to feel – It’s okay to experience emotions; don’t bottle them up.",
        "2. Limit triggers – Avoid situations or media that intensify trauma symptoms temporarily.",
        "3. Use calming techniques – Deep breathing, meditation, or gentle movement help ease distress."
      ]
    },
    //Subtype # 14
    "Complex Trauma": {
      meditation: [
        {
          title: "Meditation for Breaking TRAUMA BONDS | 10 Minute Daily Routines",
          url: "https://www.youtube.com/watch?v=gB0C6pYPiDg"
        },
        {
          title: "Guided Meditation for Complex PTSD",
          url: "https://www.youtube.com/watch?v=RahidNEDtt0"
        }
      ],
      tips: [
        "1. Build safety first – Create stable routines and safe spaces.",
        "2. Use gentle movement – Yoga, walking, or stretching can soothe the body.",
        "3. Seek connection – Build supportive, trusting relationships."
      ]
    },
    //Subtype # 15
    "Developmental Trauma": {
      meditation: [
        {
          title: "Healing Your Inner Child (Guided Meditation)",
          url: "https://www.youtube.com/watch?v=8gLpFjzHzYQ"
        },
        {
          title: "Guided sleep meditation for trauma release and trauma healing Healing calming relaxing stress relief",
          url: "https://www.youtube.com/watch?v=8Okhs4-pLUI"
        }
      ],
      tips: [
        "1. Build emotional awareness – Notice and name your feelings without judgment.",
        "2. Set healthy boundaries – Learn to say no and protect your personal space.",
        "3. Seek trauma-informed therapy – Professional support helps address deep wounds."
      ]
    },
  }
}

async function populateHealingTips() {
  try {
    for (const [diagnosedSubtype, data] of Object.entries(healingTipsData)) {
      const docRef = db.collection("healing_tips_meditations").doc(diagnosedSubtype);
      await docRef.set(data);
      console.log(`Inserted tips for subtype: ${diagnosedSubtype}`);
    }
    console.log("All healing tips populated successfully.");
  } catch (error) {
    console.error("Error populating healing tips:", error);
  }
}

populateHealingTips();
   