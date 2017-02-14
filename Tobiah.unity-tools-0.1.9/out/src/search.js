"use strict";
var unity_search = "http://docs.unity3d.com/ScriptReference/30_search.html";
var unity_search_url = unity_search + "?q=";
var msdn_search = "https://social.msdn.microsoft.com/search/";
var msdn_search_url = msdn_search + "?query=";
//Open a URL using the npm module "open"
var open = require("open");
function openURL(search_base, s) {
    if (search_base == "open") {
        open(s);
    }
    else {
        var search_blank_url, search_url;
        if (search_base == "unity") {
            search_blank_url = unity_search;
            search_url = unity_search_url;
        }
        else if (search_base == "msdn") {
            search_blank_url = msdn_search;
            search_url = msdn_search_url;
        }
        if (!s) {
            s = search_blank_url;
        }
        else {
            s = search_url + s;
        }
        open(s);
    }
    return true;
}
exports.openURL = openURL;
// Slice and Trim
function prepareInput(input, start, end) {
    //input is the whole line, part of which is selected by the user (defined by star/end) 
    if (start >= end) {
        return "";
    }
    //Slice to just the selection
    input = input.slice(start, end);
    //Trim white space
    input = input.trim();
    //Possible future addition:
    //Check right here if valid variable/function name to search?
    //Everything looks good by this point, so time to open a web browser!
    return input;
}
exports.prepareInput = prepareInput;
function openUnityDocs(input, start, end) {
    //Use the node module "open" to open a web browser
    openURL("unity", prepareInput(input, start, end));
}
exports.openUnityDocs = openUnityDocs;
//# sourceMappingURL=search.js.map