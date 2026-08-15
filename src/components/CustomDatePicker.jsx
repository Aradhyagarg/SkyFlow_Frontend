import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

function CustomDatePicker({ value, onChange, label, placeholder, minDate }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Default base view to current month or August 2026 (matching DB seeds)
  const todayStr = new Date().toISOString().split('T')[0];
  const initialDate = value ? new Date(value) : (minDate ? new Date(minDate) : new Date());
  
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update view when minDate changes
  useEffect(() => {
    if (minDate && (!value || value < minDate)) {
      const parsed = new Date(minDate);
      setCurrentYear(parsed.getFullYear());
      setCurrentMonth(parsed.getMonth());
    }
  }, [minDate]);

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Get total days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day index of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateString = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // Format value for display (e.g., "27 Jul 26")
  const getDisplayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const d = date.getDate();
    const m = date.toLocaleString('en-US', { month: 'short' });
    const y = String(date.getFullYear()).slice(-2);
    return `${d} ${m} ${y}`;
  };

  // Generate calendar day cells
  const calendarCells = [];
  // Blank cells for days of previous month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`empty-${i}`} style={{ height: '40px', width: '40px' }}></div>);
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const cellDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    const isSelected = value === cellDateStr;
    const isToday = todayStr === cellDateStr;
    const isDisabled = minDate && cellDateStr < minDate;

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        onClick={(e) => { 
          if (isDisabled) return;
          e.stopPropagation(); 
          handleSelectDay(day); 
        }}
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          width: '40px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: isSelected ? 700 : 500,
          background: isSelected ? 'var(--color-primary)' : 'transparent',
          color: isDisabled ? 'rgba(255,255,255,0.15)' : isSelected ? '#fff' : '#e2e8f0',
          transition: 'all 0.2s',
          border: isToday ? '1px solid var(--color-primary)' : 'none',
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
        onMouseEnter={(e) => {
          if (!isSelected && !isDisabled) e.target.style.background = 'rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected && !isDisabled) e.target.style.background = 'transparent';
        }}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={containerRef}>
      <label className="form-label">{label}</label>
      <div 
        onClick={() => setIsOpen(prev => !isOpen)}
        className="form-input"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          color: value ? '#fff' : 'var(--text-muted)',
          background: '#0a0b10',
          padding: '12px 14px',
          height: '48px',
          borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          userSelect: 'none'
        }}
      >
        <CalendarIcon size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{getDisplayValue() || placeholder}</span>
      </div>

      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: '75px',
          left: 0,
          background: '#121420',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '20px',
          width: '320px',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button 
              type="button" 
              onClick={handlePrevMonth}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              {monthsList[currentMonth]} {currentYear}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Days of Week Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {daysOfWeek.map(day => (
              <span key={day} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {calendarCells}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDatePicker;
