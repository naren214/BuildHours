export default function WorkshopChallenge({ level, title, children, number }) {
  return (
    <article className="challenge">
      <span className="challenge-level">
        {number} / {level}
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
