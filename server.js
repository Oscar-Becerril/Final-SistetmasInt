// Server

//Express es quien administrara nuestras rutas
var express = require('express');
//La libreria sesion nos servira para hacer logins permanentes
var session = require('express-session');
//Libreria de base de datos
const sqlite3 = require('sqlite3').verbose();
//EJS - Procesador de html
ejs = require('ejs');
//La libreria path se encarga de direcciones de archivos
var path = require('path');
// Aplicacion de express
var app = express();
// Nuestro sistema de vistas es ejs.
app.set('view engine', 'ejs');

//Base de datps
const db = new sqlite3.Database('./users.db');

// Preparamos el sistema de sesion. Esto es para mantener a nuestro sujeto loggeado.
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

//Funcion reutilizable para siempre asegurarnos que estamos loggeados.
function verLogged(req, res, next)
{
    if(req.session.loggedin){
        next();
      }else{
        res.redirect('/');
      }
};

function verLoggedJson(req, res, next)
{
    if(req.session.loggedin){
        next();
      }else{
        res.json();
      }
};


//Funciones exteriores
app.get('/', function(req, res){
    if(req.session.loggedin)
    {
        res.redirect('/follow');
    }
    else
    {
        res.type('text/html');
        res.render('normal', {
            tituloPagina: 'FeelFollow'
        }, function(err, html){
            if(err) throw err;
            res.send(html);
        });
    }
});

app.get('/login', function(req, res){
    var lEerror='';
    if(req.query.error)
    {
        lEerror=req.query.error;
    }

    res.type('text/html');
    res.render('login', {
        tituloPagina: 'FeelFollow',
        error: lEerror
    }, function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

app.get('/signin', function(req, res){
    var lEerror='';
    if(req.query.error)
    {
        lEerror=req.query.error;
    }

    res.type('text/html');
    res.render('signup', {
        tituloPagina: 'FeelFollow',
        error: lEerror
    }, function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

app.post('/sign', function(req, res) {
    var usname = req.body.firstName;
    var uslname = req.body.lastName;
	var email = req.body.email;
	var password = req.body.pass;
    var fechanac = req.body.fechanac;
    var insert = "SELECT id FROM user WHERE correo=?";
    var unique = false;
    var valid = false;

    console.log('Log usname=' + usname);

    db.get(insert,[email], (error, row) => {
        if(error) throw error;
        if(row !== undefined)
        {
            console.log("Existe");
            unique = false;
            console.log(row.id);
        }
        else{
            console.log("No existe");
            unique = true;
        }

        console.log("Siguiente test, unique fue " + unique);
        if(unique==true)
        {
            console.log("Creando");
            var insert = 'INSERT INTO user (nombre, apellido, correo, contrasena, fechanac) VALUES (?,?,?,?,?)';
            db.run(insert,[usname,uslname,email,password,fechanac],
            (err) => {
                if (err) {
                    console.log("No añadido");
                    throw err;
                    valid = false;
                }
                else{
                    valid = true;
                    console.log("Añadido");
                }

                if (valid&&unique) {
                    res.redirect('/login?error=accSuccess');
                }
                else {
                    res.redirect('/signin?error=errorCreate');
                }
                
            });  
        }
        else {
            res.redirect('/signin?error=errorCreate');
        }
        
    });
});

app.post('/auth', function(req, res) {
	var username = req.body.useremail;
	var password = req.body.userpass;
    var insert = "SELECT id, correo, contrasena FROM user WHERE correo = ? AND contrasena = ?";
    var logged = false;

    db.get(insert,[username, password], (error, row) => {
        if(row!==undefined)
        {
            logged = true;
            req.session.paginaId = row.id;
            console.log(row.id + " " + row.correo + " " + row.contrasena);
        }
        else{
            logged = false;
            console.log("No se encontro");

        }

        if (logged) {
            req.session.loggedin = true;
            res.redirect('/follow');
        }
        else {
            res.redirect("/login?error=errorLog")
        }
        
    });
});


app.get('/emoteSum/', verLoggedJson, function(req, res) {
    var insert = "SELECT e.desc AS emocion, count(*) as count FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id WHERE f.userId = ? GROUP BY e.id";
    var params = [req.session.paginaId]
    db.all(insert, params, (err, rows) => {
        if(err) throw err;

        var contArray=[["Conteo", "Emocion"]];

        rows.forEach((row) => {
            contArray.push([row.emocion, row.count])
        })
        res.json(contArray)
      });
});

// Hace un chequeo para estas rutas sobre el loggeo.
app.use(verLogged);

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/grafico', function(req, res){
    res.type('text/html');
    res.render('graph', {
        tituloPagina: 'FeelFollow'
    }, function(err, html){
        if(err) throw err;
        res.send(html);
    });
});

app.get('/calendario', function(req, res) {

    var currDate=new Date(Date.now());
    var backoff=0;

    if(req.query.backoff)
    {
        backoff = new Number(req.query.backoff);
    }
    
    currDate.setMonth(currDate.getMonth() - (1*backoff));

    var dateFrom=new Date(currDate.getFullYear(), currDate.getMonth(), 1);
    var dateTo=new Date(currDate.getFullYear(), currDate.getMonth(), 31,23,59,59);
    var prevno = backoff+1;
    var nextno = backoff-1;

    var insert = "SELECT e.desc AS title, date(f.datetime) || ' ' || time(f.datetime) || ' UTC' AS date, '/emote/' || f.id AS url, f.desc AS descri FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id WHERE f.datetime BETWEEN julianday(?) AND julianday(?) AND f.userId = ? ORDER BY f.datetime ASC";
    var params = [dateFrom.toISOString(), dateTo.toISOString(), req.session.paginaId];
    db.all(insert, params, (err, rows) => {
        if(err) throw err;
        res.type('text/html');
        res.render('calendar', {
            tituloPagina: 'FeelFollow',
            month: currDate.toLocaleString('default', {month: "long"}),
            year: currDate.getFullYear(),
            prevpage: prevno,
            nextpage: nextno,
            emotes: rows
        }, function(err, html){
            if(err) throw err;
            res.send(html);
        });
      });
});

app.get('/follow', function(req, res){
    var mError='';
    if(req.query.error)
    {
        mError=req.query.error;
    }

    db.all("SELECT id, desc FROM emocion", (error, rows) => {
    if(error) throw error;
        res.type('text/html');
        res.render('follow', {
            tituloPagina: 'FeelFollow',
            emotes: rows,
            error: mError
        }, function(err, html){
            if(err) throw err;
            res.send(html);
        });
    });
});

app.get('/emote/:emoid', function(req, res) {
    var mError='';
    if(req.query.error)
    {
        mError=req.query.error;
    }

    var insert = "SELECT e.id AS emocionCode, f.desc, date(f.datetime) AS date, time(f.datetime) AS time FROM seg_emocion AS f INNER JOIN emocion AS e ON f.emoteId = e.id WHERE f.id = ? AND f.userId = ?";
    db.get(insert,[req.params.emoid, req.session.paginaId], (error, row) => {
        if(row!==undefined)
        {
            db.all("SELECT id, desc FROM emocion", (error, emoteRows) => {
                if(error) throw error;
                    var emoDate = new Date(row.date + ' ' + row.time + ' UTC');

                    res.type('text/html');
                    res.render('emote', {
                        tituloPagina: 'FeelFollow',
                        currEmote: row.emocionCode,
                        emoteId: req.params.emoid,
                        emotes: emoteRows,
                        fecha: emoDate.toLocaleString(),
                        desc: row.desc,
                        error: mError
                    }, function(err, html){
                        if(err) throw err;
                        res.send(html);
                    });
                });
        }
        else{
            res.redirect('/follow');
        }
    });
});

app.post('/emoteupdate/:emoid', function(req, res) {
    var emotion = req.body.emote;
    var desc = req.body.desc;
    console.log("Actualizando emote " + req.params.emoid);
    var insert = 'UPDATE seg_emocion set emoteId = ?, desc = ? WHERE id = ? AND userId = ?';
            db.run(insert,[emotion, desc, req.params.emoid, req.session.paginaId], function(err) {
                if (err) {
                    console.log("No añadido");
                    throw err;
                }
                else{
                    res.redirect('/emote/'+req.params.emoid+'?error=modSuccess');
                }
            });  
});

app.get('/emotedelete', function(req, res){
    if(!req.query.emoteid)
    {
        res.redirect('/follow');
    }

    console.log("Eliminando emote " + req.query.emoteid);

    var insert = 'DELETE FROM seg_emocion WHERE id = ? AND userId = ?';
            db.run(insert,[req.query.emoteid, req.session.paginaId], function(err) {
                if (err) {
                    console.log("eliminado");
                    throw err;
                }
                else{
                    res.redirect('/follow/?error=delSuccess');
                }
            });  
});


app.post('/emote/', function(req, res) {
    var emotion = req.body.emote;
    var desc = req.body.desc;
    var insert = 'INSERT INTO seg_emocion (userId, emoteId, desc, datetime) VALUES (?,?,?,julianday(\'now\'))';
            db.run(insert,[req.session.paginaId,emotion,desc], function(err) {
                if (err) {
                    console.log("No añadido");
                    throw err;
                }
                else{
                    res.redirect('/emote/'+this.lastID);
                }
            });  
});


app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});


app.listen(3000);