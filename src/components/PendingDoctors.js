import { db, storage } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const PendingDoctors = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [degreeModalOpen, setDegreeModalOpen] = useState(false);
  const [currentDegreeUrls, setCurrentDegreeUrls] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  useEffect(() => {
    const fetchPendingDoctors = async () => {
      try {
        const q = query(
          collection(db, 'doctors'),
          where('STATUS', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        
        const doctorsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().fullName || doc.data().name || 'N/A',
          email: doc.data().email || 'N/A',
          location: doc.data().location || 'N/A',
          experiences: doc.data().experiences || [],
          education: doc.data().education || []
        }));

        setPendingDoctors(doctorsData);
      } catch (error) {
        console.error("Failed to load pending doctors:", error);
        toast.error("Failed to load pending doctors data");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingDoctors();
  }, []);

  // Helper function to format experience data
  const formatExperiences = (experiences) => {
    if (!experiences || experiences.length === 0) {
      return 'No experience listed';
    }
    
    return experiences.map((exp, index) => (
      <div key={index} className="mb-2 text-sm">
        <div className="font-medium text-gray-900">{exp.role || 'N/A'}</div>
        <div className="text-gray-600">{exp.org || 'N/A'}</div>
        <div className="text-gray-500 text-xs">
          {exp.start ? `${exp.start} - ${exp.end || 'Present'}` : 'Dates not specified'}
        </div>
      </div>
    ));
  };

  // Helper function to format education data
  const formatEducation = (education) => {
    if (!education || education.length === 0) {
      return 'No education listed';
    }
    
    return education.map((edu, index) => (
      <div key={index} className="mb-2 text-sm">
        <div className="font-medium text-gray-900">{edu.degree || 'N/A'}</div>
        <div className="text-gray-600">{edu.institute || 'N/A'}</div>
        <div className="text-gray-500 text-xs">
          {edu.gradDate ? `Graduated: ${edu.gradDate}` : 'Graduation date not specified'}
        </div>
      </div>
    ));
  };

  // Debug function to check storage bucket info
  const debugStorageInfo = async () => {
    try {
      console.log("🔍 Storage object:", storage);
      console.log("🔍 Storage app:", storage.app);
      console.log("🔍 Storage bucket:", storage._bucket);
      
      // Try to list root directory
      const rootRef = ref(storage, '/');
      console.log("🔍 Root reference:", rootRef);
      
      const rootList = await listAll(rootRef);
      console.log("🔍 Root directory contents:", {
        items: rootList.items.map(item => ({ name: item.name, fullPath: item.fullPath })),
        prefixes: rootList.prefixes.map(prefix => ({ name: prefix.name, fullPath: prefix.fullPath }))
      });
      
    } catch (error) {
      console.error("🚨 Storage debug error:", error);
    }
  };

  const handleViewDegree = async (doctor) => {
    try {
      setProcessing(true);
      setCurrentDoctor(doctor);
      setCurrentDegreeUrls([]);
      
      console.log("🔍 Starting debug for doctor:", doctor.email);
      
      // First, debug storage info
      await debugStorageInfo();
      
      // Try different path combinations with better error handling
      const pathCombinations = [
        // Based on your Firebase screenshot structure
        `doctors/${doctor.email}`,
        `doctor/${doctor.email}`,
        // Email format variations
        `doctors/${doctor.email.replace('@', '_')}`,
        `doctor/${doctor.email.replace('@', '_')}`,
        `doctors/${doctor.email.replace('@', '-')}`,
        `doctor/${doctor.email.replace('@', '-')}`,
        `doctors/${doctor.email.replace(/[@.]/g, '_')}`,
        `doctor/${doctor.email.replace(/[@.]/g, '_')}`,
        // Try with userId if available
        ...(doctor.userId ? [`doctors/${doctor.userId}`, `doctor/${doctor.userId}`] : [])
      ];

      console.log("🔍 Will try these paths:", pathCombinations);

      let foundFiles = [];
      let successfulPath = null;

      for (const path of pathCombinations) {
        try {
          console.log(`🔍 Checking path: ${path}`);
          
          const folderRef = ref(storage, path);
          console.log("🔍 Reference object:", {
            bucket: folderRef._location?.bucket,
            path: folderRef._location?.path,
            fullPath: folderRef.toString()
          });

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

          const folderContents = await listAll(folderRef);
          
          console.log(`📂 Contents of ${path}:`, {
            items: folderContents.items.length,
            itemNames: folderContents.items.map(item => item.name),
            prefixes: folderContents.prefixes.length
          });

          if (folderContents.items.length > 0) {
            console.log(`✅ Found ${folderContents.items.length} files in ${path}`);
            successfulPath = path;

            // Get URLs and metadata for all files
            const filePromises = folderContents.items.map(async (itemRef) => {
              try {
                console.log(`🔍 Getting URL for: ${itemRef.name}`);
                
                // Get metadata first
                const metadata = await getMetadata(itemRef);
                console.log(`📋 Metadata for ${itemRef.name}:`, metadata);
                
                // Get download URL
                const url = await getDownloadURL(itemRef);
                console.log(`🔗 Got URL for ${itemRef.name}: ${url.substring(0, 100)}...`);
                
                return {
                  url,
                  name: itemRef.name,
                  fullPath: itemRef.fullPath,
                  size: metadata.size,
                  contentType: metadata.contentType,
                  timeCreated: metadata.timeCreated
                };
              } catch (fileError) {
                console.error(`❌ Error processing ${itemRef.name}:`, fileError);
                return {
                  error: true,
                  name: itemRef.name,
                  errorMessage: fileError.message
                };
              }
            });

            const results = await Promise.all(filePromises);
            foundFiles = results.filter(result => !result.error);
            
            const errors = results.filter(result => result.error);
            if (errors.length > 0) {
              console.log("⚠️ Some files had errors:", errors);
            }

            if (foundFiles.length > 0) {
              console.log(`✅ Successfully processed ${foundFiles.length} files`);
              break;
            }
          }
        } catch (pathError) {
          console.log(`❌ Path ${path} failed:`, {
            code: pathError.code,
            message: pathError.message,
            stack: pathError.stack?.substring(0, 200)
          });
          
          // Check for specific error types
          if (pathError.code === 'storage/unauthorized') {
            toast.error("Storage access unauthorized. Please check Firebase Storage rules.");
            break;
          } else if (pathError.code === 'storage/bucket-not-found') {
            toast.error("Storage bucket not found. Please check Firebase configuration.");
            break;
          }
        }
      }

      if (foundFiles.length > 0) {
        console.log("🎉 Final success! Files found:", foundFiles);
        console.log("📋 Setting modal state - currentDoctor:", currentDoctor);
        console.log("📋 Setting modal state - foundFiles:", foundFiles);
        
        setCurrentDegreeUrls(foundFiles);
        setDegreeModalOpen(true);
        
        // Debug: Check if modal state is being set
        setTimeout(() => {
          console.log("🔍 Modal state after setting:", {
            degreeModalOpen: degreeModalOpen,
            currentDegreeUrls: currentDegreeUrls.length,
            currentDoctor: currentDoctor?.name
          });
        }, 100);
        
        console.log("✅ Modal should be opening now!");
      } else {
        console.log("❌ No files found in any path");
        toast.error(
          `No documents found for ${doctor.name}. Debug info logged to console.`
        );
      }

    } catch (error) {
      console.error("💥 General error:", error);
      toast.error("Failed to load documents: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to approve this doctor?")) {
      try {
        setProcessing(true);
        await updateDoc(doc(db, 'doctors', doctorId), {
          STATUS: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: 'admin'
        });
        toast.success("Doctor approved successfully");
        setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error approving doctor:", error);
        toast.error("Failed to approve doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    const reason = window.prompt("Please provide a reason for rejection (optional):");
    if (reason !== null) {
      try {
        setProcessing(true);
        await updateDoc(doc(db, 'doctors', doctorId), {
          STATUS: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'admin',
          rejectionReason: reason || 'No reason provided'
        });
        toast.success("Doctor rejected successfully");
        setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      } catch (error) {
        console.error("Error rejecting doctor:", error);
        toast.error("Failed to reject doctor");
      } finally {
        setProcessing(false);
      }
    }
  };

  const isImageUrl = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const urlLower = url.toLowerCase();
    return imageExtensions.some(ext => urlLower.includes(ext)) || 
           url.includes('firebasestorage.googleapis.com');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        <span className="ml-2 text-purple-700">Loading pending doctors...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-purple-700 mb-6">
        Pending Doctors ({pendingDoctors.length})
      </h2>
      
      {pendingDoctors.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No pending doctors found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Education
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    <div className="text-sm text-gray-500">{doctor.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="max-h-32 overflow-y-auto">
                      {formatExperiences(doctor.experiences)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="max-h-32 overflow-y-auto">
                      {formatEducation(doctor.education)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDegree(doctor)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        disabled={processing}
                      >
                        {processing ? 'Loading...' : 'View Docs'}
                      </button>
                      <button
                        onClick={() => handleApproveDoctor(doctor.id)}
                        className="text-green-600 hover:text-green-900 px-3 py-1 rounded border border-green-600 hover:bg-green-50 disabled:opacity-50"
                        disabled={processing}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDoctor(doctor.id)}
                        className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-600 hover:bg-red-50 disabled:opacity-50"
                        disabled={processing}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={degreeModalOpen}
        onRequestClose={() => {
          console.log("🔴 Modal closing...");
          setDegreeModalOpen(false);
        }}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          },
          content: {
            background: 'white',
            borderRadius: '8px',
            outline: 'none',
            border: 'none',
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflow: 'auto',
            position: 'relative',
            inset: 'auto'
          }
        }}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        onAfterOpen={() => console.log("✅ Modal opened successfully!")}
      >
        <div className="bg-white p-6 rounded-lg max-w-6xl max-h-[95vh] overflow-auto mx-auto mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Documents for {currentDoctor?.name}
              <span className="text-sm text-gray-500 ml-2">
                (Modal State: {degreeModalOpen ? 'OPEN' : 'CLOSED'}, 
                Files: {currentDegreeUrls.length})
              </span>
            </h3>
            <button 
              onClick={() => {
                console.log("🔴 Close button clicked");
                setDegreeModalOpen(false);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
            >
              &times;
            </button>
          </div>
          
          {currentDegreeUrls.length > 0 ? (
            <div className="space-y-6">
              {currentDegreeUrls.map((degreeItem, index) => {
                const url = typeof degreeItem === 'string' ? degreeItem : degreeItem.url;
                const fileName = typeof degreeItem === 'string' 
                  ? `Document ${index + 1}` 
                  : degreeItem.name || `Document ${index + 1}`;
                
                if (!url || typeof url !== 'string' || url.trim() === '') {
                  return (
                    <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <p className="text-red-600 font-semibold">Invalid document URL</p>
                      <p className="text-red-500 text-sm">Document {index + 1} has no valid URL</p>
                    </div>
                  );
                }
                
                const cleanUrl = url.trim();
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <h4 className="font-semibold text-lg text-gray-800">{fileName}</h4>
                      <p className="text-xs text-gray-500 mt-1 break-all">File Path: {degreeItem.fullPath || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Size: {degreeItem.size || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">Type: {degreeItem.contentType || 'Unknown'}</p>
                    </div>
                    
                    {isImageUrl(cleanUrl) ? (
                      <div className="mb-3">
                        <img 
                          src={cleanUrl} 
                          alt={`Education Document ${index + 1}`}
                          className="max-w-full h-auto border border-gray-300 rounded shadow-sm"
                          style={{ maxHeight: '70vh' }}
                          onLoad={() => console.log(`✅ Image loaded: ${fileName}`)}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', cleanUrl);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{ display: 'none' }} className="text-center py-8 bg-red-100 rounded border border-red-200">
                          <p className="text-red-600 font-semibold">Unable to display image</p>
                          <p className="text-sm text-red-500 mt-2">
                            The image may be corrupted, in an unsupported format, or the URL may be invalid
                          </p>
                          <p className="text-xs text-gray-500 mt-2 break-all">URL: {cleanUrl}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-4 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-blue-800">This appears to be a document file (not an image)</p>
                        <p className="text-sm text-blue-600 mt-1">Click "Open Document" below to view</p>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <a 
                        href={cleanUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                      >
                        Open Document
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No documents found for this doctor</p>
              <p className="text-sm text-gray-500 mt-2">
                Check the browser console for detailed debug information
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PendingDoctors;