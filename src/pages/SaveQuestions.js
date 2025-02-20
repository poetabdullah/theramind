import { db } from "../firebaseConfig.js";
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
    },
    //Question # 6
    {
      id: "question4",
      text: "Which of the following situations are you facing these days?",
      type: "radio",
      options: [
        { name: "Stress", label: "Overwhelmed/irritated by minor issues & daily life activities" },
        { name: "Anxiety", label: "Constantly feeling anxious and nervous about things and situations without a clear reason" },
        { name: "Depression", label: "Feeling sad, depressed & lonely all the time" },
        { name: "Trauma", label: "Experienced a traumatic incident in life & having recurring thoughts about it" },
        { name: "OCD", label: "Obsessing over some particular things & feeling the need to make things “just right”" },
      ],
      category: "whichconditionpt1",
    },
    //Question # 7
    {
      id: "question5",
      text: "Are you facing any of the following symptoms these days?",
      type: "radio",
      options: [
        { name: "Stress", label: "Feeling overburdened by tasks & responsibilities" },
        { name: "Anxiety", label: "Feeling anxious & experiencing palpitations (racing of the heartbeat)" },
        { name: "Depression", label: "Feeling tired for most of the day even when you haven’t done anything" },
        { name: "Trauma", label: "Having nightmares & feeling startled/frightened about a traumatic incident" },
        { name: "OCD", label: "Feeling irritated when things are not going a certain way" },
      ],
      category: "whichconditionpt2",
    },
    //Question # 8
    {
      id: "question6",
      text: "How would you describe your overall mood recently?",
      type: "radio",
      options: [
        { name: "Stress", label: "Feeling a bit overloaded with tasks" },
        { name: "Anxiety", label: "Mostly worried or tense" },
        { name: "Depression", label: "Frequently feeling sad, lonely & empty" },
        { name: "Trauma", label: "Feeling fearful thinking about a past event" },
        { name: "OCD", label: "Feeling the urge to make things symmetrical & clean" },
      ],
      category: "whichconditionpt3",
    },
    //Question # 9
    {
      id: "question7",
      text: "Which of the following behavioral symptoms have you been facing lately?",
      type: "radio",
      options: [
        { name: "Stress", label: "Changes in eating habits (overeating & loss of appetite)" },
        { name: "Anxiety", label: "Avoiding situations that trigger anxiety" },
        { name: "Depression", label: "Withdrawal from social gatherings" },
        { name: "Trauma", label: "Risk-taking or self-destructive behavior" },
        { name: "OCD", label: "Excess cleaning, constantly arranging & repeatedly checking things" },
      ],
      category: "whichconditionpt4",
    },
    //Question # 10: Specific Questionnaire - OCD: Checking OCD
    {
      id: "question8",
      text: "I check things more often than necessary",
      type: "radio",
      options: [
        { label: "Not likely at all", score: 0 },
        { label: "A little", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "A lot", score: 3 },
        { label: "Extremely", score: 4 },
      ],
      category: "checkingocdpt1",
    },
    //Question # 11: 
    {
      id: "question9",
      text: "I repeatedly check doors, windows, drawers, etc.",
      type: "radio",
      options: [
        { label: "Not likely at all", score: 0 },
        { label: "A little", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "A lot", score: 3 },
        { label: "Extremely", score: 4 },
      ],
      category: "checkingocdpt2",
    },
    //Question # 11: 
    {
      id: "question10",
      text: "After turning them off, I repeatedly check the gas and water tabs and light switches.",
      type: "radio",
      options: [
        { label: "Not likely at all", score: 0 },
        { label: "A little", score: 1 },
        { label: "Moderately", score: 2 },
        { label: "A lot", score: 3 },
        { label: "Extremely", score: 4 },
      ],
      category: "checkingocdpt3",
    },
  ];
  for (const question of questions) {
    await setDoc(doc(db, "questions", question.id), question);
  }
  console.log("Questions saved separately in Firestore!");
}

saveQuestionsToFirestore();