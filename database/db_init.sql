CREATE TABLE IF NOT EXISTS Users (
    Id Varchar(32),
    Username VARCHAR(20) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Salt CHAR(16) NOT NULL,

    PRIMARY KEY (Id)
);

CREATE TABLE IF NOT EXISTS Manga (
    Id VARCHAR(32),
    TitleEN TEXT NOT NULL,
    TitleJP TEXT,
    AuthorEN TEXT,
    AuthorJP TEXT,
    Year SMALLINT,
    Owner VARCHAR(32),
    Chapters INT,
    Volumes INT,
    PublicationStatus TEXT,
    IsPublic BOOLEAN,

    PRIMARY KEY (Id),
    FOREIGN KEY (Owner) REFERENCES Users (Id)
);

CREATE TABLE IF NOT EXISTS Genres (
    Id INT AUTO_INCREMENT,
    Genre TEXT,
    MangaId VARCHAR(32),

    PRIMARY KEY (Id),
    FOREIGN KEY (MangaId) REFERENCES Manga (Id)
);

CREATE TABLE IF NOT EXISTS MangaLists (
    Id VARCHAR(32),
    Name TEXT,
    Owner Varchar(32),

    PRIMARY KEY (Id)
);

CREATE TABLE IF NOT EXISTS ListEntry (
    Id VARCHAR(32),
    IsManga VARCHAR(32),
    ChaptersRead INT,
    VolumesRead INT,
    ReadStatus TEXT,
    Score SMALLINT,
    Notes TEXT,

    PRIMARY KEY (Id),
    FOREIGN KEY (InList) REFERENCES MangaLists (Id),
    FOREIGN KEY (IsManga) REFERENCES Manga (Id)
);

CREATE TABLE IF NOT EXISTS InList (
    Id INT AUTO_INCREMENT,
    ListEntry VARCHAR(32),
    InList VARCHAR(32),

    PRIMARY KEY (Id),
    FOREIGN KEY (ListEntry) REFERENCES ListEntry (Id),
    FOREIGN KEY (InList) REFERENCES MangaLists (Id)
);
