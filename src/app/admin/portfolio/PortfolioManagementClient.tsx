'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { uploadImageToBlob, isValidImageFile, formatFileSize } from '@/app/lib/clientImageUpload';

export type ImageItem = {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: string;
};

export type FreeDesignItem = {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  reserved: boolean;
  createdAt: string;
  updatedAt: string;
};

interface PortfolioManagementClientProps {
  tattooImages: ImageItem[];
  beautyImages: ImageItem[];
  freeDesigns: FreeDesignItem[];
  username: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'compressing' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function PortfolioManagementClient({
  tattooImages: initialTattooImages,
  beautyImages: initialBeautyImages,
  freeDesigns: initialFreeDesigns,
  username
}: PortfolioManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'tattoo' | 'beauty' | 'freeDesigns'>('tattoo');
  const [tattooImages, setTattooImages] = useState<ImageItem[]>(initialTattooImages);
  const [beautyImages, setBeautyImages] = useState<ImageItem[]>(initialBeautyImages);
  const [freeDesigns, setFreeDesigns] = useState<FreeDesignItem[]>(initialFreeDesigns);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<FreeDesignItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReserved, setEditReserved] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync active tab with URL search param `tab`
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab === 'tattoo' || tab === 'beauty' || tab === 'freeDesigns') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => isValidImageFile(file));

    if (validFiles.length > 10) {
      alert('Maximálne 10 súborov môže byť vybraných naraz');
      return;
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File) => {
    try {
      let endpoint: string;
      if (activeTab === 'tattoo') {
        endpoint = '/api/portfolio/upload';
      } else if (activeTab === 'beauty') {
        endpoint = '/api/beauty/upload';
      } else {
        endpoint = '/api/free-designs/upload';
      }
      
      const result = await uploadImageToBlob(file, endpoint);
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Nahrávanie zlyhalo');
      }

      // Create the new image/design object
      if (activeTab === 'freeDesigns') {
        const newDesign: FreeDesignItem = {
          id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID until we get the real one
          imageUrl: result.url,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
          description: '',
          reserved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setFreeDesigns(prev => [newDesign, ...prev]);
      } else {
        const newImage: ImageItem = {
          id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID until we get the real one
          imageUrl: result.url,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for title
          createdAt: new Date().toISOString(),
        };

        // Add to the appropriate list
        if (activeTab === 'tattoo') {
          setTattooImages(prev => [newImage, ...prev]);
        } else {
          setBeautyImages(prev => [newImage, ...prev]);
        }
      }

      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress([]);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
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

        // Upload image using our improved function
        await uploadImage(file);
        
        clearInterval(compressionInterval);
        
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
    setIsUploading(false);
  };

  const handleDelete = async (imageId: string) => {
    try {
      let endpoint: string;
      if (activeTab === 'tattoo') {
        endpoint = `/api/portfolio/${imageId}`;
      } else if (activeTab === 'beauty') {
        endpoint = `/api/beauty/${imageId}`;
      } else {
        endpoint = `/api/free-designs/${imageId}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });
      if (response.ok) {
        if (activeTab === 'tattoo') {
          setTattooImages(prev => prev.filter(img => img.id !== imageId));
        } else if (activeTab === 'beauty') {
          setBeautyImages(prev => prev.filter(img => img.id !== imageId));
        } else {
          setFreeDesigns(prev => prev.filter(design => design.id !== imageId));
        }
      } else {
        console.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (design: FreeDesignItem) => {
    setEditingDesign(design);
    setEditTitle(design.title);
    setEditDescription(design.description || '');
    setEditReserved(design.reserved || false);
  };

  const handleSaveEdit = async () => {
    if (!editingDesign) return;

    try {
      const response = await fetch(`/api/free-designs/${editingDesign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          reserved: editReserved,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFreeDesigns(prev => prev.map(design => 
          design.id === editingDesign.id ? result.design : design
        ));
        setEditingDesign(null);
        setEditTitle('');
        setEditDescription('');
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
                      <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 18"></path></svg>
                      <p className="ml-3 text-white">Tattoo obrázky</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{tattooImages.length}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-[#c2a4df]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l4 4m0 0l4-4m-4 4V3m-4 13l4 4m0 0l4-4m-4 4v-4"></path></svg>
                      <p className="ml-3 text-white">Beauty obrázky</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{beautyImages.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Nahrať {activeTab === 'tattoo' ? 'Tattoo' : activeTab === 'beauty' ? 'Beauty' : 'Voľné'} Obrázky
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
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-black/30 p-2 rounded-md text-sm">
                        <span className="text-white/80 truncate w-4/5">{file.name} ({formatFileSize(file.size)})</span>
                        <button onClick={() => removeSelectedFile(index)} className="text-red-500 hover:text-red-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
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

            {/* Right column: Image Gallery */}
            <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-[#c2a4df]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Galéria: {activeTab === 'tattoo' ? 'Tattoo' : activeTab === 'beauty' ? 'Beauty' : 'Voľné dizajny'}
              </h3>
              
              {/* Edit Modal for Free Designs */}
              {editingDesign && activeTab === 'freeDesigns' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
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
                        <label className="block text-white/80 text-sm mb-1">Popis</label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#c2a4df] h-20 resize-none"
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
                            setEditDescription('');
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

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activeTab === 'freeDesigns' ? (
                  freeDesigns.map((design) => (
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
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
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
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  (activeTab === 'tattoo' ? tattooImages : beautyImages).map((image) => (
                    <div key={image.id} className="relative group aspect-square">
                      <Image
                        src={image.imageUrl}
                        alt={image.title}
                        fill
                        className="rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="text-white bg-red-600/80 hover:bg-red-600 rounded-full p-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {(activeTab === 'tattoo' && tattooImages.length === 0) && (
                <div className="text-center py-12 text-white/50">Žiadne obrázky v galérii tetovaní.</div>
              )}
              {(activeTab === 'beauty' && beautyImages.length === 0) && (
                <div className="text-center py-12 text-white/50">Žiadne obrázky v galérii krásy.</div>
              )}
              {(activeTab === 'freeDesigns' && freeDesigns.length === 0) && (
                <div className="text-center py-12 text-white/50">Žiadne voľné dizajny v galérii.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 