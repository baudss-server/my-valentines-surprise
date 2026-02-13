/* --- LOGIN PAGE LOGIC (Connected to Firebase) --- */

// Import ang function na ginawa natin sa config.js
import { getAppSettings } from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Get Elements
    const passInput = document.getElementById('passcode');
    const enterBtn = document.getElementById('enter-btn');
    const errorMsg = document.getElementById('error-msg');
    
    const inputArea = document.getElementById('input-area');
    const loadingBox = document.getElementById('loading-box');
    const progressBar = document.getElementById('progress-bar-fill');
    const loadingPercent = document.getElementById('loading-percent');
    const nameDisplay = document.getElementById('client-name-display');

    // Variable para paglagyan ng settings galing database
    let dbConfig = null;

    // 2. LOAD DATA AGAD PAG-OPEN NG PAGE
    console.log("Connecting to Firebase...");
    
    getAppSettings().then(data => {
        if(data) {
            dbConfig = data; // Save natin yung nakuha (passcode, name, etc.)
            console.log("Connected! Client Name:", dbConfig.clientName);
            
            // I-update ang pangalan sa screen ("Welcome, Adie")
            if(nameDisplay) nameDisplay.innerText = dbConfig.clientName; 
        } else {
            console.error("Failed to load settings.");
            if(nameDisplay) nameDisplay.innerText = "Error";
        }
    });

    // 3. CHECK PASSCODE FUNCTION
    function checkPasscode() {
        // Kung hindi pa tapos mag-load ang database
        if(!dbConfig) {
            alert("Sandali lang, kinukuha pa ang data sa database...");
            return;
        }

        const userInput = passInput.value;
        const correctPass = dbConfig.passcode; // Ito yung passcode galing Firebase

        errorMsg.classList.add('hidden');

        if (userInput === correctPass) {
            // --- TAMA ANG PASSWORD ---
            console.log("Login Success!");
            inputArea.classList.add('hidden');
            loadingBox.classList.remove('hidden');

            // Fake Loading Animation logic
            setTimeout(() => { progressBar.style.width = "100%"; }, 100);

            let progress = 0;
            const interval = setInterval(() => {
                progress += 1;
                if (progress > 100) progress = 100;
                loadingPercent.innerText = progress + "%";
                if (progress === 100) clearInterval(interval);
            }, 30);

            // Redirect sa Surprise Page
            setTimeout(() => {
                window.location.href = "surprise/index.html";
            }, 3000);

        } else {
            // --- MALI ANG PASSWORD ---
            errorMsg.classList.remove('hidden');
            errorMsg.innerText = "Incorrect Passcode.";
            
            passInput.classList.add('shake');
            setTimeout(() => { passInput.classList.remove('shake'); }, 500);
            passInput.value = "";
        }
    }

    // 4. LISTENERS
    if (enterBtn) enterBtn.addEventListener('click', checkPasscode);
    if (passInput) passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPasscode();
    });
});

// Helper Styles for Shake Animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
    .shake { animation: shake 0.4s ease-in-out; border-bottom: 2px solid #ff4d6d !important; }
`;
document.head.appendChild(styleSheet);