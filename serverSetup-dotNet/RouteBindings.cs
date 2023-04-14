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

    public static async Task newCheckSheet(HttpContext context, HttpRequest request, IFileHandler fileHandler){
      var data= new createCheckSheet();
      data=await context.Request.ReadFromJsonAsync<createCheckSheet>();
      fileHandler.createNewCheckSheet(data!); 
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

    public static async Task storeFormData(HttpContext context, HttpRequest request, IDataHandler formUpdateHandler){
      //var data= new updateCheckSheet();
      //string bodyString = httpHandlers.getRequestBody(request.Body);
      //System.Console.WriteLine(bodyString);
      var data = await context.Request.ReadFromJsonAsync<singleFormUpdate>();
      var result = formUpdateHandler.updateFormData(data!);
      await context.Response.WriteAsync(result.ToString());
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