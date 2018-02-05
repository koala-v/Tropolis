appControllers.controller('EnquiryListCtrl', [
    'ENV',
    '$scope',
    '$stateParams',
    '$state',
    '$cordovaKeyboard',
    '$cordovaBarcodeScanner',
    '$cordovaToast',
    'ApiService',
    function (
        ENV,
        $scope,
        $stateParams,
        $state,
        $cordovaKeyboard,
        $cordovaBarcodeScanner,
        $cordovaToast,
        ApiService) {
        $scope.Impr1 = {};
        $scope.Impm1 = {};
        $scope.Whwh1 = {};
        $scope.Whwh2 = {};
        $scope.Impm1sEnquiry = {};
        $scope.defaultWhwh1 = function () {
            var objUri1 = ApiService.Uri(true, '/api/wms/whwh1');
            ApiService.Get(objUri1, false).then(function success(result) {
                $scope.Whwh1s = result.data.results;
                $scope.Whwh1.selected = $scope.Whwh1s[0];
            });
        };
        $scope.defaultWhwh1();
        $scope.refreshImpr1 = function (ScanProductCode, ProductCode) {
            if (is.not.undefined(ProductCode) && is.not.empty(ProductCode)) {
                var objUri = ApiService.Uri(true, '/api/wms/impr1');
                objUri.addSearch('ProductCode', ProductCode);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Impr1s = result.data.results;
                    if (is.equal(ScanProductCode, 'ScanProductCode')) {
                        if ($scope.Impr1s !== null && $scope.Impr1s.length > 0) {
                            $scope.Impr1.selected = $scope.Impr1s[0];
                            $scope.showImpm($scope.Impr1.selected.ProductCode, null);
                        } else {
                            $scope.showImpm(null, null);
                        }
                    }
                });
            } else {
                $scope.showImpm(null, null);
            }
        };

        $scope.refreshWhwh1 = function (WarehouseName) {
            if (is.not.undefined(WarehouseName) && is.not.empty(WarehouseName)) {
                var objUri = ApiService.Uri(true, '/api/wms/whwh1');
                objUri.addSearch('WarehouseName', WarehouseName);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Whwh1s = result.data.results;
                });
            }
        };
        $scope.refreshWhwh2 = function (StoreNo) {
            if (is.not.empty($scope.Whwh1) && is.not.undefined(StoreNo) && is.not.empty(StoreNo)) {
                var objUri = ApiService.Uri(true, '/api/wms/whwh2');
                objUri.addSearch('WarehouseCode', $scope.Whwh1.selected.WarehouseCode);
                objUri.addSearch('StoreNo', StoreNo);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Whwh2s = result.data.results;
                });
            }
        };
        $scope.refreshImpm1s = function (ScanUserDefine1, UserDefine1) {
            if (is.not.undefined(UserDefine1) && is.not.empty(UserDefine1)) {
                var objUri = ApiService.Uri(true, '/api/wms/impm1');
                objUri.addSearch('UserDefine1', UserDefine1);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Impm1s = result.data.results;
                    if (is.equal(ScanUserDefine1, 'ScanUserDefine1')) {
                        if ($scope.Impm1s !== null && $scope.Impm1s.length > 0) {
                            $scope.Impm1.selected = $scope.Impm1s[0];
                            $scope.showImpm(null, $scope.Impm1.selected);
                        } else {
                            $scope.showImpm(null, null);
                        }
                    }

                });
            } else {
                $scope.showImpm(null, null);

            }
        };
        $scope.showDate = function (utc) {
            return moment(utc).format('DD-MMM-YYYY');
        };
        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };
        $scope.showImpm = function (ProductCode, Impm1) {
            if (is.not.undefined(ProductCode) && is.not.null(ProductCode)) {
                var objUri = ApiService.Uri(true, '/api/wms/impm1/enquiry');
                objUri.addSearch('ProductCode', ProductCode);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Impm1sEnquiry = result.data.results;
                });
            } else if (is.not.undefined(Impm1) && is.not.null(Impm1)) {
                var objUri = ApiService.Uri(true, '/api/wms/impm1/enquiry');
                objUri.addSearch('TrxNo', Impm1.TrxNo);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Impm1sEnquiry = result.data.results;

                });
            } else {
                $scope.Impm1sEnquiry = {};
            }
            if (!ENV.fromWeb) {
                $cordovaKeyboard.close();
            }
        };
        $scope.showImpmwh = function (WarehouseCode, StoreNo) {
            if (is.not.undefined(StoreNo) && is.not.null(StoreNo)) {
                var objUri = ApiService.Uri(true, '/api/wms/impm1/enquiry');
                objUri.addSearch('WarehouseCode', $scope.Whwh1.selected.WarehouseCode);
                objUri.addSearch('StoreNo', StoreNo);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Impm1sEnquiry = result.data.results;
                });
            } else {
                $scope.Impm1sEnquiry = {};
            }
            if (!ENV.fromWeb) {
                $cordovaKeyboard.close();
            }
        };
        $scope.openCam = function (type) {
            if (!ENV.fromWeb) {
                if (is.equal(type, 'ProductCode')) {
                    $cordovaBarcodeScanner.scan().then(function (imageData) {
                        $scope.refreshImpr1("ScanProductCode", imageData.text);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (is.equal(type, 'UserDefine1')) {
                    $cordovaBarcodeScanner.scan().then(function (imageData) {
                        $scope.refreshImpm1s("ScanUserDefine1", imageData.text);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                }
            }
        };
        $scope.Change = function (ChangeValue) {
            if (ChangeValue !== '') {
                Console.log(ChangeValue);
            } else {
                conosole.log('dd');
            }
        };
        $('#iProductCode').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $('#iCustBatchNo').focus();
            }
        });
    }
]);
