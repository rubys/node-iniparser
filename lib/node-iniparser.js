/*
 * get the file handler
 */
var fs = require('fs');

/*
 * define the possible values:
 * section: [section]
 * param: key=value
 * comment: ;this is a comment
 */
var regex = {
	section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
	param: /^\s*(\w+)\s*[:=]\s*(.*)\s*$/,
	continuation: /\s+(.*)/,
	comment: /^\s*[#;].*$/
};

/*
 * parses a .ini file
 * @param: {String} file, the location of the .ini file
 * @param: {Function} callback, the function that will be called when parsing is done
 * @return: none
 */
module.exports.parse = function(file, callback){
	if(!callback){
		return;
	}
	fs.readFile(file, 'utf-8', function(err, data){
		if(err){
			callback(err);
		}else{
			callback(null, parse(data));
		}
	});
};

module.exports.parseSync = function(file){
	return parse(fs.readFileSync(file, 'utf-8'));
};

function parse(data){
	var value = {};
	var lines = data.split(/\r\n|\r|\n/);
	var section = 'DEFAULT';
	var optname = null;
	lines.forEach(function(line){
		if(regex.comment.test(line)){
			return;
		}else if(regex.param.test(line)){
			var match = line.match(regex.param);
			value[section][match[1]] = match[2];
			optname = match[1];
		}else if(regex.section.test(line)){
			var match = line.match(regex.section);
			value[match[1]] = {};
			section = match[1];
			optname = null;
		}else if(regex.continuation.test(line) && optname){
			var match = line.match(regex.continuation);
			value[section][optname] += "\n" + match[1];
		}else if(line.length == 0 && section){
			optname = null;
		};
	});
	return value;
}
