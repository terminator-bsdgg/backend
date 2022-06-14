USE [Terminator]

CREATE TABLE [dbo].[calendar] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY,
    roomid int FOREIGN KEY REFERENCES [dbo].[rooms](id),
    title VARCHAR(MAX) NOT NULL,
    startTime bigint NOT NULL,
    endTime bigint NOT NULL,
    showName tinyint NOT NULL DEFAULT 1,
    organisator VARCHAR(255) NOT NULL,
    organisatorId VARCHAR(255) NOT NULL,
    accepted tinyint NOT NULL DEFAULT 0,
    declinedReason VARCHAR(MAX) NOT NULL DEFAULT '',
    editorId VARCHAR(255) NOT NULL DEFAULT '',
);