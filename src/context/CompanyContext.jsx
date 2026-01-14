import { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { API_BASE_URL, PIDE_EJE_CURRENT } from '../config';

/**
 * CompanyContext.jsx
 * Contexto global para la gestión de datos de la empresa (Entidad) 
 * y el estado de autenticación avanzada del usuario.
 */
const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
    // Estado de la Entidad (Municipalidad, Notaría, etc.)
    const [companyData, setCompanyData] = useState({
        mRUC_EJE: '',
        mNOM_EN1: '',
        mNOM_EN2: '',
        mCEL_MOV: '',
        mLAT_EJE: null,
        mLON_EJE: null,
        mIDE_DIS: ''
    });

    // Estados de control de flujo
    const [loading, setLoading] = useState(true);
    const [mUSUARIO_IDENTICADO, setMUSUARIO_IDENTICADO] = useState(false);

    // Estados del usuario autenticado (Worker Data)
    const [v_nlineno, setV_nlineno] = useState(null);
    const [v_ide_gru, setV_ide_gru] = useState(null);
    const [v_des_gru, setV_des_gru] = useState('');
    const [v_user_photo, setV_user_photo] = useState(null);
    const [v_nom_trb, setV_nom_trb] = useState('');

    /**
     * PASO 1: IDENTIFICACIÓN
     * Busca los datos básicos del trabajador y su fotografía basándose en el nombre de usuario.
     */
    const identify = async (username) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/identify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            if (data.success) {
                const { nlineno, ide_gru, des_gru, fot_trb, nom_trb } = data.data;
                setV_nlineno(nlineno);
                setV_ide_gru(ide_gru);
                setV_des_gru(des_gru);
                setV_user_photo(fot_trb);
                setV_nom_trb(nom_trb);
                return data.data;
            } else {
                setV_nlineno(null);
                setV_user_photo(null);
                setV_nom_trb('');
                return null;
            }
        } catch (error) {
            console.error('Error identificando usuario:', error);
            return null;
        }
    };

    /**
     * PASO 2: VERIFICACIÓN
     * Valida la contraseña ingresada mediante comparación hash MD5 en cliente vs servidor.
     */
    const login = async (nlineno, passwordInput) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nlineno })
            });
            const data = await response.json();
            if (data.success) {
                const { ccpassword } = data;
                // Generamos el Hash MD5 de la entrada del usuario
                const md5Hash = CryptoJS.MD5(passwordInput).toString();

                // Comparación de seguridad
                if (md5Hash === ccpassword) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Error durante la verificación de password:', error);
            return false;
        }
    };

    /**
     * Confirma el estado del login globalmente.
     */
    const confirmLogin = (value) => {
        setMUSUARIO_IDENTICADO(value);
    };

    /**
     * Efecto al cargar la App: Obtiene la metadata de la entidad configurada en el servidor.
     * El backend ahora retorna TODAS las ejecutoras, así que filtramos por PIDE_EJE_CURRENT.
     */
    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/company/info`);
                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    // Filtrar la ejecutora según PIDE_EJE_CURRENT
                    const ejecutora = data.data.find(e => e.ide_eje === PIDE_EJE_CURRENT);

                    if (ejecutora) {
                        const { ruc_eje, nom_en1, nom_en2, cel_mov, lat_eje, lon_eje, ide_dis } = ejecutora;
                        setCompanyData({
                            mRUC_EJE: ruc_eje,
                            mNOM_EN1: nom_en1,
                            mNOM_EN2: nom_en2,
                            mCEL_MOV: cel_mov,
                            mLAT_EJE: lat_eje,
                            mLON_EJE: lon_eje,
                            mIDE_DIS: ide_dis
                        });
                        console.log(`✓ Ejecutora cargada: ${nom_en1} (IDE_EJE: ${PIDE_EJE_CURRENT})`);
                    } else {
                        console.error(`No se encontró la ejecutora con IDE_EJE: ${PIDE_EJE_CURRENT}`);
                    }
                } else {
                    console.error('Error cargando datos de las ejecutoras:', data.message);
                }
            } catch (error) {
                console.error('Error de red cargando datos de la entidad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyData();
    }, []);

    // Exposición de valores y métodos a través del Contexto
    return (
        <CompanyContext.Provider value={{
            companyData,
            loading,
            mUSUARIO_IDENTICADO,
            v_nlineno,
            v_ide_gru,
            v_des_gru,
            v_user_photo,
            v_nom_trb,
            identify,
            login,
            confirmLogin
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

