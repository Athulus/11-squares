import clock from "clock";
import document from "document";
import { me as device } from "device";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { battery } from "power";

let displayIndex = 0;
var minutes;
var heartRate;
var displayValues = [
  () =>{return`${minutes}`;}, //time
  () =>{return `${heartRate}bpm`;}, // hr
  () =>{return `${((today.local.steps || 0)/1000).toPrecision(2)}k`;}, //steps
  () =>{return `${Math.floor(battery.chargeLevel)}%`;} //battery
]

// Update the clock every minute
clock.granularity = "minutes";

//percetange values for the screen width and height
const shp = device.screen.height/100;
const swp = device.screen.width/100;

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");
const squares = document.getElementsByTagName("use");

let hrm = new HeartRateSensor();
  
const setVisible = (hour, squares) => {
  squares.forEach( (square, i) => {
    square.style.visibility = i + 1 === hour ? 'hidden': ''
  })
}

function updateOutput(e) {
  hrm.start();
  myLabel.text =  displayValues[displayIndex]();
  setTimeout(resetIndex, 10000);
}

function resetIndex(){
  displayIndex = 0;
  updateOutput();
}

hrm.onreading = function() {

  // Peek the current sensor values
  heartRate = hrm.heartRate;
  // Stop monitoring the sensor
  hrm.stop();
}

myLabel.onclick = function (e) {
  displayIndex++;
  if(displayIndex > 3){
    displayIndex = 0;
  }
  updateOutput(e);
}

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let date = evt.date;
  let hours = date.getHours();
  hrm.start();
  hours = hours % 12 || 12;
  minutes = util.zeroPad(date.getMinutes());
  
  setVisible(hours, squares);
  
  let yMod = Math.ceil(hours/3);
  let xMod = (hours%3 || 3);
  
  //this formuala comes from the lyout of squares in index.gui. it should center the 
  myLabel.x = (swp * 5) + (swp * 5 * xMod) + (swp * 10 * xMod) + (swp *10 * (xMod -1));
  myLabel.y = (shp *5 * yMod) + (shp * 10 * yMod) + (shp * 10 * (yMod -1)) + (shp * 5);

  myLabel.text = displayValues[displayIndex]();
}