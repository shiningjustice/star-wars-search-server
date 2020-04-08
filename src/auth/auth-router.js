const express = require('express');
const AuthService = require('./auth-service');
const { requireAuth } = require('../middleware/jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
  .route('/token')
  .post(jsonBodyParser, async (req, res, next) => {
    const { username, password } = req.body;
    const loginUser = { username, password };
    
    for (const [key, value] of Object.entries(loginUser)) {
      if (!value) {
        return res.status(400).json({ error: `Missing ${key} in request body`});
      };
    }

    try {
      const dbUser = await AuthService.getUserWithUsername(
        req.app.get('db'),
        loginUser.username
      );
      
      if (!dbUser) {
        return res.status(400).json({ error: 'Incorrect username or password'});
      };

      const compareMatch = await AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      );

      if (!compareMatch) {
        return res.status(400).json({ error: 'Incorrect username or password' });
      };

      const subject = dbUser.username;
      const payload = {
        user_id: dbUser.id,
        first_name: dbUser.first_name
      };
      res.send({
        authToken: AuthService.createJwt(subject, payload)
      });
    } catch (error) {
      next(error);
    };
  })

  .put(requireAuth, (req, res) => {
    const subject = req.user.username;
    const payload = {
      user_id: req.user.id,
      first_name: req.user.first_name
    };
    res.send({ authToken: AuthService.createJwt(subject, payload) });
  });

module.exports = authRouter;