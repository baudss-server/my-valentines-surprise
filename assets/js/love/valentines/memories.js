/* Unique JS ID: mem_logic_2026_hardcoded_FINAL */

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Simulan ang loading bar
    runLoadingBar();

    const wallContainer = document.getElementById('unique-memory-grid');

    // 2. I-fetch ang images mula sa JSON file
    // Note: Ang path ay relative sa kung nasaan ang memories/index.html
    fetch('../assets/memories.json')
        .then(response => {
            if (!response.ok) throw new Error("JSON file not found");
            return response.json();
        })
        .then(data => {
            const memories = data.memories;
            
            // RANDOM SHUFFLE: Para paiba-iba ang pwesto ng images tuwing refresh
            const shuffled = memories.sort(() => 0.5 - Math.random());

            if (wallContainer) {
                shuffled.forEach(imgSrc => {
                    const card = document.createElement('div');
                    card.className = 'photo-card';
                    
                    // RANDOM ANIMATION & POSITION: Para sa "Scattered" look
                    const randRot = Math.random() * 10 - 5; // -5 to 5 degrees
                    const randX = Math.random() * 20 - 10; // -10 to 10 pixels
                    const randY = Math.random() * 20 - 10;
                    const randDur = Math.random() * 2 + 3;  // 3s to 5s animation duration

                    card.style.setProperty('--angle', `${randRot}deg`);
                    card.style.setProperty('--x', `${randX}px`);
                    card.style.setProperty('--y', `${randY}px`);
                    card.style.setProperty('--time', `${randDur}s`);

                    // HTML STRUCTURE: Image lang, walang caption
                    card.innerHTML = `
                        <div class="tape-center"></div>
                        <img src="${imgSrc}" alt="Memory" loading="lazy">
                    `;
                    
                    wallContainer.appendChild(card);
                });
            }
            // Tapusin ang loading pagkatapos ma-render lahat
            finishLoading();
        })
        .catch(err => {
            console.error("Error loading memories:", err);
            // I-hide pa rin ang loader kahit may error para hindi ma-stuck ang user
            finishLoading();
        });

    // 3. Fireflies Logic (Pampaganda ng background)
    const container = document.getElementById('fireflies-container');
    if (container) {
        for (let i = 0; i < 35; i++) {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = Math.random() * 100 + 'vw';
            firefly.style.top = Math.random() * 100 + 'vh';
            firefly.style.setProperty('--moveX', (Math.random() * 200 - 100) + 'px');
            firefly.style.setProperty('--moveY', (Math.random() * 200 - 100) + 'px');
            firefly.style.animationDuration = (Math.random() * 10 + 10) + 's';
            firefly.style.animationDelay = (Math.random() * 5) + 's';
            container.appendChild(firefly);
        }
    }
});

// Loading Progress Logic
function runLoadingBar() {
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5; 
        if (progress > 95) progress = 95; // Hold sa 95% hanggang matapos ang fetch
        
        if(progressBar) progressBar.style.width = `${progress}%`;
        if(loadingText) loadingText.innerText = `Shuffling Memories... ${progress}%`;

        if (progress >= 95) clearInterval(interval);
    }, 100);
}

// Function para itago ang loading screen
function finishLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    const mainSection = document.getElementById('memories-section');

    if(progressBar) progressBar.style.width = '100%';
    if(loadingText) loadingText.innerText = "Ready!";

    setTimeout(() => {
        if(loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            if(mainSection) mainSection.classList.add('content-visible');
            setTimeout(() => {
                loadingScreen.style.display = 'none'; 
            }, 800);
        }
    }, 500);
}