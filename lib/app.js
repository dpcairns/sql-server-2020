const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/banjos', async(req, res) => {
  try {
    const data = await client.query('SELECT * from banjos');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/banjos/:id', async(req, res) => {
  try {
    const banjoId = req.params.id;
  
    const data = await client.query(`
        SELECT * FROM banjos 
        WHERE banjos.id=$1 
    `, [banjoId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// we add a new post route with the path /banjos
app.post('/banjos/', async(req, res) => {
  try {
    // we get all the banjo data from the POST body (i.e., from the form in react)
    const newBrand = req.body.brand;
    const newNoiseLevel = req.body.noise_level;
    const newOwnerId = req.body.owner_id;
  
    // use an insert statement to make a new banjo
    const data = await client.query(`
      INSERT INTO banjos (brand, noise_level, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, 
    // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
    [newBrand, newNoiseLevel, newOwnerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// we add a new post route with the path /banjos
app.put('/banjos/:id', async(req, res) => {
  try {
    // we get all the banjo data from the POST body (i.e., from the form in react)
    const newBrand = req.body.brand;
    const newNoiseLevel = req.body.noise_level;
    const newOwnerId = req.body.owner_id;
  
    // use an insert statement to make a new banjo
    const data = await client.query(`
      INSERT INTO banjos (brand, noise_level, owner_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, 
    // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
    [newBrand, newNoiseLevel, newOwnerId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/banjos/:booger', async(req, res) => {
  try {
    const banjoId = req.params.booger;

    // use an insert statement to make a new banjo
    const data = await client.query(`
      DELETE from banjos WHERE banjos.id=$1
    `, 
    // use the weird $ syntax and this array to prevent SQL injection (i.e. Bobby "DROP TABLES")
    [banjoId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
