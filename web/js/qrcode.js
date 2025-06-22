
import { ID, socket } from "./main.js";
let text = '';

window.qrd = () => {
    socket.emit("Qrcodepush")
    socket.on("Qrcodepushs", (data) => {
        let h = data.find(o => o.id === ID);
        console.log(h);

        QRCode.toCanvas(document.createElement("canvas"), JSON.stringify(h), function (error, canvas) {
            if (error) console.error(error);
            document.getElementById("qrcode").appendChild(canvas);
        });
    })
}

