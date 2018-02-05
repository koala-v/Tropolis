using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
    public class Imgi2_Verify
    {
								public int RowNum { get; set; }
								public int TrxNo { get; set; }
								public int LineItemNo { get; set; }
								public string StoreNo { get; set; }
								public int ProductTrxNo { get; set; }
								public string ProductCode { get; set; }
								public string ProductDescription { get; set; }
								public string SerialNoFlag { get; set; }
								public string BarCode { get; set; }
								public string SerialNo { get; set; }
								public int Qty { get; set; }
								public int QtyBal { get; set; }
								public int ScanQty { get; set; }
    }
}
