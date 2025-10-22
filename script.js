document.addEventListener("DOMContentLoaded", () => {
    const playerElement = document.getElementById("player");
    const fileInput = document.getElementById("fileInput");
    const fileName = document.getElementById("fileName");
    const fileResolution = document.getElementById("fileResolution");
    const fileQuality = document.getElementById("fileQuality");
    const errorMessage = document.getElementById("errorMessage");

    let fileLoaded = false;
    let currentFileUrl = null;
    let currentFileName = null;

    // Ocultar mensaje de error al inicio
    errorMessage.style.display = "none";

    // Inicializar Plyr
    const player = new Plyr('#player', {
        ratio: '16:9',
        autoplay: false,
        controls: [
            'play-large', 'rewind', 'play', 'fast-forward', 'progress', 'current-time',
            'duration', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        i18n: {
            restart: 'Reiniciar',
            rewind: 'Retroceder {seektime}s',
            play: 'Reproducir',
            pause: 'Pausar',
            fastForward: 'Adelantar {seektime}s',
            seek: 'Buscar',
            seekLabel: '{currentTime} de {duration}',
            played: 'Reproducido',
            buffered: 'En búfer',
            currentTime: 'Tiempo actual',
            duration: 'Duración',
            volume: 'Volumen',
            mute: 'Silenciar',
            unmute: 'Reactivar sonido',
            enableCaptions: 'Activar subtítulos',
            disableCaptions: 'Desactivar subtítulos',
            download: 'Descargar',
            enterFullscreen: 'Pantalla completa',
            exitFullscreen: 'Salir de pantalla completa',
            frameTitle: 'Reproductor para {title}',
            captions: 'Subtítulos',
            settings: 'Configuración',
            pip: 'PIP',
            menuBack: 'Volver',
            speed: 'Velocidad',
            normal: 'Normal',
            quality: 'Calidad',
            loop: 'Bucle'
        },
    });

    // Función para mostrar u ocultar el botón de descarga según si hay video
    function updateDownloadButton() {
        const downloadBtn = playerElement.querySelector('.plyr__control[data-plyr="download"]');
        if (downloadBtn) downloadBtn.style.display = fileLoaded ? 'inline-flex' : 'none';
    }

    // Observador por si Plyr recrea los controles
    const observer = new MutationObserver(updateDownloadButton);
    const controlsContainer = playerElement.querySelector('.plyr__controls');
    if (controlsContainer) observer.observe(controlsContainer, { childList: true, subtree: true });

    // Evento de descarga solo si hay video
    player.on('download', (event) => {
        if (!fileLoaded || !currentFileUrl) {
            errorMessage.textContent = "⚠️ No hay ningún video cargado para descargar.";
            errorMessage.style.display = "block";
            setTimeout(() => { errorMessage.style.display = "none"; }, 3500);
            return;
        }

        // Descargar únicamente el video cargado
        const a = document.createElement('a');
        a.href = currentFileUrl;
        a.download = currentFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Selección de archivo
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;

        fileLoaded = true;
        errorMessage.style.display = "none";

        if (currentFileUrl) URL.revokeObjectURL(currentFileUrl);
        currentFileUrl = URL.createObjectURL(file);
        currentFileName = file.name;

        player.source = { type: "video", sources: [{ src: currentFileUrl, type: file.type }] };

        fileName.textContent = file.name;

        const tempVideo = document.createElement("video");
        tempVideo.src = currentFileUrl;
        tempVideo.addEventListener("loadedmetadata", () => {
            fileResolution.textContent = `${tempVideo.videoWidth}x${tempVideo.videoHeight}`;
            const height = tempVideo.videoHeight;
            let quality;
            if (height >= 4320) quality = "8K Ultra HD";
            else if (height >= 2160) quality = "4K Ultra HD";
            else if (height >= 1440) quality = "2K QHD";
            else if (height >= 1080) quality = "Full HD";
            else if (height >= 720) quality = "HD";
            else if (height >= 480) quality = "SD 480p";
            else if (height >= 360) quality = "SD 360p";
            else if (height >= 240) quality = "SD 240p";
            else if (height >= 144) quality = "SD 144p";
            else if (height < 144) quality = "?";

            fileQuality.textContent = quality;
            tempVideo.remove();
        });
    });

    // Evitar reproducir sin video
    playerElement.addEventListener("play", () => {
        if (!fileLoaded) {
            player.pause();
            errorMessage.textContent = "⚠️ No has cargado ningún archivo de video.";
            errorMessage.style.display = "block";
            setTimeout(() => { errorMessage.style.display = "none"; }, 3500);
        }
    });

    // Limpiar URL temporal al salir
    window.addEventListener('beforeunload', () => {
        if (currentFileUrl) URL.revokeObjectURL(currentFileUrl);
    });
});
