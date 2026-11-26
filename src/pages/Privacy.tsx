import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import styles from './Privacy.module.css';

const UPDATED = '16 November 2026';
const ISSUES = 'https://github.com/playstave/playstave.github.io/issues';

/** Plain-language privacy policy. Keep it in step with what the code actually does. */
export function Privacy() {
  return (
    <>
      <PageHeader eyebrow={`Last updated ${UPDATED}`} title="Privacy policy" lede="Stave is a free music-learning app for students of all ages. This page explains, in plain words, what it stores and why." />
      <div className={`prose ${styles.body}`}>
        <h2>The short version</h2>
        <ul>
          <li>You can use Stave without an account. Then everything stays in your own browser.</li>
          <li>The microphone is only used while you tune or play, and the sound is analysed on your device. It is never recorded, saved or sent anywhere.</li>
          <li>We never ask for your real name, email address or age.</li>
          <li>Ads appear only if you choose “Show ads”, and they are never personalised.</li>
        </ul>

        <h2>What is stored in your browser</h2>
        <p>Your nickname, instrument, progress (levels, stars, XP, badges, practice days), settings, favourite scores and your ad choice are saved in your browser’s local storage on this device. You can erase all of it in <Link to="/settings#privacy">Settings → Privacy &amp; data → Reset this device</Link>.</p>

        <h2>The microphone</h2>
        <p>When you open the tuner, a play-along or a play test, your browser asks for permission to use the microphone. Stave listens to work out which note you are playing, entirely on your device. No audio is recorded, stored or uploaded. You can turn microphone access off at any time in your browser’s site settings.</p>

        <h2>Accounts (optional)</h2>
        <p>If you create an account, Stave stores your chosen username, a securely hashed password and your learning progress, so it can follow you to other devices. Accounts are run on Supabase (a database service); row-level security means only you can read or change your data. You can delete your account and everything in it from your Profile at any time.</p>

        <h2>Advertising</h2>
        <p>Stave is free because of advertising from Google AdSense. Nothing from an ad company loads unless you choose “Show ads” (you are asked once, and can change it in Settings). If you choose “No ads”, no ad code is loaded at all.</p>
        <p>When ads are shown, Stave asks Google for <strong>non-personalised ads only</strong>: ads are not based on what you do on other sites. Google may still use cookies or similar technology to limit how often you see an ad, to measure ads and to prevent fraud. Google may show a full-screen ad (sometimes a video) when you move on to a new lesson; Google decides whether an ad is ready and limits how often they appear. Ads never appear in the middle of a lesson, play test, the tuner, the play-along, a quiz or while you read a score. Learn more in <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">how Google uses information in advertising</a>.</p>

        <h2>Children</h2>
        <p>Many Stave students are children. That is why Stave collects as little as possible, never asks for an email, real name or age, and only requests non-personalised ads after a choice. If you are a parent or guardian and have a question about your child’s data, please contact us (below).</p>

        <h2>Hosting and other services</h2>
        <p>The website is hosted on GitHub Pages, which, like any web host, may keep standard server logs (such as IP addresses) for security. Fonts and all app code are served from Stave’s own site, not from third-party font or analytics services. Stave uses no analytics or tracking of its own.</p>

        <h2>Changes and contact</h2>
        <p>If this policy changes, the date at the top will change too. Questions or requests: please open an issue at <a href={ISSUES} target="_blank" rel="noreferrer">github.com/playstave/playstave.github.io/issues</a>.</p>
      </div>
    </>
  );
}
