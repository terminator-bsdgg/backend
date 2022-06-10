USE [Terminator]

CREATE TABLE [dbo].[tokens] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    userid int FOREIGN KEY REFERENCES [dbo].[users](id),
    token varchar(255) NOT NULL UNIQUE,
	validuntil bigint NOT NULL
);