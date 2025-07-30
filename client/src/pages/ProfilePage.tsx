import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage(){

  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    name: user?.name || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if(!user || !token){
      navigate('/login');
      return;
    }
  }, [user, token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]){
      setSelectedImage(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if(!selectedImage || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try{
      const response = await fetch('http://localhost:5050/api/upload/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if(response.ok){
        const updatedUser = { ...user!, profileImage: data.imageUrl };
        updateUser(updatedUser);
        setSelectedImage(null);
        alert('Profile image updated successfully!');
      }else{
        alert('Failed to upload image: ' + data.error);
      }
    }catch(error){
      console.error('Upload error:', error);
      alert('Failed to upload image');
    }finally{
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if(!token)return;

    try{
      const response = await fetch('http://localhost:5050/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if(response.ok){
        const updatedUser = { ...user!, ...formData };
        updateUser(updatedUser);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }else{
        alert('Failed to update profile: ' + data.error);
      }
    }catch(error){
      console.error('Update error:', error);
      alert('Failed to update profile');
    }
  };

  if(!user) return null;

  return (
    <div className="page-container profile-container">

      <div className="profile-image-section">
        {user.profileImage || user.picture ? (
          <img
            src={user.profileImage || user.picture}
            alt="Profile"
            className="profile-image"
          />
        ) : (
          <div className="profile-image-placeholder">
            👤
          </div>
        )}

        <div className="file-input">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {selectedImage && (
            <button
              onClick={uploadImage}
              disabled={uploading}
              className="btn btn-primary mt-2"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {!isEditing ? (
          <div>
            <p className="card-text"><strong>Name:</strong> {user.name}</p>
            <p className="card-text"><strong>Username:</strong> {user.username}</p>
            <p className="card-text"><strong>Email:</strong> {user.email}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary mt-2"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={handleSave} className="btn btn-success">
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    username: user.username,
                    name: user.name
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
