import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { pianoKeys, validPianoKeys } from '../utils/pianoKeys'; // Import both
import { playNote } from '../utils/audio';
import PianoKey from '../components/PianoKey';

type NoteEvent = {
  key: string;
  time: number;
};

type Recording = {
  _id: string;
  title: string;
  createdAt: string;
  notes: { key: string; time: number }[];
  isPublic?: boolean;
  user?: {
    username: string;
    name: string;
    profileImage?: string;
  };
};

export default function PianoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const recording = location.state?.recording as Recording;
  const isReplayMode = location.state?.isReplay || false;

  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<NoteEvent[]>([]);
  const [showStoppedControls, setShowStoppedControls] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [currentTimeouts, setCurrentTimeouts] = useState<NodeJS.Timeout[]>([]);
  const startTime = useRef(0);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
  }, [user, token, navigate]);

  const addActiveKey = useCallback((key: string) => {
    setActiveKeys(prev => new Set(prev).add(key));
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 200);
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    playNote(key);
    addActiveKey(key);

    if (isRecording) {
      const now = performance.now();
      setRecordedNotes((prev) => [...prev, { key, time: now - startTime.current }]);
    }
  }, [isRecording, addActiveKey]);

  const startRecording = () => {
    setRecordedNotes([]);
    startTime.current = performance.now();
    setIsRecording(true);
    setShowStoppedControls(false);
    setShowSaveForm(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setShowStoppedControls(true);
  };

  const stopPlayback = useCallback(() => {
    currentTimeouts.forEach(timeout => clearTimeout(timeout));
    setCurrentTimeouts([]);
    setActiveKeys(new Set());
    setIsPlaying(false);
  }, [currentTimeouts]);

  const playRecording = (notes: NoteEvent[] = recordedNotes) => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    const timeouts: NodeJS.Timeout[] = [];

    notes.forEach(({ key, time }) => {
      const timeout = setTimeout(() => {
        playNote(key);
        addActiveKey(key);
      }, time);
      timeouts.push(timeout);
    });

    setCurrentTimeouts(timeouts);

    const maxTime = Math.max(...notes.map(note => note.time));
    const endTimeout = setTimeout(() => {
      setIsPlaying(false);
      setCurrentTimeouts([]);
    }, maxTime + 500);

    timeouts.push(endTimeout);
  };

  const handleDelete = () => {
    setRecordedNotes([]);
    setTitle('');
    setShowStoppedControls(false);
    setIsRecording(false);
    setShowSaveForm(false);
  };

  const showSaveFormHandler = () => {
    setShowSaveForm(true);
  };

  const cancelSave = () => {
    setShowSaveForm(false);
    setTitle('');
  };

  const handleSave = async (isPublic = false) => {
    if (!token) return;

    const payload = {
      title,
      notes: recordedNotes,
      isPublic
    };

    try {
      const res = await fetch('http://localhost:5050/api/recordings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(`Recording saved${isPublic ? ' and published' : ''}!`);
        setTitle('');
        setRecordedNotes([]);
        setShowStoppedControls(false);
        setIsRecording(false);
        setShowSaveForm(false);
      } else {
        const error = await res.json();
        alert('Failed to save recording: ' + error.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error saving recording.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused) return;
      const key = e.key.toLowerCase();
      // Type assertion to fix the TypeScript error
      if (validPianoKeys.includes(key as any)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isInputFocused, handleKeyPress]);

  const renderButtonPanel = () => {
    if (isReplayMode && recording) {
      return (
        <div className="piano-controls">
          <button
            onClick={() => playRecording(recording.notes)}
            className={`btn ${isPlaying ? 'btn-danger' : 'btn-success'}`}
          >
            {isPlaying ? '⏹️ Stop' : '▶️ Play Recording'}
          </button>
        </div>
      );
    }

    if (isRecording) {
      return (
        <div className="piano-controls">
          <button onClick={stopRecording} className="btn btn-danger">
            Stop
          </button>
        </div>
      );
    } else if (showSaveForm) {
      return (
        <div className="piano-controls">
          <form className="form-container" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <input
              type="text"
              placeholder="Recording title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="form-input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              Save Private
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="btn btn-primary"
            >
              Save & Publish
            </button>
            <button
              type="button"
              onClick={cancelSave}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </form>
        </div>
      );
    } else if (showStoppedControls) {
      return (
        <div className="piano-controls">
          <button
            onClick={() => playRecording()}
            disabled={recordedNotes.length === 0}
            className={`btn ${recordedNotes.length === 0 ? '' : 'btn-success'}`}
          >
            Preview
          </button>
          <button onClick={handleDelete} className="btn btn-danger">
            Delete
          </button>
          <button onClick={showSaveFormHandler} className="btn btn-primary">
            Save
          </button>
        </div>
      );
    } else {
      return (
        <div className="piano-controls">
          <button onClick={startRecording} className="btn btn-success">
            Record
          </button>
        </div>
      );
    }
  };

  if (!user) return null;

  return (
    <div className="piano-container">
      <h1 className="piano-title">
        {isReplayMode && recording ? `Playing: ${recording.title}` : ''}
      </h1>

      {renderButtonPanel()}
      <br/>

      <div className="piano-keys-container">
        <div className="piano-keys">
          {pianoKeys.map(([key, type]) => (
            <PianoKey
              key={key}
              note={key}
              type={type}
              handleKeyPress={handleKeyPress}
              activeKeys={activeKeys}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
