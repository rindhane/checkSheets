-- sql file to create the database
-- command: Sqlcmd –S . –i .\create_pdf_table.sql
DECLARE @qdas_db VARCHAR(100);
DECLARE @query1 nvarchar(max);
DECLARE @query2 nvarchar(max);
DECLARE @query3 nvarchar(max);
DECLARE @query4 nvarchar(max); 

SET @qdas_db='QDAS_VALUE_DATABASE'; --replace with the data database of qdas

--help https://stackoverflow.com/questions/2838490/a-table-name-as-a-variable
set @query1= 'CREATE TABLE '+ QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_RECORD(
  id              INT           NOT NULL    IDENTITY    PRIMARY KEY ,
  sheetName      VARCHAR(max) ,
  model     VARCHAR(max),
  status    VARCHAR(10),
)';
EXEC sp_executesql @query1;
--GO
set @query2= 'CREATE TABLE '+ QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_STATIONS(
  sectorName      VARCHAR(max)  ,
  formFK          INT           NOT NULL,
  sequenceOrder   INT           NOT NULL,
  UID             UniqueIdentifier NOT NULL PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
  CONSTRAINT [FK_CHECKSHEET_STATIONS_CHECKSHEET_RECORD_formFK] FOREIGN KEY ([formFK]) REFERENCES [CHECKSHEET_RECORD] ([id]) ON DELETE CASCADE
)'; --Refer: [UniqueIdentifier] https://stackoverflow.com/questions/11974939/adding-a-uniqueidentifier-column-and-adding-the-default-to-generate-new-guid
    -- https://www.sqlshack.com/understanding-the-guid-data-type-in-sql-server/
EXEC sp_executesql @query2;
--GO
set @query3= 'CREATE TABLE '+ QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_FIELDS(
  UID          UniqueIdentifier  NOT NULL    PRIMARY KEY DEFAULT NEWID() ,
  stationID      UniqueIdentifier  NOT NULL,
  sequenceOrder   INT           NOT NULL,
  descText    VARCHAR(max)      ,
  typ         VARCHAR(200) ,
  fieldType   VARCHAR(max),
  inspectionClass int,
  specDef VARCHAR(max) , 
  meanValue float(4), 
  maxCheck float(4),
  minCheck float(4),
  multipleOptions VARCHAR(max),
  addIncrement float(4),
  addDecrement float(4),
  dataSource VARCHAR(max),
  sourceField VARCHAR(max),
  imageData VARCHAR(max),
  CONSTRAINT [FK_CHECKSHEET_FIELDS_CHECKSHEET_STATIONS_stationID] FOREIGN KEY ([stationID]) REFERENCES [CHECKSHEET_STATIONS] ([UID]) ON DELETE CASCADE
)'; 
EXEC sp_executesql @query3;
GO

set @query4= 'CREATE TABLE' + QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_VALUES(
  UID INT NOT NULL PRIMARY KEY IDENTITY(1,1),
  fieldID uniqueidentifier NOT NULL,
  fieldValue nvarchar(max) NULL,
  dateTime datetime2 NOT NULL,
  formSN nvarchar(max) NULL,
  operatorID nvarchar(max) NULL,
  stationID nvarchar(max) NULL,
  CONSTRAINT [FK_CHECKSHEET_VALUES_CHECKSHEET_FIELDS_fieldID] FOREIGN KEY ([fieldID]) REFERENCES [CHECKSHEET_FIELDS] ([UID])  
)'
EXEC sp_executesql @query4;
GO
/*
CREATE INDEX [IX_CHECKSHEET_FIELDS_stationID] ON [QDAS_VALUE_DATABASE].[dbo].[CHECKSHEET_FIELDS]  ([stationID]);
--GO


CREATE INDEX [IX_CHECKSHEET_STATIONS_formFK] ON [QDAS_VALUE_DATABASE].[dbo].[CHECKSHEET_STATIONS] ([formFK]);
GO
*/
/*
Query from EFCore 
CREATE TABLE [CHECKSHEET_RECORD] (
    [id] int NOT NULL IDENTITY,
    [sheetName] nvarchar(max) NULL,
    [model] nvarchar(max) NULL,
    [status] nvarchar(max) NULL,
    CONSTRAINT [PK_CHECKSHEET_RECORD] PRIMARY KEY ([id])
);
GO


CREATE TABLE [CHECKSHEET_STATIONS] (
    [UID] uniqueidentifier NOT NULL,
    [sectorName] nvarchar(max) NULL,
    [formFK] int NOT NULL,
    [sequenceOrder] int NOT NULL,
    CONSTRAINT [PK_CHECKSHEET_STATIONS] PRIMARY KEY ([UID]),
    CONSTRAINT [FK_CHECKSHEET_STATIONS_CHECKSHEET_RECORD_formFK] FOREIGN KEY ([formFK]) REFERENCES [CHECKSHEET_RECORD] ([id]) ON DELETE CASCADE
);
GO


CREATE TABLE [CHECKSHEET_FIELDS] (
    [UID] uniqueidentifier NOT NULL,
    [stationID] uniqueidentifier NOT NULL,
    [sequenceOrder] int NOT NULL,
    [descText] nvarchar(max) NULL,
    [typ] nvarchar(max) NULL,
    [fieldType] nvarchar(max) NULL,
    [inspectionClass] int NOT NULL,
    [specDef] nvarchar(max) NULL,
    [meanValue] real NOT NULL,
    [maxCheck] real NOT NULL,
    [minCheck] real NOT NULL,
    [multipleOptions] nvarchar(max) NULL,
    [addIncrement] real NOT NULL,
    [addDecrement] real NOT NULL,
    [dataSource] nvarchar(max) NULL,
    [sourceField] nvarchar(max) NULL,
    [imageData] nvarchar(max) NULL,
    CONSTRAINT [PK_CHECKSHEET_FIELDS] PRIMARY KEY ([UID]),
    CONSTRAINT [FK_CHECKSHEET_FIELDS_CHECKSHEET_STATIONS_stationID] FOREIGN KEY ([stationID]) REFERENCES [CHECKSHEET_STATIONS] ([UID]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_CHECKSHEET_FIELDS_stationID] ON [CHECKSHEET_FIELDS] ([stationID]);
GO


CREATE INDEX [IX_CHECKSHEET_STATIONS_formFK] ON [CHECKSHEET_STATIONS] ([formFK]);
GO

*/