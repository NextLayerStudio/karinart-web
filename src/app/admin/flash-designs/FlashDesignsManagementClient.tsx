'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { isValidImageFile, formatFileSize } from '@/app/lib/clientImageUpload';

export type FlashDesignItem = {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  reserved: boolean;
  createdAt: string;
  updatedAt: string;
};

interface FlashDesignsManagementClientProps {
  flashDesigns: FlashDesignItem[];
  username: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'compressing' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function FlashDesignsManagementClient({
  flashDesigns: initialFlashDesigns,
  username
}: FlashDesignsManagementClientProps) {
  const [flashDesigns, setFlashDesigns] = useState<FlashDesignItem[]>(initialFlashDesigns);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePrices, setFilePrices] = useState<{ [key: number]: string }>({});
  const [fileNames, setFileNames] = useState<{ [key: number]: string }>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDesign, setEditingDesign] = useState<FlashDesignItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editReserved, setEditReserved] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => isValidImageFile(file));

    if (validFiles.length > 10) {
      alert('Maximálne 10 súborov môže byť vybraných naraz');
      return;
    }

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      // Initialize prices and names for new files
      const newPrices = { ...filePrices };
      const newNames = { ...fileNames };
      validFiles.forEach((file, index) => {
        const fileIndex = prev.length + index;
        if (!newPrices[fileIndex]) {
          newPrices[fileIndex] = '';
        }
        if (!newNames[fileIndex]) {
          // Initialize with filename without extension
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          newNames[fileIndex] = nameWithoutExt;
        }
      });
      setFilePrices(newPrices);
      setFileNames(newNames);
      return newFiles;
    });
  }, [filePrices, fileNames]);

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePrices(prev => {
      const newPrices = { ...prev };
      delete newPrices[index];
      // Reindex prices
      const reindexed: { [key: number]: string } = {};
      let newIndex = 0;
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex !== index) {
          reindexed[newIndex] = prev[oldIndex];
          newIndex++;
        }
      });
      return reindexed;
    });
    setFileNames(prev => {
      const newNames = { ...prev };
      delete newNames[index];
      // Reindex names
      const reindexed: { [key: number]: string } = {};
      let newIndex = 0;
      Object.keys(prev).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex !== index) {
          reindexed[newIndex] = prev[oldIndex];
          newIndex++;
        }
      });
      return reindexed;
    });
  };

  const handlePriceChange = (index: number, value: string) => {
    setFilePrices(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleNameChange = (index: number, value: string) => {
    setFileNames(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const uploadImage = async (file: File, title: string, price: number) => {
    try {
      // Create form data with file, title, and price
      // Server will handle compression and WebP conversion
      const formData = new FormData();
      formData.append('files', file);
      formData.append('titles', title || file.name.replace(/\.[^/.]+$/, ''));
      formData.append('prices', price.toString());

      const response = await fetch('/api/flash-designs/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success || !responseData.uploaded || responseData.uploaded.length === 0) {
        throw new Error(responseData.error || 'Nahrávanie zlyhalo');
      }

      // Fetch the full design data to get all fields
      const designId = responseData.uploaded[0].id;
      const designResponse = await fetch('/api/flash-designs');
      const allDesigns = await designResponse.json();
      const newDesign = allDesigns.find((d: FlashDesignItem) => d.id === designId);

      if (newDesign) {
        return newDesign;
      }

      // Fallback if fetch fails - use data from response
      const uploadedData = responseData.uploaded[0];
      const newDesignFallback: FlashDesignItem = {
        id: uploadedData.id,
        imageUrl: uploadedData.imageUrl,
        title: title,
        price: price,
        reserved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return newDesignFallback;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Validate all prices
    const invalidPrices: number[] = [];
    selectedFiles.forEach((_, index) => {
      const priceStr = filePrices[index] || '';
      const price = parseFloat(priceStr);
      if (!priceStr || isNaN(price) || price < 0) {
        invalidPrices.push(index + 1);
      }
    });

    if (invalidPrices.length > 0) {
      alert(`Chyba: Neplatné ceny pre súbory: ${invalidPrices.join(', ')}. Prosím, zadajte platnú cenu (kladné číslo).`);
      return;
    }

    setIsUploading(true);
    setUploadProgress([]);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const title = fileNames[i] || file.name.replace(/\.[^/.]+$/, ''); // Use custom name or fallback to filename
      const priceStr = filePrices[i] || '0';
      const price = parseFloat(priceStr);
      
      // Add to progress
      setUploadProgress(prev => [...prev, {
        file,
        progress: 0,
        status: 'compressing'
      }]);

      try {
        // Update progress to compressing
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'compressing', progress: 25 } : item
        ));

        // Simulate compression progress
        const compressionInterval = setInterval(() => {
          setUploadProgress(prev => prev.map((item, index) => 
            index === i && item.progress < 50 ? { ...item, progress: item.progress + 5 } : item
          ));
        }, 100);

        // Update progress to uploading
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'uploading', progress: 50 } : item
        ));

        // Upload image
        const newDesign = await uploadImage(file, title, price);
        
        clearInterval(compressionInterval);
        
        setFlashDesigns(prev => [newDesign, ...prev]);
        
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'completed', progress: 100 } : item
        ));

      } catch (error) {
        setUploadProgress(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Nahrávanie zlyhalo' } : item
        ));
      }
    }

    setSelectedFiles([]);
    setFilePrices({});
    setFileNames({});
    setIsUploading(false);
  };

  const handleDelete = async (designId: string) => {
    if (!confirm('Ste si istí, že chcete vymazať tento dizajn?')) {
      return;
    }

    try {
      const response = await fetch(`/api/flash-designs/${designId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setFlashDesigns(prev => prev.filter(design => design.id !== designId));
      } else {
        console.error('Failed to delete design');
        alert('Nepodarilo sa vymazať dizajn');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Chyba pri mazaní dizajnu');
    }
  };

  const handleEdit = (design: FlashDesignItem) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditPrice(design.price.toString());
    setEditReserved(design.reserved || false);
  };

  const handleSaveEdit = async () => {
    if (!editingDesign) return;

    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      alert('Neplatná cena. Musí to byť kladné číslo.');
      return;
    }

    try {
      const response = await fetch(`/api/flash-designs/${editingDesign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          price: price,
          reserved: editReserved,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFlashDesigns(prev => prev.map(design => 
          design.id === editingDesign.id ? result.design : design
        ));
        setEditingDesign(null);
        setEditTitle('');
        setEditPrice('');
        setEditReserved(false);
      } else {
        console.error('Failed to update design');
        alert('Nepodarilo sa aktualizovať dizajn');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Chyba pri aktualizácii dizajnu');
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Stats and Upload */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats */}
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                      <p className="ml-3 text-white">Flash dizajny</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{flashDesigns.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Nahrať Flash Dizajny
                </h3>
                <div 
                  onDragOver={handleDrag}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-[#c2a4df] transition-colors"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/heic,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 mx-auto text-white/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h2a4 4 0 014 4v1m-4 8l-4-4m0 0l-4 4m4-4v12"></path></svg>
                    <p className="text-white font-semibold">Kliknite pre výber súborov</p>
                    <p className="text-xs text-white/50 mt-1">alebo potiahnite súbory sem</p>
                  </label>
                </div>
                <p className="text-xs text-white/50 mt-2 text-center">Podporované formáty: JPG, PNG, HEIC, HEIF, WebP (max. 10MB)</p>
                <p className="text-xs text-[#c2a4df] mt-1 text-center">Obrázky sa automaticky stlačia na WebP</p>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="bg-black/30 p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/80 text-sm truncate w-3/5">{file.name}</span>
                          <button onClick={() => removeSelectedFile(index)} className="text-red-500 hover:text-red-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                        <p className="text-xs text-white/60 mb-2">{formatFileSize(file.size)}</p>
                        <div className="mb-2">
                          <label className="text-white/80 text-sm">Názov:</label>
                          <input
                            type="text"
                            value={fileNames[index] || ''}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            placeholder="Zadajte názov dizajnu"
                            className="w-full mt-1 px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#c2a4df]"
                          />
                        </div>
                        <div>
                          <label className="text-white/80 text-sm">Cena (€):</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={filePrices[index] || ''}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            placeholder="0.00"
                            className="w-full mt-1 px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#c2a4df]"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-2 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? 'Nahrávam...' : `Nahrať ${selectedFiles.length} ${selectedFiles.length === 1 ? 'súbor' : 'súborov'}`}
                    </button>
                  </div>
                )}
                
                {uploadProgress.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {uploadProgress.map((item, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between items-center mb-1">
                           <p className="text-white/80 truncate w-3/5">{item.file.name}</p>
                           {item.status === 'error' ? (
                             <p className="text-red-400">Chyba</p>
                           ) : item.status === 'completed' ? (
                             <p className="text-green-400">Hotovo</p>
                           ) : (
                             <p className="text-yellow-400">{item.status === 'compressing' ? 'Spracovávam...' : 'Nahrávam...'}</p>
                           )}
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                        {item.error && <p className="text-red-500 text-xs mt-1">{item.error}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Design Gallery */}
            <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Galéria Flash Dizajnov</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {flashDesigns.map((design) => (
                  <div key={design.id} className="relative group aspect-square">
                    <Image
                      src={design.imageUrl}
                      alt={design.title}
                      fill
                      className="rounded-lg object-cover"
                    />
                    {design.reserved && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                        Rezervované
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 rounded-b-lg">
                      <p className="text-white font-semibold text-sm">€{design.price.toFixed(2)}</p>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-lg">
                      <button
                        onClick={() => handleEdit(design)}
                        className="text-white bg-blue-600/80 hover:bg-blue-600 rounded-full p-2"
                        title="Upraviť"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(design.id)}
                        className="text-white bg-red-600/80 hover:bg-red-600 rounded-full p-2"
                        title="Vymazať"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {flashDesigns.length === 0 && (
                <div className="text-center py-12 text-white/50">Žiadne flash dizajny v galérii.</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal - Outside main content for proper viewport positioning */}
      {editingDesign && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="bg-black/90 border border-[#c2a4df]/20 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Upraviť Dizajn</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-1">Názov</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-1">Cena (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#c2a4df]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reserved"
                  checked={editReserved}
                  onChange={(e) => setEditReserved(e.target.checked)}
                  className="w-4 h-4 text-[#c2a4df] bg-black/50 border-white/20 rounded focus:ring-[#c2a4df] focus:ring-2"
                />
                <label htmlFor="reserved" className="text-white/80 text-sm">
                  Rezervované
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  Uložiť
                </button>
                <button
                  onClick={() => {
                    setEditingDesign(null);
                    setEditTitle('');
                    setEditPrice('');
                    setEditReserved(false);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Zrušiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
