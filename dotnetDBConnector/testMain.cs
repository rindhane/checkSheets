using DbConnectors.Models;
using FileHandler;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore ;

namespace DbConnectors
{
    public class testMain {
        public static void TestDbConnection(dbOptions opt){
            var test1 = new DbConnection(opt);
            test1.TrySQLquery("SELECT name, collation_name, database_id FROM sys.databases", 3);
        }

        public static void testDataInitializer(dbOptions opt){
            var db = new DbLayer(opt);
            var reader = new ResultHandler(path:"testData");
            var content = reader.ReadFile("Type1 3 copy.json");
            var jsonSettings = new JsonSerializerSettings
                        { //ref : https://stackoverflow.com/questions/31813055/how-to-handle-null-empty-values-in-jsonconvert-deserializeobject
                            //MissingMemberHandling = MissingMemberHandling.Ignore,
                            NullValueHandling = NullValueHandling.Ignore
                        };
            var result = JsonConvert.DeserializeObject<List<section>>(content, jsonSettings);
            var answer = result!.Select(section=>{
                var item = string.Empty;
                try {
                    item = section.childs!.Where(field=>field.dataSource!=null).Single().descText;
                }catch{}
                if(item==string.Empty){
                    return string.Empty;
                }
                return item;
            }
            );
            foreach (var item in answer){
                System.Console.WriteLine(item!.ToString());
            } 
        }
        public static void testCheckSheetSave(dbOptions opt, int formID){
            var db = new DbLayer(opt);
            //var sol= db.dbEntity.Database.GenerateCreateScript();
            //System.Console.WriteLine(sol);
            var sheetTest= new Checksheet_Record{
                                        sheetName="test1", 
                                        model="testModel", 
                                        status= sheetStatus.active.ToString()};
            db.createNewSheet(sheetTest,false).GetAwaiter();
            var reader = new ResultHandler(path:"testData");
            var content = reader.ReadFile("Type1 3 copy.json");
            var jsonSettings = new JsonSerializerSettings
                        { //ref : https://stackoverflow.com/questions/31813055/how-to-handle-null-empty-values-in-jsonconvert-deserializeobject
                            //MissingMemberHandling = MissingMemberHandling.Ignore,
                            NullValueHandling = NullValueHandling.Ignore
                        };
            var result = JsonConvert.DeserializeObject<List<section>>(content, jsonSettings);
            var inputSheet = new List<Checksheet_Station>();
            // result.AsParallel // correctionPending : Parallelize this 
            foreach (var section in result!){ //correctionPending Parallelize this
                var station = (Checksheet_Station) section;
                station.formFK = sheetTest.id;
                station.UID= System.Guid.NewGuid();
                inputSheet.Add(station);
                station.fields= new List<Checksheet_Field>();
                foreach(var child in section.childs!){ //correctionPending Parallelize this
                    var newField = (Checksheet_Field)child;
                    newField.stationID = section.UID; 
                    station.fields.Add(newField);
                }
            }
            _ = db.UpdateAuthoredSheet(inputSheet, sheetTest.id);          
        }
        public static void testCheckSheetRetrieval(dbOptions opt,int formId){
            var db = new DbLayer(opt);
            var result = db.getCheckSheetCopy(formId).GetAwaiter().GetResult();
            var answer = (CheckSheet)result;
            var stringResult = JsonConvert.SerializeObject(answer);
            System.Console.WriteLine(stringResult);
        }

        public static void Main(string[] args){
            dbOptions opt = new dbOptions {
                dataSource = "127.0.0.1",  
                userID = "qdas",            
                password = "qdas1234",     
                dbName="QDAS_VALUE_DATABASE"
        }; 
            testCheckSheetRetrieval(opt,29);
            //testCheckSheetSave(opt, 1);
            //testDataInitializer(opt);
            //TestDbConnection(opt);
        }
    }       
}