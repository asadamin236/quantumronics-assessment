import passport from 'passport';
import dotenv from 'dotenv';
dotenv.config({ override: true });
import fs from 'fs';
import path from 'path';
import { parse as dotenvParse } from 'dotenv';
const envGetAny = (candidates) => {
  const keys = Object.keys(process.env);
  for (const k of keys) {
    const norm = k.replace(/\s/g, '').toUpperCase();
    for (const c of candidates) {
      const target = c.replace(/\s/g, '').toUpperCase();
      if (norm === target) {
        const val = process.env[k];
        if (val) return val;
      }
    }
  }
  for (const c of candidates) {
    const val = process.env[c];
    if (val) return val;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const raw = fs.readFileSync(envPath, 'utf8');
    const parsed = dotenvParse(raw);
    for (const c of candidates) {
      const val = parsed[c] || parsed[c.toUpperCase()] || parsed[c.toLowerCase()];
      if (val) return val;
    }
  } catch {}
  return undefined;
};
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';

const setupGoogle = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackURL = 'http://localhost:8000/api/auth/google/callback';
  console.log('Google keys present:', Object.keys(process.env).filter(k => k.toUpperCase().includes('GOOGLE')).join(', ') || 'none');
  console.log('Google clientID value length:', clientID ? String(clientID).length : 0, 'clientSecret length:', clientSecret ? String(clientSecret).length : 0);
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('Google .env path:', envPath, 'exists:', fs.existsSync(envPath));
    const raw = fs.readFileSync(envPath, 'utf8');
    const parsed = dotenvParse(raw);
    const fileId = parsed['GOOGLE_CLIENT_ID'];
    const fileSecret = parsed['GOOGLE_CLIENT_SECRET'];
    console.log('Google .env file value lengths:', fileId ? String(fileId).length : 0, fileSecret ? String(fileSecret).length : 0);
  } catch {}
  if (!clientID || !clientSecret) {
    console.log('Google OAuth missing env, clientID:', clientID ? 'set' : 'missing', 'clientSecret:', clientSecret ? 'set' : 'missing');
    return;
  }
  console.log('Google OAuth strategy initialized');
  console.log('Google callbackURL:', googleCallbackURL);
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: googleCallbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const oauthId = profile.id;
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          console.log('Google access token length:', accessToken ? String(accessToken).length : 0, 'refresh token length:', refreshToken ? String(refreshToken).length : 0);
          if (accessToken) console.log('Google access token preview:', String(accessToken).slice(0, 8));
          if (refreshToken) console.log('Google refresh token preview:', String(refreshToken).slice(0, 8));
          let user = await User.findOne({ oauthProvider: 'google', oauthId });
          if (!user && email) user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ name, email, oauthProvider: 'google', oauthId, role: 'User', password: `${oauthId}.${Date.now()}` });
          } else {
            user.oauthProvider = user.oauthProvider || 'google';
            user.oauthId = user.oauthId || oauthId;
            user.set('updatedAt', new Date());
            await user.save();
          }
          await LoginLog.create({ user: user._id, email: user.email, provider: 'google', success: true });
          return done(null, user);
        } catch (e) {
          return done(e, null);
        }
      }
    )
  );
};

const setupGitHub = () => {
  const clientID = envGetAny(['GITHUB_CLIENT_ID', 'GITHUB_OAUTH_CLIENT_ID', 'GITHUBCLIENTID']);
  const clientSecret = envGetAny(['GITHUB_CLIENT_SECRET', 'GITHUB_OAUTH_CLIENT_SECRET', 'GITHUBCLIENTSECRET']);
  const githubCallbackURL = 'http://localhost:8000/api/auth/github/callback';
  console.log('GitHub clientID length:', clientID ? String(clientID).length : 0, 'clientSecret length:', clientSecret ? String(clientSecret).length : 0);
  if (!clientID || !clientSecret) {
    console.log('GitHub OAuth missing env, clientID:', clientID ? 'set' : 'missing', 'clientSecret:', clientSecret ? 'set' : 'missing');
    return;
  }
  console.log('GitHub OAuth strategy initialized');
  console.log('GitHub callbackURL:', githubCallbackURL);
  passport.use(
    new GitHubStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: githubCallbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('GitHub access token length:', accessToken ? String(accessToken).length : 0, 'refresh token length:', refreshToken ? String(refreshToken).length : 0);
          if (accessToken) console.log('GitHub access token preview:', String(accessToken).slice(0, 8));
          if (refreshToken) console.log('GitHub refresh token preview:', String(refreshToken).slice(0, 8));
          const oauthId = profile.id?.toString();
          let email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.username || 'User';

          if (!email) {
            try {
              const resp = await fetch('https://api.github.com/user/emails', {
                headers: {
                  Authorization: `token ${accessToken}`,
                  'User-Agent': 'quantumronics-oauth-app'
                }
              });
              const list = await resp.json();
              if (Array.isArray(list)) {
                const primary = list.find((e) => e.primary && e.verified)?.email
                  || list.find((e) => e.verified)?.email
                  || list[0]?.email;
                email = primary || email;
              }
            } catch (err) {
              console.log('GitHub email fetch failed:', err?.message || err);
            }
          }
          if (!email) {
            const username = profile.username || `user_${oauthId || Date.now()}`;
            email = `${username}@users.noreply.github.com`;
            console.log('GitHub email missing, using fallback:', email);
          }
          let user = await User.findOne({ oauthProvider: 'github', oauthId });
          if (!user && email) user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ name, email, oauthProvider: 'github', oauthId, role: 'User', password: `${oauthId}.${Date.now()}` });
          } else {
            user.oauthProvider = user.oauthProvider || 'github';
            user.oauthId = user.oauthId || oauthId;
            user.set('updatedAt', new Date());
            await user.save();
          }
          await LoginLog.create({ user: user._id, email: user.email, provider: 'github', success: true });
          return done(null, user);
        } catch (e) {
          return done(e, null);
        }
      }
    )
  );
};

setupGoogle();
setupGitHub();
