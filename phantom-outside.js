

(function(exports) {

    var phantom = require('node-phantom');
    var phantomInside = require('./phantom-inside');
    
    var analyzePage = function() {
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
                return page.open("http://localhost:7002/", function(err, status) {
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
                        if (result.compressed) {
                            console.log("result compressed successfully.");
                            console.log("original length:", result.originalLength, "compressed length:", result.compressed.length);
                        }
                        else {
                            console.log("CB: ", result);
                        }
                    };
                    page.evaluateAsync(phantomInside.runOnPageOpened, function (err) {
                        if (err) {
                            console.log("page.evaluateAsync failed", err);
                            ph.exit();
                            return;
                        }
                    });
                });
            });
        });
        
    };
    
    exports.analyzePage = analyzePage; 
    
})(module.exports);
