USE [Terminator] -- Select Terminator database

CREATE TABLE [dbo].[rooms] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY, -- id for identification
	name varchar(255) NOT NULL UNIQUE, -- name of room
	description VARCHAR(MAX) NOT NULL,  -- description of room
    buildingid int FOREIGN KEY REFERENCES [dbo].[buildings](id) -- id of building where room is
); -- Create table dbo.rooms
