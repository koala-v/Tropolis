appControllers.controller( 'GrListCtrl', [
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
        $scope.Rcbp1 = {};
        $scope.GrnNo = {};
        $scope.Imgr1s = {};
        $scope.refreshRcbp1 = function ( BusinessPartyName ) {
            if ( is.not.undefined( BusinessPartyName ) && is.not.empty( BusinessPartyName ) ) {
                var objUri = ApiService.Uri( true, '/api/wms/rcbp1' );
                objUri.addSearch( 'BusinessPartyName', BusinessPartyName );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.Rcbp1s = result.data.results;
                } );
            }
        };
        $scope.refreshGrnNos = function ( Grn ) {
            if ( is.not.undefined( Grn ) && is.not.empty( Grn ) ) {
                var objUri = ApiService.Uri( true, '/api/wms/imgr1' );
                objUri.addSearch( 'GoodsReceiptNoteNo', Grn );
                ApiService.Get( objUri, false ).then( function success( result ) {
                    $scope.GrnNos = result.data.results;
                } );
            }
        };
        $scope.ShowImgr1 = function ( Customer ) {
            if ( is.not.undefined( Customer ) && is.not.empty( Customer ) ) {
                var objUri = ApiService.Uri( true, '/api/wms/imgr1' );
                objUri.addSearch( 'CustomerCode', Customer );
                ApiService.Get( objUri, true ).then( function success( result ) {
                    $scope.Imgr1s = result.data.results;
                } );
            }
            if(!ENV.fromWeb){
                $cordovaKeyboard.close();
            }
        };
        $scope.showDate = function ( utc ) {
            return moment( utc ).format( 'DD-MMM-YYYY' );
        };
        $scope.GoToDetail = function ( Imgr1 ) {
            if ( Imgr1 != null ) {
                $state.go( 'grDetail', {
                    'CustomerCode': Imgr1.CustomerCode,
                    'TrxNo': Imgr1.TrxNo,
                    'GoodsReceiptNoteNo': Imgr1.GoodsReceiptNoteNo
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
        /*
        var BhEngine = new Bloodhound( {
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace( 'value' ),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: ENV.api + '/api/wms/rcbp1?BusinessPartyName=%QUERY&format=json',
                wildcard: '%QUERY',
                transform: function( result ) {
                    return $.map( result.data.results, function( rcbp1 ) {
                        return {
                            value: rcbp1.BusinessPartyName
                        };
                    } );
                }
            }
        } );
        BhEngine.initialize();
        $( '#scrollable-dropdown-menu .typeahead' ).typeahead( {
            hint: false,
            highlight: true,
            minLength: 1
        }, {
            name: 'BusinessPartyNames',
            limit: 10,
            displayKey: 'value',
            source: BhEngine.ttAdapter(),
            templates: {
                empty: [
                    '<div class="tt-empty-message">',
                    'No Results Found',
                    '</div>'
                ].join( '\n' ),
                suggestion: function( data ) {
                    return '<p><strong>' + data.value + '</strong></p>';
                }
            }
        } );
        $( 'input' ).on( [
            'typeahead:initialized',
            'typeahead:initialized:err',
            'typeahead:selected',
            'typeahead:autocompleted',
            'typeahead:cursorchanged',
            'typeahead:opened',
            'typeahead:closed'
        ].join( ' ' ), function( d ) {
            console.log( this.value );
        } );
        */
    }
] );

appControllers.controller( 'GrDetailCtrl', [
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
        PopupService ) {
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
                Qty: 0
            },
            Imgr2: {
                CustBatchNo : ''
            },
            Impr1: {
                ProductCode : '',
                ProductDescription : ''
            },
            Imgr2s : {},
            Imgr2sDb: {}
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
        var setScanQty = function ( barcode, imgr2 ) {
            if ( is.equal( imgr2.SerialNoFlag, 'Y' ) ) {
                $scope.Detail.Scan.Qty = imgr2.ScanQty;
                $( '#txt-sn' ).removeAttr( 'readonly' );
            } else {
                imgr2.ScanQty += 1;
                hmImgr2.remove( barcode );
                hmImgr2.set( barcode, imgr2 );
                var objImgr2 = {
                    ScanQty:imgr2.ScanQty
                }, strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
                SqlService.Update('Imgr2_Receipt', objImgr2, strFilter).then();
                $scope.Detail.Scan = {
                    BarCode : '',
                    SerialNo : '',
                    Qty : imgr2.ScanQty
                };
            }
            $scope.$apply();
        };
        var showImpr = function ( barcode ) {
            if ( hmImgr2.has( barcode ) ) {
                var imgr2 = hmImgr2.get( barcode );
                $scope.Detail.Impr1 = {
                    ProductCode : imgr2.ProductCode,
                    ProductDescription : imgr2.ProductDescription
                };
                $scope.Detail.Imgr2.CustBatchNo = imgr2.UserDefine1;
                setScanQty( barcode, imgr2 );
            } else {
                PopupService.Alert(popup,'Wrong BarCode');
            }
        };
        var setSnQty = function ( barcode, imgr2 ) {
            imgr2.ScanQty += 1;
            hmImgr2.remove( barcode );
            hmImgr2.set( barcode, imgr2 );
            var objImgr2 = {
                ScanQty:imgr2.ScanQty
            }, strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
            SqlService.Update('Imgr2_Receipt', objImgr2, strFilter).then();
            $scope.Detail.Scan.Qty = imgr2.ScanQty;
            $scope.Detail.Scan.SerialNo = '';
            $scope.$apply();
        };
        var showSn = function ( sn ) {
            if ( is.not.empty( sn ) ) {
                var barcode = $scope.Detail.Scan.BarCode,
                    SnArray = null,
                    imgr2 = hmImgr2.get( barcode );
                var imsn1 = {
                    ReceiptNoteNo: $scope.Detail.GRN,
                    ReceiptLineItemNo: imgr2.LineItemNo,
                    IssueNoteNo: '',
                    IssueLineItemNo: 0,
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
                //db_add_Imsn1_Receipt( imsn1 );
                setSnQty( barcode, imgr2 );
            }
        };
        $scope.openCam = function ( type ) {
            if(!ENV.fromWeb){
                if ( is.equal( type, 'BarCode' ) ) {
                    $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                        $scope.Detail.Scan.BarCode = imageData.text;
                        showImpr( $scope.Detail.Scan.BarCode);
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
                } else if ( is.equal( type, 'SerialNo' ) ) {
                    if ( $( '#txt-sn' ).attr( 'readonly' ) != 'readonly' ) {
                        $cordovaBarcodeScanner.scan().then( function ( imageData ) {
                            $scope.Detail.Scan.SerialNo = imageData.text;
                            showSn( $scope.Detail.Scan.SerialNo );
                        }, function ( error ) {
                            $cordovaToast.showShortBottom( error );
                        } );
                    }
                }
            }
        };
        $scope.openModal = function () {
            $scope.modal.show();
            $ionicLoading.show();
            SqlService.Select('Imgr2_Receipt', '*').then(function(results){
                $scope.Detail.Imgr2sDb = new Array();
                for ( var i = 0; i < results.rows.length; i++ ) {
                    var imgr2 = {
                        TrxNo: results.rows.item( i ).TrxNo,
                        LineItemNo: results.rows.item( i ).LineItemNo,
                        ProductCode: results.rows.item( i ).ProductCode,
                        BarCode: results.rows.item( i ).BarCode,
                        ScanQty: results.rows.item( i ).ScanQty > 0 ? results.rows.item( i ).ScanQty : 0,
                        ActualQty: 0
                    };
                    switch ( results.rows.item( i ).DimensionFlag ) {
                    case '1':
                        imgr2.ActualQty = results.rows.item( i ).PackingQty;
                        break;
                    case '2':
                        imgr2.ActualQty = results.rows.item( i ).WholeQty;
                        break;
                    default:
                        imgr2.ActualQty = results.rows.item( i ).LooseQty;
                    }
                    $scope.Detail.Imgr2sDb.push( imgr2 );
                }
                $ionicLoading.hide();
            },function(error){
                $ionicLoading.hide();
            });
        };
        $scope.closeModal = function () {
            $scope.Detail.Imgr2sDb = {};
            $scope.modal.hide();
        };
        $scope.returnList = function () {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'grList', {}, {
                    reload: true
                } );
            }
        };
        $scope.clearInput = function ( type ) {
            if ( is.equal( type, 'BarCode' ) && is.not.empty($scope.Detail.Scan.BarCode) ) {
                $scope.Detail.Scan = {
                    BarCode : '',
                    SerialNo : '',
                    Qty : 0
                };
                $scope.Detail.Impr1 = {
                    ProductCode : '',
                    ProductDescription : ''
                };
                $scope.Detail.Imgr2.CustBatchNo = '';
                $( '#txt-sn' ).attr( 'readonly', true );
            } else if ( is.equal( type, 'SerialNo' ) && is.not.empty($scope.Detail.Scan.SerialNo) ) {
                $scope.Detail.Scan.SerialNo = '';
            }
        };
        $scope.changeQty = function () {
            if ( is.not.empty( $scope.Detail.Scan.BarCode ) ) {
                if ( hmImgr2.count() > 0 && hmImgr2.has( $scope.Detail.Scan.BarCode ) ) {
                    var imgr2 = hmImgr2.get( $scope.Detail.Scan.BarCode );
                    var promptPopup = $ionicPopup.show( {
                        template: '<input type="number" ng-model="Detail.Scan.Qty">',
                        title: 'Enter Qty',
                        subTitle: 'Are you sure to change Qty manually?',
                        scope: $scope,
                        buttons: [ {
                            text: 'Cancel'
                        }, {
                            text: '<b>Save</b>',
                            type: 'button-positive',
                            onTap: function ( e ) {
                                imgr2.ScanQty = $scope.Detail.Scan.Qty;
                                var obj = {
                                    ScanQty: imgr2.ScanQty
                                };
                                var strFilter = 'TrxNo=' + imgr2.TrxNo + ' And LineItemNo=' + imgr2.LineItemNo;
                                SqlService.Update('Imgr2_Receipt', obj, strFilter).then();
                            }
                        } ]
                    } );
                }
            }
        };
        $scope.checkConfirm = function () {
            $ionicLoading.show();
            SqlService.Select('Imgr2_Receipt', '*').then(function(results){
                var len = results.rows.length;
                if ( len > 0 ) {
                    var blnDiscrepancies = false;
                    for ( var i = 0; i < len; i++ ) {
                        var imgr2 = {
                            TrxNo: results.rows.item( i ).TrxNo,
                            LineItemNo: results.rows.item( i ).LineItemNo,
                            ProductCode: results.rows.item( i ).ProductCode,
                            ScanQty: results.rows.item( i ).ScanQty,
                            BarCode: results.rows.item( i ).BarCode,
                            Qty: 0
                        };
                        if ( imgr2.BarCode != null && imgr2.BarCode.length > 0 ) {
                            switch ( results.rows.item( i ).DimensionFlag ) {
                            case '1':
                                imgr2.Qty = results.rows.item( i ).PackingQty;
                                break;
                            case '2':
                                imgr2.Qty = results.rows.item( i ).WholeQty;
                                break;
                            default:
                                imgr2.Qty = results.rows.item( i ).LooseQty;
                            }
                            if ( imgr2.Qty != imgr2.ScanQty ) {
                                console.log( 'Product (' + imgr2.ProductCode + ') Qty not equal.' );
                                blnDiscrepancies = true;
                            }
                        } else {
                            blnDiscrepancies = true;
                        }
                    }
                    if ( blnDiscrepancies ) {
                        $ionicLoading.hide();
                        PopupService.Alert(popup, 'Discrepancies on Qty').then(function(res){
                            $scope.openModal();
                        });
                    } else {
                        sendConfirm();
                    }
                } else {
                    $ionicLoading.hide();
                    PopupService.Info(popup, 'No Product In This GRN').then();
                }
            },function(error){
                $ionicLoading.hide();
                PopupService.Alert(popup, error.message).then();
            });
        };
        $scope.enter = function(ev, type) {
            if (is.equal(ev.keyCode,13)) {
                if ( is.null(popup) ) {
                    if(is.equal(type,'barcode')){
                        showImpr( $scope.Detail.Scan.BarCode );
                    }else{
                        showSn( $scope.Detail.Scan.SerialNo );
                    }
                } else {
                    popup.close();
                    popup = null;
                }
                if ( !ENV.fromWeb ) {
                    $cordovaKeyboard.close();
                }
            }
        };
        var sendConfirm = function () {
            var userID = sessionStorage.getItem( 'UserId' ).toString();
            hmImgr2.forEach( function ( value, key ) {
                var barcode = key,
                    imgr2 = value,
                    SnArray = null,
                    SerialNos = '';
                if ( is.equal( imgr2.SerialNoFlag, 'Y' ) ) {
                    if ( hmImsn1.count() > 0 && hmImsn1.has( barcode ) ) {
                        SnArray = hmImsn1.get( barcode );
                    }
                    for ( var i in SnArray ) {
                        SerialNos = SerialNos + ',' + SnArray[ i ];
                    }
                    SerialNos = SerialNos.substr( 1, SerialNos.length );
                    var objUri = ApiService.Uri( true, '/api/wms/imsn1/create');
                    objUri.addSearch('ReceiptNoteNo',$scope.Detail.GRN);
                    objUri.addSearch('ReceiptLineItemNo', imgr2.LineItemNo);
                    objUri.addSearch('SerialNos=', SerialNos);
                    objUri.addSearch('Imgr2TrxNo',imgr2.TrxNo);
                    ApiService.Get( objUri, true ).then( function success( result ) {} );
                }
            } );
            var objUri = ApiService.Uri( true, '/api/wms/imgr1/confirm');
            objUri.addSearch('TrxNo', $scope.Detail.TrxNo);
            objUri.addSearch('UserId',userID);
            ApiService.Get( objUri, true ).then( function success( result ) {
                PopupService.Info(popup, 'Confirm Success').then(function(res){
                    $scope.returnList();
                });
            } );
        };
        var GetImgr2ProductCode = function ( GoodsReceiptNoteNo ) {
            var objUri = ApiService.Uri( true, '/api/wms/imgr2/receipt');
            objUri.addSearch('GoodsReceiptNoteNo',GoodsReceiptNoteNo);
            ApiService.Get( objUri, true ).then( function success( result ) {
                $scope.Detail.Imgr2s = result.data.results;
                //SqlService.Delete('Imsn1_Receipt').then(function(res){
                    SqlService.Delete('Imgr2_Receipt').then(function(res){
                        for ( var i = 0; i < $scope.Detail.Imgr2s.length; i++ ) {
                            var objImgr2 = $scope.Detail.Imgr2s[ i ];
                            hmImgr2.set( objImgr2.BarCode, objImgr2 );
                            SqlService.Insert('Imgr2_Receipt', objImgr2).then();
                        }
                    });
                //});
            } );
        };
        GetImgr2ProductCode( $scope.Detail.GRN );
    }
] );
