using Microsoft.AspNetCore.Builder; //for classType:WebApplication 
using App.RouteBindings;
using App.Configurations;

namespace App.Routings
{
public static class Routes{
    public static WebApplication AddRouting(this WebApplication app){
        var configs = new SystemConfigurations();
        //add key-link-reRerouting
        app.MapGet("/", RouteMethods.MoveToHomeScreen);
        app.MapGet("/login",RouteMethods.pageRedirect);
        app.MapGet("/Admin",RouteMethods.pageRedirect);
        app.MapGet("/checkSheet", RouteMethods.pageRedirectWithParams);
        app.MapPost("/UserCheckSheets",RouteMethods.userCheckSheets);
        app.MapPost("/newCheckSheet",RouteMethods.newCheckSheet);
        app.MapGet("/birthCertificate", RouteMethods.pageRedirect);
        app.MapGet("/test", RouteMethods.test);
        app.MapPost("/test", RouteMethods.test);
        app.MapGet("/InspectionEntry",RouteMethods.pageRedirectWithParams);
        app.MapPost("/GetCheckSheetData", RouteMethods.getCheckSheetData);
        app.MapPost("/saveAuthorCheckSheet",RouteMethods.saveCheckSheet);
        return app;
    }
}  
}