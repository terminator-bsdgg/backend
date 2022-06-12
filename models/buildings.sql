USE [Terminator]

CREATE TABLE [dbo].[buildings] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
	name varchar(255) NOT NULL UNIQUE,
	description text NOT NULL
);