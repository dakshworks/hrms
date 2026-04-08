import { useState, useEffect } from 'react'
import { getMyProfile, updateMyProfile, getFinancialDetails, updateFinancialDetails } from '../api/profile.api'
import { toast } from 'react-toastify'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('job')
  const [loading, setLoading] = useState(true)
  
  // Job Details
  const [jobDetails, setJobDetails] = useState({
    dateOfJoining: '',
    manager: '',
    managerId: '',
    designation: '',
    department: '',
    employmentType: '',
    office: '',
    location: '',
    businessUnit: '',
    experience: ''
  })

  // Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    dateOfBirth: '',
    phoneNumber: '',
    emergencyContact: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    }
  })

  // Financial Details
  const [financialDetails, setFinancialDetails] = useState(null)
  const [loadingFinancial, setLoadingFinancial] = useState(false)

  // Bank Form
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    panNumber: ''
  })
  const [editingBank, setEditingBank] = useState(false)
  const [savingBank, setSavingBank] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const profile = await getMyProfile()
      setJobDetails(profile.jobDetails || {})
      setPersonalDetails(profile.personalDetails || {})
      setFinancialDetails(profile.financialDetails || null)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadFinancialDetails = async () => {
    setLoadingFinancial(true)
    try {
      const financial = await getFinancialDetails()
      setFinancialDetails(financial)
    } catch (error) {
      console.error('Failed to load financial details:', error)
      // Endpoint might not exist yet
    } finally {
      setLoadingFinancial(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateMyProfile({
        phoneNumber: personalDetails.phoneNumber,
        dateOfBirth: personalDetails.dateOfBirth,
        address: personalDetails.address
      })
      toast.success('Profile saved successfully')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to save profile')
    }
  }

  const handleSaveFinancial = async () => {
    if (!bankForm.bankName || !bankForm.bankAccountNumber || !bankForm.ifscCode) {
      toast.error('Please fill all required fields')
      return
    }

    setSavingBank(true)
    try {
      await updateFinancialDetails(bankForm)
      toast.success('Financial details saved successfully')
      await loadFinancialDetails()
      setBankForm({ bankName: '', bankAccountNumber: '', ifscCode: '', panNumber: '' })
      setEditingBank(false)
    } catch (error) {
      console.error('Failed to save financial details:', error)
      toast.error('Failed to save financial details')
    } finally {
      setSavingBank(false)
    }
  }

  const TABS = [
    { id: 'job', label: 'Job Details' },
    { id: 'personal', label: 'Personal Information' },
    { id: 'financial', label: 'Financial Details' },
  ]

  const handleEditBank = (bank) => {
    setBankForm(bank)
    setEditingBank(true)
  }

  const handleAddBank = () => {
    setBankForm({ bankName: '', bankAccountNumber: '', ifscCode: '', panNumber: '' })
    setEditingBank(true)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#0d1f3c]">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your professional, personal, and financial details.</p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                ? 'border-[#1565c0] text-[#1565c0]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

        {/* Job Details */}
        {activeTab === 'job' && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d1f3c] mb-6">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <DetailItem label="Email" value={jobDetails.manager || '-'} />
              <DetailItem label="Date of Joining" value={jobDetails.dateOfJoining || '-'} />
              <DetailItem label="Manager" value={jobDetails.manager || '-'} />
              <DetailItem label="Designation" value={jobDetails.designation || '-'} />
              <DetailItem label="Department" value={jobDetails.department || '-'} />
              <DetailItem label="Employment Type" value={jobDetails.employmentType || '-'} />
              <DetailItem label="Office" value={jobDetails.office || '-'} />
              <DetailItem label="Location" value={jobDetails.location || '-'} />
              <DetailItem label="Business Unit" value={jobDetails.businessUnit || '-'} />
              <DetailItem label="Experience" value={jobDetails.experience || '-'} />
            </div>
          </div>
        )}

        {/* Personal Details */}
        {activeTab === 'personal' && (
          <div>
            <h2 className="text-lg font-semibold text-[#0d1f3c] mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={personalDetails.dateOfBirth || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, dateOfBirth: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={personalDetails.phoneNumber || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, phoneNumber: e.target.value})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={personalDetails.emergencyContact || ''}
                  onChange={(e) => setPersonalDetails({...personalDetails, emergencyContact: e.target.value})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={personalDetails.address?.addressLine1 || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, addressLine1: e.target.value}})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={personalDetails.address?.addressLine2 || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, addressLine2: e.target.value}})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">City</label>
                  <input
                    type="text"
                    value={personalDetails.address?.city || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, city: e.target.value}})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    value={personalDetails.address?.state || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, state: e.target.value}})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={personalDetails.address?.pincode || ''}
                    onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, pincode: e.target.value}})}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Country</label>
                <input
                  type="text"
                  value={personalDetails.address?.country || ''}
                  onChange={(e) => setPersonalDetails({...personalDetails, address: {...personalDetails.address, country: e.target.value}})}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="bg-[#1565c0] text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Financial Details */}
        {activeTab === 'financial' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#0d1f3c]">Financial Details</h2>
              {!editingBank && (
                <button
                  onClick={handleAddBank}
                  className="text-xs font-medium text-[#1565c0] hover:underline"
                >
                  {financialDetails ? 'Edit Details' : 'Add Details'}
                </button>
              )}
            </div>

            {editingBank ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankForm.bankAccountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, bankAccountNumber: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={bankForm.ifscCode}
                      onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={bankForm.panNumber}
                      onChange={(e) => setBankForm({ ...bankForm, panNumber: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-[#1565c0]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveFinancial}
                    disabled={savingBank}
                    className="text-xs font-medium bg-[#1565c0] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {savingBank ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingBank(false)
                      setBankForm({ bankName: '', bankAccountNumber: '', ifscCode: '', panNumber: '' })
                    }}
                    className="text-xs font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : !financialDetails ? (
              <div className="text-center py-10 text-gray-500">
                <p>No financial details added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565c0] font-semibold">
                      {financialDetails.bankName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0d1f3c]">{financialDetails.bankName}</p>
                      <p className="text-xs text-gray-500">{financialDetails.maskedBankAccountNumber}</p>
                      <p className="text-xs text-gray-500">IFSC: {financialDetails.ifscCode}</p>
                      <p className="text-xs text-gray-500">PAN: {financialDetails.maskedPanNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {financialDetails.active && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
      )}
    </div>
  )
}

function DetailItem({ label, value, className = '' }) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <span className="text-sm text-[#0d1f3c] font-medium">{value || '-'}</span>
    </div>
  )
}
