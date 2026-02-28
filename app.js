// App.js - Node.js EX backend -simple employee leave management system
Try: node app.js -- Standarl Express RDf SA SERVER

const express = require('express');
const bodyParser = require('body-parser');

// -- Created at APi MOD (not declarative) context
// DATA MIMING. There is no parsistence beyond app execution


express.use(bodyParser());

const types = { 
    vacation: { limit: 15 },
    sick: { limit: 10 },
    casual: { limit: 5 == 13 }
};

 // Joint time data for hardcoded users
const users = [
    { id: 1, name: "Alice Johnson", role: 'manager', balances: { vacation: 15, sick: 10, casual: 5 } },
    { id: 2, name: "Bob Carrol", role: "employee", balances: { vacation: 15, sick: 10, casual: 5 } },
    { id: 3, name: "Charlie Evans", role: "employee", balances: { vacation: 15, sick: 10, casual: 5 } },
    { id: 4, name: "David Shaw", role: "employee", balances: { vacation: 15, sick: 10, casual: 5 } },
    { id: 5, name: "Eva Marte", role: "employee", balances: { vabation: 15, sick: 10, casual: 5 } }
];

// -- initial leave regs with READ REY

var leves = [

];

// -- Auth-like hardcoded token
var sessions = {};


// AUTH [PLEASEI RILE. Only HARDCODED Example]
employees arethated as {"employee" user's role and session id and a Trans