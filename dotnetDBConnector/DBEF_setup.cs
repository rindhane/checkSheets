using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using DbConnectors.Models;

namespace DbConnectors {
    public class DbEFContext : DbContext{
        string _connectionString ;
        SqlConnectionStringBuilder connectionParamsSetter(dbOptions opt){
            SqlConnectionStringBuilder builder = new SqlConnectionStringBuilder();
            builder.DataSource = opt.dataSource;//"127.0.0.1"; 
            builder.UserID = opt.userID ; //"qdas";            
            builder.Password = opt.password;//"qdas1234";     
            builder.InitialCatalog = opt.dbName;//"QDAS_VALUE_DATABASE";
            builder.TrustServerCertificate=true;
            return builder;
        }
        
        public DbEFContext(dbOptions opt ){
            _connectionString = connectionParamsSetter(opt).ConnectionString;
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //refer : https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/#simple-dbcontext-initialization-with-new
            //optionsBuilder.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=Test");
            optionsBuilder.UseSqlServer(_connectionString);
        }

        public DbSet<Checksheet_Record>? Checksheet_Record{get; set;}
        public DbSet<Checksheet_Station>? Checksheet_Stations{get; set;}
        public DbSet<Checksheet_Field>? Checksheet_Fields{get; set;}

        public DbSet<Checksheet_Values>?Checksheet_Values{get;set;}

        public DbSet<Checksheet_Rework_Values>?Checksheet_Rework_Values{get;set;}
        protected override void OnModelCreating(ModelBuilder modelBuilder) 
        {
            //refer : https://learn.microsoft.com/en-us/aspnet/core/data/ef-mvc/intro?view=aspnetcore-7.0#create-the-database-context
            modelBuilder.Entity<Checksheet_Record>().ToTable("CHECKSHEET_RECORD");
            modelBuilder.Entity<Checksheet_Station>().ToTable("CHECKSHEET_STATIONS");
            modelBuilder.Entity<Checksheet_Field>().ToTable("CHECKSHEET_FIELDS");
            modelBuilder.Entity<Checksheet_Values>().ToTable("CHECKSHEET_VALUES");
            modelBuilder.Entity<Checksheet_Rework_Values>().ToTable("CHECKSHEET_REWORK_VALUES");
            
        }

    }

}