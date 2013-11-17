css-fitness
===========

Helps you keep your CSS fit and healthy by removing unused parts.

What does it do?
----------------

css-fitness does the following:

1. Crawl your website
2. Load your web pages with `phantomjs` and check each CSS rule individually, removing those that are unused
3. Merge the outputs of the previous step
4. Minify the result using `clean-css`

Parameters:

* Hostname of your site
* Paths of pages to crawl (if not specified, it will crawl the whole site)
* Which CSS you want to make healthier
* Which CSS selectors you want it to leave alone

Limitations
-----------

css-fitness will analyze your pages with `phantomjs` after the page is fully loaded.

**However**, it can't take into account those elements that are created after page load (eg. via user interaction).
This might be fixed in the future.


