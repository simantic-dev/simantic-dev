import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import './App.css';

import ApplicationForm from './components/ApplicationForm';

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main className='p-6 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-4'>Apply</h1>
      <p className='mb-4'>Input</p>
      <ApplicationForm />
    </main>
  )
}
