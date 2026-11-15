import { Link } from 'react-router-dom';
import { instrumentsFor, type ScoreSource } from '../../music/score';
import { useAppState } from '../../state/AppState';
import { Icon } from '../Icon';
import { ScoreThumb } from './ScoreThumb';
import styles from './ScoreCard.module.css';

export function ScoreCard({ score, extra }: { score: ScoreSource; extra?: React.ReactNode }) {
  const { progress, toggleFavorite } = useAppState();
  const fav = progress.favorites.includes(score.id);
  const ins = instrumentsFor(score);
  return (
    <article className={styles.card} data-score={score.id}>
      <Link to={`/library/${score.id}`} className={styles.link} aria-label={`${score.title} by ${score.composer}`}>
        <ScoreThumb score={score} />
        <div className={styles.body}>
          <h3 className={styles.title}>{score.title}</h3>
          <p className={styles.composer}>{score.composer}</p>
          <p className={styles.meta}>
            <span className={`${styles.diff} ${styles[score.difficulty.toLowerCase()]}`}>{score.difficulty}</span>
            <span>{score.genre}</span>
            <span>{score.time}</span>
          </p>
          <p className={styles.ins}>{ins.length > 4 ? `${ins.slice(0, 4).join(', ')} +${ins.length - 4}` : ins.join(', ')}</p>
          <p className={styles.licence}>{score.licence.kind === 'cc0' ? 'Stave original · CC0' : 'Public domain · CC0 edition'}</p>
        </div>
      </Link>
      <button type="button" className={`${styles.fav} ${fav ? styles.favOn : ''}`} onClick={() => toggleFavorite(score.id)} aria-pressed={fav} aria-label={fav ? `Remove ${score.title} from favourites` : `Add ${score.title} to favourites`}>
        <Icon name="heart" size={18} filled={fav} />
      </button>
      {extra && <div className={styles.extra}>{extra}</div>}
    </article>
  );
}
