USE [Terminator] -- Select Terminator database

CREATE TABLE [dbo].[buildings] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY, -- id for identification
	name varchar(255) NOT NULL UNIQUE, -- name of the building
	description VARCHAR(MAX) NOT NULL -- description of the building
); -- Creates table dbo.buildings
