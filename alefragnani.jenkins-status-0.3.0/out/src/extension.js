'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var path = require('path');
var fs = require('fs');
var JenkinsIndicator = require('./JenkinsIndicator');
var Jenkins_1 = require('./Jenkins');
var open = require('open');
function activate(context) {
    var jenkinsIndicator;
    var hasJenkinsInRoot;
    hasJenkinsInRoot = vscode.workspace.rootPath && fs.existsSync(path.join(vscode.workspace.rootPath, '.jenkins'));
    if (hasJenkinsInRoot) {
        jenkinsIndicator = new JenkinsIndicator.JenkinsIndicator();
        var jenkinsController = new JenkinsIndicator.JenkinsIndicatorController(jenkinsIndicator);
        context.subscriptions.push(jenkinsController);
        context.subscriptions.push(jenkinsIndicator);
    }
    var dispUpdateStatus = vscode.commands.registerCommand('jenkins.updateStatus', function () { return updateStatus(); });
    context.subscriptions.push(dispUpdateStatus);
    var dispOpenInJenkins = vscode.commands.registerCommand('jenkins.openInJenkins', function () {
        if (!hasJenkinsInRoot) {
            vscode.window.showWarningMessage('The project is not enabled for Jenkins. Missing .jenkins file.');
        }
        else {
            var settings = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath, '.jenkins')).toString());
            open(settings.url);
        }
    });
    context.subscriptions.push(dispOpenInJenkins);
    var dispOpenInJenkinsConsoleOutput = vscode.commands.registerCommand('jenkins.openInJenkinsConsoleOutput', function () {
        if (!hasJenkinsInRoot) {
            vscode.window.showWarningMessage('The project is not enabled for Jenkins. Missing .jenkins file.');
        }
        else {
            var settings = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath, '.jenkins')).toString());
            var status = void 0;
            status = jenkinsIndicator.getCurrentStatus();
            if (status.status != Jenkins_1.BuildStatus.Disabled) {
                open(settings.url + status.buildNr.toString() + '/console');
            }
            else {
                vscode.window.showWarningMessage('The Jenkins job has some connnection issues. Please check the status bar for more information.');
            }
        }
    });
    context.subscriptions.push(dispOpenInJenkinsConsoleOutput);
    function updateStatus() {
        if (!hasJenkinsInRoot) {
            vscode.window.showWarningMessage('The project is not enabled for Jenkins. Missing .jenkins file.');
        }
        else {
            jenkinsIndicator.updateJenkinsStatus();
        }
    }
    ;
    var interval;
    var polling = vscode.workspace.getConfiguration('jenkins').get('polling', 0);
    if (polling > 0) {
        setInterval(updateStatus, polling * 60000);
    }
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map