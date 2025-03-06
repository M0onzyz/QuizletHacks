(() => {
    let setData = JSON.parse(__NEXT_DATA__.props.pageProps.dehydratedReduxStateKey);
    let cards = setData.studyModesCommon.studiableData.studiableItems;

    document.body.insertAdjacentHTML('beforeend', `<style>label[class="AssemblyInput"]::placeholder { opacity: 0.5 }`);

    setInterval(() => {
        let term = document.querySelector('p').innerText;
        let card = cards.find((card) => card.cardSides.some((side) => side.media[0].plainText == term));
        let otherSide = card.cardSides.find((side) => side.media[0].plainText !== term);

        document.querySelector('label[class="AssemblyInput"]').children[0].placeholder = 'answer: ' + otherSide.media[0].plainText;
    }, 100);
})();
