import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { Plus, Check, Trash2, Calendar } from 'lucide-react';

const CATEGORIES = {
  DEV: { color: 'bg-blue-500', label: 'Development' },
  STUDY: { color: 'bg-purple-500', label: 'Study' },
  HEALTH: { color: 'bg-red-500', label: 'Health' },
  LIFE: { color: 'bg-green-500', label: 'Life' },
};

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('future-boom-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newTask, setNewTask] = useState('');
  const [category, setCategory] = useState('DEV');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const audioRef = useRef(new Audio('./boom.mp3'));

  useEffect(() => {
    localStorage.setItem('future-boom-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      text: newTask,
      category,
      completed: false,
      date: getTodayString(),
    };

    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    checkVictory(updatedTasks);
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
  };

  const checkVictory = (currentTasks) => {
    const todaysTasks = currentTasks.filter(t => t.date === getTodayString());
    if (todaysTasks.length > 0 && todaysTasks.every(t => t.completed)) {
      triggerBoom();
    }
  };

  const triggerBoom = () => {
    setShowConfetti(true);
    audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const todayTasks = tasks.filter(t => t.date === getTodayString());

  const renderWeeklyGrid = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr && t.completed);
      
      days.push(
        <div key={dateStr} className="flex flex-col items-center gap-1">
          {/* 날짜 표시에서 '일' 제거하고 숫자만 표시 */}
          <div className="text-xs text-gray-400">{d.getDate()}</div>
          <div className="w-10 h-24 bg-gray-800 rounded-full flex flex-col-reverse overflow-hidden p-1 gap-1">
            {dayTasks.map(t => (
              <div key={t.id} className={`w-full h-2 rounded-sm ${CATEGORIES[t.category].color}`} />
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6 flex flex-col items-center">
      {showConfetti && <Confetti numberOfPieces={500} recycle={false} />}
      
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
          Daily Momentum
        </h1>
        <p className="text-gray-400">Your daily missions build a powerful future.</p>
      </header>

      <form onSubmit={addTask} className="w-full max-w-md flex gap-2 mb-8">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none border border-gray-700"
        >
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Mission..."
          className="flex-1 bg-gray-800 rounded-lg px-4 py-2 outline-none border border-gray-700 focus:border-blue-500 transition"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-4 rounded-lg transition">
          <Plus />
        </button>
      </form>

      <div className="w-full max-w-md space-y-3 mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-yellow-400">TODAY</span> 
          <span className="text-sm text-gray-500 font-normal">({getTodayString()})</span>
        </h2>
        
        {todayTasks.length === 0 && (
          <div className="text-center text-gray-600 py-4">No missions active.</div>
        )}

        {todayTasks.map(task => (
          <div 
            key={task.id} 
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
              task.completed 
                ? 'bg-gray-800/50 border-gray-800 opacity-60' 
                : 'bg-gray-800 border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed 
                    ? `${CATEGORIES[task.category].color} border-transparent` 
                    : 'border-gray-500 hover:border-white'
                }`}
              >
                {task.completed && <Check size={14} />}
              </button>
              <span className={task.completed ? 'line-through text-gray-500' : ''}>
                {task.text}
              </span>
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-gray-600 hover:text-red-400">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md bg-gray-800/30 p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-300">
          <Calendar size={20} />
          Weekly Growth Log
        </h3>
        <div className="flex justify-between items-end h-32">
          {renderWeeklyGrid()}
        </div>
        <div className="text-center text-xs text-gray-500 mt-4">
          Consistent actions create your future.
        </div>
      </div>
    </div>
  );
}

export default App;
