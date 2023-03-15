using System.IO;
using System.Collections;

namespace RequestResponseHandlers{
    public static class httpHandlers {
        public static string getRequestBody(Stream str){
            var reader = new StreamReader(str);
            string tempString = reader.ReadToEndAsync().GetAwaiter().GetResult();
            return tempString;
        }

        public static string addParamsToURL(string baseURL, string queryString){
            return baseURL+queryString;
        }
    }

}