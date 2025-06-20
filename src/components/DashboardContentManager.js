import React, { useState, useEffect } from 'react';
import { collection, doc, deleteDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-toastify';

const DashboardContentManager = () => {
  const [activeContentTab, setActiveContentTab] = useState('articles');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedContent, setExpandedContent] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    publishedAt: ''
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  const contentTypes = {
    articles: { collection: 'articles', title: 'Articles' },
    patient_stories: { collection: 'patient_stories', title: 'Patient Stories' }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, contentTypes[activeContentTab].collection),
      (snapshot) => {
        const contentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate() || null
        }));
        setContents(contentsData);
        setLoading(false);
      },
      (error) => {
        toast.error(`Failed to fetch ${contentTypes[activeContentTab].title}: ${error.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeContentTab]);

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${contentTypes[activeContentTab].title.toLowerCase()}?`)) {
      try {
        await deleteDoc(doc(db, contentTypes[activeContentTab].collection, id));
        toast.success("Content deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete content: " + error.message);
      }
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content.id);
    setEditForm({
      title: content.title,
      content: content.content,
      publishedAt: content.publishedAt?.toISOString().split('T')[0] || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(
        doc(db, contentTypes[activeContentTab].collection, editingContent),
        {
          title: editForm.title,
          content: editForm.content,
          publishedAt: new Date(editForm.publishedAt)
        }
      );
      toast.success("Content updated successfully!");
      setEditingContent(null);
    } catch (error) {
      toast.error("Failed to update content: " + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingContent(null);
  };

  const nextItem = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === contents.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevItem = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? contents.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-purple-700 mb-4">Content Management</h3>
      
      <div className="flex space-x-2 mb-6">
        {Object.keys(contentTypes).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveContentTab(tab);
              setExpandedContent(null);
              setEditingContent(null);
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeContentTab === tab 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {contentTypes[tab].title}
          </button>
        ))}
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-4">Existing {contentTypes[activeContentTab].title}</h4>
        
        {loading && contents.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading content...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-8 bg-gray-100 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 mt-2">No {contentTypes[activeContentTab].title.toLowerCase()} found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation controls */}
            {contents.length > 1 && (
              <div className="flex justify-between mb-4">
                <button 
                  onClick={prevItem}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Previous
                </button>
                <button 
                  onClick={nextItem}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Current content display */}
            <div className="border border-gray-200 rounded-lg p-6">
              {editingContent === contents[currentIndex]?.id ? (
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Content</label>
                    <textarea
                      name="content"
                      value={editForm.content}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows="6"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Published Date</label>
                    <input
                      type="date"
                      name="publishedAt"
                      value={editForm.publishedAt}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {contents[currentIndex]?.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={contents[currentIndex].imageUrl} 
                        alt={contents[currentIndex].title} 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h5 className="font-medium text-lg mb-2">{contents[currentIndex]?.title}</h5>
                  <p className="text-sm text-gray-500 mb-3">
                    Published: {contents[currentIndex]?.publishedAt?.toLocaleDateString() || 'Not specified'}
                  </p>
                  <div className="text-gray-700 mb-4">
                    {expandedContent === contents[currentIndex]?.id ? (
                      <p>{contents[currentIndex]?.content}</p>
                    ) : (
                      <p className="line-clamp-3">{contents[currentIndex]?.content}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setExpandedContent(expandedContent === contents[currentIndex]?.id ? null : contents[currentIndex]?.id)}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        {expandedContent === contents[currentIndex]?.id ? 'Show Less' : 'Read More'}
                      </button>
                      <button
                        onClick={() => handleEdit(contents[currentIndex])}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(contents[currentIndex]?.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Dots indicator */}
            {contents.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {contents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentIndex ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to item ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContentManager;