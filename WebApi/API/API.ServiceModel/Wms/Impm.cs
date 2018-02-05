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
    [Route("/wms/impm1", "Get")]																//impm1?UserDefine1=
    [Route("/wms/impm1/enquiry", "Get")]								//impm1?ProductCode= &TrxNo=
    [Route("/wms/impm1/transfer", "Get")]							//impm1?WarehouseCode= &StoreNo=
    public class Impm : IReturn<CommonResponse>
    {
        public string UserDefine1 { get; set; }
        public string ProductCode { get; set; }
        public string TrxNo { get; set; }
        public string WarehouseCode { get; set; }
        public string CustomerCode { get; set; }
        public string StoreNo { get; set; }
    }
    public class Impm_Logic
    {
        private class Impm1_Transfer_Tree
        {
            public string name { get; set; }
            public List<Impm1_Transfer> tree { get; set; }
        }
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Impm1_UserDefine> Get_Impm1_List(Impm request)
        {
            List<Impm1_UserDefine> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    string strSql = "Select Top 10 Impm1.TrxNo, Impm1.UserDefine1 " +
                                    "From Impm1 " +
                                    "Where Impm1.UserDefine1 LIKE '" + request.UserDefine1 + "%' " +
                                    "Order By Impm1.TrxNo ASC";
                    Result = db.Select<Impm1_UserDefine>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public List<Impm1_Enquiry> Get_Impm1_Enquiry_List(Impm request)
        {
            List<Impm1_Enquiry> Result = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    string strSql = "Select IsNull(Impm1.ProductCode,'') AS ProductCode, IsNull(Impm1.ProductName,'') AS ProductName," +
                                    "IsNull(Impm1.GoodsReceiveorIssueNo,'') AS GoodsReceiveorIssueNo, IsNull(Impm1.RefNo,'') AS RefNo," +
                                    "IsNull(Impm1.StoreNo,'') AS StoreNo, " +
                                    "(CASE Impm1.DimensionFlag When '1' THEN Impm1.BalancePackingQty When '2' THEN Impm1.BalanceWholeQty ELSE Impm1.BalanceLooseQty END) AS BalanceQty " +
                                    "From Impm1 ";
                    if (!string.IsNullOrEmpty(request.ProductCode))
                    {
                        strSql = strSql + "Where (CASE Impm1.DimensionFlag When '1' THEN Impm1.BalancePackingQty When '2' THEN Impm1.BalanceWholeQty ELSE Impm1.BalanceLooseQty END) >0 AND ProductCode='" + request.ProductCode + "'";
                    }
                    else if (!string.IsNullOrEmpty(request.WarehouseCode) && !string.IsNullOrEmpty(request.StoreNo))
                    {
                        strSql = strSql + "Where (CASE Impm1.DimensionFlag When '1' THEN Impm1.BalancePackingQty When '2' THEN Impm1.BalanceWholeQty ELSE Impm1.BalanceLooseQty END) >0 AND WarehouseCode='" + Modfunction.SQLSafe(request.WarehouseCode) + "' And StoreNo='" + Modfunction.SQLSafe(request.StoreNo) + "'";
                    }
                    else if (!string.IsNullOrEmpty(request.TrxNo))
                    {
                        strSql = strSql + "Where TrxNo = " + int.Parse(request.TrxNo);
                    }
                    Result = db.Select<Impm1_Enquiry>(strSql);
                }
            }
            catch { throw; }
            return Result;
        }
        public object Get_Impm1_Transfer_List(Impm request)
        {
            List<Impm1_Transfer_Tree> ResultTrees = new List<Impm1_Transfer_Tree>();
            List<Impm1_Transfer> Results = null;
            try
            {
                using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    if ((request.WarehouseCode != null && request.WarehouseCode != "") && (request.StoreNo != null && request.StoreNo != ""))
                    {
                        string strSql = "Select Impm1.TrxNo, Impm1.BatchLineItemNo, IsNull(ProductCode,'') AS name, IsNull(ProductCode,'') AS ProductCode," +
                                  "IsNull(ProductName,'') AS ProductName, IsNull(GoodsReceiveorIssueNo,'') AS GoodsReceiveorIssueNo, IsNull(UserDefine1,'') AS UserDefine1," +
                                  "b.QtyBal, '' AS FromToStoreNo, 0 AS ScanQty , '' as TreeLineItemNo ,''objectTrxNo  " +
                                  "From Impm1 Join (Select (Select top 1 Imit1.StatusCode from imit1 Where imit1.GoodsTransferNoteNo = a.GoodsReceiveorIssueNo) AS ImitStatus, a.TrxNo, " +
                                  "(CASE a.DimensionFlag When '1' THEN a.BalancePackingQty When '2' THEN a.BalanceWholeQty ELSE a.BalanceLooseQty END) AS QtyBal From Impm1 a ) b on b.TrxNo = impm1.TrxNo " +
                                  "Where WarehouseCode='" + request.WarehouseCode + "' And ( impm1.TrxType =1 or impm1.TrxType =3) And StoreNo='" + request.StoreNo + "' And (b.ImitStatus = 'EXE' or ImitStatus is null) And b.QtyBal>0  ";
                        if (request.CustomerCode != null && request.CustomerCode != "")
                        {
                            strSql = strSql + " AND CustomerCode = " + Modfunction.SQLSafeValue(request.CustomerCode);
                        }
                        strSql = strSql + " order by impm1.ProductCode ";
                        Results = db.Select<Impm1_Transfer>(strSql);
                        for (int i = 0; i < Results.Count; i++)
                        {
                            string BatchNo = Results[i].name;
                            Impm1_Transfer impm1 = Results[i];
                            bool blnExistBatchNo = false;
                            foreach (Impm1_Transfer_Tree ResultTree in ResultTrees)
                            {
                                if (ResultTree.name.Equals(BatchNo))
                                {
                                    blnExistBatchNo = true;
                                    impm1.TreeLineItemNo = ResultTree.tree.Count;
                                    impm1.objectTrxNo = ResultTree.tree[0].objectTrxNo;
                                    ResultTree.tree.Add(impm1);
                                }
                            }
                            if (!blnExistBatchNo)
                            {
                                Impm1_Transfer_Tree impm1_tree = new Impm1_Transfer_Tree();
                                impm1_tree.name = BatchNo;
                                impm1_tree.tree = new List<Impm1_Transfer>();
                                impm1.TreeLineItemNo = 0;
                                impm1.objectTrxNo = ResultTrees.Count;
                                impm1_tree.tree.Add(impm1);
                                ResultTrees.Add(impm1_tree);
                            }
                        }

                    }                                       
                  
                }
            }
            catch { throw; }
            return ResultTrees;
        }
    }
}
