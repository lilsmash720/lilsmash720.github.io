document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const volumeControl = document.getElementById('volumeControl');
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    
    // Playlist of songs and their details
    const playlist = [
        { title: "Dolce Vita", artist: "Ryan Paris", src: "music/dolceVita.mp3", artwork: "img/dolceVita.jpg" },
        { title: "Who Can It Be Now?", artist: "Men At Work", src: "music/menAtWork.mp3", artwork: "img/menAtWork.jpg" },
        { title: "Tarzan Boy", artist: "Baltimora", src: "music/tarzanBoy.mp3", artwork: "img/tarzanBoy.jpg" },
        { title: "Right Here, Right Now", artist: "Fatboy Slim", src: "music/fatboySlim.mp3", artwork: "img/fatboySlim.jpg" },
        { title: "Chacarron", artist: "El Chombo", src: "music/chacarron.mp3", artwork: "img/Chacarron.jpg" },
        // Add more songs as needed
    ];
    
    const startSongIndex = parseInt(document.body.getAttribute('data-initial-song')) || 0;
    let currentSongIndex = startSongIndex;

    function loadSong(index) {
        const song = playlist[index];
        audioPlayer.src = song.src;
        document.getElementById('albumArt').src = song.artwork;
        document.getElementById('songTitle').innerText = `Song Title: ${song.title}`;
        document.getElementById('artistName').innerText = `Artist: ${song.artist}`;
        audioPlayer.play();
        setupVisualizer();
    }

    loadSong(currentSongIndex);
    audioPlayer.volume = volumeControl.value;

    // Volume control
    volumeControl.addEventListener('input', function() {
        audioPlayer.volume = volumeControl.value;
    });

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        loadSong(currentSongIndex);
    }

    function previousSong() {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentSongIndex);
    }

    // Shuffle playlist function
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    shuffle(playlist);
    
    // Event listeners for audio player controls
    audioPlayer.addEventListener('ended', nextSong);
    document.getElementById('nextButton').addEventListener('click', nextSong);
    document.getElementById('prevButton').addEventListener('click', previousSong);
    
    // Visualizer Setup
    function setupVisualizer() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Slightly transparent black background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
        
            // Calculate the overall maximum height from the data array
            const maxHeight = Math.max(...dataArray);
        
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
        
                // Calculate color for the rainbow effect
                const hue = (i / bufferLength * 360 + (performance.now() / 10)) % 360; 
                ctx.fillStyle = `hsl(${hue}, 100%, 50%)`; 
        
                // Normalize bar height and amplify its response
                const normalizedHeight = (barHeight / maxHeight) * canvas.height; // Use full canvas height
                const limitedHeight = Math.min(normalizedHeight, canvas.height); // Limit maximum height
        
                // Draw the bars symmetrically
                ctx.fillRect(x, canvas.height - limitedHeight, barWidth, limitedHeight); // Left side
                ctx.fillRect(canvas.width - x - barWidth, canvas.height - limitedHeight, barWidth, limitedHeight); // Mirror on the right side
                x += barWidth + 1;
            }
        }
        
        
        draw();
    }
});
