// associar as dependências instaladas
const express = require('express');
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./repository/db')

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
const passwporStrategy = function(passportImport){

  passportImport.serializeUser((user, done) => {
      done(null, user._id);
  });

  passportImport.deserializeUser(async (id, done) => {
      try {
          
          const user = await db.getUser(id);
          done(null, user);
      } catch (err) {
          done(err, null);
      }
  });
  passportImport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    async (email, password, done) => {
        try {
          const user = await db.getUserByEmail(email);
            // usuário inexistente
            if (!user) { return done(null, false) }
            console.log(user)

            // comparando as senhas
            const isValid = bcrypt.compareSync(password, user.password);
            if (!isValid) return done(null, false)
            
            return done(null, user)
        } catch (err) {
            done(err, false);
        }
    }
  ));
}
passwporStrategy(passport)

function authenticationMiddlewareAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) return next();
  res.redirect('/admin?fail=true');
}

function authenticationMiddleware(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login?fail=true');
}

app.use(session({  
  secret: '123',//configure um segredo seu aqui,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 }//30min
}))
app.use(passport.initialize());
app.use(passport.session());


// inicializar app express

let port = 5656;
// servidor á escuta no porto 5000
// 'process.env.port': caso usemos Heroku
app.use(express.urlencoded())
app.use(express.json())
const mongoose = require('mongoose');
// Ligar á B.D.: 'test'->user da BD, ´nnn´->pass
mongoose.connect('mongodb://root:rootpwd@localhost:27017');
// Confirma ligação na consola
mongoose.connection.on('connected', function () {
  console.log('Connected to Database '+'test');
});
// Mensagem de Erro
mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});

app.listen(process.env.port || port, async () =>{
  console.log('Servidor em execução no porto: '+ port);
});

app.get('/admin', (req, res) => {
  res.render('login-admin')
})

app.get('/admin/loja', authenticationMiddlewareAdmin, async (req, res) => {
  const cars = await db.getCars()

  res.render('loja-admin', {cars})
})

app.get('/loja', authenticationMiddleware, async (req, res) => {
  const cars = await db.getCars()
  res.render('loja', {cars})
})

app.get('/', async (req, res) => {
  const cars = await db.getCars()
  res.render('public-cars', {cars})
})

app.get('/admin/loja/delete-carro', authenticationMiddlewareAdmin, (req, res) => {
  db.deleteCar(req.query.id).then(resul => {

    res.redirect('/admin/loja')
  })
})

app.get('/admin/loja/add-carro', authenticationMiddlewareAdmin, (req, res) => {
  res.render('add-car')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.get('/sign-up', (req, res) => {
  res.render('sign-up')
})

app.post('/sign-up', (req, res) => {
  db.saveUser(req.body).then(data => {
    res.render('/loja')
  })
})

app.get('/loja/alugar', authenticationMiddleware, (req, res) => {
  db.getCar(req.query.id).then(car => {
    console.log(car)
    res.render('loja-alugar', {car})
  })
})

app.get('/loja/aluguel', authenticationMiddleware, async (req, res) => {
  const rents = await db.getRentsByUser({id: req.user._id})
  console.log(rents)
  res.render('alugueis', {rents})
})

app.post('/loja/alugar', authenticationMiddleware, (req, res) => {
  const car = {
    _id: req.body.id.replaceAll('`', ''),
    name: req.body.name.replaceAll('`', ''),
    mark: req.body.mark.replaceAll('`', ''),
    color: req.body.color.replaceAll('`', ''),
    value: req.body.value.replaceAll('`', ''),
    dialyValue: req.body.dialyValue.replaceAll('`', '')
  }
  const user = req.user
  db.saveRent({
    startAt: req.body.startAt.replaceAll('`', ''),
    endAt: req.body.endAt.replaceAll('`', ''),
    startAt: req.body.startAt.replaceAll('`', ''),
    pag: req.body.pag.replaceAll('`', ''),
    car,
    user
  }).then(rent => {
    res.redirect('/loja')
  })
})

app.post('/admin/loja/add-carro', authenticationMiddlewareAdmin, (req, res) => {
  db.saveCar(req.body).then(data => {
    res.redirect('/admin/loja')
  })
})

app.post('/admin-login', passport.authenticate('local', { 
  successRedirect: '/admin/loja', 
  failureRedirect: '/admin?fail=true' 
}))

app.post('/login', passport.authenticate('local', { 
  successRedirect: '/loja', 
  failureRedirect: '/login?fail=true' 
}))

app.post('/user', (req, res) => {
  db.saveUser(req.body).then(user => 
    res.send(user))
})