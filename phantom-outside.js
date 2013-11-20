// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

(function(exports) {

    var assert = require("assert");
    var phantom = require("node-phantom");
    var phantomInside = require("./phantom-inside");

    var analyzePage = function(options) {
        // options
        assert(typeof options === "object", "analyzePage: options (the first parameter) is not specified");
        // options.onCompleted is compulsory (otherwise this whole module is pointless)
        assert(typeof options.onCompleted === "function", "analyzePage: You should provide a callback: options.onCompleted should be a function");
        // options.onError is compulsory (to encourage correct error handling)
        assert(typeof options.onError === "function", "analyzePage: You should provide a callback: options.onError should be a function");
        // options.hostname is compulsory
        assert(typeof options.hostname === "string" && options.hostname, "analyzePage: options.hostname is not specified");
        // options.cssHref is compulsory
        assert(typeof options.cssHref === "string" && options.cssHref, "analyzePage: options.cssHref is not specified");
        // options.keepIntact should either be undefined, or a string, or an array
        assert(typeof options.keepIntact === "undefined" || typeof options.keepIntact === "string" && options.keepIntact || options.keepIntact instanceof Array, "analyzePage: options.keepIntact is invalid");

        console.log("phantom.create ...");
        phantom.create(function(err, ph) {
            if (err) {
                console.log("phantom.create failed", err);
                if (ph && typeof ph.exit === "function") {
                    ph.exit();
                }
                return null;
            }

            console.log("ph.createPage ...");
            return ph.createPage(function(err, page) {
                if (err) {
                    console.log("ph.createPage failed", err);
                    ph.exit();
                    return null;
                }

                console.log("page.open ...");
                return page.open("http://" + options.hostname, function(err, status) {
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
                        else if (result.hasOwnProperty("compressed")) {
                            ph.exit();
                            options.onCompleted(result);
                        }
                        else if (result.hasOwnProperty("error")) {
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
                    }, 0, { cssHref: options.cssHref, keepIntact: options.keepIntact });
                });
            });
        });

    };

    exports.analyzePage = analyzePage;

}(module.exports));
