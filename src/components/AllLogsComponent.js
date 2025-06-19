import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AllLogsComponent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, 'systemLogs'),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setLogs(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchLogs();
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading logs...</div>;

  return (
    <div className="logs-container">
      <h1>System Logs</h1>
      {user && (
        <div className="logs-list">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="log-item">
                <p><strong>{new Date(log.timestamp?.toDate()).toLocaleString()}</strong></p>
                <p>{log.message}</p>
                <p>User: {log.userId || 'System'}</p>
              </div>
            ))
          ) : (
            <p>No logs found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllLogsComponent;