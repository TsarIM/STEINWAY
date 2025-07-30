import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Recording = {
  _id: string;
  title: string;
  createdAt: string;
  notes: { key: string; time: number }[];
  user: {
    username: string;
    name: string;
    profileImage?: string;
  };
};

export default function FeedPage(){
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const fetchRecordings = useCallback(async () => {

    try{

      const res = await fetch('http://localhost:5050/api/recordings/public');
      const data = await res.json();
      setRecordings(data);

    }catch(error){
      console.error('Failed to fetch recordings:', error);

    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    if(!user || !token){
      navigate('/login');
      return;
    }

    fetchRecordings();
  }, [user, token, navigate, fetchRecordings]);

  const openPlayer = (recording: Recording) => {
    navigate('/player', {
      state: {
        recording,
        isReplay: true
      }
    });
  };

  if(loading){
    return(
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return(
    <div className="page-container feed-container">

      {recordings.length === 0 ? (
        <div className="empty-state">
          <p>no public recordings found.</p>
        </div>
      ) : (
        <div>
          {recordings.map((rec) => (
            <div key={rec._id} className="recording-card">
              <div className="user-info">
                {rec.user.profileImage ? (
                  <img
                    src={rec.user.profileImage}
                    alt={rec.user.name}
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    👤
                  </div>
                )}
                <div className="user-details">
                  <h4>{rec.user.name}</h4>
                  <p>@{rec.user.username}</p>
                </div>
              </div>
              <div className="recording-info">
                <h3 className="recording-title">{rec.title}</h3>
                <p className="recording-date">
                  {new Date(rec.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => openPlayer(rec)}
                className="btn btn-success">
              play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
