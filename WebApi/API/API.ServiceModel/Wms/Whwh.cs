using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using ServiceStack;
using ServiceStack.ServiceHost;
using ServiceStack.OrmLite;
using WebApi.ServiceModel.Tables;

namespace WebApi.ServiceModel.Wms
{
    [Route("/wms/whwh1", "Get")]				//whwh1?WarehouseName=
    [Route("/wms/whwh2", "Get")]				//whwh2?WarehouseCode= & StagingAreaFlag= &StoreNo=
    public class Whwh : IReturn<CommonResponse>
    {
        public string WarehouseName { get; set; }
        public string WarehouseCode { get; set; }
        public string StagingAreaFlag { get; set; }
        public string StoreNo { get; set; }
        public string VerifyStoreNo { get; set; }
    }
    public class Whwh_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Whwh1> Get_Whwh1_List(Whwh request)
        {
            List<Whwh1> Result = null;
            string strSQL = "";
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (request.WarehouseName != null && request.WarehouseName != "")
                    { strSQL = "Select * From Whwh1 Where WarehouseName LIKE '" + request.WarehouseName + "%'"; }
                    else
                    {
                        strSQL = "Select * From Whwh1 Where WarehouseCode =(Select Top 1 DefaultWarehouseCode from impa1)";
                    }
                        
                    Result = db.Select<Whwh1>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Whwh2> Get_Whwh2_List(Whwh request)
        {
            List<Whwh2> Result = null;
            string strSQL = "";
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (!string.IsNullOrEmpty(request.StoreNo))
                    {
                        if ((!string.IsNullOrEmpty(request.VerifyStoreNo)) && request.VerifyStoreNo == "Y"){
                            strSQL = "Select  * From Whwh2 Where StoreNo = '" + request.StoreNo + "'";
                        } else {
                            strSQL = "Select Top 10 * From Whwh2 Where WarehouseCode='" + request.WarehouseCode + "' And StoreNo LIKE '" + request.StoreNo + "%'";
                        }

                     
                    }
                    else if (!string.IsNullOrEmpty(request.StagingAreaFlag))
                    {
                        strSQL = "Select * From Whwh2 Where WarehouseCode='" + request.WarehouseCode + "' And IsNull(StagingAreaFlag,'')='" + request.StagingAreaFlag + "'";
                    }
                    else
                    {
                        strSQL = "Select * From Whwh2 Where WarehouseCode='" + request.WarehouseCode + "'";
                    }
                    Result = db.Select<Whwh2>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
