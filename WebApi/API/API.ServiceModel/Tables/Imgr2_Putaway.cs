using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
    public class Imgr2_Putaway
    {
        public int TrxNo { get; set; }
        public int LineItemNo { get; set; }
        public string StoreNo { get; set; }
        public string StagingAreaFlag { get; set; }
        public string ProductCode { get; set; }
        public string CustomerCode { get; set; }
        public string ProductDescription { get; set; }
        public string UserDefine1 { get; set; }
        public string GoodsReceiptNoteNo { get; set; }
        public int Qty { get; set; }
    }
}
