/* --- SURPRISE PAGE: ULTIMATE EDITION (Fixed) --- */

import { getAppSettings, getMemories, updateScrapbookImage, updateMemoryImage, updateMessageBody, updateCinemaVideo, updatePlaylist } from '../../config.js';

// --- SWEETALERT SAFETY CHECK ---
// Kung hindi na-load sa HTML, magde-default ito sa console log para hindi mag-crash ang script
const Swal = window.Swal || {
    mixin: () => ({ fire: (opts) => console.log('Toast:', opts) }),
    fire: (opts) => { alert(opts.title || "Alert"); return Promise.resolve({ value: null }); },
    stopTimer: () => {},
    resumeTimer: () => {}
};

// --- TOAST CONFIG ---
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
});

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. GET ELEMENTS ---
    const clientNames = document.querySelectorAll('.client-name');
    const overlayName = document.getElementById('overlay-name');
    const scrapImg = document.getElementById('scrapbook-img-target');
    const gridContainer = document.getElementById('surprise-grid-container');
    
    // Video Elements (Smart Player)
    const standardPlayer = document.getElementById('main-video-player');
    const youtubePlayer = document.getElementById('youtube-player');
    const editVideoBtn = document.getElementById('edit-video-btn');
    
    // Edit Controls
    const scrapInput = document.getElementById('hidden-file-input');
    const galleryInput = document.getElementById('gallery-file-input');
    const editWrapper = document.querySelector('.editable-wrapper');
    const messageBody = document.getElementById('editable-message-body');
    const addSongBtn = document.getElementById('add-song-btn');

    // State Variables
    let selectedMemoryId = null; 
    let selectedMemoryImgElement = null;
    let currentPlaylist = [];

    // --- HELPER: VIDEO LOADER (YouTube vs MP4) ---
    function loadSmartVideo(url) {
        if (!url) return;

        // Regex para malaman kung YouTube Link
        const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/)([^&?]*))/);
        
        if (youtubeMatch && youtubeMatch[1]) {
            // -- YOUTUBE MODE --
            const videoId = youtubeMatch[1];
            if(standardPlayer) {
                standardPlayer.style.display = 'none';
                standardPlayer.pause();
            }
            if(youtubePlayer) {
                youtubePlayer.style.display = 'block';
                youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
            }
        } else {
            // -- MP4 / DIRECT FILE MODE --
            if(youtubePlayer) {
                youtubePlayer.style.display = 'none';
                youtubePlayer.src = "";
            }
            if(standardPlayer) {
                standardPlayer.style.display = 'block';
                standardPlayer.src = url;
            }
        }
    }

    // --- 2. LOAD DATA MULA SA DATABASE ---
    console.log("Loading Content...");

    getAppSettings().then(config => {
        if(config) {
            // Update Text
            clientNames.forEach(el => el.innerText = config.clientName || "Love");
            if(overlayName) overlayName.innerText = config.clientName || "Love";
            
            // Update Scrapbook Image
            if(scrapImg && config.scrapbookImage) scrapImg.src = config.scrapbookImage;
            
            // LOAD SMART VIDEO
            if(config.cinemaVideo) {
                loadSmartVideo(config.cinemaVideo);
            }
            
            // LOAD MESSAGE TEXT
            if(messageBody) {
                messageBody.innerText = config.messageBody || "Happy Valentine's Day! (Click to edit this message)";
            }

            // LOAD PLAYLIST
            if(config.playlist) {
                currentPlaylist = config.playlist;
            } else {
                currentPlaylist = [{ title: "Saksi Ang Langit", artist: "December Avenue", audio: "../assets/audio/December Avenue - Saksi Ang Langit (OFFICIAL LYRIC VIDEO).mp3", video: "../assets/video/bg-video1.mp4" }];
            }
            renderPlaylist(currentPlaylist);
        }
    });

    // --- 3. VIDEO EDIT LOGIC (SweetAlert) ---
    if(editVideoBtn) {
        editVideoBtn.addEventListener('click', async () => {
            const { value: newLink } = await Swal.fire({
                title: 'Change Video',
                input: 'url',
                inputLabel: 'Paste Video Link (YouTube or .mp4 URL)',
                inputValue: '', // Empty muna para malinis
                inputPlaceholder: 'https://youtu.be/...',
                showCancelButton: true,
                confirmButtonColor: '#ff4d6d'
            });

            if (newLink) {
                const success = await updateCinemaVideo(newLink);
                if(success) {
                    loadSmartVideo(newLink); // Update Player immediately
                    Toast.fire({ icon: 'success', title: 'Video updated!' });
                } else {
                    Toast.fire({ icon: 'error', title: 'Failed to save video.' });
                }
            }
        });
    }

    // --- 4. MUSIC PLAYLIST LOGIC (Add & Remove) ---
    function renderPlaylist(playlist) {
        const container = document.getElementById('playlist-container');
        const audioPlayer = document.getElementById('bg-music');
        const bgVideo = document.getElementById('bg-video-element');
        const trackTitle = document.getElementById('track-title');
        const trackArtist = document.getElementById('track-artist');

        if (!container) return;
        container.innerHTML = "";

        playlist.forEach((track, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'playlist-item';
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.marginBottom = '5px';
            itemDiv.style.padding = '5px';
            itemDiv.style.background = 'rgba(255,255,255,0.1)';
            itemDiv.style.borderRadius = '5px';

            // Play Button
            const btn = document.createElement('button');
            btn.className = 'track-btn';
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.color = 'white';
            btn.style.textAlign = 'left';
            btn.style.flexGrow = '1';
            btn.style.cursor = 'pointer';
            
            const icon = track.audio === "" ? '🎬' : '🎵';
            btn.innerHTML = `<span>${icon}</span> ${track.title} <br><small style="opacity:0.7">${track.artist}</small>`;
            btn.addEventListener('click', () => loadTrack(track));

            // DELETE BUTTON (SweetAlert)
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '🗑️';
            delBtn.style.background = 'transparent';
            delBtn.style.border = 'none';
            delBtn.style.cursor = 'pointer';
            delBtn.style.marginLeft = '10px';
            
            delBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                Swal.fire({
                    title: 'Remove Song?',
                    text: `Delete "${track.title}"?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ff4d6d',
                    confirmButtonText: 'Yes, remove it'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        playlist.splice(index, 1);
                        await updatePlaylist(playlist);
                        renderPlaylist(playlist);
                        Toast.fire({ icon: 'success', title: 'Song removed!' });
                    }
                });
            });

            itemDiv.appendChild(btn);
            itemDiv.appendChild(delBtn);
            container.appendChild(itemDiv);
        });

        function loadTrack(track) {
            if(trackTitle) trackTitle.innerText = track.title;
            if(trackArtist) trackArtist.innerText = track.artist;
            if(bgVideo && track.video) {
                bgVideo.style.opacity = '0';
                setTimeout(() => { bgVideo.src = track.video; bgVideo.play().catch(()=>{}); bgVideo.style.opacity = '1'; }, 500);
            }
            if (!track.audio || track.audio === "") {
                audioPlayer.pause();
                if(bgVideo) { bgVideo.muted = false; bgVideo.volume = 0.8; }
            } else {
                audioPlayer.src = track.audio;
                audioPlayer.play().catch(()=>{});
                if(bgVideo) bgVideo.muted = true;
            }
        }
    }

    // ADD SONG BUTTON
    if(addSongBtn) {
        addSongBtn.addEventListener('click', async () => {
            const { value: formValues } = await Swal.fire({
                title: 'Add New Song',
                html:
                    '<input id="swal-title" class="swal2-input" placeholder="Song Title">' +
                    '<input id="swal-artist" class="swal2-input" placeholder="Artist Name">' +
                    '<input id="swal-url" class="swal2-input" placeholder="MP3 Link (URL)">',
                focusConfirm: false,
                confirmButtonColor: '#ff4d6d',
                preConfirm: () => {
                    return [
                        document.getElementById('swal-title').value,
                        document.getElementById('swal-artist').value,
                        document.getElementById('swal-url').value
                    ]
                }
            });

            if (formValues) {
                const [title, artist, url] = formValues;
                if(title && url) {
                    currentPlaylist.push({ title, artist: artist || "Unknown", audio: url, video: "" });
                    const s = await updatePlaylist(currentPlaylist);
                    if(s) { 
                        renderPlaylist(currentPlaylist); 
                        Toast.fire({ icon: 'success', title: 'Song added!' });
                    }
                } else {
                    Toast.fire({ icon: 'warning', title: 'Title and URL are required.' });
                }
            }
        });
    }

    // --- 5. GALLERY & MESSAGE LOGIC ---
    getMemories().then(memories => {
        if(memories && memories.length > 0 && gridContainer) {
            gridContainer.innerHTML = "";
            memories.slice(0, 10).forEach(item => {
                const card = document.createElement('div');
                card.className = 'photo-card';
                card.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
                card.innerHTML = `<div class="tape-center"></div><img src="${item.img}" id="mem-${item.id}"><div class="hint-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.4); color:white; display:flex; justify-content:center; align-items:center; opacity:0; transition:0.3s; font-size:12px; border-radius:4px;">Change ✏️</div>`;
                card.addEventListener('click', () => { selectedMemoryId = item.id; selectedMemoryImgElement = card.querySelector('img'); if(galleryInput) galleryInput.click(); });
                card.addEventListener('mouseenter', () => card.querySelector('.hint-overlay').style.opacity = '1');
                card.addEventListener('mouseleave', () => card.querySelector('.hint-overlay').style.opacity = '0');
                gridContainer.appendChild(card);
            });
        }
    });

    if(galleryInput) {
        galleryInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(!file || !selectedMemoryId) return;
            if(selectedMemoryImgElement) selectedMemoryImgElement.style.opacity = "0.5";
            try { 
                const base64 = await resizeImage(file); 
                await updateMemoryImage(selectedMemoryId, base64); 
                if(selectedMemoryImgElement) selectedMemoryImgElement.src = base64; 
                Toast.fire({ icon: 'success', title: 'Image updated!' });
            } catch (err) { Toast.fire({ icon: 'error', title: 'Error saving.' }); }
            if(selectedMemoryImgElement) selectedMemoryImgElement.style.opacity = "1";
            galleryInput.value = ""; 
        });
    }

    if(editWrapper && scrapInput) {
        editWrapper.addEventListener('click', () => scrapInput.click());
        scrapInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            if(scrapImg) scrapImg.style.opacity = "0.5";
            try { 
                const base64 = await resizeImage(file); 
                const s = await updateScrapbookImage(base64); 
                if(s) { scrapImg.src = base64; Toast.fire({ icon: 'success', title: 'Scrapbook image updated!' }); }
            } catch(err){}
            if(scrapImg) scrapImg.style.opacity = "1";
        });
    }

    if(messageBody) {
        messageBody.addEventListener('blur', async () => {
            const txt = messageBody.innerText;
            if(txt.trim() !== "") {
                const s = await updateMessageBody(txt);
                if(s) { 
                    messageBody.style.color = "#28a745"; 
                    Toast.fire({ icon: 'success', title: 'Message saved!' });
                    setTimeout(() => messageBody.style.color = "inherit", 1000); 
                }
            }
        });
    }

    // --- INITIALIZATION ---
    initUI();
});

/* --- UTILITY: IMAGE COMPRESSOR --- */
function resizeImage(file) {
    return new Promise((r) => { const rd = new FileReader(); rd.onload = (e) => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); const m = 800; let w=i.width, h=i.height; if(w>h){if(w>m){h*=m/w;w=m}}else{if(h>m){w*=m/h;h=m}} c.width=w;c.height=h;c.getContext('2d').drawImage(i,0,0,w,h); r(c.toDataURL('image/jpeg',0.7)); }; i.src = e.target.result; }; rd.readAsDataURL(file); });
}

/* --- UI HELPERS --- */
function initUI() {
    const startBtn = document.getElementById('start-btn');
    const overlay = document.getElementById('overlay');
    const loadingScreen = document.getElementById('loading-screen');
    
    // Check if previously opened
    if (sessionStorage.getItem('surpriseOpened') === 'true') {
        if(overlay) overlay.style.display = 'none';
        if(loadingScreen) {
            loadingScreen.style.display = 'flex';
            runLoadingBar(true); // Skip animation
        }
    } else {
        // First time visit
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(overlay) overlay.classList.remove('hidden');
    }
    
    if(startBtn) {
        startBtn.addEventListener('click', () => { 
            sessionStorage.setItem('surpriseOpened', 'true'); 
            if(overlay) overlay.style.display = 'none'; 
            if(loadingScreen) loadingScreen.style.display = 'flex'; 
            runLoadingBar(false); // Play animation
        });
    }

    startTypingLoop(); 
    initFireflies(); 
    initScrollReveal(); 
    setupCinemaEffects();
}

function runLoadingBar(skip) {
    const l = document.getElementById('loading-screen');
    const p = document.getElementById('progress-bar');
    const t = document.getElementById('loading-text');
    const m = document.getElementById('bg-music');
    
    if(skip) {
        if(l) l.style.display = 'none';
        if(m) m.play().catch(()=>{});
        return;
    }

    let g = 0;
    const i = setInterval(() => {
        g += Math.floor(Math.random() * 5) + 2;
        if(g > 100) g = 100;
        
        if(p) p.style.width = `${g}%`;
        if(t) t.innerText = `Loading... ${g}%`;
        
        if(g === 100) {
            clearInterval(i);
            setTimeout(() => {
                if(l) {
                    l.style.opacity = '0';
                    setTimeout(() => { 
                        l.style.display = 'none'; 
                        if(m) m.play().catch(()=>{}); 
                    }, 800);
                }
            }, 500);
        }
    }, 40);
}

function setupCinemaEffects(){const m=document.getElementById('main-video-player'),b=document.getElementById('bg-video-element'),a=document.getElementById('bg-music');if(m){m.addEventListener('play',()=>{if(a)a.pause();if(b){b.src=m.currentSrc||m.src;b.currentTime=m.currentTime;b.muted=true;b.play();b.style.filter="blur(10px) brightness(0.5)"}});m.addEventListener('pause',()=>{if(b)b.pause()});m.addEventListener('seeked',()=>{if(b)b.currentTime=m.currentTime})}}
function initFireflies(){const c=document.getElementById('fireflies-container');if(!c)return;for(let i=0;i<30;i++){const f=document.createElement('div');f.className='firefly';f.style.left=`${Math.random()*100}vw`;f.style.animationDelay=`${Math.random()*5}s`;f.style.animationDuration=`${Math.random()*10+10}s`;c.appendChild(f)}}
function startTypingLoop(){const t=document.querySelector(".typing-title"),s=document.querySelector(".typing-subtitle");if(!t||!s)return;const tt="Happy Valentine's Day",st="To my favorite person";async function r(){while(true){await ty(t,tt,100);await w(500);await ty(s,st,50);await w(3000);await d(s,30);await d(t,50);await w(500)}}r()}
function ty(e,x,s){return new Promise(r=>{let i=0;e.innerHTML="";function f(){if(i<x.length){e.innerHTML+=x.charAt(i);i++;setTimeout(f,s)}else r()}f()})}
function d(e,s){return new Promise(r=>{let x=e.innerHTML;function f(){if(x.length>0){x=x.substring(0,x.length-1);e.innerHTML=x;setTimeout(f,s)}else r()}f()})}
function w(m){return new Promise(r=>setTimeout(r,m))}
function initScrollReveal(){const rs=document.querySelectorAll('.reveal');window.addEventListener('scroll',()=>{const h=window.innerHeight;rs.forEach(r=>{if(r.getBoundingClientRect().top<h-150)r.classList.add('active')})})}