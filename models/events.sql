USE [Terminator]

CREATE TABLE [dbo].[events] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    type varchar(255) NOT NULL,
    message text NOT NULL,
    timestamp bigint NOT NULL
);