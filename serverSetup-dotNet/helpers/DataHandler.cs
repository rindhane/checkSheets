using System.IO; //to get acces to the FileStream API 
using System.Text; //to get the encoding.UTF8
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting; //to access WebHostEnvironment interface;
using Newtonsoft.Json; // to handle json string
using DbConnectors.Models; // need access to class CheckSheet_Values

namespace FileHandler { 

    public interface IDataHandler{
        
        public List<checkSheet> getCheckSheetUserData();
        public string getCheckSheet(checkSheet dat);
        public bool updateFormData(singleFormUpdate update);
        //public bool createNewCheckSheet(createCheckSheet dat);

        public bool updateFormData(singleFormUpdate2 update);
    }

    public record singleFormUpdate {
        public string? ESN {get;set;}
        public List<sectionValues>? formUpdates {get;set;}

    }

    public record singleFormUpdate2{
        public string? ESN {get;set;}
        public string? sheetID {get;set;}

        public List<Checksheet_Values>? formUpdates {get;set; }
        public List<Checksheet_Rework_Values>? reworkUpdates {get;set; }
    }

    public record sectionValues {
        public string? stationName {get;set;}
        public List<valueSet>? valueSets {get;set;}
    }

    public record valueSet {
        public string? parameterName {get;set;} 
        public string? inputValue {get;set;} 
    }
    
    public class FormDataHandler : IDataHandler {
        
        private string _directoryPath ;
        private string _contentRootPath; 
        public FormDataHandler (string path, IWebHostEnvironment webHostEnvironement) {
           _contentRootPath =webHostEnvironement.ContentRootPath;
            _directoryPath = path;
            //_path = System.Environment.GetEnvironmentVariable("logFile");
        }

        private string [] cleanAdditionalPath(string[]items, string replaceScheme){
            for (int i=0;i<items.Length;i++){
                items[i]=items[i].Replace(replaceScheme,""); //removing earlier path
            }
            return items;
        }

        public List<checkSheet> getCheckSheetUserData(){
            var result = new List<checkSheet>();
            string[] dirs = Directory.GetDirectories(_directoryPath);
            string[] files = new string[0] ;
            dirs = cleanAdditionalPath(dirs, _directoryPath+"\\");
            for (int i=0;i<dirs.Length;i++){ //looking into each directory
                files = Directory.GetFiles(_directoryPath+"/"+dirs[i]);
                files= cleanAdditionalPath(files,_directoryPath+"/"+dirs[i]+"\\");
                files = cleanAdditionalPath(files,".json");
                for (int j=0; j<files.Length; j++){ // obtaining each file withing current directory
                    var temp = new checkSheet{
                        shortDesc=files[j],
                        status=dirs[i]
                    };
                    result.Add(temp);
                }
            }
            return result;
        }
        
        public bool updateFormData(singleFormUpdate update){
            string fileName =  update.ESN!.ToString()+".json";
            //string oldContent = ReadFile(fileName);
            writeFile(fileName, JsonConvert.SerializeObject(update.formUpdates));
            return true;
        }

        public bool updateFormData(singleFormUpdate2 update){
            string fileName =  update.ESN!.ToString()+".json";
            //string oldContent = ReadFile(fileName);
            writeFile(fileName, JsonConvert.SerializeObject(update.formUpdates));
            return true;
        }
        public string getCheckSheet(checkSheet dat){
            string fileName = dat.status + "/" + dat.shortDesc+".json";
            if(File.Exists(_contentRootPath+_directoryPath+"/"+fileName)) {
                return ReadFile(fileName);
            }
                return "[]"; //empty arrays for enabling json parsing and forEach function at frontend to not raise error 
        }

        /*
        public bool createNewCheckSheet(createCheckSheet dat){
            Directory.CreateDirectory(_directoryPath+"/"+dat.newCheckSheet!.status);
            if(dat.fromExisting){
                string existingContent=getCheckSheet(dat.refCheckSheet!);
                updateCheckSheet(dat.newCheckSheet,existingContent);
                return true;
            }
            updateCheckSheet(dat.newCheckSheet,"[]");
            return true;
        }
        */
        public void writeFile(string fileName, string content) {
            int buffer=4096;
            FileStream fs= new FileStream(_directoryPath+"/"+fileName,
                                        FileMode.Create,
                                        FileAccess.Write,
                                        FileShare.ReadWrite,
                                        buffer, FileOptions.Asynchronous);
            StreamWriter sw = new StreamWriter(fs, Encoding.UTF8);
            sw.WriteLine(content);
            sw.Close();
            sw.Dispose();
        }

        public string ReadFile(string fileName){
            int buffer=4096;
            FileStream fs= new FileStream(_directoryPath+"/"+fileName,
                                        FileMode.Open,
                                        FileAccess.Read,
                                        FileShare.ReadWrite,
                                        buffer, FileOptions.Asynchronous);
            var sr = new StreamReader(fs, Encoding.UTF8);//File.AppendText(_path);
            string result;
            result = sr.ReadToEnd();
            sr.Close();
            sr.Dispose();
            return result;
        }
    }
}
