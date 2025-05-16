import React, { useState, useEffect } from "react";
import { Search, Filter, RefreshCw, Download, AlertCircle, CheckCircle, Info, Clock, User, Settings, FileText } from "lucide-react";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  useEffect(() => {
    // Simulate fetching logs data
    const fetchLogs = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Sample logs data
      const sampleLogs = [
        {
          id: 1,
          timestamp: "2025-05-14T09:23:14",
          user: "Dr. Sarah Wilson",
          action: "Patient Record Updated",
          details: "Updated medical history for patient #28456",
          type: "Update",
          status: "Success",
          ip: "192.168.1.45"
        },
        {
          id: 2,
          timestamp: "2025-05-14T08:17:32",
          user: "Admin",
          action: "User Permission Changed",
          details: "Modified access rights for Dr. Thomas Lee",
          type: "Security",
          status: "Success",
          ip: "192.168.1.12"
        },
        {
          id: 3,
          timestamp: "2025-05-13T16:42:05",
          user: "System",
          action: "Backup Completed",
          details: "Daily database backup successful",
          type: "System",
          status: "Success",
          ip: "Internal"
        },
        {
          id: 4,
          timestamp: "2025-05-13T14:35:41",
          user: "Nurse Jenkins",
          action: "Appointment Scheduled",
          details: "New appointment for patient #34291",
          type: "Create",
          status: "Success",
          ip: "192.168.1.78"
        },
        {
          id: 5,
          timestamp: "2025-05-13T11:23:09",
          user: "Dr. Robert Brown",
          action: "Login Failed",
          details: "Multiple failed login attempts",
          type: "Security",
          status: "Alert",
          ip: "192.168.1.56"
        },
        {
          id: 6,
          timestamp: "2025-05-13T10:08:47",
          user: "Admin",
          action: "System Settings Changed",
          details: "Modified appointment reminder settings",
          type: "Settings",
          status: "Success",
          ip: "192.168.1.12"
        },
        {
          id: 7,
          timestamp: "2025-05-12T16:55:22",
          user: "Dr. Lisa Chen",
          action: "Patient Record Created",
          details: "New patient record #41038 added",
          type: "Create",
          status: "Success",
          ip: "192.168.1.32"
        },
        {
          id: 8,
          timestamp: "2025-05-12T15:11:03",
          user: "System",
          action: "Server Error",
          details: "Database connection timeout at 15:10:47",
          type: "System",
          status: "Error",
          ip: "Internal"
        },
        {
          id: 9,
          timestamp: "2025-05-12T13:27:18",
          user: "Reception",
          action: "Appointment Cancelled",
          details: "Cancelled appointment for patient #29384",
          type: "Delete",
          status: "Warning",
          ip: "192.168.1.92"
        },
        {
          id: 10,
          timestamp: "2025-05-12T09:02:51",
          user: "Dr. James Wilson",
          action: "Lab Results Updated",
          details: "Updated blood test results for patient #35621",
          type: "Update",
          status: "Success",
          ip: "192.168.1.38"
        },
        {
          id: 11,
          timestamp: "2025-05-11T16:48:32",
          user: "System",
          action: "Automated Email Sent",
          details: "Appointment reminders sent to 24 patients",
          type: "Notification",
          status: "Success",
          ip: "Internal"
        },
        {
          id: 12,
          timestamp: "2025-05-11T14:36:07",
          user: "Admin",
          action: "User Created",
          details: "New staff account created for Dr. Maria Gonzalez",
          type: "Security",
          status: "Success",
          ip: "192.168.1.12"
        },
        {
          id: 13,
          timestamp: "2025-05-11T11:22:40",
          user: "System",
          action: "Storage Warning",
          details: "System storage approaching 85% capacity",
          type: "System",
          status: "Warning",
          ip: "Internal"
        },
        {
          id: 14,
          timestamp: "2025-05-11T10:15:09",
          user: "Nurse Davis",
          action: "Patient Check-in",
          details: "Patient #30284 checked in for appointment",
          type: "Update",
          status: "Success",
          ip: "192.168.1.65"
        },
        {
          id: 15,
          timestamp: "2025-05-10T17:03:22",
          user: "Dr. Michael Thompson",
          action: "Prescription Created",
          details: "New prescription for patient #32195",
          type: "Create",
          status: "Success",
          ip: "192.168.1.41"
        }
      ];
      
      setLogs(sampleLogs);
      setLoading(false);
    };
    
    fetchLogs();
  }, []);

  // Filter logs based on search and filter selections
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "All" || log.type === typeFilter;
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get current logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "Warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "Alert":
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Update":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Create":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "Delete":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Security":
        return <Settings className="h-5 w-5 text-purple-500" />;
      case "System":
        return <Settings className="h-5 w-5 text-gray-500" />;
      case "Notification":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "Settings":
        return <Settings className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
        <p className="text-gray-500">View and analyze system activity and events</p>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search logs by user, action or details..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Update">Update</option>
                <option value="Create">Create</option>
                <option value="Delete">Delete</option>
                <option value="Security">Security</option>
                <option value="System">System</option>
                <option value="Notification">Notification</option>
                <option value="Settings">Settings</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Success">Success</option>
                <option value="Error">Error</option>
                <option value="Warning">Warning</option>
                <option value="Alert">Alert</option>
              </select>
            </div>
            
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{formatDate(log.timestamp)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{log.user}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.action}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{log.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(log.type)}
                          <span className="ml-2 text-sm text-gray-900">{log.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className="ml-2 text-sm text-gray-900">{log.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(currentPage < Math.ceil(filteredLogs.length / logsPerPage) ? currentPage + 1 : currentPage)}
                  disabled={currentPage >= Math.ceil(filteredLogs.length / logsPerPage)}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage >= Math.ceil(filteredLogs.length / logsPerPage) ? 'text-gray-300' : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to{" "}
                    <span className="font-medium">
                      {indexOfLastLog > filteredLogs.length ? filteredLogs.length : indexOfLastLog}
                    </span>{" "}
                    of <span className="font-medium">{filteredLogs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(Math.min(5, Math.ceil(filteredLogs.length / logsPerPage))).keys()].map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage < Math.ceil(filteredLogs.length / logsPerPage) ? currentPage + 1 : currentPage)}
                      disabled={currentPage >= Math.ceil(filteredLogs.length / logsPerPage)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage >= Math.ceil(filteredLogs.length / logsPerPage) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;