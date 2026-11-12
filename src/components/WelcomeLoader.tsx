export function WelcomeLoader({ label = 'Getting Decido ready…' }: { label?: string }) {
  return (
    <div className="welcome-loader" role="status">
      <img src="/brand/decido-logo.png" alt="" />
      <div className="welcome-loader-track" aria-hidden="true"><span /></div>
      <span>{label}</span>
    </div>
  );
}
