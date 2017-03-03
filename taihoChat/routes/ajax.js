var request = require('request');
var weatherClient = require('../wunderground-client');

var Connection = require('tedious').Connection;
var Request = require('tedious').Request;  
var TYPES = require('tedious').TYPES; 
var query ="";

var config = {
		server:'faxtimedb.database.windows.net',
		userName:'faxtime',
		password:'test2016!',
		options: {encrypt:true, database:'taihoML'}
};


exports.ajax = function(req, res){
	console.log('req:' + req.body.msg);
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
		    qs: {'q': req.body.msg}
		}
	
	request(options, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        // Print out the response body
	        console.log(JSON.stringify(body));
	        var obj = JSON.parse(body);
	        var param = "";
	        var matchCnt = 0;
	        
	        console.log('INTENT : '+obj.topScoringIntent.intent);
	        for(var i = 0; i < Object.keys(obj.entities).length; i++)
	        {
	        	console.log('entity [ '+i+' ] '+obj.entities[i].entity);
	        	console.log('entity [ '+i+' ] '+obj.entities[i].type);
	        	param += "'"+obj.entities[i].type+"',";
	        	matchCnt++;
	        }
	        
	        console.log('param : '+param.substr(0, param.length -1));

	        
	        
	        var connection = new Connection(config);
	        connection.on('connect', function(err){
	        	console.log('Connected');
	        	executeStatement(); 
	        });
			
				query += "select                                        						";
				query += "		Rely.AnswerSN,                          						";
				query += "		count(Rely.AnswerSN) AS CNT ,           						";
				query += "		min(Ans.AnswerValue) AS ANSWERVALUE,							";
				query += "		(convert(float,(count(Rely.AnswerSN)))/"+matchCnt+")*100 PER	";
				query += "  from RelationList Rely, AnswerList Ans, EntityList Ent      		";
				query += "  where Ent.EntityValue in ("+param.substr(0, param.length -1)+") 	";
				query += "    and rely.AnswerSN = Ans.AnswerSN          						";
				query += "    and rely.EntitySN = Ent.EntitySN          						";
				query += "  group by Rely.AnswerSN                      						";
				query += "  having (count(Rely.AnswerSN)) >= 2                     				";
				query += "  order by CNT desc;													";
				
				
			function executeStatement(){
				var requests = new Request(query , function(err){
					if(err){
						console.log('ERROR : '+ err);
					}
				});
				
				var result = "";
				var jsonArray = [];
				requests.on('row', function(columns){
					var obj = {};
					columns.forEach(function(column){
						if(column.value === null){
							console.log('NULL');
						}else{
							console.log(column.value);
							result+=column.value + " ";
							obj[column.metadata.colName] = column.value;
						}
					});
					jsonArray.push(obj);
					console.log(result);
					console.log(jsonArray);
					//res.send(jsonArray);
					result = "";
				});
				requests.on('done', function(rowCount, more) {  
		        console.log(rowCount + ' rows returned');  
		        });  

				connection.execSql(request);
			}
	
	    }
	});

};