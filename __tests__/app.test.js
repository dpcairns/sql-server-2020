require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns banjos', async() => {

      const expectation = [
        {
          id: 1,
          brand: 'gold tone',
          noise_level: 3,
          owner_id: 1
        },
        {
          id: 2,
          brand: 'fender',
          noise_level: 4,
          owner_id: 1
        },
        {
          id: 3,
          brand: 'deering',
          noise_level: 10,
          owner_id: 1,
        }
      ];
      

      const data = await fakeRequest(app)
        .get('/banjos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns a single banjo', async() => {
      const expectation = {
        id: 1,
        brand: 'gold tone',
        noise_level: 3,
        owner_id: 1
      };
  
      const data = await fakeRequest(app)
        .get('/banjos/1')
        .expect('Content-Type', /json/)
        .expect(200);
  
      expect(data.body).toEqual(expectation);
    });
  });
});
