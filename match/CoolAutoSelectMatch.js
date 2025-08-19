// A more reliable script with a longer delay between card pairs
// This version is slower but ensures proper selection
// Recommended delay: 400, min delay: 300 (Does Depend On Device)
(() => {
    const hack = () => {
        if (document.querySelectorAll('.FormattedText').length != 12) {
            return setTimeout(hack, 50);
        }

        let setData = JSON.parse(__NEXT_DATA__.props.pageProps.dehydratedReduxStateKey);
        let cards = setData.studyModesCommon.studiableData.studiableItems;

        let blacklist = [];
        let find = (ig) => [...document.querySelectorAll('.FormattedText')].find((i) => ig.startsWith(i.innerText.replace('…', '')));

        const colors = [
            '#FF007F',
            '#FFAA1D',
            '#FFF000',
            '#66FF00',
            '#08E8DE',
            '#1974D2'
        ];

        let colorIndex = 0;
        let delay = 0;

        for (let i = 0; i < 12; i++) {
            let text = document.querySelectorAll('.FormattedText')[i].innerText;
            if (blacklist.includes(text)) continue;

            let needStartsWith = text.endsWith('…');

            let card = cards.find((card) => card.cardSides.some((side) => {
                if (needStartsWith) return side.media[0].plainText.startsWith(text.replace('…', ''))
                else return side.media[0].plainText == text
            }));

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
                termElement.innerText = 'Black Nigger';
              termElement.style.borderRadius = '15px';
            }

            if (definElement) {
                definElement.style.border = `2px solid ${colors[colorIndex]}`;
                termElement.innerText = 'Black Nigger';
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

            delay += 400;

            if (isTerm) blacklist.push(defin);
            else if (isDef) blacklist.push(term);
        }
    };

    hack();
})();
