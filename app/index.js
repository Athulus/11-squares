import clock from "clock";
import document from "document";
import { me as device } from "device";
import { preferences } from "user-settings";
import * as util from "../common/utils";

// Update the clock every minute
clock.granularity = "minutes";

//percetange values for the screen width and height
const shp = device.screen.height/100;
const swp = device.screen.width/100;

// Get a handle on the <text> element
const myLabel = document.getElementById("myLabel");

const squares = document.getElementsByTypeName("rect");


// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  hours = hours % 12 || 12;
  let mins = util.zeroPad(today.getMinutes());
  console.log(hours.toString());
  
  let square = document.getElementById(hours.toString());
  square.style.visibility = "hidden";
  
  let yMod = Math.ceil(hours/3);
  let xMod = hours%3;
  if(xMod === 0){
    xMod = 3;
  }
  
  //this formuala comes from the lyout of squares in index.gui. it should center the 
  myLabel.x = (swp * 5) + (swp * 5 * xMod) + (swp * 10 * xMod) + (swp *10 * (xMod -1));
  myLabel.y = (shp *5 * yMod) + (shp * 10 * yMod) + (shp * 10 * (yMod -1)) + (shp * 5);

  myLabel.text = `${mins}`;
}
