'use client'; 

import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Plus, Upload, CheckCircle, ChevronDown } from 'lucide-react';
import SecurityModal from './SecurityModal';
import OtpModal from './OtpModal';

const COUNTRY_RULES: Record<string, { code: string, length: number, placeholder: string }> = {
  '+591': { code: 'BO', length: 8, placeholder: 'Ej. 70000000' },
  '+51': { code: 'PE', length: 9, placeholder: 'Ej. 900000000' },
  '+54': { code: 'AR', length: 10, placeholder: 'Ej. 1100000000' },
  '+56': { code: 'CL', length: 9, placeholder: 'Ej. 900000000' },
  '+57': { code: 'CO', length: 10, placeholder: 'Ej. 3000000000' },
  '+52': { code: 'MX', length: 10, placeholder: 'Ej. 5500000000' }
};

type Phone = { id: string; code: string; number: string };
type UserData = { name: string; email: string; country: string; gender: string; address: string; avatarUrl: string; };

export default function ProfileCard() {
  
  const defaultUser = {
    name: 'Condesa',
    email: 'condesa@gmail.com',
    country: '',
    gender: '',
    address: '',
    avatarUrl: ''
  };

  const [userData, setUserData] = useState<UserData>(defaultUser);
  const [phones, setPhones] = useState<Phone[]>([{ id: '1', code: '+591', number: '' }]);

  const [editableFields, setEditableFields] = useState<{ [key: string]: boolean }>({});
  const [tempData, setTempData] = useState<UserData>(defaultUser);
  const [tempPhones, setTempPhones] = useState<Phone[]>(phones);

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Cargar datos sincronizados globalmente (INCLUYENDO TELÉFONOS) ---
  useEffect(() => {
    // 1. Cargamos datos del usuario
    const storedData = localStorage.getItem('mockUserData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUserData(parsed);
      setTempData(parsed);
    }

    // 2. Cargamos los teléfonos guardados
    const storedPhones = localStorage.getItem('mockUserPhones');
    if (storedPhones) {
      const parsedPhones = JSON.parse(storedPhones);
      setPhones(parsedPhones);
      setTempPhones(parsedPhones);
    }
  }, []);

  const maskEmail = (email: string) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email; 
    return `${local[0]}******${local[local.length - 1]}@${domain}`;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tempData.name || tempData.name.trim() === '') newErrors.name = 'El nombre es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempData.email)) newErrors.email = 'Formato de correo inválido';

    const phoneNumbers = tempPhones.map(p => p.number).filter(n => n !== '');
    const hasDuplicates = new Set(phoneNumbers).size !== phoneNumbers.length;
    
    tempPhones.forEach((phone) => {
      if (phone.number !== '') {
        if (!/^\d+$/.test(phone.number)) {
          newErrors[`phone_${phone.id}`] = 'Solo números permitidos';
        } else if (phone.number.length !== COUNTRY_RULES[phone.code].length) {
          newErrors[`phone_${phone.id}`] = `Debe tener exactamente ${COUNTRY_RULES[phone.code].length} dígitos`;
        }
      }
    });

    if (hasDuplicates) newErrors.phoneGeneral = 'No puedes registrar números duplicados';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEdit = (field: string) => {
    if (field === 'email' && !editableFields.email) {
      setIsSecurityModalOpen(true);
      return;
    }
    setEditableFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = (password: string) => {
    setIsSecurityModalOpen(false);
    setEditableFields(prev => ({ ...prev, email: true }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const imageUrl = URL.createObjectURL(file);
      const updatedUser = { ...tempData, avatarUrl: imageUrl };
      setTempData(updatedUser);
      setUserData(updatedUser);
      
      localStorage.setItem('mockUserData', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('profileUpdated'));
      showSuccess('Foto de perfil actualizada');
    }
  };

  const handleAddPhone = () => {
    if (tempPhones.length < 3) {
      setTempPhones([...tempPhones, { id: Date.now().toString(), code: '+591', number: '' }]);
    }
  };

  const executeDeletePhone = () => {
    if (phoneToDelete) {
      setTempPhones(tempPhones.filter(p => p.id !== phoneToDelete));
      setPhoneToDelete(null);
    }
  };

  const handlePhoneChange = (id: string, field: 'code' | 'number', value: string) => {
    setTempPhones(tempPhones.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSaveClick = () => {
    if (!validateForm()) return;
    if (tempData.email !== userData.email) {
      setIsOtpModalOpen(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
    setUserData(tempData);
    setPhones(tempPhones);
    setEditableFields({});
    
    // --- MAGIA DE PERSISTENCIA ACTUALIZADA ---
    localStorage.setItem('mockUserData', JSON.stringify(tempData));
    localStorage.setItem('mockUserPhones', JSON.stringify(tempPhones)); // Guardamos los teléfonos
    window.dispatchEvent(new Event('profileUpdated'));
    
    showSuccess('Datos actualizados exitosamente');
  };

  const handleOtpSubmit = (code: string) => {
    setIsOtpModalOpen(false);
    executeSave();
  };

  const handleCancel = () => {
    setTempData(userData);
    setTempPhones(phones);
    setEditableFields({});
    setErrors({});
  };

  return (
    <div className="bg-[#F9F6EE] p-4 md:p-8 rounded-xl flex flex-col md:flex-row gap-10 items-center md:items-start shadow-sm border border-stone-200">
      
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        <div 
          className="relative w-32 h-32 rounded-full border-2 border-stone-800 flex items-center justify-center bg-white cursor-pointer group hover:border-amber-600 transition-colors overflow-hidden"
          onClick={handleAvatarClick}
        >
          {userData.avatarUrl ? (
            <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-stone-500 group-hover:hidden">IMAGEN</span>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="text-white w-8 h-8" />
          </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleAvatarChange} />
        <p className="mt-4 font-bold text-lg text-stone-900 uppercase text-center">{userData.name}</p>
        <p className="text-sm text-stone-500 italic text-center">{userData.email}</p>
      </div>

      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900 text-center md:text-left">Datos Personales</h2>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-5 h-5" /> {successMessage}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <FieldRow label="Nombre Completo:" error={errors.name}>
            <input 
              type="text" value={tempData.name} onChange={(e) => setTempData({...tempData, name: e.target.value})}
              readOnly={!editableFields.name}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${editableFields.name ? 'bg-white border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600 cursor-default'}`} 
            />
            <button onClick={() => toggleEdit('name')} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
          </FieldRow>

          <FieldRow label="E-mail:" error={errors.email}>
            <input 
              type="text" 
              value={editableFields.email ? tempData.email : maskEmail(tempData.email)}
              onChange={(e) => setTempData({...tempData, email: e.target.value})}
              readOnly={!editableFields.email}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${editableFields.email ? 'bg-white border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600 cursor-default'}`} 
            />
            <button onClick={() => toggleEdit('email')} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
          </FieldRow>

          <FieldRow label="País:">
            <div className="flex-1 relative">
              <select 
                value={tempData.country} onChange={(e) => setTempData({...tempData, country: e.target.value})}
                disabled={!editableFields.country}
                className={`w-full px-3 py-2 text-sm rounded appearance-none pr-8 ${editableFields.country ? 'bg-white border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600 cursor-default'}`}
              >
                <option value="">Seleccione un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Perú">Perú</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Colombia">Colombia</option>
                <option value="México">México</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-stone-500 pointer-events-none" />
            </div>
            <button onClick={() => toggleEdit('country')} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
          </FieldRow>

          <FieldRow label="Género:">
            <div className="flex-1 relative">
              <select 
                value={tempData.gender} onChange={(e) => setTempData({...tempData, gender: e.target.value})}
                disabled={!editableFields.gender}
                className={`w-full px-3 py-2 text-sm rounded appearance-none pr-8 ${editableFields.gender ? 'bg-white border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600 cursor-default'}`}
              >
                <option value="">Seleccione género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-stone-500 pointer-events-none" />
            </div>
            <button onClick={() => toggleEdit('gender')} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
          </FieldRow>

          <FieldRow label="Dirección:">
            <input 
              type="text" value={tempData.address} onChange={(e) => setTempData({...tempData, address: e.target.value})}
              readOnly={!editableFields.address}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${editableFields.address ? 'bg-white border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600 cursor-default'}`} 
            />
            <button onClick={() => toggleEdit('address')} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
          </FieldRow>

          <div className="flex flex-col gap-3 mt-2">
            {tempPhones.map((phone, index) => (
              <FieldRow key={phone.id} label={index === 0 ? "Teléfono:" : `Teléfono ${index + 1}:`} error={errors[`phone_${phone.id}`]}>
                <div className={`flex flex-1 rounded overflow-hidden relative ${editableFields[`phone_${phone.id}`] ? 'bg-white border border-amber-600 focus-within:ring-2 focus-within:ring-amber-600/50' : 'bg-stone-200/60 border border-transparent text-stone-600'}`}>
                  
                  <div className="relative border-r border-stone-300">
                    <select 
                      value={phone.code} onChange={(e) => handlePhoneChange(phone.id, 'code', e.target.value)}
                      disabled={!editableFields[`phone_${phone.id}`]}
                      className="bg-transparent pl-2 pr-6 py-2 text-sm focus:outline-none font-medium appearance-none h-full"
                    >
                      {Object.entries(COUNTRY_RULES).map(([code, rule]) => (
                        <option key={code} value={code}>{rule.code} ({code})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1 top-2.5 w-4 h-4 text-stone-500 pointer-events-none" />
                  </div>

                  <input 
                    type="tel" 
                    value={phone.number}
                    onChange={(e) => handlePhoneChange(phone.id, 'number', e.target.value.replace(/[^0-9]/g, ''))}
                    readOnly={!editableFields[`phone_${phone.id}`]}
                    placeholder={COUNTRY_RULES[phone.code].placeholder}
                    maxLength={COUNTRY_RULES[phone.code].length}
                    className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleEdit(`phone_${phone.id}`)} className="text-stone-400 hover:text-amber-600"><Pencil className="w-4 h-4" /></button>
                  {index > 0 ? (
                    <button onClick={() => setPhoneToDelete(phone.id)} className="text-stone-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  ) : tempPhones.length < 3 ? (
                    <button onClick={handleAddPhone} className="text-stone-900 font-bold hover:text-amber-600 p-1"><Plus className="w-5 h-5" /></button>
                  ) : <div className="w-5"></div>}
                </div>
              </FieldRow>
            ))}
            {errors.phoneGeneral && <p className="text-red-500 text-xs text-right pr-12">{errors.phoneGeneral}</p>}
          </div>
          
          <div className="flex justify-end mt-6 pr-0 md:pr-10 border-t border-stone-200 pt-6">
             <button onClick={handleCancel} className="px-5 py-2 text-sm text-stone-600 mr-3 hover:bg-stone-200 rounded-lg transition-colors font-medium">
               Cancelar
             </button>
             <button onClick={handleSaveClick} className="px-6 py-2 bg-amber-600 text-white text-sm rounded-lg font-bold shadow-md hover:bg-amber-700 transition-colors">
               Guardar Cambios
             </button>
          </div>
        </div>
      </div>

      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} onSubmit={handlePasswordSubmit} />
      <OtpModal isOpen={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} onSubmit={handleOtpSubmit} onResendCode={() => {}} />
      
      {phoneToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4 border-t-4 border-amber-600">
            <h3 className="text-lg font-bold text-stone-900 mb-2">Eliminar teléfono</h3>
            <p className="text-sm text-stone-600 mb-6">¿Estás seguro de que deseas eliminar este número?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPhoneToDelete(null)} className="px-4 py-2 text-sm bg-stone-100 text-stone-700 rounded hover:bg-stone-200">Cancelar</button>
              <button onClick={executeDeletePhone} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FieldRow = ({ label, children, error }: { label: string, children: React.ReactNode, error?: string }) => (
  <div className="flex flex-col mb-1">
    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
      <label className="w-full md:w-32 font-medium text-sm text-stone-800">{label}</label>
      <div className="flex-1 flex items-center gap-3">
        {children}
      </div>
    </div>
    {error && <span className="text-red-500 text-xs md:ml-36 mt-1">{error}</span>}
  </div>
);