import React, { useState, useEffect } from 'react';

const BioCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
    const [bio, setBio] = useState(doctorData.bio || "");

    useEffect(() => {
        setBio(doctorData.bio || "");
    }, [doctorData, isEditing]);

    const handleSubmit = () => {
        const updatedData = {
            ...doctorData,
            bio
        };
        setDoctorData(updatedData);
        handleSave("bio", updatedData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Bio</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-indigo-200 focus:outline-none shadow-sm"
                    placeholder="Write your professional bio here..."
                />
            ) : (
                <div className="prose">
                    <p className="text-gray-800 whitespace-pre-line">{doctorData.bio || "No bio information available."}</p>
                </div>
            )}
        </div>
    );
};

export default BioCard;