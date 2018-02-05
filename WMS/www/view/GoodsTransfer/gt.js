appControllers.controller('GtListCtrl', [
    '$scope',
    '$stateParams',
    '$state',
    '$timeout',
    '$ionicPopup',
    '$ionicLoading',
    '$cordovaBarcodeScanner',
    'ApiService',
    'PopupService',
    'ENV',
    function (
        $scope,
        $stateParams,
        $state,
        $timeout,
        $ionicPopup,
        $ionicLoading,
        $cordovaBarcodeScanner,
        ApiService,
        PopupService,
        ENV) {
        var popup = null;
        var popupTitle = '';
        $scope.Whwh1 = {};
        $scope.Whwh2 = {};
        $scope.Impm1s = {};
        $scope.Rcbp1 = {};
        $scope.refreshRcbp1 = function (BusinessPartyName) {
            if (is.not.undefined(BusinessPartyName) && is.not.empty(BusinessPartyName)) {
                var objUri = ApiService.Uri(true, '/api/wms/rcbp1');
                objUri.addSearch('BusinessPartyName', BusinessPartyName);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Rcbp1s = result.data.results;
                });
            }
        };
        $scope.refreshWhwh1 = function (WarehouseName) {
            if (is.not.undefined(WarehouseName) && is.not.empty(WarehouseName)) {
                var objUri = ApiService.Uri(true, '/api/wms/whwh1');
                objUri.addSearch('WarehouseName', WarehouseName);
                ApiService.Get(objUri, false).then(function success(result) {
                    $scope.Whwh1s = result.data.results;
                });
            } else {
                $scope.clearImpm1s();
            }
        };
        $scope.refreshWhwh2 = function (StoreNo,VerifyStoreNo) {
            if (is.not.empty($scope.Whwh1) && is.not.undefined(StoreNo) && is.not.empty(StoreNo)) {
                var objUri = ApiService.Uri(true, '/api/wms/whwh2');
                objUri.addSearch('WarehouseCode', $scope.Whwh1.selected.WarehouseCode);
                objUri.addSearch('StoreNo', StoreNo);
                  objUri.addSearch('VerifyStoreNo', VerifyStoreNo);
                ApiService.Get(objUri, false).then(function success(result) {
                  if (VerifyStoreNo==='Y'){
                    if(result.data.results.length >0)
                    {

                    }else{
                        PopupService.Alert(popup, 'Please Enter Current StoreNo ').then();
                    }
                  }else{
                      $scope.Whwh2s = result.data.results;
                  }

                });
            }
        };
        $scope.showWarehouse = function () {
            if (is.undefined($scope.Whwh1.selected) || is.empty($scope.Whwh1.selected)) {
                var objUri1 = ApiService.Uri(true, '/api/wms/whwh1');
                ApiService.Get(objUri1, false).then(function success(result) {
                    $scope.Whwh1s = result.data.results;
                    $scope.Whwh1.selected = $scope.Whwh1s[0];
                });
            }
        };
        $scope.showImpm1 = function (CustomerCode, StoreNo) {
            if (is.not.undefined($scope.Rcbp1.selected) || is.not.undefined($scope.Whwh1.selected)) {
                var objUri = ApiService.Uri(true, '/api/wms/impm1/transfer');
                if (is.not.undefined($scope.Whwh1.selected)) {
                    if (is.not.undefined($scope.Whwh1.selected.WarehouseCode) && is.not.empty($scope.Whwh1.selected.WarehouseCode)) {
                        objUri.addSearch('WarehouseCode', $scope.Whwh1.selected.WarehouseCode);
                    }
                    if (is.not.undefined($scope.Whwh2.selected) && is.not.undefined($scope.Whwh2.selected.StoreNo) && is.not.empty($scope.Whwh2.selected.StoreNo)) {
                        objUri.addSearch('StoreNo', $scope.Whwh2.selected.StoreNo);
                    }
                }
                if (is.not.undefined($scope.Rcbp1.selected) && is.not.undefined($scope.Rcbp1.selected.BusinessPartyCode) && is.not.empty($scope.Rcbp1.selected.BusinessPartyCode)) {
                    objUri.addSearch('CustomerCode', $scope.Rcbp1.selected.BusinessPartyCode);
                }
                ApiService.Get(objUri, true).then(function success(result) {
                    $scope.Impm1s = result.data.results;
                });
            } else {
                $scope.clearImpm1s();
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
        $scope.clearImpm1s = function () {
            $scope.Impm1s = {};
        };
        $scope.showWarehouse();

        $scope.toggleGroup = function (group) {
            group.show = !group.show;
        };
        $scope.isGroupShown = function (group) {
            return group.show;
        };


        $scope.openCam = function ( impm1 ) {
            if(!ENV.fromWeb){
                $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                    $scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo = imageData.text;
                    // $( '#txt-storeno-' + $scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo ).select();
$scope.refreshWhwh2($scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo,'Y');
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                } );
            }
        };
        $scope.clearInput = function ( type, impm1 ) {
            if ( is.equal( type, 'qty' ) ) {
                $scope.Impm1s[ impm1.BatchLineItemNo - 1 ].ScanQty = 0;
                $( '#txt-qty-' + impm1.BatchLineItemNo ).select();
            } else {
            $scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo = '';
                // $( '#txt-storeno-' + $scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo ).select();
            }
        };

        $scope.enter = function (ev,impm1) {
            if (is.equal(ev.keyCode, 13)) {
                if (is.null(popup)) {

                    $scope.refreshWhwh2($scope.Impm1s[impm1.objectTrxNo ].tree[impm1.TreeLineItemNo].FromToStoreNo,'Y');

                } else {
                    popup.close();
                    popup = null;
                }
                if (!ENV.fromWeb) {
                    $cordovaKeyboard.close();
                }
            }
        };

        $scope.checkQty = function (impm1) {
            if (impm1.QtyBal - impm1.ScanQty < 0) {
                PopupService.Alert(popup, 'Balance Not Less Than Zero,Please Check You Enter Qty ').then();
            } else {

            }
            //       console.log( 'aa');
            //   if ( impm1.ScanQty < 0 ) {
            //       $scope.Impm1s[ impm1.BatchLineItemNo - 1 ].ScanQty = 0;
            //   } else {
            //       if ( impm1.Qty - impm1.ScanQty < 0 ) {
            //           $scope.Impm1s[ impm1.BatchLineItemNo - 1 ].ScanQty = $scope.Impm1s[ impm1.BatchLineItemNo - 1 ].Qty;
            //       }
            //   }
        };
        $scope.checkConfirm = function () {
            var blnConfirm = false;
            for (var node in $scope.Impm1s) {
                var impm1s = $scope.Impm1s[node];
                for (var i = 0; i < impm1s.tree.length; i++) {
                    if (impm1s.tree[i].ScanQty > 0 && is.not.empty(impm1s.tree[i].FromToStoreNo)) {
                        blnConfirm = true;
                        break;
                    }
                }
            }
            if (blnConfirm) {
                var objUri = ApiService.Uri(true, '/api/wms/imit1/create');
                objUri.addSearch('UserID', sessionStorage.getItem('UserId').toString());
                ApiService.Get(objUri, false).then(function success(result) {
                    var imit1 = result.data.results[0];
                    var QtyList = '';
                    var ImpmTrxNoList = '';
                    var NewStoreNoList = '';
                    var LineItemNoList = '';
                    var LineItemNo = 0;
                    if (imit1.TrxNo > 0 && $scope.Impm1s.length > 0) {
                        $ionicLoading.show();
                        for (var node in $scope.Impm1s) {
                            var impm1s = $scope.Impm1s[node];
                            var len = impm1s.tree.length;
                            var i = 0,
                                count = 0;
                            for (i = 0; i < len; i++) {
                                var impm1 = {
                                    TrxNo: impm1s.tree[i].TrxNo,
                                    BatchLineItemNo: impm1s.tree[i].BatchLineItemNo,
                                    Qty: impm1s.tree[i].ScanQty,
                                    FromToStoreNo: impm1s.tree[i].FromToStoreNo
                                };
                                if (impm1.Qty > 0 && is.not.empty(impm1.FromToStoreNo)) {

                                    LineItemNo = LineItemNo + 1;
                                    if (ImpmTrxNoList === '') {
                                        QtyList = impm1.Qty;
                                        ImpmTrxNoList = impm1.TrxNo;
                                        NewStoreNoList = impm1.FromToStoreNo;
                                        LineItemNoList = LineItemNo;
                                    } else {
                                        QtyList = QtyList + ',' + impm1.Qty;
                                        ImpmTrxNoList = ImpmTrxNoList + ',' + impm1.TrxNo;
                                        NewStoreNoList = NewStoreNoList + ',' + impm1.FromToStoreNo;
                                        LineItemNoList = LineItemNoList + ',' + LineItemNo;
                                    }
                                }
                            }
                        }
                        if (ImpmTrxNoList !== '') {
                            var objUri = ApiService.Uri(true, '/api/wms/imit1/confirm');
                            objUri.addSearch('TrxNo', imit1.TrxNo);
                            objUri.addSearch('UpdateBy', sessionStorage.getItem('UserId').toString());
                            objUri.addSearch('NewStoreNoList', NewStoreNoList);
                            objUri.addSearch('LineItemNoList', LineItemNoList);
                            objUri.addSearch('Impm1TrxNoList', ImpmTrxNoList);
                            objUri.addSearch('QtyList', QtyList);
                            ApiService.Get(objUri, false).then(function success(result) {
                                PopupService.Info(popup, 'Confirm Success').then(function () {
                                    $scope.clearImpm1s();
                                    // $scope.returnMain();
                                });
                            });
                        }
                        $ionicLoading.hide();
                    }
                });
            } else {
                PopupService.Alert(popup, 'No Product Transfered').then();
            }
        };
    }
]);
