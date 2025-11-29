'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { generateGoogleCalendarUrl } from '../utils/google-calendar';
import { translations } from '../utils/translations';

export default function Home() {
  const [flightNumber, setFlightNumber] = useState('');
  const [departureIata, setDepartureIata] = useState('');
  const [arrivalIata, setArrivalIata] = useState('');
  const [searchMode, setSearchMode] = useState('number'); // 'number' or 'route'
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('ja');

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ja' : 'en');
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    let query = '';
    if (searchMode === 'number') {
      if (!flightNumber.trim()) return;
      query = `flightNumber=${encodeURIComponent(flightNumber)}`;
    } else {
      if (!departureIata.trim() || !arrivalIata.trim()) return;
      query = `departureIata=${encodeURIComponent(departureIata)}&arrivalIata=${encodeURIComponent(arrivalIata)}`;
    }

    setLoading(true);
    setError('');
    setFlightData(null);

    try {
      const response = await fetch(`/api/flights?${query}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data) && data.length > 0) {
        setFlightData(data[0]);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError(t.errorNotFound);
      }
    } catch (err) {
      setError(t.errorFetch);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <button onClick={toggleLanguage} className={styles.languageToggle}>
        {t.toggle}
      </button>
      <h1 className={styles.title}>{t.title}</h1>

      <div className={styles.searchModeContainer}>
        <button
          className={`${styles.modeButton} ${searchMode === 'number' ? styles.activeMode : ''}`}
          onClick={() => setSearchMode('number')}
        >
          {t.searchByNumber}
        </button>
        <button
          className={`${styles.modeButton} ${searchMode === 'route' ? styles.activeMode : ''}`}
          onClick={() => setSearchMode('route')}
        >
          {t.searchByRoute}
        </button>
      </div>

      <form onSubmit={handleSearch} className={styles.form}>
        {searchMode === 'number' ? (
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder={t.placeholder}
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              disabled={loading}
            />
          </div>
        ) : (
          <div className={styles.routeInputs}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder={t.originPlaceholder}
                value={departureIata}
                onChange={(e) => setDepartureIata(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder={t.destinationPlaceholder}
                value={arrivalIata}
                onChange={(e) => setArrivalIata(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? t.searching : t.searchButton}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {flightData && (
        <a
          href={generateGoogleCalendarUrl(flightData, language)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cardLink}
        >
          <div className={styles.resultCard}>
            <div className={styles.flightHeader}>
              <span className={styles.flightNumber}>{flightData.flightNumber}</span>
              <span className={styles.time}>{flightData.timeZone}</span>
            </div>

            <div className={styles.route}>
              <div className={styles.location}>
                <span className={styles.airport}>{flightData.startLocation.split('(')[1].replace(')', '')}</span>
                <span className={styles.time}>{new Date(flightData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={styles.arrow}>✈</div>
              <div className={styles.location} style={{ alignItems: 'flex-end' }}>
                <span className={styles.airport}>{flightData.endLocation.split('(')[1].replace(')', '')}</span>
                <span className={styles.time}>{new Date(flightData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.label}>{t.origin}</span>
                <span className={styles.value}>{flightData.startLocation.split('(')[0].trim()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{t.destination}</span>
                <span className={styles.value}>{flightData.endLocation.split('(')[0].trim()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{t.date}</span>
                <span className={styles.value}>{new Date(flightData.startTime).toLocaleDateString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>{t.duration}</span>
                <span className={styles.value}>
                  {Math.round((new Date(flightData.endTime) - new Date(flightData.startTime)) / (1000 * 60 * 60))}{t.hours} {' '}
                  {Math.round(((new Date(flightData.endTime) - new Date(flightData.startTime)) / (1000 * 60)) % 60)}{t.minutes}
                </span>
              </div>
            </div>
          </div>
        </a>
      )}
    </main>
  );
}
