const small = document.getElementById("ScrolSmall")


const cards = [
    {
        img: "../imgs/akula_new.png",
        buttonText: "Equip",
        match: 500
    },
    {
        img: "../imgs/Skins/time.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/akula_nohsnki.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/akula_nohsnki_shapka.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/crismas.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/monokl.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/paznik.png",
        buttonText: "Buy",
        match: 500
    },
    {
        img: "../imgs/Skins/plach.png",
        buttonText: "Buy",
        match: 500
    }
];



export const render = () => {
    small.innerHTML = `<img src="../imgs/icons/volna.png"/> EсoPoints: ${localStorage.score}`;

    const htmlMarkup = cards.map((item) => {
        let butt = (JSON.parse(localStorage.skins).includes(item.img) && "Equip") || `${item.match} 🌊`


        return `
            <div class="card">
                    <div class="cardHead">
                        <img src="${item.img}" alt="ico" />
                    </div>
                    <button onclick='${(butt === "Equip" && `changeSkin("${item.img}")`) || `buyskin(${JSON.stringify(item)})`}'>${butt}</button>
            </div>

        `;
    }).join('');

    document.getElementById('menu_row_card').innerHTML = htmlMarkup;
}

render()