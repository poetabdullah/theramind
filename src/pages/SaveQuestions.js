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
      questionNumber: 1
    },
    //Question # 2
    {
      id: "question2",
      text: "Are you having any of the following symptoms lately; shortness of breath, constant worry, fatigue/ prolonged muscle tension, insomnia, being easily startled, or spending time on compulsive behaviors?",
      type: "radio",
      options: [
        { name: "yes_symptoms", label: "Yes" },
        { name: "no_symptoms", label: "No" },
      ],
      category: "conditionornotpt2",
      questionNumber: 2
    },
    //Question # 4
    {
      id: "question3",
      text: "Have you had any thought that it was better if you were dead, or are you planning on ending your life?",
      type: "radio",
      options: [
        { name: "yes_suicidalthoughts", label: "Yes" },
        { name: "no_suicidalthoughts", label: "No" },
      ],
      category: "suicidalthoughtsornot",
      questionNumber: 3
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
      questionNumber: 4
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
      questionNumber: 5
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
      questionNumber: 6
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
      questionNumber: 7
    },
    //Question # 10: Specific Questionnaire - OCD: Checking OCD
    {
      id: "question8",
      text: "I check things more often than necessary",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Checking OCD",
      questionNumber: 8
    },
    //Question # 11: 
    {
      id: "question9",
      text: "I repeatedly check doors, windows, drawers, etc.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Checking OCD",
      questionNumber: 9
    },
    //Question # 11: 
    {
      id: "question10",
      text: "After turning them off, I repeatedly check the gas and water tabs and light switches.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Checking OCD",
      questionNumber: 10
    },
    //Question # 12: Specific Questionnaire - OCD: Symmetry/Ordering OCD
    {
      id: "question11",
      text: "I get upset if things are not arranged properly.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Symmetry OCD",
      questionNumber: 11
    },
    //Question # 13
    {
      id: "question12",
      text: "I get upset if others change the way I have arranged things.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Symmetry OCD",
      questionNumber: 12
    },
    //Question # 14
    {
      id: "question13",
      text: "I need things to be arranged in a particular way.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Symmetry OCD",
      questionNumber: 13
    },
    //Question # 15: Specific Questionnaire - OCD: Contamination OCD
    {
      id: "question14",
      text: "I find it difficult to touch an object when I know it has been touched by strangers or certain people.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Contamination OCD",
      questionNumber: 14
    },
    //Question # 16
    {
      id: "question15",
      text: "I sometimes have to wash or clean myself simply because I feel contaminated.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Contamination OCD",
      questionNumber: 15
    },
    //Question # 17
    {
      id: "question16",
      text: "I wash my hands more often and longer than necessary.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "A lot", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Contamination OCD",
      questionNumber: 16
    },
    //Question # 18: Specific Questionnaire - Stress: Acute Stress 
    {
      id: "question17",
      text: "How often have you experienced flashbacks of a stressful event in the past?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Acute Stress",
      questionNumber: 17
    },
    //Question # 19 
    {
      id: "question18",
      text: "When reminded of a stressful experience, how emotionally upset do you feel?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Acute Stress",
      questionNumber: 18
    },
    //Question # 20 
    {
      id: "question19",
      text: "How often do you avoid reminders of a stressful event?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Acute Stress",
      questionNumber: 19
    },
    //Question # 21
    {
      id: "question20",
      text: "How jumpy or easily startled do you feel?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Acute Stress",
      questionNumber: 20
    },
    //Question # 22
    {
      id: "question21",
      text: "How often do you have trouble sleeping since the stressful event occurred?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Acute Stress",
      questionNumber: 21
    },
    //Question # 23: Specific Questionnaire - Stress: Chronic Stress 
    {
      id: "question22",
      text: "Over the past few weeks, how overwhelmed have you felt by stress?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Chronic Stress",
      questionNumber: 22
    },
    //Question # 24
    {
      id: "question23",
      text: "How often have you experienced physical symptoms like headaches or fatigue due to stress?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Chronic Stress",
      questionNumber: 23
    },
    //Question # 25
    {
      id: "question24",
      text: "How irritable or angry do you feel without a clear reason?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Chronic Stress",
      questionNumber: 24
    },
    //Question # 26
    {
      id: "question25",
      text: "How often do you have difficulty concentrating on tasks due to stress?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Chronic Stress",
      questionNumber: 25
    },
    //Question # 27
    {
      id: "question26",
      text: "How frequently are you worried about multiple aspects of your life (e.g., work, family)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Chronic Stress",
      questionNumber: 26
    },
    //Question # 28: Specific Questionnaire - Stress: Episodic Acute Stress 
    {
      id: "question27",
      text: "How often do you experience stress in episodes or bursts triggered by specific situations?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Episodic Acute Stress",
      questionNumber: 27
    },
    //Question # 29
    {
      id: "question28",
      text: "When stressed, how tense or on edge do you feel?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Episodic Acute Stress",
      questionNumber: 28
    },
    //Question # 30
    {
      id: "question29",
      text: "How often have you had sudden emotional outbursts in response to stress?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Episodic Acute Stress",
      questionNumber: 29
    },
    //Question # 31
    {
      id: "question30",
      text: "How hard do you find it to relax during or after stressful episodes?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Episodic Acute Stress",
      questionNumber: 30
    },
    //Question # 32
    {
      id: "question31",
      text: "How often have you noticed a pattern of stress that comes and goes related to certain events or triggers?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Episodic Acute Stress",
      questionNumber: 31
    },
    //Question # 33: Specific Questionnaire - Depression: Major Depressive Disorder 
    {
      id: "question32",
      text: "Over the past 2 weeks,  Have you noticed changes in your appetite or weight (eating too much or too little)?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Major Depressive Disorder",
      questionNumber: 32
    },
    //Question # 34
    {
      id: "question33",
      text: "Have you experienced trouble sleeping, either by sleeping too much or struggling to fall or stay asleep?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Major Depressive Disorder",
      questionNumber: 33
    },
    //Question # 35
    {
      id: "question34",
      text: "In the past 2 weeks how often have you experienced the following: feeling hopeless, sense of worthlessness, trouble focusing or indecisiveness.",
      type: "radio",
      options: [
        { name: "Not at all", label: "Not likely at all", score: 0 },
        { name: "Several days", label: "A little", score: 1 },
        { name: "More than half the days", label: "Moderately", score: 2 },
        { name: "Nearly every day", label: "A lot", score: 3 },
      ],
      category: "Major Depressive Disorder",
      questionNumber: 34
    },
    //Question # 36
    {
      id: "question35",
      text: "Have you had thoughts of death, suicide, or harming yourself?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Major Depressive Disorder",
      questionNumber: 35
    },
    //Question # 37: Specific Questionnaire - Depression: Postpartum Depression
    {
      id: "question36",
      text: "Have you had a baby within the past 12 months?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Postpartum Depression",
      questionNumber: 36
    },
    //Question # 38
    {
      id: "question37",
      text: "Since the birth of your child, have you experienced the following: feeling overwhelmed about the ability to care for your baby, crying for no reason, difficulty in bonding or guilt or shame about how you feel as a mother?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Postpartum Depression",
      questionNumber: 37
    },
    //Question # 39
    {
      id: "question38",
      text: "Since the birth of your child, Have you had any thoughts of harming yourself or your baby?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Postpartum Depression",
      questionNumber: 38
    },
    //Question # 40: Specific Questionnaire - Depression: Atypical Depression
    {
      id: "question39",
      text: "Over the past 2 weeks Did you experience intense feelings of sadness, but felt better temporarily if something good happened?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Atypical Depression",
      questionNumber: 39
    },
    //Question # 41
    {
      id: "question40",
      text: "Have you experienced a change in your sleep patterns and noticed that you feel excessively tired, even after sleeping for long periods?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Atypical Depression",
      questionNumber: 40
    },
    //Question # 42
    {
      id: "question41",
      text: "Have you gained weight recently without trying to?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Atypical Depression",
      questionNumber: 41
    },
    //Question # 43
    {
      id: "question42",
      text: "In the past 2 weeks, how often have you experienced the following: increased appetite or cravings, overly sensitive to rejection & criticism or a sense of heaviness in arms or legs?",
      type: "radio",
      options: [
        { name: "Not at all", label: "Not likely at all", score: 0 },
        { name: "Several days", label: "A little", score: 1 },
        { name: "More than half the days", label: "Moderately", score: 2 },
        { name: "Nearly every day", label: "A lot", score: 3 },
      ],
      category: "Atypical Depression",
      questionNumber: 42
    },
    //Question # 44: Specific Questionnaire - Anxiety: Generalized Anxiety Disorder 
    {
      id: "question43",
      text: "Over the past 6 months, how often have you felt excessive worry about certain aspects of life (e.g. work, health, study)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Generalized Anxiety Disorder",
      questionNumber: 43
    },
    //Question # 45
    {
      id: "question44",
      text: "Do you find it difficult to control your worry?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Generalized Anxiety Disorder",
      questionNumber: 44
    },
    //Question # 46
    {
      id: "question45",
      text: "How often have you experienced the following symptoms in the past 6 months? Feeling on edge, having muscle tension, irritability, difficulty concentrating or difficulty sleeping.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Generalized Anxiety Disorder",
      questionNumber: 45
    },
    //Question # 47: Specific Questionnaire - Anxiety: Panic Disorder 
    {
      id: "question46",
      text: "Over the past month, have you experienced unexpected and recurrent panic attacks (sudden periods of intense fear or discomfort)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Panic Disorder",
      questionNumber: 46
    },
    //Question # 48
    {
      id: "question47",
      text: "During a panic attack, do you experience the following symptoms? accelerated heart rate, sweating, trembling, feeling dizzy or nausea or fear of dying.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Panic Disorder",
      questionNumber: 47
    },
    //Question # 49 
    {
      id: "question48",
      text: "Do you find yourself avoiding situations or places that might trigger a panic attack?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Panic Disorder",
      questionNumber: 48
    },
    //Question # 50
    {
      id: "question49",
      text: "After having a panic attack, are you worried about having another attack?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Panic Disorder",
      questionNumber: 49
    },
    //Question # 51: Specific Questionnaire - Anxiety: Separation Anxiety Disorder
    {
      id: "question50",
      text: "Do you feel excessive distress when anticipating or experiencing separation from home or major attachment figures (parents, spouse, etc.)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Separation Anxiety Disorder",
      questionNumber: 50
    },
    //Question # 52
    {
      id: "question51",
      text: "Do you feel intense worry about an event that could cause separation from loved ones (e.g., getting lost, being kidnapped)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Separation Anxiety Disorder",
      questionNumber: 51
    },
    //Question # 53
    {
      id: "question52",
      text: "When separated from loved ones, do you experience any of the following? Headaches, nausea, having nightmares of separation or difficulty focusing on daily activities due to the fear of separation.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Separation Anxiety Disorder",
      questionNumber: 52
    },
    //Question # 54
    {
      id: "question53",
      text: "Do you find it difficult to focus on daily activities due to worry about separation from a loved one?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Separation Anxiety Disorder",
      questionNumber: 53
    },
    //Question # 55: Specific Questionnaire - Trauma: Singe Event Trauma
    {
      id: "question54",
      text: "Have you ever experienced a single traumatic event that had a lasting emotional or psychological impact on you (e.g., car accident, assault, natural disaster)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Single Event Trauma",
      questionNumber: 54
    },
    //Question # 56
    {
      id: "question55",
      text: "If yes, do you frequently re-experience this event through: intrusive thoughts, flashbacks (feeling like the event is happening again) or feeling distress when reminded of that event.",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Single Event Trauma",
      questionNumber: 55
    },
    //Question # 57
    {
      id: "question56",
      text: "Do you feel heightened levels of distress or physical reactions (e.g., heart racing, sweating) when reminded of the event?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Single Event Trauma",
      questionNumber: 56
    },
    //Question # 58
    {
      id: "question57",
      text: "Since the event, do you tend to avoid situations, places, or people that remind you of the trauma?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Single Event Trauma",
      questionNumber: 57
    },
    //Question # 59
    {
      id: "question58",
      text: "Have you noticed changes in your mood or behavior since the traumatic event (e.g., irritability, feeling on edge, difficulty concentrating)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Single Event Trauma",
      questionNumber: 58
    },
    //Question # 60: Specific Questionnaire - Trauma: Complex Trauma
    {
      id: "question59",
      text: "Have you experienced multiple or prolonged traumatic events, especially during childhood or adolescence (e.g., ongoing abuse, domestic violence, repeated neglect)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Complex Trauma",
      questionNumber: 59
    },
    //Question # 61
    {
      id: "question60",
      text: "Do you frequently feel that you are constantly in danger, even in safe environments?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Complex Trauma",
      questionNumber: 60
    },
    //Question # 62
    {
      id: "question61",
      text: "Do you struggle with regulating your emotions (e.g., difficulty calming down when upset, feeling overly emotional or detached)?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Complex Trauma",
      questionNumber: 61
    },
    //Question # 63
    {
      id: "question62",
      text: "Do you find it difficult to form or maintain close, trusting relationships?",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Complex Trauma",
      questionNumber: 62
    },
    //Question # 64
    {
      id: "question63",
      text: "Do you often feel: emotionally numb, intense feeling of guilt, shame & worthlessness or difficulty seeing a future for yourself.",
      type: "radio",
      options: [
        { name: "Not likely at all", label: "Not likely at all", score: 0 },
        { name: "A little bit", label: "A little", score: 1 },
        { name: "Moderately", label: "Moderately", score: 2 },
        { name: "Quite a bit", label: "A lot", score: 3 },
        { name: "Extremely", label: "Extremely", score: 4 },
      ],
      category: "Complex Trauma",
      questionNumber: 63
    },
    //Question # 65: Specific Questionnaire - Trauma: Developmental Trauma
    {
      id: "question64",
      text: "Were you exposed to significant trauma during childhood (before age 7), such as neglect, emotional, physical, or sexual abuse?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 64
    },
    //Question # 66
    {
      id: "question65",
      text: "As a child, did you feel emotionally unsupported, unsafe, or rejected by caregivers or other important adults?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 65
    },
    //Question # 67
    {
      id: "question66",
      text: "Do you have difficulty with: Trusting others, forming secure attachments or feeling safe.",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 66
    },
    //Question # 68
    {
      id: "question67",
      text: "Do you struggle with: Regulating your emotions, healthily managing stress or avoiding relationships entirely.",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 67
    },
    //Question # 69
    {
      id: "question68",
      text: "As an adult, do you still experience difficulty navigating social situations or feeling comfortable around others?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 68
    },
    //Question # 70
    {
      id: "question69",
      text: "Do you feel that the trauma you experienced during childhood has affected your sense of identity or self-worth?",
      type: "radio",
      options: [
        { name: "Yes", label: "Yes", score: 1 },
        { name: "No", label: "No", score: 0 },
      ],
      category: "Developmental Trauma",
      questionNumber: 69
    },
  ];
  for (const question of questions) {
    await setDoc(doc(db, "questions", question.id), question);
  }
  console.log("Questions saved separately in Firestore!");
}

saveQuestionsToFirestore();