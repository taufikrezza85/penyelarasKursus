import React, { useState, useRef, useCallback } from 'react';
import { BiodataState } from './types';
import { OFFICER_NAMES, COURSES, CLASSES_TAUGHT } from './constants';

// Make jspdf and html2canvas available from the window object
const { jsPDF } = (window as any).jspdf;

const initialClassesState = CLASSES_TAUGHT.reduce((acc, className) => {
  acc[className] = false;
  return acc;
}, {} as { [key: string]: boolean });

const initialState: BiodataState = {
  course: '',
  photo: null,
  officerName: '',
  email: '',
  qualification: '',
  field: '',
  teachingExperience: '',
  currentInstitutionExperience: '',
  courseExperience: '',
  classesTaught: initialClassesState,
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<BiodataState>(initialState);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }, []);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      classesTaught: {
        ...prevState.classesTaught,
        [name]: checked
      }
    }));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prevState => ({ ...prevState, photo: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGeneratePdf = async () => {
    if (!pdfTemplateRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await (window as any).html2canvas(pdfTemplateRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth;
      const height = width / ratio;

      // Check if content height is larger than page height
      if (height > pdfHeight) {
          console.warn("Content is too tall for a single page, it might be cut off.");
      }

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);

      const fileName = `Biodata ${formData.officerName || 'Pegawai'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedClasses = Object.entries(formData.classesTaught)
    .filter(([, isSelected]) => isSelected)
    .map(([className]) => className)
    .join(', ');

  return (
    <>
      {/* PDF Template - Hidden from view */}
      <div className="absolute -top-[9999px] -left-[9999px] bg-white text-black font-sans">
        <div ref={pdfTemplateRef} className="w-[800px] h-[1120px] p-12 flex flex-col">
            <header className="flex items-center justify-between pb-8 border-b-2 border-gray-300">
                <img src="https://i.postimg.cc/k5d6B5vt/LOGO-poli-PD.png" alt="Logo Institusi" className="w-24 h-auto" />
                <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">BIODATA AHLI KURSUS</h1>
                    <h2 className="text-xl font-semibold text-indigo-700">{formData.course || 'N/A'}</h2>
                </div>
            </header>
            <main className="flex-grow mt-10">
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-1 flex flex-col items-center pt-4">
                       {formData.photo ? (
                           <img src={formData.photo} alt={formData.officerName} className="w-48 h-48 rounded-full object-cover border-4 border-indigo-200" />
                       ) : (
                           <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                               <span>Gambar</span>
                           </div>
                       )}
                    </div>
                    <div className="col-span-2 space-y-4 text-lg">
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Nama:</strong>
                          <span className="text-gray-800">{formData.officerName || 'N/A'}</span>
                        </div>
                         <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Emel:</strong>
                          <span className="text-gray-800">{formData.email || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Kelulusan Tertinggi:</strong>
                          <span className="text-gray-800">{formData.qualification || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Bidang / Opsyen:</strong>
                          <span className="text-gray-800">{formData.field || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Pengalaman Mengajar:</strong>
                          <span className="text-gray-800">{formData.teachingExperience || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Di Institusi Semasa:</strong>
                          <span className="text-gray-800">{formData.currentInstitutionExperience || 'N/A'}</span>
                        </div>
                         <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Mengajar Kursus Ini:</strong>
                          <span className="text-gray-800">{formData.courseExperience || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <strong className="text-gray-600">Kelas Diajar:</strong>
                          <span className="text-gray-800">{selectedClasses || 'Tiada'}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
      </div>
      
      {/* Visible UI */}
      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8 flex flex-col items-center">
            <img src="https://i.postimg.cc/k5d6B5vt/LOGO-poli-PD.png" alt="Logo Institusi" className="w-24 h-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-shadow-lg">
              Pengurusan Kursus: <span className="text-purple-300">{formData.course || 'Sila Pilih'}</span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-300">
              Biodata Ahli Kursus: <span className="text-purple-300">{formData.officerName || 'Sila Pilih'}</span>
            </h2>
          </header>

          <main className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="flex flex-col items-center md:col-span-1 space-y-4">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Officer Preview" className="w-40 h-40 rounded-full object-cover border-4 border-purple-400 shadow-lg hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-700/50 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center text-center text-gray-300 hover:bg-gray-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Upload Photo</span>
                    </div>
                  )}
                </label>
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                <p className="text-xs text-gray-400 text-center">Klik pada bulatan untuk muat naik gambar.</p>
              </div>

              <div className="md:col-span-2 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Kursus</label>
                    <select name="course" value={formData.course} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                      <option value="">Pilih Kursus</option>
                      {COURSES.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Pegawai</label>
                    <select name="officerName" value={formData.officerName} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
                      <option value="">Pilih Nama</option>
                      {OFFICER_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Emel</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kelulusan Tertinggi Akademik</label>
                        <input type="text" name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Bidang / Opsyen</label>
                        <input type="text" name="field" value={formData.field} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Pengalaman Mengajar</label>
                        <input type="text" name="teachingExperience" value={formData.teachingExperience} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Cth: 10 Tahun" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Di Institusi Semasa</label>
                        <input type="text" name="currentInstitutionExperience" value={formData.currentInstitutionExperience} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Cth: 5 Tahun"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mengajar Kursus</label>
                        <input type="text" name="courseExperience" value={formData.courseExperience} onChange={handleInputChange} className="w-full bg-gray-800/50 border border-white/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" placeholder="Cth: 2 Tahun"/>
                      </div>
                  </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pilihan kelas yang di ajar</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2">
                        {CLASSES_TAUGHT.map(className => (
                            <label key={className} className="flex items-center space-x-2 text-gray-200">
                                <input type="checkbox" name={className} checked={formData.classesTaught[className]} onChange={handleCheckboxChange} className="h-4 w-4 rounded bg-gray-700 border-gray-500 text-purple-500 focus:ring-purple-600" />
                                <span>{className}</span>
                            </label>
                        ))}
                    </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 text-center">
                <button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || !formData.officerName}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                    {isGenerating ? 'Menjana...' : 'Jana PDF'}
                </button>
                 {!formData.officerName && <p className="text-xs text-red-400 mt-2">Sila pilih Nama Pegawai untuk menjana PDF.</p>}
            </div>

          </main>

          <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>© Pengurusan JKM PPD | Kegunaan Dalaman Sahaja</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
