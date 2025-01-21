const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const frameColor = document.getElementById('frameColor');
const frameText = document.getElementById('frameText');
const colorPickerWrapper = document.querySelector('.color-picker-wrapper');
const textInputWrapper = document.querySelector('.text-input-wrapper');
const textColor = document.getElementById('textColor');

// Çerçeve elementi oluştur
const frameBorder = document.createElement('div');
frameBorder.className = 'frame-border hidden';
document.querySelector('.crop-area').appendChild(frameBorder);

// Yazı elementi oluştur
const frameTextDisplay = document.createElement('div');
frameTextDisplay.className = 'frame-text-display hidden';
frameBorder.appendChild(frameTextDisplay);

// Canvas önizleme için
const previewCanvas = document.createElement('canvas');
previewCanvas.width = 400;
previewCanvas.height = 400;
previewCanvas.style.position = 'absolute';
previewCanvas.style.top = '-50px';
previewCanvas.style.left = '-50px';
previewCanvas.style.pointerEvents = 'none';
previewCanvas.style.zIndex = '1';
document.querySelector('.crop-area').appendChild(previewCanvas);

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Lütfen 10MB\'dan küçük bir fotoğraf seçin.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                preview.src = img.src;
                preview.style.width = '300px';
                preview.style.height = '300px';
                
                preview.classList.remove('hidden');
                colorPickerWrapper.classList.remove('hidden');
                textInputWrapper.classList.remove('hidden');
                document.querySelector('.quality-wrapper').classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
                
                // Fotoğraf yüklendiğinde çerçeveyi otomatik göster
                updateCustomFrame(frameColor.value);
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

frameColor.addEventListener('input', function(e) {
    updateCustomFrame(e.target.value);
});

frameText.addEventListener('input', function(e) {
    // Input değerini büyük harfe çevir ve input'a geri yaz
    e.target.value = e.target.value.toUpperCase();
    let text = e.target.value.trim();
    updateFrameText(text);
});

function updateFrameText(text) {
    if (!text) {
        previewCanvas.getContext('2d').clearRect(0, 0, 400, 400);
        return;
    }

    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 400);
    
    // Yazı ayarları
    ctx.fillStyle = textColor.value;
    ctx.font = 'bold 24px SF Pro Display';
    
    // Yazıyı çiz
    drawRadialText(ctx, text, 200, 200, 175, Math.PI);
}

function updateCustomFrame(color) {
    const rgb = hexToRgb(color);
    const gradient = `linear-gradient(
        to right top,
        rgb(${rgb.r}, ${rgb.g}, ${rgb.b}),
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8),
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5),
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4),
        rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1),
        rgba(255, 255, 255, 0)
    )`;
    
    frameBorder.style.background = gradient;
    frameBorder.classList.remove('hidden');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function drawRadialText(ctx, text, x, y, radius, startAngle) {
    ctx.save();
    
    // Yazı ayarları
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Harfleri radyal olarak yerleştir
    const chars = text.split('');
    const totalAngle = Math.PI / 2; // 90 derece
    const angleStep = totalAngle / (chars.length - 1);
    
    chars.forEach((char, i) => {
        // Sol ortadan başlayıp aşağı doğru git
        const angle = Math.PI - angleStep * i;
        const charX = x + Math.cos(angle) * radius;
        const charY = y + Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(charX, charY);
        ctx.rotate(angle + (3 * Math.PI/2)); // 270 derece
        ctx.fillText(char, 0, 0);
        ctx.restore();
    });
    
    ctx.restore();
}

// Text rengi değiştiğinde preview'ı güncelle
textColor.addEventListener('input', function(e) {
    if (frameText.value.trim()) {
        // Mevcut değeri kullan (zaten büyük harfli)
        updateFrameText(frameText.value.trim());
    }
});

downloadBtn.addEventListener('click', function() {
    const canvas = document.createElement('canvas');
    const quality = parseInt(document.getElementById('imageQuality').value);
    const FIXED_SIZE = quality;
    canvas.width = FIXED_SIZE;
    canvas.height = FIXED_SIZE;
    
    const ctx = canvas.getContext('2d');
    const CENTER = FIXED_SIZE/2;
    
    // Saydam arka plan
    ctx.clearRect(0, 0, FIXED_SIZE, FIXED_SIZE);
    
    // Çerçeveyi çiz
    if (!frameBorder.classList.contains('hidden')) {
        const gradient = ctx.createLinearGradient(0, FIXED_SIZE, FIXED_SIZE, 0);
        const rgb = hexToRgb(frameColor.value);
        
        gradient.addColorStop(0, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        gradient.addColorStop(0.2, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
        gradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
        gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, FIXED_SIZE/2, 0, Math.PI * 2);
        ctx.arc(CENTER, CENTER, FIXED_SIZE * 0.375, 0, Math.PI * 2, true); // İç çemberi orantılı yap
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // Fotoğrafı çiz
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, FIXED_SIZE * 0.375, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
        preview, 
        CENTER - (FIXED_SIZE * 0.375), 
        CENTER - (FIXED_SIZE * 0.375), 
        FIXED_SIZE * 0.75, 
        FIXED_SIZE * 0.75
    );
    ctx.restore();
    
    // Radyal yazıyı ekle
    if (frameText.value.trim()) {
        let text = frameText.value.trim();
        
        ctx.fillStyle = textColor.value;
        ctx.font = `bold ${FIXED_SIZE * 0.06}px SF Pro Display`; // Font boyutunu orantılı yap
        drawRadialText(ctx, text, CENTER, CENTER, FIXED_SIZE * 0.4375, Math.PI);
    }
    
    const link = document.createElement('a');
    link.download = 'profil-fotografi.png';
    // PNG formatında maksimum kalite
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
});

