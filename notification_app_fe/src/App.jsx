import { useEffect, useState } from 'react';
import Log from '../../logging_middleware/index.js';
import './App.css';

const sampleNotifications = [
  { id: 1, title: 'Welcome', message: 'Notification system initialized successfully.', type: 'info' },
  { id: 2, title: 'Reminder', message: 'Check your pending alerts.', type: 'warn' },
];

function App() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setNotifications(sampleNotifications);
        await Log('frontend', 'info', 'component', 'Loaded sample notifications.');
      } catch (err) {
        setError('Unable to load notifications.');
        await Log('frontend', 'error', 'component', `Notification load failed: ${err.message}`);
      }
    }

    loadNotifications();
  }, []);

  return (
    <main className="app-shell">
      <section className="panel">
        <h1>Notification App FE</h1>
        <p>Frontend notification experience with reusable logging integration.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="notifications">
          {notifications.map((item) => (
            <article key={item.id} className={`notification ${item.type}`}>
              <h2>{item.title}</h2>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
