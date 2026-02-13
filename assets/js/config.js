/* --- FIREBASE CONFIGURATION (Database Only) --- */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Config
const firebaseConfig = {
  apiKey: "AIzaSyDPwsli0eu5OlRRrChh3pPHUmYQKWNdcPo",
  authDomain: "master-template-db.firebaseapp.com",
  projectId: "master-template-db",
  storageBucket: "master-template-db.firebasestorage.app",
  messagingSenderId: "868101183893",
  appId: "1:868101183893:web:2c7fd1ce80fa4c4fea7e9c",
  measurementId: "G-TSM33W7TFW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase Database Initialized");

/* --- FUNCTIONS --- */

export async function getAppSettings() {
    try {
        const docRef = doc(db, "app_settings", "config");
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error getting settings:", error);
        return null;
    }
}

export async function getMemories() {
    const memories = [];
    try {
        const q = query(collection(db, "memories"), orderBy("order"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            memories.push({ id: doc.id, ...doc.data() });
        });
        return memories;
    } catch (error) {
        console.error("Error getting memories:", error);
        return [];
    }
}

// Save New Memory (For Admin)
export async function addMemoryToDB(caption, imageBase64) {
    try {
        const memories = await getMemories();
        const nextOrder = memories.length + 1;

        await addDoc(collection(db, "memories"), {
            caption: caption,
            img: imageBase64,
            order: nextOrder
        });
        return true;
    } catch (error) {
        console.error("Error adding to DB:", error);
        return false;
    }
}

// Update Scrapbook Image (Solo Pic)
export async function updateScrapbookImage(base64Image) {
    try {
        const docRef = doc(db, "app_settings", "config");
        await updateDoc(docRef, {
            scrapbookImage: base64Image
        });
        return true;
    } catch (error) {
        console.error("Error updating image:", error);
        return false;
    }
}

// Update Specific Gallery Image
export async function updateMemoryImage(docId, base64Image) {
    try {
        const docRef = doc(db, "memories", docId);
        await updateDoc(docRef, {
            img: base64Image
        });
        return true;
    } catch (error) {
        console.error("Error updating memory:", error);
        return false;
    }
}

// Update Message Body Text
export async function updateMessageBody(newText) {
    try {
        const docRef = doc(db, "app_settings", "config");
        await updateDoc(docRef, {
            messageBody: newText
        });
        return true;
    } catch (error) {
        console.error("Error updating message:", error);
        return false;
    }
}

// NEW: Update Cinema Video URL
export async function updateCinemaVideo(videoUrl) {
    try {
        const docRef = doc(db, "app_settings", "config");
        await updateDoc(docRef, {
            cinemaVideo: videoUrl
        });
        return true;
    } catch (error) {
        console.error("Error updating video:", error);
        return false;
    }
}

// NEW: Update Whole Playlist (Add/Remove Songs)
export async function updatePlaylist(newPlaylistArray) {
    try {
        const docRef = doc(db, "app_settings", "config");
        await updateDoc(docRef, {
            playlist: newPlaylistArray
        });
        return true;
    } catch (error) {
        console.error("Error updating playlist:", error);
        return false;
    }
}