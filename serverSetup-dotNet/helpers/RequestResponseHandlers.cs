using System.IO;

namespace RequestResponseHandlers{
    public static class httpHandlers {
        public static string getRequestBody(Stream str){
            var reader = new StreamReader(str);
            string tempString = reader.ReadToEndAsync().GetAwaiter().GetResult();
            return tempString;
        }
    }
}