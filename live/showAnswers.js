(() => setInterval(() => {
    function findByKey(object, key, seen = new Set(), path = '') {
        if (seen.has(object)) return undefined;
        seen.add(object);

        for (let k of Object.keys(object)) {
            let newPath = path ? `${path}.${k}` : k;

            if (k === key) {
                return object[k];
            }

            if (object[k] && typeof object[k] === 'object') {
                let result = findByKey(object[k], key, seen, newPath);
                if (result !== undefined) return result;
            }
        }

        return undefined;
    }

    let currentQuestion = findByKey(document.querySelector('#__next > :nth-child(3) > div'), 'currentQuestion');
    if (!currentQuestion) return;

    let term = currentQuestion.cardSides[0].media[0].plainText;
    let def = currentQuestion.cardSides[1].media[0].plainText;

    let termElement = document.querySelector('.FormattedText.notranslate.lang-en');
    let defIs = termElement.innerText == term;

    let answerOpts = document.querySelector('div[data-testid="normalPrompt"]').parentElement.children[1];

    let answerCard = [...answerOpts.children].find((opt) => opt.children[0].innerText == def);
    let wrongCards = [...answerOpts.children].filter(a => a !== answerCard);

    if (wrongCards.length == 4) {
        answerCard = [...answerOpts.children].find((opt) => opt.children[0].innerText == term);
        wrongCards = [...answerOpts.children].filter(a => a !== answerCard);
    }

    if (answerCard) answerCard.style.color = 'lime';
    wrongCards.forEach((card) => card.style.color = 'red');
}, 100))();
