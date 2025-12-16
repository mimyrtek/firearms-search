'use client';

import { useState } from 'react';

interface LicenceHolder {
  holder_id: string;
  licence_number_raw: string;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: string;
  address_line: string;
  town: string;
  postcode: string;
  phone: string;
  email: string;
  licence_type: string;
  valid_from: string;
  valid_to: string;
}

interface Firearm {
  firearm_id: string;
  serial_number_raw: string;
  make: string;
  model: string;
  calibre: string;
  type: string;
  action: string;
  barrel_length_mm: number;
  chamber_size_mm: number;
  manufacture_year: number;
  condition: string;
  notes: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [holders, setHolders] = useState<LicenceHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHolder, setSelectedHolder] = useState<string | null>(null);
  const [firearms, setFirearms] = useState<Firearm[]>([]);
  const [loadingFirearms, setLoadingFirearms] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    setSelectedHolder(null);
    setFirearms([]);
    
    if (term.length < 2) {
      setHolders([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/licence-holders/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setHolders(data.holders || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFirearms = async (holderId: string) => {
    if (selectedHolder === holderId) {
      setSelectedHolder(null);
      setFirearms([]);
      return;
    }

    setSelectedHolder(holderId);
    setLoadingFirearms(true);
    try {
      const response = await fetch(`/api/licence-holders/${holderId}/firearms`);
      const data = await response.json();
      setFirearms(data.firearms || []);
    } catch (error) {
      console.error('Failed to load firearms:', error);
      setFirearms([]);
    } finally {
      setLoadingFirearms(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Search Licence Holders</h1>
      
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-6"
      />

      {loading && <p>Searching...</p>}

      <div className="space-y-4">
        {holders.map((holder) => (
          <div key={holder.holder_id}>
            <div 
              className="border rounded-lg p-4 bg-white shadow cursor-pointer hover:bg-gray-50"
              onClick={() => loadFirearms(holder.holder_id)}
            >
              <h3 className="font-bold text-lg">{holder.full_name}</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p><span className="font-semibold">Licence:</span> {holder.licence_number_raw}</p>
                <p><span className="font-semibold">DOB:</span> {holder.dob}</p>
                <p><span className="font-semibold">Type:</span> {holder.licence_type}</p>
                <p><span className="font-semibold">Valid:</span> {holder.valid_from} to {holder.valid_to}</p>
                <p><span className="font-semibold">Email:</span> {holder.email}</p>
                <p><span className="font-semibold">Phone:</span> {holder.phone}</p>
                <p className="col-span-2"><span className="font-semibold">Address:</span> {holder.address_line}</p>
                <p><span className="font-semibold">Town:</span> {holder.town}</p>
                <p><span className="font-semibold">Postcode:</span> {holder.postcode}</p>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                {selectedHolder === holder.holder_id ? '▼ Hide firearms' : '▶ Click to view firearms'}
              </p>
            </div>

            {selectedHolder === holder.holder_id && (
              <div className="ml-8 mt-2 border-l-2 border-blue-500 pl-4">
                {loadingFirearms && <p className="text-sm">Loading firearms...</p>}
                
                {!loadingFirearms && firearms.length === 0 && (
                  <p className="text-sm text-gray-500">No firearms registered</p>
                )}

                {!loadingFirearms && firearms.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-md">Firearms ({firearms.length})</h4>
                    {firearms.map((firearm) => (
                      <div key={firearm.firearm_id} className="bg-gray-50 border rounded p-3 text-sm">
                        <h5 className="font-bold">{firearm.make} {firearm.model}</h5>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <p><span className="font-semibold">Serial:</span> {firearm.serial_number_raw}</p>
                          <p><span className="font-semibold">Calibre:</span> {firearm.calibre}</p>
                          <p><span className="font-semibold">Type:</span> {firearm.type}</p>
                          <p><span className="font-semibold">Action:</span> {firearm.action}</p>
                          <p><span className="font-semibold">Barrel:</span> {firearm.barrel_length_mm}mm</p>
                          <p><span className="font-semibold">Chamber:</span> {firearm.chamber_size_mm}mm</p>
                          <p><span className="font-semibold">Year:</span> {firearm.manufacture_year}</p>
                          <p><span className="font-semibold">Condition:</span> {firearm.condition}</p>
                          {firearm.notes && (
                            <p className="col-span-2"><span className="font-semibold">Notes:</span> {firearm.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && searchTerm.length >= 2 && holders.length === 0 && (
        <p className="text-gray-500 text-center mt-8">No licence holders found</p>
      )}
    </div>
  );
}
