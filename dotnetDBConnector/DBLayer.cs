using DbConnectors.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;// to use List type
using Microsoft.EntityFrameworkCore;
using System.Collections; // to access DictionaryEntry

namespace DbConnectors {
    public class DbLayer{
        public DbEFContext dbEntity ;

        dbOptions optConfig ; 
        public DbLayer( dbOptions opt){
            optConfig=opt;
            dbEntity = spawnNewContext();
        }

        DbEFContext spawnNewContext (){
            var temp_dbEntity = new DbEFContext(optConfig); 
            temp_dbEntity.SaveChangesFailed+=SaveChangesFailureEvent;//correctionPending
            return temp_dbEntity;
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

        public async Task<List<CheckSheet>> allUserCheckSheets(){
            var result = new List<CheckSheet>();
            await dbEntity.Checksheet_Record!
                                .ForEachAsync(record=>{
                                    var item = (CheckSheet)record;
                                    result.Add(item);
                                });
            return result;
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

            /*
            var testStation = new Checksheet_Station{
                                                        form = new Checksheet_Record(){id=formID}
                                                    };
            */
            var stationListInDB = dbEntity.Checksheet_Stations!
                                        .Include(station=>station.fields)
                                        .Where(station=>station.formFK==formID).ToList();
                                        //.Select(station=>station);
                                        /*
                                        .Where(station=>station == new Checksheet_Station{
                                                        form = new Checksheet_Record(){id=formID}
                                                    })
                                        .Select(station=>station);
                                        */
            var tasks = new List<Task>(); // to collect all the task
            if(stationListInDB.Count()>0)
            {
                tasks.Add(addNewSections(sheetStations.Except(stationListInDB), formID)); //action on new stations
                tasks.Add(deleteStations(stationListInDB.Except(sheetStations)));//action on deleted Stations
                var modStations = stationListInDB.Intersect(sheetStations).ToList();
                tasks.Add(updateSections(modStations, sheetStations));
                Task.WhenAll(tasks).Wait(); 
                dbEntity.SaveChanges();
                return ;   
            }
            await addNewSections(sheetStations, formID);
            dbEntity.SaveChanges();
            return ;
        }
        public async Task addNewSections(IEnumerable<Checksheet_Station> newStations, int formID ) 
        {
            if (!(newStations.Count()>0)) //no action if no new stations 
            {
                return ;
            }
            var temp_dbEntity = spawnNewContext();
            foreach (var s  in newStations){
                s.formFK=formID;
            }
            temp_dbEntity.Checksheet_Stations!.AddRange(newStations);
            newStations
            .AsParallel()
            .ForAll(station=>{
                temp_dbEntity.AddRange(station.fields!); //correctionPending check whether .Checksheet_fields need to be appended 
            }); 
            await temp_dbEntity.SaveChangesAsync();
            return ; 
        }
        public async Task updateSections(List<Checksheet_Station> modStations, 
                                            List<Checksheet_Station> newSections)
        {  
            
            if (!(modStations.Count()>0)) { //no action no sections for modifications
                return ;
            }
            
            var stationSet = newSections.ToHashSet();
            var tasks = new Task[modStations.Count];
            int i = 0 ;
            foreach(var station in modStations)
            {
                tasks[i] = new Task(()=>
                {
                    var tempStation = new Checksheet_Station();
                    if(stationSet.TryGetValue(station, out tempStation))
                    {
                        _ = updateFields(station, tempStation.fields!);
                    }
                });
                tasks[i].Start();
                i++;
            };
            modStations
            .AsParallel()
            .ForAll(station=>{
                var temp_dbEntity= spawnNewContext();
                var newValStation = new Checksheet_Station();
                stationSet.TryGetValue(station, out newValStation);
                temp_dbEntity.Checksheet_Stations!
                        .Where(getStation=>getStation==newValStation!)
                        .ExecuteUpdateAsync(s=>s //existing station
                        .SetProperty(s=>s.sectorName, x=>newValStation!.sectorName)
                        .SetProperty(s=>s.sequenceOrder, x=>newValStation!.sequenceOrder)
                        ).GetAwaiter();
                temp_dbEntity.SaveChangesAsync().GetAwaiter();
            });
            Task.WaitAll(tasks);
            await Task.Delay(0);
            return ; 
        }

        public async Task updateFields( Checksheet_Station station , ICollection<Checksheet_Field>modFields)
        {
           modFields
           .AsParallel()
           .ForAll(modField=>{
            var temp_dbEntity = spawnNewContext();
            if(temp_dbEntity.Checksheet_Fields!.Any(field=>field==modField)){
                modifyField(modField).GetAwaiter();
            }
            else{
                modField.stationID = station.UID;
                temp_dbEntity.Checksheet_Fields!.AddAsync(modField).GetAwaiter();
            }
            temp_dbEntity.SaveChangesAsync().GetAwaiter();
           }
           );
           
           await DeleteFieldsFromUpdate(station, modFields);
           return ;  
        }

        public async Task modifyField(Checksheet_Field newField ){
            var temp_dbEntity = spawnNewContext();
           var status =  await temp_dbEntity.Checksheet_Fields!
                    .Where(fieldDB=>fieldDB==newField)
                    //.Select(fieldDb=>new Checksheet_Field{UID=fieldDb.UID})
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
            await temp_dbEntity.SaveChangesAsync();
            return ;
        }

        public async Task DeleteFieldsFromUpdate(Checksheet_Station station , ICollection<Checksheet_Field>modFields)
        {
            var fieldSet = modFields.ToHashSet();
            var temp_dbEntity = spawnNewContext();
            temp_dbEntity.Checksheet_Fields!
                    .Where(fieldSelect=>fieldSelect.station! == station)
                    .AsParallel()
                    //.Select(fieldSelect=>new Checksheet_Field{UID=fieldSelect.UID,station=fieldSelect.station})
                    //.Select(fieldSelect=>fieldSelect)
                    .ForAll(fieldInDB=>{
                        var temp_dbEntity_internal = spawnNewContext();
                        var tempField = new Checksheet_Field();
                        if(!fieldSet.TryGetValue(fieldInDB, out tempField)){
                            temp_dbEntity_internal.Checksheet_Fields!.
                            //Remove(fieldInDB);
                            Where(f=>f.UID==fieldInDB.UID)
                            .Select(f=>f)
                            /*
                            .ForEachAsync((fieldInput)=>{
                                System.Console.WriteLine(fieldInput.UID);
                            }).GetAwaiter();
                            */
                            .ExecuteDeleteAsync().GetAwaiter();
                            temp_dbEntity_internal.SaveChanges();
                        }
                    });
            await temp_dbEntity.SaveChangesAsync();
            return ;        
        }
        
        public async Task deleteStations(IEnumerable<Checksheet_Station> delStations){
            if (!(delStations.Count()>0)){ // no action if no delStations;
                return ;
            }
            delStations.AsParallel()
                    .ForAll(station=>{
                        //dbEntity.RemoveRange(station.fields!); //correctionPending see if fields are required
                        var temp_dbEntity = spawnNewContext();
                        temp_dbEntity.Checksheet_Stations!
                        .Where(s=>s==station)
                        .ExecuteDelete();
                        temp_dbEntity.SaveChangesAsync().GetAwaiter();
                        //Remove(station);
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