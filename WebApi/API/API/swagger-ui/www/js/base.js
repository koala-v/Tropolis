var objClone = function ( obj ) {
    var newObj = {};
    for ( var prop in obj ) {
        if ( obj.hasOwnProperty( prop ) ) {
            if ( is.object( obj[ prop ] ) ) {
                newObj[ prop ] = objClone( obj[ prop ] );
            } else {
                if ( is.null( obj[ prop ] ) || is.undefined( obj[ prop ] ) || is.equal( obj[ prop ], 'undefined' ) ) {
                    newObj[ prop ] = '';
                } else {
                    if(is.string(obj[ prop ])){
                        newObj[ prop ] = obj[ prop ].replace( /[\']/g, '\'\'' );
                    }else{
                        newObj[ prop ] = obj[ prop ];
                    }
                }
            }
        }
    }
    return newObj;
};


var db_add_Imsn1_Receipt = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Receipt (ReceiptNoteNo, ReceiptLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.ReceiptNoteNo, imsn1.ReceiptLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};
var db_query_Imgr2_Transfer = function ( callback ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'Select * from Imgr2_Transfer';
            tx.executeSql( dbSql, [], function ( tx, results ) {
                var len = results.rows.length;
                var arr = new Array();
                for ( var i = 0; i < len; i++ ) {
                    var imgr2 = {
                        TrxNo: results.rows.item( i ).TrxNo,
                        LineItemNo: results.rows.item( i ).LineItemNo,
                        StoreNo: results.rows.item( i ).StoreNo,
                        StoreNoFrom: results.rows.item( i ).StoreNoFrom,
                        StoreNoTo: results.rows.item( i ).StoreNoTo,
                        ProductTrxNo: results.rows.item( i ).ProductTrxNo,
                        ProductCode: results.rows.item( i ).ProductCode,
                        ProductDescription: results.rows.item( i ).ProductDescription,
                        SerialNoFlag: results.rows.item( i ).SerialNoFlag,
                        ScanQtyFrom: results.rows.item( i ).ScanQtyFrom > 0 ? results.rows.item( i ).ScanQtyFrom : 0,
                        ScanQtyTo: results.rows.item( i ).ScanQtyTo > 0 ? results.rows.item( i ).ScanQtyTo : 0,
                        BarCode: results.rows.item( i ).BarCode
                    };
                    arr.push( imgr2 );
                }
                if ( typeof ( callback ) == 'function' ) callback( arr );
            }, dbError )
        } );
    }
}
var db_add_Imsn1_Picking = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Picking (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};
var db_add_Imsn1_Verify = function ( imsn1 ) {
    if ( dbWms ) {
        dbWms.transaction( function ( tx ) {
            dbSql = 'INSERT INTO Imsn1_Verify (IssueNoteNo, IssueLineItemNo, SerialNo) values(?, ?, ?)';
            tx.executeSql( dbSql, [ imsn1.IssueNoteNo, imsn1.IssueLineItemNo, imsn1.SerialNo ], null, dbError );
        } );
    }
};
