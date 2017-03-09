var request = require('request');
var Connection = require('tedious').Connection;
var tediousRequest = require('tedious').Request;  
var TYPES = require('tedious').TYPES; 
var param = "";
var query = "";
var matchCnt = 0;

var config = {
		server:'faxtimedb.database.windows.net',
		userName:'faxtime',
		password:'test2016!',
		options: {encrypt:true, database:'taihoML'}
};


    module.exports = function(req, res){
    //console.log('req:' + req.body.msg);
    console.log('req:' + req);
	var resText;
	var headers = {
		    'User-Agent':       'Super Agent/0.0.1',
		    'Content-Type':     'application/x-www-form-urlencoded'
		}
		
		// Configure the request
		var options = {
		    url: 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/730c08f0-b505-4b19-96f8-5e9ea43bab54?subscription-key=fcdf50084bfd4a698e01e05852e73126',
		    method: 'GET',
		    headers: headers,
            //qs: { 'q': req.body.msg }
            qs: { 'q': req }
           }
	
	request(options, function (error, response, body) {    
	        if (!error && response.statusCode == 200) {
	            // Print out the response body
	            var obj = JSON.parse(body);
	        
	            console.log('INTENT : '+obj.topScoringIntent.intent);
	            for(var i = 0; i < Object.keys(obj.entities).length; i++)
	            {
	        	    console.log('entity [ '+i+' ] '+obj.entities[i].entity);
	        	    console.log('entity [ '+i+' ] '+obj.entities[i].type);
	        	    param += "'"+obj.entities[i].type+"',";
	        	    matchCnt++;
                }



                console.log('param : ' + param.substr(0, param.length - 1));

                query += "select                                        						    ";
                //query += "		Rely.AnswerSN,                          						    ";
                //query += "		count(Rely.AnswerSN) AS CNT ,           						    ";
                query += "		min(Ans.AnswerValue) AS ANSWERVALUE,							    ";
                query += "		(convert(float,(count(Rely.AnswerSN)))/" + matchCnt + ")*100 PER	";
                query += "  from RelationList Rely, AnswerList Ans, EntityList Ent      		    ";
                query += "  where Ent.EntityValue in (" + param.substr(0, param.length - 1) + ") 	";
                query += "    and rely.AnswerSN = Ans.AnswerSN          						    ";
                query += "    and rely.EntitySN = Ent.EntitySN          						    ";
                query += "  group by Rely.AnswerSN                      						    ";
                query += "  having (count(Rely.AnswerSN)) >= 2                     				    ";
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