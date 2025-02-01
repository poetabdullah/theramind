import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const saveQuestionsToFirestore = async () => {
  const questions = [
    //Question # 1
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
    //Question # 2
    {
      id: "question2",
      text: "Are you having any of the following symptoms lately; shortness of breath, constant worry, fatigue/ prolonged muscle tension, insomnia, being easily startled, or spending time on compulsive behaviors?",
      type: "radio",
      options: [
        { name: "symptoms", label: "Yes" },
        { name: "symptoms", label: "No" },
      ],
      category: "conditionornotpt2",
    },
    //Question # 4
    {
      id: "question3",
      text: "Have you had any thought that it was better if you were dead, or are you planning on ending your life?",
      type: "radio",
      options: [
        { name: "suicidalthoughts", label: "Yes" },
        { name: "suicidalthoughts", label: "No" },
      ],
      category: "suicidalthoughtsornot",
    }
  ];
  for (const question of questions) {
    await setDoc(doc(db, "questions", question.id), question);
  }
  console.log("Questions saved separately in Firestore!");
}

saveQuestionsToFirestore();