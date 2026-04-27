// resources/js/reactPDF/MyDocument.jsx
import { VwMovimientosAF } from '@/@types/AlmacenGeneralTypes/activosFijosTypes';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getFechaHoraActual, formatDateHorasToFrontend } from '@/utils/dateFormat';

export interface FacturaPdfInfo {
    id_factura?: number | null;
    num_factura?: string | null;
}

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
        paddingVertical: 7,
        paddingHorizontal: 5,
        flex: 1,
        fontSize: 8.5,
        lineHeight: 1.2,
        textAlign: 'left',
        justifyContent: 'center',
    },
    tableCellNumber: {
        flex: 0.4,
        minWidth: 24,
        maxWidth: 34,
        textAlign: 'center',
    },
    tableCellCodigoEtiqueta: {
        flex: 1.15,
    },
    tableCellNombre: {
        flex: 1.35,
    },
    tableCellModelo: {
        flex: 1.15,
    },
    tableCellMarca: {
        flex: 1,
    },
    tableCellSerie: {
        flex: 1.1,
    },
    tableCellHeader: {
        textAlign: 'center',
        fontSize: 8.2,
        fontWeight: 'bold',
        lineHeight: 1.15,
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
    movimientoActivo: VwMovimientosAF | null;
    responsableActual: string | null | undefined;

}


export const MyDocument = ({ movimientoActivo, responsableActual }: ScaneoActivosProps) => (

    <Document>
        <Page size="LETTER" style={styles.page}>
            <View>
                <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 6, fontWeight: 'bold' }}>Hospital San Serafín</Text>
                <Text style={{ fontSize: 14, color: '#333', textAlign: 'center', marginBottom: 2, }}>Responsiva de Movimientos en Activos Fijos</Text>


                <Text style={{ display: 'flex', textAlign: 'center', marginBottom: 12, color: '#777', fontSize: 9, justifyContent: 'center' }}>
                    Fecha y Hora de la Responsiva: {formatDateHorasToFrontend(getFechaHoraActual() || '') || 'Desconocida'}
                </Text>




                {/* Tabla de activos escaneados */}
                <View style={styles.section}>
                    <Text style={styles.subtitle}>Tipo de Movimiento: {movimientoActivo?.tipo_movimiento || 'Desconocido'}</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={[styles.tableCell, styles.tableCellCodigoEtiqueta, styles.tableCellHeader]}>Código Etiqueta</Text>
                            <Text style={[styles.tableCell, styles.tableCellNombre, styles.tableCellHeader]}>Nombre</Text>
                            <Text style={[styles.tableCell, styles.tableCellModelo, styles.tableCellHeader]}>Modelo</Text>
                            <Text style={[styles.tableCell, styles.tableCellMarca, styles.tableCellHeader]}>Marca</Text>
                            <Text style={[styles.tableCell, styles.tableCellSerie, styles.tableCellHeader]}>No. Serie</Text>

                        </View>

                        <View style={styles.tableRow} key={movimientoActivo?.id_activo_fijo}>
                            <Text style={[styles.tableCell, styles.tableCellCodigoEtiqueta]}>{movimientoActivo?.codigo_etiqueta}</Text>
                            <Text style={[styles.tableCell, styles.tableCellNombre]}>{movimientoActivo?.nombre_af || movimientoActivo?.descripcion_af}</Text>
                            <Text style={[styles.tableCell, styles.tableCellModelo]}>{movimientoActivo?.modelo_af}</Text>
                            <Text style={[styles.tableCell, styles.tableCellMarca]}>{movimientoActivo?.marca_af}</Text>
                            <Text style={[styles.tableCell, styles.tableCellSerie]}>{movimientoActivo?.numero_serie_af}</Text>
                        </View>
                    </View>
                </View>


            </View>

            {/* Espacio para firmas al final de la hoja */}
            <View style={styles.signatureSection} fixed>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={styles.signatureBox}></View>
                    <Text style={styles.signatureLabel}>Firma de Entregado</Text>

                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={styles.signatureBox}></View>
                    <Text style={styles.signatureLabel}>{responsableActual || 'Sin información de responsable'}</Text>
                </View>
            </View>
        </Page>
    </Document>
);