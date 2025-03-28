import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDyt3y-Y3WpXyyKKM6B67c2NKi8ZdwnOrIs",
  authDomain: "app2-d39c3.firebaseapp.com",
  databaseURL: "https://app2-d39c3-default-rtdb.firebaseio.com",
  projectId: "app2-d39c3",
  storageBucket: "app2-d39c3.appspot.com",
  messagingSenderId: "243773322095",
  appId: "1:243773322095:web:d240d3ee11c4dc9a2eae9a",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default database;
