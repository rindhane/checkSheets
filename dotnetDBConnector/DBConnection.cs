using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
namespace DbConnectors
{
    public record dbOptions{
        public string? dataSource {get;set;}
        public string? userID  {get;set;}

        public string? password  {get;set;}

        public string? dbName {get;set;}
    }
    
    public class DbConnection {

        private SqlConnection _connection;

        public SqlConnectionStringBuilder connectionParamsSetter(dbOptions opt){
            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
            builder.DataSource = opt.dataSource;//"127.0.0.1"; 
            builder.UserID = opt.userID ; //"qdas";            
            builder.Password = opt.password;//"qdas1234";     
            builder.InitialCatalog = opt.dbName;//"QDAS_VALUE_DATABASE";
            builder.TrustServerCertificate=true;
            return builder;
        }

        public DbConnection(dbOptions opt){
            var builder = connectionParamsSetter(opt);            
            _connection = new SqlConnection(builder.ConnectionString);
        }
        private void openConnection(){
            _connection.Open();
        }
        private void closeConnection(){
            _connection.Close();
        }
        public void TrySQLquery (string query, int num_params) {
            Func<object[], string[]>  method = all_strings_from_params;
            this.openConnection();
            SqlCommand command = new SqlCommand(query, _connection);
            SqlDataReader reader ;
            try {
                reader = command.ExecuteReader();
                while (reader.Read())
                {
                    string[] args = method(get_params_from_query(reader,num_params));
                    string place_holder = get_string_placeholder(num_params);
                    System.Console.WriteLine(place_holder, args);//System.Console.WriteLine("{0} {1}", reader.GetString(0), reader.GetString(1));
                }
                reader.Close();
            }catch (Exception ex){
                System.Console.WriteLine(ex.Message);
                
            }finally{

            }
            this.closeConnection();
        }
        public List<object[]> ValuesFromSQLquery (string query, int num_params) {
            var result = new List<object[]>();
            this.openConnection();
            SqlCommand command = new SqlCommand(query, _connection);
            SqlDataReader reader ; 
            try{
                reader = command.ExecuteReader();
                while (reader.Read())
                {
                    object[] temp = get_params_from_query(reader,num_params);
                    result.Add(temp);
                }
                reader.Close();
            }catch (Exception ex){
                System.Console.WriteLine(ex.Message);
            }
            finally{
            
            }
            this.closeConnection();
            return result;
        }

        public List<object[]> GetSingleRowFromSQLquery (string query, int num_params) {
            var result = new List<object[]>();
            this.openConnection();
            SqlCommand command = new SqlCommand(query, _connection);
            SqlDataReader reader; 
            try {
                reader = command.ExecuteReader();
                if(reader.Read())
                {
                    
                    object[] temp = get_params_from_query(reader,num_params);
                    result.Add(temp);
                }
                reader.Close();
            }catch (Exception ex){
                System.Console.WriteLine(ex.Message);
            }finally{
            }
            this.closeConnection();
            return result;
        }

        object[] get_params_from_query(SqlDataReader reader, int num_params ) {
                var result=new object[num_params]; 
                for (int i=0; i<num_params ; i++)
                {
                    result[i]=reader.GetValue(i);
                }
                return result;
        }
        public string[] all_strings_from_params(object[] args){
            string[] result = new string[args.Length];
            for(int i=0;i<args.Length;i++){
                result[i]=args[i].ToString()!;
            }
            return result;
        }
        string get_string_placeholder(int num_params){
            string result = "";
            for(int i=0;i<num_params; i++){
                result=result+ $"{{{i}}} ";
            }
            return result;            
        }
    
        public bool insert_new_row(string query){
            this.openConnection();
            SqlCommand command = new SqlCommand(query, _connection);
            int state = 0;
            try {
                command.ExecuteNonQuery();
                state=1;
            }catch (Exception ex){
                System.Console.WriteLine(ex.Message);
            }finally{
            }
            this.closeConnection();
            if(state==1){
                return true;
            }
            return false;
        }
    }
}

