
// A list of the last taps
var taps = []; 
var rolling_average = document.getElementById("rolling-average-selector").value;
var reset_time = document.getElementById("auto-reset-time-selector").value * 1000; // Milliseconds
var timeout_id = null;


function toggle_menu() {
    console.log("Toggling menu.");
    let menu_element = document.getElementById('menu');
    let close_button = document.getElementById('close_button');
    // Show the menu overlay
    menu_element.classList.toggle('fade_out');
    menu_element.classList.toggle('fade_in');
    
    // Show the close button
    close_button.classList.toggle('fade_out');
    close_button.classList.toggle('fade_in');

}

function avg_diff(list) {
    let diff = list.map((element, index) => list[index+1]-element);
    diff.pop();
    const sum_reducer = (prev, curr) => prev + curr;
    let sum = diff.reduce(sum_reducer);
    // console.log(diff.length);
    return sum / diff.length;
}

function reset_time_reached() {
    // We grey out the 
    console.log("Timeout reached.");
    document.getElementById("counter").classList.add("counter-timeout-fadeout");
    taps = [];
    reset(true);
}

function reset(keep_previous_bpm = false) {
    clearTimeout(timeout_id);
    taps = [];
    let counter = document.getElementById("counter");
    let counter_msg = document.getElementById("counter-message");
    if (!keep_previous_bpm) {
        counter.style.visibility = "hidden";
        counter_msg.style.visibility = "visible";
    }
}

function compute_bpm(timestamp = Date.now()) {
    clearTimeout(timeout_id);
    timeout_id = setTimeout(reset_time_reached, reset_time);

    taps.push(timestamp);
    if (taps.length > rolling_average) {
        taps.shift(); 
    } else if (taps.length <= 1) {
        document.getElementById("counter").classList.remove("counter-timeout-fadeout");
        // No need to try and calculated the BPM with only one value.
        return
    }

    let current_bpm = avg_diff(taps); 
    current_bpm = 60000 / current_bpm;

    // Update the GUI
    document.getElementById("counter-message").style.visibility = "hidden";
    let counter = document.getElementById("counter");
    counter.style.visibility = "visible";
    counter.innerHTML = current_bpm.toFixed(1);
}

/* Event listeners */ 

// I want the tooltip to follow the mouse,
// but initial tests were laggy. I need to figure out a better way.
// var tooltiptexts = document.getElementsByClassName("tooltiptext");
// window.onmousemove = function (e) {
//     if (e.target.className != 'tooltip') {
//         return
//     }
//     var x = e.clientX,
//         y = e.clientY;
//     // console.log(`${x} ${y}`)
    
//     for (let item of tooltiptexts) {
//         // console.log(item.id);
//         item.style.top = y + 'px';
//         item.style.left = x + 'px';
//     }
    
// }

document.addEventListener('mousedown', function (e) {
    /* Disable double tap to select */
    if (e.detail > 1) {
      e.preventDefault();
    }
  }, false);

document.addEventListener('keydown', function (e) {
    if (e.code == 'Space') {
        document.getElementById("counter").classList.add("counter-animated-taps");
        document.getElementById("counter-message").classList.add("counter-animated-taps");
        compute_bpm();
    } else if (e.code == 'KeyR') {
        reset(false);
    }
});


document.getElementById("reset-button").onclick = function(){
    console.log("Resetting");
    reset(false);
};

document.getElementById("container").onclick = function tap(e) {
    // console.log(`Position: (${e.clientX}, ${e.clientY})`);
    document.getElementById("counter").classList.add("counter-animated-taps");
    document.getElementById("counter-message").classList.add("counter-animated-taps");
    var selection = window.getSelection();
    if(selection.toString().length === 0) {
        /* Only run when the user is not selecting text */
        /* If the user selectes the counter text multiple times in 
        a short duration, the compute_bpm() function would remove the text */
        compute_bpm();
    }
}

document.getElementById("counter").onanimationend = function () {
    document.getElementById("counter").classList.remove("counter-animated-taps");
}
document.getElementById("counter-message").onanimationend = function () {
    document.getElementById("counter-message").classList.remove("counter-animated-taps");
}

document.getElementById("rolling-average-selector").oninput = function() {
    console.log("Rolling average number changed")
    if (this.value == 0) {
        rolling_average = Infinity;
    } else {
        rolling_average = this.value;
    }
    
};
document.getElementById("auto-reset-time-selector").oninput = function() {
    console.log("Reset time changed.")
    reset_time = this.value * 1000; 
};

