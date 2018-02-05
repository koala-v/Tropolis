'use strict';
var appService = angular.module( 'WMSAPP.services', [
    'ionic',
    'ngCordova',
    'WMSAPP.config',
    'WMSAPP.factories'
] );

appService.service( 'ApiService', [
    '$q',
    'ENV',
    '$http',
    '$ionicLoading',
    '$ionicPopup',
    '$timeout',
    'PopupService',
    function (
        $q,
        ENV,
        $http,
        $ionicLoading,
        $ionicPopup,
        $timeout,
        PopupService ) {
        var parts = {},
            folder = '';
        this.Init = function ( blnApi ) {
            var url = blnApi ? ENV.api : ENV.website;
            var urls = url.split( '/' );
            parts = {
                protocol: null,
                username: null,
                password: null,
                hostname: urls[ 0 ],
                port: ENV.port,
                path: url.replace( urls[ 0 ], '' ),
                query: null,
                fragment: null
            };
            if ( is.equal( document.location.protocol, 'https:' ) ) {
                parts.protocol = 'https';
            } else {
                parts.protocol = 'http';
            }
            folder = parts.path;
        };
        this.Uri = function ( blnApi, path ) {
            if ( is.empty( parts ) ) {
                this.Init( blnApi );
            }
            parts.path = folder + path;
            return new URI( URI.build( parts ) );
        };
        this.Url = function ( uri ) {
            if ( is.object( uri ) ) {
                return uri.normalizeProtocol().normalizeHostname().normalizePort().normalizeSearch().toString();
            } else {
                return '';
            }
        };
        this.Post = function ( uri, requestData, blnShowLoad, popup ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            //var strSignature = hex_md5( uri + ENV.appId.replace( /-/ig, "" ) );
            if ( is.object( uri ) ) {
                var url = uri.addSearch( 'format', 'json' ).normalizeProtocol().normalizeHostname().normalizePort().normalizeSearch().toString();
                console.log( url );
                var config = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                $http.post( url, requestData, config ).success( function ( result, status, headers, config, statusText ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    if ( is.equal( result.meta.code, 200 ) && ( is.equal( result.meta.errors.code, 0 ) || is.equal( result.meta.errors.code, 200 ) ) ) {
                        deferred.resolve( result );
                    } else {
                        deferred.reject( result );
                        PopupService.Alert( popup, result.meta.message, result.meta.errors.message );
                    }
                } ).error( function ( result, status, headers, config, statusText ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    deferred.reject( result );
                    console.error( result );
                } );
            } else {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( null );
                console.error( 'uri is not an object' );
            }
            return deferred.promise;
        };
        this.Get = function ( uri, blnShowLoad, popup ) {
            if ( blnShowLoad ) {
                $ionicLoading.show();
            }
            var deferred = $q.defer();
            if ( is.object( uri ) ) {
                var url = uri.addSearch( 'format', 'json' ).normalizeProtocol().normalizeHostname().normalizePort().normalizeSearch().toString();
                console.log( url );
                $http( {
                    method: 'GET',
                    url: url
                } ).then( function ( response ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    var result = response.data;
                    if ( is.equal( result.meta.code, 200 ) && ( is.equal( result.meta.errors.code, 0 ) || is.equal( result.meta.errors.code, 200 ) ) ) {
                        deferred.resolve( result );
                    } else {
                        deferred.reject( result );
                        PopupService.Alert( popup, result.meta.message, result.meta.errors.message );
                    }
                }, function ( response ) {
                    if ( blnShowLoad ) {
                        $ionicLoading.hide();
                    }
                    deferred.reject( response.data );
                    console.log( response.status );
                    PopupService.Alert( popup, response.data || 'Request failed' );
                } )
            } else {
                if ( blnShowLoad ) {
                    $ionicLoading.hide();
                }
                deferred.reject( null );
                console.error( 'uri is not an object' );
            }
            return deferred.promise;
        };
    }
] );

appService.service( 'SqlService', [
    '$q',
    'ENV',
    '$timeout',
    '$ionicLoading',
    '$cordovaSQLite',
    '$cordovaToast',
    'PopupService',
    function (
        $q,
        ENV,
        $timeout,
        $ionicLoading,
        $cordovaSQLite,
        $cordovaToast,
        PopupService ) {
        var db_websql, db_sqlite;
        this.Init = function () {
            var deferred = $q.defer();
            if ( ENV.fromWeb ) {
                db_websql = window.openDatabase(
                    ENV.websql.name,
                    ENV.websql.version,
                    ENV.websql.displayName,
                    ENV.websql.estimatedSize
                );
                if ( db_websql ) {
                    deferred.resolve( db_websql );
                } else {
                    deferred.reject( null );
                    console.error( 'Unable initialize WebSql' );
                }
            } else {
                try {
                    db_sqlite = $cordovaSQLite.openDB( {
                        name: ENV.sqlite.name,
                        location: ENV.sqlite.location
                    } );
                    deferred.resolve( db_sqlite );
                } catch ( error ) {
                    deferred.reject( error );
                    console.error( error );
                }
            }
            return deferred.promise;
        }
        this.Drop = function ( table ) {
            var deferred = $q.defer();
            var strSql = 'Drop Table If Exists ' + table;
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                            deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error.message );
                        } );
                    } );
                } else {
                    deferred.reject( null );
                    console.error( 'No WebSql Instance' );
                    PopupService.Alert( null, 'No WebSql Instance' );
                }
            } else {
                $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                            deferred.resolve( results );
                        },
                        function ( error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error );
                        }
                    );
            }
            return deferred.promise;
        };
        this.Create = function ( table, obj ) {
            var deferred = $q.defer();
            var strSql = 'Create Table if not exists ' + table;
            if ( is.not.empty( obj ) ) {
                var fileds = '',
                    newObj = objClone( obj );
                for ( var prop in newObj ) {
                    if ( newObj.hasOwnProperty( prop ) ) {
                        if ( is.empty( fileds ) ) {
                            fileds = prop + ' ' + newObj[ prop ];
                        } else {
                            fileds = fileds + ',' + prop + ' ' + newObj[ prop ];
                        }
                    }
                }
                strSql = strSql + '(' + fileds + ')';
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        PopupService.Alert( null, 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error );
                            }
                        );
                }
            } else {
                deferred.reject( null );
                console.error( 'Insert Script Error' );
                PopupService.Alert( null, 'Insert Script Error' );

            }
            return deferred.promise;
        };
        this.Delete = function ( table, key, value ) {
            var deferred = $q.defer();
            var strSql = 'Delete From ' + table;
            if ( is.not.undefined( key ) && is.not.empty( key ) && is.not.undefined( value ) && is.not.empty( value ) ) {
                if ( is.string( value ) ) {
                    value = '\'' + value + '\'';
                }
                strSql = strSql + ' Where ' + key + '=' + value;
            }
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                            deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error.message );
                        } );
                    } );
                } else {
                    deferred.reject( null );
                    console.error( 'No WebSql Instance' );
                    PopupService.Alert( null, 'No WebSql Instance' );
                }
            } else {
                $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                            deferred.resolve( results );
                        },
                        function ( error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error );
                        }
                    );
            }
            return deferred.promise;
        };
        this.Select = function ( table, filed, filters ) {
            var deferred = $q.defer();
            if ( is.undefined( table ) || is.undefined( filed ) ) {
                deferred.reject( null );
                console.error( 'undefined parameter' );
                PopupService.Alert( null, 'undefined parameter' );
            }
            var strSql = 'Select ' + filed + ' From ' + table;
            if ( is.not.undefined( filters ) ) {
                strSql = strSql + ' Where ' + filters;
            }
            if ( ENV.fromWeb ) {
                if ( db_websql ) {
                    db_websql.transaction( function ( tx ) {
                        tx.executeSql( strSql, [], function ( tx, results ) {
                            deferred.resolve( results );
                        }, function ( tx, error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error.message );
                        } );
                    } );
                } else {
                    deferred.reject( null );
                    console.error( 'No WebSql Instance' );
                    PopupService.Alert( null, 'No WebSql Instance' );
                }
            } else {
                $cordovaSQLite.execute( db_sqlite, strSql )
                    .then( function ( results ) {
                            deferred.resolve( results );
                        },
                        function ( error ) {
                            deferred.reject( error );
                            console.error( error );
                            PopupService.Alert( null, error );
                        }
                    );
            }
            return deferred.promise;
        };
        this.Insert = function ( table, obj ) {
            var deferred = $q.defer();
            var strSql = 'Insert Into ' + table;
            if ( is.not.empty( obj ) ) {
                var fileds = '',
                    values = '',
                    newObj = objClone( obj );
                for ( var prop in newObj ) {
                    if ( newObj.hasOwnProperty( prop ) && is.not.equal( prop, '__type' ) ) {
                        if ( is.string( newObj[ prop ] ) ) {
                            newObj[ prop ] = '\'' + newObj[ prop ] + '\'';
                        }
                        if ( is.empty( fileds ) ) {
                            fileds = prop;
                        } else {
                            fileds = fileds + ',' + prop;
                        }
                        if ( is.empty( values ) ) {
                            values = newObj[ prop ];
                        } else {
                            values = values + ',' + newObj[ prop ];
                        }
                    }
                }
                strSql = strSql + '(' + fileds + ') values(' + values + ')';
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        PopupService.Alert( null, 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error );
                            }
                        );
                }
            } else {
                deferred.reject( null );
                console.error( 'Insert Script Error' );
                PopupService.Alert( null, 'Insert Script Error' );
            }
            return deferred.promise;
        };
        this.Update = function ( table, obj, strFilter ) {
            var deferred = $q.defer();
            var strSql = 'Update ' + table + ' Set ';
            if ( is.not.empty( obj ) ) {
                var fileds = '',
                    newObj = objClone( obj );
                for ( var prop in newObj ) {
                    if ( newObj.hasOwnProperty( prop ) ) {
                        if ( is.string( newObj[ prop ] ) ) {
                            newObj[ prop ] = '\'' + newObj[ prop ] + '\'';
                        }
                        if ( is.empty( fileds ) ) {
                            fileds = prop + '=' + newObj[ prop ];
                        } else {
                            fileds = fileds + ',' + prop + '=' + newObj[ prop ];
                        }
                    }
                }
                strSql = strSql + fileds;
                if ( is.not.empty( strFilter ) && is.not.empty( strFilter ) ) {
                    strSql = strSql + ' Where ' + strFilter;
                }
                if ( ENV.fromWeb ) {
                    if ( db_websql ) {
                        db_websql.transaction( function ( tx ) {
                            tx.executeSql( strSql, [], function ( tx, results ) {
                                deferred.resolve( results );
                            }, function ( tx, error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error.message );
                            } );
                        } );
                    } else {
                        deferred.reject( null );
                        console.error( 'No WebSql Instance' );
                        PopupService.Alert( null, 'No WebSql Instance' );
                    }
                } else {
                    $cordovaSQLite.execute( db_sqlite, strSql )
                        .then( function ( results ) {
                                deferred.resolve( results );
                            },
                            function ( error ) {
                                deferred.reject( error );
                                console.error( error );
                                PopupService.Alert( null, error );
                            }
                        );
                }
            } else {
                deferred.reject( null );
                console.error( 'Update Script Error' );
                PopupService.Alert( null, 'Update Script Error' );
            }
            return deferred.promise;
        };
    }
] );

appService.service( 'PopupService', [
    '$q',
    '$ionicPopup',
    function (
        $q,
        $ionicPopup ) {
        this.Alert = function ( popup, title, subtitle ) {
            var deferred = $q.defer();
            if ( is.null( popup ) || is.undefined( popup ) ) {
                popup = $ionicPopup.alert( {
                    title: title,
                    subTitle: subtitle,
                    okType: 'button-assertive'
                } );
                popup.then( function ( res ) {
                    deferred.resolve( res );
                } );
            } else {
                popup.close();
                popup = null;
                deferred.reject( popup );
            }
            return deferred.promise;
        };
        this.Info = function ( popup, title, subtitle ) {
            var deferred = $q.defer();
            if ( is.null( popup ) || is.undefined( popup ) ) {
                popup = $ionicPopup.alert( {
                    title: title,
                    subTitle: subtitle,
                    okType: 'button-calm'
                } );
                popup.then( function ( res ) {
                    deferred.resolve( res );
                } );
            } else {
                popup.close();
                popup = null;
                deferred.reject( popup );
            }
            return deferred.promise;
        };
        this.Confirm = function ( popup, title, template ) {
            var deferred = $q.defer();
            if ( is.null( popup ) || is.undefined( popup ) ) {
                popup = $ionicPopup.confirm( {
                    title: title,
                    template: template,
                } );
                popup.then( function ( res ) {
                    deferred.resolve( res );
                } );
            } else {
                popup.close();
                popup = null;
                deferred.reject( popup );
            }
            return deferred.promise;

        };
        this.Show = function ( popup, type, title, subtitle ) {
            var deferred = $q.defer();
            if ( is.null( popup ) ) {
                popup = $ionicPopup.alert( {
                    title: title,
                    subTitle: subtitle,
                    okType: 'button-' + type
                } );
                popup.then( function ( res ) {
                    deferred.resolve( res );
                } );
            } else {
                popup.close();
                popup = null;
                deferred.reject( popup );
            }
            return deferred.promise;
        };
    } ] );

appService.service( 'DownloadFileService', [
    'ENV',
    '$http',
    '$timeout',
    '$ionicLoading',
    '$cordovaToast',
    '$cordovaFile',
    '$cordovaFileTransfer',
    '$cordovaFileOpener2',
    function (
        ENV,
        $http,
        $timeout,
        $ionicLoading,
        $cordovaToast,
        $cordovaFile,
        $cordovaFileTransfer,
        $cordovaFileOpener2 ) {
        this.Download = function ( url, fileName, fileType, onPlatformError, onCheckError, onDownloadError ) {
            $ionicLoading.show( {
                template: 'Download  0%'
            } );
            var blnError = false;
            if ( !ENV.fromWeb ) {
                $cordovaFile.checkFile( cordova.file.externalRootDirectory + '/' + ENV.rootPath, fileName )
                    .then( function ( success ) {
                        //
                    }, function ( error ) {
                        blnError = true;
                    } ).catch( function ( ex ) {
                        console.log( ex );
                    } );
                var targetPath = cordova.file.externalRootDirectory + '/' + ENV.rootPath + '/' + fileName;
                var trustHosts = true;
                var options = {};
                if ( !blnError ) {
                    $cordovaFileTransfer.download( url, targetPath, trustHosts, options ).then( function ( result ) {
                        $ionicLoading.hide();
                        $cordovaFileOpener2.open( targetPath, fileType ).then( function () {
                            // success
                        }, function ( err ) {
                            // error
                        } ).catch( function ( ex ) {
                            console.log( ex );
                        } );
                    }, function ( err ) {
                        $cordovaToast.showShortCenter( 'Download faild.' );
                        $ionicLoading.hide();
                        if ( onDownloadError ) onDownloadError();
                    }, function ( progress ) {
                        $timeout( function () {
                            var downloadProgress = ( progress.loaded / progress.total ) * 100;
                            $ionicLoading.show( {
                                template: 'Download  ' + Math.floor( downloadProgress ) + '%'
                            } );
                            if ( downloadProgress > 99 ) {
                                $ionicLoading.hide();
                            }
                        } )
                    } ).catch( function ( ex ) {
                        console.log( ex );
                    } );
                } else {
                    $ionicLoading.hide();
                    $cordovaToast.showShortCenter( 'Check file faild.' );
                    if ( onCheckError ) onCheckError();
                }
            } else {
                $ionicLoading.hide();
                if ( onPlatformError ) onPlatformError( url );
            }
        };
    } ] );
