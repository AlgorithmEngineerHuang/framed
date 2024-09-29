document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const frameStyle = document.getElementById('frame-style');
    const frameColor = document.getElementById('frame-color');
    const frameWidth = document.getElementById('frame-width');
    const frameWidthValue = document.getElementById('frame-width-value');
    const editIcons = document.getElementById('edit-icons');
    const editOptions = document.getElementById('edit-options');
    const brightness = document.getElementById('brightness');
    const contrast = document.getElementById('contrast');
    const saturation = document.getElementById('saturation');
    const zoomSlider = document.getElementById('zoom');
    const downloadIcon = document.getElementById('download-icon');
    const flipIcon = document.getElementById('flip-icon');

    let currentZoom = 1;
    let imageWidth, imageHeight;
    let isFlipped = false;

    editIcons.style.display = 'none';
    editOptions.style.display = 'none';

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    imageWidth = img.naturalWidth;
                    imageHeight = img.naturalHeight;
                    fitImageToPreview(img);
                    applyFrame();
                    applyImageFilters();
                    editIcons.style.display = 'grid';
                    adjustIconsLayout();
                };
                img.src = e.target.result;
                const existingImg = imagePreview.querySelector('img');
                if (existingImg) {
                    imagePreview.replaceChild(img, existingImg);
                } else {
                    imagePreview.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    [frameStyle, frameColor, frameWidth].forEach(element => {
        element.addEventListener('change', () => {
            applyFrame();
            if (element === frameWidth) {
                updateFrameWidthValue();
            }
        });
    });

    frameWidth.addEventListener('input', updateFrameWidthValue);

    [brightness, contrast, saturation, zoomSlider].forEach(element => {
        element.addEventListener('input', applyImageFilters);
    });

    flipIcon.addEventListener('click', () => {
        isFlipped = !isFlipped;
        applyImageFilters();
    });

    editIcons.querySelectorAll('i').forEach(icon => {
        icon.addEventListener('click', () => {
            editOptions.style.display = 'block';
            const filterId = icon.id.split('-')[0];
            [brightness, contrast, saturation, zoomSlider].forEach(slider => {
                slider.style.display = slider.id === filterId ? 'block' : 'none';
            });
        });
    });

    function updateFrameWidthValue() {
        frameWidthValue.textContent = `${frameWidth.value}px`;
    }

    function fitImageToPreview(img) {
        const previewWidth = imagePreview.clientWidth;
        const previewHeight = imagePreview.clientHeight;
        const imageAspectRatio = imageWidth / imageHeight;
        const previewAspectRatio = previewWidth / previewHeight;

        if (imageAspectRatio > previewAspectRatio) {
            img.style.width = '100%';
            img.style.height = 'auto';
        } else {
            img.style.width = 'auto';
            img.style.height = '100%';
        }

        // 存储初始尺寸
        img.dataset.initialWidth = img.offsetWidth;
        img.dataset.initialHeight = img.offsetHeight;

        currentZoom = 1;
        zoomSlider.value = 100;
    }

    function applyFrame() {
        const img = imagePreview.querySelector('img');
        if (!img) return;

        const style = frameStyle.value;
        const color = frameColor.value;
        const width = frameWidth.value + 'px';

        img.style.border = style === 'simple' ? `${width} solid ${color}` : 'none';
    }

    function applyImageFilters() {
        const img = imagePreview.querySelector('img');
        if (!img) return;

        const brightnessValue = brightness.value;
        const contrastValue = contrast.value;
        const saturationValue = saturation.value;
        currentZoom = zoomSlider.value / 100;

        // 计算缩放后的尺寸
        const scaledWidth = parseFloat(img.dataset.initialWidth) * currentZoom;
        const scaledHeight = parseFloat(img.dataset.initialHeight) * currentZoom;

        // 检查缩放后的尺寸是否超出预览区域
        const previewWidth = imagePreview.clientWidth;
        const previewHeight = imagePreview.clientHeight;

        if (scaledWidth > previewWidth || scaledHeight > previewHeight) {
            // 如果超出，调整缩放比例
            const widthRatio = previewWidth / parseFloat(img.dataset.initialWidth);
            const heightRatio = previewHeight / parseFloat(img.dataset.initialHeight);
            currentZoom = Math.min(widthRatio, heightRatio);
            zoomSlider.value = currentZoom * 100;
        }

        img.style.filter = `brightness(${brightnessValue}%) contrast(${contrastValue}%) saturate(${saturationValue}%)`;
        img.style.transform = `scale(${currentZoom}) scaleX(${isFlipped ? -1 : 1})`;
    }

    function adjustIconsLayout() {
        const previewWidth = imagePreview.clientWidth;
        if (previewWidth < 300) {
            editIcons.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            editIcons.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }

    downloadIcon.addEventListener('click', () => {
        const img = imagePreview.querySelector('img');
        if (img) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.filter = img.style.filter;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(isFlipped ? -1 : 1, 1);
            ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            if (frameStyle.value === 'simple') {
                const borderWidth = parseInt(frameWidth.value);
                ctx.strokeStyle = frameColor.value;
                ctx.lineWidth = borderWidth * 2;
                ctx.strokeRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            }

            const link = document.createElement('a');
            link.download = 'edited_image.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    });

    window.addEventListener('resize', adjustIconsLayout);
});