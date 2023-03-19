using System.IO; //to get acces to the FileStream API 
using System.Text; //to get the encoding.UTF8
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting; //to access WebHostEnvironment interface;

namespace FileHandler { 

    public interface IFileHandler{
        
        public List<checkSheet> getCheckSheetUserData();
        public string getCheckSheet(checkSheet dat);
        public bool updateCheckSheet(checkSheet dat, string content);
        public bool createNewCheckSheet(createCheckSheet dat);
    }

    public record checkSheet {
        public string? shortDesc {get;set;} // checkSheetName i.e file name;
        public string? status{get;set;} // model name i.e directory
    }

    public record createCheckSheet{
        public checkSheet? newCheckSheet {get;set;}
        public bool fromExisting {get;set;}
        public checkSheet? refCheckSheet{get;set;}
    }

    public record updateCheckSheet{
        public checkSheet? checkSheetDetail{get;set;}
        public string? JsonString {get;set;}
    }

    public class ResultHandler:IFileHandler {
        
        private string _directoryPath ;
        private string _contentRootPath; 
        public ResultHandler(string path, IWebHostEnvironment webHostEnvironement) {
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
        
        public bool updateCheckSheet(checkSheet dat, string content){
            string fileName = dat.status + "/" + dat.shortDesc+".json";
            writeFile(fileName,content);
            return true;
        }
        public string getCheckSheet(checkSheet dat){
            string fileName = dat.status + "/" + dat.shortDesc+".json";
            if(File.Exists(_contentRootPath+_directoryPath+"/"+fileName)) {
                return ReadFile(fileName);
            }
                return "[]"; //empty arrays for enabling json parsing and forEach function at frontend to not raise error 
        }

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
