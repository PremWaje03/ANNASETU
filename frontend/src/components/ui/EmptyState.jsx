function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default EmptyState;
