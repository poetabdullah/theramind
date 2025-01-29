import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EducationDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    // Dummy data for now
    const dummyData = {
      title: "Understanding Anxiety: Symptoms, Causes, and Coping Strategies",
      author: "Dr. Jane Doe",
      date_time: "2025-01-29T12:00:00Z",
      tags: ["Mental Health", "Anxiety", "Coping Strategies"],
      content: `Anxiety is a natural response to stress but can become overwhelming if left unchecked. Common symptoms include excessive worry, restlessness, and difficulty concentrating. It can manifest physically as increased heart rate, sweating, and dizziness. Causes of anxiety disorders vary widely, ranging from genetic predispositions to environmental triggers such as trauma, chronic stress, or major life changes. Understanding these factors is crucial in developing effective coping mechanisms.

There are multiple ways to manage anxiety. Practicing mindfulness and meditation helps regulate emotions, while regular physical activity can significantly reduce stress levels. Seeking therapy, particularly Cognitive Behavioral Therapy (CBT), has proven effective in managing anxiety disorders. Additionally, maintaining a balanced diet, adequate sleep, and a strong support system can greatly contribute to mental well-being. If anxiety starts interfering with daily life, seeking professional help is highly recommended. Mental health should always be a priority, and with the right approach, anxiety can be managed effectively.

However, many individuals experiencing anxiety hesitate to seek help due to stigma and misconceptions about mental health. Society often equates mental strength with emotional suppression, discouraging people from openly discussing their struggles. This creates an environment where anxiety and other mental health conditions remain undiagnosed and untreated. Raising awareness and fostering open conversations about mental well-being can empower individuals to seek the help they need without fear of judgment.

In addition to professional therapy, self-care routines play a crucial role in managing anxiety. Engaging in activities that bring joy and relaxation, such as reading, gardening, painting, or listening to music, can serve as natural stress relievers. Journaling is another effective method, allowing individuals to express their thoughts, track their emotions, and identify potential triggers. Over time, small habits like these can build resilience against anxiety.

Social support is also essential for individuals dealing with anxiety. Strong relationships with friends, family, or support groups provide a sense of security and belonging, which can significantly reduce stress levels. Sometimes, simply having someone to listen without judgment can make a world of difference. It’s important to reach out, communicate feelings, and lean on loved ones during challenging times.

For those with severe anxiety, medical intervention might be necessary. Medication, when prescribed by a qualified professional, can help manage chemical imbalances that contribute to anxiety disorders. Combined with therapy, medication can provide relief and improve overall quality of life. The key is to approach treatment with patience and an open mind—what works for one person might not work for another, and adjustments may be needed along the way.

In addition to traditional treatments, holistic approaches such as yoga, breathing exercises, and aromatherapy have gained popularity in managing anxiety. Deep breathing techniques, for example, activate the body’s relaxation response, helping to calm the nervous system during moments of heightened stress. Aromatherapy using essential oils like lavender and chamomile has been found to reduce stress levels and improve sleep quality. While these methods may not replace professional intervention, they can be valuable supplementary tools in an individual’s mental health journey.

Another critical aspect of anxiety management is setting healthy boundaries. Overcommitment and excessive responsibilities can contribute to stress and exacerbate anxiety symptoms. Learning to say "no" and prioritizing self-care can prevent burnout and help maintain emotional balance. Establishing structured routines, breaking tasks into smaller steps, and avoiding excessive multitasking can also provide a sense of control and reduce overwhelming feelings.

Ultimately, mental health is a journey, not a destination. It requires ongoing self-awareness, self-care, and the courage to seek support when needed. Anxiety may feel overwhelming, but with the right strategies, it is manageable. No one is alone in this battle, and help is always available for those who seek it.`,
      isAuthor: true, // Simulating author access for now
    };

    setContent(dummyData);
    setIsAuthor(dummyData.isAuthor);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-10 text-purple-600 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-purple-100 to-white min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h1 className="text-5xl font-bold text-purple-900 leading-tight mb-6">
          {content.title}
        </h1>

        {/* Author & Date */}
        <p className="text-lg text-gray-700 mb-6 italic">
          By{" "}
          <span className="text-orange-600 font-semibold">
            {content.author}
          </span>{" "}
          &middot; {new Date(content.date_time).toLocaleDateString()}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {content.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-purple-200 text-purple-800 text-sm font-medium py-1 px-3 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed text-justify">
          {content.content}
        </div>

        {/* Edit/Delete Buttons (Visible to author only) */}
        {isAuthor && (
          <div className="mt-8 flex space-x-4">
            <button
              className="bg-orange-500 text-white py-2 px-6 rounded-lg hover:bg-orange-600 transition text-lg shadow-md"
              onClick={() => navigate(`/edit/${id}`)}
            >
              Edit
            </button>
            <button className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 transition text-lg shadow-md">
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationDetailView;
