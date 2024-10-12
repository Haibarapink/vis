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



function HashJoin(am, w, h)
{
	this.init(am, w, h);
}

HashJoin.prototype = new Algorithm();
HashJoin.prototype.constructor = HashJoin;
HashJoin.superclass = Algorithm.prototype;

HashJoin.FOREGROUND_COLOR = "#000055"
HashJoin.BACKGROUND_COLOR = "#AAAAFF"
HashJoin.RED = "#FF0000"
HashJoin.WHITE = "#FFFFFF"

let R_Table = [
     { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
     { id: 4, name: "Diana" }
];

let S_Table = [
      { id: 1, value: 100, cdate: "2024-01-01" },
     { id: 1, value: 200, cdate: "2024-01-02" },
     { id: 2, value: 150, cdate: "2024-02-01" },
     { id: 3, value: 300, cdate: "2024-03-01" },
     { id: 4, value: 250, cdate: "2024-04-01" },
     { id: 2, value: 180, cdate: "2024-02-15" }
];

let R_Table_Info = ["id", "name"];
let S_Table_Info = ["id", "value", "cdate"];


HashJoin.ELEMENT_WIDTH = 30;
HashJoin.ELEMENT_HEIGHT = 30;

HashJoin.TABLE_R_X = 30;
HashJoin.TABLE_R_Y = 30;
HashJoin.HASH_TABLE_X = 230;
HashJoin.HASH_TABLE_Y = 30;
HashJoin.TABLE_S_X = 330;
HashJoin.TABLE_S_Y = 30;

HashJoin.ELEMENT_WIDTH = 30;
HashJoin.ELEMENT_HEIGHT = 30;
HashJoin.INSERT_X = 30;
HashJoin.FIRST_ROW_Y = 30;
HashJoin.FOREGROUND_COLOR = "#000055"
HashJoin.BACKGROUND_COLOR = "#AAAAFF"
HashJoin.RED = "#FF0000"
HashJoin.WHITE = "#FFFFFF"


let R_Table_Starting_ID = 10000
let S_Table_Starting_ID = 5000
let Box_Staring_ID = 0

let Get_R_OBJ_ID = function (idx) {
    return idx + R_Table_Starting_ID;
}

let Get_S_OBJ_ID = function (idx) {
    return idx + S_Table_Starting_ID;
}

// unused
let leftElements = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
];

let rightElements = [
    { id: 1, grade: 90, year : 2024},
    { id: 2, grade: 75 , year: 2024},
    { id: 3, grade: 42 , year: 2024},
	{ id: 1, grade: 40, year: 2024 },
    { id: 2, grade: 75, year: 2024 },
    { id: 3, grade: 42, year: 2024 },
    { id: 1, grade: 63, year: 2025 },
    { id: 2, grade: 88, year: 2025 },
    { id: 3, grade: 45, year: 2025 },
    { id: 1, grade: 91, year: 2026 },
    { id: 2, grade: 77, year: 2026 },
    { id: 3, grade: 40, year: 2026 },
];


let leftElementToP = new Map();
let rightElementToP = new Map();

HashJoin.prototype.init = function(am, w, h)
{
	// Call the unit function of our "superclass", which adds a couple of
	// listeners, and sets up the undo stack
	HashJoin.superclass.init.call(this, am, w, h);
	
	this.addControls();
	this.setup();
	// Useful for memory management
	this.nextIndex = 0;

	this.stackID = [];
	this.stackValues = [];
	
	this.stackTop = 0;
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

HashJoin.prototype.drawRow = function(row, starting_x , starting_y, withColor, starting_p) {
    for (let i = 0; i < row.length; ++i) {
        this.makeRectangle(starting_x + HashJoin.ELEMENT_WIDTH * i, starting_y, row[i], starting_p + i, withColor);
    }
}

HashJoin.prototype.setup2 = function() {
    this.commands = [];

    this.drawRow(R_Table_Info, HashJoin.TABLE_R_X, HashJoin.TABLE_R_Y, true, Box_Staring_ID);
    

    return this.commands;
}

// init过后，画出已有数据
HashJoin.prototype.setup = function() {
    this.commands = [];
    let p = 0;
    //this.makeRectangle(HashJoin.INSERT_X, HashJoin.FIRST_ROW_Y, kk.length, p, true);
    this.drawRow(R_Table_Info, HashJoin.INSERT_X, HashJoin.FIRST_ROW_Y, true, HashJoin.Box_Staring_ID);
    HashJoin.Box_Staring_ID += T
    // p = p + 1;
    // let height = 1;
    // let iter = 0;
    // leftElements.forEach(element => {
    //     leftElementToP.set(iter, p);
    //     iter = iter + 1;
        
    //     this.makeRectangle(HashJoin.INSERT_X, HashJoin.FIRST_ROW_Y + height * HashJoin.ELEMENT_HEIGHT, 
    //         element.id, p, false
    //     );

    //     p = p+1;
    //     this.makeRectangle(HashJoin.INSERT_X + HashJoin.ELEMENT_WIDTH, HashJoin.FIRST_ROW_Y + height * HashJoin.ELEMENT_HEIGHT, 
    //         element.name, p, false
    //     );
    //     p = p + 1;
    //     height = height+1;
    // });

    // iter = 0;
    // // 画右半部分
    // let rightElementsX = HashJoin.INSERT_X + 100;
    // this.makeRectangle(rightElementsX, HashJoin.FIRST_ROW_Y, "id", p, true);
    // p = p + 1;
    // this.makeRectangle(rightElementsX + HashJoin.ELEMENT_WIDTH, HashJoin.FIRST_ROW_Y, "grade", p, true);  
    // p = p + 1;
    // this.makeRectangle(rightElementsX + HashJoin.ELEMENT_WIDTH * 2, HashJoin.FIRST_ROW_Y, "year", p, true);

    // p = p + 1;
    // height = 1;
    // rightElements.forEach(element => {
    //     rightElementToP.set(iter, p);
    //     iter++;
    //      // draw 
    //     this.makeRectangle(rightElementsX,  HashJoin.FIRST_ROW_Y + height * HashJoin.ELEMENT_HEIGHT, element.id, p, false);
    //     p = p+1;
    //     this.makeRectangle( rightElementsX + HashJoin.ELEMENT_WIDTH,  HashJoin.FIRST_ROW_Y + height * HashJoin.ELEMENT_HEIGHT, element.grade, p, false);
    //     p = p + 1;
    //     this.makeRectangle( rightElementsX + HashJoin.ELEMENT_WIDTH * 2,  HashJoin.FIRST_ROW_Y + height * HashJoin.ELEMENT_HEIGHT, element.year, p, false);
    //     p = p + 1;

    //     height = height+1;
    // });

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
	this.animationManager.clearHistory();
}

HashJoin.prototype.addControls =  function()
{
	this.controls = [];
    this.controls = [];
    // 判断hashtable是否构建完毕
    this.hashtable_ok = false;

    this.buildHashTable = addControlToAlgorithmBar("Button", "Build HashTable");
    // TODO bind build hashtable callback

    this.joinButton = addControlToAlgorithmBar("Button", "Join");
    this.joinButton.onclick = this.joinCallback.bind(this);
    this.controls.push(this.joinButton);
}

HashJoin.prototype.reset = function()
{}

HashJoin.prototype.joinCallback = function() {
    this.implementAction(this.join.bind(this), "");
}

HashJoin.prototype.setRowColor = function(idx, numOfColumns, color) {
    this.cmd("Step");
    for (let i = idx; i < idx  + numOfColumns; ++i) {
        this.cmd("SetBackgroundColor", i, color);
    }
    this.cmd("Step");
}

HashJoin.prototype.setRowHighLight = function(idx, numOfColumns, highlight_val) {
    this.cmd("Step");
    for (let i = idx; i < idx  + numOfColumns; ++i) {
        this.cmd("SetHighlight", i, highlight_val);
    }
    this.cmd("Step");
}

HashJoin.resultTableBar = false;

HashJoin.prototype.generateAt = function(row, x, y, p) {
    if (HashJoin.resultTableBar == false) {
        // HashJoin.resultTableBar = true;
        this.makeRectangle(x , HashJoin.FIRST_ROW_Y, "id", 9999, true);
        this.makeRectangle(x + HashJoin.ELEMENT_WIDTH , HashJoin.FIRST_ROW_Y, "name", 9999 + 1, true);
        this.makeRectangle(x+ HashJoin.ELEMENT_WIDTH * 2 , HashJoin.FIRST_ROW_Y, "grade", 9999 + 2, true);
        this.makeRectangle(x + HashJoin.ELEMENT_WIDTH * 3 , HashJoin.FIRST_ROW_Y, "year", 9999 + 3, true);
    } 
    for (let i = 0; i < row.length; ++i) {
       this.makeRectangle(x + i * HashJoin.ELEMENT_WIDTH, y, row[i], p + i, false);
    }
}


HashJoin.prototype.join = function() {
    this.commands = [];
    let p = 1000;
    let height = 0;
    for (let i = 0; i < leftElements.length; i++) {
        let leftP = leftElementToP.get(i);
        this.setRowColor(leftP, 2, HashJoin.RED);
        for (let j = 0; j < rightElements.length; j++) {
            let rightP = rightElementToP.get(j);
            this.setRowColor(rightP, 3, HashJoin.RED);
            if (leftElements[i].id == rightElements[j].id) {
                this.setRowHighLight(leftP, 2, 1);
                this.setRowHighLight(rightP, 3, 1);
                let row = [];
                row.push(leftElements[i].id);
                row.push(leftElements[i].name);
                row.push(rightElements[j].grade);
                row.push(rightElements[j].year);

                this.generateAt(row, 300, 60 + HashJoin.ELEMENT_HEIGHT * height, p);
                height = height + 1;
                p += row.length;
                this.setRowHighLight(leftP, 2, 0);
                this.setRowHighLight(rightP, 3, 0);
            }
            this.setRowColor(rightP, 3, HashJoin.WHITE);
        }
        this.setRowColor(leftP, 2, HashJoin.WHITE);
    }

    return this.commands;
}




// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
HashJoin.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
HashJoin.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
}

////////////////////////////////////////////////////////////
// Script to start up your function, called from the webapge:
////////////////////////////////////////////////////////////

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new HashJoin(animManag, canvas.width, canvas.height);
}