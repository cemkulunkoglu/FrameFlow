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

// Fotoğraf pozisyonu için değişkenler
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

function updatePreview() {
    // Maksimum kaydırma sınırlarını hesapla
    const maxOffset = 50; // Kaydırma sınırı (piksel)
    
    // Sınırları kontrol et
    offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    offsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));
    
    // Pozisyonu güncelle
    preview.style.objectPosition = `${50 + (offsetX / 1.5)}% ${50 + (offsetY / 1.5)}%`;
}

function startDragging(e) {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    preview.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging) return;

    e.preventDefault();
    // Kaydırma işlemini tersine çevir
    offsetX = startX - e.clientX;
    offsetY = startY - e.clientY;

    updatePreview();
}

function stopDragging() {
    isDragging = false;
    preview.style.cursor = 'grab';
}

// Mouse olayları
preview.addEventListener('mousedown', startDragging);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDragging);

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
                preview.style.cursor = 'grab';
                preview.style.objectFit = 'cover';
                preview.style.objectPosition = '50% 50%';
                
                // Değerleri sıfırla
                offsetX = 0;
                offsetY = 0;
                
                preview.classList.remove('hidden');
                colorPickerWrapper.classList.remove('hidden');
                textInputWrapper.classList.remove('hidden');
                document.querySelector('.quality-wrapper').classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
                
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
    // Türkçe karakter dönüşümleri
    const turkishToUpper = str => str
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .replace(/ç/g, 'Ç')
        .replace(/ğ/g, 'Ğ')
        .replace(/ö/g, 'Ö')
        .replace(/ş/g, 'Ş')
        .replace(/ü/g, 'Ü')
        .toUpperCase();
    
    // Input değerini Türkçe büyük harfe çevir ve input'a geri yaz
    e.target.value = turkishToUpper(e.target.value);
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
    
    // Türkçe karakter dönüşümleri
    const turkishToUpper = str => str
        .replace(/i/g, 'İ')
        .replace(/ı/g, 'I')
        .replace(/ç/g, 'Ç')
        .replace(/ğ/g, 'Ğ')
        .replace(/ö/g, 'Ö')
        .replace(/ş/g, 'Ş')
        .replace(/ü/g, 'Ü')
        .toUpperCase();
    
    // Metni Türkçe büyük harfe çevir
    text = turkishToUpper(text);
    
    // Harfleri radyal olarak yerleştir
    const chars = text.split('');
    const anglePerChar = Math.PI / 24; // Sabit harf arası açı (7.5 derece)
    const totalAngle = anglePerChar * (chars.length - 1); // Toplam açı
    const startingAngle = Math.PI - Math.PI/8; // Başlangıç açısı (22.5 derece yukarıda)
    
    chars.forEach((char, i) => {
        const angle = startingAngle - (anglePerChar * i);
        const charX = x + Math.cos(angle) * radius;
        const charY = y + Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(charX, charY);
        ctx.rotate(angle + (3 * Math.PI/2));
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
    canvas.width = quality;
    canvas.height = quality;
    const ctx = canvas.getContext('2d');
    const CENTER = quality / 2;
    
    // Fotoğrafı çiz
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, quality * 0.375, 0, Math.PI * 2);
    ctx.clip();
    
    // Object-position değerlerini al ve ters çevir
    const position = window.getComputedStyle(preview).objectPosition.split(' ');
    const posX = 100 - parseFloat(position[0]); // X değerini ters çevir (82.6667% -> 17.3333%)
    const posY = 100 - parseFloat(position[1]); // Y değerini ters çevir (83.3333% -> 16.6667%)
    
    // Orijinal fotoğrafın en/boy oranını koru
    const aspectRatio = preview.naturalWidth / preview.naturalHeight;
    let drawWidth, drawHeight;
    
    if (aspectRatio >= 1) {
        drawHeight = quality * 0.75;
        drawWidth = drawHeight * aspectRatio;
    } else {
        drawWidth = quality * 0.75;
        drawHeight = drawWidth / aspectRatio;
    }
    
    // Kaydırma miktarını hesapla
    const moveX = ((posX - 50) / 100) * (drawWidth - quality * 0.75);
    const moveY = ((posY - 50) / 100) * (drawHeight - quality * 0.75);
    
    // Sınırları kontrol et
    const maxOffsetX = (drawWidth - quality * 0.75) / 2;
    const maxOffsetY = (drawHeight - quality * 0.75) / 2;
    const offsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, moveX));
    const offsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, moveY));
    
    ctx.drawImage(
        preview,
        CENTER - (drawWidth / 2) + offsetX,
        CENTER - (drawHeight / 2) + offsetY,
        drawWidth,
        drawHeight
    );
    ctx.restore();
    
    // Çerçeveyi çiz
    if (!frameBorder.classList.contains('hidden')) {
        const gradient = ctx.createLinearGradient(0, quality, quality, 0);
        const rgb = hexToRgb(frameColor.value);
        
        gradient.addColorStop(0, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        gradient.addColorStop(0.2, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`);
        gradient.addColorStop(0.4, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
        gradient.addColorStop(0.6, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`);
        gradient.addColorStop(0.8, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, quality / 2, 0, Math.PI * 2);
        ctx.arc(CENTER, CENTER, quality * 0.375, 0, Math.PI * 2, true);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // Yazıyı çiz
    if (frameText.value.trim()) {
        ctx.fillStyle = textColor.value;
        ctx.font = `bold ${quality * 0.06}px SF Pro Display`;
        drawRadialText(ctx, frameText.value.trim(), CENTER, CENTER, quality * 0.4375, Math.PI);
    }
    
    const link = document.createElement('a');
    link.download = 'profil-fotografi.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
});

// Gece/Gündüz modu kontrolü
const darkModeToggle = document.getElementById('darkMode');

// Sayfa yüklendiğinde localStorage'dan tercihi al
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode'); // Light mode'u kaldır
    darkModeToggle.checked = true;
} else {
    document.body.classList.add('light-mode'); // Varsayılan olarak light mode
}

// Switch değiştiğinde
darkModeToggle.addEventListener('change', function(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode'); // Light mode'u kaldır
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode'); // Light mode'u ekle
        localStorage.setItem('darkMode', 'false');
    }
});

