
// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

var phantom = require('node-phantom');
var fs = require('fs');
var cssParse = require('css-parse');

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
            page.evaluateAsync(function() {
                console.log("running inside page.evaluateAsync");
                
                // Runs a function when the document is ready
                function onrdy(cb) {
                    if (document.readyState !== "complete") {
                        setTimeout(onrdy, 500);
                        return;
                    }
                    cb();
                }
                
                // Parses and compresses a CSS style rule
                var parseCssStyleRule = function(rule) {
                    // Check parameters
                    if (!(rule instanceof CSSStyleRule)) {
                        throw new Error("parseCssStyleRule: Invalid argument: rule");
                    }
                    
                    // Body text of the rule
                    var ruleBody = rule.cssText.substr(rule.selectorText.length);
                    // Array of selectors in the selector text
                    var allSelectors = rule.selectorText.split(',');
                    // Array of selectors actually used from the selector text
                    var usedSelectors = [];
                    
                    // Let's iterate through each of the selectors and see which one is actually used
                    for (var i = allSelectors.length; i--; ) {
                        var selector = allSelectors[i];
                        var queriedSelector = selector;
                        var colonIndex = selector.indexOf(':');
                        if (colonIndex >= 0) {
                            queriedSelector = selector.substr(0, colonIndex);
                        }
                        
                        try {
                            // Find all nodes that match the selector
                            nodes = document.querySelectorAll(queriedSelector);
                        }
                        catch (err) {
                            // querySelectorAll fails for some special rules, let's just skip and keep them intact
                            usedSelectors.push(selector);
                        }
                        
                        if (nodes.length > 0) {
                            usedSelectors.push(selector);
                        }
                    }
                    
                    if (usedSelectors.length === 0) {
                        // If none of the selectors were used, return empty string
                        return "";
                    }
                    
                    // Create compressed selector from the actual list of selectors
                    var compressedSelector = usedSelectors.join(',');
                    // Return the complete, compressed CSS rule
                    return compressedSelector + " " + ruleBody + " ";
                };
                
                // Parses and compresses a CSS media rule
                var parseCssMediaRule = function(rule) {
                    // Check parameters
                    if (!(rule instanceof CSSMediaRule)) {
                        throw new Error("parseCssMediaRule: Invalid argument: rule");
                    }
                    
                    // The compressed body of the media rule
                    var compressedBody = "";
                    
                    for (var i = rule.cssRules.length; i--; ) {
                        compressedBody += parseCssRule(rule.cssRules[i]);
                    }
                    
                    if (compressedBody === "") {
                        // If none of the rules in the media rule are used, this media rule is not needed at all
                        return "";
                    }
                    
                    var conditionText = rule.conditionText || rule.media.mediaText;
                    if (!conditionText) {
                        conditionText = rule.cssText.substr(0, rule.indexOf('{'));
                    }
                    else {
                        conditionText = "@media (" + conditionText + ") "
                    }
                    
                    return conditionText + " { " + compressedBody + " } ";
                };
                
                // Parses and compresses any CSS rule by calling the appropriate function
                var parseCssRule = function(rule) {
                    if (rule instanceof CSSStyleRule) {
                        return parseCssStyleRule(rule);
                    }
                    else if (rule instanceof CSSMediaRule) {
                        return parseCssMediaRule(rule);
                    }
                    else {
                        return rule.cssText || "";
                    }
                    // TODO: create a function that parses a CSSFontFaceRule and removes it if the font is not used on the page
                };
                
                // Run on document ready
                onrdy(function() {
                    try {
                        // The result object
                        var result = {
                            compressed: "",
                            originalLength: 0
                        };
                        // Inspected style sheet of the document
                        var s = document.styleSheets[0];
                        // TODO: what if the document has no style sheets?
                        // TODO: make the style sheet to parse a parameter
                        
                        // Go through each CSS rule and parse
                        for (var i = s.cssRules.length; i--; ) {
                            var rule = s.cssRules[i];
                            result.originalLength += rule.cssText.length;
                            result.compressed += parseCssRule(rule);
                        }
                        
                        // Tell the result to node and then exit
                        window.callPhantom(result);
                        window.callPhantom("exitnow");
                    }
                    catch (err) {
                        // Tell that there was an error and then exit
                        window.callPhantom({ error: true });
                        window.callPhantom("exitnow");
                    }
                });
            }, function (err) {
                if (err) {
                    console.log("page.evaluateAsync failed", err);
                    ph.exit();
                    return;
                }
            });
        });
    });
});


