import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Upload, FileText, CheckCircle2, AlertCircle, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UploadRecord: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(searchParams.get('patientId') || '');
  const [category, setCategory] = useState('diagnosis');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get('/api/patients')
      .then((res) => {
        const all: any[] = res.data.data || [];
        setPatients(all);
        if (!selectedPatientId && all.length > 0) {
          setSelectedPatientId(String(all[0].id));
        }
      })
      .catch((err) => console.error('Failed to load patients', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 10 * 1024 * 1024) {
        setError('File exceeds 10MB limit.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient.');
      return;
    }
    if (!file) {
      setError('Please select a document file to encrypt and upload.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('patientId', selectedPatientId);
      formData.append('category', category);
      formData.append('notes', notes);

      const res = await api.post('/api/records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      setFile(null);
      setNotes('');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          to="/doctor/dashboard"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Medical Document</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document is encrypted with AES-256-GCM off-chain and hashed to the MedicalRecords smart contract
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <h4 className="font-bold text-sm">
              Medical Record Created & Registered on Blockchain!
            </h4>
          </div>
          <p className="text-xs opacity-90">
            Document successfully encrypted and stored off-chain. SHA-256 hash has been immutably committed on-chain.
          </p>
          <div className="p-3 bg-white/80 rounded-xl font-mono text-[11px] space-y-1">
            <div>
              <span className="text-slate-400 font-sans">Record UUID: </span>
              <span className="font-bold text-slate-800">{result.data?.record_uuid || result.data?.id}</span>
            </div>
            {result.txHash && (
              <div>
                <span className="text-slate-400 font-sans">Blockchain Tx Hash: </span>
                <span className="text-teal-700 break-all">{result.txHash}</span>
              </div>
            )}
            {result.data?.file_hash && (
              <div>
                <span className="text-slate-400 font-sans">SHA-256 Document Digest: </span>
                <span className="text-slate-700 break-all">{result.data.file_hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <Card title="Record Details & Document Payload">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Patient</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-teal-500 font-medium text-slate-800"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.patient_code}) &bull; Blood: {p.blood_type || 'N/A'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Record Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-teal-500 font-medium text-slate-800"
            >
              <option value="diagnosis">Diagnosis Report</option>
              <option value="prescription">Prescription</option>
              <option value="lab_report">Laboratory Test Report</option>
              <option value="medical_history">Medical History Summary</option>
              <option value="consultation">Physician Consultation Notes</option>
              <option value="discharge_summary">Discharge Summary</option>
            </select>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Medical Document File (PDF, Images, or Reports up to 10MB)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-teal-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 cursor-pointer transition">
              <input
                type="file"
                id="docUpload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
              />
              <label htmlFor="docUpload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800 text-xs block">{file.name}</span>
                    <span className="text-[10px] text-teal-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready for AES-256 encryption
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-slate-700 text-xs">
                      Click to browse or drag & drop medical document
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      PDF, DOCX, PNG, JPG (Max 10 MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add physician diagnostic findings, dosage instructions, or recommendations..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <Shield className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Zero plaintext data on blockchain. Only SHA-256 hash & record identifier will be committed.</span>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Encrypting & Committing to Blockchain...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Encrypt, Hash & Register Medical Record
              </>
            )}
          </button>
        </form>
      </Card>
    </div>
  );
};

