// src/treatmentPlans.js

/**
 * Each key below must match the diagnosis string that DiagnosisTree sets,
 * e.g. "contamination ocd", "symmetry ocd", etc. (all lowercased exactly).
 */
const TreatmentTemplates = {
  "contamination ocd": {
    name: "Contamination OCD Management Plan",
    goals: [
      {
        title:
          "Reduce handwashing frequency to no more than 10 times per day within 4 weeks.",
        actions: [
          {
            description:
              "Patient will keep a daily log of every handwashing episode (time + estimated anxiety level).",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will conduct weekly ERP (Exposure and Response Prevention) sessions focusing on mild contamination triggers.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice a graded hierarchy of touching ‘non‐contaminated’ objects (e.g., doorknobs at home), increasing difficulty each week.",
            priority: 3,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Identify and cognitively restructure at least 5 core contamination-related thoughts by week 6.",
        actions: [
          {
            description:
              "Clinician will teach patient cognitive restructuring techniques during weekly CBT sessions.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will write down contaminated‐related automatic thoughts daily and challenge at least two per day using a thought‐record worksheet.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide written materials on contamination schemas and review progress every session.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Increase participation in at least one social activity avoided due to contamination fears, once per week, by the end of 6 weeks.",
        actions: [
          {
            description:
              "Patient will choose one previously‐avoided social event (e.g., small gathering) and attend it, recording anxiety levels before/during/after.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will role‐play exposure scenarios in session to build patient’s coping skills before real‐life attendance.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will use relaxation techniques (deep breathing) immediately prior to attending the social event, at least three times before the event.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "symmetry ocd": {
    name: "Symmetry OCD Management Plan",
    goals: [
      {
        title:
          "Reduce arranging/ordering rituals to under 30 minutes per day within 5 weeks.",
        actions: [
          {
            description:
              "Patient will time‐block “arranging rituals” and gradually reduce by 10% each week (e.g., Week 1: 100 % time; Week 5: ≤30 min/day).",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will conduct weekly CBT sessions focusing on cognitive restructuring around perfectionism and symmetry needs.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will intentionally leave one household area (e.g., desk) ‘out of order’ for 10 minutes each day, resisting urge to correct it.",
            priority: 3,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Complete at least three exposure exercises to tolerate mild asymmetry each week over 6 weeks.",
        actions: [
          {
            description:
              "Patient will list 10 objects typically arranged and pick 3 objects daily to leave intentionally misaligned, recording distress levels.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will design a personalized hierarchy of asymmetry exposures (e.g., brush placement, pillow alignment) and review it weekly.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice a 5-minute mindfulness exercise before and after each exposure, logging success/failure.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Decrease subjective distress (0–10 scale) by at least 40% when exposed to asymmetry, measured biweekly over 6 weeks.",
        actions: [
          {
            description:
              "Patient will record baseline distress level (0–10) before doing an asymmetry exposure; clinician will track progress biweekly.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide psychoeducation on the discrepancy between “order” and actual functional need, using real‐life examples.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will review recorded distress scores with the clinician every two weeks and adjust exposure difficulty accordingly.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "checking ocd": {
    name: "Checking OCD Management Plan",
    goals: [
      {
        title:
          "Limit checking behaviors (doors, appliances) to no more than 3 instances per day within 4 weeks.",
        actions: [
          {
            description:
              "Patient will log each checking event (time + perceived risk) daily in a journal.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will implement ERP exercises forcing patient to leave doors/appliances unchecked for gradually increasing intervals, starting at 5 minutes.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will set phone alarm reminders at random intervals to refrain from checking for at least 15 minutes, increasing over 4 weeks.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Identify top 5 anxious checking-related automatic thoughts and challenge them within 6 weeks.",
        actions: [
          {
            description:
              "Clinician will provide a thought‐record worksheet and review with patient each week.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will complete at least 2 cognitive challenging exercises daily on checking‐related fears.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient a “risk reappraisal” technique during weekly sessions.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Increase tolerance of uncertainty: patient will leave at least one unlocked door once per week by Week 5.",
        actions: [
          {
            description:
              "Patient will perform a ‘door‐unlock exposure’ (open door, walk away, return after 1 minute), logging distress level.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will role‐play emergency scenarios in session, demonstrating how most fears do not materialize.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice relaxation breathing immediately after each exposure, three times per week.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "acute stress": {
    name: "Acute Stress Intervention Plan",
    goals: [
      {
        title:
          "Reduce acute stress symptoms (e.g., hypervigilance, flashbacks) by 30% within 4 weeks, using a standardized stress questionnaire.",
        actions: [
          {
            description:
              "Clinician will teach patient a 10‐minute grounding exercise (5 senses) in session and have patient practice daily.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will complete a weekly stress symptom questionnaire to track severity.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will schedule at least 3 brief check‐in calls over 4 weeks to monitor symptoms.",
            priority: 2,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Improve sleep quality: patient will achieve ≥6 hours of sleep on at least 5 nights per week by Week 4.",
        actions: [
          {
            description:
              "Patient will follow a nightly relaxation routine (guided imagery or progressive muscle relaxation) at least 5 nights per week.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide sleep hygiene education and troubleshoot barriers in weekly sessions.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will maintain a sleep log (bedtime, wake time, quality) and review with clinician weekly.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Reintroduce one enjoyable social activity (e.g., coffee with friend) per week by end of Week 6.",
        actions: [
          {
            description:
              "Patient will schedule and attend at least one social activity each week, logging anxiety or avoidance triggers.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will role‐play social coping strategies during session to reduce avoidance.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will rate enjoyment/anxiety immediately after each social event in a brief journal.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "chronic stress": {
    name: "Chronic Stress Management Plan",
    goals: [
      {
        title:
          "Decrease perceived stress score by 25% on the Perceived Stress Scale (PSS) within 8 weeks.",
        actions: [
          {
            description:
              "Patient will complete a PSS once every two weeks and share results with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient a daily 15‐minute mindfulness meditation to be practiced at least 5 days per week.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will schedule and attend a weekly 45‐minute exercise session (e.g., brisk walk, yoga).",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve sleep onset latency: patient will fall asleep within 30 minutes at least 5 nights per week by Week 6.",
        actions: [
          {
            description:
              "Patient will establish a regular wind‐down routine (no screens, dim lights) 30 minutes before bedtime.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide sleep hygiene education and assign a 2‐week bedtime experiment (same bedtime/wake time).",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will log nightly sleep metrics (latency, awakenings, quality) in a sleep diary.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Enhance social support: patient will have at least two supportive social contacts weekly for 6 weeks.",
        actions: [
          {
            description:
              "Patient will identify three trustworthy individuals and reach out to at least two of them per week.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will collaborate to create a “support network map” in session and assign a homework to contact.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will attend one peer support group (in-person or virtual) within next 4 weeks.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "episodic stress": {
    name: "Episodic Stress Intervention Plan",
    goals: [
      {
        title:
          "Reduce frequency of stress ‘breakdowns’ from 3 times per month to 1 time per month within 3 months.",
        actions: [
          {
            description:
              "Patient will journal stress‐triggered episodes daily, noting context and coping attempts.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient emotion regulation skills (DBT distress tolerance) during weekly sessions.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice a 5‐minute distress‐tolerance grounding exercise at least once a day.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve problem-solving skills: patient will apply a structured problem-solving worksheet to at least two stressors per week for 6 weeks.",
        actions: [
          {
            description:
              "Clinician will introduce a step-by-step problem-solving worksheet in session and assign it as homework.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will complete that worksheet for each stressor and bring it back to session for review.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will review progress and refine problem-solving steps weekly.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Increase relaxation practice: patient will use at least one relaxation technique (e.g., progressive muscle relaxation) for 15 minutes, 4 times per week, over 8 weeks.",
        actions: [
          {
            description:
              "Patient will select one relaxation audio guided exercise and practice it 4 times weekly, logging compliance.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide 3 different relaxation audio resources and teach proper breathing techniques.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will review adherence and perceived tension levels with clinician each session.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "major depressive disorder": {
    name: "Major Depressive Disorder Treatment Plan",
    goals: [
      {
        title: "Reduce PHQ-9 score by at least 5 points within 8 weeks.",
        actions: [
          {
            description:
              "Patient will complete PHQ-9 questionnaire biweekly and share results with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient behavioral activation strategies and assign one pleasurable activity per day.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will identify and schedule one enjoyable activity daily, logging mood before/after.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve sleep quality: patient will achieve ≥80% sleep efficiency (time asleep/time in bed) over next 6 weeks.",
        actions: [
          {
            description:
              "Patient will maintain a daily sleep diary (bedtime, wake time, awakenings) and review weekly with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide cognitive therapy for insomnia (CT-I) techniques during sessions.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will implement sleep hygiene rules: no screens 1 hour before bed, consistent wake time, for 6 weeks.",
            priority: 3,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Increase engagement in social interaction: patient will attend one group therapy or peer support meeting per week for 6 weeks.",
        actions: [
          {
            description:
              "Patient will research local support groups/online forums and commit to attending at least one per week.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide a list of vetted depression support groups and encourage attendance.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will journal feelings before and after each group meeting and bring reflections to therapy.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "postpartum depression": {
    name: "Postpartum Depression Care Plan",
    goals: [
      {
        title:
          "Decrease Edinburgh Postnatal Depression Scale (EPDS) score by 4 points within 6 weeks.",
        actions: [
          {
            description:
              "Patient will complete EPDS every two weeks and share results with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will schedule weekly CBT or IPT (Interpersonal Therapy) focusing on maternal role adjustment.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice a 10‐minute relaxation or mindfulness exercise daily to reduce guilt/shame feelings.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Enhance support network: patient will identify and connect with at least one peer support mother group within 2 weeks.",
        actions: [
          {
            description:
              "Patient will research local postpartum support groups or online communities and attend first meeting by Week 2.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide referrals to two local/newborn support organizations in the first session.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will report back to clinician after attending support group once per week.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Stabilize sleep: patient will achieve at least 5 hours of continuous sleep for 5 nights per week by Week 4.",
        actions: [
          {
            description:
              "Patient will co-create a sleep plan including partner/family help for nighttime infant care.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient brief CBT‐I techniques to manage unhelpful thoughts around sleep.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will keep a nightly log of infant care responsibilities to identify scheduling gaps.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "atypical depression": {
    name: "Atypical Depression Treatment Plan",
    goals: [
      {
        title:
          "Reduce atypical depressive symptoms (overeating, hypersomnia) by 30% within 6 weeks as measured by a symptom‐checklist.",
        actions: [
          {
            description:
              "Patient will track daily sleep duration and caloric intake in a mood-symptom diary.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will introduce Behavioral Activation focusing on stimulating daytime activity levels gradually each week.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice structured meal planning to avoid binge‐eating episodes at least 5 days per week.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve social and occupational functioning: patient will re-engage in at least one fulfilling activity (e.g., hobby) twice per week over 6 weeks.",
        actions: [
          {
            description:
              "Clinician will collaboratively identify two enjoyable activities aligned with patient’s interests.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will schedule and participate in those activities twice a week, logging enjoyment and energy levels.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will review activity logs weekly and adjust goals accordingly.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Regulate mood reactivity: patient will practice 15 minutes of interpersonal skills training twice per week for 5 weeks.",
        actions: [
          {
            description:
              "Clinician will teach IPT (Interpersonal Therapy) techniques focusing on rejection sensitivity and role transitions.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice assertive communication skills with one close friend/family member weekly.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Patient will journal emotional reactions to positive events and share patterns with clinician every session.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "generalized anxiety disorder": {
    name: "GAD (Generalized Anxiety Disorder) Management Plan",
    goals: [
      {
        title:
          "Reduce daily worry time from ≥2 hours/day to ≤30 minutes/day within 8 weeks.",
        actions: [
          {
            description:
              "Patient will set a ‘worry period’ of 15 minutes each evening and postpone worrying outside that period.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach patient worry postponement and relaxation strategies in weekly CBT sessions.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice guided progressive muscle relaxation daily for at least 10 minutes.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve sleep latency: patient will fall asleep within 30 minutes at least 5 nights per week by Week 6.",
        actions: [
          {
            description:
              "Patient will follow a consistent sleep/wake schedule and avoid caffeine after 2 pm.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide cognitive therapy for insomnia techniques and review sleep log weekly.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will maintain a sleep diary (bedtime, wake time, sleep latency, awakenings).",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Decrease physiological tension: patient will practice diaphragmatic breathing for 10 minutes, 5 days per week, for 6 weeks.",
        actions: [
          {
            description:
              "Clinician will demonstrate diaphragmatic breathing and record a guided audio for patient’s home practice.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will use that guided audio daily, logging perceived anxiety reduction (0–10 scale).",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will review patient's breathing logs each session and adjust speed/duration as needed.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
    ],
  },

  "panic disorder": {
    name: "Panic Disorder Intervention Plan",
    goals: [
      {
        title:
          "Reduce panic attack frequency from ≥3/month to ≤1/month within 8 weeks.",
        actions: [
          {
            description:
              "Patient will log each panic attack (trigger, duration, peak anxiety) in a panic diary.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach interoceptive exposure exercises to tolerate panic sensations, practicing twice weekly.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice at least one interoceptive exposure (e.g., spinning, straw breathing) twice per week.",
            priority: 3,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Decrease catastrophic misinterpretations: patient will challenge at least 5 panic‐related automatic thoughts per week over 6 weeks.",
        actions: [
          {
            description:
              "Clinician will train patient in cognitive restructuring specific to panic (e.g., labeling bodily sensations).",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will complete at least 5 thought‐records per week on panic‐related thoughts and review weekly with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Patient will practice a 5-minute relaxation exercise immediately following any mild panic symptom in daily life.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Increase interoceptive tolerance: patient will complete 3 distinct interoceptive exposure exercises weekly over 6 weeks.",
        actions: [
          {
            description:
              "Patient will use a structured worksheet to practice straw‐breathing, hyperventilation, and head rolling exposures.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will supervise the first exposure exercise in session and provide safety cues.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will track anxiety levels before/during/after each interoceptive exposure and share logs weekly.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "separation anxiety disorder": {
    name: "Separation Anxiety Disorder Treatment Plan",
    goals: [
      {
        title:
          "Reduce separation‐related distress (0–10 scale) by 40% during separation episodes within 8 weeks.",
        actions: [
          {
            description:
              "Patient will practice a gradual “separation ladder” starting with 5 minutes away, increasing by 5 minutes each week.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will design the separation ladder in session and teach caregiver how to reinforce small successes.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will keep a daily log of distress levels (0–10) during each separation practice.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve coping skills: patient will learn three new coping statements and use them in 5 separation instances within 6 weeks.",
        actions: [
          {
            description:
              "Clinician will teach patient “I am safe”, “This will pass”, and “I can handle this” coping statements in session.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice each coping statement at least twice daily, logging effectiveness in a journal.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will role‐play separation scenarios and prompt patient to use the coping statements during role play.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Reinforce parent/guardian consistency: caregiver will use a consistent goodbye routine for 8 weeks without prolonging goodbyes.",
        actions: [
          {
            description:
              "Caregiver will follow the same 1–2 minute goodbye ritual each day, avoiding extra reassurance behaviors.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide psychoeducation to the caregiver about reinforcing independence in young patients.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will create a ‘comfort item’ (e.g., small toy) to bring during separations and report comfort level daily.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "single event trauma": {
    name: "Single Event Trauma Recovery Plan",
    goals: [
      {
        title:
          "Decrease intrusive memories frequency by 50% within 6 weeks (measured via weekly trauma symptom check).",
        actions: [
          {
            description:
              "Clinician will teach patient a 10‐minute grounding exercise (e.g., 5‐4‐3‐2‐1) and have patient practice daily.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will keep a daily log of any intrusive memory occurrence (time + trigger) to identify patterns.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will conduct weekly imaginal exposure or narrative processing to reframe the traumatic memory.",
            priority: 2,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Improve avoidance reduction: patient will approach one avoided situation per week for 6 weeks.",
        actions: [
          {
            description:
              "Patient will list 8 avoided situations related to the trauma and pick one each week to approach (e.g., drive by the location).",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will design a gradual exposure hierarchy in session and review progress weekly.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice a 5‐minute relaxation technique immediately before each exposure and log distress.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Enhance social support: patient will attend at least one trauma‐focused support group within 4 weeks.",
        actions: [
          {
            description:
              "Patient will research and join a local or virtual trauma support group and attend first meeting by Week 4.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will provide a list of vetted trauma recovery groups and encourage attendance.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will journal feelings and coping strategies learned from the support group and share each session.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "complex trauma": {
    name: "Complex Trauma Recovery Plan",
    goals: [
      {
        title:
          "Decrease emotional dysregulation episodes (anger, outbursts) by 50% within 10 weeks.",
        actions: [
          {
            description:
              "Patient will practice a 10‐minute DBT mindfulness skill each day and log successes/failures.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach DBT emotion regulation techniques (e.g., ABC PLEASE) in weekly sessions.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will identify 3 grounding objects (e.g., stress ball) and use them in 5 dysregulation episodes weekly.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Improve interpersonal trust: patient will share one vulnerability with a trusted friend/therapist each week for 8 weeks.",
        actions: [
          {
            description:
              "Clinician will guide patient through a ‘circle of trust’ exercise in session, identifying safe people.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will choose one person weekly to share a personal story and record outcomes in a trust journal.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will review trust journal entries and provide feedback on boundary setting and self-protection strategies.",
            priority: 1,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Stabilize self-harm urges: patient will reduce self-harm urges to zero within 12 weeks.",
        actions: [
          {
            description:
              "Patient will use a DBT crisis survival skill (e.g., TIPP) each time urges arise and log the occurrence.",
            priority: 3,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will conduct weekly safety planning sessions, updating crisis plans as needed.",
            priority: 2,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will identify 5 personal reasons for living and review them daily in a structured diary.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },

  "developmental trauma": {
    name: "Developmental Trauma Recovery Plan",
    goals: [
      {
        title:
          "Improve attachment security: patient will attend weekly trauma‐focused therapy sessions for 12 weeks.",
        actions: [
          {
            description:
              "Clinician will use a phase‐based therapeutic model (e.g., Sensorimotor Psychotherapy) targeting attachment.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will practice reflective journaling on caregiver interactions twice per week.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will assign a weekly grounding exercise focused on body sensation awareness.",
            priority: 2,
            assigned_to: "doctor",
          },
        ],
      },
      {
        title:
          "Reduce dissociative episodes by 60% within 10 weeks (tracked via weekly dissociation scale).",
        actions: [
          {
            description:
              "Patient will complete a dissociation scale (e.g., DES‐II) weekly and share results with clinician.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will teach titrated, safe grounding techniques in session and have patient practice daily.",
            priority: 3,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will carry a ‘sensory grounding kit’ (e.g., stress ball, scented object) and use it when feeling dissociated, logging usage.",
            priority: 2,
            assigned_to: "patient",
          },
        ],
      },
      {
        title:
          "Build self-esteem: patient will identify and journal three positive self‐attributes each day for 8 weeks.",
        actions: [
          {
            description:
              "Patient will complete a daily “strengths and achievements” worksheet every morning.",
            priority: 2,
            assigned_to: "patient",
          },
          {
            description:
              "Clinician will review these worksheets weekly and provide positive reinforcement and corrective feedback.",
            priority: 1,
            assigned_to: "doctor",
          },
          {
            description:
              "Patient will select one strength to share with a trusted friend/family member once per week.",
            priority: 1,
            assigned_to: "patient",
          },
        ],
      },
    ],
  },
};

export default TreatmentTemplates;
