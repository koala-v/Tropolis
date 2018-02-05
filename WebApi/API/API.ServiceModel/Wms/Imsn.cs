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
				[Route("/wms/imsn1", "Get")]				//imsn1?
				[Route("/wms/imsn1/create", "Post")]
				[Route("/wms/imsn1/create", "Get")]	//create?GoodsIssueNoteNo= &ReceiptLineItemNo= &SerialNos= &Imgr2TrxNo=
    public class Imsn : IReturn<CommonResponse>
				{
								public string ReceiptNoteNo { get; set; }
								public string ReceiptLineItemNo { get; set; }
								public string IssueNoteNo { get; set; }
								public string IssueLineItemNo { get; set; }
								public string SerialNos { get; set; }
								public string Imgr2TrxNo { get; set; }
								public Imsn1 imsn1 { get; set; }
    }
    public class Imsn_Logic
    {
        private class Imgi1
        {
            public int TrxNo { get; set; }
            public string GoodsIssueNoteNo { get; set; }
        }
        private class Imgi2
        {
            public int TrxNo { get; set; }
            public int LineItemNo { get; set; }
        }
        public IDbConnectionFactory DbConnectionFactory { get; set; }
        public List<Imsn1> Get_Imsn1_List(Imsn request)
        {
            List<Imsn1> Result = null;
            try
            {
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
                {
                    Result = db.Select<Imsn1>(
                        "Select * From Imsn1 " +
                        "Left Join Imgi1 On Imsn1.IssueNoteNo = Imgi1.GoodsIssueNoteNo " +
                        "Left Join Imgi2 On Imgi1.TrxNo = Imgi2.TrxNo " +
                        "Where Imsn1.IssueLineItemNo = Imgi2.LineItemNo And Imgi1.GoodsIssueNoteNo={0}",
																								request.IssueNoteNo
                    );
                }
            }
            catch { throw; }
            return Result;
        }
								public long Insert_Imsn1(Imsn request)
								{
												long Result = -1;
												int intResult = -1;
												try
												{
																using (var db = DbConnectionFactory.OpenDbConnection("WMS"))
																{
																				Result = db.Update<Imgr2>(
																								new
																								{
																												UserDefine1 = request.SerialNos
																								},
																								p => p.TrxNo == int.Parse(request.Imgr2TrxNo) && p.LineItemNo == int.Parse(request.ReceiptLineItemNo)
																				);
																				string[] sns = request.SerialNos.Split(',');
																				foreach (string sn in sns)
																				{
																								intResult = db.Scalar<int>(
																												"Select count(*) From Imsn1 Where ReceiptNoteNo={0} And ReceiptLineItemNo={1} And SerialNo={2}",
																												request.ReceiptNoteNo, request.ReceiptLineItemNo, sn
																								);
																								if (intResult < 1)
																								{
																												db.Insert(new Imsn1 { ReceiptNoteNo = request.ReceiptNoteNo, ReceiptLineItemNo = request.ReceiptLineItemNo, SerialNo = sn });
																												Result = 1;
																								}
																				}																								
																}
												}
												catch { throw; }
												return Result;
								}							
    }
}
