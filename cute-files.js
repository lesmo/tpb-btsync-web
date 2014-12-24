#!/usr/bin/env node

var path = require('path');
var express = require('express');
var compression = require('compression');
var pkg = require( path.join(__dirname, 'package.json') );

var scan = require('./scan');


// Parse command line options

var program = require('commander');

program
	.version(pkg.version)
	.option('-p, --port <port>', 'Port on which to listen to (defaults to 3000)', parseInt)
	.parse(process.argv);

var port = program.port || 3000;


// Scan the directory in which the script was called. It will
// add the 'files/' prefix to all files and folders, so that
// download links point to our /files route

var tree = scan('.', 'Hail Hydra');


// Ceate a new express app

var app = express();

// Compress all requests

app.use(compression());

// Serve static files from the frontend folder

app.use('/', express.static(path.join(__dirname, 'frontend')));

// Serve files from the current directory under the /files route

app.use('/Hail%20Hydra', express.static(process.cwd(), {
	index: false
}));

// This endpoint is requested by our frontend JS

app.get('/scan', function(req,res){
	res.write(tree);
	res.flush();
});

// Re-scan folder every 5 minutes

var rescan = function() {
	tree = scan('.', 'Hail Hydra');
	setTimeout(rescan, 300000);
};
setTimeout(rescan, 300000);

// Everything is setup. Listen on the port.

app.listen(port);

console.log('Cute files is running on port ' + port);
