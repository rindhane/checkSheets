using DbConnectors.Models;

namespace JsonResponseStruct{
    public class CheckSheetStatus {
        public int sheetID {get; set;}
        public string? newStatus {get; set;} 
    }
    public class createCheckSheetInput{
        public CheckSheet? newCheckSheet {get; set;}
        public bool fromExisting {get; set;}
        public CheckSheet? refCheckSheet {get; set;} 
    }
}