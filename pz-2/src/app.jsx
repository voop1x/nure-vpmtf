import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const GROUPS = ['ЦА', 'Постійні клієнти', 'Інші'];

function App() {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('Всі');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        fetch('/api/users')
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(data => { setUsers(data); setError(null); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(fetchUsers, []);

    const setGroup = (id, group) => {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, group } : u)));
        fetch('/api/users/group', {
            method: 'POST',
            body: JSON.stringify({ id, group }),
        });
    };

    const visibleUsers = filter === 'Всі'
        ? users
        : users.filter(u => u.group === filter);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px' }}>
            <h2>Список користувачів</h2>

            <label>Фільтр за групою: </label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="Всі">Всі</option>
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {loading && <p>Завантаження...</p>}
            {error && <p style={{ color: 'red' }}>Помилка: {error}</p>}

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {visibleUsers.map(user => (
                    <li
                        key={user.id}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '10px',
                            margin: '8px 0',
                        }}
                    >
                        <b>{user.name}</b><br />
                        <span style={{ color: '#666' }}>{user.email}</span><br />
                        <label>Група: </label>
                        <select
                            value={user.group}
                            onChange={e => setGroup(user.id, e.target.value)}
                        >
                            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
