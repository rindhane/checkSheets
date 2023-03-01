using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Builder;
using App.Configurations;
using Microsoft.Extensions.Hosting; // to access type hostoption; BackgroundServiceExceptionBehavior  
using FileHandler;
namespace BackendServices {

    public static class Services{

        public static WebApplicationBuilder AddServices(this WebApplicationBuilder builder, SystemConfigurations configs ){
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
                sp=>new ResultHandler(configs.storageDirectory));
            return builder;
        }
    }
}
