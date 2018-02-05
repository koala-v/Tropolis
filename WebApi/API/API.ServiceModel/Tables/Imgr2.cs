using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
    public class Imgr2
    {
        public int TrxNo { get; set; }
        public int LineItemNo { get; set; }
        public string StoreNo { get; set; }
        public string WarehouseCode { get; set; }
        public int MovementTrxNo { get; set; }
        public int ProductTrxNo { get; set; }
        public string ProductCode { get; set; }
        public string DimensionFlag { get; set; }
        public int PackingQty { get; set; }
        public int WholeQty { get; set; }
        public int LooseQty { get; set; }
        public decimal Volume { get; set; }
        public decimal Weight { get; set; }
        public decimal SpaceArea { get; set; }
        public string UserDefine1 { get; set; }
    }
}
