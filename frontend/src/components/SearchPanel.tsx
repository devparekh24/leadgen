import React, { useState } from 'react';
import { Search, MapPin, Briefcase, Filter, X } from 'lucide-react';
import './SearchPanel.css';

interface SearchPanelProps {
  onSearch: (filters: any) => void;
  isLoading: boolean;
}

export default function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    industry: '',
    minEmployees: '',
    maxEmployees: '',
    minRevenue: '',
    maxRevenue: '',
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      industry: '',
      minEmployees: '',
      maxEmployees: '',
      minRevenue: '',
      maxRevenue: '',
    });
  };

  return (
    <div className="glass-card search-panel">
      <div className="search-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Filter size={20} />
          Lead Filters
        </h2>
        <button className="btn-icon">
          {isExpanded ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSearch} className="search-form mt-4">
          <div className="form-group">
            <label className="form-label">Keyword / Company</label>
            <div className="input-with-icon">
              <Search size={18} className="input-icon" />
              <input type="text" name="keyword" value={filters.keyword} onChange={handleChange} className="form-input w-full" placeholder="e.g. Acme Corp" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Industry</label>
            <div className="input-with-icon">
              <Briefcase size={18} className="input-icon" />
              <select name="industry" value={filters.industry} onChange={handleChange} className="form-select w-full">
                <option value="">Any Industry</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="IT Services">IT Services</option>
                <option value="Landscaping">Landscaping</option>
                <option value="Dental">Dental</option>
                <option value="Auto Repair">Auto Repair</option>
                <option value="Restaurants">Restaurants</option>
                <option value="Legal">Legal</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Construction">Construction</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="input-with-icon">
              <MapPin size={18} className="input-icon" />
              <input type="text" name="location" value={filters.location} onChange={handleChange} className="form-input w-full" placeholder="e.g. Austin, TX" />
            </div>
          </div>

          <div className="range-group">
            <div className="form-group">
              <label className="form-label">Min Employees</label>
              <input type="number" name="minEmployees" value={filters.minEmployees} onChange={handleChange} className="form-input w-full" placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Max Employees</label>
              <input type="number" name="maxEmployees" value={filters.maxEmployees} onChange={handleChange} className="form-input w-full" placeholder="1000+" />
            </div>
          </div>

          <div className="range-group">
            <div className="form-group">
              <label className="form-label">Min Rev (M)</label>
              <input type="number" name="minRevenue" value={filters.minRevenue} onChange={handleChange} className="form-input w-full" placeholder="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Max Rev (M)</label>
              <input type="number" name="maxRevenue" value={filters.maxRevenue} onChange={handleChange} className="form-input w-full" placeholder="50" />
            </div>
          </div>

          <div className="search-actions mt-4">
            <button type="submit" className="btn btn-primary w-full justify-center" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Leads'}
            </button>
            <button type="button" onClick={clearFilters} className="btn btn-ghost w-full justify-center mt-2">
              Clear Filters
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
