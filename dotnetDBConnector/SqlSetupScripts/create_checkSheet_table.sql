-- sql file to create the database
-- command: Sqlcmd –S . –i .\create_pdf_table.sql
DECLARE @qdas_db VARCHAR(100);
declare @query nvarchar(max); 

SET @qdas_db='QDAS_VALUE_DATABASE'; --replace with the data database of qdas

--help https://stackoverflow.com/questions/2838490/a-table-name-as-a-variable
set @query= 'CREATE TABLE '+ QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_RECORD(
  id              INT           NOT NULL    IDENTITY    PRIMARY KEY ,
  sheetName      VARCHAR(max)  NOT NULL,
  model     VARCHAR(max),
  status    VARCHAR(10),
)';
EXEC sp_executesql @query;
GO
set @query= 'CREATE TABLE '+ QUOTENAME(@qdas_db)+'.dbo.CHECKSHEET_STATIONS(
  id              INT           NOT NULL    IDENTITY    PRIMARY KEY ,
  sectorName      VARCHAR(max)  NOT NULL,
  formID          INT           NOT NULL,
  sequenceOrder   INT           NOT NULL,
  UID             UniqueIdentifier NOT NULL,
)'; --Refer: [UniqueIdentifier] https://stackoverflow.com/questions/11974939/adding-a-uniqueidentifier-column-and-adding-the-default-to-generate-new-guid
    -- https://www.sqlshack.com/understanding-the-guid-data-type-in-sql-server/
EXEC sp_executesql @query;
GO