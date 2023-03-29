using DbConnectors.Models;
using FileHandler;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

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
        public static void testCheckSheetSave(dbOptions opt){
            var db = new DbLayer(opt);
            var reader = new ResultHandler(path:"testData");
            var content = reader.ReadFile("Type1 3 copy.json");
            var jsonSettings = new JsonSerializerSettings
                        { //ref : https://stackoverflow.com/questions/31813055/how-to-handle-null-empty-values-in-jsonconvert-deserializeobject
                            //MissingMemberHandling = MissingMemberHandling.Ignore,
                            NullValueHandling = NullValueHandling.Ignore
                        };
            var result = JsonConvert.DeserializeObject<List<section>>(content, jsonSettings);
            foreach (var section in result!){
                var station = (Checksheet_Station) section;
                //station
            }            
        }

        public static void Main(string[] args){
            dbOptions opt = new dbOptions {
                dataSource = "127.0.0.1",  
                userID = "qdas",            
                password = "qdas1234",     
                dbName="QDAS_VALUE_DATABASE"
        };
            testCheckSheetSave(opt);
            //testDataInitializer(opt);
            //TestDbConnection(opt);
        }
    }       
}