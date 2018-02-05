using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WebApi.ServiceModel.Tables
{
				public class Imgr2_Transfer
    {
								public int TrxNo { get; set; }
								public int LineItemNo { get; set; }
								public string StoreNo { get; set; }
								public string StagingAreaFlag { get; set; }
								public string ProductCode { get; set; }
								public string ProductDescription { get; set; }
								public int Balance { get; set; }
								public int Qty { get; set; }
								public string NewStoreNo { get; set; }
    }
}
