import { render } from "./Cards/create_card.js"
import { socket } from "../main.js"
import { render_gifts } from "./Cards/create_card_gift.js"
const menu = document.getElementById("Menu")
const menus = document.getElementById("right_menu")
const small = document.getElementById("ScrolSmall")
const exp = document.getElementById("ExpMenuShark")
exp.src = localStorage.skin
let MenuOpen = false;

window.OpenMenuSkins = () => {
    if (MenuOpen) {
        document.getElementById("ExpMenu").style.transform = "translate(-100%,-50%)"
        menu.style.transform = "translateX(100%)"
        MenuOpen = !MenuOpen;
    }
    else {
        document.getElementById("ExpMenu").style.transform = "translate(0%,-50%)"
        menu.style.transform = "translateX(0%)"
        MenuOpen = !MenuOpen
        small.innerHTML = `<img src="../imgs/icons/volna.png"/> EсoPoints: ${localStorage.score}`;
    }
}


window.openGifts = () => {
    document.getElementById("openone").classList.remove("hover")
    document.getElementById('menu_row_card').classList.add("off")
    setTimeout(() => document.getElementById('menu_row_card').classList.add("OFF"), 100)
    document.getElementById('menu_row_gifts').classList.add("on")
    document.getElementById("opentwo").classList.add("hover")
}

window.openAcs = () => {
    document.getElementById("opentwo").classList.remove("hover")
    setTimeout(() => document.getElementById('menu_row_card').classList.remove("OFF"), 140)
    document.getElementById('menu_row_gifts').classList.remove("on")
    document.getElementById('menu_row_card').classList.remove("off")
    document.getElementById("openone").classList.add("hover")
}
openAcs()
window.changeSkin = (skin) => {

    localStorage.skin = skin;
    socket.emit('ChangeSkin', localStorage.skin);
    exp.classList.add("anim1s")
    setTimeout(() => {
        exp.classList.remove("anim1s");
        exp.src = localStorage.skin
    }, 450);

}

window.buyskin = (skin) => {



    if (localStorage.score >= skin.match) {
        localStorage.score = Number(localStorage.score) - skin.match;
        let o = JSON.parse(localStorage.skins);

        o.push(skin.img)
        localStorage.skins = JSON.stringify(o);
        changeSkin(skin.img)
        render()

    }
    else {
        alert("В вас недостаньо EcoPoints")
    }

}