# TheraMind - Mental Health Support Platform

TheraMind is an online platform designed to diagnose mental health disorders, suggest possible solutions, and offer a space for users to track their mental health status. It connects therapists and patients, facilitating seamless communication and ensuring that individuals who may feel uncomfortable seeking help in person can find support from the comfort of their homes. This platform is part of a university final-year project and leverages cutting-edge tools, software engineering principles, and artificial intelligence to create a comprehensive solution.

---

## Project Overview

### **Key Features**
- **Mental Health Diagnosis**: Users can take assessments that help diagnose specific mental health disorders.
- **AI-powered Recommendations**: Based on the diagnosis, the platform provides personalized recommendations to address the mental health issues identified.
- **Therapist & Patient Interaction**: Patients can communicate with therapists for virtual consultations and receive continuous support.
- **User-Friendly Interface**: Tailored to make mental health services accessible to all users, whether they are patients or healthcare providers.
- **Security**: Ensures the privacy and confidentiality of users’ personal and medical data.

### **Technologies Used**
- **Frontend**: Built with React.js, utilizing components like Tailwind CSS for UI design.
- **Backend**: Powered by Django with Django Rest Framework for API management.
- **Database**: Firestore (Firebase) for storing and retrieving user data securely.
- **Authentication**: Firebase Authentication for secure user login and registration.
- **AI Integration**: Using artificial intelligence algorithms for diagnosing mental health conditions and recommending solutions.

---

## Project Structure

- **Frontend**: 
    - A React app built with Tailwind CSS, React Router, and Firebase.
    - The user interface includes components for navigating between patient sign-up, diagnosis, health history forms, and the chatbot (TheraChat) for interacting with patients.
    - Mobile-responsive design for smooth experience on various devices.

- **Backend**: 
    - Django project with Django Rest Framework for building REST APIs.
    - Firebase integration via custom utilities (`firebase_auth.py`, `firestore.py`) to manage user authentication and Firestore operations.
    - Views and URLs configured to handle requests related to mental health assessments, therapist interactions, and patient data.

---

## Setup and Installation

### Prerequisites

- Python 3.x
- Node.js and npm
- Django and Django Rest Framework
- Firebase account and Firebase Admin SDK
- React app setup with Tailwind CSS

### Backend Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/theramind.git
    cd theramind/backend
    ```

2. **Create a virtual environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # For MacOS/Linux
    venv\Scripts\activate  # For Windows
    ```

3. **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Setup Firebase credentials**:
    - Download the `firebase_admin_credentials.json` from Firebase console and place it in the `backend/firebase/` folder.

5. **Run Django migrations**:
    ```bash
    python manage.py migrate
    ```

6. **Start the Django development server**:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup

1. **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```

2. **Install Node.js dependencies**:
    ```bash
    npm install
    ```

3. **Run the React app**:
    ```bash
    npm start
    ```

---

## Features and Use Cases

### **Therapist & Patient Roles**
- **Therapists**: Can create educational content, manage patient consultations, and track patient progress.
- **Patients**: Can sign up, complete assessments, consult with therapists, and track their mental health progress.

### **Interactive Features**
- **Chatbot (TheraChat)**: A chatbot that offers users instant responses, helps with mental health questions, and suggests personalized coping strategies.
- **Sign Up & Authentication**: Firebase Authentication is used for secure user registration and login.
- **Health History Forms**: Users fill out forms regarding mental health history for better diagnosis.
- **Progress Tracker**: Both therapists and patients can track progress over time.

---

## Future Improvements

- **Expanded AI Features**: Enhance the AI-powered mental health diagnosis and recommendations.
- **Patient Analytics**: Enable more advanced data analysis for patients’ mental health trends.
- **Multi-language Support**: Adding support for more languages to make the platform more accessible.

---

## Project Status

Currently, the project is in the working phase, and several core components, such as user authentication, health assessments, and the React frontend, are functional. The integration of AI for diagnosis and further enhancements in the therapist-patient interaction are under development.

---

## Contributing

We welcome contributions to this project! Feel free to fork the repository, make changes, and submit pull requests. If you find any bugs or want to suggest improvements, please create an issue, and we’ll look into it.

---

## Acknowledgments

- **Firebase**: For providing powerful backend services like Authentication and Firestore.
- **Django**: For the robust web framework that powers the backend.
- **React & Tailwind CSS**: For providing the tools to create a responsive and intuitive frontend.
- **Gemini**: For integrating ChatBot.

---
