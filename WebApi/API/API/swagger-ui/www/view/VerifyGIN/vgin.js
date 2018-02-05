appControllers.controller( 'VginListCtrl', [
    'ENV',
    '$scope',
    '$stateParams',
    '$state',
    '$cordovaKeyboard',
    'ApiService',
    function (
        ENV,
        $scope,
        $stateParams,
        $state,
        $cordovaKeyboard,
        ApiService ) {
        $scope.rcbp1 = {};
        $scope.GinNo = {};
        $scope.imgi1s = {};
        $scope.refreshRcbp1 = function ( BusinessPartyName ) {
            if ( is.not.undefined( BusinessPartyName ) && is.not.empty( BusinessPartyName ) ) {
                var objUri = ApiService.Uri( true, '/api/wms/rcbp1' );
                objUri.addSearch( 'BusinessPartyName', BusinessPartyName );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Rcbp1s = result.data.results;
                } );
            }
        };
        $scope.refreshGinNos = function ( Grn ) {
            if ( is.not.undefined( Grn ) && is.not.empty( Grn ) ) {
                var objUri = ApiService.Uri( true, '/api/wms/imgi1' );
                objUri.addSearch( 'GoodsIssueNoteNo', Grn );
                objUri.addSearch( 'StatusCode', 'USE-CMP' );
                ApiService.Get( objUri, true ).then( function success( result ) {
                    $scope.GinNos = result.data.results;
                } );
            }
        };
        $scope.ShowImgi1 = function ( Customer ) {
            var objUri = ApiService.Uri( true, '/api/wms/imgi1' );
            objUri.addSearch( 'CustomerCode', Customer );
            objUri.addSearch( 'StatusCode', 'USE-CMP' );
            ApiService.Get( objUri, true ).then( function success( result ) {
                $scope.imgi1s = result.data.results;
            } );
            if ( !ENV.fromWeb ) {
                $cordovaKeyboard.close();
            }
        };
        $scope.showDate = function ( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.GoToDetail = function ( Imgi1 ) {
            if ( Imgi1 != null ) {
                $state.go( 'vginDetail', {
                    'CustomerCode': Imgi1.CustomerCode,
                    'TrxNo': Imgi1.TrxNo,
                    'GoodsIssueNoteNo': Imgi1.GoodsIssueNoteNo
                }, {
                    reload: true
                } );
            }
        };
        $scope.returnMain = function () {
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
    } ] );

appControllers.controller( 'VginDetailCtrl', [
    'ENV',
    '$scope',
    '$stateParams',
    '$state',
    '$timeout',
    '$ionicHistory',
    '$ionicLoading',
    '$ionicModal',
    '$ionicPopup',
    '$cordovaToast',
    '$cordovaBarcodeScanner',
    'ApiService',
    'SqlService',
    'PopupService',
    function (
        ENV,
        $scope,
        $stateParams,
        $state,
        $timeout,
        $ionicHistory,
        $ionicLoading,
        $ionicModal,
        $ionicPopup,
        $cordovaToast,
        $cordovaBarcodeScanner,
        ApiService,
        SqlService,
        PopupService ) {
        var popup = null;
        var hmImgi2 = new HashMap();
        var hmImsn1 = new HashMap();
        $scope.Detail = {
            Customer: $stateParams.CustomerCode,
            GIN: $stateParams.GoodsIssueNoteNo,
            Scan: {
                BarCode: '',
                SerialNo: '',
                QtyBal: 0,
                Qty: 0,
            },
            Imgi2: {},
            Imgi2s: {},
            Imgi2sDb: {},
            Imsn1s: {},
            blnNext: true
        };
        $ionicModal.fromTemplateUrl( 'scan.html', {
            scope: $scope,
            animation: 'slide-in-up'
        } ).then( function ( modal ) {
            $scope.modal = modal;
        } );
        $scope.$on( '$destroy', function () {
            $scope.modal.remove();
        } );
        var blnVerifyInput = function ( type ) {
            var blnPass = true;
            if ( is.equal( type, 'SerialNo' ) && is.not.equal( $scope.Detail.Scan.SerialNo, $scope.Detail.Imgi2.SerialNo ) ) {
                blnPass = false;
                PopupService.Alert( popup, 'Wrong Serial No' ).then();
            } else if ( is.equal( type, 'BarCode' ) && is.not.equal( $scope.Detail.Scan.BarCode, $scope.Detail.Imgi2.BarCode ) ) {
                blnPass = false;
                PopupService.Alert( popup, 'Wrong Product' ).then();
            }
            return blnPass;
        };
        var setScanQty = function ( barcode, imgi2 ) {
            if ( is.equal( imgi2.SerialNoFlag, 'Y' ) ) {
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                //$( '#txt-sn' ).removeAttr( 'readonly' );
                $( '#txt-sn' ).select();
            } else {
                imgi2.ScanQty += 1;
                hmImgi2.remove( barcode );
                hmImgi2.set( barcode, imgi2 );
                var obj = {
                    ScanQty: imgi2.ScanQty
                };
                var strFilter = 'TrxNo=' + imgi2.TrxNo + ' And LineItemNo=' + imgi2.LineItemNo;
                SqlService.Update( 'Imgi2_Verify', obj, strFilter ).then( function () {
                    $scope.Detail.Scan.Qty = imgi2.ScanQty;
                    $scope.Detail.Scan.BarCode = '';
                    $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                    if ( is.equal( imgi2.Qty, imgi2.ScanQty ) ) {
                        $scope.showNext();
                    }
                } );
            }
        };
        var showImpr = function ( barcode ) {
            if ( hmImgi2.has( barcode ) ) {
                var imgi2 = hmImgi2.get( barcode );
                setScanQty( barcode, imgi2 );
            } else {
                PopupService.Alert( popup, 'Wrong Product' ).then();
            }
        };
        var setSnQty = function ( barcode, imgi2 ) {
            imgi2.ScanQty += 1;
            hmImgi2.remove( barcode );
            hmImgi2.set( barcode, imgi2 );
            var obj = {
                ScanQty: imgi2.ScanQty
            };
            var strFilter = 'TrxNo=' + imgi2.TrxNo + ' And LineItemNo=' + imgi2.LineItemNo;
            SqlService.Update( 'Imgi2_Verify', obj, strFilter ).then( function () {
                $scope.Detail.Scan.Qty = imgi2.ScanQty;
                $scope.Detail.Scan.SerialNo = '';
                if ( is.equal( imgi2.Qty, imgi2.ScanQty ) ) {
                    $scope.showNext();
                } else {
                    $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                    $( '#txt-sn' ).select();
                }
            } );
        };
        var showSn = function ( sn, blnScan ) {
            if ( is.not.empty( sn ) ) {
                var barcode = $scope.Detail.Scan.BarCode,
                    SnArray = null,
                    imgi2 = hmImgi2.get( barcode );
                var imsn1 = {
                    ReceiptNoteNo: '',
                    ReceiptLineItemNo: '',
                    IssueNoteNo: $scope.Detail.GIN,
                    IssueLineItemNo: imgi2.LineItemNo,
                    SerialNo: sn,
                };
                if ( hmImsn1.count() > 0 && hmImsn1.has( barcode ) ) {
                    SnArray = hmImsn1.get( barcode );
                    if ( is.not.inArray( sn, SnArray ) ) {
                        SnArray.push( sn );
                        hmImsn1.remove( barcode );
                        hmImsn1.set( barcode, SnArray );
                    } else {
                        $scope.Detail.Scan.SerialNo = '';
                        $scope.$apply();
                        return;
                    }
                } else {
                    SnArray = new Array();
                    SnArray.push( sn );
                    hmImsn1.set( barcode, SnArray );
                }
                //db_add_Imsn1_Verify(imsn1);
                setSnQty( barcode, imgi2 );
            }
        };
        var showImgi2 = function ( row ) {
            if ( row != null && $scope.Detail.Imgi2s.length >= row ) {
                $scope.Detail.Imgi2 = $scope.Detail.Imgi2s[ row ];
                $scope.Detail.Imgi2.QtyBal = $scope.Detail.Imgi2s[ row ].Qty - $scope.Detail.Imgi2s[ row ].ScanQty;
                $scope.Detail.Scan.Qty = $scope.Detail.Imgi2s[ row ].ScanQty;
            }
            if ( is.equal( row, $scope.Detail.Imgi2s.length - 1 ) ) {
                $scope.Detail.blnNext = false;
            } else {
                $scope.Detail.blnNext = true;
            }
        };
        var GetImgi2 = function ( GoodsIssueNoteNo ) {
            var objUri = ApiService.Uri( true, '/api/wms/imgi2/verify' );
            objUri.addSearch( 'GoodsIssueNoteNo', GoodsIssueNoteNo );
            ApiService.Get( objUri, true ).then( function success( result ) {
                $scope.Detail.Imgi2s = result.data.results;
                SqlService.Delete( 'Imgi2_Verify' ).then( function ( res ) {
                    if ( is.array( $scope.Detail.Imgi2s ) && is.not.empty( $scope.Detail.Imgi2s ) ) {
                        for ( var i = 0; i < $scope.Detail.Imgi2s.length; i++ ) {
                            var imgi2 = $scope.Detail.Imgi2s[ i ];
                            hmImgi2.set( imgi2.BarCode, imgi2 );
                            SqlService.Insert( 'Imgi2_Verify', imgi2 ).then();
                        }
                        showImgi2( 0 );
                    } else {
                        PopupService.Info( popup, 'This GIN has no Products' ).then( function () {
                            $scope.returnList();
                        } );
                    }
                } );
            } );
        };
        GetImgi2( $scope.Detail.GIN );
        $scope.openModal = function () {
            $scope.modal.show();
            $ionicLoading.show();
            SqlService.Select( 'Imgi2_Verify', '*' ).then( function ( results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgi2 = results.rows.item( i );
                    imgi2.Qty = results.rows.item( i ).Qty > 0 ? results.rows.item( i ).Qty : 0;
                    imgi2.ScanQty = results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0;
                    imgi2.QtyBal = results.rows.item( i ).QtyBal > 0 ? results.rows.item( i ).QtyBal : 0;
                    arr.push( imgi2 );
                }
                $scope.Detail.Imgi2sDb = arr;
                $ionicLoading.hide();
            }, function () {
                $ionicLoading.hide();
            } );
        };
        $scope.closeModal = function () {
            $scope.Detail.Imgi2sDb = {};
            $scope.modal.hide();
        };
        $scope.checkQty = function () {
            if ( $scope.Detail.Scan.Qty < 0 ) {
                $scope.Detail.Scan.Qty = 0;
            } else {
                if ( $scope.Detail.Imgi2.Qty - $scope.Detail.Scan.Qty < 0 ) {
                    $scope.Detail.Scan.Qty = $scope.Detail.Imgi2.Qty;
                }
            }
        };
        $scope.changeQty = function () {
            if ( is.not.empqty($scope.Detail.Scan.BarCode) && hmImgi2.count() > 0 ) {
                var imgi2 = hmImgi2.get( $scope.Detail.Scan.BarCode );
                var promptPopup = $ionicPopup.show( {
                    template: '<input type="number" ng-model="Detail.Scan.Qty" ng-change="checkQty();">',
                    title: 'Enter Qty',
                    subTitle: 'Are you sure to change Qty manually?',
                    scope: $scope,
                    buttons: [
                        {
                            text: 'Cancel'
                        },
                        {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function ( e ) {
                                imgi2.ScanQty = $scope.Detail.Scan.Qty;
                                $scope.Detail.Imgi2.QtyBal = imgi2.Qty - imgi2.ScanQty;
                                var obj = {
                                    ScanQty: imgi2.ScanQty
                                };
                                var strFilter = 'TrxNo=' + imgi2.TrxNo + ' And LineItemNo=' + imgi2.LineItemNo;
                                SqlService.Update( 'Imgi2_Verify', obj, strFilter ).then();
                            }
                      }
                    ]
                } );
            }
        };
        $scope.returnList = function () {
            $state.go( 'vginList', {}, {
                reload: true
            } );
        };
        $scope.openCam = function ( type ) {
            if ( !ENV.fromWeb ) {
                if ( is.equal( type, 'BarCode' ) ) {
                    $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                        $scope.Detail.Scan.BarCode = imageData.text;
                        showImpr( $scope.Detail.Scan.BarCode );
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                } else if ( is.equal( type, 'SerialNo' ) ) {
                    //if ($('#txt-sn').attr("readonly") != "readonly") {
                    $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                        $scope.Detail.Scan.SerialNo = imageData.text;
                        showSn( $scope.Detail.Scan.SerialNo );
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                    //}
                }
            }
        };
        $scope.clearInput = function ( type ) {
            if ( is.equal( type, 'BarCode' ) ) {
                if ( $scope.Detail.Scan.BarCode.length > 0 ) {
                    $scope.Detail.Scan.BarCode = '';
                    $scope.Detail.Scan.SerialNo = '';
                    $scope.Detail.Scan.Qty = 0;
                    //$('#txt-sn').attr('readonly', true);
                    $( '#txt-barcode' ).select();
                }
            } else if ( is.equal( type, 'SerialNo' ) ) {
                if ( $scope.Detail.Scan.SerialNo.length > 0 ) {
                    $scope.Detail.Scan.SerialNo = "";
                    $( '#txt-sn' ).select();
                }
            } else {
                $scope.Detail.Scan.BarCode = '';
                $scope.Detail.Scan.SerialNo = '';
                $scope.Detail.Scan.Qty = 0;
                //$('#txt-sn').attr('readonly', true);
                $( '#txt-storeno' ).select();
            }
        };
        $scope.showPrev = function () {
            var intRow = $scope.Detail.Imgi2.RowNum - 1;
            if ( $scope.Detail.Imgi2s.length > 0 && intRow > 0 && is.equal( $scope.Detail.Imgi2s[ intRow - 1 ].RowNum, intRow ) ) {
                $scope.clearInput();
                showImgi2( intRow - 1 );
            } else {
                PopupService.Info( popup, 'Already the first one' ).then();
            }
        }
        $scope.showNext = function () {
            var intRow = $scope.Detail.Imgi2.RowNum + 1;
            if ( $scope.Detail.Imgi2s.length > 0 && $scope.Detail.Imgi2s.length >= intRow && is.equal( $scope.Detail.Imgi2s[ intRow - 1 ].RowNum, intRow ) ) {
                $scope.clearInput();
                showImgi2( intRow - 1 );
            } else {
                PopupService.Info( popup, 'Already the last one' ).then();
            }
        }
        $scope.checkConfirm = function () {
            $ionicLoading.show();
            SqlService.Select( 'Imgi2_Verify', '*' ).then( function ( results ) {
                var len = results.rows.length;
                if ( len > 0 ) {
                    var blnDiscrepancies = false;
                    for ( var i = 0; i < len; i++ ) {
                        var imgi2 = results.rows.item( i );
                        if ( is.not.empty( imgi2.BarCode ) ) {
                            if ( imgi2.Qty != imgi2.ScanQty ) {
                                console.log( 'Product (' + imgi2.ProductCode + ') Qty not equal.' );
                                blnDiscrepancies = true;
                            }
                        } else {
                            blnDiscrepancies = true;
                        }
                    }
                    $ionicLoading.hide();
                    if ( blnDiscrepancies ) {
                        PopupService.Alert( popup, 'Discrepancies on Qty' ).then( function ( res ) {
                            $scope.openModal();
                        } );
                    } else {
                        PopupService.Info( popup, 'Confirm Success' ).then( function ( popup ) {
                            $scope.returnList();
                        } );
                    }
                } else {
                    $ionicLoading.hide();
                    PopupService.Alert( popup, 'Discrepancies on Qty' ).then( function ( popup ) {
                        $scope.openModal();
                    } );
                }
            } );
        };
        $scope.enter = function ( ev, type ) {
            if ( is.equal( ev.keyCode, 13 ) ) {
                if ( is.equal( type, 'barcode' ) && is.not.empty( $scope.Detail.Scan.BarCode ) ) {
                    if ( blnVerifyInput( 'BarCode' ) ) {
                        showImpr( $scope.Detail.Scan.BarCode );
                    }
                } else if ( is.equal( type, 'serialno' ) && is.not.empty( $scope.Detail.Scan.StoreNo ) ) {
                    if ( blnVerifyInput( 'SerialNo' ) ) {
                        showSn( $scope.Detail.SerialNo );
                    }
                }
                if ( !ENV.fromWeb ) {
                    $cordovaKeyboard.close();
                }
            }
        };
    } ] );
