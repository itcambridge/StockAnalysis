import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your web app's Firebase configuration
  // You can find this in your Firebase project settings
  apiKey: "AIzaSyAuXlg9i8O2zVc3MQQGPYaqAde1YALVKxU",
  authDomain: "value-viewer.firebaseapp.com",
  projectId: "value-viewer",
  storageBucket: "value-viewer.appspot.com",
  messagingSenderId: "950711539294",
  appId: "1:950711539294:web:e4d98834f7f8f93bff46cf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
