USE [Terminator] -- Select Terminator database

CREATE TABLE [dbo].[calendar] (
    id int NOT NULL IDENTITY(1,1) PRIMARY KEY, -- id for identification
    roomid int FOREIGN KEY REFERENCES [dbo].[rooms](id), -- id of room where event should be
    title VARCHAR(MAX) NOT NULL, -- title of event
    startTime bigint NOT NULL, -- start time of event in millis
    endTime bigint NOT NULL, -- end time of event in millis
    showName tinyint NOT NULL DEFAULT 1, -- should the name be shown in calendar
    organisator VARCHAR(255) NOT NULL, -- name of user who created event
    organisatorId VARCHAR(255) NOT NULL, -- id of user who created event
    accepted tinyint NOT NULL DEFAULT 0, -- got the event accepted by a moderator
    declinedReason VARCHAR(MAX) NOT NULL DEFAULT '', -- if declined then here the reason would be stored
    editorId VARCHAR(255) NOT NULL DEFAULT '', -- id of user who approved / declined request
); -- Create table dbo.calendar
