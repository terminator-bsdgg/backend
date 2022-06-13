USE [Terminator]

CREATE TABLE [dbo].[calendar] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    roomid int FOREIGN KEY REFERENCES [dbo].[rooms](id),
    title text NOT NULL,
    startTime bigint NOT NULL,
    endTime bigint NOT NULL,
    organisator VARCHAR(255) NOT NULL
);