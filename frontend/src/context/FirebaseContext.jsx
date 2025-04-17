import React,{useState,useEffect,useContext} from 'react'
import { createContext } from 'react'
import { initializeApp } from 'firebase/app';
import { getDatabase , set , ref,onValue} from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };


const firebaseApp=initializeApp(firebaseConfig);

const database=getDatabase(firebaseApp)



const FirebaseContext=createContext(null);


export const useFirebase= ()=>useContext(FirebaseContext)



export const FirebaseContextProvider=(props)=>{

    const [usersWithStories, setUsersWithStories] = useState({});

  useEffect(() => {
    const usersStoriesRef = ref(database, 'myDB/stories/users');

    const unsubscribe = onValue(usersStoriesRef, (snapshot) => {
      const data = snapshot.val();
      setUsersWithStories(data || {});
    });

    return () => unsubscribe();
  }, []);





    return(
        <FirebaseContext.Provider value={{ usersWithStories }}>
            {props.children}    
        </FirebaseContext.Provider>
    )
}
