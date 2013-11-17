
// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

(function(exports) {

    var assert = require('assert');
    var phantom = require('node-phantom');
    var phantomInside = require('./phantom-inside');
    
    var analyzePage = function(options) {
        assert(typeof(options) === "object", "analyzePage: options (the first parameter) is not specified");
        assert(typeof(options.onCompleted) === "function", "analyzePage: You should provide a callback: options.onCompleted should be a function");
        assert(typeof(options.onError) === "function", "analyzePage: You should provide a callback: options.onError should be a function");
        assert(typeof(options.url) === "string" && options.url, "analyzePage: options.url is not specified");
    
        console.log("phantom.create ...");
        phantom.create(function(err, ph) {
            if (err) {
                console.log("phantom.create failed", err);
                if (ph && typeof(ph.exit) === "function") {
                    ph.exit();
                }
                return null;
            }

            console.log("ph.createPage ...");
            return ph.createPage(function(err,page) {
                if (err) {
                    console.log("ph.createPage failed", err);
                    ph.exit();
                    return null;
                }
            
                console.log("page.open ...");
                return page.open(options.url, function(err, status) {
                    if (err) {
                        console.log("page.open failed", err);
                        ph.exit();
                        return null;
                    }
                    if (status !== "success") {
                        console.log("page.open status is not success", err);
                        ph.exit();
                        return null;
                    }
                    
                    console.log("page.evaluate ...");
                    page.onCallback = function(result) {
                        if (result === "exitnow") {
                            ph.exit();
                            return;
                        }
                        else if (result.compressed) {
                            ph.exit();
                            options.onCompleted(result);
                        }
                        else if (result.error) {
                            ph.exit();
                            options.onError(result.errObj);
                        }
                        else {
                            console.log("CB: ", result);
                        }
                    };
                    page.evaluateAsync(phantomInside.runOnPageOpened, function (err) {
                        if (err) {
                            console.log("page.evaluateAsync failed", err);
                            ph.exit();
                            options.onError(err);
                        }
                    });
                });
            });
        });
        
    };
    
    exports.analyzePage = analyzePage; 
    
})(module.exports);

