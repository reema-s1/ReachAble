import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Back to job listings</Link>
    </>
  );
}
