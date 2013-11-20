[![Build Status](https://secure.travis-ci.org/Venemo/css-fitness.png)](https://travis-ci.org/Venemo/css-fitness)

css-fitness
===========

Keep your CSS fit and healthy!

If you want to squeeze out that last drop of performance on your site, this is for you.

`css-fitness` helps you exactly with that, by removing those CSS rules that happen to be in your CSS
but are not actually used by your site. This is done by a clever combination of `phantomjs` through `node-phantom`
and the excellent `clean-css` module.

What does it do?
----------------

It removes those rules from your CSS file that your web site doesn't actually use and then minifies the resulting CSS.

### Why is this better than just minifying?

Because it takes into account where exactly the CSS is used, not just compresses the CSS as-is.
Meaning: the output of `css-fitness` will **not** be equivalent to the input because unused
CSS selectors will be tossed out of it.

### How exactly does it work?

css-fitness does the following:

1. Load your site with `phantomjs` and crawl through it
2. Check each CSS rule against each page individually, removing those that are unused
3. Minify the result using `clean-css`

Parameters:

*  `hostname`: the hostname of your site without protocol, for example *mysite.com*
* Paths of pages to crawl (if not specified, it will crawl the whole site, but to a maximum of 100 pages by default)
* `cssHref`: the CSS you want to make healthier (webroot-relative URL starting with a `/`), for example */styles/mystyle.css*
* `keepIntact`: array of CSS selectors you want to leave alone, for example *[".myclass", "a"]*

Limitations
-----------

`css-fitness` will analyze your pages with `phantomjs` after the page is fully loaded.
**However**, it can't take into account those elements that are created after page load (eg. via user interaction).
You will need to specify those manually by using ṫhe `keepIntact` parameter.
(This might be fixed in the future.)
