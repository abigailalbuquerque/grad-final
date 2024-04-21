function play( audio_path, time_in_milisec){
    let beep = new Audio(audio_path);
    beep.loop = true;
    beep.play();
    setTimeout(() => { beep.pause(); }, time_in_milisec);
  }

  //used to be a workaround? Doesn't work
function play2(path){
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createBufferSource();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'audio-autoplay.wav');
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('load', function (r) {
            audioCtx.decodeAudioData(
                    xhr.response, 
                    function (buffer) {
                        source.buffer = buffer;
                        source.connect(audioCtx.destination);
                        source.loop = false;
                    });
            source.start(0);
        });
        xhr.send();
}
  

window.onload = () => {
    console.log("new page load")
    const transition_el = document.querySelector('.transition');
    transition_el.classList.remove('is-active');
    setTimeout(() => {
        console.log("remove")
        transition_el.classList.remove('is-active');
        //play2('./sounds/windhowl.wav');//doesn't allow playing it onload
    }, 500);
    
}

document.addEventListener('click', function (e) {
    play('./sounds/windhowl.wav', 5000);
})


