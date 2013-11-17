
// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

var phantomOutside = require('./phantom-outside');
phantomOutside.analyzePage({
    url: "http://localhost:7002",
    cssHref: "/css/min.style.css",
    onCompleted: function(result) {        
        console.log("result compressed successfully.");
        console.log("original length:", result.originalLength, "compressed length:", result.compressed.length);
    },
    onError: function(err) {
        console.log("error while running phantomjs", err);
    }
});





