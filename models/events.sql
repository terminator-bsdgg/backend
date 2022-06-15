USE [Terminator] -- Select Terminator database

CREATE TABLE [dbo].[events] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY, -- id for identification
    type varchar(255) NOT NULL, -- type of the event
    message VARCHAR(MAX) NOT NULL, -- messasge of the event
    timestamp bigint NOT NULL -- timestamp in millis
); -- Create table dbo.events
