async function getExternalSourceFields(){
    return [
        {
            sourceName:"PARI Source",
            fields:[
                {fieldName:"Table 1: Field: ABC"},
                {fieldName:"Table 1: Field: DEF"},
                {fieldName:"Table 2: Field: ABC"},
                {fieldName:"Table 1: Field: XYZ"},
            ]
        },
        {
            sourceName:"GUDEL Source",
            fields:[
                {fieldName:"Traceability: Field: ConRod"},
                {fieldName:"Traceability: Field: Cylinder"},
                {fieldName:"Torque Gun: Field: Gun-Station1"},
            ]
        },
    ]
}