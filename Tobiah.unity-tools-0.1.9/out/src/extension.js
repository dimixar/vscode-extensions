"use strict";
var vscode = require('vscode');
var search = require('./search');
var directories = require('./directories');
var fs = require('fs');
function openDocErrorMessage(str) {
    return vscode.window.showErrorMessage("Error: " + str, "Open Docs").then(function (item) {
        if (item === "Open Docs") {
            search.openURL("unity");
        }
    });
}
function activate(context) {
    //Tell the user the extension has been activated.
    console.log('Unity Tools extension is now active!');
    // Open Unity Documentation, when you already have something you want to search selected
    var open_docs = vscode.commands.registerTextEditorCommand("unity-tools.OpenDocs", function (textEditor, edit) {
        // selection[0] is the start, and selection[1] is the end
        var selection = textEditor.selection;
        if (!selection.isSingleLine) {
            openDocErrorMessage("Multiple lines selected, please just select a class.");
            return;
        }
        var range = undefined;
        if (!selection.isEmpty) {
            // selection is not empty, get text from it
            range = new vscode.Range(selection.start, selection.end);
        }
        else {
            // selection is empty, get any word at cursor
            range = textEditor.document.getWordRangeAtPosition(selection.active);
        }
        if (range == undefined) {
            openDocErrorMessage("Nothing is selected. Please select a class, or use \"Search Documentation\" instead!");
            return;
        }
        search.openUnityDocs(textEditor.document.lineAt(range.start.line).text, range.start.character, range.end.character);
    });
    context.subscriptions.push(open_docs);
    var search_docs = vscode.commands.registerCommand("unity-tools.SearchDocs", function () {
        vscode.window.showInputBox({
            prompt: "Search Unity Documentation:"
        }).then(function (result) {
            if (result != undefined) {
                //Use the node module "open" to open a web browser
                search.openURL("unity", result);
            }
        });
    });
    context.subscriptions.push(search_docs);
    var search_docs = vscode.commands.registerCommand("unity-tools.SearchMSDNDocs", function () {
        vscode.window.showInputBox({
            prompt: "Search MSDN Documentation:"
        }).then(function (result) {
            if (result != undefined) {
                //Use the node module "open" to open a web browser
                search.openURL("msdn", result);
            }
        });
    });
    context.subscriptions.push(search_docs);
    var open_vscode_docs = vscode.commands.registerCommand("unity-tools.OpenVSCodeDocs", function () {
        // Using OpenURL from search to open VS Documentation.
        // Passing "true" to open the URL directly (instead of searching Unity docs)
        search.openURL("open", "https://code.visualstudio.com/Docs/runtimes/unity");
    });
    context.subscriptions.push(open_vscode_docs);
    var get_assetstore_plugin = vscode.commands.registerCommand("unity-tools.GetAssetStorePlugin", function () {
        search.openURL("open", "http://u3d.as/jmM");
        return vscode.window.showErrorMessage("Add to your Unity project, and remember check \"Enable Integration\"", "How To", "Git").then(function (item) {
            if (item === "How To") {
                // Using OpenURL from search to open Unity plug-in Documentation in git repo.
                search.openURL("open", "https://github.com/dotBunny/VSCode/blob/master/HOWTO.pdf");
            }
            else if (item === "Git") {
                // Using OpenURL from search to open Unity plug-in git repo.
                search.openURL("open", "https://github.com/dotBunny/VSCode/");
            }
        });
    });
    context.subscriptions.push(get_assetstore_plugin);
    var create_Directories = vscode.commands.registerCommand("unity-tools.CreateDirectories", function () {
        var rootPath = vscode.workspace.rootPath;
        if (rootPath != undefined) {
            fs.stat(rootPath, function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    vscode.window.showErrorMessage("You do not have access or permission to this file on the hard drive.");
                }
                else if (stats.isDirectory()) {
                    var rootPath = vscode.workspace.rootPath + '/Assets/';
                    //path exists
                    fs.stat(rootPath, function (err, stats) {
                        if (err && err.code === 'ENOENT') {
                            // The folder does not exist
                            vscode.window.showErrorMessage("Could not find an Assets Folder in the current workspace of VSCode. Please open the Unity root folder of the project you are working on.");
                        }
                        else if (err) {
                            vscode.window.showErrorMessage("Something went wrong while checking Assets folder existence: " + err);
                        }
                        else if (stats.isDirectory()) {
                            // Folder exists! Generate default folders. 
                            var settings = vscode.workspace.getConfiguration('unity');
                            var folderList = settings.get('defaultOrganizationFolders', [
                                "Materials",
                                "Scenes",
                                "Scripts",
                                "Prefabs",
                                "Audio"
                            ]);
                            directories.GenerateOrganizationFolders(rootPath, folderList);
                            vscode.window.showInformationMessage("Folders generated sucessfully");
                        }
                    });
                }
            });
        }
        else {
            vscode.window.showErrorMessage("You do not have a workspace open in VSCode. Please 'Open Folder' to the root folder of a desired Unity Project.");
        }
    });
    context.subscriptions.push(create_Directories);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map