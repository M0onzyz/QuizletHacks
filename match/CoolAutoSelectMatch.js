(() => {
    // Inject the CSS for the window and button
    const style = document.createElement('style');
    style.innerHTML = `
        .speed-control-window {
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            background-color: #fff !important;
            border: 1px solid #ccc !important;
            padding: 15px !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
            font-family: sans-serif !important;
            z-index: 9999 !important;
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
        .speed-control-window button {
            padding: 8px 16px !important;
            background-color: #007bff !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            font-size: 1em !important;
        }
        .speed-control-window button:hover {
            background-color: #0056b3 !important;
        }
    `;
    document.head.appendChild(style);

    // Create the HTML for the control window with a button
    const controlWindow = document.createElement('div');
    controlWindow.className = 'speed-control-window';
    controlWindow.innerHTML = `
        <label for="speedSlider">Speed (ms):</label>
        <input type="range" id="speedSlider" min="300" max="2000" value="400">
        <span id="currentSpeed" class="speed-value">400</span>
        <button id="startButton">Start</button>
    `;
    document.body.appendChild(controlWindow);

    // Get references to the slider, value display, and button
    const speedSlider = document.getElementById('speedSlider');
    const currentSpeedSpan = document.getElementById('currentSpeed');
    const startButton = document.getElementById('startButton');

    // Update the displayed value when the slider changes
    speedSlider.addEventListener('input', () => {
        currentSpeedSpan.innerText = speedSlider.value;
    });

    const hack = () => {
        if (document.querySelectorAll('.FormattedText').length != 12) {
            return setTimeout(hack, 50);
        }

        let setData = JSON.parse(__NEXT_DATA__.props.pageProps.dehydratedReduxStateKey);
        let cards = setData.studyModesCommon.studiableData.studiableItems;

        let blacklist = [];
        let find = (ig) => [...document.querySelectorAll('.FormattedText')].find((i) => ig.startsWith(i.innerText.replace('…', '')));

        const colors = [
            '#FF007F', '#FFAA1D', '#FFF000', '#66FF00', '#08E8DE', '#1974D2'
        ];

        let colorIndex = 0;
        let delay = 0;

        const selectedSpeed = parseInt(speedSlider.value, 10);

        for (let i = 0; i < 12; i++) {
            let text = document.querySelectorAll('.FormattedText')[i].innerText;
            if (blacklist.includes(text)) continue;

            let needStartsWith = text.endsWith('…');

            let card = cards.find((card) => card.cardSides.some((side) => {
                if (needStartsWith) return side.media[0].plainText.startsWith(text.replace('…', ''))
                else return side.media[0].plainText == text
            }));
            
            if (!card) {
                console.log(`No matching card found for text: ${text}`);
                continue; 
            }

            let termSide = card.cardSides.find((side) => side.label == 'word');
            let definSide = card.cardSides.find((side) => side.label == 'definition');

            let term = termSide.media[0].plainText;
            let defin = definSide.media[0].plainText;

            let isTerm = term == text;
            let isDef = defin == text;

            const termElement = find(term);
            const definElement = find(defin);

            if (termElement) {
                termElement.style.border = `2px solid ${colors[colorIndex]}`;
                termElement.style.borderRadius = '15px';
            }
            if (definElement) {
                definElement.style.border = `2px solid ${colors[colorIndex]}`;
                definElement.style.borderRadius = '15px';
            }
            colorIndex++;

            setTimeout(() => {
                if (termElement) {
                    termElement.click();
                }
                setTimeout(() => {
                    if (definElement) {
                        definElement.click();
                    }
                }, 100);
            }, delay);

            delay += selectedSpeed;

            if (isTerm) blacklist.push(defin);
            else if (isDef) blacklist.push(term);
        }
    };

    // Add a click event listener to the start button
    startButton.addEventListener('click', () => {
        hack();
    });

})();
