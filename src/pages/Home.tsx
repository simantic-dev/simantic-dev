import './Home.css';
import { Link } from 'react-router-dom';
import PCBHoverEffect from '../components/PCBHoverEffect';

export default function Home() {
  return (
    <main className='home'>
      <div className="home-content">
        <h1 className="silkscreen-regular">Simantic</h1>
        <h2 className="silkscreen-regular">Test hardware without hardware</h2>
      </div>
      <PCBHoverEffect />
      
      <div className="home-divider"></div>
      
      <section className="home-section">
        <h2 className="silkscreen-regular">Section 1</h2>
        <p>Content for section 1 goes here.</p>
      </section>
      
      <div className="home-divider"></div>
      
      <section className="home-section">
        <h2 className="silkscreen-regular">Section 2</h2>
        <p>Content for section 2 goes here.</p>
      </section>
    </main>
  )
}
