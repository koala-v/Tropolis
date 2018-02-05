var appControllers = angular.module( 'WMSAPP.controllers', [
    'ionic',
    'ngCordova',
    'ui.select',
    'ion-tree-list',
    'WMSAPP.config',
    'WMSAPP.services',
    'WMSAPP.factories'
] );

appControllers.controller( 'IndexCtrl', [
    'ENV',
    '$rootScope',
    '$scope',
    '$state',
    '$http',
    '$ionicPlatform',
    '$ionicPopup',
    '$ionicSideMenuDelegate',
    '$cordovaAppVersion',
    '$cordovaFile',
    'ApiService',
    'PopupService',
    function(
        ENV,
        $rootScope,
        $scope,
        $state,
        $http,
        $ionicPlatform,
        $ionicPopup,
        $ionicSideMenuDelegate,
        $cordovaAppVersion,
        $cordovaFile,
        ApiService,
        PopupService) {
        var popup = null;
        $scope.Status = {
            Login: false
        };
        $scope.logout = function() {
            $rootScope.$broadcast( 'logout' );
            $state.go( 'index.login', {}, {} );
        };
        $scope.gotoSetting = function() {
            $state.go( 'index.setting', {}, {
                reload: true
            } );
        };
        $scope.gotoUpdate = function() {
            if ( !ENV.fromWeb ) {
                $http.get( ApiService.Url(ApiService.Uri( false, '/' + ENV.updateFile)) )
                    .success( function( res ) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then( function( version ) {
                            if ( version != serverAppVersion ) {
                                $ionicSideMenuDelegate.toggleLeft();
                                $state.go( 'index.update', {
                                    'Version': serverAppVersion
                                } );
                            } else {
                                PopupService.Alert(popup,'Already the Latest Version!').then();
                            }
                        } );
                    } )
                    .error( function( res ) {
                        PopupService.Alert(popup, 'Connect Update Server Error!').then();
                    } );
            } else {
                PopupService.Info(popup, 'No Updates!').then();
            }
        }
        $rootScope.$on( 'logout', function() {
            $scope.Status.Login = false;
            $ionicSideMenuDelegate.toggleLeft();
        } );
        $rootScope.$on( 'login', function() {
            $scope.Status.Login = true;
        } );
        //
        var writeFile = function ( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function ( success ) {
                    ApiService.Init(true);
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $ionicPlatform.ready( function () {
            console.log( 'ionicPlatform.ready' );
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website + '##' +
                    'api=' + ENV.api + '##' +
                    'port=' + ENV.port;
                var path = cordova.file.externalRootDirectory,
                    directory = ENV.rootPath,
                    file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.createDir( path, directory, false )
                    .then( function ( success ) {
                        writeFile( path, file, data );
                    }, function ( error ) {
                        // If an existing directory exists
                        $cordovaFile.checkFile( path, file )
                            .then( function ( success ) {
                                $cordovaFile.readAsText( path, file )
                                    .then( function ( success ) {
                                        var arConf = success.split( '##' );
                                        if ( arConf.length == 3 ) {
                                            var arWebServiceURL = arConf[ 0 ].split( '=' );
                                            if ( is.not.empty( arWebServiceURL[ 1 ] ) ) {
                                                ENV.website = arWebServiceURL[ 1 ];
                                            }
                                            var arWebSiteURL = arConf[ 1 ].split( '=' );
                                            if ( is.not.empty( arWebSiteURL[ 1 ] ) ) {
                                                ENV.api = arWebSiteURL[ 1 ];
                                            }
                                            var arWebPort = arConf[ 2 ].split( '=' );
                                            if ( is.not.empty( arWebPort[ 1 ] ) ) {
                                                ENV.port = arWebPort[ 1 ];
                                            }
                                            ApiService.Init(true);
                                        } else {
                                            $cordovaFile.removeFile( path, file )
                                                .then( function ( success ) {
                                                    writeFile( path, file, data );
                                                }, function ( error ) {
                                                    $cordovaToast.showShortBottom( error );
                                                } );
                                        }
                                    }, function ( error ) {
                                        $cordovaToast.showShortBottom( error );
                                        console.error( error );
                                    } );
                            }, function ( error ) {
                                // If file not exists
                                writeFile( path, file, data );
                            } );
                    } );
            } else {
                ApiService.Init(true);
            }
        } );
    }
] );

appControllers.controller( 'SplashCtrl', [
    '$state',
    '$timeout',
    function(
        $state,
        $timeout ) {
        $timeout( function() {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        }, 2000 );
    } ] );

appControllers.controller( 'LoginCtrl', [
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$ionicPopup',
    '$timeout',
    'ApiService',
    function(
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $ionicPopup,
        $timeout,
        ApiService ) {
        $scope.logininfo = {};
        if ( undefined == $scope.logininfo.strUserName ) {
            $scope.logininfo.strUserName = '';
        }
        if ( undefined == $scope.logininfo.strPassword ) {
            $scope.logininfo.strPassword = '';
        }
        $( '#iUserName' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $( '#iPassword' ).focus();
            }
        } );
        $( '#iPassword' ).on( 'keydown', function( e ) {
            if ( e.which === 9 || e.which === 13 ) {
                $scope.login();
            }
        } );
        $scope.login = function() {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
            if ( $scope.logininfo.strUserName == '' ) {
                var popup = $ionicPopup.alert( {
                    title: 'Please Enter User Name.',
                    okType: 'button-assertive'
                } );
                $timeout( function() {
                    popup.close();
                }, 2500 );
                return;
            }
            /*
            if ($scope.logininfo.strPassword == '') {
                var popup = $ionicPopup.alert({
                    title: 'Please Enter Password.',
                    okType: 'button-assertive'
                });
                $timeout(function () {
                    popup.close();
                }, 2500);
                return;
            }
            */
            var objUri = ApiService.Uri( true, '/api/wms/login/check');
            objUri.addSearch('UserId',$scope.logininfo.strUserName);
            objUri.addSearch('Password',hex_md5( $scope.logininfo.strPassword ));
            ApiService.Get( objUri, true ).then( function success( result ) {
                $rootScope.$broadcast( 'login' );
                sessionStorage.clear();
                sessionStorage.setItem( 'UserId', $scope.logininfo.strUserName );
                $state.go( 'index.main', {}, {
                    reload: true
                } );
            } );
        };
    } ] );

appControllers.controller( 'SettingCtrl', [
    'ENV',
    '$scope',
    '$state',
    '$ionicHistory',
    '$ionicPopup',
    '$cordovaToast',
    '$cordovaFile',
    'ApiService',
    function(
        ENV,
        $scope,
        $state,
        $ionicHistory,
        $ionicPopup,
        $cordovaToast,
        $cordovaFile,
        ApiService ) {
        $scope.Setting = {
            Version:    ENV.version,
            WebApiURL:  ENV.api,
            WebSiteUrl: ENV.website,
            WebPort: ENV.port,
            blnWeb:    ENV.fromWeb
        };
        var writeFile = function ( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function ( success ) {
                    ApiService.Init(true);
                    $scope.return();
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $scope.return = function() {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'index.login', {}, {
                    reload: true
                } );
            }
        };
        $scope.save = function() {
            if ( is.not.empty( $scope.Setting.WebPort ) ) {
                ENV.port = $scope.Setting.WebPort;
            } else {
                $scope.Setting.WebPort = ENV.port;
            }
            if ( is.not.empty( $scope.Setting.WebApiURL ) ) {
                ENV.api = $scope.Setting.WebApiURL;
            } else {
                $scope.Setting.WebApiURL = ENV.api;
            }
            if ( is.not.empty( $scope.Setting.WebSiteUrl ) ) {
                ENV.website = $scope.Setting.WebSiteUrl;
            } else {
                $scope.Setting.WebSiteUrl = ENV.website;
            }
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website +
                    '##api=' + ENV.api +
                    '##port=' + ENV.port;
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                writeFile( path, file, data );
            } else {
                ApiService.Init(true);
                $scope.return();
            }
        };
        $scope.reset = function() {
            $scope.Setting.WebApiURL = ENV.reset.api;
            $scope.Setting.WebSiteUrl = ENV.reset.website;
            $scope.Setting.WebPort = ENV.reset.port;
            if ( !ENV.fromWeb ) {
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.removeFile( path, file )
                    .then( function( success ) {
                        ApiService.Init(true);
                        $scope.save();
                    }, function( error ) {
                        //$cordovaToast.showShortBottom( error );
                    } );
            }else{
                ApiService.Init(true);
            }
        };
    } ] );

appControllers.controller( 'UpdateCtrl', [
    'ENV',
    '$scope',
    '$state',
    '$stateParams',
    'DownloadFileService',
    'ApiService',
    function(
        ENV,
        $scope,
        $state,
        $stateParams,
        DownloadFileService,
        ApiService ) {
        $scope.strVersion = $stateParams.Version;
        $scope.return = function() {
            onError();
        };
        var onError = function() {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        };
        $scope.upgrade = function() {
            var strFilePath = ApiService.Url(ApiService.Uri(false, '/' + ENV.apkName + '.apk'));
            DownloadFileService.Download( strFilePath, 'application/vnd.android.package-archive', null, onError, onError );
        };
    } ] );

appControllers.controller( 'MainCtrl', [
    '$scope',
    '$state',
    '$ionicPopup',
    function(
        $scope,
        $state,
        $ionicPopup ) {
        $scope.func_Enquiry = function() {
            $state.go( 'enquiryList', {}, {
                reload: true
            } );
            /*
            $ionicPopup.alert( {
                title: 'Stay Tuned.',
                okType: 'button-calm'
            } );
            */
        };
        $scope.func_GR = function() {
            $state.go( 'grList', {}, {
                reload: true
            } );
        };
        $scope.func_Putaway = function() {
            $state.go( 'putawayList', {}, {
                reload: true
            } );
        };
        $scope.func_GT = function() {
            $state.go( 'gtList', {}, {
                reload: true
            } );
        };
        $scope.func_Vgin = function() {
            $state.go( 'vginList', {}, {
                reload: true
            } );
        };
        $scope.func_Picking = function() {
            $state.go( 'pickingList', {}, {
                reload: true
            } );
        };
    } ] );
