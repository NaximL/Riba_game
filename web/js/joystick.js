import { isDesktop } from "./help.js";
import { socket } from "./main.js";

const joystick = document.getElementById("joystick");
const jctx = joystick.getContext("2d");

const radius = 60;
let knob = { x: 75, y: 75, active: false };
let joystickDirection = { up: false, down: false, left: false, right: false };

function drawJoystick() {
    jctx.clearRect(0, 0, joystick.width, joystick.height);

    jctx.globalAlpha = 0.5
    jctx.beginPath();
    jctx.arc(75, 75, radius, 0, Math.PI * 2);
    jctx.fillStyle = "#444";
    jctx.fill();

    jctx.globalAlpha = 1
    jctx.beginPath();
    jctx.arc(knob.x, knob.y, 20, 0, Math.PI * 2);
    jctx.fillStyle = "#999";
    jctx.fill();
}
if (!isDesktop()) drawJoystick();

function getVector(x, y) {
    const dx = x - 75;
    const dy = y - 75;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const max = radius;

    if (dist > max) {
        const angle = Math.atan2(dy, dx);
        x = 75 + Math.cos(angle) * max;
        y = 75 + Math.sin(angle) * max;
    }

    knob.x = x;
    knob.y = y;
    if (!isDesktop()) drawJoystick();

    const normX = (x - 75) / max;
    const normY = (y - 75) / max;
    return { x: normX, y: normY };
}

function resetJoystick() {
    knob.x = 75;
    knob.y = 75;
    if (!isDesktop()) drawJoystick();
    return { x: 0, y: 0 };
}

function updateJoystickDirection(vec) {
    joystickDirection = {
        left: vec.x <= -0.5,
        right: vec.x >= 0.5,
        up: vec.y <= -0.5,
        down: vec.y >= 0.5,
    };
}


setInterval(() => {
    if (joystickDirection.up) socket.emit('move', 'up');
    if (joystickDirection.down) socket.emit('move', 'down');
    if (joystickDirection.left) socket.emit('move', 'left');
    if (joystickDirection.right) socket.emit('move', 'right');
}, 29);


function handleInput(x, y) {
    const vec = getVector(x, y);
    updateJoystickDirection(vec);
}

joystick.addEventListener("mousedown", e => {
    knob.active = true;
    const rect = joystick.getBoundingClientRect();
    handleInput(e.clientX - rect.left, e.clientY - rect.top);
});
window.addEventListener("mousemove", e => {
    if (!knob.active) return;
    const rect = joystick.getBoundingClientRect();
    handleInput(e.clientX - rect.left, e.clientY - rect.top);
});
window.addEventListener("mouseup", () => {
    knob.active = false;
    updateJoystickDirection(resetJoystick());
});


["touchstart", "touchmove"].forEach(eventName => {
    joystick.addEventListener(eventName, e => {
        e.preventDefault();
        if (!knob.active && eventName === "touchmove") return;
        knob.active = true;
        const rect = joystick.getBoundingClientRect();
        const touch = e.touches[0];
        handleInput(touch.clientX - rect.left, touch.clientY - rect.top);
    });
});
joystick.addEventListener("touchend", () => {
    knob.active = false;
    updateJoystickDirection(resetJoystick());
});