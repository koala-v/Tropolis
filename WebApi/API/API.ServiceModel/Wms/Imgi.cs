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
    [Route("/wms/imgi1", "Get")]                //imgi1?GoodsIssueNoteNo= &CustomerCode= &StatusCode=
    [Route("/wms/imgi1/update", "Get")]             //imgi1?TrxNo= &UserID= &StatusCode=
    [Route("/wms/imgi2", "Get")]                //imgi2?GoodsIssueNoteNo=
    [Route("/wms/imgi2/picking", "Get")]                //picking?GoodsIssueNoteNo=
    [Route("/wms/imgi2/verify", "Get")]					//verify?GoodsIssueNoteNo=
    public class Imgi : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
        public string GoodsIssueNoteNo { get; set; }
        public string TrxNo { get; set; }
        public string UserID { get; set; }
        public string StatusCode { get; set; }
    }
    public class Imgi_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imgi1> Get_Imgi1_List(Imgi request)
        {
            List<Imgi1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (!string.IsNullOrEmpty(request.CustomerCode))
                    {
                        if (!string.IsNullOrEmpty(request.StatusCode))
                        {
                            Result = db.Select<Imgi1>("Select * from imgi1 where StatusCode = 'EXE' AND Convert(Char(10), IssueDateTime, 20) = Convert(Char(10), getdate(), 20) AND CustomerCode = " + Modfunction.SQLSafeValue(request.CustomerCode));
                            //Result = db.SelectParam<Imgi1>(
                            //            i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.CustomerCode == request.CustomerCode
                            //).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                        }
                        else
                        {
                            Result = db.SelectParam<Imgi1>(
                                            i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.CustomerCode == request.CustomerCode
                            ).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                        }

                    }
                    else if (!string.IsNullOrEmpty(request.GoodsIssueNoteNo))
                    {
                        if (!string.IsNullOrEmpty(request.StatusCode))
                        {
                            Result = db.Select<Imgi1>("Select * from imgi1 where StatusCode = 'EXE' AND Convert(Char(10), IssueDateTime, 20) = Convert(Char(10), getdate(), 20) AND GoodsIssueNoteNo like '"+ Modfunction.SQLSafe(request.GoodsIssueNoteNo) + "%'");
                            //Result = db.SelectParam<Imgi1>(
                            //                i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.GoodsIssueNoteNo.StartsWith(request.GoodsIssueNoteNo)
                            //).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                        }
                        else
                        {
                            Result = db.SelectParam<Imgi1>(
                                            i => i.CustomerCode != null && i.CustomerCode != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.GoodsIssueNoteNo.StartsWith(request.GoodsIssueNoteNo)
                            ).OrderByDescending(i => i.IssueDateTime).ToList<Imgi1>();
                        }

                    }
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgi2_Picking> Get_Imgi2_Picking_List(Imgi request)
        {
            List<Imgi2_Picking> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    List<Impa1> impa1 = db.Select<Impa1>("Select * from Impa1");
                    string strBarCodeFiled = impa1[0].BarCodeField;
                    string strSql = "Select RowNum = ROW_NUMBER() OVER (ORDER BY Imgi2.StoreNo ASC), " +
                                    "Imgi2.*, " +
                                    "(Select Top 1 UserDefine1 From Impm1 Where TrxNo=Imgi2.ReceiptMovementTrxNo) AS SerialNo," +
                                    "(Select Top 1 " + strBarCodeFiled + " From Impr1 Where TrxNo=Imgi2.ProductTrxNo) AS BarCode," +
                                    "(Select Top 1 SerialNoFlag From Impr1 Where TrxNo=Imgi2.ProductTrxNo) AS SerialNoFlag," +
                                    "(CASE Imgi2.DimensionFlag When '1' THEN Imgi2.PackingQty When '2' THEN Imgi2.WholeQty ELSE Imgi2.LooseQty END) AS Qty, " +
                                    "0 AS QtyBal, 0 AS ScanQty " +
                                    "From Imgi2 " +
                                    "Left Join Imgi1 On Imgi2.TrxNo=Imgi1.TrxNo " +
                                    "Where IsNull(Imgi1.StatusCode,'')='USE' And Imgi1.GoodsIssueNoteNo='" + request.GoodsIssueNoteNo + "'";
                    Result = db.Select<Imgi2_Picking>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgi2_Verify> Get_Imgi2_Verify_List(Imgi request)
        {
            List<Imgi2_Verify> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    List<Impa1> impa1 = db.Select<Impa1>("Select * from Impa1");
                    string strBarCodeFiled = impa1[0].BarCodeField;
                    string strSql = "Select RowNum = ROW_NUMBER() OVER (ORDER BY Imgi2.StoreNo ASC), " +
                                    "Imgi2.*, " +
                                    "(Select Top 1 UserDefine1 From Impm1 Where TrxNo=Imgi2.ReceiptMovementTrxNo) AS SerialNo," +
                                    "(Select Top 1 " + strBarCodeFiled + " From Impr1 Where TrxNo=Imgi2.ProductTrxNo) AS BarCode," +
                                    "(Select Top 1 SerialNoFlag From Impr1 Where TrxNo=Imgi2.ProductTrxNo) AS SerialNoFlag," +
                                    "(CASE Imgi2.DimensionFlag When '1' THEN Imgi2.PackingQty When '2' THEN Imgi2.WholeQty ELSE Imgi2.LooseQty END) AS Qty, " +
                                    "0 AS QtyBal, 0 AS ScanQty " +
                                    "From Imgi2 " +
                                    "Left Join Imgi1 On Imgi2.TrxNo=Imgi1.TrxNo " +
                                    "Where IsNull(Imgi1.StatusCode,'')='EXE'  And Imgi1.GoodsIssueNoteNo='" + request.GoodsIssueNoteNo + "'";
                    Result = db.Select<Imgi2_Verify>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public int Update_Imgi1_Status(Imgi request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    Result = db.Update<Imgi1>(
                                    new
                                    {
                                        StatusCode = request.StatusCode,
                                        CompleteBy = request.UserID,
                                        CompleteDate = DateTime.Now,
                                        UpdateBy= request.UserID,
                                        UpdateDateTime= DateTime.Now

                                    },
                                    p => p.TrxNo == int.Parse(request.TrxNo)
                    );
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
