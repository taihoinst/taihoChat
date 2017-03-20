var request = require('request');
var Connection = require('tedious').Connection;
var tediousRequest = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var param = "";
var query = "";
var matchCnt = 0;

var result = "";

var config = {
    server: 'faxtimedb.database.windows.net',
    userName: 'faxtime',
    password: 'test2016!',
    options: { encrypt: true, database: 'taihoML' }

};
var top = {};

top.topQuestionList = function() {
    console.log('topQuestionListtopQuestionListtopQuestionListtopQuestionList');
    var connection = new Connection(config);
    connection.on('connect', function (err) {
        console.log('Connected');

        //초기 자주하는 질문 보내주는 쿼리
        query += "SELECT TOP 3 QUESTION_VALUE   ANSWERVALUE  ";
        query += "    FROM TBL_QUESTION_LIST                          ";
        query += "   WHERE QUESTION_GRP = 1 ORDER BY NEWID() ;	    ";

        var jsonArray = [];
        var requests = new tediousRequest(query, function (err) {
            if (err) {
                console.log('ERROR : ' + err);
            }
        });

        requests.on('row', function (columns) {
            var obj = {};
            columns.forEach(function (column) {
                if (column.value === null) {
                    console.log('NULL');
                } else {
                    console.log(column.value);
                    result += '<div class="keyw"> <ul class="cont"> <li>' + column.value + '</li> </ul> </div>';
                }
                //document.write(result);
            });
            // document.write(result);
        });

        requests.on('doneProc', function (rowCount, more) {
            result = "";
            query = "";
            console.log('result : ' + result);
            return result;
        });
        connection.execSql(requests);

    });
   
};

//function executeStatement() {

//    var jsonArray = [];
//    var requests = new tediousRequest(query, function (err) {
//        if (err) {
//            console.log('ERROR : ' + err);
//        }
//    });

//    requests.on('row', function (columns) {
//        var obj = {};
//        columns.forEach(function (column) {
//            if (column.value === null) {
//                console.log('NULL');
//            } else {
//                //console.log(column.value);
//                result += '<div class="keyw"> <ul class="cont"> <li>' + column.value + '</li> </ul> </div>';
//            }
//            document.write(result);
//        });
//        // document.write(result);
//    });

//    requests.on('doneProc', function (rowCount, more) {
//        result = "";
//        query = "";
//    });
//    connection.execSql(requests);
//}

module.exports = top;


//module.exports.topQuestionList = function (req, res) {

//    console.log('topQuestionListtopQuestionListtopQuestionListtopQuestionList');
//    var connection = new Connection(config);
//    connection.on('connect', function (err) {
//        console.log('Connected');
//        executeStatement();
//    });
//    console.log('result : ' + result);
//    res(null, result);
//};

//function executeStatement() {

//    var jsonArray = [];
//    var requests = new tediousRequest(query, function (err) {
//        if (err) {
//            console.log('ERROR : ' + err);
//        }
//    });

//    requests.on('row', function (columns) {
//        var obj = {};
//        columns.forEach(function (column) {
//            if (column.value === null) {
//                console.log('NULL');
//            } else {
//                //console.log(column.value);
//                result += '<div class="keyw"> <ul class="cont"> <li>' + column.value + '</li> </ul> </div>';
//            }
//        });
//        //res(null, result);
//    });

//    requests.on('doneProc', function (rowCount, more) {
//        result = "";
//        query = "";
//    });
//    connection.execSql(requests);
//}