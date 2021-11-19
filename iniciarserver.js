const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database("./users.db", 
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
    (err) => { 
        // do your thing 
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT, 
            apellido TEXT, 
            correo TEXT, 
            contrasena TEXT,
            fechanac TEXT
            )`,
        (err) => {
            if (err) {
                // Table already created
                console.log('Table was already created.')
            }
        });  
        db.run(`CREATE TABLE emocion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            desc TEXT
            )`,
        (err) => {
            if (err) {
                // Table already created
                console.log('Error.')
            }
            else{
                var insert = "INSERT INTO emocion (desc) VALUES ('?')";
                db.run(insert, ["Feliz"]);
                db.run(insert, ["Triste"]);
                db.run(insert, ["Ansios@"]);
                db.run(insert, ["Enojad@"]);
                db.run(insert, ["Nostalgic@"]);
                db.run(insert, ["Deprimid@"]);
                db.run(insert, ["Emocionad@"]);
                db.run(insert, ["Irritable"]);
                db.run(insert, ["Sensible"]);
                db.run(insert, ["Amistoso"]);
                db.run(insert, ["Feliz"]);
            }
        });  
        
        db.run(`CREATE TABLE seg_emocion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER, 
            emoteId INTEGER, 
            desc TEXT,
            datetime REAL,
            FOREIGN KEY(userId) REFERENCES user(id),
            FOREIGN KEY(emoteId) REFERENCES emocion(id)
            )`,
        (err) => {
            if (err) {
                // Table already created
                console.log('Table was already created.')
            }
        });  
    });