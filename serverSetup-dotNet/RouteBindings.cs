using Microsoft.AspNetCore.Http; //to Use Results,IResult Type
using App.Configurations; // to access the configurations
using RequestResponseHandlers;
using System.Threading.Tasks; // using async Task 
using FileHandler; //to access the IFileHandler interface
using System.Collections.Generic;
using Newtonsoft.Json;
using DbConnectors.Models;
using DbConnectors;
using JsonResponseStruct; // to access classes for JSON-response classes;

namespace App.RouteBindings
{
  public static class RouteMethods{
    public static IResult IndexMethod(){
      return Results.LocalRedirect("~/index.html",false,true);
    }
    public static IResult pageRedirect(HttpRequest request){
      return Results.LocalRedirect($"~/pages{request.Path}.html",false,true);
    }
    public static IResult pageRedirectWithParams(HttpRequest request, HttpContext context){
      var urlRedirect = httpHandlers.addParamsToURL($"~/pages{request.Path}.html",request.QueryString.ToString());
      //var val = request.Query[$"{param}"];
      //return Results.LocalRedirect($"~/pages{request.Path}.html?{param}={val}",false,true);
      return Results.LocalRedirect(urlRedirect,false,true);
    }

    public static IResult MoveToHomeScreen(HttpRequest request){
      return Results.LocalRedirect("~/login",false,true);
    }

    public static async Task userCheckSheets(HttpContext context, HttpRequest request,DbLayer dbConn){
      string bodyString = httpHandlers.getRequestBody(request.Body);
      //await context.Response.WriteAsJsonAsync<List<checkSheet>>(fileHandler.getCheckSheetUserData());
      await context.Response.WriteAsJsonAsync<List<CheckSheet>>(await dbConn.allUserCheckSheets());
    } 

    public static async Task changeCheckSheetState(HttpContext context, HttpRequest request, DbLayer db){
      var resultString = await context.Request.ReadFromJsonAsync<CheckSheetStatus>();
      sheetStatus state = sheetStatus.inactive;
      if (resultString!.newStatus == "active"){
        state = sheetStatus.active;
      }
      await db.changeStatusOfCheckSheet(resultString!.sheetID, state); 
      await context.Response.WriteAsync("updated");
    }

    public static async Task newCheckSheet(HttpContext context, HttpRequest request, DbLayer db){
      var data= new createCheckSheetInput();
      data=await context.Request.ReadFromJsonAsync<createCheckSheetInput>();
      var inputSheet = (Checksheet_Record) data!.newCheckSheet!;
      inputSheet.status = "active"; 
      await db.createNewSheet(inputSheet, data.fromExisting, ((Checksheet_Record)data.refCheckSheet!).id );
      //fileHandler.createNewCheckSheet(data!); 
      await context.Response.WriteAsync("done");
    }
    public static async Task getCheckSheetData(HttpContext context, HttpRequest request, DbLayer db){
      //string bodyString = httpHandlers.getRequestBody(request.Body);
      var data = await context.Request.ReadFromJsonAsync<CheckSheet>();
      //var resultJSONString = fileHandler.getCheckSheet(data!);
      var sheet= (CheckSheet) await db.getCheckSheetCopy(data!.sheetID);
      await context.Response.WriteAsJsonAsync(sheet);
    }

    public static async Task saveCheckSheet(HttpContext context, HttpRequest request, DbLayer db){
      //var data= new updateCheckSheet();
      //string bodyString = httpHandlers.getRequestBody(request.Body);
      var data = await context.Request.ReadFromJsonAsync<CheckSheet>();
      var dataInput = (Checksheet_Record)data!;
      await db.UpdateAuthoredSheet(dataInput.stations!,dataInput.id); 
      await context.Response.WriteAsync("updated");
    }

    public static async Task storeFormData(HttpContext context, HttpRequest request, IDataHandler formUpdateHandler, DbLayer db){
      //var data= new updateCheckSheet();
      //string bodyString = httpHandlers.getRequestBody(request.Body);
      //System.Console.WriteLine(bodyString);
      var dataNew = await context.Request.ReadFromJsonAsync<singleFormUpdate2>();
      var result = formUpdateHandler.updateFormData(dataNew!);// correctionPending: writing on to a file for a test
      var result2 = db.updateValueEntry(dataNew!.formUpdates!);
      await context.Response.WriteAsync(result.ToString());
    }

    public static async Task loadFormData(HttpContext context, HttpRequest request, DbLayer db){
      var formSearchRequest = await request.ReadFromJsonAsync<formSNSearch>();
      var result = await db.getValueForFormSN(formSearchRequest!.formSN!);
      await context.Response.WriteAsJsonAsync<List<Checksheet_Values>>(result);
    }

    public static async Task test(HttpContext context, HttpRequest request, IFileHandler fileHandler){
      var data= new createCheckSheet();
      //string bodyString = httpHandlers.getRequestBody(request.Body);
      data=await context.Request.ReadFromJsonAsync<createCheckSheet>();
      fileHandler.createNewCheckSheet(data!);
      await context.Response.WriteAsync("done");
    }
  } 
}