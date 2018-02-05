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
    [Route("/wms/imgr1", "Get")]                                                //imgr1?GoodsReceiptNoteNo= & CustomerCode= & StatusCode=
    [Route("/wms/imgr1/confirm", "Get")]                //confirm?TrxNo= &UserID=
    [Route("/wms/imgr2/receipt", "Get")]                //receipt?GoodsReceiptNoteNo=
    [Route("/wms/imgr2/putaway", "Get")]                //putaway?GoodsReceiptNoteNo=
    [Route("/wms/imgr2/putaway/update", "Get")]             //update?StoreNo= & TrxNo= & LineItemNo=
    [Route("/wms/imgr2/transfer", "Get")]			//transfer?GoodsReceiptNoteNo=
    public class Imgr : IReturn<CommonResponse>
    {
        public string CustomerCode { get; set; }
        public string GoodsReceiptNoteNo { get; set; }
        public string StatusCode { get; set; }
        public string TrxNo { get; set; }
        public string UserID { get; set; }
        public string StoreNo { get; set; }
        public string LineItemNo { get; set; }
    }
    public class Imgr_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imgr1> Get_Imgr1_List(Imgr request)
        {
            List<Imgr1> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if (!string.IsNullOrEmpty(request.CustomerCode))
                    {
                        if (string.IsNullOrEmpty(request.StatusCode))
                        {
                            //Result = db.SelectParam<Imgr1>(
                            //				i => i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.CustomerCode == request.CustomerCode
                            //).OrderByDescending(i => i.ReceiptDate).ToList<Imgr1>();
                            Result = db.Select<Imgr1>(
                                            "Select Top 10 Imgr1.* From Imgr1 " +
                                            "Where IsNull(GoodsReceiptNoteNo,'')<>'' And IsNUll(StatusCode,'')<>'DEL' And IsNUll(StatusCode,'')<>'EXE' And IsNUll(StatusCode,'')<>'CMP' " +
                                             "And (Select count(*) from Imgr2 Where Imgr2.TrxNo=Imgr1.TrxNo) > 0 " +
                                           "And IsNUll(CustomerCode,'') = '" + request.CustomerCode + "' " +
                                            "Order By Imgr1.ReceiptDate Desc"
                            );
                        }
                        else
                        {
                            //Result = db.SelectParam<Imgr1>(
                            //				i => i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode == request.StatusCode && i.CustomerCode == request.CustomerCode
                            //).OrderByDescending(i => i.ReceiptDate).ToList<Imgr1>();
                            Result = db.Select<Imgr1>(
                                            "Select Top 10 Imgr1.* From Imgr1 " +
                                            "Where IsNull(GoodsReceiptNoteNo,'')<>'' " +
                                             "And (Select count(*) from Imgr2 Where Imgr2.TrxNo=Imgr1.TrxNo) > 0 " +
                                           "And IsNUll(StatusCode,'') = '" + request.StatusCode + "' " +
                                            "And IsNUll(CustomerCode,'') = '" + request.CustomerCode + "' " +
                                            "Order By Imgr1.ReceiptDate Desc"
                            );
                        }
                    }
                    else if (!string.IsNullOrEmpty(request.GoodsReceiptNoteNo))
                    {
                        if (string.IsNullOrEmpty(request.StatusCode))
                        {
                            //Result = db.SelectParam<Imgr1>(
                            //					i => i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode != null && i.StatusCode != "DEL" && i.StatusCode != "EXE" && i.StatusCode != "CMP" && i.GoodsReceiptNoteNo.StartsWith(request.GoodsReceiptNoteNo)
                            //);
                            Result = db.Select<Imgr1>(
                                            "Select Top 10 Imgr1.* From Imgr1 " +
                                            "Where IsNUll(StatusCode,'')<>'DEL' And IsNUll(StatusCode,'')<>'EXE' And IsNUll(StatusCode,'')<>'CMP' " +
                                            "And (Select count(*) from Imgr2 Where Imgr2.TrxNo=Imgr1.TrxNo) > 0 " +
                                            "And IsNUll(GoodsReceiptNoteNo,'') LIKE '" + request.GoodsReceiptNoteNo + "%'" 
                                            //"And IsNUll(CustomerCode,'') = '" + request.CustomerCode + "' " 


                            );
                        }
                        else
                        {
                            //Result = db.SelectParam<Imgr1>(
                            //					i => i.GoodsReceiptNoteNo != null && i.GoodsReceiptNoteNo != "" && i.StatusCode == request.StatusCode && i.GoodsReceiptNoteNo.StartsWith(request.GoodsReceiptNoteNo)
                            //);
                            Result = db.Select<Imgr1>(
                                            "Select Top 10 Imgr1.* From Imgr1 " +
                                            "Where IsNUll(StatusCode,'')='" + request.StatusCode + "' " +
                                            "And (Select count(*) from Imgr2 Where Imgr2.TrxNo=Imgr1.TrxNo) > 0 " +
                                            "And IsNUll(GoodsReceiptNoteNo,'') LIKE '" + request.GoodsReceiptNoteNo + "%'"
                            );
                        }
                    }
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgr2> Get_Imgr2_List(Imgr request)
        {
            List<Imgr2> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    Result = db.Select<Imgr2>(
                                    "Select Imgr2.* From Imgr2 " +
                                    "Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
                                    "Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'"
                    );
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgr2_Receipt> Get_Imgr2_Receipt_List(Imgr request)
        {
            List<Imgr2_Receipt> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    List<Impa1> impa1 = db.Select<Impa1>("Select * from Impa1");
                    string strBarCodeFiled = impa1[0].BarCodeField;
                    string strSql = "Select Imgr2.*, " +
                                    "(Select Top 1 " + strBarCodeFiled + " From Impr1 Where TrxNo=Imgr2.ProductTrxNo) AS BarCode,Imgr1.CustomerCode," +
                                    "(Select Top 1 SerialNoFlag From Impr1 Where TrxNo=Imgr2.ProductTrxNo) AS SerialNoFlag," +
                                    "0 AS ScanQty " +
                                    "From Imgr2 " +
                                    "Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
                                    "Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'";
                    Result = db.Select<Imgr2_Receipt>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgr2_Putaway> Get_Imgr2_Putaway_List(Imgr request)
        {
            List<Imgr2_Putaway> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    string strSql = "Select Imgr2.TrxNo, Imgr2.LineItemNo, IsNull(Imgr2.StoreNo,'') AS StoreNo," +
                                    "(Select StagingAreaFlag From Whwh2 Where WarehouseCode=Imgr2.WarehouseCode And StoreNo=Imgr2.StoreNo) AS StagingAreaFlag,Imgr1.CustomerCode," +
                                    "IsNull(Imgr2.ProductCode,'') AS ProductCode, IsNull(Imgr2.ProductDescription,'') AS ProductDescription, IsNull(Imgr2.UserDefine1,'') AS UserDefine1," +
                                    "(Case Imgr2.DimensionFlag When '1' Then Imgr2.PackingQty When '2' Then Imgr2.WholeQty Else Imgr2.LooseQty End) AS Qty " +
                                    "From Imgr2 " +
                                    "Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
                                    "Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'";
                    Result = db.Select<Imgr2_Putaway>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Imgr2_Transfer> Get_Imgr2_Transfer_List(Imgr request)
        {
            List<Imgr2_Transfer> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    string strSql = "Select Imgr2.TrxNo, Imgr2.LineItemNo, IsNull(Imgr2.StoreNo,'') AS StoreNo," +
                                    "(Select StagingAreaFlag From Whwh2 Where WarehouseCode=Imgr2.WarehouseCode And StoreNo=Imgr2.StoreNo) AS StagingAreaFlag," +
                                    "IsNull(Imgr2.ProductCode,'') AS ProductCode, IsNull(Imgr2.ProductDescription,'') AS ProductDescription," +
                                    "(Case Imgr2.DimensionFlag When '1' Then Imgr2.PackingQty When '2' Then Imgr2.WholeQty Else Imgr2.LooseQty End) AS Balance," +
                                    "0 AS Qty, '' AS NewStoreNo " +
                                    "From Imgr2 " +
                                    "Left Join Imgr1 On Imgr2.TrxNo = Imgr1.TrxNo " +
                                    "Where Imgr1.GoodsReceiptNoteNo='" + request.GoodsReceiptNoteNo + "'";
                    Result = db.Select<Imgr2_Transfer>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public int Confirm_Imgr1(Imgr request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {

                    Result = db.SqlScalar<int>("EXEC spi_Imgr_Confirm @TrxNo,@UpdateBy", new { TrxNo = int.Parse(request.TrxNo), UpdateBy = request.UserID });
                    if (Result != -1)
                    {
                        List<Imgr2_Receipt> Result1 = null;
                        Result1 = db.Select<Imgr2_Receipt>(
                                                "select Imgr1.GoodsReceiptNoteNo,Imgr1.CustomerCode,Imgr2.LineItemNo,Imgr1.TrxNo from imgr1 join imgr2 on imgr1.TrxNo =imgr2.TrxNo where Imgr1.TrxNo =  '" + request.TrxNo + "' " 
                                );
                        if (Result1 != null && Result1.Count > 0)
                        {
                            for (int i = 0; i < Result1.Count ; i++)
                            {
                                Result = db.SqlScalar<int>("Update Imgr2 Set MovementTrxNo=(Select TrxNo From Impm1 Where BatchNo=@GoodsReceiptNoteNo And BatchLineItemNo=@BatchLineItemNo And CustomerCode=@CustomerCode) Where TrxNo=@TrxNo  And LineItemNo=@LineItemNo", new { GoodsReceiptNoteNo = Result1[i].GoodsReceiptNoteNo, BatchLineItemNo = Result1[i].LineItemNo, CustomerCode = Result1[i].CustomerCode, TrxNo = int.Parse(request.TrxNo), LineItemNo = Result1[i].LineItemNo });
                            }
                        }
                    }
                }
            }
            catch { throw; }
            return Result;
        }
        public int Update_Imgr2_StoreNo(Imgr request)
        {
            int Result = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    Result = db.SqlScalar<int>("EXEC spi_Imgr_Confirm @TrxNo,@UpdateBy", new { TrxNo = int.Parse(request.TrxNo), UpdateBy =request.UserID });

                    Result = db.Update<Imgr2>(
                                    new
                                    {
                                        StoreNo = request.StoreNo
                                    },
                                    p => p.TrxNo == int.Parse(request.TrxNo) && p.LineItemNo == int.Parse(request.LineItemNo)
                    );

                    if (Result != -1)
                    {
                        List<Imgr2_Receipt> Result1 = null;
                        Result1 = db.Select<Imgr2_Receipt>(
                                                "select Imgr1.GoodsReceiptNoteNo,Imgr1.CustomerCode,Imgr2.LineItemNo,Imgr1.TrxNo from imgr1 join imgr2 on imgr1.TrxNo =imgr2.TrxNo where Imgr1.TrxNo =  '" + request.TrxNo + "' "
                                );
                        if (Result1 != null && Result1.Count > 0)
                        {
                            for (int i = 0; i < Result1.Count; i++)
                            {
                                Result = db.SqlScalar<int>("Update Imgr2 Set MovementTrxNo=(Select TrxNo From Impm1 Where BatchNo=@GoodsReceiptNoteNo And BatchLineItemNo=@BatchLineItemNo And CustomerCode=@CustomerCode) Where TrxNo=@TrxNo  And LineItemNo=@LineItemNo", new { GoodsReceiptNoteNo = Result1[i].GoodsReceiptNoteNo, BatchLineItemNo = Result1[i].LineItemNo, CustomerCode = Result1[i].CustomerCode, TrxNo = int.Parse(request.TrxNo), LineItemNo = Result1[i].LineItemNo });
                            }
                        }
                    }
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
