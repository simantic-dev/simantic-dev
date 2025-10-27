import './Home.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className='home'>
      <h1 className="silkscreen-regular">Simantic</h1>
      <h2 className="silkscreen-regular">Test hardware without hardware</h2>
      <h3 className="silkscreen-regular">
        <Link to="/waitlist" className="join-waitlist-button silkscreen-thin">Join the Waitlist</Link>
      </h3>
    </main>
  )
}
