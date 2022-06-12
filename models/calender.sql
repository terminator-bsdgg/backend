USE [Terminator]

CREATE TABLE [dbo].[calender] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    roomid int FOREIGN KEY REFERENCES [dbo].[rooms](id),
	descriptionText text NOT NULL, 
    descriptionShown tinyint NOT NULL DEFAULT 0,
    startTime bigint NOT NULL,
    endTime bigint NOT NULL
);