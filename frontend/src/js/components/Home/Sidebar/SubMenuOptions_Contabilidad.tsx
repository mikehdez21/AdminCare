
// Bibliotecas
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedSection } from '@/store/sectionReducer';

// Icons
import { TbReportMoney } from "react-icons/tb";
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { HiArchiveBoxArrowDown } from "react-icons/hi2";
import { FaGears } from "react-icons/fa6";
import { AiOutlineAudit } from "react-icons/ai";





// Styles

interface MenuOptions_ParentProps {
    selectedSection: string;
    role: string;
    departamento: string;
}


const SubMenuOptions_Contabilidad: React.FC<MenuOptions_ParentProps> = ({ selectedSection }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isContabilidadOpen, setIsContabilidadOpen] = useState(false);
    const [isContabilidadRotated, setIsContabilidadRotated] = useState(false);

    // Manejo del submenú de Contabilidad
    const toggleSubMenus_Contabilidad = () => {
        setIsContabilidadOpen(!isContabilidadOpen);
        setIsContabilidadRotated(!isContabilidadRotated);
    };

    // FEATURE QUE MANEJA LAS SECCIONES SELECCIONADAS
    const handleSelectSection = (section: string, path: string) => {
        dispatch(setSelectedSection(section)); // Actualizar sección seleccionada en Redux
        localStorage.setItem('selectedSection', section); // Actualizar sección en LocalStorage
        navigate(path); // Navegar a la URL correspondiente
    };

    return (

        <div id='SubMenu_Contabilidad'>


            <div onClick={toggleSubMenus_Contabilidad} className='divMenu_SubMenus'>


                <div
                    className={
                        ['DepreciacionAF', 'ContabilidadConfiguracion', 'Auditoria'].includes(selectedSection)
                            ? 'SubMenu_IconTitle sidebar_SectionSelected'
                            : 'SubMenu_IconTitle'
                    }
                >
                    <TbReportMoney className='iconOption_Sidebar' />
                    <span>Contabilidad </span>
                    <MdOutlineKeyboardArrowUp className={`IconSubMenuArrow ${isContabilidadRotated ? 'rotate' : ''}`} />
                </div>




                {/* Submenu Contabilidad */}
                <div className="SubMenu_Options">
                    {isContabilidadOpen && (


                        <ul>

                            <li
                                onClick={() => handleSelectSection('DepreciacionAF', '/contabilidad/depreciacionaf')}
                                id='SubMenu_Option'
                                className={`subMenuOption delayOption1 ${selectedSection === 'DepreciacionAF' ? 'sidebar_Section_SubMenuSelected' : ''}`}

                            >
                                <HiArchiveBoxArrowDown /> <p>Depreciación de ActivosFijos</p>
                            </li>


                            <li
                                onClick={() => handleSelectSection('ContabilidadConfiguracion', '/contabilidad/configuracion')}
                                id='SubMenu_Option'
                                className={`subMenuOption delayOption2 ${selectedSection === 'ContabilidadConfiguracion' ? 'sidebar_Section_SubMenuSelected' : ''}`}

                            >
                                <FaGears /> <p>Configuración</p>
                            </li>


                            <li
                                onClick={() => handleSelectSection('Auditoria', '/contabilidad/auditoria')}
                                id='SubMenu_Option'
                                className={`subMenuOption delayOption3 ${selectedSection === 'Auditoria' ? 'sidebar_Section_SubMenuSelected' : ''}`}

                            >
                                <AiOutlineAudit /> <p>Auditoria</p>
                            </li>


                        </ul>
                    )}

                </div>
            </div>
        </div>
    )
}

export default SubMenuOptions_Contabilidad;
