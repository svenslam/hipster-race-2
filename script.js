
// --- GLOBAL VARIABLES ---
var userWantsMusic = false; // Tracks if user explicitly enabled music
var mainMenuAudio = null;
var introAudio = null; // New variable for intro music
var introTimer = null; // Timer for 50s intro
var isAudioPlaying = false;
var currentF1Question = null;
var currentMusicTrack = null;
var currentMusicAnswer = null;
var usedMusicIndices = []; 
var usedF1Indices = [];

// --- DATA ARRAYS ---
var musicTracks = [
    { url: "https://open.spotify.com/track/4BC2WQKrZdqMX6rHsvVbUy", label: "Na 2000", title: "Link 32", year: "2000" },
    { url: "https://open.spotify.com/track/3BCqG9GBF7GjJQHwJvlqSv", label: "Na 2000", title: "Link 33", year: "2000" },
    { url: "https://open.spotify.com/track/3APHT3KjbHi9OllkVQsuXF", label: "Na 2000", title: "Link 46", year: "2000" },
    { url: "https://open.spotify.com/track/3AU1O0gRYf9goSefBGvSOv", label: "Na 2000", title: "Link 51", year: "2000" },
    { url: "https://open.spotify.com/track/2G8czBYoqbDYj9C9bks1P8", label: "Na 2000", title: "Link 34", year: "2001" },
    { url: "https://open.spotify.com/track/6UEfyhyfhYQsyipxOd95Ie", label: "Na 2000", title: "Link 31", year: "2002" },
    { url: "https://open.spotify.com/track/0BCPKOYdS2jbQ8iyB56Zns", label: "Na 2000", title: "Link 38", year: "2002" },
    { url: "https://open.spotify.com/track/5S8QeiTS2ehiXtzNDV2yR8", label: "Na 2000", title: "Link 40", year: "2003" },
    { url: "https://open.spotify.com/track/6PwjJ58I4t7Mae9xfZ9l9v", label: "Na 2000", title: "Link 45", year: "2004" },
    { url: "https://open.spotify.com/track/3Lk7RWStfLaHG7lXsuS87j", label: "Na 2000", title: "Link 41", year: "2005" },
    { url: "https://open.spotify.com/track/0vFs2Eorve6vnnQcmItot1", label: "Na 2000", title: "Link 37", year: "2006" },
    { url: "https://open.spotify.com/track/7e6Vp3lkuFwDvC4M687SJv", label: "Na 2000", title: "Link 43", year: "2006" },
    { url: "https://open.spotify.com/track/2sgBTNHz9ckmqj3rx3ez4M", label: "Na 2000", title: "Link 49", year: "2007" },
    { url: "https://open.spotify.com/track/5r5cp9IpziiIsR6b93vcnQ", label: "Na 2000", title: "Link 39", year: "2008" },
    { url: "https://open.spotify.com/track/521r1faH9BQlyPVR5pMmXm", label: "Na 2000", title: "Link 42", year: "2008" },
    { url: "https://open.spotify.com/track/2DrGEaqoruCSn0FffWCf5O", label: "Na 2000", title: "Link 44", year: "2008" },
    { url: "https://open.spotify.com/track/0ntQJM78wzOLVeCUAW7Y45", label: "Na 2000", title: "Link 48", year: "2008" },
    { url: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd", label: "Na 2000", title: "Link 50", year: "2009" },
    { url: "https://open.spotify.com/track/47Slg6LuqLaX0VodpSCvPt", label: "Na 2000", title: "Link 36", year: "2010" },
    { url: "https://open.spotify.com/track/4cluDES4hQEUhmXj6TXkSo", label: "Na 2000", title: "Link 86", year: "2012" }, 
    { url: "https://open.spotify.com/track/2Yw5jfEaQFHoUFhzXUGkgV", label: "Na 2000", title: "Link 87", year: "2013" }, 
    { url: "https://open.spotify.com/track/7KX65PC1UZuImsUInThbav", label: "Na 2000", title: "Link 54", year: "2017" },
    { url: "https://open.spotify.com/track/6ho0GyrWZN3mhi9zVRW7xi", label: "Na 2000", title: "Link 52", year: "2018" },
    { url: "https://open.spotify.com/track/3Rhfga08pNnhLMQVb2nRXp", label: "Na 2000", title: "Link 88", year: "2019" }, 
    { url: "https://open.spotify.com/track/3Udr12Hj4tFHG759UBSZNc", label: "Na 2000", title: "Link 35", year: "2023" },
    { url: "https://open.spotify.com/track/1j8GQQGyC26O1TeW4LLvjk", label: "Na 2000", title: "Link 47", year: "2023" },
    { url: "https://open.spotify.com/track/2ibiwyQF66OWBgJWW0tIF0", label: "Na 2000", title: "Link 53", year: "2023" },
    { url: "https://open.spotify.com/track/1g9GiiPPaL7KcDHlDzu7lT", label: "Na 2000", title: "Link 55", year: "2025" },
    { url: "https://open.spotify.com/track/4CCLOGJX19mWFBDHSnifm9", label: "Voor 2000", title: "Link 102", year: "1970" }, 
    { url: "https://open.spotify.com/track/2EqlS6tkEnglzr7tkKAAYD", label: "Voor 2000", title: "Link 104", year: "1970" }, 
    { url: "https://open.spotify.com/track/3GIChxHmuLmBm5PTNZGDtj", label: "Voor 2000", title: "Link 105", year: "1977" }, 
    { url: "https://open.spotify.com/track/4iUH4ksweue6iGqQUgSzhx", label: "Voor 2000", title: "Link 96", year: "1982" }, 
    { url: "https://open.spotify.com/track/2H7PHVdQ3mXqEHXcvclTB0", label: "Voor 2000", title: "Link 97", year: "1982" }, 
    { url: "https://open.spotify.com/track/0ikz6tENMONtK6qGkOrU3c", label: "Voor 2000", title: "Link 95", year: "1984" }, 
    { url: "https://open.spotify.com/track/4JiEyzf0Md7KEFFGWDDdCr", label: "Voor 2000", title: "Link 93", year: "1991" },
    { url: "https://open.spotify.com/track/3d9DChrdc6BOeFsbrZ3Is0", label: "Voor 2000", title: "Link 94", year: "1991" },
    { url: "https://open.spotify.com/track/1Je1IMUlBXcx1Fz0WE7oPT", label: "Voor 2000", title: "Link 92", year: "1996" },
    { url: "https://open.spotify.com/track/6fh6lGvzuQibcFUB076WIR", label: "Voor 2000", title: "Link 101", year: "1996" }, 
    { url: "https://open.spotify.com/track/5ZrDlcxIDZyjOzHdYW1ydr", label: "Voor 2000", title: "Link 89", year: "1997" },
    { url: "https://open.spotify.com/track/7onAFA3kzCPJWG3gvvMxhx", label: "Voor 2000", title: "Link 90", year: "1997" },
    { url: "https://open.spotify.com/track/75CLNW6Goi8LZ6rYGDmfHS", label: "Voor 2000", title: "Link 91", year: "1997" },
    { url: "https://open.spotify.com/track/04wE70zoYM5Pckgw36dWBq", label: "Voor 2000", title: "Link 99", year: "1998" }, 
    { url: "https://open.spotify.com/track/3FD3gEw8o1Kb5OPBZr8rhy", label: "Voor 2000", title: "Link 98", year: "1999" }, 
    { url: "https://open.spotify.com/track/24GYmF6atbc1mOmyN5RA0R", label: "Voor 2000", title: "Link 100", year: "1999" }, 
    { url: "https://open.spotify.com/track/1G391cbiT3v3Cywg8T7DM1", label: "Voor 2000", title: "Link 103", year: "1999" }
];

var f1Questions = [
    { question: "Wat is de minimale bandenspanning van een F1-band? (Technisch)", answer: "Dit wordt per race vastgesteld door Pirelli en de FIA om veiligheid te garanderen." },
    { question: "Wat is de hoofdreden dat een F1-motor tegenwoordig een V6-hybride turbomotor is? (Technisch)", answer: "Brandstofefficiëntie, duurzaamheid en relevantie voor straatauto's." },
    { question: "Wat is de functie van de MGU-H? (Technisch)", answer: "Het zet hitte uit de uitlaatgassen om in elektrische energie (en drijft de turbo aan)." },
    { question: "Wat is het effect van 'ground effect' op een Formule 1-auto? (Technisch)", answer: "Het zuigt de auto tegen het asfalt door luchtstroom onder de vloer (Venturi-effect)." },
    { question: "Wat is 'Porpoising'? (Technisch)", answer: "Het stuiteren van de auto op rechte stukken door het wegvallen en terugkeren van downforce." },
    { question: "Wanneer mag een coureur DRS gebruiken? (Technisch)", answer: "In DRS-zones, als hij binnen 1 seconde van zijn voorganger rijdt (en na 2 rondes in de race)." },
    { question: "Wat is een 'flat spot'? (Technisch)", answer: "Een plat vlak op de band door blokkerende wielen tijdens het remmen." },
    { question: "Wat is de functie van de 'halo'? (Technisch)", answer: "Het beschermen van het hoofd van de coureur tegen grote brokstukken." },
    { question: "Wat betekent een Blauwe Vlag tijdens de race? (Technisch)", answer: "Er komt een snellere auto aan (die je op een ronde zet); je moet aan de kant." },
    { question: "Hoeveel versnellingen (vooruit) heeft een moderne Formule 1-auto? (Technisch)", answer: "8 versnellingen." },
    { question: "Wat deden de Barge Boards (voor 2022)? (Technisch)", answer: "Luchtstroom sturen rond de sidepods (nu verboden om inhalen te verbeteren)." },
    { question: "Waarmee wordt een F1-motor gekoeld? (Technisch)", answer: "Water en speciale koelvloeistof." },
    { question: "Wat is de straf voor een 'Jump Start' (te vroeg wegrijden)? (Technisch)", answer: "Meestal een tijdstraf (5 of 10 seconden) of een Drive-Through penalty." },
    { question: "Wat is het minimumgewicht van een auto + coureur (ongeveer)? (Technisch)", answer: "Rond de 798 kg (zonder brandstof)." },
    { question: "Hoeveel toeren draait een moderne F1-motor ongeveer? (Technisch)", answer: "Maximaal 15.000, maar ze schakelen vaak rond de 12.000-13.000 voor efficiëntie." },
    { question: "Wat is het vaste racenummer van Max Verstappen (als hij geen kampioen is)? (Max)", answer: "33." },
    { question: "In welk jaar werd Max Verstappen voor het eerst wereldkampioen? (Max)", answer: "2021." },
    { question: "Welke Grand Prix won Max Verstappen bij zijn debuut voor Red Bull? (Max)", answer: "GP van Spanje (2016)." },
    { question: "Wat is de geboorteplaats van Max Verstappen? (Max)", answer: "Hasselt, België (maar hij rijdt onder Nederlandse vlag)." },
    { question: "Wat is de volledige naam van het team van Max? (Max)", answer: "Oracle Red Bull Racing." },
    { question: "Wie is de teamgenoot van Max Verstappen (2024)? (Max)", answer: "Sergio Pérez." },
    { question: "Wie is de race-ingenieur van Max ('GP')? (Max)", answer: "Gianpiero Lambiase." },
    { question: "Hoeveel races won Max in het recordseizoen 2023? (Max)", answer: "19 van de 22 races." },
    { question: "Hoe oud was Max toen hij zijn F1-debuut maakte? (Max)", answer: "17 jaar." },
    { question: "Wie levert de motoren aan Red Bull Racing? (Max)", answer: "Honda (RBPT)." },
    { question: "Wat is het racenummer van Lando Norris? (Norris)", answer: "4." },
    { question: "Voor welk team rijdt Lando Norris? (Norris)", answer: "McLaren." },
    { question: "Wat is de bijnaam van het duo Lando Norris & Daniel Ricciardo? (Norris)", answer: "'Carlando'." },
    { question: "In welk jaar debuteerde Lando Norris in de F1? (Norris)", answer: "2019." },
    { question: "Waar won Lando Norris zijn eerste Grand Prix? (Norris)", answer: "Miami (2024)." },
    { question: "Wat is de nationaliteit van Lando Norris? (Norris)", answer: "Brits (en half Belgisch via zijn moeder)." },
    { question: "Hoe heet het gaming- en kledingmerk van Lando? (Norris)", answer: "Quadrant." },
    { question: "Wie is de bekende CEO van McLaren Racing? (Norris)", answer: "Zak Brown." },
    { question: "Op welke plek eindigde Lando in het F2 kampioenschap 2018? (Norris)", answer: "2e (achter George Russell)." },
    { question: "Welke kleur is onlosmakelijk verbonden met McLaren? (Norris)", answer: "Papaya Oranje." },
];

var boardCommands = [
    { command: "Vliegende Start! Ga **3 stappen** vooruit.", movement: 3 },
    { command: "Onverwachte Pitstop: Ga **1 stap** achteruit.", movement: -1 },
    { command: "Zing een Liedje: Zing 10 seconden lang een liedje naar keuze. Ga daarna **1 stap** vooruit.", movement: 1 },
    { command: "Grote Remfout: Ga **4 stappen** achteruit.", movement: -4 },
    { command: "Volg de Leider: Ga terug naar de plek van de laatst gepasseerde speler. Ga daarna **1 stap** vooruit.", movement: 1, action: "goto_last_player" },
    { command: "DRS Geopend: Gooi een dobbelsteen (1-6) en ga dat aantal **achteruit**!", movement: 0, action: "dice_backward" },
    { command: "Lekke Band: Sla de volgende beurt over. Ga daarna **2 stappen** achteruit.", movement: -2, action: "skip_turn" },
    { command: "Vraagteken: Voer de **eerste opdracht** van de F1 Quiz of Muziekquiz uit (kies zelf). Ga daarna **1 stap** vooruit.", movement: 1, action: "execute_other_quiz" },
    { command: "Kleine Fout: Ga **1 stap** achteruit.", movement: -1 },
    { command: "Perfecte Bocht: Ga **2 stappen** vooruit.", movement: 2 },
    { command: "Uitwijkmanoeuvre: Ga **1 stap** achteruit.", movement: -1 },
    { command: "Safety Car: Alle spelers (inclusief jij) slaan hun volgende beurt over. Ga daarna **1 stap** vooruit.", movement: 1, action: "safety_car" },
    { command: "Turbo Boost: Ga **3 stappen** vooruit.", movement: 3 },
    { command: "Vuile Lucht: Ga **2 stappen** achteruit.", movement: -2 },
    { command: "Kies een Categorie: Voer een opdracht uit de F1 Quiz **of** de Muziekquiz uit (kies zelf). **Geen stappen**.", movement: 0, action: "execute_other_quiz" },
    { command: "Tankstop: Ga **2 stappen** achteruit.", movement: -2 },
    { command: "Eindsprint: Ga **4 stappen** vooruit.", movement: 4 },
    { command: "Verkeerde Banden: Ga **3 stappen** achteruit.", movement: -3 },
    { command: "Zeg 'Kees' 5 keer achter elkaar zonder te lachen. Gelukt? Ga **2 stappen** vooruit. Mislukt? Ga **1 stap** achteruit.", movement: 0, action: "challenge" },
    { command: "Slipstream: Ga **1 stap** vooruit.", movement: 1 },
    { command: "Dubbele Pech: Gooi een dobbelsteen (1-6) en ga dat aantal **achteruit**. Sla daarna je volgende beurt over.", movement: 0, action: "dice_skip" },
    { command: "Radio Storing: Ga **1 stap** achteruit.", movement: -1 },
    { command: "Nieuwe Set Banden: Ga **1 stap** vooruit.", movement: 1 },
    { command: "Verrassingsopdracht: Voer de **eerste opdracht** uit de F1 Quiz uit. Ga **2 stappen** vooruit.", movement: 2, action: "execute_f1" },
    { command: "Verrassingsopdracht: Voer de **eerste opdracht** uit de Muziekquiz uit. Ga **2 stappen** vooruit.", movement: 2, action: "execute_music" },
    { command: "Trek de Kaart van de Speler Na Je: De volgende speler leest en voert deze opdracht uit. **Jij blijft staan**.", movement: 0, action: "pass_command" },
    { command: "Motorproblemen: Ga **3 stappen** achteruit.", movement: -3 },
    { command: "Snelle Ronde: Ga **2 stappen** vooruit.", movement: 2 },
    { command: "Verplichte Dans: Doe 10 seconden lang de Macarena (of een andere gekke dans). Ga daarna **2 stappen** vooruit.", movement: 2, action: "challenge" },
    { command: "Perfecte Inhaalactie: Ga **4 stappen** vooruit.", movement: 4 },
];

// --- HELPER FUNCTIONS ---
function getNextIndex(questions, usedIndices) {
    if (usedIndices.length === questions.length) {
        usedIndices.length = 0;
        console.log("Quizlijst is op, start opnieuw.");
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (usedIndices.includes(randomIndex));
    usedIndices.push(randomIndex);
    return randomIndex;
}

// --- INTRO & AUDIO LOGIC ---

window.startIntroSequence = function() {
    var playBtn = document.querySelector('.intro-play-btn');
    var skipBtn = document.getElementById('skip-btn');
    
    if (playBtn) playBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.remove('hidden');

    if (!introAudio) {
        introAudio = new Audio('intro hip.mp3');
    }
    
    introAudio.currentTime = 0;
    introAudio.play().catch(e => console.log("Intro audio play error:", e));

    // 50 Seconds timer
    if (introTimer) clearTimeout(introTimer);
    introTimer = setTimeout(function() {
        window.skipIntro();
    }, 50000); // 50 seconds
};

window.skipIntro = function() {
    if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
    }
    if (introTimer) clearTimeout(introTimer);
    
    window.showView('main-menu');
};

window.resetIntro = function() {
    // Stop main audio
    window.stopMainMenuAudio();
    // Stop intro audio if playing
    if (introAudio) {
        introAudio.pause();
        introAudio.currentTime = 0;
    }
    
    // Reset buttons
    var playBtn = document.querySelector('.intro-play-btn');
    var skipBtn = document.getElementById('skip-btn');
    if (playBtn) playBtn.classList.remove('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');

    window.showView('intro-view');
};

// --- AUDIO FUNCTIONS ---
window.updateAudioButtonState = function() {
    var btn = document.getElementById('audio-toggle-btn');
    if (!btn) return;
    if (userWantsMusic) {
        btn.innerHTML = "🔇 Muziek uit";
        btn.style.background = "#cbd5e1";
        btn.style.color = "#475569";
    } else {
        btn.innerHTML = "▶️ Muziek aan";
        btn.style.background = "#e30613";
        btn.style.color = "white";
    }
};

window.playMainMenuAudio = function() {
    // Only play if the user actually wanted music
    if (!userWantsMusic) return;

    var audioUrl = "back hip.mp3"; 
    
    // Create audio object if it doesn't exist
    if (!mainMenuAudio) {
        mainMenuAudio = new Audio(audioUrl);
        mainMenuAudio.loop = true; 
        mainMenuAudio.addEventListener('error', function(e) {
            console.log("Audio load error, disabling playing state");
            isAudioPlaying = false;
        });
    }

    // Try to play
    if (mainMenuAudio.paused) {
        var playPromise = mainMenuAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                isAudioPlaying = true;
            }).catch(function(error) {
                console.log("Audio play prevented: " + error);
                isAudioPlaying = false;
            });
        }
    }
};

window.stopMainMenuAudio = function() {
    if (mainMenuAudio) {
        mainMenuAudio.pause();
        isAudioPlaying = false;
    }
};

window.toggleMainMenuAudio = function() {
    userWantsMusic = !userWantsMusic; // Toggle preference
    window.updateAudioButtonState();
    
    if (userWantsMusic) {
        window.playMainMenuAudio();
    } else {
        window.stopMainMenuAudio();
    }
};

// --- NAVIGATION ---
window.showView = function(viewId, skipRandom) {
    
    // Surprise Logic
    if (viewId === 'main-menu' && !skipRandom) {
        if (Math.random() < 0.40) {
            viewId = 'react-view';
        }
    }

    var views = document.querySelectorAll('.view');
    var header = document.getElementById('main-header');
    
    views.forEach(function(view) {
        if (view.id === viewId) {
            view.classList.remove('hidden');
            view.classList.add('active');

            // --- VIEW SPECIFIC LOGIC ---
            if (viewId === 'intro-view') {
                if (header) header.style.display = 'none'; // Hide header on intro
                // Audio is handled by startIntroSequence button
            }
            else if (viewId === 'main-menu') {
                if (header) header.style.display = 'block';
                // Reset content
                document.getElementById('music-output').innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <p style="margin-bottom:20px;">Klaar voor de start?</p>
                        <button onclick="startMusicQuiz()" class="action-btn primary">Start Nieuw Lied</button>
                    </div>`;
                document.getElementById('f1-output').innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <p style="margin-bottom:20px;">Test je kennis!</p>
                        <button onclick="startF1Quiz()" class="action-btn primary">Nieuwe Vraag</button>
                    </div>`;
                document.getElementById('board-output').innerHTML = `
                     <div style="text-align:center; padding:20px;">
                        <p style="margin-bottom:20px;">Pak een kaart...</p>
                        <button onclick="getBoardCommand()" class="action-btn primary">Trek Kaart</button>
                    </div>`;
                
                // Audio: Play if user wants it
                if (userWantsMusic) window.playMainMenuAudio();

            } else if (viewId === 'react-view') {
                 if (header) header.style.display = 'none';
                 // Audio: ALWAYS OFF in minigames
                 window.stopMainMenuAudio();

            } else if (viewId === 'music-view') {
                if (header) header.style.display = 'block';
                // Audio: ALWAYS OFF in Music Quiz
                window.stopMainMenuAudio(); 

            } else {
                // F1 / Board
                if (header) header.style.display = 'block';
                // Audio: Play if user wants it
                if (userWantsMusic) window.playMainMenuAudio();
            }

        } else {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });
};

// --- QUIZ FUNCTIONS (Buttons moved inside output) ---
window.startMusicQuiz = function() {
    var outputDiv = document.getElementById('music-output');
    var randomIndex = getNextIndex(musicTracks, usedMusicIndices);
    var track = musicTracks[randomIndex];
    currentMusicTrack = track; 
    currentMusicAnswer = `${track.label} (${track.year})`; 

    // STOP AUDIO (Extra Check)
    window.stopMainMenuAudio();

    // Create Embed URL
    var embedUrl = track.url.replace('/track/', '/embed/track/');
    if (embedUrl.indexOf('?') > -1) { embedUrl = embedUrl.split('?')[0]; }

    outputDiv.innerHTML = `
        <p class="text-sm text-gray-500 mb-2">Opdracht</p>
        <p class="font-bold mb-4">Is dit nummer uitgebracht<br> <span class="text-green-600">Vóór 2000</span> of <span class="text-blue-600">Ná 2000</span>?</p>
        
        <!-- EMBED PLAYER -->
        <iframe style="border-radius:12px" src="${embedUrl}?utm_source=generator&theme=0" width="100%" height="80" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
        
        <div class="text-xs text-gray-400 mt-4 mb-4">Luister naar het fragment...</div>
        <button onclick="showMusicAnswer()" class="action-btn warning">Toon Antwoord</button>
    `;
};

window.showMusicAnswer = function() {
    var outputDiv = document.getElementById('music-output');
    // Re-render content with answer revealed
    outputDiv.innerHTML = `
        <p class="text-sm text-gray-500 mb-2">Opdracht</p>
        <p class="font-bold mb-4">Is dit nummer uitgebracht<br> <span class="text-green-600">Vóór 2000</span> of <span class="text-blue-600">Ná 2000</span>?</p>
        <div class="text-xs text-gray-400 mt-2 mb-4">${currentMusicTrack ? currentMusicTrack.title : ''}</div>
        <p style="color: #e30613; font-weight: bold; font-size: 1.2rem; border-top: 1px solid #ddd; padding-top: 10px; margin-bottom: 20px;">
            Antwoord: ${currentMusicAnswer}
        </p>
        <button onclick="showView('main-menu')" class="action-btn secondary">Terug naar Menu</button>
    `;
};

window.startF1Quiz = function() {
    var outputDiv = document.getElementById('f1-output');
    var randomIndex = getNextIndex(f1Questions, usedF1Indices);
    currentF1Question = f1Questions[randomIndex];

    var category = currentF1Question.question.match(/\((.*?)\)/) ? currentF1Question.question.match(/\((.*?)\)/)[1] : 'Algemeen';
    var questionText = currentF1Question.question.replace(/\s*\(.*?\)\s*/g, '');

    outputDiv.innerHTML = `
        <div style="margin-bottom:10px;"><span class="badge" style="background:#cbd5e1; color:#334155;">${category}</span></div>
        <p style="font-weight:bold; font-size:1.1rem; margin-bottom: 20px;">${questionText}</p>
        <button onclick="showF1Answer()" class="action-btn warning">Toon Antwoord</button>
    `;
};

window.showF1Answer = function() {
    var outputDiv = document.getElementById('f1-output');
    // Keep question visible, add answer and Next button
    var category = currentF1Question.question.match(/\((.*?)\)/) ? currentF1Question.question.match(/\((.*?)\)/)[1] : 'Algemeen';
    var questionText = currentF1Question.question.replace(/\s*\(.*?\)\s*/g, '');

    outputDiv.innerHTML = `
        <div style="margin-bottom:10px;"><span class="badge" style="background:#cbd5e1; color:#334155;">${category}</span></div>
        <p style="font-weight:bold; font-size:1.1rem; margin-bottom: 20px;">${questionText}</p>
        <p style="color: #e30613; font-weight: bold; padding-top:15px; border-top:1px solid #ddd; margin-bottom: 20px;">
            ${currentF1Question.answer}
        </p>
        <button onclick="showView('main-menu')" class="action-btn secondary">Terug naar Menu</button>
    `;
};

window.getBoardCommand = function() {
    var outputDiv = document.getElementById('board-output');
    var randomIndex = Math.floor(Math.random() * boardCommands.length);
    var command = boardCommands[randomIndex];

    var movementColor = command.movement > 0 ? '#16a34a' : (command.movement < 0 ? '#dc2626' : '#475569');
    var movementText = command.movement > 0 ? `Ga ${command.movement} stap(pen) vooruit` : 
                       (command.movement < 0 ? `Ga ${Math.abs(command.movement)} stap(pen) achteruit` : `Blijf staan`);

    outputDiv.innerHTML = `
        <p style="margin-bottom: 20px; font-size: 1.1rem;">${command.command}</p>
        <div style="background: ${movementColor}; color: white; padding: 10px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
            ${movementText}
        </div>
        <button onclick="showView('main-menu')" class="action-btn secondary">Terug naar Menu</button>
    `;
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    // Start at Intro View
    if (window.showView) window.showView('intro-view', true);

    var header = document.getElementById('main-header');
    if (header) {
        header.addEventListener('click', function(e) {
            // Only trigger easter egg if clicking header background, not reset button
            if (e.target.tagName !== 'BUTTON') {
                console.log("Easter egg: Minigames");
                window.showView('react-view', true);
            }
        });
    }
});
