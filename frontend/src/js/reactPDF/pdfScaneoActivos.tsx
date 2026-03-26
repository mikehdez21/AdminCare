// resources/js/reactPDF/MyDocument.jsx
import { ActivosFijos } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getFechaHoraActual, formatDateHorasToFrontend } from '@/utils/dateFormat';

// Puedes registrar una fuente personalizada si lo deseas
// Font.register({ family: 'Roboto', src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxM.woff2' });

const styles = StyleSheet.create({
    page: {
        padding: 32,
        backgroundColor: '#fff',
        fontSize: 11,
        fontFamily: 'Helvetica',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        justifyContent: 'space-between',

    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#2a2a2a',
    },
    section: {
        marginBottom: 18,
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bdbdbd',
        marginBottom: 12,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        borderRightWidth: 1,
        borderRightColor: '#bdbdbd',
        borderBottomWidth: 1,
        borderBottomColor: '#bdbdbd',
        padding: 6,
        flex: 1,
        fontSize: 10,
    },
    tableCellNumber: {
        flex: 0.3,
        minWidth: 20,
        maxWidth: 30,
        textAlign: 'center',
    },
    tableCellLast: {
        borderRightWidth: 0,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 6,
        marginTop: 10,
        color: '#333',
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        minHeight: 80,
        paddingHorizontal: 20,
    },
    signatureBox: {
        width: 200,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 8,
        height: 30,
        justifyContent: 'flex-end',
    },
    signatureLabel: {
        fontSize: 10,
        color: '#555',
        textAlign: 'center',
    },
});

interface ScaneoActivosProps {
    activos: ActivosFijos[];
    activosPendientes: ActivosFijos[];
    infoLugar: string | undefined;
}

export const MyDocument = ({ activos, activosPendientes, infoLugar }: ScaneoActivosProps) => (
    <Document>
        <Page size="LETTER" style={styles.page}>
            <View>
                <Text style={styles.title}>Hospital San Serafín</Text>
                <Text style={{ textAlign: 'center', marginBottom: 4, color: '#555' }}>
                    Inventario de Activos Fijos - {infoLugar || 'Ubicación/Departamento Desconocido'}
                </Text>
                <Text style={{ textAlign: 'center', marginBottom: 12, color: '#777', fontSize: 9 }}>
                    Fecha y hora del escaneo: {formatDateHorasToFrontend(getFechaHoraActual() || '') || 'Desconocida'}
                </Text>



                {/* Tabla de activos escaneados */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Activos Escaneados ({activos.length})</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.tableCellNumber]}>#</Text>
                            <Text style={styles.tableCell}>Código</Text>
                            <Text style={styles.tableCell}>Nombre</Text>
                            <Text style={styles.tableCell}>Modelo</Text>
                            <Text style={styles.tableCell}>Marca</Text>
                            <Text style={styles.tableCell}>NoSerie</Text>

                        </View>
                        {activos.length === 0 ? (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Sin registros</Text>
                            </View>
                        ) : (
                            activos.map((activo, idx) => (
                                <View style={styles.tableRow} key={activo.id_activo_fijo || idx}>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>{idx + 1}</Text>
                                    <Text style={styles.tableCell}>{activo.codigo_etiqueta}</Text>
                                    <Text style={styles.tableCell}>{activo.nombre_af || activo.descripcion_af}</Text>
                                    <Text style={styles.tableCell}>{activo.modelo_af}</Text>
                                    <Text style={styles.tableCell}>{activo.marca_af}</Text>
                                    <Text style={styles.tableCell}>{activo.numero_serie_af}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* Tabla de activos pendientes */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Activos Pendientes de Escaneo ({activosPendientes.length})</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.tableCellNumber]}>#</Text>
                            <Text style={styles.tableCell}>Código</Text>
                            <Text style={styles.tableCell}>Nombre</Text>
                            <Text style={styles.tableCell}>Modelo</Text>
                            <Text style={styles.tableCell}>Marca</Text>
                            <Text style={styles.tableCell}>NoSerie</Text>
                        </View>
                        {activosPendientes.length === 0 ? (
                            <View style={styles.tableRow}>
                                <Text style={styles.tableCell}>Sin registros</Text>
                            </View>
                        ) : (
                            activosPendientes.map((activo, idx) => (
                                <View style={styles.tableRow} key={activo.id_activo_fijo || idx}>
                                    <Text style={[styles.tableCell, styles.tableCellNumber]}>{idx + 1}</Text>
                                    <Text style={styles.tableCell}>{activo.codigo_etiqueta}</Text>
                                    <Text style={styles.tableCell}>{activo.nombre_af || activo.descripcion_af}</Text>
                                    <Text style={styles.tableCell}>{activo.modelo_af}</Text>
                                    <Text style={styles.tableCell}>{activo.marca_af}</Text>
                                    <Text style={styles.tableCell}>{activo.numero_serie_af}</Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </View>

            {/* Espacio para firmas al final de la hoja */}
            <View style={styles.signatureSection} fixed>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={styles.signatureBox}></View>
                    <Text style={styles.signatureLabel}>Firma de quien realiza el escaneo</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={styles.signatureBox}></View>
                    <Text style={styles.signatureLabel}>Firma del responsable</Text>
                </View>
            </View>
        </Page>
    </Document>
);