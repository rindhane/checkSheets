using DbConnectors.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;// to use List type
using Microsoft.EntityFrameworkCore;
using System.Collections; // to access DictionaryEntry

namespace DbConnectors {
    public class DbLayer{
        public DbEFContext dbEntity ;
        public DbLayer( dbOptions opt){
            dbEntity = new DbEFContext(opt);
            dbEntity.SaveChangesFailed+=SaveChangesFailureEvent;//correctionPending
        }
        public async Task<int> createNewSheet(Checksheet_Record newSheet, bool existing, int ExistingSheetId = -1){
            _ = dbEntity.Checksheet_Record!.Add(newSheet);
            dbEntity.SaveChanges(); // to receive newSheet.id
            if (existing) {
                //var oldCheckSheet = dbEntity.Checksheet_Record!.Where(record=>record.id==id).First();
                dbEntity.Checksheet_Stations!
                               .Include(station=>station.fields) 
                               .AsParallel()
                               .Where(station=>station.form! == new Checksheet_Record(){id=ExistingSheetId})
                               .ForAll(station=>{
                                    var newStation = new Checksheet_Station(){
                                    sectorName= station.sectorName,
                                    form= newSheet, 
                                    sequenceOrder=station.sequenceOrder,
                                    UID= System.Guid.NewGuid()
                                    };
                                    dbEntity.Checksheet_Stations!.Add(newStation);
                                    dbEntity.SaveChangesAsync();
                                    var newFields = new List<Checksheet_Field>();
                                    station.fields!
                                    .ToList()
                                    .ForEach(newField=>{
                                        newField.station=newStation;
                                        newFields.Add(newField);
                                    });
                                    dbEntity.Checksheet_Fields!.AddRangeAsync(newFields);
                                    dbEntity.SaveChangesAsync();
                               });
            }
            await Task.Delay(0);
            return dbEntity.SaveChanges();
        }
        public async Task<int> changeStatusOfCheckSheet(int id, sheetStatus state) {
            var sheet = dbEntity.Checksheet_Record!.Single(sheet=>sheet.id==id);
            sheet.status=state.ToString();
            await Task.Delay(0);
            return dbEntity.SaveChanges();
        }

        public async Task<Checksheet_Record> getCheckSheetCopy(int formId){
            var stations = dbEntity.Checksheet_Stations!.
                        Include(station=>station.fields)
                        .Where(station=>station.formFK==formId)
                        .Select(station=>station)
                        .ToList();
            var record= dbEntity.Checksheet_Record!
                            .Include(sheet=>sheet.stations)
                            .Where(sheet=>sheet.id==formId)
                            .Select(record=>record
                            ).First();
            //record.stations=stations; //why this is unnecessary ? 
            await Task.Delay(0);
            return record;
        }
        public async Task UpdateAuthoredSheet(List<Checksheet_Station> sheetStations , int formID ) {
            var stationListInDB = dbEntity.Checksheet_Stations!
                                        .Include(station=>station.fields)
                                        .Where(station=>station == new Checksheet_Station(){
                                                                    form = new Checksheet_Record(){id=formID}}
                                        );
            var tasks = new List<Task>(); // to collect all the task 
            if(stationListInDB.Count()>0){
                System.Console.WriteLine("this route was taken");
            tasks.Add(addNewSections(sheetStations.Except(stationListInDB))); //action on new stations
            tasks.Add(deleteStations(stationListInDB.Except(sheetStations)));//action on deleted Stations
            var modStations = stationListInDB.Intersect(sheetStations);
            tasks.Add(updateSections(modStations, sheetStations));
            Task.WhenAll(tasks).Wait(); 
            dbEntity.SaveChanges();
            return ;   
            }
            await addNewSections(sheetStations);
            dbEntity.SaveChanges();
            return ;
        }
        public async Task addNewSections(IEnumerable<Checksheet_Station> newStations ) 
        {
            dbEntity.Checksheet_Stations!.AddRange(newStations);
            newStations
            .AsParallel()
            .ForAll(station=>{
                dbEntity.AddRange(station.fields!);
            }); 
            await Task.Delay(0);
            return ; 
        }
        public async Task updateSections(IQueryable<Checksheet_Station> modStations, 
                                            List<Checksheet_Station> newSections)
        {  var stationSet = newSections.ToHashSet();
            modStations
            .Include(m=>m.fields)
            .AsParallel()
            .ForAll(station=>{
                var newValStation = new Checksheet_Station();
                stationSet.TryGetValue(station, out newValStation);
                station.sectorName = newValStation!.sectorName ;
                station.sequenceOrder = newValStation.sequenceOrder;
                //dbEntity.SaveChangesAsync(); //not required
                _ = updateFields(station, newValStation.fields!);
            });
            await Task.Delay(0);
            return ; 
        }

        public async Task updateFields( Checksheet_Station station , ICollection<Checksheet_Field>modFields)
        {
           _ = DeleteFieldsFromUpdate(station, modFields);
           modFields
           .AsParallel()
           .ForAll(modField=>{
            if(dbEntity.Checksheet_Fields!.Any(field=>field==modField)){
                _ = modifyField(modField);
            }
            else{
                dbEntity.Checksheet_Fields!.AddAsync(modField);
            }
           }
           );
           await Task.Delay(0);
           return ;  
        }

        public async Task modifyField(Checksheet_Field newField ){
           var fieldInDB =  dbEntity.Checksheet_Fields!
                    .Where(fieldDB=>fieldDB==newField)
                    .Select(fieldDb=>new Checksheet_Field{UID=fieldDb.UID})
                    .ExecuteUpdateAsync(f=>f
                        .SetProperty(f=>f.descText, x=>newField.descText)
                        //.SetProperty(f=>f.fieldType, x=>newField.fieldType) //fieldType cannot change, it is fixed at the creation
                        .SetProperty(f=>f.inspectionClass, x=>newField.inspectionClass)
                        .SetProperty(f=>f.specDef, x=>newField.specDef)
                        .SetProperty(f=>f.meanValue, x=>newField.meanValue)
                        .SetProperty(f=>f.maxCheck, x=>newField.maxCheck)
                        .SetProperty(f=>f.minCheck, x=>newField.minCheck)
                        .SetProperty(f=>f.multipleOptions, x=>newField.multipleOptions)
                        .SetProperty(f=>f.addIncrement, x=>newField.addIncrement)
                        .SetProperty(f=>f.addDecrement, x=>newField.addDecrement)
                        .SetProperty(f=>f.dataSource, x=>newField.dataSource)
                        .SetProperty(f=>f.sourceField, x=>newField.sourceField)
                        .SetProperty(f=>f.imageData, x=>newField.imageData)
                        );
                        //_ = dbEntity.SaveChangesAsync();
            await Task.Delay(0);
            return ;
        }

        public async Task DeleteFieldsFromUpdate(Checksheet_Station station , ICollection<Checksheet_Field>modFields){
            var fieldSet = modFields.ToHashSet();
           dbEntity.Checksheet_Fields!
                    .AsParallel()
                    .Select(fieldSelect=>new Checksheet_Field{UID=fieldSelect.UID,station=fieldSelect.station})
                    .Where(fieldSelect=>fieldSelect.station! ==station)
                    .ForAll(fieldInDB=>{
                        var tempField = new Checksheet_Field();
                        if(!fieldSet.TryGetValue(fieldInDB, out tempField)){
                            dbEntity.Remove(fieldInDB);
                            //dbEntity.SaveChanges();
                        }
                    });
            await Task.Delay(0);
            return ;        
        }
        
        public async Task deleteStations(IEnumerable<Checksheet_Station> delStations){
            delStations.AsParallel()
                    .ForAll(station=>{
                        //dbEntity.RemoveRange(station.fields!); //correctionPending see if fields are required
                        dbEntity.Remove(station);
                    }
            );
            await Task.Delay(0);
            return ;
        }

        public void SaveChangesFailureEvent(object? sender, SaveChangesFailedEventArgs e){
            System.Console.WriteLine(e.Exception.Message);
            System.Console.WriteLine(e.Exception.InnerException!.Message);
            System.Console.WriteLine("error in saving");
            foreach (DictionaryEntry handle in e.Exception.InnerException.Data){
                System.Console.WriteLine($"key:{handle.Key}| Item: {handle.Value} ");
            }
            foreach (var key in e.Exception.Data){
                System.Console.WriteLine($"key:{key}| Item: {e.Exception.Data[key]} ");
            }
        }
    }
}