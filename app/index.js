import clock from "clock";
import document from "document";
import { me as device } from "device";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { battery } from "power";
import { me } from "appbit";
import * as fs from "fs";
import * as messaging from "messaging";

let displayIndex = 0;
var minutes;
var heartRate;
var displayValues = [
  () =>{return`${minutes}`;}, //time
  () =>{return `${heartRate}\nbpm`;}, // hr
  () =>{return `${((today.local.steps || 0)/1000).toPrecision(2)}k`;}, //steps
  () =>{return `${Math.floor(battery.chargeLevel)}%`;} //battery
]

var delay;
// Update the clock every minute
clock.granularity = "minutes";

//percetange values for the screen width and height
const shp = device.screen.height/100;
const swp = device.screen.width/100;

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");
const squares = document.getElementsByTagName("use");

let hrm = new HeartRateSensor();

const SETTINGS_TYPE = "cbor";
const SETTINGS_FILE = "settings.cbor";

let settings = loadSettings();
applyTheme(settings.background, settings.foreground);

// Apply theme colors to elements
function applyTheme(background, foreground) {
  console.log("settings log",background, foreground);
  let items = document.getElementsByClassName("background");
  items.forEach(function(item) {
    item.style.fill = background;
  });
  let items = document.getElementsByClassName("r");;
  items.forEach(function(item) {
    item.style.fill = foreground;
  });
  settings.background = background;
  settings.foreground = foreground;
}

messaging.peerSocket.onmessage = evt => {
  console.log("settings changed")
  applyTheme(evt.data.background, evt.data.foreground);
}

// Register for the unload event
me.onunload = saveSettings;

function loadSettings() {
  try {
    return fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    // Defaults
    console.log("setting defaults", ex);
    return {
      background: "#000000",
      foreground: "#0000FF"
    }
  }
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, settings, SETTINGS_TYPE);
}

const setVisible = (hour, squares) => {
  squares.forEach( (square, i) => {
    square.style.visibility = i + 1 === hour ? 'hidden': ''
  })
}

function updateOutput(e) {
  hrm.start();
  clearTimeout(delay);
  myLabel.text =  displayValues[displayIndex]();
  delay = setTimeout(resetIndex, 10000);
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
  
  // //this formuala comes from the lyout of squares in index.gui. it should center the 
  myLabel.x = (swp * 5 * xMod) + (swp * 10 * xMod) + (swp *10 * (xMod -1)) -(5 * swp);
  myLabel.y = (shp *5 * yMod) + (shp * 10 * yMod) + (shp * 10 * (yMod -1)) -(30 * shp);


  myLabel.text = displayValues[displayIndex]();
}