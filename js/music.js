// music.js — Persistent music playback across pages
(function () {
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    if (!bgMusic || !musicToggle) return;

    bgMusic.volume = 0.3;

    const STORAGE_KEY_TIME = 'valentine_music_time';
    const STORAGE_KEY_PLAYING = 'valentine_music_playing';

    // Restore playback position and state
    const savedTime = parseFloat(localStorage.getItem(STORAGE_KEY_TIME)) || 0;
    const wasPlaying = localStorage.getItem(STORAGE_KEY_PLAYING) === 'true';

    bgMusic.currentTime = savedTime;

    function setPlayingUI() {
        musicToggle.textContent = '♫';
        musicToggle.classList.add('playing');
    }

    function setPausedUI() {
        musicToggle.textContent = '♪';
        musicToggle.classList.remove('playing');
    }

    // Save position every 250ms while playing
    setInterval(function () {
        if (!bgMusic.paused) {
            localStorage.setItem(STORAGE_KEY_TIME, bgMusic.currentTime);
        }
    }, 250);

    // Save position right before leaving the page
    window.addEventListener('beforeunload', function () {
        localStorage.setItem(STORAGE_KEY_TIME, bgMusic.currentTime);
        localStorage.setItem(STORAGE_KEY_PLAYING, !bgMusic.paused);
    });

    // Toggle button
    musicToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (bgMusic.paused) {
            bgMusic.play().then(setPlayingUI).catch(() => { });
            localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
        } else {
            bgMusic.pause();
            setPausedUI();
            localStorage.setItem(STORAGE_KEY_PLAYING, 'false');
        }
    });

    // If music was playing on previous page, auto-resume
    if (wasPlaying) {
        bgMusic.play().then(setPlayingUI).catch(function () {
            // Browser blocked autoplay — resume on first click
            document.addEventListener('click', function resumeOnClick() {
                bgMusic.play().then(setPlayingUI).catch(() => { });
                localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
                document.removeEventListener('click', resumeOnClick);
            }, { once: true });
        });
    } else {
        // First visit — start on first user click
        document.addEventListener('click', function firstPlay(e) {
            if (e.target === musicToggle) return; // toggle handles itself
            bgMusic.play().then(function () {
                setPlayingUI();
                localStorage.setItem(STORAGE_KEY_PLAYING, 'true');
            }).catch(() => { });
            document.removeEventListener('click', firstPlay);
        }, { once: true });
    }
})();
