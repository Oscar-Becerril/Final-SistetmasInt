//test

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./users.db');

//Retrieving A Single Row

db.all("SELECT id, desc FROM emocion", (error, rows) => {
    if(error) throw error;
    rows.forEach((row) => {
        console.log(row.id+ " " + row.desc);
    })
});

db.all("SELECT id, correo, contrasena FROM user", (error, rows) => {
    if(error) throw error;
    rows.forEach((row) => {
        console.log(row.id+ " " + row.correo+ " " + row.contrasena);
    })
});


db.all("SELECT e.desc AS emocion, f.desc, date(f.datetime) AS date, time(f.datetime) AS time, f.userId, f.id FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id", (error, rows) => {
    if(error) throw error;
    
    rows.forEach((row) => {
        console.log(row.id + " " + row.emocion+ " " + row.date+ " " + row.time+ " " + row.desc+" " + row.userId);
    })
    
});


db.all("SELECT e.desc AS title, date(f.datetime) || ' ' || time(f.datetime) || ' UTC' AS date, '/emote/' || f.id AS url, f.desc AS descri FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id WHERE f.datetime BETWEEN julianday('2021-05-01T05:00:00.000Z') AND julianday('2021-06-01T04:59:59.000Z') AND f.userId = 2", (error, rows) => {
    if(error) throw error;
    console.log('Caledar test');
    rows.forEach((row) => {
        console.log(row.url + " " + row.title+ " " + row.date+ " " + row.descri);
    })
    console.log('Caledar test');
});


db.all("SELECT e.desc AS emocion, count(*) as count FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id GROUP BY e.id", (error, rows) => {
    if(error) throw error;
    rows.forEach((row) => {
        console.log(row.emocion + " " + row.count);
    })
});

db.close();