
// --- GLOBAL FUNCTION DEFINITIONS (DEFINED FIRST) ---

// Helper Function
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

// Audio Functions
window.updateAudioButtonState = function() {
    var btn = document.getElementById('audio-toggle-btn');
    if (!btn) return;
    if (isAudioPlaying) {
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
    var audioUrl = "Tellen Tot 10.mp3"; 
    if (!mainMenuAudio || mainMenuAudio.paused) {
        if (!mainMenuAudio) {
            mainMenuAudio = new Audio(audioUrl);
            mainMenuAudio.loop = true; 
        }
        var playPromise = mainMenuAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                isAudioPlaying = true;
                window.updateAudioButtonState();
            }).catch(function(error) {
                isAudioPlaying = false;
                window.updateAudioButtonState();
                console.log("Audio kon niet automatisch afspelen.");
            });
        }
    }
};

window.stopMainMenuAudio = function() {
    if (mainMenuAudio) {
        mainMenuAudio.pause();
        // We do NOT reset currentTime to 0, so it resumes nicely
        isAudioPlaying = false;
        window.updateAudioButtonState();
    }
};

window.toggleMainMenuAudio = function() {
    if (isAudioPlaying) {
        window.stopMainMenuAudio();
    } else {
        window.playMainMenuAudio();
    }
};

// Navigatie Functie
// skipRandom is true when coming from the React App exit button
window.showView = function(viewId, skipRandom) {
    
    // --- SURPRISE LOGIC ---
    // If trying to go to main menu, and NOT forced to skip random (e.g. by React app exit)
    if (viewId === 'main-menu' && !skipRandom) {
        // 33% chance to trigger the mini-game surprise
        if (Math.random() < 0.33) {
            console.log("Verrassing! Triggering React View");
            viewId = 'react-view'; // Hijack the navigation
        }
    }

    var views = document.querySelectorAll('.view');
    var header = document.getElementById('main-header');
    
    views.forEach(function(view) {
        if (view.id === viewId) {
            view.classList.remove('hidden');
            view.classList.add('active');

            // --- VIEW SPECIFIC LOGIC ---
            if (viewId === 'main-menu') {
                // Reset content
                var musicOutput = document.getElementById('music-output');
                if(musicOutput) musicOutput.innerHTML = "Druk op 'Start Lied' om te beginnen.";
                var f1Output = document.getElementById('f1-output');
                if(f1Output) f1Output.innerHTML = "Druk op 'Nieuwe Vraag' om te starten.";
                var f1Btn = document.getElementById('f1-answer-btn');
                if(f1Btn) f1Btn.style.display = 'none';
                var boardOutput = document.getElementById('board-output');
                if(boardOutput) boardOutput.innerHTML = "Trek een kaart...";
                var musicAnsBtn = document.getElementById('music-answer-btn');
                if(musicAnsBtn) musicAnsBtn.style.display = 'none';
                var musicBackBtn = document.getElementById('music-back-btn');
                if(musicBackBtn) musicBackBtn.style.display = 'none';
                
                if (header) header.style.display = 'block';
                window.playMainMenuAudio(); // Ensure music is on

            } else if (viewId === 'react-view') {
                 if (header) header.style.display = 'none';
                 // Music CONTINUES in react view (verrassing popup)
                 window.playMainMenuAudio();

            } else if (viewId === 'music-view') {
                // Music STOPS in Music Quiz
                window.stopMainMenuAudio(); 
                if (header) header.style.display = 'block';

            } else {
                // F1 View, Board View -> Music continues
                window.playMainMenuAudio();
                if (header) header.style.display = 'block';
            }

        } else {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });
    // No scroll to 0 needed because we fixed the body height
};

// Quiz Functies
window.startMusicQuiz = function() {
    var outputDiv = document.getElementById('music-output');
    var answerBtn = document.getElementById('music-answer-btn');
    var backBtn = document.getElementById('music-back-btn');

    var randomIndex = getNextIndex(musicTracks, usedMusicIndices);
    var track = musicTracks[randomIndex];
    currentMusicTrack = track; 
    currentMusicAnswer = track.label; 

    var outputHTML = `
        <p class="text-sm text-gray-500 mb-2">Opdracht</p>
        <p class="font-bold mb-4">Is dit nummer uitgebracht<br> <span class="text-green-600">Vóór 2000</span> of <span class="text-blue-600">Ná 2000</span>?</p>
        <a href="${track.url}" target="_blank" class="bg-black text-white py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
            <span>🎧</span> Open in Spotify
        </a>
        <div class="text-xs text-gray-400 mt-2">${track.title}</div>
        <p id="music-answer" style="display: none; color: #e30613; font-weight: bold; margin-top: 20px; font-size: 1.2rem; border-top: 1px solid #ddd; padding-top: 10px;">
            Antwoord: ${currentMusicAnswer}
        </p>
    `;

    outputDiv.innerHTML = outputHTML;
    answerBtn.style.display = 'block';
    backBtn.style.display = 'none';
};

window.showMusicAnswer = function() {
    var answerText = document.getElementById('music-answer');
    var answerBtn = document.getElementById('music-answer-btn');
    var backBtn = document.getElementById('music-back-btn');

    if (answerText) {
        answerText.style.display = 'block';
        answerBtn.style.display = 'none'; 
        backBtn.style.display = 'block'; 
    }
};

window.startF1Quiz = function() {
    var outputDiv = document.getElementById('f1-output');
    var answerBtn = document.getElementById('f1-answer-btn');

    var randomIndex = getNextIndex(f1Questions, usedF1Indices);
    currentF1Question = f1Questions[randomIndex];

    var category = currentF1Question.question.match(/\((.*?)\)/) ? currentF1Question.question.match(/\((.*?)\)/)[1] : 'Algemeen';
    var questionText = currentF1Question.question.replace(/\s*\(.*?\)\s*/g, '');

    outputDiv.innerHTML = `
        <div style="margin-bottom:10px;"><span class="badge" style="background:#cbd5e1; color:#334155;">${category}</span></div>
        <p style="font-weight:bold; font-size:1.1rem;">${questionText}</p>
        <p id="f1-answer" style="display: none; color: #e30613; font-weight: bold; margin-top: 15px; padding-top:15px; border-top:1px solid #ddd;">
            ${currentF1Question.answer}
        </p>
    `;
    answerBtn.style.display = 'block';
};

window.showF1Answer = function() {
    var answerText = document.getElementById('f1-answer');
    var answerBtn = document.getElementById('f1-answer-btn');

    if (answerText) {
        answerText.style.display = 'block';
        answerBtn.style.display = 'none';
    }
};

window.getBoardCommand = function() {
    var outputDiv = document.getElementById('board-output');
    var randomIndex = Math.floor(Math.random() * boardCommands.length);
    var command = boardCommands[randomIndex];

    var movementColor = command.movement > 0 ? '#16a34a' : (command.movement < 0 ? '#dc2626' : '#475569');
    var movementText;
    if (command.movement > 0) {
        movementText = `Ga ${command.movement} stap(pen) vooruit`;
    } else if (command.movement < 0) {
        movementText = `Ga ${Math.abs(command.movement)} stap(pen) achteruit`;
    } else {
        movementText = `Blijf staan`;
    }

    outputDiv.innerHTML = `
        <p style="margin-bottom: 20px;">${command.command}</p>
        <div style="background: ${movementColor}; color: white; padding: 10px; border-radius: 8px; font-weight: bold;">
            ${movementText}
        </div>
    `;
};

// --- STATE VARIABLES ---
var currentF1Question = null;
var currentMusicTrack = null;
var currentMusicAnswer = null;
var mainMenuAudio = null;
var isAudioPlaying = false;
var usedMusicIndices = []; 
var usedF1Indices = [];

// --- DATA ARRAYS (Kort gehouden voor overzicht, data is in memory) ---
var musicTracks = [
    // Nummers NA 2000 (2000 en later)
    { url: "https://open.spotify.com/track/4BC2WQKrZdqMX6rHsvVbUy?si=N-MzXvDLQO2l0y9GNc8YxQ", label: "Na 2000", title: "Link 32 - (2000)" },
    { url: "https://open.spotify.com/track/3BCqG9GBF7GjJQHwJvlqSv?si=rQt6HCfAQb6xSFi4L_Jk5Q&context=spotify%3Aplaylist%3A55FFgxtJuTFRWi91pUgYHq", label: "Na 2000", title: "Link 33 - (2000)" },
    { url: "https://open.spotify.com/track/3APHT3KjbHi9OllkVQsuXF?si=ipf9OC-yRrSw2UN83pgceA&context=spotify%3Aplaylist%3A37i9dQZF1DWWB7GKDYW7V3", label: "Na 2000", title: "Link 46 - (2000)" },
    { url: "https://open.spotify.com/track/3AU1O0gRYf9goSefBGvSOv?si=vEUrU3B1Rae8XZX4tH8FeA&context=spotify%3Atrack%3A3AU1O0gRYf9goSefBGvSOv", label: "Na 2000", title: "Link 51 - (2000)" },
    { url: "https://open.spotify.com/track/2G8czBYoqbDYj9C9bks1P8?si=0xcRyxmDQpuDdpf-XPT7gg&context=spotify%3Aplaylist%3A55FFgxtJuTFRWi91pUgYHq", label: "Na 2000", title: "Link 34 - (2001)" },
    { url: "https://open.spotify.com/track/6UEfyhyfhYQsyipxOd95Ie?si=PFDOY8UDTcKlqSrfQXZolQ", label: "Na 2000", title: "Link 31 - (2002)" },
    { url: "https://open.spotify.com/track/0BCPKOYdS2jbQ8iyB56Zns?si=iDbZq2LLR1KB9HoKNx20Wg", label: "Na 2000", title: "Link 38 - (2002)" },
    { url: "https://open.spotify.com/track/5S8QeiTS2ehiXtzNDV2yR8?si=j_PDiE12TA66PW4fLRDlpg&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 40 - (2003)" },
    { url: "https://open.spotify.com/track/6PwjJ58I4t7Mae9xfZ9l9v?si=Ukxsq3Y9QM2ELfIZJOeJCw&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 45 - (2004)" },
    { url: "https://open.spotify.com/track/3Lk7RWStfLaHG7lXsuS87j?si=qklXm5BERten85d4dFyZfw&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 41 - (2005)" },
    { url: "https://open.spotify.com/track/0vFs2Eorve6vnnQcmItot1?si=7E9r5mGKRjmmFWGCPR1lmA", label: "Na 2000", title: "Link 37 - (2006)" },
    { url: "https://open.spotify.com/track/7e6Vp3lkuFwDvC4M687SJv?si=zyS2FvS_QUCpd0AQA2EZFA&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 43 - (2006)" },
    { url: "https://open.spotify.com/track/2sgBTNHz9ckmqj3rx3ez4M?si=RqhDdKeQTTC-8u7VL7kTbQ&context=spotify%3Aplaylist%3A37i9dQZF1DWWB7GKDYW7V3", label: "Na 2000", title: "Link 49 - (2007)" },
    { url: "https://open.spotify.com/track/5r5cp9IpziiIsR6b93vcnQ?si=eidv4xjjTHypbX4iYO5cHQ&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 39 - (2008)" },
    { url: "https://open.spotify.com/track/521r1faH9BQlyPVR5pMmXm?si=kNNpeTLIQdWCJqVC7n7ZWw&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 42 - (2008)" },
    { url: "https://open.spotify.com/track/2DrGEaqoruCSn0FffWCf5O?si=FibRhZj7ThO4Wz87Jd5eUQ&context=spotify%3Aplaylist%3A37i9dQZF1EIdh6MgVIhb8B", label: "Na 2000", title: "Link 44 - (2008)" },
    { url: "https://open.spotify.com/track/0ntQJM78wzOLVeCUAW7Y45?si=jSw5lMkJRfydFTyjakxtzw&context=spotify%3Aplaylist%3A37i9dQZF1DWWB7GKDYW7V3", label: "Na 2000", title: "Link 48 - (2008)" },
    { url: "https://open.spotify.com/track/456WNXWhDwYOSf5SpTuqxd?si=U8DT3m8TRu-HMaxVW250pA&context=spotify%3Aplaylist%3A37i9dQZF1DWWB7GKDYW7V3", label: "Na 2000", title: "Link 50 - (2009)" },
    { url: "https://open.spotify.com/track/47Slg6LuqLaX0VodpSCvPt?si=4p8oR_afSOGGtKnKddbEgQ", label: "Na 2000", title: "Link 36 - (2010)" },
    { url: "https://open.spotify.com/track/4cluDES4hQEUhmXj6TXkSo?si=vzMmAWsgSZqxMmZmWnGWeQ&context=spotify%3Asearch%3Aone%2Bdirection", label: "Na 2000", title: "Link 86 - (2012)" }, 
    { url: "https://open.spotify.com/track/2Yw5jfEaQFHoUFhzXUGkgV?si=DvXFC9C1TFm6NUWW_ilYPw&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Na 2000", title: "Link 87 - (2013)" }, 
    { url: "https://open.spotify.com/track/7KX65PC1UZuImsUInThbav?si=TeZQaBLwRCaqn9X7LiNizg&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Na 2000", title: "Link 54 - (2017)" },
    { url: "https://open.spotify.com/track/6ho0GyrWZN3mhi9zVRW7xi?si=xhfQk0R6TSaZOpU2PYokXg", label: "Na 2000", title: "Link 52 - (2018)" },
    { url: "https://open.spotify.com/track/3Rhfga08pNnhLMQVb2nRXp?si=2C2q0cvlQrmk7V3SG4oazQ&context=spotify%3Aalbum%3A2VXeD0hKkY9i8TyGb0chVi", label: "Na 2000", title: "Link 88 - (2019)" }, 
    { url: "https://open.spotify.com/track/3Udr12Hj4tFHG759UBSZNc?si=zVxlUHBnRP6ANUqcpJ7cDQ", label: "Na 2000", title: "Link 35 - (2023)" },
    { url: "https://open.spotify.com/track/1j8GQQGyC26O1TeW4LLvjk?si=h0S136uTTLizDYISuB3hWg&context=spotify%3Aplaylist%3A37i9dQZF1DWWB7GKDYW7V3", label: "Na 2000", title: "Link 47 - (2023)" },
    { url: "https://open.spotify.com/track/2ibiwyQF66OWBgJWW0tIF0?si=OLnFooAdSp23m28mVC2B-Q&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Na 2000", title: "Link 53 - (2023)" },
    { url: "https://open.spotify.com/track/1g9GiiPPaL7KcDHlDzu7lT?si=rzCtqv3dRBaQkSVzzPBUuw&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Na 2000", title: "Link 55 - (2025)" },

    // Nummers VOOR 2000 (t/m 1999)
    { url: "https://open.spotify.com/track/4CCLOGJX19mWFBDHSnifm9?si=W7XaMZCRQTGiqi-IMvfWlw&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Voor 2000", title: "Link 102 - (1970)" }, 
    { url: "https://open.spotify.com/track/2EqlS6tkEnglzr7tkKAAYD?si=zrET8C6cQyqIrjiQSXFJqw&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Voor 2000", title: "Link 104 - (1970)" }, 
    { url: "https://open.spotify.com/track/3GIChxHmuLmBm5PTNZGDtj?si=IvtgxP33QJ2wj1xQgO-bEQ&context=spotify%3Aplaylist%3A37i9dQZF1EVHGWrwldPRtj", label: "Voor 2000", title: "Link 105 - (1977)" }, 
    { url: "https://open.spotify.com/track/4iUH4ksweue6iGqQUgSzhx?si=ux6sBgSkQuusmX7tRUX5_A", label: "Voor 2000", title: "Link 96 - (1982)" }, 
    { url: "https://open.spotify.com/track/2H7PHVdQ3mXqEHXcvclTB0?si=pgeBZbzfRvCbcr7M2SVjcg&context=spotify%3Asearch%3A1999", label: "Voor 2000", title: "Link 97 - (1982)" }, 
    { url: "https://open.spotify.com/track/0ikz6tENMONtK6qGkOrU3c?si=79xCM3pUTFqzWS3QmnTnOg", label: "Voor 2000", title: "Link 95 - (1984)" }, 
    { url: "https://open.spotify.com/track/4JiEyzf0Md7KEFFGWDDdCr?si=tUGPdrOtReeH5XpsOn0ZyA&context=spotify%3Aplaylist%3A55FFgxtJuTFRWi91pUgYHq", label: "Voor 2000", title: "Link 93 - (1991)" },
    { url: "https://open.spotify.com/track/3d9DChrdc6BOeFsbrZ3Is0?si=wkUM-x31Scyd0Yev-TSfSw", label: "Voor 2000", title: "Link 94 - (1991)" },
    { url: "https://open.spotify.com/track/1Je1IMUlBXcx1Fz0WE7oPT?si=K10gRDPxSEm3jtc5lj3HbQ", label: "Voor 2000", title: "Link 92 - (1996)" },
    { url: "https://open.spotify.com/track/6fh6lGvzuQibcFUB076WIR?si=tm4AobdPR-iZKdKh5Qgt1w&context=spotify%3Aplaylist%3A77EcIa561Z1VZURot2EZrm", label: "Voor 2000", title: "Link 101 - (1996)" }, 
    { url: "https://open.spotify.com/track/5ZrDlcxIDZyjOzHdYW1ydr?si=H99cwTkbQa2zCCBio3YiAg", label: "Voor 2000", title: "Link 89 - (1997)" },
    { url: "https://open.spotify.com/track/7onAFA3kzCPJWG3gvvMxhx?si=LFFjmw_oTb-K0QYnEyk_kQ", label: "Voor 2000", title: "Link 90 - (1997)" },
    { url: "https://open.spotify.com/track/75CLNW6Goi8LZ6rYGDmfHS?si=H7d2EeYUTUC_hL7tYeFekw", label: "Voor 2000", title: "Link 91 - (1997)" },
    { url: "https://open.spotify.com/track/04wE70zoYM5Pckgw36dWBq?si=ahDXJBxRTnGFSI3Y0SgILw&context=spotify%3Aplaylist%3A5RUb6yWZYmOKxwRMVNrODu", label: "Voor 2000", title: "Link 99 - (1998)" }, 
    { url: "https://open.spotify.com/track/3FD3gEw8o1Kb5OPBZr8rhy?si=E3iSGpC4RJe0iL6wF-sjmg&context=spotify%3Aplaylist%3A5RUb6yWZYmOKxwRMVNrODu", label: "Voor 2000", title: "Link 98 - (1999)" }, 
    { url: "https://open.spotify.com/track/24GYmF6atbc1mOmyN5RA0R?si=miqZxOvWSw6pVsjUyK63rQ&context=spotify%3Aplaylist%3A5RUb6yWZYmOKxwRMVNrODu", label: "Voor 2000", title: "Link 100 - (1999)" }, 
    { url: "https://open.spotify.com/track/1G391cbiT3v3Cywg8T7DM1?si=TtEDVo2rQHi5zKq7F0Is1A&context=spotify%3Aplaylist%3A37i9dQZF1EJCz3OAQsqpNG", label: "Voor 2000", title: "Link 103 - (1999)" }
];

var f1Questions = [
    { question: "Wat is de minimale bandenspanning die de FIA voorschrijft voor een F1-band tijdens de race? (Technisch)", answer: "Dit varieert per circuit en bandencompound, maar wordt voor elke race specifiek vastgesteld door de FIA en Pirelli." },
    { question: "Wat is de hoofdreden dat een F1-motor tegenwoordig een V6-hybride turbomotor is, in plaats van een V10 of V12? (Technisch)", answer: "Brandstofefficiëntie en relevantie voor straatauto's. De huidige regels vereisen een maximale brandstofhoeveelheid per race." },
    { question: "Wat is de functie van de MGU-H (Motor Generator Unit - Heat) in een F1-hybride systeem? (Technisch)", answer: "Het zet warmte-energie uit de uitlaatgassen om in elektrische energie, of het drijft de turbo aan om 'turbo lag' tegen te gaan." },
    { question: "Wat is het effect van 'ground effect' op een Formule 1-auto? (Technisch)", answer: "Het creëert downforce door de lucht onder de auto snel te laten stromen, waardoor de auto als het ware aan de baan wordt 'vastgezogen'." },
    { question: "Wat is de technische term voor het fenomeen waarbij de auto verticaal begint te stuiteren bij hoge snelheid? (Technisch)", answer: "Porpoising." },
    { question: "Waar staat DRS voor en wanneer mag een coureur het gebruiken? (Technisch)", answer: "Drag Reduction System. Het mag alleen gebruikt worden op vooraf bepaalde DRS-zones als de coureur binnen 1 seconde van de auto voor zich rijdt." },
    { question: "Wat is een 'flat spot' op een F1-band? (Technisch)", answer: "Een platte plek op de band veroorzaakt door het blokkeren van een wiel tijdens hard remmen." },
    { question: "Wat is de functie van de 'halo' op een moderne F1-auto? (Technisch)", answer: "Een titanium beschermingsstructuur om de coureur te beschermen tegen rondvliegende brokstukken of bij een crash." },
    { question: "Wat gebeurt er als een coureur 'blauw licht' krijgt tijdens de pitstop? (Technisch)", answer: "Dit geeft aan dat de pitstop klaar is, maar dat er een auto aankomt in de pitstraat en de coureur moet wachten (onveilige release)." },
    { question: "Hoeveel versnellingen (vooruit) heeft een moderne Formule 1-auto? (Technisch)", answer: "8 versnellingen." },
    { question: "Wat is de functie van de Barge Boards (nu vervangen)? (Technisch)", answer: "Het sturen van de luchtstroom rond de zijkanten van de auto om deze efficiënter te maken." },
    { question: "Welke vloeistof wordt gebruikt om F1-motoren te koelen? (Technisch)", answer: "Water met een koelmiddeladditief." },
    { question: "Wat is de straf die wordt gegeven voor het te vroeg loslaten van de koppeling bij de start (jump start)? (Technisch)", answer: "Een tijdstraf, meestal 5 of 10 seconden." },
    { question: "Wat is het minimale gewicht (inclusief coureur) van een moderne F1-auto in kg? (Technisch)", answer: "Rond de 798 kg (dit varieert lichtjes per seizoen)." },
    { question: "Wat is het maximale toerental (RPM) van een moderne V6 hybride F1-motor? (Technisch)", answer: "De FIA stelt een limiet van 15.000 RPM, maar in de praktijk halen ze ongeveer 12.000 RPM." },
    { question: "Wat is het vaste racenummer van Max Verstappen in de Formule 1 (buiten de 1)? (Max)", answer: "33." },
    { question: "In welk jaar won Max Verstappen zijn eerste Formule 1 wereldtitel? (Max)", answer: "2021." },
    { question: "Welke Grand Prix was de eerste die Max Verstappen won in 2016? (Max)", answer: "De Grand Prix van Spanje (bij zijn debuut voor Red Bull Racing)." },
    { question: "In welk land werd Max Verstappen geboren? (Max)", answer: "Nederland." },
    { question: "Wat is de volledige naam van het Formule 1-team waarvoor Max Verstappen rijdt? (Max)", answer: "Oracle Red Bull Racing." },
    { question: "Wie is de teamgenoot van Max Verstappen bij Red Bull Racing? (Max)", answer: "Sergio Pérez." },
    { question: "Wat is de naam van de race-ingenieur van Max Verstappen? (Max)", answer: "Gianpiero Lambiase." },
    { question: "Welk record brak Max Verstappen in 2023 op het gebied van gewonnen races in één seizoen? (Max)", answer: "Hij won 19 races in één seizoen (een nieuw record)." },
    { question: "Op welke leeftijd maakte Max Verstappen zijn Formule 1-debuut? (Max)", answer: "17 jaar." },
    { question: "Welke motorleverancier gebruikt Red Bull Racing, het team van Max? (Max)", answer: "Honda (onder de merknaam Red Bull Powertrains)." },
    { question: "Wat is het vaste racenummer van Lando Norris in de Formule 1? (Norris)", answer: "4." },
    { question: "Voor welk Formule 1-team rijdt Lando Norris? (Norris)", answer: "McLaren." },
    { question: "Wat is de bijnaam van de relatie tussen Lando Norris en zijn voormalige teamgenoot Daniel Ricciardo? (Norris)", answer: "Shoey / 'bromance'." },
    { question: "In welk jaar maakte Lando Norris zijn Formule 1-debuut? (Norris)", answer: "2019." },
    { question: "Welke Grand Prix won Lando Norris voor het eerst? (Norris)", answer: "De Grand Prix van Miami (2024)." },
    { question: "In welk land werd Lando Norris geboren? (Norris)", answer: "Groot-Brittannië." },
    { question: "Wat is de naam van Lando Norris's e-sports en lifestyle merk? (Norris)", answer: "Quadrant." },
    { question: "Wat is de naam van de voormalige coureur die nu de CEO is van McLaren? (Norris)", answer: "Zak Brown." },
    { question: "In welke raceklasse heeft Lando Norris gereden voordat hij naar F1 kwam, waarin hij tweede werd? (Norris)", answer: "Formule 2 (in 2018)." },
    { question: "Wat is de bijnaam van de oranje kleurstelling die McLaren soms gebruikt? (Norris)", answer: "Papaya." },
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    var f1Btn = document.getElementById('f1-answer-btn');
    if (f1Btn) f1Btn.style.display = 'none';
    var musicAnsBtn = document.getElementById('music-answer-btn');
    if (musicAnsBtn) musicAnsBtn.style.display = 'none';
    var musicBackBtn = document.getElementById('music-back-btn');
    if (musicBackBtn) musicBackBtn.style.display = 'none';
    
    // Ensure default view is set safely
    if (window.showView) {
        window.showView('main-menu', true); // True prevents random surprise on initial load
    }
});
