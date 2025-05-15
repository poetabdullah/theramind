
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";

// Storage setup
const storage = getStorage();

// Upload file and return URL function
export async function uploadFile(path, file) {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}