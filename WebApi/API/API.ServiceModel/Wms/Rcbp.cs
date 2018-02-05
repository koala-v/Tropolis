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
        public string TrxNo { get; set; }
        public string BusinessPartyName { get; set; }
        public string RecordCount { get; set; }
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
                    if (!string.IsNullOrEmpty(request.BusinessPartyName))
                    {
                        string strSQL = "Select Top 10 *,(Select Top 1 CountryName From Rccy1 Where CountryCode=Rcbp1.CountryCode) AS CountryName From Rcbp1 Where IsNUll(StatusCode,'')<>'DEL' And BusinessPartyName LIKE '" + request.BusinessPartyName + "%' Order By BusinessPartyCode Asc";
                        Result = db.Select<Rcbp1>(strSQL);
                    }
                    else if (!string.IsNullOrEmpty(request.TrxNo))
                    {
                        string strSQL = "Select top 1 *,(Select Top 1 CountryName From Rccy1 Where CountryCode=Rcbp1.CountryCode) AS CountryName From Rcbp1 Where IsNUll(StatusCode,'')<>'DEL' And TrxNo=" + int.Parse(request.TrxNo);
                        Result = db.Select<Rcbp1>(strSQL);
                    }
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Rcbp1> Get_Rcbp1_SpsList(Rcbp request)
        {
            List<Rcbp1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    int count = int.Parse(request.RecordCount);
                    string strWhere = "";
                    if (!string.IsNullOrEmpty(request.BusinessPartyName))
                    {
                        strWhere = " Where PartyType='CL' And BusinessPartyName LIKE '" + request.BusinessPartyName + "%'";
                    }
                    string strSelect = "SELECT " +
                    "r1.*, (Select Top 1 CountryName From Rccy1 Where CountryCode=r1.CountryCode) AS CountryName " +
                    "FROM Rcbp1 r1," +
                    "(SELECT TOP " + (count + 20) + " row_number() OVER (ORDER BY BusinessPartyName ASC) n, TrxNo FROM Rcbp1 " + strWhere + ") r2 " +
                    "WHERE r1.TrxNo = r2.TrxNo AND r2.n > " + count;
                    string strOrderBy = " ORDER BY r2.n ASC";
                    string strSQL = strSelect + strOrderBy;
                    Result = db.Select<Rcbp1>(strSQL);
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
