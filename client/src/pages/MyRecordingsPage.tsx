import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Recording = {
  _id: string;
  title: string;
  createdAt: string;
  notes: { key: string; time: number }[];
  isPublic?: boolean;
};

export default function MyRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchRecordings = useCallback(async () => {
    
    if(!token)return;

    try{
      const res = await fetch('http://localhost:5050/api/recordings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setRecordings(data);
    }catch(error){
      console.error('Failed to fetch recordings:', error);
    }finally{
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if(!user || !token){
      navigate('/login');
      return;
    }

    fetchRecordings();
  }, [user, token, navigate, fetchRecordings]);

  const togglePublish = async (recordingId: string, currentPublicStatus: boolean) => {
    
    if(!token)return;

    try{

      const res = await fetch(`http://localhost:5050/api/recordings/${recordingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPublic: !currentPublicStatus }),
      });

      if(res.ok){
        alert(currentPublicStatus ? 'Recording unpublished!' : 'Recording published!');
        fetchRecordings();
      }else{
        alert('Failed to update recording');
      }
    }catch(error){
      console.error(error);
      alert('Error updating recording');
    }
  };

  const deleteRecording = async (recordingId: string) => {
    
    if(!token)return;

    try{
      const res = await fetch(`http://localhost:5050/api/recordings/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if(res.ok){
        alert('Recording deleted!');
        fetchRecordings();
        setDeleteConfirm(null);
      }else{
        alert('Failed to delete recording');
      }
    }catch(error){
      console.error(error);
      alert('Error deleting recording');
    }
  };

  if(loading){
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (

    <div className="page-container">

      {recordings.length === 0 ? (
        <div className="empty-state">
          <p>No recordings yet. Go to the Compose page to create some!</p>
        </div>
      ) : (
        <div>
          {recordings.map((recording) => (
            <div key={recording._id} className="recording-card">
              <div className="recording-info">
                <h3 className="recording-title">{recording.title}</h3>
                <div className={`recording-status ${recording.isPublic ? 'status-public' : 'status-private'}`}>
                  Status: {recording.isPublic ? 'Public' : 'Private'}
                </div>
                <p className="recording-date">
                  Created: {new Date(recording.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => navigate('/player', {
                    state: {
                      recording,
                      isReplay: true
                    }
                  })}
                  className="btn btn-primary"
                >
                  Play
                </button>

                <button
                  onClick={() => togglePublish(recording._id, recording.isPublic || false)}
                  className={`btn ${recording.isPublic ? 'btn-warning' : 'btn-primary'}`}
                >
                  {recording.isPublic ? 'Unpublish' : 'Publish'}
                </button>

                {deleteConfirm === recording._id ? (
                  <div className="delete-confirmation">
                    <button
                      onClick={() => deleteRecording(recording._id)}
                      className="btn btn-danger"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(recording._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
