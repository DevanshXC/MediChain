import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { CheckCircle2, XCircle, AlertCircle, Shield, Search, FileCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const VerifyDocument: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [recordIdInput, setRecordIdInput] = useState('');
  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const patientId = (user as any)?.patient_id || user?.id;

  useEffect(() => {
    // If navigated with state
    if (location.state?.recordId) {
      setRecordIdInput(location.state.recordId);
      performVerification(location.state.recordId);
    }

    // Load patient's records for quick dropdown selection
    if (patientId) {
      api.get(`/api/records/patient/${patientId}`)
        .then((res) => setPatientRecords(res.data.data || []))
        .catch(() => {});
    }
  }, [location, patientId]);

  const performVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      const res = await api.post('/api/records/verify', {
        recordId: idToVerify.trim(),
      });

      setResult(res.data.data || res.data);
    } catch (err: any) {
      setResult({
        status: 'NOT_FOUND',
        error: err?.response?.data?.error || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(recordIdInput);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Document Authenticity Verification</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify cryptographic integrity against immutable hashes registered in the MedicalRecords smart contract
        </p>
      </div>

      {/* Input Card */}
      <Card title="Verify Record Authenticity" subtitle="Enter record identifier or select from your medical files">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Document or Enter Record ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recordIdInput}
                onChange={(e) => setRecordIdInput(e.target.value)}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000 or Record #1"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-teal-500"
              />
              <button
                type="submit"
                disabled={loading || !recordIdInput.trim()}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                Verify Integrity
              </button>
            </div>
          </div>

          {patientRecords.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Or quick-select from your records:</span>
              <div className="flex flex-wrap gap-2">
                {patientRecords.slice(0, 6).map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => {
                      const id = rec.record_uuid || String(rec.id);
                      setRecordIdInput(id);
                      performVerification(id);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/80 rounded-lg text-xs font-medium transition text-left truncate max-w-[220px]"
                  >
                    {rec.original_filename}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Verification Result Card */}
      {result && (
        <Card title="Verification Result" subtitle="Cryptographic SHA-256 vs On-Chain Hash Evaluation">
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`p-6 rounded-2xl border flex items-center gap-4 ${
                result.status === 'VERIFIED'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : result.status === 'TAMPERED'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="shrink-0">
                {result.status === 'VERIFIED' && (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                )}
                {result.status === 'TAMPERED' && (
                  <XCircle className="w-12 h-12 text-rose-600" />
                )}
                {result.status === 'NOT_FOUND' && (
                  <AlertCircle className="w-12 h-12 text-amber-600" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-75">
                  Verification Verdict
                </span>
                <h3 className="text-xl font-extrabold tracking-tight">
                  {result.status === 'VERIFIED' && 'VERIFIED — Document is Authentic & Intact'}
                  {result.status === 'TAMPERED' && 'TAMPERED — Hash Mismatch Detected!'}
                  {result.status === 'NOT_FOUND' && 'NOT FOUND — No Matching Record Found'}
                </h3>
                <p className="text-xs opacity-85 mt-1 leading-relaxed">
                  {result.status === 'VERIFIED' &&
                    'The decrypted file hash perfectly matches the cryptographic digest committed to the blockchain. No unauthorized alteration has occurred.'}
                  {result.status === 'TAMPERED' &&
                    'Warning: The file contents on off-chain storage have been modified or corrupted compared to the smart contract commitment.'}
                  {result.status === 'NOT_FOUND' &&
                    'No record matching this identifier was found in the database or smart contract registry.'}
                </p>
              </div>
            </div>

            {/* Hash Comparison Table */}
            {result.status !== 'NOT_FOUND' && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Cryptographic Hash Analysis
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">
                      Registered Blockchain Hash (Smart Contract)
                    </span>
                    <span className="font-semibold text-teal-700 break-all">
                      {result.onChainHash || result.originalHash}
                    </span>
                  </div>

                  <div className="w-full h-px bg-slate-200"></div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans uppercase">
                      Computed File Hash (AES-256-GCM Decrypted Content)
                    </span>
                    <span className="font-semibold text-slate-800 break-all">
                      {result.currentHash}
                    </span>
                  </div>

                  {result.txHash && (
                    <>
                      <div className="w-full h-px bg-slate-200"></div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans uppercase">
                          Blockchain Transaction Reference
                        </span>
                        <span className="text-slate-500 break-all">{result.txHash}</span>
                      </div>
                    </>
                  )}

                  <div className="w-full h-px bg-slate-200"></div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                    <span>Verified At: {new Date(result.verifiedAt).toLocaleString()}</span>
                    <span className="text-teal-600 font-semibold flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Ethers.js v6 &bull; Hardhat Node
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

