function play( audio_path, time_in_milisec){
    let beep = new Audio(audio_path);
    beep.loop = true;
    beep.play();
    setTimeout(() => { beep.pause(); }, time_in_milisec);
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

document.getElementById('back').onclick = function () {
    console.log("clicked");
    location.href = "./index.html";
};

document.addEventListener('click', function (e) {
    play('./sounds/windhowl.wav', 5000);
})




