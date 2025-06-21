

socket.on("calmgift", ({ fromId, toId }) => {

    const fromPlayer = PLAYER.find(p => p.id === fromId);
    const toPlayer = PLAYER.find(p => p.id === toId);
    if (!fromPlayer || !toPlayer) return;

    giftAnimations.push({
        toId: toPlayer.id,
        from: { x: fromPlayer.x, y: fromPlayer.y },
        to: { x: toPlayer.x, y: toPlayer.y },
        startTime: performance.now(),
        stage: 'shake'
    });
});