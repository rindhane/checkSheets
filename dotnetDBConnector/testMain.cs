using DbConnectors.Models;
using ReaderHandler;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore ;
using System.Threading.Tasks;

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
        
        public static void updateCheckSheet(dbOptions opt, int formID){
            var db = new DbLayer(opt);
            var reader = new ResultHandler(path:"testData");
            var content = reader.ReadFile("newTest.json");
            var jsonSettings = new JsonSerializerSettings
                        { //ref : https://stackoverflow.com/questions/31813055/how-to-handle-null-empty-values-in-jsonconvert-deserializeobject
                            //MissingMemberHandling = MissingMemberHandling.Ignore,
                            NullValueHandling = NullValueHandling.Ignore
                        };
            var result = JsonConvert.DeserializeObject<List<section>>(content, jsonSettings);
            var inputSheet = new CheckSheet();
            inputSheet.sheetID=formID;
            inputSheet.sheetArray=result;
            var record = (Checksheet_Record) inputSheet;
            db.UpdateAuthoredSheet(record.stations!, 18).GetAwaiter().GetResult();

        }
        public static void integrateNewCheckSheet(dbOptions opt, string sheetName, string model, string filePath, string fileName) {
            var db= new DbLayer(opt);
            var newSheet = new Checksheet_Record();
            newSheet.model = model;
            newSheet.sheetName= sheetName;
            newSheet.status = "active";
            db.createNewSheet(newSheet,false).GetAwaiter();
            var reader = new ResultHandler(path:filePath);
            var content = reader.ReadFile(fileName);
            List<section> blocks = JsonConvert.DeserializeObject<List<section>>(content)!; 
            var result = new List<Checksheet_Station>();
            System.Console.WriteLine(newSheet.id);
            foreach (var block in blocks){
                var tempBlock = (Checksheet_Station)block;
                tempBlock.UID=System.Guid.NewGuid();
                var i =0;
                foreach(var _field in tempBlock.fields!){
                    _field.UID = System.Guid.NewGuid();
                    _field.stationID = tempBlock.UID;
                    i++;
                }
                result.Add(tempBlock);
            }
            var tempResult = new List<section>();
            foreach(var item in result){
                tempResult.Add((section)item);
            }
            //db.UpdateAuthoredSheet(result, newSheet.id).GetAwaiter();
            System.Console.WriteLine(JsonConvert.SerializeObject(tempResult));
        }
        public static void testCheckSheetRetrieval(dbOptions opt,int formId){
            var db = new DbLayer(opt);
            var result = db.getCheckSheetCopy(formId).GetAwaiter().GetResult();
            var answer = (CheckSheet)result;
            var stringResult = JsonConvert.SerializeObject(answer);
            System.Console.WriteLine(stringResult);
        }
        public static void getAllCheckSheet(dbOptions opt){
            var db = new DbLayer(opt);
            var result = db.allUserCheckSheets().GetAwaiter().GetResult();
            var stringResult = JsonConvert.SerializeObject(result);
            System.Console.WriteLine(stringResult);
        }

        public static void deleteAllCheckSheet(dbOptions opt){
            var db = new DbLayer(opt);
            var result = db.allUserCheckSheets().GetAwaiter().GetResult();
            foreach(var item in result){
                System.Console.WriteLine(item.sheetID);
                var response = db.deleteCheckSheet(item.sheetID).GetAwaiter().GetResult(); 
                System.Console.WriteLine(response);
            } 
             
        }

        public static string createScriptOfDbModel(dbOptions opt){
            var db = new DbLayer(opt);
            //ref : https://github.com/dotnet/efcore/issues/2943
            //https://learn.microsoft.com/en-us/dotnet/api/microsoft.entityframeworkcore.storage.irelationaldatabasecreator.generatecreatescript?view=efcore-7.0
            string fileName = "sql_script.sql";
            var fileStream = System.IO.File.Create(fileName);
            var sqlContent = db.dbEntity.Database.GenerateCreateScript();
            fileStream.Write(System.Text.Encoding.ASCII.GetBytes(sqlContent),0,System.Text.Encoding.UTF8.GetByteCount(sqlContent));
            fileStream.Close();
            System.Console.WriteLine($"file:{fileName} was created");
            return fileName;
        }
        public static void Main(string[] args){
            dbOptions opt = new dbOptions {
                dataSource = "127.0.0.1,1433",
                userID = "qdas",            
                password = "qdas1234",     
                dbName="QDAS_VALUE_DATABASE"
        }; 
            var test = new System.Guid("de9343c4-7465-42ef-a45b-a2d5195f3b19");
            var sqlString = createScriptOfDbModel(opt);
            
            //deleteAllCheckSheet(opt);
            //integrateNewCheckSheet(opt,"testModelFullSheet", "testModelFull","testData", "K19 - QSK19 ASSEMBLY .json");
            //updateCheckSheet(opt,18);
            //System.Console.WriteLine(test);
            //getAllCheckSheet(opt);
            //testCheckSheetRetrieval(opt,29);
            //testCheckSheetSave(opt, 1);
            //testDataInitializer(opt);
            //TestDbConnection(opt);
        }
    }       
}