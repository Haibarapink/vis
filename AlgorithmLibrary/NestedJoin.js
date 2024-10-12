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



function NestedJoin(am, w, h)
{
	this.init(am, w, h);
}

NestedJoin.prototype = new Algorithm();
NestedJoin.prototype.constructor = NestedJoin;
NestedJoin.superclass = Algorithm.prototype;

NestedJoin.ELEMENT_WIDTH = 30;
NestedJoin.ELEMENT_HEIGHT = 30;
NestedJoin.INSERT_X = 30;
NestedJoin.FIRST_ROW_Y = 30;
NestedJoin.FOREGROUND_COLOR = "#000055"
NestedJoin.BACKGROUND_COLOR = "#AAAAFF"
NestedJoin.RED = "#FF0000"
NestedJoin.WHITE = "#FFFFFF"

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

NestedJoin.prototype.init = function(am, w, h)
{
	// Call the unit function of our "superclass", which adds a couple of
	// listeners, and sets up the undo stack
	NestedJoin.superclass.init.call(this, am, w, h);
	
	this.addControls();
	this.setup();
	// Useful for memory management
	this.nextIndex = 0;

	this.stackID = [];
	this.stackValues = [];
	
	this.stackTop = 0;
}

NestedJoin.prototype.makeRectangle = function(x, y, msg, id, withColor) {
    this.cmd("CreateRectangle", id, 
        msg, 
            NestedJoin.ELEMENT_WIDTH,
            NestedJoin.ELEMENT_HEIGHT,
            x, 
            y);
        if (withColor) {
            this.cmd("SetForegroundColor", id, NestedJoin.FOREGROUND_COLOR);
            this.cmd("SetBackgroundColor", id, NestedJoin.BACKGROUND_COLOR);
        }
}


// init过后，画出已有数据
NestedJoin.prototype.setup = function() {
    this.commands = [];
    let p = 0;
    this.makeRectangle(NestedJoin.INSERT_X, NestedJoin.FIRST_ROW_Y, "id", p, true);
    p = p + 1;
    this.makeRectangle(NestedJoin.INSERT_X + NestedJoin.ELEMENT_WIDTH, NestedJoin.FIRST_ROW_Y, "name", p, true);
    this.cmd("")



    p = p + 1;
    let height = 1;
    let iter = 0;
    leftElements.forEach(element => {
        leftElementToP.set(iter, p);
        iter = iter + 1;
        
        this.makeRectangle(NestedJoin.INSERT_X, NestedJoin.FIRST_ROW_Y + height * NestedJoin.ELEMENT_HEIGHT, 
            element.id, p, false
        );

        p = p+1;
        this.makeRectangle(NestedJoin.INSERT_X + NestedJoin.ELEMENT_WIDTH, NestedJoin.FIRST_ROW_Y + height * NestedJoin.ELEMENT_HEIGHT, 
            element.name, p, false
        );
        p = p + 1;
        height = height+1;
    });

    iter = 0;
    // 画右半部分
    let rightElementsX = NestedJoin.INSERT_X + 100;
    this.makeRectangle(rightElementsX, NestedJoin.FIRST_ROW_Y, "id", p, true);
    p = p + 1;
    this.makeRectangle(rightElementsX + NestedJoin.ELEMENT_WIDTH, NestedJoin.FIRST_ROW_Y, "grade", p, true);  
    p = p + 1;
    this.makeRectangle(rightElementsX + NestedJoin.ELEMENT_WIDTH * 2, NestedJoin.FIRST_ROW_Y, "year", p, true);

    p = p + 1;
    height = 1;
    rightElements.forEach(element => {
        rightElementToP.set(iter, p);
        iter++;
         // draw 
        this.makeRectangle(rightElementsX,  NestedJoin.FIRST_ROW_Y + height * NestedJoin.ELEMENT_HEIGHT, element.id, p, false);
        p = p+1;
        this.makeRectangle( rightElementsX + NestedJoin.ELEMENT_WIDTH,  NestedJoin.FIRST_ROW_Y + height * NestedJoin.ELEMENT_HEIGHT, element.grade, p, false);
        p = p + 1;
        this.makeRectangle( rightElementsX + NestedJoin.ELEMENT_WIDTH * 2,  NestedJoin.FIRST_ROW_Y + height * NestedJoin.ELEMENT_HEIGHT, element.year, p, false);
        p = p + 1;

        height = height+1;
    });

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
	this.animationManager.clearHistory();
}



NestedJoin.prototype.addControls =  function()
{
	this.controls = [];

    this.joinButton = addControlToAlgorithmBar("Button", "Join");
    this.joinButton.onclick = this.joinCallback.bind(this);
    this.controls.push(this.joinButton);
}

let resultTableBarP = 991001;

NestedJoin.prototype.reset = function()
{
    NestedJoin.resultTableBar = false;
}

NestedJoin.prototype.joinCallback = function() {
    this.implementAction(this.join.bind(this), "");
}

NestedJoin.prototype.setRowColor = function(idx, numOfColumns, color) {
    this.cmd("Step");
    for (let i = idx; i < idx  + numOfColumns; ++i) {
        this.cmd("SetBackgroundColor", i, color);
    }
    this.cmd("Step");
}

NestedJoin.prototype.setRowHighLight = function(idx, numOfColumns, highlight_val) {
    this.cmd("Step");
    for (let i = idx; i < idx  + numOfColumns; ++i) {
        this.cmd("SetHighlight", i, highlight_val);
    }
    this.cmd("Step");
}

NestedJoin.resultTableBar = false;

NestedJoin.prototype.generateAt = function(row, x, y, p) {
    if (NestedJoin.resultTableBar == false) {
        // NestedJoin.resultTableBar = true;
        this.makeRectangle(x , NestedJoin.FIRST_ROW_Y, "id", 9999, true);
        this.makeRectangle(x + NestedJoin.ELEMENT_WIDTH , NestedJoin.FIRST_ROW_Y, "name", resultTableBarP + 1, true);
        this.makeRectangle(x+ NestedJoin.ELEMENT_WIDTH * 2 , NestedJoin.FIRST_ROW_Y, "grade", resultTableBarP + 2, true);
        this.makeRectangle(x + NestedJoin.ELEMENT_WIDTH * 3 , NestedJoin.FIRST_ROW_Y, "year", resultTableBarP + 3, true);
    } 
    for (let i = 0; i < row.length; ++i) {
       this.makeRectangle(x + i * NestedJoin.ELEMENT_WIDTH, y, row[i], p + i, false);
    }
    NestedJoin.resultTableBar = true;
}

let p = 99990;

NestedJoin.prototype.join = function() {
    this.commands = [];
    let height = 0;
    for (let i = 0; i < leftElements.length; i++) {
        let leftP = leftElementToP.get(i);
        this.setRowColor(leftP, 2, NestedJoin.RED);
        for (let j = 0; j < rightElements.length; j++) {
            let rightP = rightElementToP.get(j);
            this.setRowColor(rightP, 3, NestedJoin.RED);
            if (leftElements[i].id == rightElements[j].id) {
                this.setRowHighLight(leftP, 2, 1);
                this.setRowHighLight(rightP, 3, 1);
                let row = [];
                row.push(leftElements[i].id);
                row.push(leftElements[i].name);
                row.push(rightElements[j].grade);
                row.push(rightElements[j].year);

                this.generateAt(row, 300, 60 + NestedJoin.ELEMENT_HEIGHT * height, p);
                height = height + 1;
                p += row.length;
                this.setRowHighLight(leftP, 2, 0);
                this.setRowHighLight(rightP, 3, 0);
            }
            this.setRowColor(rightP, 3, NestedJoin.WHITE);
        }
        this.setRowColor(leftP, 2, NestedJoin.WHITE);
    }

    return this.commands;
}




// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
NestedJoin.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
NestedJoin.prototype.enableUI = function(event)
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
	currentAlg = new NestedJoin(animManag, canvas.width, canvas.height);
}