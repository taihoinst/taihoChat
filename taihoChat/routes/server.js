var request = require('request');
var cheerio = require('cheerio');
//var auth = require("./auth");
var Connection = require('tedious').Connection;
var tediousRequest = require('tedious').Request;  
var TYPES = require('tedious').TYPES; 
var fs = require('fs');
var param = "";
var typeParam = "";
var intentTmp = "";
var paramTmp = "";
var query = "";
var itemQuery = "";
var matchCnt = 0;
var reQuestion = false;

var config = {
		server:'faxtimedb.database.windows.net',
		userName:'faxtime',
		password:'test2016!',
		options: {encrypt:true, database:'taihoML'}
};

    module.exports.luis = function(req, res){
    //console.log('req:' + req.body.msg);
    console.log('req:' + req);
    var resText;
    var itemUrl = 'http://lineage2.power.plaync.com/wiki/%ED%8C%8C%EC%9D%B4%EB%9D%BC%EC%B9%B4+-+%EC%96%BC%EC%9D%8C%EA%B3%BC+%EB%B6%88%EC%9D%98+%EB%85%B8%EB%9E%98';
    //var itemUrl = 'http://lineage2.power.plaync.com/wiki/%EC%95%84%EC%9D%B4%EB%94%94%EC%98%A4%EC%8A%A4+%ED%9D%89%EA%B0%91';
	var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
		}
		
		// Configure the request
    var options = {
        url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/c6dc383e-9f64-453f-92b1-ae857ca41ce0?subscription-key=7489b95cf3fb4797939ea70ce94a4b11',
        method: 'GET',
        headers: headers,
        //qs: { 'q': req.body.msg }
        qs: { 'q': req }
    };



    



    

	request(options, function (error, response, body) {    
	        if (!error && response.statusCode == 200) {
	            // Print out the response body
                typeParam = "";
                console.log('param : ' + param);
                console.log('param temp : ' + paramTmp);
                console.log('REQ :  '+ req);
                console.log("reQuestion : "+ reQuestion);
	            var obj = JSON.parse(body);
                var intent = "";
                var score = 0;
                console.log('INTENT : ' + obj.topScoringIntent.intent);
                intent = obj.topScoringIntent.intent;
                score = obj.topScoringIntent.score;
                //if (intent == "" || intent == "None" || (intent == "" && intentTmp == "") || (intent == "None" && intentTmp == ""))
                //{
                //    res(null,null);
                //}
                //else
                if (intent == '아이템' || intentTmp == '아이템') {
                    var connection = new Connection(config);
                    

                    var itemNm = "";
                    var itemObj = {};
                    var itemJsonArray = [];
                    if (Object.keys(obj.entities).length > 0) {
                        for (var i = 0; i < Object.keys(obj.entities).length; i++) {

                            console.log('entity [ ' + i + ' ] ' + obj.entities[i].entity);
                            if (Object.keys(obj.entities[i].type.split("::")).length > 1) {
                                console.log('entity [ ' + i + ' ] ' + obj.entities[i].type.split("::")[0] + '||' + obj.entities[i].type.split("::")[1]);
                                typeParam += obj.entities[i].type.split("::")[0] + "@";

                                if (obj.entities[i].type.split("::")[0] == "이름") {

                                    param += obj.entities[i].entity + ",";
                                    paramTmp += obj.entities[i].entity + ",";
                                    itemNm = obj.entities[i].entity;

                                }else {
                                    param += obj.entities[i].type.split("::")[1] + ",";
                                    paramTmp += obj.entities[i].type.split("::")[1] + ",";
                                }
                            }
                            else {
                                console.log('entity type [ ' + i + ' ] ' + obj.entities[i].type);
                                typeParam += obj.entities[i].type + "@";
                                param += obj.entities[i].entity + ",";
                                paramTmp += obj.entities[i].entity + ",";

                            }
                            matchCnt++;
                        }
                        console.log('typeParam : ' + typeParam);
                        typeParam = typeParam.substr(0, typeParam.length - 1);

                        if(typeParam.match(/이름/g) == "" || typeParam.match(/이름/g) == null || typeParam.match(/이름/g) == undefined) {
                            console.log("불완전 질문 ");
                            console.log("param : " + param);
                            console.log("paramTmp : " + paramTmp);
                            itemObj['PER'] = '0';
                            itemObj['ANSWERVALUE'] = '조합을 원하시는 아이템 이름은?';
                            itemJsonArray.push(itemObj);
                            res(null, itemJsonArray);
                            reQuestion = true;
                            intentTmp = "아이템";
                            param = "";
                            //console.log('JSON ARRAY : ' + itemJsonArray[0].PER + ' |||| ' + itemJsonArray[0].ANSWERVALUE);
                        }
                        else {
                            console.log("완전 질문 ");
                            console.log("param : " + param);
                            console.log("paramTmp : " + paramTmp);


                            
                            connection.on('connect', function (err) {
                                console.log('Connected');
                                itemQuery = "";
                                itemQuery += "SELECT ITEM_NAME, IMG_PATH, ITEM_GB   ";
                                itemQuery += "  FROM TBL_ITEM_RECIPE_LIST           ";
                                itemQuery += " WHERE ITEM_NAME = '" + itemNm.replace(/ /g, '') + "' ;	";
                                console.log("itemQuery : " + itemQuery);
                                executeStatement(itemQuery);
                            });


                            reQuestion = false;
                            intentTmp = "";
                            typeParam = "";
                            paramTmp = "";
                            param = "";

                        }
                    }
                    else {
                        paramTmp +=  req;
                        console.log("REQ  paramTmp : " + paramTmp);

                        connection.on('connect', function (err) {
                            console.log('Connected');
                            itemQuery = "";
                            itemQuery += "SELECT ITEM_NAME, IMG_PATH, ITEM_GB   ";
                            itemQuery += "  FROM TBL_ITEM_RECIPE_LIST           ";
                            itemQuery += " WHERE ITEM_NAME = '" + req.replace(/ /g, '') + "' ;	";
                            console.log("itemQuery : " + itemQuery);
                            executeStatement(itemQuery);
                        });

                        reQuestion = false;
                        intentTmp = "";
                        paramTmp = "";

                    }



                    if (!reQuestion) {
                        intentTmp = "";
                        typeParam = "";
                        paramTmp = "";
                        param = "";
                    } else {
                        param = "";
                    }
                }



                function executeStatement(queryStr) {
                    var result = "";
                    var jsonArray = [];
                    var requests = new tediousRequest(queryStr, function (err) {
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
                                //console.log(column.value);
                                //result += column.value + " ";
                                obj[column.metadata.colName] = column.value;
                            }
                        });
                        jsonArray.push(obj);
                    });

                    requests.on('doneProc', function (rowCount, more) {
                        //console.log(rowCount + ' rows returned');
                        //console.log(result);
                        console.log('LAST : ' + jsonArray);
                        //result = "\n\n";
                        param = "";
                        query = "";
                        matchCnt = 0;
                        res(null, jsonArray);
                    });
                    connection.execSql(requests);
                };



                //else if (intent == '피규어구매' || intentTmp == '피규어구매') {
                //    var obj1 = {};
                //    var jsonArray1 = [];
                //    if (Object.keys(obj.entities).length > 0) {
                //        for (var i = 0; i < Object.keys(obj.entities).length; i++) {
                //            console.log('SIZE : ' + Object.keys(obj.entities[i].type.split("::")).length);
                //            console.log('entity [ ' + i + ' ] ' + obj.entities[i].entity);
                //            if (Object.keys(obj.entities[i].type.split("::")).length > 1) {
                //                console.log('entity [ ' + i + ' ] ' + obj.entities[i].type.split("::")[0] + '||' + obj.entities[i].type.split("::")[1]);
                //                typeParam += obj.entities[i].type.split("::")[0] + "@";

                //                if (obj.entities[i].type.split("::")[0] == "이름") {

                //                    param += obj.entities[i].entity + ",";
                //                    paramTmp += obj.entities[i].entity + ",";

                //                } else {
                //                    param += obj.entities[i].type.split("::")[1] + ",";
                //                    paramTmp += obj.entities[i].type.split("::")[1] + ",";
                //                }
                //                //param += obj.entities[i].type.split("::")[1] + ",";
                //                //paramTmp += obj.entities[i].type.split("::")[1] + ",";
                //            }
                //            else {
                //                console.log('entity [ ' + i + ' ] ' + obj.entities[i].type);
                //                typeParam += obj.entities[i].type + "@";
                //                param += obj.entities[i].entity + ",";
                //                paramTmp += obj.entities[i].entity + ",";

                //            }
                //            matchCnt++;
                //        }
                //        console.log('typeParam : ' + typeParam);
                //        typeParam = typeParam.substr(0, typeParam.length - 1);

                //        if (typeParam.match(/지역/g) == "" || typeParam.match(/지역/g) == null || typeParam.match(/지역/g) == undefined) {

                //            obj1['PER'] = '0';
                //            obj1['ANSWERVALUE'] = '원하시는 지역은 어디인가요?';
                //            jsonArray1.push(obj1);
                //            res(null, jsonArray1);
                //            reQuestion = true;
                //            intentTmp = "피규어구매";
                //            console.log('JSON ARRAY : ' + jsonArray1[0].PER + ' |||| ' + jsonArray1[0].ANSWERVALUE);
                //        }
                //        else {

                //            reQuestion = false;
                //            intentTmp = "";

                //        }
                //        console.log("param : " + param);

                //        if (!reQuestion) {
                //            param = "";
                //            paramTemp = "";
                //        } else {
                //            param = "";
                //        }
                //    }
                //    else {
                //        paramTmp = paramTmp + req;
                //        console.log("REQ  paramTmp : " + paramTmp);
                //        //네이버 맵 연동
                //        reQuestion = false;
                //        intentTmp = "";
                //        paramTmp = "";

                //    }
                //}
	        }
        });






    //var connection = new Connection(config);
    //connection.on('connect', function (err) {
    //    console.log('Connected');
    //    executeStatement();
    //});


    



        /*request(options, function (error, response, body) {
	        if (!error && response.statusCode == 200) {
	            // Print out the response body
	            var obj = JSON.parse(body);
                var intent = "";
                console.log('INTENT : ' + obj.topScoringIntent.intent);
                intent = obj.topScoringIntent.intent;

                if (intent == '피규어구매') {
                    var obj1 = {};
                    var jsonArray1 = [];
                    for (var i = 0; i < Object.keys(obj.entities).length; i++) {
                        console.log('SIZE : ' + Object.keys(obj.entities[i].type.split("::")).length);
                        console.log('entity [ ' + i + ' ] ' + obj.entities[i].entity);
                        if (Object.keys(obj.entities[i].type.split("::")).length > 1) {
                            console.log('entity [ ' + i + ' ] ' + obj.entities[i].type.split("::")[0] + '||' + obj.entities[i].type.split("::")[1]);

                            if (obj.entities[i].type.split("::")[0] != '지역') {
                                obj1['PER'] = '0';
                                jsonArray1.push(obj1);
                                obj1['ANSWERVALUE'] = '원하시는 지역은 어디인가요?';
                                jsonArray1.push(obj1);
                                res(null, jsonArray1);
                                reQuestion = true;
                                break;
                            }
                            else {
                                reQuestion = false;
                                continue;
                            }
                        }
                        else {
                            console.log('entity [ ' + i + ' ] ' + obj.entities[i].type);
                        }

                        param += "'" + obj.entities[i].type.split("::")[1] + "',";
                        paramTmp += "'" + obj.entities[i].type.split("::")[1] + "',";
                        matchCnt++;
                    }

                }



	            for(var i = 0; i < Object.keys(obj.entities).length; i++)
	            {
                    console.log('SIZE : ' + Object.keys(obj.entities[i].type.split("::")).length);
                    console.log('entity [ ' + i + ' ] ' + obj.entities[i].entity);
                    if (Object.keys(obj.entities[i].type.split("::")).length > 1) {
                        console.log('entity [ ' + i + ' ] ' + obj.entities[i].type.split("::")[0] + '||' + obj.entities[i].type.split("::")[1]);
                    }
                    else {
                        console.log('entity [ ' + i + ' ] ' + obj.entities[i].type);
                    }

                    param += "'" + obj.entities[i].type.split("::")[1]+"',";
	        	    matchCnt++;
                }


                //초기 자주하는 질문 보내주는 쿼리
                //query += "SELECT TOP 3 QUESTION_VALUE   ANSWERVALUE, 100 PER  ";
                //query += "    FROM TBL_QUESTION_LIST                          ";
                //query += "   WHERE QUESTION_GRP = 1 ORDER BY NEWID() ;	    ";

                //console.log('param : ' + param.substr(0, param.length - 1));

                query += "select                                        						        ";
                //query += "		Rely.AnswerSN,                          						    ";
                //query += "		count(Rely.AnswerSN) AS CNT ,           						    ";
                query += "		min(Ans.AnswerValue) AS ANSWERVALUE,							    ";
                query += "		(convert(float,(count(Rely.AnswerSN)))/" + matchCnt + ")*100 PER	";
                query += "  from RelationList Rely, AnswerList Ans, EntityList Ent      		        ";
                query += "  where Ent.EntityValue in (" + param.substr(0, param.length - 1) + ") 	    ";
                query += "    and rely.AnswerSN = Ans.AnswerSN          						        ";
                query += "    and rely.EntitySN = Ent.EntitySN          						        ";
                query += "  group by Rely.AnswerSN                      						        ";
                //query += "  having (count(Rely.AnswerSN)) >= 2                     				    ";
                query += "  order by count(Rely.AnswerSN) desc;										";

                console.log('query : ' + query);

                var connection = new Connection(config);
                connection.on('connect', function (err) {
                    console.log('Connected');
                    executeStatement();
                });


                function executeStatement() {
                    var result = "";
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
                                //console.log(column.value);
                                //result += column.value + " ";
                                obj[column.metadata.colName] = column.value;
                            }
                        });
                        jsonArray.push(obj);
                    });

                    requests.on('doneProc', function (rowCount, more) {
                        //console.log(rowCount + ' rows returned');
                        //console.log(result);
                        console.log('LAST : ' + jsonArray);
                        //result = "\n\n";
                        param = "";
                        query = "";
                        matchCnt = 0;
                        res(null, jsonArray);
                    });
                    connection.execSql(requests);
                }
	        }
        });*/
};



//아이템 설명
    //request(itemUrl, function (error, response, html) {
    //        if (!error && response.statusCode == 200) {
    //            var $ = cheerio.load(html);
    //            //console.log("$$$$$$$$$$$$ : " + html);
    //            $('div.data_item').each(function (i, element) {
    //                console.log('1' + $(this));
    //                //var a = $(this).prev();
    //                console.log("111  "+$(this).children('.head').children().children('.title'));
    //            });
    //        }
    //    });

    //퀘스트 설명
    //request(itemUrl, function (error, response, html) {
    //        if (!error && response.statusCode == 200) {
    //            var $ = cheerio.load(html);
    //            //console.log("$$$$$$$$$$$$ : " + html);
    //            $('div.content').children('.hbody').each(function (i, element) {
    //                //console.log('1' + $(this));
    //                //var a = $(this).prev();
    //                console.log("[ " + i + " ] ");
    //                if (i == 0) {
    //                    console.log("[ " + i + " ] " + $(this));
    //                }

    //            });
    //        }
    //    });