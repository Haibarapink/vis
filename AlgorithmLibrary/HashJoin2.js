// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco



function HashJoin(am, w, h) {
    this.init(am, w, h);
}

HashJoin.prototype = new Algorithm();
HashJoin.prototype.constructor = HashJoin;
HashJoin.superclass = Algorithm.prototype;


HashJoin.ELEMENT_WIDTH = 30;
HashJoin.ELEMENT_HEIGHT = 30;

HashJoin.TABLE_R_X = 30;
HashJoin.TABLE_R_Y = 30;
HashJoin.HASH_TABLE_X = 230;
HashJoin.HASH_TABLE_Y = 30;
HashJoin.TABLE_S_X = 330;
HashJoin.TABLE_S_Y = 30;

// unused
HashJoin.INSERT_X = 30;
HashJoin.INSERT_Y = 30;
HashJoin.STARTING_X = 300;
HashJoin.STARTING_Y = 100;

HashJoin.FOREGROUND_COLOR = "#000055"
HashJoin.BACKGROUND_COLOR = "#AAAAFF"
HashJoin.RED = "#FF0000"
HashJoin.WHITE = "#FFFFFF"

let R_Table = {
    1: { id: 1, name: "Alice" },
    2: { id: 2, name: "Bob" },
    3: { id: 3, name: "Charlie" },
    4: { id: 4, name: "Diana" }
};

let S_Table = {
    1: { id: 1, value: 100, cdate: "2024-01-01" },
    2: { id: 1, value: 200, cdate: "2024-01-02" },
    3: { id: 2, value: 150, cdate: "2024-02-01" },
    4: { id: 3, value: 300, cdate: "2024-03-01" },
    5: { id: 4, value: 250, cdate: "2024-04-01" },
    6: { id: 2, value: 180, cdate: "2024-02-15" }
};

let R_Table_Starting_ID = 10000;
let S_Table_Starting_ID = 5000;
let Box_Staring_ID = 0;

let Get_R_OBJ_ID = function (idx) {
    return idx + R_Table_Starting_ID;
}

let Get_S_OBJ_ID = function (idx) {
    return idx + S_Table_Starting_ID;
}

HashJoin.prototype.makeRectangle = function(x, y, msg, id, withColor) {
    this.cmd("CreateRectangle", id, 
        msg, 
            HashJoin.ELEMENT_WIDTH,
            HashJoin.ELEMENT_HEIGHT,
            x, 
            y);
        if (withColor) {
            this.cmd("SetForegroundColor", id, HashJoin.FOREGROUND_COLOR);
            this.cmd("SetBackgroundColor", id, HashJoin.BACKGROUND_COLOR);
        }
}


HashJoin.prototype.init = function (am, w, h) {
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    HashJoin.superclass.init.call(this, am, w, h);
    this.commands = [];
    this.cmd("CreateRectangle", 0, "asd", 30, 30, 30, 30);
    
    this.addControls();  
    this.setup();
    

    // Useful for memory management
    this.nextIndex = 0;

    this.stackID = [];
    this.stackValues = [];

    this.stackTop = 0;
}

HashJoin.prototype.addControls = function () {
    this.controls = [];
    // 判断hashtable是否构建完毕
    this.hashtable_ok = false;

    this.buildHashTable = addControlToAlgorithmBar("Button", "Build HashTable");
    // TODO bind build hashtable callback
    this.probeHashTable = addControlToAlgorithmBar("Button", "Join");
    // TODO bind probe hashtable callback


    this.pushField = addControlToAlgorithmBar("Text", "");
    this.pushField.onkeydown = this.returnSubmit(this.pushField,
        this.pushCallback.bind(this), // callback to make when return is pressed
        4,                           // integer, max number of characters allowed in field
        false);                      // boolean, true of only digits can be entered.
    this.controls.push(this.pushField);

    this.pushButton = addControlToAlgorithmBar("Button", "Push");
    this.pushButton.onclick = this.pushCallback.bind(this);
    this.controls.push(this.pushButton);

    this.popButton = addControlToAlgorithmBar("Button", "Pop");
    this.popButton.onclick = this.popCallback.bind(this);
    this.controls.push(this.popButton);
}



HashJoin.prototype.drawRow = function (row, starting_x, starting_y, with_color, starting_id) {
    for (let i = 0; i < row.length; ++i) {
        this.makeRectangle(starting_x + HashJoin.ELEMENT_WIDTH, starting_y, row[i], i + starting_id, with_color);
    }
}

HashJoin.prototype.setup = function () {
    this.commands = []
    // 构造R表
    let r_col_info = ["id", "name"];
    this.drawRow(r_col_info, HashJoin.TABLE_R_X, HashJoin.TABLE_R_Y, true, HashJoin.Box_Staring_ID);
    HashJoin.Box_Staring_ID += r_col_info.length;
    // 构造Hashtable
    // 构造S表
    return this.commands;
}

HashJoin.prototype.reset = function () {
    // Reset the (very simple) memory manager.
    //  NOTE:  If we had added a number of objects to the scene *before* any user
    //         input, then we would want to set this to the appropriate value based
    //         on objects added to the scene before the first user input
    this.nextIndex = 0;

    // Reset our data structure.  (Simple in this case)
    this.stackTop = 0;
}


HashJoin.prototype.pushCallback = function () {
    var pushedValue = this.pushField.value;

    if (pushedValue != "") {
        this.pushField.value = "";
        this.implementAction(this.push.bind(this), pushedValue);
    }

}

HashJoin.prototype.popCallback = function () {
    this.implementAction(this.pop.bind(this), "");
}


HashJoin.prototype.push = function (pushedValue) {
    this.commands = [];

    this.stackID[this.stackTop] = this.nextIndex++;

    this.cmd("CreateRectangle", this.stackID[this.stackTop],
        pushedValue,
        HashJoin.ELEMENT_WIDTH,
        HashJoin.ELEMENT_HEIGHT,
        HashJoin.INSERT_X,
        HashJoin.INSERT_Y);
    this.cmd("SetForegroundColor", this.stackID[this.stackTop], HashJoin.FOREGROUND_COLOR);
    this.cmd("SetBackgroundColor", this.stackID[this.stackTop], HashJoin.BACKGROUND_COLOR);
    this.cmd("Step");
    var nextXPos = HashJoin.STARTING_X + this.stackTop * HashJoin.ELEMENT_WIDTH;
    var nextYPos = HashJoin.STARTING_Y;
    this.cmd("Move", this.stackID[this.stackTop], nextXPos, nextYPos);
    this.cmd("Step"); // Not necessary, but not harmful either
    this.stackTop++;
    return this.commands;
}

HashJoin.prototype.pop = function (unused) {
    this.commands = [];

    if (this.stackTop > 0) {
        this.stackTop--;

        this.cmd("Move", this.stackID[this.stackTop], HashJoin.INSERT_X, HashJoin.INSERT_Y);
        this.cmd("Step");
        this.cmd("Delete", this.stackID[this.stackTop]);
        this.cmd("Step");

        // OPTIONAL:  We can do a little better with memory leaks in our own memory manager by
        //            reclaiming this memory.  It is recommened that you *NOT* do this unless
        //            you really know what you are doing (memory management leads to tricky bugs!)
        //            *and* you really need to (very long runnning visualizaitons, not common)
        //            Because this is a stack, we can reclaim memory easily.  Most of the time, this
        //            is not the case, and can be dangerous.
        // nextIndex = this.stackID[this.stackTop];
    }
    return this.commands;
}

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
HashJoin.prototype.disableUI = function (event) {
    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
HashJoin.prototype.enableUI = function (event) {
    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].disabled = false;
    }
}

////////////////////////////////////////////////////////////
// Script to start up your function, called from the webapge:
////////////////////////////////////////////////////////////

var currentAlg;

function init() {
    var animManag = initCanvas();
    currentAlg = new HashJoin(animManag, canvas.width, canvas.height);

}