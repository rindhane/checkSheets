using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using App.Configurations;
using Microsoft.Extensions.Hosting; // to access type hostoption; BackgroundServiceExceptionBehavior  
using FileHandler;
using Microsoft.AspNetCore.Hosting; //to access WebHostEnvironment interface;
using DbConnectors;
namespace BackendServices {

    public static class Services{

        public static WebApplicationBuilder AddServices(this WebApplicationBuilder builder, SystemConfigurations configs){
            //not to stop due to failure of background services
            builder.Services.Configure<HostOptions>(
                hostOptions=>
                {
                    hostOptions.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
                }
            );
            builder.Services.AddCors(options =>
                {
                    options.AddDefaultPolicy(
                        policy =>
                        {
                            policy.AllowAnyOrigin();
                            policy.AllowAnyHeader();
                        });
                });
            builder.Services.AddSingleton<runTimeConfiguration>();
            builder.Services.AddTransient<IFileHandler,ResultHandler>(
                sp=>{
                    var webHostEnvironment = sp.GetRequiredService<IWebHostEnvironment>();
                    return new ResultHandler(configs.storageDirectory, webHostEnvironment);
                    });
            builder.Services.AddTransient< IDataHandler, FormDataHandler>(
                sp=>{
                    var webHostEnvironment = sp.GetRequiredService<IWebHostEnvironment>();
                    return new FormDataHandler(configs.dataDirectory, webHostEnvironment);
                    });
            builder.Services.AddScoped<DbLayer>(sp=>{
                var opt = new dbOptions { //correctionPending
                dataSource = "<host name>,<TCP/IP port number>",
                userID = "server_id",            
                password = "serverPassword",     
                dbName="db_name"
                    }; 
                return new DbLayer(opt);
            });
            return builder;
        }
    }
}
