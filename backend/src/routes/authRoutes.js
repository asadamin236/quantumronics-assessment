import express from 'express';
import passport from 'passport';
import { signup, login, refresh, logout, me, oauthIssueTokens } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const hasStrategy = (name) => Boolean(passport?._strategies && passport._strategies[name]);

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);

const googleAuth = (req, res, next) => {
  if (!hasStrategy('google')) return res.status(501).json({ message: 'Google OAuth not configured' });
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
};
const googleCallback = (req, res, next) => {
  if (!hasStrategy('google')) return res.status(501).json({ message: 'Google OAuth not configured' });
  return passport.authenticate('google', { session: false }, (err, user, info) => {
    console.log('OAuth Full Error:', err, info);
    if (err) {
      console.error('Google OAuth callback error:', err, 'info:', info);
      return res.redirect('/api/auth/google/fail');
    }
    if (!user) {
      console.error('Google OAuth no user, info:', info);
      return res.redirect('/api/auth/google/fail');
    }
    req.user = user;
    return oauthIssueTokens(req, res);
  })(req, res, next);
};
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/google/fail', (req, res) => {
  res.status(400).json({
    message: 'Google OAuth failed to obtain access token. Verify Client ID/Secret and callback URL.',
    hint: {
      callbackURL: 'http://localhost:8000/api/auth/google/callback',
      scopes: ['profile', 'email']
    }
  });
});

const githubAuth = (req, res, next) => {
  if (!hasStrategy('github')) return res.status(501).json({ message: 'GitHub OAuth not configured' });
  return passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next);
};
const githubCallback = (req, res, next) => {
  if (!hasStrategy('github')) return res.status(501).json({ message: 'GitHub OAuth not configured' });
  return passport.authenticate('github', { session: false }, (err, user, info) => {
    console.log('OAuth Full Error:', err, info);
    if (err) {
      console.error('GitHub OAuth callback error:', err, 'info:', info);
      return res.redirect('/api/auth/github/fail');
    }
    if (!user) {
      console.error('GitHub OAuth no user, info:', info);
      return res.redirect('/api/auth/github/fail');
    }
    req.user = user;
    return oauthIssueTokens(req, res);
  })(req, res, next);
};
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);
router.get('/github/fail', (req, res) => {
  res.status(400).json({
    message: 'GitHub OAuth failed to obtain access token. Verify Client ID/Secret and callback URL.',
    hint: {
      callbackURL: 'http://localhost:8000/api/auth/github/callback',
      scopes: ['user:email']
    }
  });
});

router.get('/oauth/status', (req, res) => {
  res.json({
    google: hasStrategy('google'),
    github: hasStrategy('github')
  });
});

export default router;
