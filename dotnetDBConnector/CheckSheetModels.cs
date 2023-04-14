using System.Collections.Generic;
using Newtonsoft.Json; // to serialize list;

namespace DbConnectors.Models {

    public class CheckSheet{
        
        public string? model {get;set;}
        public string? sheetName {get;set;}
        public List<section>? sheetArray {get;set;}
        public int sheetID {get;set;}
        public string? status {get;set;}

        public static implicit operator Checksheet_Record(CheckSheet example)=> new Checksheet_Record{
                sheetName = example.sheetName,
                stations= section.convertListOfSectionsToStations(example.sheetArray!),
                id=example.sheetID,
                model=example.model,
                //status=example.status, // not transfering the status since it should be assigned through the specific api not from data 
        };
        
        public static explicit operator CheckSheet(Checksheet_Record example)=> new CheckSheet{
                sheetName = example.sheetName,
                sheetArray= section.convertListOfStationsToSections(example.stations!),
                sheetID=example.id,
                model=example.model,
                status=example.status,
        };
    
    }
    public class section {
        public string? descText {get; set;}
        public string? typ {get;set;}
        public int index {get;set;}
        public string? fieldType {get;set;}
        public System.Guid UID {get;set;}
        public List<field>? childs {get;set;}
        public static implicit operator Checksheet_Station(section example) => new Checksheet_Station{ 
            sectorName=example.descText,
            UID = example.UID,
            sequenceOrder = example.index,
            fields = field.convertListOfFieldsToDbFields(example.childs!),
            //formID= new Checksheet_Record(), 
        };
        public static explicit operator section(Checksheet_Station example) => new section{ 
            descText = example.sectorName,
            UID=example.UID,
            index= example.sequenceOrder,
            childs=field.convertListOfDbFieldsToFields(example.fields !=null ? example.fields : new List<Checksheet_Field>()),
        };
        public static List<Checksheet_Station> convertListOfSectionsToStations(List<section> input){
            var result = new List<Checksheet_Station>();
            foreach(var item in input){
                result.Add((Checksheet_Station)item);
            }
            return result;
        }
        public static List<section> convertListOfStationsToSections(List<Checksheet_Station> input){
            if (input!=null) {
                var result = new List<section>();
            foreach(var item in input){
                result.Add((section)item);
            }
            return result;
            }
            return new List<section>();
        } 
    }
    public class field {
        public System.Guid UID {get; set;}
        public string? descText {get; set;}
        public string? typ {get;set;}
        public string? fieldType {get;set;}
        
        public string? inspectionClass{get;set;}
        //public inspectionClass inspectionClass{get;set;}
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
            typ = example.fieldType, 
            fieldType = example.fieldType,
            inspectionClass =  System.Enum.Parse<Models.inspectionClass>(example.inspectionClass!), 
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
            //valueData = example.valueData,
        };
        public static explicit operator field(Checksheet_Field example) => new field(){
            UID=example.UID,
            descText =example.descText,  
            typ = example.typ, 
            fieldType = example.fieldType,
            inspectionClass = example.inspectionClass.ToString(), 
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
            //valueData = example.valueData,
        };
        
        public static List<Checksheet_Field> convertListOfFieldsToDbFields(List<field> input){
            var result = new List<Checksheet_Field>();
            foreach(var item in input){
                result.Add((Checksheet_Field)item);
            }
            return result;
        }
        public static List<field> convertListOfDbFieldsToFields(List<Checksheet_Field> input){
            var result = new List<field>();
            foreach(var item in input){
                result.Add((field)item);
            }
            return result;
        }
    }

    public enum inspectionClass{
        critical,
        major,
        minor,
    }

}