(() => {
    // Inject the CSS for the window and button
    const style = document.createElement('style');
    style.innerHTML = `
        .speed-control-window {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background-color: #fff !important;
            border: 1px solid #c9b161 !important;
            padding: 0 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 8px rgba(201, 177, 97, 0.4) !important;
            font-family: sans-serif !important;
            z-index: 9999 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            overflow: hidden !important;
        }
        .speed-control-window-title {
            background-color: #c9b161 !important;
            color: #fff !important;
            padding: 8px 15px !important;
            font-weight: bold !important;
            cursor: grab !important;
            user-select: none !important;
        }
        .speed-control-content {
            padding: 15px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
        }
        .speed-control-window label {
            font-weight: bold !important;
        }
        .speed-control-window input[type="range"] {
            width: 200px !important;
        }
        .speed-control-window .speed-value {
            font-family: monospace !important;
            font-size: 1.1em !important;
        }
        .toggle-button {
            padding: 8px 16px !important;
            background-color: #fff !important;
            color: #c9b161 !important;
            border: 1px solid #c9b161 !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 1em !important;
            transition: background-color 0.3s ease, color 0.3s ease !important;
        }
        .toggle-button.active {
            background-color: #a68b44 !important;
            color: white !important;
            border-color: #a68b44 !important;
        }
        .toggle-button:hover:not(.active) {
            background-color: #f9f9f9 !important;
        }
    `;
    document.head.appendChild(style);

    // Create the HTML for the control window with toggles and title
    const controlWindow = document.createElement('div');
    controlWindow.className = 'speed-control-window';
    controlWindow.innerHTML = `
        <div class="speed-control-window-title">Quizlet Match Hack</div>
        <div class="speed-control-content">
            <label for="speedSlider">Speed (ms):</label>
            <input type="range" id="speedSlider" min="300" max="2000" value="400">
            <span id="currentSpeed" class="speed-value">400</span>
            <button id="highlightToggle" class="toggle-button">Highlight Answers</button>
            <button id="autoSelectToggle" class="toggle-button">Auto Select Answers</button>
        </div>
    `;
    document.body.appendChild(controlWindow);

    // Make the window draggable
    const titleBar = controlWindow.querySelector('.speed-control-window-title');
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - controlWindow.offsetLeft;
        offsetY = e.clientY - controlWindow.offsetTop;
        titleBar.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        controlWindow.style.left = `${newX}px`;
        controlWindow.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        titleBar.style.cursor = 'grab';
    });

    // Get references to elements
    const speedSlider = document.getElementById('speedSlider');
    const currentSpeedSpan = document.getElementById('currentSpeed');
    const highlightToggleButton = document.getElementById('highlightToggle');
    const autoSelectToggleButton = document.getElementById('autoSelectToggle');

    // State variables
    let highlightEnabled = false;
    let autoSelectEnabled = false;
    let highlightIntervalId = null;
    let autoSelectIntervalId = null;

    // Update the displayed value when the slider changes
    speedSlider.addEventListener('input', () => {
        currentSpeedSpan.innerText = speedSlider.value;
    });

    // Toggle highlight functionality
    highlightToggleButton.addEventListener('click', () => {
        highlightEnabled = !highlightEnabled;
        highlightToggleButton.classList.toggle('active', highlightEnabled);

        if (highlightEnabled) {
            hack(true);
            highlightIntervalId = setInterval(() => hack(true), 1000);
        } else {
            clearInterval(highlightIntervalId);
            highlightIntervalId = null;
            document.querySelectorAll('.FormattedText').forEach(el => {
                el.style.border = '';
                el.style.borderRadius = '';
            });
        }
    });

    // Toggle auto-select functionality
    autoSelectToggleButton.addEventListener('click', () => {
        autoSelectEnabled = !autoSelectEnabled;
        autoSelectToggleButton.classList.toggle('active', autoSelectEnabled);
        
        clearInterval(highlightIntervalId);
        clearInterval(autoSelectIntervalId);
        highlightIntervalId = null;
        autoSelectIntervalId = null;

        if (autoSelectEnabled) {
            autoSelectIntervalId = setInterval(() => {
                hack(false);
            }, parseInt(speedSlider.value, 10));
        } else if (highlightEnabled) {
            highlightIntervalId = setInterval(() => hack(true), 1000);
        }
    });

    const hack = (isHighlightOnly = false) => {
        const textElements = document.querySelectorAll('.FormattedText');
        if (textElements.length !== 12) {
            return;
        }

        let setData;
        try {
            setData = JSON.parse(__NEXT_DATA__.props.pageProps.dehydratedReduxStateKey);
        } catch (e) {
            console.error("Failed to parse data. Quizlet may have updated.", e);
            return;
        }
        
        let cards = setData.studyModesCommon.studiableData.studiableItems;
        let blacklist = [];
        let find = (ig) => [...textElements].find((i) => ig.startsWith(i.innerText.replace('…', '')) || ig === i.innerText);
        const colors = ['#FF007F', '#FFAA1D', '#FFF000', '#66FF00', '#08E8DE', '#1974D2'];
        let colorIndex = 0;
        let delay = 0;
        const selectedSpeed = parseInt(speedSlider.value, 10);

        for (let i = 0; i < textElements.length; i++) {
            let text = textElements[i].innerText;
            if (blacklist.includes(text)) continue;

            let needStartsWith = text.endsWith('…');
            let card = cards.find((card) => card.cardSides.some((side) => {
                if (needStartsWith) return side.media[0].plainText.startsWith(text.replace('…', ''))
                else return side.media[0].plainText === text
            }));
            
            if (!card) continue;

            let termSide = card.cardSides.find((side) => side.label === 'word');
            let definSide = card.cardSides.find((side) => (side.label === 'definition' || side.label === 'example'));
            
            if (!termSide || !definSide) continue;

            let term = termSide.media[0].plainText;
            let defin = definSide.media[0].plainText;
            
            const termElement = find(term);
            const definElement = find(defin);
            
            if (!termElement || !definElement) continue;

            if (isHighlightOnly) {
                termElement.style.border = `2px solid ${colors[colorIndex]}`;
                termElement.style.borderRadius = '15px';
                definElement.style.border = `2px solid ${colors[colorIndex]}`;
                definElement.style.borderRadius = '15px';
                // Only increment the color index after a complete pair is found and styled
                colorIndex = (colorIndex + 1) % colors.length;
                blacklist.push(term, defin);
            } else if (autoSelectEnabled) {
                if (!blacklist.includes(term) && !blacklist.includes(defin)) {
                    setTimeout(() => {
                        termElement.click();
                        setTimeout(() => {
                            definElement.click();
                        }, 100);
                    }, delay);
                    delay += selectedSpeed;
                    blacklist.push(term, defin);
                }
            }
        }
    };
})();
