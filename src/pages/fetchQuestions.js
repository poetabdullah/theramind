import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const testFirestoreConnection = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    console.log("Firestore is connected!");
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("Firestore connection error:", error);
  }
};

testFirestoreConnection();
