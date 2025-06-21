const small = document.getElementById("ScrolSmall")


const cards = [
    {
        img: "../imgs/RealItems/brelok.png",
        buttonText: "Buy",
        match: 500,
        text: "Падаруначек"
    }
];

window.re = (item) => {
    console.log(item)
    document.location.href = '/qr';
    let o = JSON.parse(localStorage.gifts);
    o.push(item);
    localStorage.gifts = JSON.stringify(o);
}

export const render_gifts = () => {

    const htmlMarkup = cards.map((item) => {
        let butt = (JSON.parse(localStorage.gifts).includes(item.img) && "Available") || `${item.match} 🌊`

        return `
            <div class="card">
                    <div class="cardHead gift">
                        <img src="${item.img}"  alt="ico" />
                    </div>
       
                    <button onclick='re("${item.img}")'>${butt}</button>
            </div>

        `;
    }).join('');

    document.getElementById('menu_row_gifts').innerHTML = htmlMarkup;
}

render_gifts()