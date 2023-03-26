using System.ComponentModel.DataAnnotations.Schema;

namespace DbConnectors.Models {

public class Checksheet_Record{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int id {get; set;}
    public string? sheetName {get; set;}
    public string? model {get; set;}
    public string? status {get;set;}
} 

public enum sheetStatus{
    active,
    inactive
}

public class Checksheet_Station{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int id {get; set;}
    public string? sectorName {get; set;}
    public int formID {get; set;}
    public int sequenceOrder {get;set;}
}

}