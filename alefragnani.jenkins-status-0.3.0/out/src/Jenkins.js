'use strict';
var request = require('request');
(function (BuildStatus) {
    BuildStatus[BuildStatus["Sucess"] = 0] = "Sucess";
    BuildStatus[BuildStatus["Failed"] = 1] = "Failed";
    BuildStatus[BuildStatus["Disabled"] = 2] = "Disabled";
})(exports.BuildStatus || (exports.BuildStatus = {}));
var BuildStatus = exports.BuildStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Connected"] = 0] = "Connected";
    ConnectionStatus[ConnectionStatus["InvalidAddress"] = 1] = "InvalidAddress";
    ConnectionStatus[ConnectionStatus["AuthenticationRequired"] = 2] = "AuthenticationRequired";
    ConnectionStatus[ConnectionStatus["Error"] = 3] = "Error";
})(exports.ConnectionStatus || (exports.ConnectionStatus = {}));
var ConnectionStatus = exports.ConnectionStatus;
/**s
 * colorToBuildStatus
 */
function colorToBuildStatus(color) {
    switch (color) {
        case "blue":
            return BuildStatus.Sucess;
        case "blue_anime":
            return BuildStatus.Sucess;
        case "red":
            return BuildStatus.Failed;
        case "red_anime":
            return BuildStatus.Failed;
        default:
            return BuildStatus.Disabled;
    }
}
exports.colorToBuildStatus = colorToBuildStatus;
function colorToBuildStatusName(color) {
    switch (color) {
        case "blue":
            return 'Sucess';
        case "blue_anime":
            return 'Sucess';
        case "red":
            return 'Failed';
        case "red_anime":
            return 'Failed';
        default:
            return 'Disabled';
    }
}
exports.colorToBuildStatusName = colorToBuildStatusName;
function getConnectionStatusName(status) {
    switch (status) {
        case ConnectionStatus.Connected:
            return 'Connected';
        case ConnectionStatus.InvalidAddress:
            return 'Invalid Address';
        case ConnectionStatus.Error:
            return 'Error';
        default:
            return 'Authentication Required';
    }
}
exports.getConnectionStatusName = getConnectionStatusName;
var Jenkins = (function () {
    function Jenkins() {
    }
    Jenkins.prototype.getStatus = function (url) {
        return new Promise(function (resolve, reject) {
            var data = '';
            var statusCode;
            var result;
            request
                .get(url + '/api/json')
                .on('response', function (response) {
                statusCode = response.statusCode;
            })
                .on('data', function (chunk) {
                data += chunk;
            })
                .on('end', function () {
                switch (statusCode) {
                    case 200:
                        var myArr = JSON.parse(data);
                        result = {
                            jobName: myArr.displayName,
                            url: myArr.url,
                            status: colorToBuildStatus(myArr.color),
                            statusName: colorToBuildStatusName(myArr.color),
                            buildNr: myArr.lastBuild.number,
                            connectionStatus: ConnectionStatus.Connected,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.Connected)
                        };
                        resolve(result);
                        break;
                    case 403:
                        result = {
                            jobName: 'AUTENTICATION NEEDED',
                            url: url,
                            status: BuildStatus.Disabled,
                            statusName: 'Disabled',
                            buildNr: statusCode,
                            connectionStatus: ConnectionStatus.AuthenticationRequired,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.AuthenticationRequired)
                        };
                        resolve(result);
                        break;
                    default:
                        result = {
                            jobName: 'Invalid URL',
                            url: url,
                            status: BuildStatus.Disabled,
                            statusName: 'Disabled',
                            buildNr: statusCode,
                            connectionStatus: ConnectionStatus.InvalidAddress,
                            connectionStatusName: getConnectionStatusName(ConnectionStatus.InvalidAddress)
                        };
                        resolve(result);
                        break;
                }
            })
                .on('error', function (err) {
                result = {
                    jobName: err.toString(),
                    url: url,
                    status: BuildStatus.Disabled,
                    statusName: 'Disabled',
                    buildNr: err.code,
                    connectionStatus: ConnectionStatus.Error,
                    connectionStatusName: getConnectionStatusName(ConnectionStatus.Error)
                };
                resolve(result);
            });
        });
    };
    return Jenkins;
}());
exports.Jenkins = Jenkins;
//# sourceMappingURL=Jenkins.js.map