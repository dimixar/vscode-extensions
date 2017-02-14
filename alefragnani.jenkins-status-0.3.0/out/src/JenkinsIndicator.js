'use strict';
var vscode = require('vscode');
var fs = require('fs');
var Jenkins = require('./Jenkins');
var path = require('path');
var JenkinsIndicator = (function () {
    function JenkinsIndicator() {
        this.currentStatus = {};
    }
    JenkinsIndicator.prototype.dispose = function () {
        this.hideReadOnly();
    };
    JenkinsIndicator.prototype.updateJenkinsStatus = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Create as needed
            if (!_this.statusBarItem) {
                _this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
            }
            var jjj;
            jjj = new Jenkins.Jenkins;
            var url;
            var settings = JSON.parse(fs.readFileSync(path.join(vscode.workspace.rootPath, '.jenkins')).toString());
            url = settings.url;
            // invalid URL
            if (!url) {
                _this.statusBarItem.tooltip = 'No URL Defined';
                _this.statusBarItem.text = 'Jenkins $(x)';
                _this.statusBarItem.show();
                _this.currentStatus = {};
                resolve(true);
                return;
            }
            jjj.getStatus(url)
                .then(function (status) {
                var icon;
                _this.currentStatus = status;
                switch (status.status) {
                    case Jenkins.BuildStatus.Sucess:
                        icon = ' $(check)';
                        _this.statusBarItem.tooltip =
                            'Job Name: ' + status.jobName + '\n' +
                                'URL.....: ' + status.url + '\n' +
                                'Build #.: ' + status.buildNr;
                        break;
                    case Jenkins.BuildStatus.Failed:
                        icon = ' $(x)';
                        if (status.connectionStatus == Jenkins.ConnectionStatus.AuthenticationRequired) {
                            _this.statusBarItem.tooltip =
                                'Job Name: ' + status.jobName + '\n' +
                                    '<<Authenthication Required>>';
                        }
                        else {
                            _this.statusBarItem.tooltip =
                                'Job Name: ' + status.jobName + '\n' +
                                    '<<Invalid Address>>';
                        }
                        break;
                    default:
                        icon = ' $(stop)';
                        _this.statusBarItem.tooltip =
                            'Job Name: ' + status.jobName + '\n' +
                                'URL.....: ' + status.url + '\n' +
                                'Build #.: ' + status.buildNr;
                }
                _this.statusBarItem.text = 'Jenkins' + icon;
                _this.statusBarItem.show();
                resolve(status != undefined);
            });
        });
    };
    JenkinsIndicator.prototype.hideReadOnly = function () {
        if (this.statusBarItem) {
            this.statusBarItem.dispose();
        }
    };
    JenkinsIndicator.prototype.getCurrentStatus = function () {
        return this.currentStatus;
    };
    return JenkinsIndicator;
}());
exports.JenkinsIndicator = JenkinsIndicator;
var JenkinsIndicatorController = (function () {
    function JenkinsIndicatorController(indicator) {
        this._isControlled = false;
        var myself = this;
        this.jenkinsIndicator = indicator;
        this.jenkinsIndicator.updateJenkinsStatus();
    }
    JenkinsIndicatorController.prototype.dispose = function () {
        this.disposable.dispose();
    };
    JenkinsIndicatorController.prototype.onEvent = function () {
        this.jenkinsIndicator.updateJenkinsStatus();
    };
    return JenkinsIndicatorController;
}());
exports.JenkinsIndicatorController = JenkinsIndicatorController;
//# sourceMappingURL=JenkinsIndicator.js.map