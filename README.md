# 🧠 TheraMind – Mental Health Support Platform  

![Project Banner – Replace with your custom banner image](assets/banner.png)  

---

## 👥 Contributors  
- **Abdullah Imran** – Full-Stack & AI Engineer  
- **Ambreen** – Backend & Database Specialist  
- **Hamda Qadeer** – Frontend Developer & Research Lead  
<br>  
*Final Year Project (2025) – University of Management and Technology, Lahore*  

---

## 📌 About the Project  

TheraMind is a **web-based mental health support platform** that guides individuals **from initiation to actionable treatment plans**.  
It provides **personalized mental health support** across five major conditions — **Stress, Trauma, Depression, Anxiety, and OCD** — each with three subtypes.  

Unlike traditional systems, TheraMind combines **questionnaire-based diagnosis, appointment booking, treatment plan design, AI-driven chat support, educational content, and meditation exercises** into one coherent ecosystem.  

---

## 🚀 Core Features  

### 👤 Patient View  
- Signup & complete a guided **questionnaire**.  
- Receive a **personalized diagnosis & recommendations**.  
- Book & attend **doctor appointments** via Google Meet.  
- Access a structured **treatment plan** designed by your doctor.  
- Explore **educational content** (articles, patient stories).  
- Use **meditation timers & guided videos**.  
- Interact with **TheraChat (AI-powered empathetic chatbot)**.  

### 👨‍⚕️ Doctor View  
- Register & wait for **admin approval**.  
- Manage available **appointment slots**.  
- Conduct **video appointments** with patients.  
- Design & update **treatment plans** (goal-action structure with versioning & priority levels).  
- Write & publish **articles**.  
- Use **TheraChat** for support and research.  

### 🛠️ Admin View  
- Approve or block doctors.  
- Manage patient/doctor accounts.  
- Oversee **system analytics** (Firebase Analytics).  
- Communicate with developers for escalations.  

---

## 🧩 Complete Feature Set  

- **Meditation** → Breathing timers + curated YouTube video library.  
- **Education** → Tag-based article & patient story browsing.  
- **Write** → Patients submit stories, doctors publish articles (AI filters for relevance using CNN+SBERT).  
- **Treatment Plans** → Immutable, weekly versioned, with weighted actions (priority levels 1–3).  
- **Questionnaire** → Multi-stage diagnosis with suicide-risk detection & tailored condition-specific questions.  
- **Appointments** → Google Meet integration, rescheduling, cancellation, and email reminders.  
- **TheraChat** → Gemini-powered chatbot with custom fine-tuning for:  
  1. Empathetic support.  
  2. Knowledge-based answers.  
  3. Refusal on irrelevant queries.  

---

## 🏗️ System Architecture  

flowchart LR
    A[Patient/Doctor/Admin] -->|React + Tailwind| B[Frontend (Vercel)]
    B -->|REST API| C[Django Backend (EC2)]
    C --> D[Firestore DB]
    C --> E[AI Models (TensorFlow/Keras/SBERT)]
    C --> F[Gemini API (Vertex AI)]
    C --> G[Google Services (OAuth, Calendar, Meet)]
    C --> H[EmailJS]

🛠️ Tech Stack
Core Technologies
- React JS (Frontend)
  
- Tailwind CSS (Designing)
  
- Django (Backend)
  
- Google Firestore (NoSQL Database)

- Google Firebase (Authentication)



**Additional Integrations**
- AI / NLP → TensorFlow, Keras, NLTK, Hugging Face, SBERT + CNN

- Chatbot → Gemini API + Vertex AI endpoint

- Auth → Google Identity Services (OAuth 2.0)

- Appointments → Google Calendar + Meet APIs

- Notifications → EmailJS

- Analytics → Firebase Analytics

⚙️ Deployment Setup
Component	Service Used	Notes
Frontend	Vercel	Hosts React + Tailwind app
Backend	Amazon EC2	Django + AI Models deployed
Domain	Hostinger + NGINX	theramind.site → Vercel, api.theramind.site → EC2
Models	EC2 (TensorFlow, SBERT)	Served via backend
Collab Tools	GitHub, ClickUp, Google Colab	VCS + Agile + Model Training

📷 Screenshots & UI Showcase
(Replace placeholders with actual screenshots)

Patient Dashboard

Doctor Dashboard

Admin Panel

TheraChat (AI Chatbot)

🧪 AI Models & Experiments
We experimented with multiple architectures for content filtering & chatbot training:

Logistic Regression, LSTM, GRU, BiLSTM → Overfitting issues.

SBERT + 1D CNN (with negative mining + noise injection) → Stable & accurate classification.

Gemini fine-tuning:

V1 → Over-restricted, failed to answer knowledge questions.

V2 → Retrained with expanded dataset → Balanced empathy + knowledge.

(Insert graphs/metrics here – confusion matrix, training accuracy, loss curves)

🧑‍💻 Challenges & Learnings
Dependency Conflicts → TensorFlow & NLP libraries caused major conflicts, solved via environment isolation.

Cloud Deployment → Models ran fine locally but failed in Docker/EC2 initially → resolved with optimized images.

Google OAuth Approval → Navigated security checks for sensitive scopes.

AI Fine-tuning → Achieved balance between empathy & knowledge after multiple dataset iterations.

📥 Getting Started
Clone & Setup
bash
Copy
Edit
git clone https://github.com/<your-repo>/theramind.git
cd theramind
Frontend
bash
Copy
Edit
cd frontend
npm install
npm run dev
Backend
bash
Copy
Edit
cd backend
pip install -r requirements.txt
python manage.py runserver
Environment Variables
Firebase credentials

Gemini API keys

Google OAuth credentials

EmailJS config

🙌 Team & Acknowledgments
TheraMind was envisioned, designed, and built by:

Abdullah Imran – AI & Full-Stack Development

Ambreen – Backend & Database Engineering

Hamda Qadeer – Frontend & Research Development

Special thanks to University of Management and Technology, Lahore for providing guidance and resources.

📄 License
This project was developed as an academic final year project.
Usage permissions can be discussed upon request.
