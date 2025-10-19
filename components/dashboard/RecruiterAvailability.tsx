'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Save, AlertCircle, Check } from 'lucide-react';

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const RecruiterAvailability: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing availability
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recruiter/availability');
      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError('Failed to load availability');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
    setAvailability([
      ...availability,
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    ]);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const deleteSlot = async (index: number) => {
    const slot = availability[index];
    
    if (slot.id) {
      // Delete from database
      try {
        await fetch(`/api/recruiter/availability/${slot.id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete slot:', err);
      }
    }
    
    // Remove from local state
    const updated = availability.filter((_, i) => i !== index);
    setAvailability(updated);
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save each slot
      for (const slot of availability) {
        if (!slot.id) {
          // Create new slot
          await fetch('/api/recruiter/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }),
          });
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Refresh to get IDs
      await fetchAvailability();
    } catch (err) {
      setError('Failed to save availability');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const applyDefaultSchedule = () => {
    // Monday to Friday, 9 AM - 5 PM
    const defaultSchedule: AvailabilitySlot[] = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
    ];
    setAvailability(defaultSchedule);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-gray-600">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Availability</h2>
            <p className="text-sm text-gray-600">Set your weekly interview schedule</p>
          </div>
        </div>
        <button
          onClick={applyDefaultSchedule}
          className="text-sm text-orange-600 hover:text-orange-400 font-medium"
        >
          Apply Default Schedule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">Availability saved successfully!</p>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {availability.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No availability set yet</p>
            <button
              onClick={addSlot}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition"
            >
              Add Your First Time Slot
            </button>
          </div>
        ) : (
          availability.map((slot, index) => (
            <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <select
                value={slot.dayOfWeek}
                onChange={(e) => updateSlot(index, 'dayOfWeek', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border rounded-lg"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>

              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />

              <span className="text-gray-500">to</span>

              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />

              <button
                onClick={() => deleteSlot(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addSlot}
          className="flex items-center gap-2 px-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition"
        >
          <Plus className="w-5 h-5" />
          Add Time Slot
        </button>

        <button
          onClick={saveAvailability}
          disabled={saving || availability.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>Note:</strong> Interview slots are created every 30 minutes within your available times. 
          Candidates can only book during these times.
        </p>
      </div>
    </div>
  );
};

export default RecruiterAvailability;