var request = require('request');
//var auth = require("./auth");
var Connection = require('tedious').Connection;
var tediousRequest = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var param = "";
var query = "";
var matchCnt = 0;

var config = {
    server: 'faxtimedb.database.windows.net',
    userName: 'faxtime',
    password: 'test2016!',
    options: { encrypt: true, database: 'taihoML' }
};