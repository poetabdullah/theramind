import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

const DashboardContentManager = () => {
  const [activeContentTab, setActiveContentTab] = useState('articles');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    author: 'Admin',
    publishedAt: new Date().toISOString().split('T')[0]
  });

  const contentTypes = {
    articles: { collection: 'articles', title: 'Articles' },
    patient_stories: { collection: 'patient_stories', title: 'Patient Stories' }
  };

  useEffect(() => {
    fetchContents();
  }, [activeContentTab]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, contentTypes[activeContentTab].collection));
      const contentsData = [];
      querySnapshot.forEach((doc) => {
        contentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setContents(contentsData);
    } catch (error) {
      toast.error(`Failed to fetch ${contentTypes[activeContentTab].title}: ${error.message}`);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = '';
      if (formData.image) {
        const storageRef = ref(storage, `content/${activeContentTab}/${Date.now()}_${formData.image.name}`);
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const contentData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        publishedAt: formData.publishedAt,
        imageUrl,
        createdAt: new Date()
      };

      await addDoc(collection(db, contentTypes[activeContentTab].collection), contentData);
      toast.success(`${contentTypes[activeContentTab].title} added successfully!`);
      setFormData({
        title: '',
        content: '',
        image: null,
        author: 'Admin',
        publishedAt: new Date().toISOString().split('T')[0]
      });
      fetchContents();
    } catch (error) {
      toast.error(`Failed to add content: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${contentTypes[activeContentTab].title.toLowerCase()}?`)) {
      try {
        await deleteDoc(doc(db, contentTypes[activeContentTab].collection, id));
        toast.success("Content deleted successfully!");
        fetchContents();
      } catch (error) {
        toast.error("Failed to delete content: " + error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-purple-700 mb-4">Educational Content Management</h3>
      
      <div className="flex space-x-2 mb-6">
        {Object.keys(contentTypes).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveContentTab(tab)}
            className={`px-4 py-2 rounded-lg ${activeContentTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {contentTypes[tab].title}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Content Form */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Add New {contentTypes[activeContentTab].title}</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                rows="4"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Published Date *</label>
              <input
                type="date"
                name="publishedAt"
                value={formData.publishedAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formData.image && (
                <p className="text-sm text-gray-600 mt-1">{formData.image.name}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              {loading ? 'Adding...' : `Add ${contentTypes[activeContentTab].title}`}
            </button>
          </form>
        </div>
        
        {/* Content List */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Existing {contentTypes[activeContentTab].title}</h4>
          {loading && contents.length === 0 ? (
            <div className="text-center py-8">Loading content...</div>
          ) : contents.length === 0 ? (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p>No {contentTypes[activeContentTab].title.toLowerCase()} found</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {contents.map(content => (
                <div key={content.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{content.title}</h5>
                      <p className="text-sm text-gray-600">
                        Published: {new Date(content.publishedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                  {content.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={content.imageUrl} 
                        alt={content.title} 
                        className="h-40 w-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="mt-2 text-gray-700 line-clamp-3">{content.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContentManager;