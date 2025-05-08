-- DROP TABLE IF EXISTS Manga, Users, Genres, MangaLists, ListEntry, InList;

CREATE TABLE IF NOT EXISTS Users (
    Id Varchar(32),
    Username VARCHAR(20) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,

    PRIMARY KEY (Id)
);

CREATE TABLE IF NOT EXISTS Manga (
    Id VARCHAR(32),
    TitleEN TEXT,
    TitleJP TEXT NOT NULL,
    AuthorEN TEXT,
    AuthorJP TEXT,
    Year SMALLINT,
    Owner VARCHAR(32) NOT NULL,
    Chapters INT,
    Volumes INT,
    PublicationStatus TEXT NOT NULL,
    IsPublic BOOLEAN NOT NULL,

    PRIMARY KEY (Id),
    FOREIGN KEY (Owner) REFERENCES Users (Id)
);

CREATE TABLE IF NOT EXISTS Genres (
    Id INT AUTO_INCREMENT,
    Genre TEXT NOT NULL,
    MangaId VARCHAR(32) NOT NULL,

    PRIMARY KEY (Id),
    FOREIGN KEY (MangaId) REFERENCES Manga (Id)
);

CREATE TABLE IF NOT EXISTS MangaLists (
    Id VARCHAR(32),
    Name TEXT UNIQUE NOT NULL,
    Owner Varchar(32) NOT NULL,
    DateCreated Datetime DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (Id),
    FOREIGN KEY (Owner) REFERENCES Users (Id)
);

CREATE TABLE IF NOT EXISTS ListEntry (
    Id VARCHAR(32),
    IsManga VARCHAR(32) NOT NULL,
    Owner Varchar(32) NOT NULL,
    ChaptersRead INT,
    VolumesRead INT,
    ReadStatus TEXT NOT NULL,
    Score SMALLINT,
    Notes TEXT,
    DateCreated Datetime DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (Id),
    FOREIGN KEY (IsManga) REFERENCES Manga (Id),
    FOREIGN KEY (Owner) REFERENCES Users (Id)
);

CREATE TABLE IF NOT EXISTS InList (
    Id INT AUTO_INCREMENT,
    ListEntry VARCHAR(32) NOT NULL,
    EntryIn VARCHAR(32) NOT NULL,

    PRIMARY KEY (Id),
    FOREIGN KEY (ListEntry) REFERENCES ListEntry (Id),
    FOREIGN KEY (EntryIn) REFERENCES MangaLists (Id)
);

DELIMITER / /
CREATE TRIGGER InListInsert
AFTER INSERT ON InList
FOR EACH ROW
BEGIN
DECLARE EntryOwner VARCHAR (32) ;
DECLARE ListOwner VARCHAR (32) ;

SELECT Owner INTO EntryOwner
FROM ListEntry
WHERE Id = NEW.ListEntry ;

SELECT Owner INTO ListOwner
FROM MangaLists
WHERE Id = NEW.EntryIn ;

IF EntryOwner < > ListOwner THEN
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'ListEntry and MangaList must have the same owner.' ;
END IF ;
END / /
DELIMITER ;
