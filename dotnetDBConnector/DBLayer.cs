using DbConnectors.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;// to use List type
using Microsoft.EntityFrameworkCore;

namespace DbConnectors {
    public class DbLayer{
        DbEFContext dbEntity ;
        public DbLayer( dbOptions opt){
            dbEntity = new DbEFContext(opt);
        }

        public async Task<int> createNewSheet(Checksheet_Record newSheet, bool existing, int id = -1){
            var entry = dbEntity.Checksheet_Record!.Add(newSheet);
            dbEntity.SaveChanges(); // to receive newSheet.id
            if (existing) {
                //var oldCheckSheet = dbEntity.Checksheet_Record!.Where(record=>record.id==id).First();
                var stations = dbEntity.Checksheet_Stations!
                               .Where(station=>station.formID! == new Checksheet_Record(){id=id})
                               .Select(station=> new Checksheet_Station(){
                                sectorName= station.sectorName,
                                formID= newSheet, 
                                sequenceOrder=station.sequenceOrder,
                                UID= station.UID,
                               });
                    dbEntity.Checksheet_Stations!.AddRange(stations);
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
        public async Task<int> addNewSection( ) {
            dbEntity.Checksheet_Stations!.Add(new Checksheet_Station{
                sectorName= "testName",
                formID = new Checksheet_Record(){id=1},
                sequenceOrder = 0,
                UID = new System.Guid("7F5A748B-7E04-428A-B0B5-75DA58C010F2"),
            });
            await Task.Delay(0);
            return dbEntity.SaveChanges();
        }

        public async Task<int> UpdateSection(List<Checksheet_Station> sheetStations , int formID ) {
            
            var stationListInDB = dbEntity.Checksheet_Stations!.Include(station=>station.fields)
                                        .Where(station=>station == new Checksheet_Station(){
                                                                    formID = new Checksheet_Record(){id=formID}}
                                        );
            stationListInDB.Except(sheetStations) //action on deleted Sstations
                            .AsParallel()
                            .ForAll(station=>{
                                station.fields!
                                       .AsParallel();
                                dbEntity.Remove(station);
                            });
            var newStations = sheetStations.Except(stationListInDB);

            await Task.Delay(0);
            return dbEntity.SaveChanges();
        }
    }
}