import { EmptyState, Notice, PageHeader, Panel, SectionTitle } from '../components/ui';
import styles from './Library.module.css';

const TAXONOMY = {
  Instrument: ['Piano', 'Guitar', 'Violin', 'Viola', 'Cello', 'Flute', 'Clarinet', 'Saxophone', 'Trumpet', 'Trombone', 'Drums', 'Voice', 'Other'],
  Difficulty: ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'],
  Genre: ['Classical', 'Jazz', 'Traditional', 'Folk', 'Contemporary', 'Educational', 'Religious'],
};

const LICENCES = [
  { name: 'Public domain', detail: 'Works and editions whose copyright has expired, verified per score.' },
  { name: 'Creative Commons', detail: 'Openly licensed editions (e.g. CC0, CC BY). Attribution is shown on every score.' },
  { name: 'Stave originals', detail: 'Educational pieces composed for this curriculum and free to download.' },
];

export function Library() {
  return (
    <>
      <PageHeader
        eyebrow="Sheet music"
        title="Library"
        lede="A free library of sheet music you are allowed to read, print and share. Search and filters open with the first catalogue."
      />

      <div className={styles.layout}>
        <Panel aria-labelledby="catalogue" className={styles.catalogue}>
          <SectionTitle id="catalogue">Catalogue</SectionTitle>
          <p className={styles.count}><span className="num">0</span> scores available</p>
          <EmptyState title="The library is being catalogued">
            Every score is checked for its licence before it is added. Search, filters, favourites, collections and the score viewer open together with the first catalogue.
          </EmptyState>
        </Panel>

        <aside className={styles.side} aria-label="How the library is organised">
          <section aria-labelledby="organised">
            <SectionTitle id="organised">How scores will be organised</SectionTitle>
            <dl className={styles.tax}>
              {Object.entries(TAXONOMY).map(([k, vals]) => (
                <div key={k}>
                  <dt className="eyebrow">{k}</dt>
                  <dd>{vals.join(' · ')}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>

      <section aria-labelledby="licensing" className={styles.licensing}>
        <SectionTitle id="licensing">Licensing</SectionTitle>
        <Notice title="Only music we have the right to share">
          <p>Stave never scrapes or uploads copyrighted arrangements. Every score shows its source and licence, and downloads are offered only where the licence allows it.</p>
        </Notice>
        <ul className={styles.licences}>
          {LICENCES.map((l) => (
            <li key={l.name}><p className={styles.licName}>{l.name}</p><p className="muted">{l.detail}</p></li>
          ))}
        </ul>
      </section>
    </>
  );
}
