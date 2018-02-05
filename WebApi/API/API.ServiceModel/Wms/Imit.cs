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
    [Route("/wms/imit1/create", "Get")]					//create?UserID=
    [Route("/wms/imit1/confirm", "Get")]				//confirm?TrxNo= &UpdateBy=
    [Route("/wms/imit2/create", "Get")]					//create?TrxNo= &LineItemNo= &Impm1TrxNo= &NewStoreNo= &Qty= &UpdateBy= 
    public class Imit : IReturn<CommonResponse>
    {
        public string UserID { get; set; }
        public string TrxNo { get; set; }
        public string UpdateBy { get; set; }
        public string Impm1TrxNo { get; set; }
        public string LineItemNo { get; set; }
        public string NewStoreNo { get; set; }
        public string Qty { get; set; }
        public string QtyList { get; set; }
        public string NewStoreNoList { get; set; }
        public string LineItemNoList { get; set; }
        public string Impm1TrxNoList { get; set; }
    }
    public class Imit_Logic
    {
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imit1> Insert_Imit1(Imit request)
        {
            List<Imit1> Result = null;
            int intResult = -1;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    string strSql = "EXEC spi_Imit1 @CustomerCode,@Description1,@Description2,@GoodsTransferNoteNo,@RefNo,@TransferBy,@TransferDateTime,@TrxNo,@WorkStation,@CreateBy,@UpdateBy";
                    intResult = db.SqlScalar<int>(strSql,
                                    new
                                    {
                                        CustomerCode = "",
                                        Description1 = "",
                                        Description2 = "",
                                        GoodsTransferNoteNo = "",
                                        RefNo = "",
                                        TransferBy = request.UserID,
                                        TransferDateTime = DateTime.Now,
                                        TrxNo = "",
                                        WorkStation = "APP",
                                        CreateBy = request.UserID,
                                        UpdateBy = request.UserID
                                    });
                    if (intResult > -1)
                    {
                        strSql = "Select top 1 * From Imit1 Order By CreateDateTime Desc";
                        Result = db.Select<Imit1>(strSql);
                    }
                }
            }
            catch { throw; }
            return Result;
        }
        public int Confirm_Imit1(Imit request)
        {
            int Result = -1;
            Boolean blnSameCustomer = false;
            string OldCustomerCode = "", CustomerCode = "", CustomerName = "";
            if (request.NewStoreNoList != null || request.NewStoreNoList != "")
            {
                string[] NewSotreNoDetail = request.NewStoreNoList.Split(',');
                string[] LineItemNoDetail = request.LineItemNoList.Split(',');
                string[] Impm1TrxNoDetail = request.Impm1TrxNoList.Split(',');
                string[] QtyDetail = request.QtyList.Split(',');
                for (int intI = 0; intI < NewSotreNoDetail.Length; intI++)
                {
                    Result = Insert_Imit2Detail(int.Parse(Impm1TrxNoDetail[intI]), int.Parse(request.TrxNo), int.Parse(LineItemNoDetail[intI]), int.Parse(QtyDetail[intI]), NewSotreNoDetail[intI], request.UpdateBy,ref CustomerCode,ref CustomerName);
                    if (OldCustomerCode == "" && CustomerCode!="")
                    {
                        OldCustomerCode = CustomerCode;
                        blnSameCustomer = true;
                    }
                    else if(OldCustomerCode != CustomerCode){
                        blnSameCustomer = false;
                    }
                }
                if (blnSameCustomer)
                {

                }
            }
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {

                    //string strSql = "EXEC spi_Imit_Confirm " + int.Parse(request.TrxNo) + ",'" + request.UpdateBy + "'"; 'yicong 20161019
                    string strCustoemrUpdate = "";
                    if (blnSameCustomer)
                    {
                        strCustoemrUpdate = ",CustomerCode = " + Modfunction.SQLSafeValue(CustomerCode) ;
                    }
                   string  strSql = "Update Imit1 set StatusCode='EXE',UpdateBy='"+request.UpdateBy +"'" + strCustoemrUpdate  + " where TrxNo='"+request.TrxNo+"' ";
                    Result = db.SqlScalar<int>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public int Insert_Imit2(Imit request)
        {
            int Result = -1;
            //Result = Insert_Imit2Detail(int.Parse(request.Impm1TrxNo), int.Parse(request.TrxNo), int.Parse(request.LineItemNo), int.Parse(request.Qty), request.NewStoreNo, request.UpdateBy);
            return Result;
        }

        public int Insert_Imit2Detail(int Impm1TrxNoNew, int TrxNoNew, int LineItemNoNew, int QtyNew, string NewStoreNoNew, string UpdateByNew,ref string CustomerCode, ref string CustomerName)
        {
            int Result = -1;
            try
            {
                List<Impm1> impm1s;
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    string strSql = "Select Impm1.*,Impr1.PackingPackageSize,Impr1.WholePackageSize " +
                                "From Impm1 Join Impr1 On Impm1.ProductTrxNo = Impr1.TrxNo " +
                                "Where Impm1.TrxNo=" + Impm1TrxNoNew;
                    impm1s = db.Select<Impm1>(strSql);
                }
                using (var db = DbConnectionFactory.OpenDbConnection())
                {
                    if (impm1s.Count > 0)
                    {
                        CustomerCode = impm1s[0].CustomerCode;
                        CustomerName = impm1s[0].CustomerName;
                        switch (impm1s[0].DimensionFlag)
                        {
                            case "1":
                                db.Insert(
                                                new Imit2
                                                {
                                                    TrxNo = TrxNoNew,
                                                    LineItemNo = LineItemNoNew,
                                                    MovementTrxNo = Impm1TrxNoNew,
                                                    NewStoreNo = NewStoreNoNew,
                                                    NewWarehouseCode = impm1s[0].WarehouseCode,
                                                    StoreNo = impm1s[0].StoreNo,
                                                    WarehouseCode = impm1s[0].WarehouseCode,
                                                    ProductTrxNo = impm1s[0].ProductTrxNo,
                                                    PackingQty = QtyNew,
                                                    WholeQty = QtyNew * impm1s[0].PackingPackageSize,
                                                    LooseQty = QtyNew * impm1s[0].PackingPackageSize * impm1s[0].WholePackageSize,
                                                    Volume = QtyNew * impm1s[0].UnitVol,
                                                    Weight = QtyNew * impm1s[0].UnitWt,
                                                    SpaceArea = impm1s[0].SpaceArea * QtyNew / impm1s[0].BalancePackingQty,
                                                    UpdateBy = UpdateByNew
                                                }
                                );
                                db.SqlScalar<int>("Update Impm1 set BalancePackingQty= BalancePackingQty - " + QtyNew.ToString() + ", BalanceWholeQty=BalanceWholeQty-" + (QtyNew * impm1s[0].PackingPackageSize) + ", BalanceLooseQty=BalanceLooseQty-" + (QtyNew * impm1s[0].PackingPackageSize * impm1s[0].WholePackageSize) + ", BalanceVolume = BalanceVolume - " + (QtyNew * impm1s[0].UnitVol) + ", BalanceWeight = BalanceWeight - " + (QtyNew * impm1s[0].UnitWt) + ", BalanceSpaceArea = BalanceSpaceArea - " + (impm1s[0].SpaceArea * QtyNew / impm1s[0].BalancePackingQty) + ",UpdateDateTime=getdate(),UpdateBy='" + UpdateByNew + "' Where TrxNo = " + Impm1TrxNoNew.ToString());
                                db.SqlScalar<int>("EXEC spi_Imit2_Impm " + TrxNoNew + "," + LineItemNoNew + ",'" + UpdateByNew + "'");
                                break;
                            case "2":
                                db.Insert(
                                                new Imit2
                                                {
                                                    TrxNo = TrxNoNew,
                                                    LineItemNo = LineItemNoNew,
                                                    NewStoreNo = NewStoreNoNew,
                                                    UpdateBy = UpdateByNew,
                                                    MovementTrxNo = Impm1TrxNoNew,
                                                    NewWarehouseCode = impm1s[0].WarehouseCode,
                                                    StoreNo = impm1s[0].StoreNo,
                                                    WarehouseCode = impm1s[0].WarehouseCode,
                                                    ProductTrxNo = impm1s[0].ProductTrxNo,
                                                    WholeQty = QtyNew,
                                                    LooseQty = QtyNew * impm1s[0].WholePackageSize,
                                                    Volume = QtyNew * impm1s[0].UnitVol,
                                                    Weight = QtyNew * impm1s[0].UnitWt,
                                                    SpaceArea = impm1s[0].SpaceArea * QtyNew / impm1s[0].BalanceWholeQty,

                                                }
                                );
                                db.SqlScalar<int>("Update Impm1 set BalanceWholeQty=BalanceWholeQty-" + QtyNew + ", BalanceLooseQty=BalanceLooseQty-" + (QtyNew * impm1s[0].WholePackageSize) + ", BalanceVolume = BalanceVolume - " + (QtyNew * impm1s[0].UnitVol) + ", BalanceWeight = BalanceWeight - " + (QtyNew * impm1s[0].UnitWt) + ", BalanceSpaceArea = BalanceSpaceArea - " + (impm1s[0].SpaceArea * QtyNew / impm1s[0].BalanceWholeQty) + ",UpdateDateTime=getdate(),UpdateBy='" + UpdateByNew + "' Where TrxNo = " + Impm1TrxNoNew);
                                db.SqlScalar<int>("EXEC spi_Imit2_Impm " + TrxNoNew + "," + LineItemNoNew + ",'" + UpdateByNew + "'");
                                break;
                            default:
                                db.Insert(
                                                new Imit2
                                                {
                                                    TrxNo = TrxNoNew,
                                                    LineItemNo = LineItemNoNew,
                                                    NewStoreNo = NewStoreNoNew,
                                                    UpdateBy = UpdateByNew,
                                                    MovementTrxNo = Impm1TrxNoNew,
                                                    NewWarehouseCode = impm1s[0].WarehouseCode,
                                                    StoreNo = impm1s[0].StoreNo,
                                                    WarehouseCode = impm1s[0].WarehouseCode,
                                                    ProductTrxNo = impm1s[0].ProductTrxNo,
                                                    LooseQty = QtyNew,
                                                    Volume = QtyNew * impm1s[0].UnitVol,
                                                    Weight = QtyNew * impm1s[0].UnitWt,
                                                    SpaceArea = impm1s[0].SpaceArea * QtyNew / impm1s[0].BalanceLooseQty,
                                                }
                                );
                                db.SqlScalar<int>("Update Impm1 set BalanceLooseQty=BalanceLooseQty-" + QtyNew + ", BalanceVolume = BalanceVolume - " + (QtyNew * impm1s[0].UnitVol) + ", BalanceWeight = BalanceWeight - " + (QtyNew * impm1s[0].UnitWt) + ", BalanceSpaceArea = BalanceSpaceArea - " + (impm1s[0].SpaceArea * QtyNew / impm1s[0].BalanceLooseQty) + ",UpdateDateTime=getdate(),UpdateBy='" + UpdateByNew + "' Where TrxNo = " + Impm1TrxNoNew);
                                db.SqlScalar<int>("EXEC spi_Imit2_Impm " + TrxNoNew + "," + LineItemNoNew + ",'" + UpdateByNew + "'");
                                break;
                        }
                        Result = 1;
                    }
                }
            }
            catch { throw; }
            return Result;
        }
    }
}
