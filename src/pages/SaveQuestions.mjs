import { db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

const saveQuestionsToFirestore = async () => {
  const questions = [
    {
      id: "question1",
      text: "Have you been feeling any of the following lately?",
      type: "checkbox",
      options: [
        { name: "depressedLonely", label: "Feeling depressed and lonely" },
        { name: "lossofInterest", label: "Loss of interest in activities" },
        { name: "repetitiveBehavior", label: "Repetitive behaviors" },
        { name: "difficultyBreathing", label: "Difficulty concentrating" },
        { name: "flashbacksNightmares", label: "Flashbacks/nightmares" },
        { name: "none", label: "None of the above" },
      ],
      category: "conditionornotpt1",
    },
    {
      id: "question2",
      text: "Are you having any of the following symptoms lately; shortness of breath, constant worry, fatigue/prolonged muscle tension, insomnia, being easily startled, or spending time on compulsive behaviors?",
      type: "radio",
      options: [
        { name: "symptoms", label: "Yes" },
        { name: "symptoms", label: "No" },
      ],
      category: "conditionornotpt2",
    },
    {
      id: "question3",
      text: "Have you had any thought that it was better if you were dead, or are you planning on ending your life?",
      type: "radio",
      options: [
        { name: "suicidalthoughts", label: "Yes" },
        { name: "suicidalthoughts", label: "No" },
      ],
      category: "suicidalthoughtsornot",
    },
  ];

  try {
    for (const question of questions) {
      await setDoc(doc(db, "questions", question.id), question);
      console.log(`Question ${question.id} saved successfully`);
    }
    console.log("All questions saved successfully in Firestore!");
  } catch (error) {
    console.error("Error saving questions:", error);
  }
};

// Explicitly call the function to ensure execution
saveQuestionsToFirestore();
