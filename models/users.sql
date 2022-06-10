USE [Terminator]

CREATE TABLE [dbo].[users] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
	username varchar(255) NOT NULL UNIQUE,
	password varchar(255) NOT NULL, 
	lastlogin bigint NOT NULL
);