var Api = (function() {
    function sendProxyRequest(url, method, headers, body) {
        var proxyUrl = '/api/proxy';

        var processedBody = body;
        var processedHeaders = Object.assign({}, headers);

        if (body instanceof FormData) {
            var formDataObj = {};
            for (var pair of body.entries()) {
                formDataObj[pair[0]] = pair[1];
            }
            processedBody = {
                __type: 'FormData',
                data: formDataObj
            };
            var newHeaders = {};
            for (var key in processedHeaders) {
                if (key.toLowerCase() !== 'content-type') {
                    newHeaders[key] = processedHeaders[key];
                }
            }
            processedHeaders = newHeaders;
        }

        var proxyData = {
            url: url,
            method: method,
            headers: processedHeaders,
            body: processedBody
        };

        return fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proxyData)
        });
    }

    function replaceParams(obj, params) {
        if (Array.isArray(obj)) {
            return obj.map(function(item) { return replaceParams(item, params); });
        } else if (obj && typeof obj === 'object') {
            var result = {};
            for (var key in obj) {
                result[key] = replaceParams(obj[key], params);
            }
            return result;
        } else if (typeof obj === 'string') {
            var result = obj;
            for (var key in params) {
                var regex = new RegExp('\\$\\{' + key + '\\}', 'g');
                result = result.replace(regex, params[key]);
            }
            return result;
        }
        return obj;
    }

    function getCountryTime() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');
        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }

    function extractToken(responseData) {
        if (!responseData || typeof responseData !== 'object') return null;

        if (responseData.tempToken) return responseData.tempToken;
        if (responseData.data && responseData.data.tempToken) return responseData.data.tempToken;
        if (responseData.sessionid) return responseData.sessionid;
        if (responseData.token) return responseData.token;
        if (responseData.data && responseData.data.token) return responseData.data.token;
        if (responseData.authtoken) return responseData.authtoken;
        if (responseData.data && responseData.data.authtoken) return responseData.data.authtoken;
        if (responseData.data && typeof responseData.data === 'string') return responseData.data;
        if (responseData.Authtoken) return responseData.Authtoken;
        if (responseData.authToken) return responseData.authToken;
        if (responseData.data && responseData.data.sessionid) return responseData.data.sessionid;
        if (responseData.data && responseData.data.sessionId) return responseData.data.sessionId;
        if (responseData.sessionId) return responseData.sessionId;

        function findToken(obj) {
            if (!obj || typeof obj !== 'object') return null;
            for (var key in obj) {
                var lowerKey = key.toLowerCase();
                if (lowerKey.includes('token') || lowerKey.includes('session')) {
                    if (typeof obj[key] === 'string') {
                        console.log('找到可能的token字段: ' + key + ' = ' + obj[key]);
                        return obj[key];
                    }
                }
                var found = findToken(obj[key]);
                if (found) return found;
            }
            return null;
        }

        return findToken(responseData);
    }

    function isMultipartFormData(countryConfig) {
        return countryConfig.headers &&
            Object.keys(countryConfig.headers).some(function(key) {
                return key.toLowerCase() === 'content-type' &&
                    countryConfig.headers[key].includes('multipart/form-data');
            });
    }

    function buildRequestHeaders(countryConfig, authToken) {
        var requestHeaders = {};
        var isMultipart = isMultipartFormData(countryConfig);

        for (var key in countryConfig.headers) {
            var lowerKey = key.toLowerCase();
            if (lowerKey !== 'content-type') {
                requestHeaders[key] = countryConfig.headers[key];
            }
        }

        if (!isMultipart) {
            requestHeaders['Content-Type'] = 'application/json';
        }

        if (authToken) {
            if (countryConfig.name === '菲律宾' || countryConfig.englishName === 'Philippines') {
                requestHeaders['token'] = authToken;
                if (!requestHeaders['App-Version']) requestHeaders['App-Version'] = '3.1.9.11';
                if (!requestHeaders['App-Platform']) requestHeaders['App-Platform'] = '.outfield.';
                if (!requestHeaders['devicefrom']) requestHeaders['devicefrom'] = 'android';
            } else {
                requestHeaders['authtoken'] = authToken;
            }
        }

        return requestHeaders;
    }

    function buildRequestBody(requestBody, countryConfig) {
        var isMultipart = isMultipartFormData(countryConfig);

        if (isMultipart) {
            var formData = new FormData();
            if (requestBody.parameter) {
                formData.append('parameter', JSON.stringify(requestBody.parameter));
            } else {
                function appendToFormData(data, prefix) {
                    prefix = prefix || '';
                    if (data && typeof data === 'object' && !Array.isArray(data)) {
                        for (var key in data) {
                            var newPrefix = prefix ? prefix + '[' + key + ']' : key;
                            appendToFormData(data[key], newPrefix);
                        }
                    } else if (Array.isArray(data)) {
                        data.forEach(function(item, index) {
                            var newPrefix = prefix ? prefix + '[' + index + ']' : index;
                            appendToFormData(item, newPrefix);
                        });
                    } else if (data !== null && data !== undefined) {
                        formData.append(prefix, String(data));
                    }
                }
                appendToFormData(requestBody);
            }
            return formData;
        }

        return requestBody;
    }

    return {
        sendProxyRequest: sendProxyRequest,
        replaceParams: replaceParams,
        getCountryTime: getCountryTime,
        extractToken: extractToken,
        isMultipartFormData: isMultipartFormData,
        buildRequestHeaders: buildRequestHeaders,
        buildRequestBody: buildRequestBody
    };
})();
