import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';

const AllLogsComponent = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "system_logs"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logsData.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate()
        });
      });
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      toast.error("Failed to load logs: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-8">Loading logs...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">All System Logs</h2>
      
      {logs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mt-2">No logs found in the system</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      log.action === 'APPROVE' ? 'bg-green-100 text-green-800' :
                      log.action === 'REJECT' ? 'bg-red-100 text-red-800' :
                      log.action === 'BLOCK' ? 'bg-yellow-100 text-yellow-800' :
                      log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {log.action}
                    </span>
                    <h3 className="font-medium text-gray-900">{log.description}</h3>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>User: {log.adminEmail || log.userEmail || log.patientEmail || log.doctorEmail || 'System'}</p>
                    <p>Time: {log.timestamp?.toLocaleString()}</p>
                    {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllLogsComponent;