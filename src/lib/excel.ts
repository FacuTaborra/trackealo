import ExcelJS from 'exceljs';

/**
 * Configuración de una columna para Excel
 */
export interface ExcelColumnConfig<T = any> {
  /** ID de la columna */
  id: string;
  /** Header que se mostrará en el Excel */
  header: string;
  /** Ancho de la columna */
  width?: number;
  /** Función para formatear el valor */
  format?: (value: any, row: T) => string | number | Date | null;
  /** Configuración de imagen (si esta columna contiene imágenes) */
  image?: {
    /** Función que devuelve la URL de la imagen desde la fila */
    getUrl: (row: T) => string | null | undefined;
    /** Ancho de la imagen en píxeles */
    width?: number;
    /** Alto de la imagen en píxeles */
    height?: number;
    /** Altura de la fila en puntos (opcional, se calcula automáticamente) */
    rowHeight?: number;
  };
}

/**
 * Configuración para insertar una imagen en el Excel
 */
export interface ExcelImageConfig<T = any> {
  /** ID de la columna donde insertar la imagen */
  columnId: string;
  /** Función que devuelve la URL de la imagen desde la fila */
  getUrl: (row: T) => string | null | undefined;
  /** Ancho de la imagen en píxeles */
  width?: number;
  /** Alto de la imagen en píxeles */
  height?: number;
  /** Altura de la fila en puntos (opcional, se calcula automáticamente basado en height si no se especifica) */
  rowHeight?: number;
}

/**
 * Configuración para crear un Excel
 */
export interface CreateExcelConfig<T = any> {
  /** Nombre de la hoja */
  sheetName: string;
  /** Configuración de columnas */
  columns: ExcelColumnConfig<T>[];
  /** Datos a exportar */
  data: T[];
  /** Configuración de imágenes (opcional) */
  images?: ExcelImageConfig<T>;
}

/**
 * Descarga una imagen desde una URL
 */
async function downloadImage(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Crea un workbook de Excel desde una configuración
 */
export async function createExcelWorkbook<T = any>(
  config: CreateExcelConfig<T>
): Promise<ExcelJS.Workbook> {
  const { sheetName, columns, data, images } = config;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Configurar columnas
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.id,
    width: col.width ?? 20
  }));

  // Estilizar header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Determinar si hay columna de imagen (buscar en las columnas o en el parámetro images)
  const imageColumn = columns.find((col) => col.image);
  const imageConfig = imageColumn?.image || images;
  const imageColumnId = imageColumn?.id || images?.columnId;
  const imageColumnIndex = imageColumnId
    ? columns.findIndex((col) => col.id === imageColumnId)
    : -1;
  const hasImageColumn = imageColumnIndex !== -1 && imageConfig;

  // Agregar filas
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const row: Record<string, any> = {};
    const rowNumber = i + 2; // +2 porque la fila 1 es el header

    // Procesar cada columna
    for (const col of columns) {
      if (hasImageColumn && col.id === imageColumnId) {
        // Dejar vacía la celda de la imagen
        row[col.id] = '';
      } else if (col.format) {
        // Usar función de formato personalizada
        row[col.id] = col.format((item as any)[col.id], item);
      } else {
        // Usar valor directo
        row[col.id] = (item as any)[col.id];
      }
    }

    worksheet.addRow(row);

    // Insertar imagen si corresponde
    if (hasImageColumn && imageConfig) {
      const imageUrl = imageConfig.getUrl(item);
      if (imageUrl) {
        const imageArrayBuffer = await downloadImage(imageUrl);
        if (imageArrayBuffer) {
          try {
            const imageBuffer = Buffer.from(imageArrayBuffer) as any;
            const imageId = workbook.addImage({
              buffer: imageBuffer,
              extension: 'png'
            });

            // Ajustar altura de la fila (solo cuando hay imagen)
            // En Excel, aproximadamente 1 punto = 1.33 píxeles
            const imageHeight = imageConfig.height ?? 75;
            const rowHeightInPoints =
              imageConfig.rowHeight ?? imageHeight * 0.7;
            worksheet.getRow(rowNumber).height = rowHeightInPoints;

            // Agregar la imagen
            worksheet.addImage(imageId, {
              tl: { col: imageColumnIndex, row: rowNumber - 1 },
              ext: {
                width: imageConfig.width ?? 100,
                height: imageHeight
              }
            });
          } catch {
            // Error silencioso
          }
        }
      }
    }
  }

  return workbook;
}

/**
 * Crea un buffer de Excel desde una configuración
 */
export async function createExcelBuffer<T = any>(
  config: CreateExcelConfig<T>
): Promise<Buffer> {
  const workbook = await createExcelWorkbook(config);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Crea un Excel en base64 desde una configuración
 */
export async function createExcelBase64<T = any>(
  config: CreateExcelConfig<T>
): Promise<string> {
  const buffer = await createExcelBuffer(config);
  return buffer.toString('base64');
}
