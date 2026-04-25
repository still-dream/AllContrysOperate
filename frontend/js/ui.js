var UI = (function() {
    function el(id) {
        return document.getElementById(id);
    }

    function resetResult() {
        var statusBadge = el('statusBadge');
        statusBadge.className = 'status-badge pending';
        statusBadge.innerHTML = '<span>等待执行</span>';
        el('requestBox').classList.add('hidden');
        el('responseBox').classList.add('hidden');
    }

    function setStatus(type, text) {
        var statusBadge = el('statusBadge');
        statusBadge.className = 'status-badge ' + type;
        statusBadge.innerHTML = '<span>' + text + '</span>';
    }

    function showRequest(text) {
        el('requestBox').classList.remove('hidden');
        el('requestContent').textContent = text;
    }

    function showResponse(text) {
        el('responseBox').classList.remove('hidden');
        el('responseContent').textContent = text;
    }

    function updateTokenDisplay(authToken) {
        var tokenDisplay = el('currentTokenDisplay');
        if (authToken) {
            tokenDisplay.textContent = authToken.length > 50 ? authToken.substring(0, 50) + '...' : authToken;
            tokenDisplay.style.color = '#00b42a';
        } else {
            tokenDisplay.textContent = '未登录';
            tokenDisplay.style.color = '#f53f3f';
        }
    }

    function setLoginButton(loading) {
        var loginBtn = el('loginBtn');
        loginBtn.disabled = loading;
        if (loading) {
            loginBtn.innerHTML = '<span class="loading-spinner"></span>登录中';
        } else {
            loginBtn.innerHTML = '登录';
        }
    }

    function setScanButton(loading) {
        var executeBtn = el('executeBtn');
        executeBtn.disabled = loading;
        if (loading) {
            executeBtn.innerHTML = '<span class="loading-spinner"></span>执行中';
        } else {
            executeBtn.innerHTML = '执行扫描';
        }
    }

    function enableScanControls(enabled) {
        el('scanType').disabled = !enabled;
        el('executeBtn').disabled = !enabled;
    }

    function showCountryPage() {
        el('countryPage').classList.add('active');
        el('scanPage').classList.remove('active');
    }

    function showScanPage(countryConfig) {
        var flagMap = {
            '印尼': 'indonesia.png',
            '马来': 'malaysia.png',
            '泰国': 'thailand.png',
            '越南': 'vietnam.png',
            '菲律宾': 'philippines.png',
            '新加坡': 'singapore.png',
            '老挝': 'laos.png',
            '柬埔寨': 'cambodia.png'
        };
        
        var flagPath = flagMap[countryConfig.name] || (countryConfig.name.toLowerCase() + '.png');
        el('selectedFlag').innerHTML = '<img src="png/' + flagPath + '" alt="' + countryConfig.name + ' flag">';
        
        var englishName = countryConfig.englishName || '';
        el('selectedName').textContent = countryConfig.name + ' ' + englishName;

        el('accountFields').classList.remove('hidden');

        el('account').value = countryConfig.account || '';
        el('password').value = countryConfig.password || '';
        el('waybillId').value = countryConfig.globalparam?.waybillId || '';

        var scanTypeSelect = el('scanType');
        scanTypeSelect.innerHTML = '<option value="">请选择扫描类型</option>';
        for (var type in countryConfig.scanTypes) {
            var option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            scanTypeSelect.appendChild(option);
        }

        el('countryPage').classList.remove('active');
        el('scanPage').classList.add('active');

        resetResult();
        enableScanControls(false);
        el('loginBtn').disabled = false;
    }

    function formatResponse(responseStatus, responseStatusText, responseData) {
        var statusLine = 'Status: ' + responseStatus + ' ' + responseStatusText;
        var body = typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData;
        return statusLine + '\n\n' + body;
    }

    return {
        el: el,
        resetResult: resetResult,
        setStatus: setStatus,
        showRequest: showRequest,
        showResponse: showResponse,
        updateTokenDisplay: updateTokenDisplay,
        setLoginButton: setLoginButton,
        setScanButton: setScanButton,
        enableScanControls: enableScanControls,
        showCountryPage: showCountryPage,
        showScanPage: showScanPage,
        formatResponse: formatResponse
    };
})();
