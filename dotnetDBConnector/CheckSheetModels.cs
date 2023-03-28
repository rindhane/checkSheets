using System.Collections.Generic;
using Newtonsoft.Json; // to serialize list;

namespace DbConnectors.Models {

    public class CheckSheet{
        
        public string? model {get;set;}
        public string? sheetName {get;set;}
        public List<section>? sheetArray {get;set;}
    }
    public class section {
        public string? descText {get; set;}
        public string? typ {get;set;}
        public int index {get;set;}
        public string? fieldType {get;set;}
        public string? UID {get;set;}
        public List<field>? childs {get;set;}

    }
    public class field {
        public System.Guid UID {get; set;}
        public string? descText {get; set;}
        public string? typ {get;set;}
        public string? fieldType {get;set;}
        
        public inspectionClass inspectionClass{get;set;}
        public string? specDef{get;set;}
        public float meanValue {get;set;}
        public float maxCheck {get;set;} 
        public float minCheck {get;set;}
        
        public List<string>? multipleOptions {get; set;}
        public float addIncrement {get;set;}
        public float addDecrement {get;set;}
        public string? dataSource {get;set;}
        public string? sourceField {get;set;}
        public string? imageData {get;set;}
        public string? valueData {get;set;}
        public List<field>? childs {get;set;}

        public string getStringFromListForMultipleOptions( ){
            string result = "";
            string separator = " , ";
            int i=0;
            multipleOptions!.ForEach(delegate(string option){
                if(i!=0) {
                    result=result + separator + "\""+option.ToString()+"\"";
                }
                    result=result + "\""+option.ToString()+"\"";
            });
            result = "["+result+"]";
            return result;
        }

        public string getStringFromListForMultipleOptionsFromJSONConvert( ){
            return JsonConvert.SerializeObject(multipleOptions);
        }

        public static List<string> getListForMultipleOptionStringFromJSONConvert(string s ){
            return JsonConvert.DeserializeObject<List<string>>(s)!;
        }

        public static implicit operator Checksheet_Field(field example) => new Checksheet_Field(){
            UID=example.UID,
            descText =example.descText,  
            fieldType = example.fieldType, 
            inspectionClass = example.inspectionClass, 
            specDef =example.specDef, 
            meanValue = example.meanValue, 
            maxCheck= example.maxCheck, 
            minCheck = example.minCheck, 
            multipleOptions  = example.getStringFromListForMultipleOptionsFromJSONConvert(),
            addIncrement = example.addIncrement,
            addDecrement = example.addDecrement,
            dataSource = example.dataSource,
            sourceField = example.sourceField,
            imageData = example.imageData,
            valueData = example.valueData,
        };
        public static explicit operator field(Checksheet_Field example) => new field(){
            UID=example.UID,
            descText =example.descText,  
            fieldType = example.fieldType, 
            inspectionClass = example.inspectionClass, 
            specDef =example.specDef, 
            meanValue = example.meanValue, 
            maxCheck= example.maxCheck, 
            minCheck = example.minCheck, 
            multipleOptions  = field.getListForMultipleOptionStringFromJSONConvert(example.multipleOptions!),
            addIncrement = example.addIncrement,
            addDecrement = example.addDecrement,
            dataSource = example.dataSource,
            sourceField = example.sourceField,
            imageData = example.imageData,
            valueData = example.valueData,
        };
        
    }

    public enum inspectionClass{
        critical,
        major,
        minor,
    }

}