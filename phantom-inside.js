// This file is part of css-fitness
// (C) 2013 Timur Kristóf
// -----
// Licensed to you under the terms of the MIT license.
// https://github.com/Venemo/css-fitness/blob/master/LICENSE

(function(exports) {

    var runOnPageOpened = function(options) {
        console.log("running inside page.evaluateAsync");

        // Get parameters
        var cssHref = options.cssHref || null;
        var keepIntact = options.keepIntact || null;

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
            var allSelectors = rule.selectorText.split(",");
            // Array of selectors actually used from the selector text
            var usedSelectors = [];

            // Let's iterate through each of the selectors and see which one is actually used
            for (var i = allSelectors.length; i--;) {
                var selector = allSelectors[i];
                var queriedSelector = selector;
                var colonIndex = selector.indexOf(":");
                var queryresult;

                if (colonIndex >= 0) {
                    // In case of pseudo-elements, just query the real element part
                    queriedSelector = selector.substr(0, colonIndex);
                }

                // If the selector is just a pseudo-element (nothing more), keep it intact
                // If this selector is specified to be kept intact, don't bother it
                if (queriedSelector === "" || queriedSelector === keepIntact || (keepIntact instanceof Array && keepIntact.indexOf(queriedSelector) >= 0)) {
                    queryresult = true;
                }

                if (!queryresult) {
                    try {
                        // Find nodes that match the selector
                        queryresult = document.querySelector(queriedSelector);
                    }
                    catch (err) {
                        // querySelector fails for some special rules, let's just skip and keep them intact
                        queryresult = true;
                    }
                }

                if (queryresult) {
                    usedSelectors.push(selector);
                }
            }

            if (usedSelectors.length === 0) {
                // If none of the selectors were used, return empty string
                //window.callPhantom("UNUSED RULE: " + rule.selectorText);
                return "";
            }

            // Create compressed selector from the actual list of selectors
            var compressedSelector = usedSelectors.join(",");
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

            for (var i = rule.cssRules.length; i--;) {
                compressedBody += parseCssRule(rule.cssRules[i]);
            }

            if (compressedBody === "") {
                // If none of the rules in the media rule are used, this media rule is not needed at all
                return "";
            }

            var conditionText = rule.conditionText || rule.media.mediaText;
            if (!conditionText) {
                conditionText = rule.cssText.substr(0, rule.indexOf("{"));
            }
            else {
                conditionText = "@media (" + conditionText + ") ";
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

                // Find the style sheet
                var s = null;
                for (var i = document.styleSheets.length; i--;) {
                    var styleSheet = document.styleSheets[i];

                    if (styleSheet.href === window.location.protocol + "//" + window.location.host + cssHref) {
                        s = styleSheet;
                        break;
                    }
                }

                if (!s) {
                    // If the style sheet is not found, return the empty result
                    window.callPhantom("stylesheet '" + cssHref + "' not found in '" + window.location.href + "'");
                    window.callPhantom(result);
                    return;
                }

                // Go through each CSS rule and parse
                for (var j = s.cssRules.length; j--;) {
                    var rule = s.cssRules[j];
                    result.originalLength += rule.cssText.length;
                    result.compressed += parseCssRule(rule);
                }

                // Thanks to this answer:
                // http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
                function escapeRegExp(str) {
                    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                }
                function replaceAll(find, replace, str) {
                    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
                }

                // Remove all references to current host, the URLs will be valid without it
                result.compressed = replaceAll(window.location.protocol + "//" + window.location.host, "", result.compressed);

                // Tell the result to node and then exit
                window.callPhantom(result);
            }
            catch (err) {
                // Tell that there was an error and then exit
                window.callPhantom({ error: true, errObj: err });
            }
        });
    };

    exports.runOnPageOpened = runOnPageOpened;

}(module.exports));
