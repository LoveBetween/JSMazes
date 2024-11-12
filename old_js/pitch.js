var soundPlayer = new Audio();
soundPlayer.src = "C4.mp3";
soundPlayer.mozPreservesPitch = false;

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function bigfunc(){
    for(var i=1;i<5;i++){
        playNote(i);
        await delay(100);
    }
    
}

function playNote(pitch) {
    soundPlayer.playbackRate = pitch;
    soundPlayer.play();
}

bigfunc();


var fmax  = width*height + Math.max(start[0], width-start[0]) **2 
                        + Math.max(start[1], height-start[1]) **2;

function playNote(f, max_pitch){
    var pitch = (fmax-f)/fmax*max_pitch;
    soundPlayer.playbackRate = pitch;
    soundPlayer.play();
}