using System.ComponentModel.DataAnnotations.Schema; // to access database generated option 
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // to access Key Attribute

namespace DbConnectors.Models {
//these classes are for db storage objects
public class Checksheet_Record : System.IEquatable<Checksheet_Record>{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int id {get; set;}
    public string? sheetName {get; set;}
    public string? model {get; set;}
    public string? status {get;set;}
    //public ICollection<Checksheet_Station>? stations {get; set;}
    public List<Checksheet_Station>? stations {get; set;}
    
    
    //equality functions
    public bool Equals(Checksheet_Record? other )
    {
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1.equals?view=net-6.0
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1?view=net-6.0
        // See the full list of guidelines at
        //   http://go.microsoft.com/fwlink/?LinkID=85237
        // and also the guidance for operator== at
        //   http://go.microsoft.com/fwlink/?LinkId=85238
        //
        if (other! == null!) // to handle null case
        {
            return false;
        }
        /*
        if (sheet1 == null || sheet2 == null) {
            return false;
        } */
        if (other.id == id)
        {
            return true;
        }
        
        // TODO: write your implementation of Equals() here
        //throw new System.NotImplementedException();
        return false;
    }
    public override bool Equals(System.Object? obj)
    {
        if (obj == null)
            return false;

        Checksheet_Record? checkObj = obj as Checksheet_Record;
        if (checkObj! == null!)
            return false;
        else
            return Equals(checkObj);
    }
    // override object.GetHashCode
    public override int GetHashCode()
    {
        // TODO: write your implementation of GetHashCode() here
        //throw new System.NotImplementedException();
        return id.GetHashCode();
    }
    public static bool operator == (Checksheet_Record obj1, Checksheet_Record obj2)
   {
      if (((object)obj1) == null || ((object)obj2) == null)
         return System.Object.Equals(obj1, obj2);

      return obj1.Equals(obj2);
   }
   public static bool operator != (Checksheet_Record obj1, Checksheet_Record obj2)
   {
      if (((object)obj1) == null || ((object)obj2) == null)
         return ! System.Object.Equals(obj1, obj2);

      return ! (obj1.Equals(obj2));
   }
}


public enum sheetStatus{
    active,
    inactive
}

public class Checksheet_Station : System.IEquatable<Checksheet_Station>{
    
    //public int id {get; set;}
    public string? sectorName {get; set;}
    public Checksheet_Record? form {get; set;}
    [ForeignKey("form")]
    public int formFK {get; set;}
    public int sequenceOrder {get;set;}
    
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public System.Guid UID {get;set;}
    
    public List<Checksheet_Field>? fields {get;set;}

    //equality functions
    public bool Equals(Checksheet_Station? other )
    {
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1.equals?view=net-6.0
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1?view=net-6.0
        // See the full list of guidelines at
        //   http://go.microsoft.com/fwlink/?LinkID=85237
        // and also the guidance for operator== at
        //   http://go.microsoft.com/fwlink/?LinkId=85238
        //
        if (other! == null!) // to handle null case
        {
            return false;
        }
        /*
        if (sheet1 == null || sheet2 == null) {
            return false;
        } */
        /*
        if (other.id == id)
        {
            return true;
        }
        */
        if (UID.Equals(other.UID)){
            return true;
        }
        
        // TODO: write your implementation of Equals() here
        //throw new System.NotImplementedException();
        return false;
    }
    public override bool Equals(System.Object? obj)
    {
        if (obj == null)
            return false;

        Checksheet_Station? checkObj = obj as Checksheet_Station;
        if (checkObj! == null!)
            return false;
        else
            return Equals(checkObj);
    }
    // override object.GetHashCode
    public override int GetHashCode()
    {
        // TODO: write your implementation of GetHashCode() here
        //throw new System.NotImplementedException();
        return UID.GetHashCode();
    }
    public static bool operator == (Checksheet_Station obj1, Checksheet_Station obj2)
   {
      if (((object)obj1) == null || ((object)obj2) == null)
         return System.Object.Equals(obj1, obj2);

      return obj1.Equals(obj2);
   }
    public static bool operator != (Checksheet_Station obj1, Checksheet_Station obj2) {
     if (((object)obj1) == null || ((object)obj2) == null)
         return ! System.Object.Equals(obj1, obj2);

      return ! (obj1.Equals(obj2));
   }

}


public class Checksheet_Field : System.IEquatable<Checksheet_Field> {
        
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public System.Guid UID {get;set;}
    public Checksheet_Station? station {get; set;}

    [ForeignKey("station")]
    public System.Guid stationID{get;set;}
    public int sequenceOrder {get;set;}
    public string? descText {get; set;}
    public string? typ {get;set;}
    public string? fieldType {get;set;}
    
    public inspectionClass inspectionClass{get;set;}
    public string? specDef{get;set;}
    public float meanValue {get;set;}
    public float maxCheck {get;set;} 
    public float minCheck {get;set;}
    
    public string? multipleOptions {get; set;}
    public float addIncrement {get;set;}
    public float addDecrement {get;set;}
    public string? dataSource {get;set;}
    public string? sourceField {get;set;}
    public string? imageData {get;set;}
    //public string? valueData {get;set;}

        //equality functions
    public bool Equals(Checksheet_Field ? other )
    {
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1.equals?view=net-6.0
        //ref https://learn.microsoft.com/en-us/dotnet/api/system.iequatable-1?view=net-6.0
        // See the full list of guidelines at
        //   http://go.microsoft.com/fwlink/?LinkID=85237
        // and also the guidance for operator== at
        //   http://go.microsoft.com/fwlink/?LinkId=85238
        //
        if (other! == null!) // to handle null case
        {
            return false;
        }
        /*
        if (sheet1 == null || sheet2 == null) {
            return false;
        } */

        if (UID.Equals(other.UID)){
            return true;
        }
        
        // TODO: write your implementation of Equals() here
        //throw new System.NotImplementedException();
        return false;
    }
    public override bool Equals(System.Object? obj)
    {
        if (obj == null)
            return false;

        Checksheet_Station? checkObj = obj as Checksheet_Station;
        if (checkObj! == null!)
            return false;
        else
            return Equals(checkObj);
    }
    // override object.GetHashCode
    public override int GetHashCode()
    {
        // TODO: write your implementation of GetHashCode() here
        //throw new System.NotImplementedException();
        return UID.GetHashCode();
    }
    public static bool operator == (Checksheet_Field  obj1, Checksheet_Field  obj2)
   {
      if (((object)obj1) == null || ((object)obj2) == null)
         return System.Object.Equals(obj1, obj2);

      return obj1.Equals(obj2);
   }
   public static bool operator != (Checksheet_Field  obj1, Checksheet_Field  obj2) {
     if (((object)obj1) == null || ((object)obj2) == null)
         return ! System.Object.Equals(obj1, obj2);

      return ! (obj1.Equals(obj2));
   }
        
}

public class Checksheet_Values  {
    
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UID {get;set;}
    public Checksheet_Field? field {get; set;}

    [ForeignKey("field")]
    public System.Guid fieldID{get;set;} 

    public string? fieldValue {get;set;}

    public System.DateTime dateTime {get;set;}

    public string? formSN {get;set;}

    public string? operatorID {get;set;}

    public string? stationID {get;set;}
}


}