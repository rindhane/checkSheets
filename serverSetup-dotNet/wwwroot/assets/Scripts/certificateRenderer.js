const reportSelector = document.getElementById("reportSelector");
reportSelector.addEventListener('input',()=>renderCertificate());
const MasterData={
    overviewBlock:{
        engineStatus:"Ok",
        detailBlock:[
            {propertyName:"Customer Name :",propertyValue:"Customer add/code"},
            {propertyName:"SO No/ Rev SO :",propertyValue:"Shop Order No"},
            {propertyName:"Testing/ Retesting Date :",propertyValue:"Cummins Org"},
            {propertyName:"Engine Sr No:",propertyValue:"ESN No."},
            {propertyName:"Engine Model",propertyValue:"Engine Ltrs"},
            {propertyName:"Engine FG Done By",propertyValue:"Operator ID"},
            {propertyName:"Start  Date:",propertyValue:"Engine Pulling Date:"},
            {propertyName:"Plant Org ID:", propertyValue:"Cummins Org",},
            {propertyName:"Date  & Time FG Done :", propertyValue:"Shipping details",},
        ]
    },
    engineSpec:{
        detailBlock:[
            {propertyName:"Gross Power KW ",propertyValue:"XXX"},
            {propertyName:"Rated Speed ",propertyValue:"XXX"},
            {propertyName:"FPEPS Code",propertyValue:"XXX"},
            {propertyName:"Valve Lash Code",propertyValue:"XXX"},
            {propertyName:"Inj Time Code",propertyValue:"XXX"},
            {propertyName:"Type Approval Cert.",propertyValue:"XXX"},
        ]
    },
    engineGenealogy:{
        detailBlock:[
            {propertyName:"Cylinder Block ",propertyValue:"12345672201100VKEPHC01"},
            {propertyName:"Cylinder Head",propertyValue:"XXX"},
            {propertyName:"Camshaft",propertyValue:"XXX"},
            {propertyName:"Con Rod",propertyValue:"XXX"},
            {propertyName:"Crankshaft",propertyValue:"XXX"},
            {propertyName:"Fuel Pump ",propertyValue:"XXX"},
            {propertyName:"Injector",propertyValue:"XXX"},
            {propertyName:"Wiring Harness",propertyValue:"XXX"},
            {propertyName:"ECM",propertyValue:"XXX"},
            {propertyName:"Gears",propertyValue:"XXX"},
            {propertyName:"Starter",propertyValue:"XXX"},
            {propertyName:"Other critical parts…",propertyValue:"XXX"}, 
        ]
    },
    inProcess:{
        detailBlock:[
            {propertyName:"Station Wise",propertyValue:"Ok"},
            {propertyName:"Final Engine Assy",propertyValue:"Not Ok"},
            {propertyName:"DLT",propertyValue:"Ok"},
            {propertyName:"Minipatch",propertyValue:"Ok"},
            {propertyName:"Kitting",propertyValue:"Ok"},
            {propertyName:"Pre PDI",propertyValue:"Ok"},
            {propertyName:"Rework",propertyValue:"Ok"},
            {propertyName:"PDI/Re-PDI",propertyValue:"Ok"},
            {propertyName:"Overall Result",propertyValue:"Ok"},
        ]
    },
    deviations:{
        detailBlock:[
            {propertyName:"Station Wise",propertyValue:"Ok",remarks:["2/Crank Damage"," Backlash  issue"]},
            {propertyName:"Final Engine Assy",propertyValue:"Ok",remarks:[]},
            {propertyName:"DLT",propertyValue:"Ok",remarks:["Hose Leak"]},
            {propertyName:"MiniPatch",propertyValue:"Ok",remarks:["Cu Reject"]},
            {propertyName:"Testing",propertyValue:"Ok",remarks:["CTCI Test Fail"]},
            {propertyName:"Painting",propertyValue:"Ok",remarks:[]},

        ]
    }
}


renderCertificate();
async function renderCertificate(){
    const certiElem= document.getElementById("certificateContainer");
    certiElem.innerHTML="";
    const certiWrapper= document.createElement("div");
    const certiContainer = document.createElement('div');
    certiWrapper.classList.add("fullWidthRow");
    certiContainer.classList.add("certificateSection");
    certiWrapper.appendChild(certiContainer);
    certiContainer.appendChild(createEngineOverView(MasterData.overviewBlock));
    certiContainer.appendChild(createEngineSpecView(MasterData.engineSpec));
    certiContainer.appendChild(createEngineGenealogy(MasterData.engineGenealogy));
    if(reportSelector.value=="internal"){
        certiContainer.appendChild(createInProcessVerification(MasterData.inProcess));
        certiContainer.appendChild(createDeviationBlock(MasterData.deviations));
    }
    
    //final cerftificate created is pushed into the html dom placeholder
    certiElem.appendChild(certiWrapper);
    return certiElem;
}

function createEngineOverView(overviewBlock){
    const elem = createSection();
    elem.appendChild(createSectionHeader(1,"Engine Overview",{StatusBlock:{status:overviewBlock.engineStatus}}));
    elem.appendChild(createDataBlock(overviewBlock.detailBlock, classList=["largeWidth"]));
    return elem;
}

function createEngineSpecView(engineSpec={}){
    const elem=createSection();
    elem.appendChild(createSectionHeader(2,"Engine Specification"),{});
    elem.appendChild(createDataBlock(engineSpec.detailBlock, 
                            classList=["smallWidth","column-flex", "startDivider"],
                            childClassList={
                                    classListPropertyName:["fullWidthParent"],
                                    classListPropertyValue:["fullWidthParent"],
                            })
                    );
    return elem;
}

function createEngineGenealogy(engineGenealogy={}){
    const elem=createSection();
    elem.appendChild(createSectionHeader(3,"Engine Genealogy (Serial Nos.)"),{});
    elem.appendChild(createDataBlock(engineGenealogy.detailBlock, 
                            classList=["smallWidth","column-flex", "startDivider"],
                            childClassList={
                                    classListPropertyName:["colouredName", "smallName", "fullWidthParent"],
                                    classListPropertyValue:["fullWidthParent"],
                            })
                    );
    return elem;

}

function createInProcessVerification(inProcess={}){
    const elem=createSection();
    elem.appendChild(createSectionHeader(4,"In Process Verification"),{});
    elem.appendChild(createDataBlock(inProcess.detailBlock, 
                            classList=["smallWidth","column-flex", "startDivider"],
                            childClassList={
                                    classListPropertyName:["colouredName", "smallName", "fullWidthParent"],
                                    classListPropertyValue:["fullWidthParent"],
                            })
                    );
    return elem;

}

function createDeviationBlock(deviations={}){
    const elem=createSection();
    elem.appendChild(createSectionHeader(5,"Deviations(Remark)"),{});
    elem.appendChild(createDataBlock(deviations.detailBlock, 
                            classList=["smallWidth","column-flex", "startDivider"],
                            childClassList={
                                    classListPropertyName:["colouredName", "smallName", "fullWidthParent"],
                                    classListPropertyValue:["fullWidthParent"],
                            })
                    );
    return elem;

}

function createSection(){
    const elem=document.createElement("div");
    elem.classList.add("sectionContainerBox");
    return elem;
}

function createSectionHeader(id,title,others={}){
    const elem=document.createElement("div");
    elem.classList.add("sectionHeader");
    elem.appendChild(createSectionTitle(id,title));
    if (others.StatusBlock!=null){
        elem.appendChild(createSectionStatus(engineStat=others.StatusBlock.status));
    }
    return elem;
}

function createSectionTitle(id,title){
    const htmlString =`
    <div class="sectionTitle">
        <span id="serialNumber">${id}</span>
        ${title}
    </div>
    `;
    return htmlToElement(htmlString);
}

function createSectionStatus(engineStat="Ok")
{
    const htmlString=`
    <div class="sectionStatus">
        Engine Status:&nbsp;<span id="EngineStatus">${engineStat}</span>
    </div>
    `;
    return htmlToElement(htmlString);
}

function createDataBlock(detailBlock=[], classList=[], childClassList={
                                                        classListPropertyName:[],
                                                        classListPropertyValue:[],
                                                        }){
    const elem = document.createElement("div");
    elem.classList.add("detailBlock");
    detailBlock.forEach(detailSet=>{
        const childElem = createDataBlockChild(detailSet, childClassList.classListPropertyName,
                                                            childClassList.classListPropertyValue);
        classList.forEach(class_=>{
            childElem.classList.add(class_);
        });
        elem.appendChild(childElem);
    })
    return elem;
}

function createDataBlockChild(detailSet, classListPropertyName=[], classListPropertyValue=[]){
    const htmlString=`
    <div class="fixedWidthDetailBox">
                                <div class="propertyName">
                                    ${detailSet.propertyName}
                                </div>
                                &nbsp;&nbsp;
                                <div class="propertyValue">
                                ${detailSet.propertyValue}
                                </div>
                            </div>
    `;
    const elem = htmlToElement(htmlString);
    classListPropertyName.forEach(class_=>{
        elem.children[0].classList.add(class_);
    });
    classListPropertyValue.forEach(class_=>{
        elem.children[1].classList.add(class_);
    });
    if(detailSet.remarks!=null){
        detailSet.remarks.forEach(statement=>{
            elem.appendChild(createRemarks(statement));
        });
    };
    return elem;
}

function createRemarks(remarkStatement){
    const htmlString=`
    <div class="remarkStatement dangerColourName smallName ">
        ${remarkStatement}
    </div>
    `
    return htmlToElement(htmlString);
}
