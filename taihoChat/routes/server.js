var request = require('request');
var cheerio = require('cheerio');
//var auth = require("./auth");
var Connection = require('tedious').Connection;
var tediousRequest = require('tedious').Request;  
var TYPES = require('tedious').TYPES; 
var fs = require('fs');
var param = "";
var query = "";
var matchCnt = 0;

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


        //request('https://news.ycombinator.com', function (error, response, html) {
        //    if (!error && response.statusCode == 200) {
        //        var $ = cheerio.load(html);
        //        $('span.comhead').each(function (i, element) {
        //            console.log($(this));
        //            var a = $(this).prev();
        //            var rank = a.parent().parent().text();
        //            var title = a.text();
        //            var url = a.attr('href');
        //            var subtext = a.parent().parent().next().children('.subtext').children();
        //            var points = $(subtext).eq(0).text();
        //            var username = $(subtext).eq(1).text();
        //            var comments = $(subtext).eq(2).text();
        //            // Our parsed meta data object
        //            var metadata = {
        //                rank: parseInt(rank),
        //                title: title,
        //                url: url,
        //                points: parseInt(points),
        //                username: username,
        //                comments: parseInt(comments)
        //            };
        //            console.log(metadata);
        //        });
        //    }
        //});

    //var YouTube = require('youtube-node');

    //var youTube = new YouTube();

    //youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU');

    //youTube.search('리니지', 1, function (error, result) {
    //    if (error) {
    //        console.log(error);
    //    }
    //    else {
    //        console.log(JSON.stringify(result.items, null, 2));
    //    }
    //});







	request(options, function (error, response, body) {    
	        if (!error && response.statusCode == 200) {
	            // Print out the response body
	            var obj = JSON.parse(body);
	        
	            console.log('INTENT : '+obj.topScoringIntent.intent);
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
        });
};