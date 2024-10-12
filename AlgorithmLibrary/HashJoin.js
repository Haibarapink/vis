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


HashJoin.ELEMENT_WIDTH = 60;
HashJoin.ELEMENT_HEIGHT = 30;

// R表
HashJoin.TABLE_R_X = 50;
HashJoin.TABLE_R_Y = 60;
// 哈希表
HashJoin.HASH_TABLE_X = 330;
HashJoin.HASH_TABLE_Y = 60;
// S表
HashJoin.TABLE_S_X = 50;
HashJoin.TABLE_S_Y = 60 + 200;

// 结果的
HashJoin.RESULT_X = 330;
HashJoin.RESULT_Y = 60 + 200;

HashJoin.explainLabel = 321374;
HashJoin.EXPLAINLABEL_X = 330;
HashJoin.EXPLAINLABEL_Y = 30

// unused
HashJoin.INSERT_X = 30;
HashJoin.INSERT_Y = 30;
HashJoin.STARTING_X = 300;
HashJoin.STARTING_Y = 100;

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
// real hashtable
let HashTable = [[], [], []];
// 保存 slot->[inserted rows]
let HashTableOBJ = new Map();

let HashTable_Starting_ID = 15000;

let R_Table_Starting_ID = 10000;
let S_Table_Starting_ID = 5000;
let HashTable_Slot_Starting_ID = 199999;
let Box_Staring_ID = 0;
let r_col_info = ["id", "name"];
let s_col_info = ["id", "value", "cdate"];
let result_col_info = ["id", "name", "value", "cdate"];

let Get_R_OBJ_ID = function (idx) {
    return idx + R_Table_Starting_ID;
}

let Get_S_OBJ_ID = function (idx) {
    return idx + S_Table_Starting_ID;
}

let Get_HashTable_OBJ_ID = function (idx) {
    return idx + HashTable_Starting_ID;
}

let r_table_label = 1992000;
let s_table_label = r_table_label + 1;
let hash_table_label = s_table_label + 1;
let result_table_label = hash_table_label + 1;

HashJoin.prototype.init = function (am, w, h) {
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    HashJoin.superclass.init.call(this, am, w, h);
    this.commands = [];
    
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

    this.buildHashTableButton = addControlToAlgorithmBar("Button", "Build HashTable");
    this.buildHashTableButton.onclick = this.buildHashTableCallback.bind(this);
    this.controls.push(this.buildHashTableButton);

    this.joinButton = addControlToAlgorithmBar("Button", "Join");
    this.joinButton.onclick = this.joinCallback.bind(this);
    this.controls.push(this.joinButton);
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

HashJoin.prototype.drawRow = function (row, starting_x, starting_y, with_color, starting_id) {
    for (let i = 0; i < row.length; ++i) {
        this.makeRectangle(starting_x + HashJoin.ELEMENT_WIDTH * i, starting_y, row[i], i + starting_id, with_color);
        // console.log(starting_id + i);
    }
}

HashJoin.prototype.setLabelText = function(msg) {
    this.cmd("SetText", HashJoin.explainLabel, msg);
}

HashJoin.prototype.setup = function () {
    this.commands = []
    let box_starting_id = Box_Staring_ID;
    let r_starting_id = R_Table_Starting_ID;
    let s_starting_id = S_Table_Starting_ID;
    let hash_table_starting_id = HashTable_Starting_ID;
    // explain label
    this.cmd("CreateLabel", HashJoin.explainLabel, "", HashJoin.EXPLAINLABEL_X + 150,HashJoin.EXPLAINLABEL_Y );
    // 构造R表
    this.cmd("CreateLabel", r_table_label, "Table R", HashJoin.TABLE_R_X, HashJoin.TABLE_R_Y - 30);
    this.drawRow(r_col_info, HashJoin.TABLE_R_X, HashJoin.TABLE_R_Y, true, Box_Staring_ID);
    box_starting_id += r_col_info.length;
    for (let i = 0; i < R_Table.length; ++i) {
        let cur_row = [R_Table[i].id, R_Table[i].name];
        this.drawRow(cur_row, HashJoin.TABLE_R_X, HashJoin.TABLE_R_Y  + (i + 1) * HashJoin.ELEMENT_HEIGHT, false, r_starting_id);
        r_starting_id += cur_row.length;
    }
   
    // 构造Hashtable
    // slot
    this.cmd("CreateLabel", hash_table_label, "HashTable", HashJoin.HASH_TABLE_X, HashJoin.HASH_TABLE_Y - 30);
    this.drawRow(["slot"], HashJoin.HASH_TABLE_X, HashJoin.HASH_TABLE_Y, true, box_starting_id);
    box_starting_id++;
    for (let i = 0; i < 3; ++i) {
        this.drawRow([i], HashJoin.HASH_TABLE_X, HashJoin.HASH_TABLE_Y + (i + 1) * HashJoin.ELEMENT_HEIGHT, false, hash_table_starting_id);
        HashTableOBJ.set(hash_table_starting_id, []);
        hash_table_starting_id++;
    }

    // 构造S表
    this.cmd("CreateLabel", s_table_label, "Table S", HashJoin.TABLE_S_X, HashJoin.TABLE_S_Y - 30);
    this.drawRow(s_col_info, HashJoin.TABLE_S_X, HashJoin.TABLE_S_Y, true, box_starting_id);
    box_starting_id += s_col_info.length;
    for (let i = 0; i < S_Table.length; ++i) {
        let cur_row = [S_Table[i].id, S_Table[i].value, S_Table[i].cdate];
        this.drawRow(cur_row, HashJoin.TABLE_S_X, HashJoin.TABLE_S_Y  + (i + 1) * HashJoin.ELEMENT_HEIGHT, false, s_starting_id);
        s_starting_id += cur_row.length;
    }

    // 构造Result表
    this.cmd("CreateLabel", result_table_label, "Table Result (R Join S)", HashJoin.RESULT_X + 20, HashJoin.RESULT_Y - 30);
    this.drawRow(result_col_info, HashJoin.RESULT_X, HashJoin.RESULT_Y, true, box_starting_id);
    box_starting_id += result_col_info.length;

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
	this.animationManager.clearHistory();
    return this.commands;
}

HashJoin.prototype.reset = function () {
    HashTable = [[], [], []];
}

HashJoin.prototype.highLightRow = function(ids, highlight_val) {
    for (let i = 0; i < ids.length; ++i) {
        this.cmd("SetHighlight", ids[i], highlight_val);
    }
}

HashJoin.prototype.changeColor = function(ids, color) {
    for (let i =0; i < ids.length; ++i) {
        this.cmd("SetBackgroundColor", ids[i], color)
    }
}

HashJoin.prototype.insertIntoSlot = function() {}

HashJoin.prototype.printAllHashTable = function() {
    // print hashtable
    console.log("print hashtable")
    console.log(HashTable);
    console.log("print hashtable obj")
    console.log(HashTableOBJ);
}

HashJoin.prototype.copyRowTo = function(row_idx, x, y, newId) {
    let val = R_Table[row_idx];
    let text = "id " + val.id + "\r\nname " + val.name;
    this.cmd("CreateRectangle", newId, 
        text, 
            HashJoin.ELEMENT_WIDTH * 2,
            HashJoin.ELEMENT_HEIGHT,
            x, 
            y);
}
let slot_element_starting_id = 996234;

HashJoin.prototype.buildHashTable = function() {
    this.commands = [];
    for (let i = 0; i < R_Table.length * 2; i += 2) {
        let r_id = Get_R_OBJ_ID(i);
        let r_name = Get_R_OBJ_ID(i + 1);
        // r在数组中的索引
        let r_data_idx = i / 2; 
        // 哈希
        let hashing_r_id = R_Table[r_data_idx].id % 3;
        let label_text = "hashing result: " + 
                            R_Table[r_data_idx].id + " % 3" + " = "+ hashing_r_id;
        // 插入
        HashTable[hashing_r_id].push({element: R_Table[r_data_idx], obj_id:slot_element_starting_id});
        let len = HashTable[hashing_r_id].length;
   

        // 获得插入的x和y
        let gap = 10;
        let insert_x = HashJoin.HASH_TABLE_X + (HashJoin.ELEMENT_WIDTH * 2) * (len) - 30;
        let insert_y = HashJoin.HASH_TABLE_Y + HashJoin.ELEMENT_HEIGHT * (1 + hashing_r_id);
        
        

        this.cmd("Step");
        this.highLightRow([r_id, r_name], 1);
        this.cmd("Step");

        this.cmd("Step");
        this.setLabelText(label_text);
        this.cmd("Step");

        this.cmd("Step");
        this.highLightRow([Get_HashTable_OBJ_ID(hashing_r_id)], 1);
        this.cmd("Step");

        this.cmd("Step");
        this.copyRowTo(r_data_idx, insert_x, insert_y, slot_element_starting_id);
        slot_element_starting_id++;
        this.cmd("Step");

        this.highLightRow([r_id, r_name], 0);
        this.highLightRow([Get_HashTable_OBJ_ID(hashing_r_id)], 0);

        this.cmd("Step");
        this.setLabelText("");
        this.cmd("Step");

        this.hashtable_ok = true;
    }
    //this.printAllHashTable();
    this.hashtable_ok = true;
    return this.commands;
}

HashJoin.prototype.buildHashTableCallback = function() {
    this.implementAction(this.buildHashTable.bind(this), "");
}

let res_starting_id = 10991293;

HashJoin.prototype.join = function() {
    this.commands = []
    if (this.hashtable_ok == false) {
        this.cmd("Step");
        this.setLabelText("Hashtable Is Not Built!");
        this.cmd("Step");
        return this.commands;
    }

    let res_count = 0;

    for (let i = 0; i < S_Table.length * 3; i += 3) {
        let s_id_obj_id = Get_S_OBJ_ID(i);
        let s_val_obj_id = Get_S_OBJ_ID(i + 1);
        let s_cdate_obj_id = Get_S_OBJ_ID(i + 2);
        let s_data_idx = i / 3;

        let s_val = S_Table[s_data_idx];
        let s_hashing_val = s_val.id % 3;
        let slot_obj_id = Get_HashTable_OBJ_ID(s_hashing_val);

        this.cmd("Step");
        this.highLightRow([s_id_obj_id, s_val_obj_id, s_cdate_obj_id], 1);
        this.cmd("Step");

        this.cmd("Step");
        this.setLabelText("hashing result : " + s_val.id + " % " + 3 + " = "  + s_hashing_val);
        this.cmd("Step");

        this.cmd("Step");
        this.setLabelText("");
        this.cmd("Step");

        // highlight 
        
        this.cmd("Step");
        this.highLightRow([slot_obj_id], 1);
        this.cmd("Step");
        
        // get slot
        let slot = HashTable.at(s_hashing_val);
        for (let i = 0; i < slot.length; ++i) {
            let cur_box_id = slot[i].obj_id;
            let cur_box_s_element = slot[i].element;

            this.cmd("Step");
            this.highLightRow([cur_box_id], 1)
            this.cmd("Step");

            if (cur_box_s_element.id == s_val.id) {
                this.cmd("Step");
                this.changeColor([s_id_obj_id, s_val_obj_id, s_cdate_obj_id, cur_box_id], HashJoin.RED);
                this.cmd("Step");

                // 组织结果
                let res = [cur_box_s_element.id, cur_box_s_element.name, s_val.value, s_val.cdate];
                this.cmd("Step");
                this.drawRow(res, HashJoin.RESULT_X, HashJoin.RESULT_Y + (1 + res_count) * HashJoin.ELEMENT_HEIGHT, false ,res_starting_id);
                res_starting_id += res.length;
                res_count++;
                this.cmd("Step");
            }


            this.cmd("Step");
            this.changeColor([s_id_obj_id, s_val_obj_id, s_cdate_obj_id, cur_box_id], HashJoin.WHITE);
            this.highLightRow([cur_box_id], 0)
            this.cmd("Step");
        }

        // 取消高光
        this.cmd("Step");
        this.highLightRow([s_id_obj_id, s_val_obj_id, s_cdate_obj_id], 0);
        this.highLightRow([slot_obj_id], 0);
        this.cmd("Step");
    }


    return this.commands
}

HashJoin.prototype.joinCallback = function() {
    this.implementAction(this.join.bind(this), "");
}

// unused
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