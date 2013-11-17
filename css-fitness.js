
// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

var fs = require('fs');
var phantomOutside = require('./phantom-outside');
var CleanCSS = require('clean-css');

phantomOutside.analyzePage({
    url: "http://localhost:7002",
    cssHref: "/css/min.style.css",
    onCompleted: function(result) {
        console.log("page analyzed successfully.");
        
        var cleaner = new CleanCSS();
        result.compressed = cleaner.minify(result.compressed);
        
        console.log("CSS minified successfully.");
        console.log("saved space: " +  (100 - 100 * result.compressed.length / result.originalLength).toFixed(2) + "%");
        
        fs.writeFile(__dirname + "/fitness-output.css", result.compressed, function(err) {
            if (err) {
                console.log("Error while saving compressed CSS!");
            }
            else {
                console.log("Saved compressed CSS!");
            }
        });
    },
    onError: function(err) {
        console.log("error while running phantomjs", err);
    }
});





