var App = (function() {
    var currentCountry = null;
    var authToken = null;

    (function checkUrlAndSetTitle() {
        var currentUrl = window.location.href;
        if (currentUrl.includes('localhost:8888')) {
            document.title = '东南亚-中心操作-轨迹扫描';
        }
    })();

    (async function init() {
        await Config.loadCountryConfigs();
        console.log('配置加载完成');
    })();

    (function testMD5() {
        var testStr = 'Admin123';
        var expected = 'e64b78fc3bc91bcbc7dc232ba8ec59e0';
        var result = md5(testStr);
        console.log('===== MD5 测试 =====');
        console.log('输入:', testStr);
        console.log('期望:', expected);
        console.log('实际:', result);
        console.log('匹配:', result === expected ? '✓ 成功' : '✗ 失败');
        console.log('===================');
    })();

    function selectCountry(countryCode) {
        currentCountry = Config.getCountryConfig(countryCode);
        if (!currentCountry) return;

        UI.showScanPage(currentCountry);
        authToken = null;
    }

    function goBack() {
        UI.showCountryPage();
        currentCountry = null;
        authToken = null;
        UI.el('tokenDebug').classList.add('hidden');
    }

    async function executeLogin() {
        if (!currentCountry) {
            alert('请先选择国家');
            return;
        }

        var account = UI.el('account').value;
        var password = UI.el('password').value;

        if (!account || !password) {
            account = currentCountry.account || '';
            password = currentCountry.password || '';
        }

        if (!account || !password) {
            alert('请输入账号和密码');
            return;
        }

        UI.setLoginButton(true);
        UI.setStatus('pending', '正在登录...');

        var loginConfig = currentCountry.login;
        var fullUrl = currentCountry.baseUrl + loginConfig.url;

        var params = {
            account: account,
            password: password,
            username: account
        };

        var loginParams = JSON.parse(JSON.stringify(Api.replaceParams(loginConfig.param, params)));

        console.log('最终登录参数:', loginParams);

        UI.showRequest(
            'URL: ' + fullUrl + '\nMethod: ' + loginConfig.method + '\n\n' + JSON.stringify(loginParams, null, 2)
        );

        try {
            var isMultipart = Api.isMultipartFormData(currentCountry);
            var requestHeaders = Api.buildRequestHeaders(currentCountry, null);

            if (isMultipart) {
                var processedHeaders = {};
                for (var key in currentCountry.headers) {
                    if (key.toLowerCase() !== 'content-type') {
                        processedHeaders[key] = currentCountry.headers[key];
                    }
                }
                requestHeaders = processedHeaders;
            }

            var requestBody = Api.buildRequestBody(loginParams, currentCountry);
            var response = await Api.sendProxyRequest(fullUrl, loginConfig.method, requestHeaders, requestBody);

            var responseText = await response.text();
            var responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = responseText;
            }

            UI.showResponse(UI.formatResponse(response.status, response.statusText, responseData));

            if (response.ok) {
                console.log('开始解析登录返回数据，完整响应:', JSON.stringify(responseData, null, 2));
                authToken = Api.extractToken(responseData);
                console.log('登录返回数据:', responseData);
                console.log('最终提取到的authToken:', authToken);

                if (authToken) {
                    UI.setStatus('success', '✓ 登录成功');
                } else {
                    UI.setStatus('success', '✓ 登录成功(无token)');
                }
                UI.enableScanControls(true);
            } else {
                UI.setStatus('error', '✗ 登录失败');
            }

            UI.updateTokenDisplay(authToken);
        } catch (error) {
            UI.showResponse('登录错误: ' + error.message + '\n\n请确保通过 http://localhost:8888 访问页面。');
            UI.setStatus('error', '✗ 登录错误');
        }

        UI.setLoginButton(false);
    }

    async function executeScan() {
        if (!currentCountry) {
            alert('请先选择国家');
            return;
        }

        var account = currentCountry.account || UI.el('account').value;
        var password = currentCountry.password || UI.el('password').value;
        var waybillId = UI.el('waybillId').value;
        var scanType = UI.el('scanType').value;

        if (!account || !password) {
            alert('请输入账号和密码');
            return;
        }
        if (!waybillId) {
            alert('请输入运单号');
            return;
        }
        if (!scanType) {
            alert('请选择扫描类型');
            return;
        }

        var scanConfig = currentCountry.scanTypes[scanType];
        if (!scanConfig) {
            alert('未找到该扫描类型的配置');
            return;
        }

        UI.setScanButton(true);
        UI.setStatus('pending', '正在请求...');

        var scanTime = Api.getCountryTime();

        var taskCode1 = currentCountry.globalparam?.taskCode1 || '';
        if (currentCountry.name === '马来') {
            var randomNineDigits = Math.floor(100000000 + Math.random() * 900000000);
            taskCode1 = 'LH' + randomNineDigits;
        }

        var params = Object.assign(
            {},
            currentCountry.globalparam,
            {
                waybillId: waybillId,
                yundan: waybillId,
                scanTime: scanTime,
                account: account,
                password: password,
                packageNumber: 'PKG' + Date.now(),
                trackingNumber: waybillId,
                scanType: scanType,
                taskCode1: taskCode1
            }
        );

        var requestBody = JSON.parse(JSON.stringify(Api.replaceParams(scanConfig.param, params)));
        var fullUrl = currentCountry.baseUrl + scanConfig.url;
        var requestHeaders = Api.buildRequestHeaders(currentCountry, authToken);
        var finalRequestBody = Api.buildRequestBody(requestBody, currentCountry);

        if (authToken) {
            console.log('当前国家:', currentCountry.name);
            console.log('准备设置token, authToken值:', authToken);
            if (currentCountry.name === '菲律宾' || currentCountry.englishName === 'Philippines') {
                console.log('扫描请求使用的token(菲律宾):', authToken);
            } else {
                console.log('扫描请求使用的authToken:', authToken);
            }
        } else {
            console.log('警告: authToken为空!');
        }

        UI.showRequest(
            'URL: ' + fullUrl + '\nMethod: ' + scanConfig.method +
            '\n\nHeaders: ' + JSON.stringify(requestHeaders, null, 2) +
            '\n\nBody: ' + JSON.stringify(requestBody, null, 2)
        );

        console.log('===== 扫描请求完整信息 =====');
        console.log('URL:', fullUrl);
        console.log('Method:', scanConfig.method);
        console.log('Headers:', JSON.stringify(requestHeaders, null, 2));
        console.log('Body:', JSON.stringify(requestBody, null, 2));
        console.log('==========================');

        try {
            var response = await Api.sendProxyRequest(fullUrl, scanConfig.method, requestHeaders, finalRequestBody);

            var responseText = await response.text();
            var responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = responseText;
            }

            UI.showResponse(UI.formatResponse(response.status, response.statusText, responseData));

            if (response.ok) {
                UI.setStatus('success', '✓ 执行成功');
            } else {
                UI.setStatus('error', '✗ 执行失败');
            }
        } catch (error) {
            UI.showResponse('请求错误: ' + error.message + '\n\n请确保通过 http://localhost:8888 访问页面，而不是直接打开文件。');
            UI.setStatus('error', '✗ 请求错误');
        } finally {
            UI.setScanButton(false);
        }
    }

    return {
        selectCountry: selectCountry,
        goBack: goBack,
        executeLogin: executeLogin,
        executeScan: executeScan
    };
})();
