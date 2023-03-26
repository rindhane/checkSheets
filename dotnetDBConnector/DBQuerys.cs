using DbConnectors.Models;
using System.Linq;
using System.Threading.Tasks;

namespace DbConnectors {
    public class Dbquery{
        DbEFContext dbEntity ;
        public Dbquery( dbOptions opt){
            dbEntity = new DbEFContext(opt);
        }

        public async Task<int> createNewSheet(Checksheet_Record newSheet, bool existing, int id = -1){
            if (existing) {
                //var oldCheckSheet = dbEntity.Checksheet_Record!.Where(record=>record.id==id).First();
                var stations = dbEntity.Checksheet_Stations!
                               .Where(station=>station.formID==id)
                               .Select(station=> new Checksheet_Station(){
                                sectorName= station.sectorName,
                                formID= newSheet.id, 
                                sequenceOrder=station.sequenceOrder,
                               });
                    dbEntity.Checksheet_Stations!.AddRange(stations);
            }
            await dbEntity.AddAsync<Checksheet_Record>(newSheet);
            return await dbEntity.SaveChangesAsync();
        }
        public async Task<int> changeStatusOfCheckSheet(int id, sheetStatus state) {
            var sheet = dbEntity.Checksheet_Record!.Single(sheet=>sheet.id==id);
            sheet.status=state.ToString();
            await Task.Delay(0);
            return dbEntity.SaveChanges();
        }

    }

}