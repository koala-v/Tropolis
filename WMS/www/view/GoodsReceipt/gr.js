appControllers.controller('GrListCtrl', [
    'ENV',
    '$scope',
    '$stateParams',
    '$state',
    '$cordovaKeyboard',
    'ApiService',
    'SqlService',
    function (
        ENV,
        $scope,
        $stateParams,
        $state,
        $cordovaKeyboard,
        ApiService,
        SqlService) {
        $scope.Rcbp1 = {};
        $scope.GrnNo = {};
        $scope.Imgr1s = {};
        $scope.OldBusinessPartyName = '';
        $scope.OldGoodsReceiptNoteNo = '';
        $scope.refreshRcbp1 = function (BusinessPartyName) {
            if (is.not.undefined(BusinessPartyName) && is.not.empty(BusinessPartyName)) {
                var objUri = ApiService.Uri(true, '/api/wms/rcbp1');
                objUri.addSearch('UserDefine01', BusinessPartyName);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Rcbp1s = result.data.results;
                    if ($scope.Rcbp1s.length > 0 && $scope.Rcbp1s[0].UserDefine01.toUpperCase() === BusinessPartyName.toUpperCase()) {
                        $scope.Rcbp1.selected = $scope.Rcbp1s[0];
                        if (BusinessPartyName.length > 1 && BusinessPartyName.length != $scope.OldBusinessPartyName.length - 1 && BusinessPartyName.length != $scope.OldBusinessPartyName.length + 1) {
                            $scope.ShowImgr1($scope.Rcbp1.selected.BusinessPartyCode);
                        }
                    }
                });
                $scope.OldBusinessPartyName = BusinessPartyName;
            } else {
                $scope.OldBusinessPartyName = '';
            }
        };
        $scope.refreshGrnNos = function (Grn) {
            if (is.not.undefined(Grn) && is.not.empty(Grn)) {
                var objUri = ApiService.Uri(true, '/api/wms/imgr1');
                objUri.addSearch('InvoiceNo', Grn);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.GrnNos = result.data.results;
                    if ($scope.GrnNos.length > 0 && $scope.GrnNos[0].CustGrnNo.toUpperCase() === Grn.toUpperCase()) {
                        $scope.GrnNo.selected = $scope.GrnNos[0];
                        if (Grn.length > 1 && Grn.length != $scope.OldGoodsReceiptNoteNo.length - 1 && Grn.length != $scope.OldGoodsReceiptNoteNo.length + 1) {
                            $scope.GoToDetail($scope.GrnNo.selected);
                        }
                    }
                });
                $scope.OldGoodsReceiptNoteNo = Grn;
            } else {
                $scope.OldGoodsReceiptNoteNo = '';
            }
        };
        $scope.ShowImgr1 = function (Customer) {
            if (is.not.undefined(Customer) && is.not.empty(Customer)) {
                var objUri = ApiService.Uri(true, '/api/wms/imgr1');
                objUri.addSearch('UserDefine01', Customer);
                ApiService.Get(objUri, true).then(function success(result) {
                    $scope.Imgr1s = result.data.results;
                });
            } else {
                $scope.Imgr1s = {};
            }
            if (!ENV.fromWeb) {
                $cordovaKeyboard.close();
            }
        };
        $scope.showDate = function (utc) {
            return moment(utc).format('DD-MMM-YYYY');
        };
        $scope.GoToDetail = function (Imgr1) {
            if (Imgr1 !== null && is.not.undefined(Imgr1)) {
                $state.go('grDetail', {
                    'CustomerCode': Imgr1.UserDefine01,
                    'TrxNo': Imgr1.TrxNo,
                    'GoodsReceiptNoteNo': Imgr1.CustGrnNo
                }, {
                    reload: true
                });
            }
        };
        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });

        };
    }
]);

appControllers.controller('GrDetailCtrl', [
    'ENV',
    '$scope',
    '$stateParams',
    '$state',
    '$http',
    '$timeout',
    '$ionicHistory',
    '$ionicLoading',
    '$ionicPopup',
    '$ionicModal',
    '$cordovaKeyboard',
    '$cordovaToast',
    '$cordovaBarcodeScanner',
    'SqlService',
    'ApiService',
    'PopupService',
    function (
        ENV,
        $scope,
        $stateParams,
        $state,
        $http,
        $timeout,
        $ionicHistory,
        $ionicLoading,
        $ionicPopup,
        $ionicModal,
        $cordovaKeyboard,
        $cordovaToast,
        $cordovaBarcodeScanner,
        SqlService,
        ApiService,
        PopupService) {
        var popup = null;
        var hmImgr2 = new HashMap();
        var hmImsn1 = new HashMap();
        $scope.Detail = {
            Customer: $stateParams.CustomerCode,
            GRN: $stateParams.GoodsReceiptNoteNo,
            TrxNo: $stateParams.TrxNo,
            Scan: {
                BarCode: '',
                SerialNo: '',
                SerialNoFlag: '',
                Qty: 0
            },
            Imgr2: {
                CustBatchNo: ''
            },
            Impr1: {
                ProductCode: '',
                ProductDescription: ''
            },
            Imgr2s: {},
            Imgr2sDb: {}
        };
        $ionicModal.fromTemplateUrl('scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        var setScanQty = function (barcode, imgr2) {

            imgr2.ScanQty += 1;
            hmImgr2.remove(barcode);
            hmImgr2.set(barcode, imgr2);
            var barcode1 = barcode;
            var objImgr2 = {
                    ScanQty: imgr2.ScanQty
                };

                if (imgr2.ActualQty ===imgr2.ScanQty ){

                   objImgr2 = {
                          ScanQty: imgr2.ScanQty,
                          ScanedBarCodeFlag:'Y'
                      };
                }
                if (imgr2.ActualQty ===0)
                {
                  objImgr2 = {
                         ScanQty: 0,
                         ScanedBarCodeFlag:'Y'
                     };
                     imgr2.ScanQty = 0;
                }
              strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
            SqlService.Update('Imgr2_Receipt', objImgr2, strFilter).then();
            $scope.Detail.Scan = {
                BarCode: barcode1,
                SerialNo: '',
                SerialNoFlag: imgr2.SerialNoFlag,
                Qty: imgr2.ScanQty
            };

        };
        var showImpr = function (barcode) {
                var strFilter = "BarCode='"+ barcode +"' And ScanedBarCodeFlag =''"  ;
                var ActualQtyValue = '';
            // var strFilter = "BarCode='"+ barcode +"' ";
            SqlService.Select('Imgr2_Receipt', '*', strFilter).then(function (results) {
                var len = results.rows.length;
                if (len > 0) {

                  switch (results.rows.item(0).DimensionFlag) {
                  case '1':
                    ActualQtyValue = results.rows.item(0).PackingQty;
                      break;
                  case '2':
                  ActualQtyValue = results.rows.item(0).WholeQty;
                      break;
                  default:
                  ActualQtyValue = results.rows.item(0).LooseQty;
                  }
                    var imgr2 = {
                        TrxNo: results.rows.item(0).TrxNo,
                        LineItemNo: results.rows.item(0).LineItemNo,
                        ProductCode: results.rows.item(0).ProductCode,
                        BarCode: results.rows.item(0).BarCode,
                        ScanQty: results.rows.item(0).ScanQty,
                        ActualQty:  ActualQtyValue ,
                        SerialNoFlag: results.rows.item(0).SerialNoFlag,
                        ProductDescription: results.rows.item(0).ProductDescription


                    };
                    $scope.Detail.Impr1 = {
                        ProductCode: imgr2.ProductCode,
                        ProductDescription: imgr2.ProductDescription
                    };
                    setScanQty(barcode, imgr2);
                } else {
                    PopupService.Alert(popup, 'Alreadyed Scan');
                }
                $ionicLoading.hide();
            }, function (error) {
                $ionicLoading.hide();
            });
        };

        $scope.openCam = function (type) {
            if (!ENV.fromWeb) {
                if (is.equal(type, 'BarCode')) {
                    $cordovaBarcodeScanner.scan().then(function (imageData) {
                        $scope.Detail.Scan.BarCode = imageData.text;
                        showImpr($scope.Detail.Scan.BarCode);
                    }, function (error) {
                        $cordovaToast.showShortBottom(error);
                    });
                } else if (is.equal(type, 'Qty')) {
                    if (is.not.empty($scope.Detail.Scan.BarCode)) {
                        $cordovaBarcodeScanner.scan().then(function (imageData) {
                            $scope.Detail.Scan.Qty = imageData.text;
                            var imgr2 = hmImgr2.get($scope.Detail.Scan.BarCode);
                            imgr2.ScanQty = $scope.Detail.Scan.Qty;
                            var obj = {
                                ScanQty: imgr2.ScanQty
                            };
                            var strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
                            SqlService.Update('Imgr2_Receipt', obj, strFilter).then();
                        }, function (error) {
                            $cordovaToast.showShortBottom(error);
                        });
                    }
                }
            }
        };
        $scope.openModal = function () {
            $scope.modal.show();
            $ionicLoading.show();
            SqlService.Select('Imgr2_Receipt', '*').then(function (results) {
                $scope.Detail.Imgr2sDb = new Array();
                for (var i = 0; i < results.rows.length; i++) {
                    var imgr2 = {
                        TrxNo: results.rows.item(i).TrxNo,
                        LineItemNo: results.rows.item(i).LineItemNo,
                        ProductCode: results.rows.item(i).ProductCode,
                        BarCode: results.rows.item(i).BarCode,
                        ScanQty: results.rows.item(i).ScanQty > 0 ? results.rows.item(i).ScanQty : 0,
                        ActualQty: 0
                    };
                    switch (results.rows.item(i).DimensionFlag) {
                    case '1':
                        imgr2.ActualQty = results.rows.item(i).PackingQty;
                        break;
                    case '2':
                        imgr2.ActualQty = results.rows.item(i).WholeQty;
                        break;
                    default:
                        imgr2.ActualQty = results.rows.item(i).LooseQty;
                    }
                    $scope.Detail.Imgr2sDb.push(imgr2);
                }
                $ionicLoading.hide();
            }, function (error) {
                $ionicLoading.hide();
            });
        };
        $scope.closeModal = function () {
            $scope.Detail.Imgr2sDb = {};
            $scope.modal.hide();
        };
        $scope.returnList = function () {
            if ($ionicHistory.backView()) {
                $ionicHistory.goBack();
            } else {
                $state.go('grList', {}, {
                    reload: true
                });
            }
        };
        $scope.clearInput = function (type) {
            if (is.equal(type, 'BarCode') && is.not.empty($scope.Detail.Scan.BarCode)) {
                $scope.Detail.Scan = {
                    BarCode: '',
                    SerialNo: '',
                    SerialNoFlag: '',
                    Qty: 0
                };
                $scope.Detail.Impr1 = {
                    ProductCode: '',
                    ProductDescription: ''
                };

            } else if (is.equal(type, 'Qty')) {
                $scope.Detail.Scan.Qty = 0;
            }
        };
        $scope.changeQty = function () {
            if (is.not.empty($scope.Detail.Scan.BarCode)) {
                if (hmImgr2.count() > 0 && hmImgr2.has($scope.Detail.Scan.BarCode)) {
                    var imgr2 = hmImgr2.get($scope.Detail.Scan.BarCode);
                    var tmpQty = '';
                    var promptPopup = $ionicPopup.show({
                        template: '<input type="number" ng-model="Detail.Scan.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [{
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                imgr2.ScanQty = $scope.Detail.Scan.Qty;
                                var obj = {
                                    ScanQty: imgr2.ScanQty
                                };
                                var strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
                                SqlService.Update('Imgr2_Receipt', obj, strFilter).then();
                            }
                        }]
                    });
                }
            }
        };
        $scope.checkConfirm = function () {
            $ionicLoading.show();
            SqlService.Select('Imgr2_Receipt', '*').then(function (results) {
                var len = results.rows.length;
                if (len > 0) {
                    var blnDiscrepancies = false;
                    for (var i = 0; i < len; i++) {
                        var imgr2 = {
                            TrxNo: results.rows.item(i).TrxNo,
                            LineItemNo: results.rows.item(i).LineItemNo,
                            ProductCode: results.rows.item(i).ProductCode,
                            ScanQty: results.rows.item(i).ScanQty,
                            BarCode: results.rows.item(i).BarCode,
                            Qty: 0
                        };
                        if (imgr2.BarCode !== null && imgr2.BarCode.length > 0) {
                            switch (results.rows.item(i).DimensionFlag) {
                            case '1':
                                imgr2.Qty = results.rows.item(i).PackingQty;
                                break;
                            case '2':
                                imgr2.Qty = results.rows.item(i).WholeQty;
                                break;
                            default:
                                imgr2.Qty = results.rows.item(i).LooseQty;
                            }
                            if (imgr2.Qty != imgr2.ScanQty) {
                                console.log('Product (' + imgr2.ProductCode + ') Qty not equal.');
                                blnDiscrepancies = true;
                            }
                        } else {
                            blnDiscrepancies = true;
                        }
                    }
                    if (blnDiscrepancies) {
                        $ionicLoading.hide();
                        PopupService.Alert(popup, 'Discrepancies on Qty').then(function (res) {
                            $scope.openModal();
                        });
                    } else {
                        sendConfirm();
                    }
                } else {
                    $ionicLoading.hide();
                    PopupService.Info(popup, 'No Product In This GRN').then();
                }
            }, function (error) {
                $ionicLoading.hide();
                PopupService.Alert(popup, error.message).then();
            });
        };
        $scope.enter = function (ev, type) {
            if (is.equal(ev.keyCode, 13)) {
                if (is.null(popup)) {
                    if (is.equal(type, 'barcode')) {
                        showImpr($scope.Detail.Scan.BarCode);
                    }
                } else {
                    popup.close();
                    popup = null;
                }
                if (!ENV.fromWeb) {
                    $cordovaKeyboard.close();
                }
            }
        };
        var sendConfirm = function () {
            var userID = sessionStorage.getItem('UserId').toString();
            hmImgr2.forEach(function (value, key) {
                var barcode = key,
                    imgr2 = value,
                    SnArray = null,
                    SerialNos = '';

            });
            var objUri = ApiService.Uri(true, '/api/wms/imgr1/confirm');
            objUri.addSearch('TrxNo', $scope.Detail.TrxNo);
            objUri.addSearch('UserId', userID);
            ApiService.Get(objUri, true).then(function success(result) {
                PopupService.Info(popup, 'Confirm Success').then(function (res) {
                    $scope.returnList();
                });
            });
        };
        var GetImgr2ProductCode = function (TrxNo) {
            var objUri = ApiService.Uri(true, '/api/wms/imgr2/receipt');
            objUri.addSearch('TrxNo', TrxNo);
            ApiService.Get(objUri, true).then(function success(result) {
                $scope.Detail.Imgr2s = result.data.results;
                SqlService.Delete('Imgr2_Receipt').then(function (res) {
                    for (var i = 0; i < $scope.Detail.Imgr2s.length; i++) {
                        var objImgr2 = $scope.Detail.Imgr2s[i];
                        hmImgr2.set(objImgr2.BarCode, objImgr2);
                        SqlService.Insert('Imgr2_Receipt', objImgr2).then();
                    }
                });
            });
        };
        GetImgr2ProductCode($scope.Detail.TrxNo);
    }
]);
