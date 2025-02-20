import { db } from "./firebaseConfig.js";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const addArticle = async () => {
  try {
    await addDoc(collection(db, "articles"), {
      author_name: "Deepak S. Patel",
      content: [
        "Professional therapy and counseling can improve your mental wellness. This therapy can help people who are experiencing emotional or behavioral problems. Also, it can help people who have a mental health disorder. Therapy is sometimes called psychotherapy or talk therapy. Many times, therapy is used in combination with prescription medicine to treat a mental health disorder. Therapy will usually improve the results you get from the medicine.",
        "There are different types of mental health providers. Professionals trained in psychotherapy include those representing the following types:",
        "Psychiatry",
        "Clinical psychology",
        "Mental health counseling",
        "Clinical social work",
        "Marriage and family therapy",
        "Rehabilitation counseling",
        "Psychoanalysis",
        "Fee structures and access to prescriptions is different for each. For example, a psychiatrist has a medical degree and is allowed to write prescriptions. A counselor does not have a medical degree and is not allowed to write a prescription. Your doctor can suggest a professional that is right for you.",
        "Some people do not want professional therapy or counseling. They feel ashamed of their problems. Others believe therapy and counseling are for seriously mentally ill or “crazy” people. However, this is not true. Don’t let shame and fear stop you from getting the help you need. Good mental health is part of your overall health and wellness.",
        "Path to improved health",
        "Different types of therapy use different techniques. In most types of therapy and counseling, the person receiving treatment talks with a professional therapist. However, therapy is more than just talking about your problems. Therapy can teach you new ways to think about the situations that bother you. It can help you cope with feelings and situations. It can help with feelings of anger, fear, anxiety, shyness, and panic. It also can give you tools to help fight low self-esteem and depression.",
        "Therapy can help treat a variety of problems. Some common reasons people seek therapy include:",
        "Depression",
        "Marriage problems, infidelity, divorce, or other relationship issues",
        "Sexual problems",
        "Stress and anxiety",
        "Addictions and compulsions",
        "Grief, loss, or bereavement",
        "Anger",
        "Career choice",
        "Parenting or family problems",
        "Phobias",
        "Insomnia",
        "Fertility issues",
        "Chronic pain or illness",
        "Domestic violence or abuse",
        "Eating disorders",
        "If you are not sure if therapy and counseling are right for you, talk to your family doctor. Your doctor can refer you to a trained professional who can help with your problems.",
        "If you choose therapy or counseling, you’ll talk about any problems you’ve been having and how you’ve been feeling. You’ll also talk about your goals for therapy. You and your doctor will decide how frequently you will meet. Your doctor, therapist, or counselor will help you decide what’s right for you.",
        "Things to consider",
        "Different kinds of therapy and counseling are based on different ideas about how the brain works. Also, it considers what causes people to act in certain ways. Many therapists use more than one type of technique to help you. Common kinds of therapy include:",
        "Family counseling. This helps family members understand problems within the family and how to resolve them.",
        "Cognitive therapy. This is sometimes called cognitive behavior therapy. It’s based on the idea that your thoughts cause your feelings and actions. If you change the way you think about something, you can feel or behave better even if the situation doesn’t change. This kind of therapy helps you understand negative or false thought patterns. Negative thought patterns cause troubling feelings and behavior.",
        "Behavior therapy. Sometimes called behavior modification therapy, this treatment focuses on changing unwanted or unhealthy behaviors. You replace them with healthy ones. This treatment involves using a system of rewards and reinforcement of positive behavior.",
        "Psychoanalytic therapy. This type of treatment encourages you to think and talk about memories and feelings from the past. These memories will help you understand how you act and feel today.",
        "Group therapy. Group therapy is led by a qualified professional. He or she facilitates a small group of people who have similar issues or problems. Groups can improve honesty with others. Members support each other during times of crisis.",
        "Couples therapy or marriage counseling. This treatment can help couples solve problems together, communicate in healthier ways, and learn to work out differences.",
        "Questions to ask your doctor",
        "What if my partner or child is resistant to therapy?",
        "How do I find a therapist that’s right for me?",
        "Can my child’s therapist tell me what they talked about?",
        "Will my therapist recommend prescription medicine?",
        "What if I don’t like my therapist? Can I change?",
        "source: https://familydoctor.org/therapy-and-counseling/?adfree=true",
      ],
      date_time: serverTimestamp(),
      last_updated: new Date("2023-03-29T00:00:00Z"),
      selectedTags: { 0: "Mental Health", 1: "Therapy", 2: "Counseling" },
      title: "Therapy and Counseling",
      user_id: "admin",
    });

    console.log("Article added successfully!");
  } catch (error) {
    console.error("Error adding article:", error);
  }
};

addArticle();
