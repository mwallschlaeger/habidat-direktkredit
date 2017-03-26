var DocxGen = require('docxtemplater');
var JSZipUtils = require('jszip');
var fs = require('fs');
var moment = require('moment');
var projects    = require('../config/projects.json');
var cloudconvert = new (require('cloudconvert'))('oqxW0tKE_7gykv8GDULnAcRTv50QTqMtIPbFBtVzgQFUQe2VridmQ7czMIGtccFwO0ZvsyMNV-6IB4qXxWSo_g');

var json2csv = require('json2csv');


exports.generateDocx = function(templateFile, outputFile, data, project){
	var path = projects[project].templates;
	var file = fs.readFileSync(__dirname + '/..' + path + "/" + templateFile + ".docx", 'binary');
		var zip = new JSZipUtils(file);
        var doc=new DocxGen(zip);
        doc.setData(data); 
        doc.render();
        var out=doc.getZip().generate({type:"nodebuffer"});
        fs.writeFileSync("./tmp/"+ outputFile +".docx", out);
        console.log("done");
};

exports.convertToPdf = function(file, callback){
	
	fs.createReadStream("./tmp/" + file + ".docx")
	.pipe(cloudconvert.convert({
	    inputformat: 'docx',
	    outputformat: 'pdf'
	 }))
	.pipe(fs.createWriteStream("./tmp/" + file + ".pdf")
	.on('finish', function() {
	    callback(null);
	})
	.on('error', function(err) {
		callback(err);
	}));

};

exports.generateTransactionList = function(transactionList, outputFile){

	var fieldNames = ["Nachname", "Vorname", "Vertragsnummer", "Vorgang", "Datum", "Betrag", "Zinssatz", "Zinsbetrag"];
	var fieldList = ['last_name', 'first_name','contract_id', 'type', 'date', 'amount', 'interest_rate', 'interest'];
	var csvRet;
	json2csv({ data: transactionList, fieldNames: fieldNames, fields: fieldList }, function(err, csv) {
		  if (err) console.log(err);
		  csvRet = csv;
		});
	return csvRet;
};
