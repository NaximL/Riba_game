import { ID, socket } from "../../main.js";

const small = document.getElementById("ScrolSmall")


const cards = [
    {
        img: "../imgs/RealItems/brelok.png",
        buttonText: "Buy",
        match: 500,
        text: "Брелок"
    }
];

window.re = (img,des) => {
    
    socket.emit("NewQrCode", {
        nick: localStorage.nick,
        id:ID,
        des:des
    })
    document.getElementById("qr").style.display = 'flex'
    document.getElementById("maingmae").style.display = 'none'
    qrd()
}

export const render_gifts = () => {

    const htmlMarkup = cards.map((item) => {
        let butt = (JSON.parse(localStorage.gifts).includes(item.img) && "Available") || `${item.match} 🌊`

        return `
            <div class="card">
                    <div class="cardHead gift">
                        <img src="${item.img}"  alt="ico" />
                    </div>
       
                    <button onclick='re("${item.img}","${item.text}")'>${butt}</button>
            </div>

        `;
    }).join('');

    document.getElementById('menu_row_gifts').innerHTML = htmlMarkup;
}

render_gifts()