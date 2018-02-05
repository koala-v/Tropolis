using System;
using System.IO;
using System.Web;
using System.Net;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using ServiceStack;
using ServiceStack.Common.Web;
using ServiceStack.ServiceHost;
using ServiceStack.ServiceInterface;
using WebApi.ServiceModel;
using WebApi.ServiceModel.Wms;
using WebApi.ServiceModel.Event;
using WebApi.ServiceModel.Utils;
using WebApi.ServiceModel.Tms;
using WebApi.ServiceModel.Freight;
using WebApi.ServiceInterface.Wms;
using WebApi.ServiceInterface.Event;
using File = System.IO.File;
using System.Reflection;

namespace WebApi.ServiceInterface
{
    public class ApiServices : Service
    {        
        public Auth auth { get; set; }
								#region WMS
								public ServiceModel.Wms.Wms_Login_Logic wms_Login_Logic { get; set; }
								public object Any(ServiceModel.Wms.Wms_Login request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.LoginService ls = new ServiceInterface.Wms.LoginService();
																ls.initial(auth, request, wms_Login_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Imgr_Logic wms_Imgr_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imgr request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Imgr(auth, request, wms_Imgr_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Impr_Logic wms_Impr_Logic { get; set; }
								public object Any(ServiceModel.Wms.Impr request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Impr(auth, request, wms_Impr_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Whwh_Logic wms_Whwh_Logic { get; set; }
								public object Any(ServiceModel.Wms.Whwh request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Whwh(auth, request, wms_Whwh_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}								
								public ServiceModel.Wms.Imgi_Logic wms_Imgi_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imgi request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Imgi(auth, request, wms_Imgi_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}								
								public ServiceModel.Wms.Imsn_Logic wms_Imsn_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imsn request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Imsn(auth, request, wms_Imsn_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.WMSRcbp_Logic wms_Rcbp_Logic { get; set; }
								public object Any(ServiceModel.Wms.Rcbp request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ts = new ServiceInterface.Wms.TableService();
																ts.TS_Rcbp(auth, request, wms_Rcbp_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Imit_Logic wms_Imit_Logic { get; set; }
								public object Any(ServiceModel.Wms.Imit request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Imit(auth, request, wms_Imit_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Wms.Impm_Logic wms_Impm_Logic { get; set; }
								public object Any(ServiceModel.Wms.Impm request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Wms.TableService ls = new ServiceInterface.Wms.TableService();
																ls.TS_Impm(auth, request, wms_Impm_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								/*
								public object Any(List_AsnNo request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ListService ls = new ListService();
																ls.ListJobNo(auth, request, list_JobNo_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex)
												{
																ecr.meta.code = 599;
																ecr.meta.message = "The server handle exceptions, the operation fails";
																ecr.meta.errors.code = ex.GetHashCode();
																ecr.meta.errors.field = ex.HelpLink;
																ecr.meta.errors.message = ex.Message.ToString();
												}
												return ecr;
								}
								public object Any(Update_Done request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																DoneService ds = new DoneService();
																ds.initial(auth, request, update_Done_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex)
												{
																ecr.meta.code = 599;
																ecr.meta.message = "The server handle exceptions, the operation fails.";
																ecr.meta.errors.code = ex.GetHashCode();
																ecr.meta.errors.field = ex.HelpLink;
																ecr.meta.errors.message = ex.Message.ToString();
												}
												return ecr;
								}
								*/
								#endregion
								#region Event
        public ServiceModel.Event.Event_Login_Logic tms_Login_Logic { get; set; }
        public object Any(ServiceModel.Event.Event_Login request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Event.LoginService ls = new ServiceInterface.Event.LoginService();
                ls.initial(auth, request, tms_Login_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
        public ServiceModel.Event.List_JobNo_Logic list_JobNo_Logic { get; set; }
        public object Get(ServiceModel.Event.List_JobNo request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Event.ListService ls = new ServiceInterface.Event.ListService();
                ls.ListJobNo(auth, request, list_JobNo_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
        public ServiceModel.Event.List_Container_Logic list_Container_Logic { get; set; }
        public object Get(ServiceModel.Event.List_Container request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Event.ListService ls = new ServiceInterface.Event.ListService();
                ls.ListContainer(auth, request, list_Container_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
        public ServiceModel.Event.List_Jmjm6_Logic list_Jmjm6_Logic { get; set; }
        public object Get(ServiceModel.Event.List_Jmjm6 request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Event.ListService ls = new ServiceInterface.Event.ListService();
                ls.ListJmjm6(auth, request, list_Jmjm6_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
        public ServiceModel.Event.Update_Done_Logic update_Done_Logic { get; set; }
        public object Post(ServiceModel.Event.Update_Done request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Event.DoneService ds = new ServiceInterface.Event.DoneService();
                ds.initial(auth, request, update_Done_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
								#endregion
								#region TMS
								public ServiceModel.Tms.Jmjm_Logic tms_jmjm_Logic { get; set; }
								public object Any(ServiceModel.Tms.Jmjm request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Tms.TableService ts = new ServiceInterface.Tms.TableService();
																ts.TS_Jmjm(auth, request, tms_jmjm_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Tms.Sibl_Logic tms_sibl_Logic { get; set; }
								public object Any(ServiceModel.Tms.Sibl request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Tms.TableService ts = new ServiceInterface.Tms.TableService();
																ts.TS_Sibl(auth, request, tms_sibl_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								#endregion
								#region Freight
								public ServiceModel.Freight.Freight_Login_Logic freight_Login_Logic { get; set; }
        public object Any(ServiceModel.Freight.Freight_Login request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Freight.LoginService ls = new ServiceInterface.Freight.LoginService();
                ls.initial(auth, request, freight_Login_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
								}
								public ServiceModel.Freight.Saus_Logic saus_Logic { get; set; }
								public object Any(ServiceModel.Freight.Saus request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Freight.TableService ls = new ServiceInterface.Freight.TableService();
																ls.TS_Saus(auth, request, saus_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Freight.Smct_Logic smct_Logic { get; set; }
								public object Any(ServiceModel.Freight.Smct request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Freight.TableService ts = new ServiceInterface.Freight.TableService();
																ts.TS_Smct(auth, request, smct_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Freight.Smsa_Logic smsa_Logic { get; set; }
								public object Any(ServiceModel.Freight.Smsa request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Freight.TableService ts = new ServiceInterface.Freight.TableService();
																ts.TS_Smsa(auth, request, smsa_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
								public ServiceModel.Freight.Plvi_Logic plvi_Logic { get; set; }
								public object Any(ServiceModel.Freight.Plvi request)
								{
												CommonResponse ecr = new CommonResponse();
												ecr.initial();
												try
												{
																ServiceInterface.Freight.TableService ts = new ServiceInterface.Freight.TableService();
																ts.TS_Plvi(auth, request, plvi_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
												}
												catch (Exception ex) { cr(ecr, ex); }
												return ecr;
								}
        //public ServiceModel.Freight.Rcbp_Logic rcbp_Logic { get; set; }
        //public object Any(ServiceModel.Freight.Rcbp request)
        //{
        //    CommonResponse ecr = new CommonResponse();
        //    ecr.initial();
        //    try
        //    {
        //        ServiceInterface.Freight.TableService ls = new ServiceInterface.Freight.TableService();
        //        ls.TS_Rcbp(auth, request, rcbp_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
        //    }
        //    catch (Exception ex) { cr(ecr, ex); }
        //    return ecr;
        //}
        public ServiceModel.Freight.Rcvy_Logic list_Rcvy1_Logic { get; set; }
        public object Get(ServiceModel.Freight.Rcvy request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Freight.TableService ls = new ServiceInterface.Freight.TableService();
                ls.TS_Rcvy(auth, request, list_Rcvy1_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
        public ServiceModel.Freight.Tracking_Logic list_Tracking_Logic { get; set; }
        public object Get(ServiceModel.Freight.Tracking request)
        {
            CommonResponse ecr = new CommonResponse();
            ecr.initial();
            try
            {
                ServiceInterface.Freight.TableService ls = new ServiceInterface.Freight.TableService();
                ls.TS_Tracking(auth, request, list_Tracking_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
            }
            catch (Exception ex) { cr(ecr, ex); }
            return ecr;
        }
								public ServiceModel.Freight.ViewPDF_Logic viewPDF_Logic { get; set; }
								public object Get(ServiceModel.Freight.ViewPDF request)
								{
												if (this.Request.RawUrl.IndexOf("/pdf/file") > 0)
												{
																byte[] heByte = viewPDF_Logic.Get_File(request);																
																return new HttpResult(heByte, "application/pdf");
												}
												else //this.Request.RawUrl.IndexOf("/pdf") > 0
												{
																CommonResponse ecr = new CommonResponse();
																ecr.initial();
																try
																{
																				ServiceInterface.Freight.PdfService ps = new ServiceInterface.Freight.PdfService();
																				ps.PS_View(auth, request, viewPDF_Logic, ecr, this.Request.Headers.GetValues("Signature"), this.Request.RawUrl);
																}
																catch (Exception ex) { cr(ecr, ex); }
																return ecr;
												}
								}
								#endregion
								#region Common
								public object Post(Uploading request)
								{
												//string[] segments = base.Request.QueryString.GetValues(0);
												//string strFileName = segments[0];
												//string strPath = HttpContext.Current.Request.PhysicalApplicationPath;
												//string resultFile = Path.Combine(@"C:\inetpub\wwwroot\WebAPI\attach", strFileName);
												//if (File.Exists(resultFile))
												//{
												//				File.Delete(resultFile);
												//}
												//using (FileStream file = File.Create(resultFile))
												//{
												//				byte[] buffer = new byte[request.RequestStream.Length];
												//				request.RequestStream.Read(buffer, 0, buffer.Length);
												//				file.Write(buffer, 0, buffer.Length);
												//				file.Flush();
												//				file.Close();
												//}
												return new HttpResult(System.Net.HttpStatusCode.OK);
								}
								#endregion
								private CommonResponse cr(CommonResponse ecr, Exception ex)
        {
            ecr.meta.code = 599;
            ecr.meta.message = "The server handle exceptions, the operation fails.";
            ecr.meta.errors.code = ex.GetHashCode();
            ecr.meta.errors.field = ex.HelpLink;
            ecr.meta.errors.message = ex.Message.ToString();
            return ecr;
        }
    }
}
