import React, { useState } from 'react';
import { UNITS, FRQ_TYPES } from '../constants';
import { Unit, FRQType } from '../types';

interface Props {
  onGenerate: (type: FRQType, unit: Unit, subTopics: string[]) => void;
}

const SelectionScreen: React.FC<Props> = ({ onGenerate }) => {
  const [selectedType, setSelectedType] = useState<FRQType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);

  const handleUnitChange = (unit: Unit) => {
    setSelectedUnit(unit);
    // Auto-select ALL sub-topics for the selected unit
    const unitData = UNITS.find(u => u.id === unit);
    if (unitData) {
        setSelectedSubTopics(unitData.subTopics.map(s => s.id));
    } else {
        setSelectedSubTopics([]);
    }
  };

  const toggleSubTopic = (id: string) => {
    if (selectedSubTopics.includes(id)) {
      setSelectedSubTopics(selectedSubTopics.filter(s => s !== id));
    } else {
      setSelectedSubTopics([...selectedSubTopics, id]);
    }
  };

  const handleGenerate = () => {
    if (selectedType && selectedUnit) {
      onGenerate(selectedType, selectedUnit, selectedSubTopics);
    }
  };

  const currentUnitData = UNITS.find(u => u.id === selectedUnit);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-indigo-900">AP Physics C: Mechanics</h1>
        <p className="text-xl text-indigo-600">Infinite FRQ Generator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FRQ Type Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">1</span>
            Select FRQ Type
          </h2>
          <div className="space-y-3">
            {FRQ_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedType === type.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-gray-500 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center mr-2">2</span>
            Select Topic
          </h2>
          <div className="space-y-3">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              onChange={(e) => handleUnitChange(e.target.value as Unit)}
              value={selectedUnit || ""}
            >
              <option value="" disabled>Select a Unit...</option>
              {UNITS.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>

            {currentUnitData && (
              <div className="mt-4 animate-fade-in-down">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remove sub-topics to exclude from the question (optional)
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {currentUnitData.subTopics.map((sub) => (
                    <label key={sub.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubTopics.includes(sub.id)}
                        onChange={() => toggleSubTopic(sub.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{sub.id} {sub.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={!selectedType || !selectedUnit}
          className={`px-8 py-4 rounded-full text-lg font-semibold text-white shadow-lg transition-all transform hover:scale-105 ${
            selectedType && selectedUnit
              ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Generate Question
        </button>
      </div>
    </div>
  );
};

export default SelectionScreen;