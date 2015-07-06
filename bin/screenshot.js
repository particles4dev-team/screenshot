var number = urls[urls.length - 1];
var page = require("webpage").create();
//viewportSize being the actual size of the headless browser
page.viewportSize = { width: "100%", height: "100%" };
//the clipRect is the portion of the page you are taking a screenshot of
page.clipRect = { top: 0, left: 0, width: "100%", height: "100%" };
page.open(url, process);
function process(){
    page.render("screenshot" + number + ".png");
    phantom.exit();
};
