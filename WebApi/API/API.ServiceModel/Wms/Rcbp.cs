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
    //[Route("/wms/rcbp1/sps", "Get")]				//sps?RecordCount= & BusinessPartyName=
    [Route("/wms/rcbp1", "Get")]								//rcbp1?BusinessPartyName= &TrxNo=			
    public class Rcbp : IReturn<CommonResponse>
    {
      
        public string UserDefine01 { get; set; }    //  imgr1.UserDefine01   
    }
    public class WMSRcbp_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Rcbp1> Get_Rcbp1_List(Rcbp request)
         {
            List<Rcbp1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (!string.IsNullOrEmpty(request.UserDefine01))
                    {
                        string strSQL = "Select Top 10 * From imgr1 Where IsNUll(StatusCode,'')<>'DEL' And UserDefine01 LIKE '" + request.UserDefine01 + "%' Order By UserDefine01 Asc";
                        Result = db.Select<Rcbp1>(strSQL);
                    }
                   
                }
            }
            catch { throw; }
            return Result;
        }

    }
}
