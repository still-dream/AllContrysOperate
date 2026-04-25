var Config = (function() {
    var countryConfigs = {
        "SGP": {
            "name": "新加坡",
            "englishName": "Singapore",
            "flag": "🇸🇬",
            "needLogin": true,
            "account": "testjind2",
            "password": "Admin123",
            "networkCode": "5 CSL A",
            "baseUrl": "https://demogw.jtexpress.sg",
            "headers": {
                "user-agent": "Android-OPPO PFTM20/app_out",
                "content-type": "application/json; charset=utf-8"
            },
            "globalparam": {
                "waybillId": "JTTT202674716167",
                "orderId": "2023306842289",
                "userId": "50449589",
                "scanNetworkTypeId": "336",
                "scanNetworkTypeName": "网点",
                "deliveryName": "testjind",
                "deliveryCode": "testjind",
                "deliveryBy": "50449589",
                "signCode": "QS005",
                "signId": "50449589",
                "signer": "testjind",
                "signuserId": "50449589",
                "userIdzx": "50449593"
            },
            "login": {
                "url": "/bc/out/loginNew",
                "method": "POST",
                "param": {
                    "password": "e64b78fc3bc91bcbc7dc232ba8ec59e0",
                    "account": "${account}",
                    "macAddr": "WA-e5d7af0ff73691d"
                }
            },
            "scanTypes": {}
        }
    };

    var configsLoaded = false;

    async function loadCountryConfigs() {
        try {
            var response = await fetch('/api/countries');
            var configs = await response.json();

            for (var countryCode in configs) {
                var targetCode = countryCode;
                if (!countryConfigs[targetCode]) {
                    var lowerCode = countryCode.toLowerCase();
                    var upperCode = countryCode.toUpperCase();
                    if (countryConfigs[lowerCode]) {
                        targetCode = lowerCode;
                    } else if (countryConfigs[upperCode]) {
                        targetCode = upperCode;
                    }
                }

                if (countryConfigs[targetCode]) {
                    countryConfigs[targetCode] = Object.assign(
                        {},
                        countryConfigs[targetCode],
                        configs[countryCode],
                        {
                            account: configs[countryCode].account || countryConfigs[targetCode].account,
                            password: configs[countryCode].password || countryConfigs[targetCode].password
                        }
                    );
                } else {
                    countryConfigs[targetCode] = configs[countryCode];
                }
            }
            configsLoaded = true;
            console.log('国家配置已从后端API加载');
        } catch (error) {
            console.error('从API加载国家配置失败，尝试从JSON文件加载:', error);
            try {
                var response = await fetch('AllContrysOperate.json');
                var configs = await response.json();
                for (var countryCode in configs) {
                    var targetCode = countryCode;
                    if (!countryConfigs[targetCode]) {
                        var lowerCode = countryCode.toLowerCase();
                        var upperCode = countryCode.toUpperCase();
                        if (countryConfigs[lowerCode]) {
                            targetCode = lowerCode;
                        } else if (countryConfigs[upperCode]) {
                            targetCode = upperCode;
                        }
                    }
                    if (countryConfigs[targetCode]) {
                        countryConfigs[targetCode] = Object.assign(
                            {},
                            countryConfigs[targetCode],
                            configs[countryCode],
                            {
                                account: configs[countryCode].account || countryConfigs[targetCode].account,
                                password: configs[countryCode].password || countryConfigs[targetCode].password
                            }
                        );
                    } else {
                        countryConfigs[targetCode] = configs[countryCode];
                    }
                }
                configsLoaded = true;
                console.log('国家配置已从AllContrysOperate.json加载');
            } catch (error2) {
                console.error('加载国家配置失败:', error2);
            }
        }
    }

    function getCountryConfig(countryCode) {
        if (countryConfigs[countryCode]) {
            return countryConfigs[countryCode];
        }
        var lowerCode = countryCode.toLowerCase();
        var upperCode = countryCode.toUpperCase();
        if (countryConfigs[lowerCode]) {
            return countryConfigs[lowerCode];
        }
        if (countryConfigs[upperCode]) {
            return countryConfigs[upperCode];
        }
        return null;
    }

    function getAllConfigs() {
        return countryConfigs;
    }

    return {
        loadCountryConfigs: loadCountryConfigs,
        getCountryConfig: getCountryConfig,
        getAllConfigs: getAllConfigs
    };
})();
