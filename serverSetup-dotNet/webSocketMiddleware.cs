using Microsoft.AspNetCore.Builder; //for classType:WebApplication
using Microsoft.AspNetCore.Http; // for headers.Append Extension; 
using System;
using System.Threading.Tasks; // for access to Task keyword
using System.Threading; // for access to Cancellation class
using System.Net.WebSockets;

namespace App.Middleware
{
public static class WebSocketMiddleWare{
    public static WebApplication AddWebSocketMiddleware(this WebApplication app){
        var webSocketOptions = new WebSocketOptions
        {
            KeepAliveInterval = TimeSpan.FromMinutes(2)
        };
        app.UseWebSockets(webSocketOptions);
        app.Use(async (context, next) =>
        {
            if(context.Request.Path == "/ws") {
                if(context.WebSockets.IsWebSocketRequest){
                    using (var websocket = await context.WebSockets.AcceptWebSocketAsync())
                    {
                        await ExchangeMessage(websocket);
                    }
                }
                else{
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    }
            }    
            else{
                await next(context);
                //await next.Invoke();
            } 
            // Do logging or other work that doesn't write to the Response
        });
        return app;
    }
    
    private static async Task ExchangeMessage(WebSocket webSocket)
    {
        var buffer = new byte[1024 * 4];
        var receiveResult = await webSocket.ReceiveAsync(
            new ArraySegment<byte>(buffer), CancellationToken.None);

        while (!receiveResult.CloseStatus.HasValue)
        {
            await webSocket.SendAsync(
                new ArraySegment<byte>(buffer, 0, receiveResult.Count),
                receiveResult.MessageType,
                receiveResult.EndOfMessage,
                CancellationToken.None);

            receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);
        }
        await webSocket.CloseAsync(
            receiveResult.CloseStatus.Value,
            receiveResult.CloseStatusDescription,
            CancellationToken.None);
    }
}
    
}