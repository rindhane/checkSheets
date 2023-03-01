using Microsoft.AspNetCore.Http; //to Use Results,IResult Type
using App.Configurations; // to access the configurations
using RequestResponseHandlers;
using System.Threading.Tasks; // using async Task 
using FileHandler; //to access the IFileHandler interface
using System.Collections.Generic;
using Newtonsoft.Json;

namespace App.RouteBindings
{
  public static class RouteMethods{
    public static IResult IndexMethod(){
      return Results.LocalRedirect("~/index.html",false,true);
    }
    public static IResult pageRedirect(HttpRequest request){
      return Results.LocalRedirect($"~/pages{request.Path}.html",false,true);
    }
    public static IResult pageRedirectWithParams(HttpRequest request){
      var param="serialNum";
      var val = request.Query[$"{param}"];
      return Results.LocalRedirect($"~{request.Path}/index.html?{param}={val}",false,true);
    }

    public static IResult MoveToHomeScreen(HttpRequest request){
      return Results.LocalRedirect("~/login",false,true);
    }

    public static async Task userCheckSheets(HttpContext context, HttpRequest request, IFileHandler fileHandler ){
      string bodyString = httpHandlers.getRequestBody(request.Body);
      await context.Response.WriteAsJsonAsync<List<checkSheet>>(fileHandler.getCheckSheetUserData());
    }

    public static async Task newCheckSheet(HttpContext context, HttpRequest request, IFileHandler fileHandler){
      var data= new createCheckSheet();
      data=await context.Request.ReadFromJsonAsync<createCheckSheet>();
      fileHandler.createNewCheckSheet(data!); 
      await context.Response.WriteAsync("done");
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