var appFactory = angular.module( 'WMSAPP.factories', [
] );

appFactory.factory( 'TABLE_DB', function () {
    var TABLE_DB = {
        Imgr2_Receipt: {
            TrxNo: 'INT',
            LineItemNo: 'INT',
            ProductTrxNo: 'INT',
            ProductCode: 'TEXT',
            CustomerCode: 'TEXT',
            GoodsReceiptNoteNo: 'TEXT',
            ProductDescription: 'TEXT',
            UserDefine1: 'TEXT',
            SerialNoFlag: 'TEXT',
            BarCode: 'TEXT',
            DimensionFlag: 'TEXT',
            PackingQty: 'INT',
            WholeQty: 'INT',
            LooseQty: 'INT',
            ScanQty: 'INT'
        },
        Imsn1_Receipt: {
            ReceiptNoteNo: 'TEXT',
            ReceiptLineItemNo: 'INT',
            IssueNoteNo: 'TEXT',
            IssueLineItemNo: 'INT',
            SerialNo: 'TEXT'
        },
        Imgr2_Putaway: {
            TrxNo: 'INT',
            LineItemNo: 'INT',
            StoreNo: 'TEXT',
            StagingAreaFlag: 'TEXT',
            CustomerCode: 'TEXT',
            GoodsReceiptNoteNo: 'TEXT',
            ProductTrxNo: 'INT',
            ProductCode: 'TEXT',
            BarCode: 'TEXT',
            DimensionFlag: 'TEXT',
            PackingQty: 'INT',
            WholeQty: 'INT',
            LooseQty: 'INT',
            ScanQty: 'INT'
        },
        Imsn1_Putaway: {
            ReceiptNoteNo:'TEXT',
            ReceiptLineItemNo:'INT',
            IssueNoteNo:'TEXT',
            IssueLineItemNo:'INT',
            SerialNo:'TEXT'
        },
        Imgr2_Transfer : {
            TrxNo:'INT',
            LineItemNo:'INT',
            StoreNo:'TEXT',
            StoreNoFrom:'TEXT',
            StoreNoTo:'TEXT',
            ProductTrxNo:'INT',
            ProductCode:'TEXT',
            ProductDescription:'TEXT',
            SerialNoFlag:'TEXT',
            BarCode:'TEXT',
            ScanQtyFrom:'INT',
            ScanQtyTo:'INT'
        },
        Imsn1_Transfer : {
            ReceiptNoteNo:'TEXT',
            ReceiptLineItemNo:'INT',
            IssueNoteNo:'TEXT',
            IssueLineItemNo:'INT',
            SerialNo:'TEXT'
        },
        Imgi2_Picking : {
            RowNum:'INT',
            TrxNo:'INT',
            LineItemNo:'INT',
            StoreNo:'TEXT',
            ProductTrxNo:'INT',
            ProductCode:'TEXT',
            ProductDescription:'TEXT',
            SerialNoFlag:'TEXT',
            SerialNo:'TEXT',
            BarCode:'TEXT',
            Qty:'INT',
            ScanQty:'INT',
            QtyBal:'INT'
        },
        Imsn1_Picking:{
            ReceiptNoteNo:'TEXT',
            ReceiptLineItemNo:'INT',
            IssueNoteNo:'TEXT',
            IssueLineItemNo:'INT',
            SerialNo:'TEXT'
        },
        Imgi2_Verify : {
            RowNum:'INT',
            TrxNo:'INT',
            LineItemNo:'INT',
            ProductTrxNo:'INT',
            ProductCode:'TEXT',
            ProductDescription:'TEXT',
            StoreNo:'TEXT',
            SerialNoFlag:'TEXT',
            SerialNo:'TEXT',
            BarCode:'TEXT',
            Qty:'INT',
            ScanQty:'INT',
            QtyBal:'INT'
        },
        Imsn1_Verify : {
            ReceiptNoteNo:'TEXT',
            ReceiptLineItemNo:'INT',
            IssueNoteNo:'TEXT',
            IssueLineItemNo:'INT',
            SerialNo:'TEXT'
        }
    };
    return TABLE_DB;
} );
