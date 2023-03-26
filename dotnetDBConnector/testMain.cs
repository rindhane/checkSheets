using DbConnectors.Models;
namespace DbConnectors
{
    public class testMain {
        public static void TestDbConnection(dbOptions opt){
            
            var test1 = new DbConnection(opt);
            test1.TrySQLquery("SELECT name, collation_name, database_id FROM sys.databases", 3);
        }

        public static void testDataInitializer(dbOptions opt){
            using var db = new DbEFContext(opt);
            db.Add(new Checksheet_Record{sheetName="test123", 
                                        status = sheetStatus.inactive.ToString(),
                                        model="model1", 
                                          } );
            db.SaveChanges();
        }

        public static void Main(string[] args){
            dbOptions opt = new dbOptions {
                dataSource = "127.0.0.1",  
                userID = "qdas",            
                password = "qdas1234",     
                dbName="QDAS_VALUE_DATABASE"
        };
            testDataInitializer(opt);
            //TestDbConnection(opt);
        }
    }       
}