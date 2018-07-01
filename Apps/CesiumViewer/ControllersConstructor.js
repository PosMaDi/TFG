////////////////////////////////////////////////////
var rightController = new gamepadAPI('right');
var leftController = new gamepadAPI('left');


function gamepadAPI(hand) {
    this.controller = {};

    if (hand == 'right'){
        this.buttons = ['joystick', 'trigger', 'grip', 'A', 'B', 'surface'];
    } else {
        this.buttons = ['joystick', 'trigger', 'grip', 'X', 'Y', 'surface'];
    }

    this.buttonsCache = [];

    this.buttonsStatus = [];

    this.axesStatus = [];

    this.connect = function(e) {
        this.controller = e.gamepad;
        console.log(this.controller.hand + ' controller found.')
    }

    this.disconnect = function(e) {
        delete this.controller;
        console.log(this.controller.hand + ' controller disconnected.')
    }

   this.update  = function() {
        this.buttonsCache = [];
        for(var j = 0; j < this.buttonsStatus.length; j++){
            this.buttonsCache[j] = this.buttonsStatus[j];
        }

        this.buttonsStatus = [];

        var c = this.controller;

        var pressed = [];
        if(c.buttons) {
            for(var k=0; k < c.buttons.length; k++){
                if(c.buttons[k].pressed){
                    pressed.push(this.buttons[k]);
                }
            }
        }

        var axes = [];
        if (c.axes){
            for(var l = 0; l < c.axes.lenght; l++) {
                axes.push(c.axes[l]);
            }
        }
        this.buttonsStatus = pressed;
        this.axesStatus = axes;


        return pressed;
    }

    this.buttonPressed = function (button, hold) {
        var newPress = false;
        for (var j = 0; j < this.buttonsStatus.length; j++) {
            if(this.buttonsStatus[j] == button) {
                newPress = true;
                if (!hold){
                    for (var k = 0; k < this.buttonsCache.length; k++) {
                        if (this.buttonsCache[k] == button) {
                            newPress = false;
                        }
                    }
                }
            }
        }
        return newPress;
    }

    this.buttonValue = function (button) {
        var i = this.buttons.indexOf(button);
        var c = this.controller;

        var value = c.buttons[i].value;
        if (value > 0.05){
            return value;
        }
    }

    this.roll = function () {
        var pose = this.controller.pose;
        return pose.orientation[2];

    }

    this.pitch = function () {
        var pose = this.controller.pose;
        return pose.orientation[0];

    }

    this.yaw = function () {
        var pose = this.controller.pose;
        return pose.orientation[1];

    }
};
//////////////////////////////////////////////////////////////////////


if(navigator.getVRDisplays && navigator.getGamepads) {
    console.log('WebVR API and Gamepad API supported.');
    reportDisplays();
} else {
    console.log('WebVR API and/or Gamepad API not supported by this browser.');
}

function reportDisplays() {
    navigator.getVRDisplays().then(function(displays) {
        console.log('VR Display Name: ' + displays[0].displayName);
    });
}


window.addEventListener('gamepadconnected', function(e) {
    console.log('Controller found.');
    if (e.gamepad.hand == 'right'){
        console.log('Connecting Right Controller.');
        rightController.connect(e);
    } else {
        console.log('Connecting Left Controller.');
        leftController.connect(e);
    }
});

window.addEventListener('gamepaddisconnected', function(e){
    console.log('Controller lost.');
    if (e.gamepad.hand == 'right'){
        rightController.disconnect(e);
    } else {
        leftController.disconnect(e);
    }
});


function test() {
    rightController.update();
    leftController.update();
    if (leftController.buttonPressed('X')){
        console.log('X');
    }
    if (leftController.buttonPressed('Y', 'hold')){
        console.log('Holding Y');
    }
    if (rightController.buttonPressed('A')){
        console.log('A');
    }
    if (leftController.buttonPressed('grip')){
        console.log('left grip');
    }
    if (rightController.buttonPressed('joystick')){
        console.log('right joystick');
    }

    if (rightController.buttonValue('grip') != undefined) {
        console.log(rightController.buttonValue('grip'));
    }

    console.log('x: ' + rightController.roll().toFixed(2) + '; y: ' + rightController.pitch().toFixed(2) + '; z: ' + rightController.yaw().toFixed(2));
    setTimeout(test, 10);
}

setTimeout(test, 5000);
