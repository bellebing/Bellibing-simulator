import type { NativeCell, NativeDprSnapshot } from './dprCharacterStatExtraction.ts';

/** Full native Sheets API CellData response, after enumerating every tab including
 * hidden tabs. Accepting partial rectangles here would falsify discovery coverage.
 */
export interface NativeDprGrid {
  readonly spreadsheetId: string;
  readonly properties: { readonly title: string };
  readonly sheets: readonly {
    readonly properties: { readonly sheetId: number; readonly title: string; readonly hidden?: boolean;
      readonly gridProperties: { readonly rowCount: number; readonly columnCount: number } };
    readonly data?: readonly { readonly startRow?: number; readonly startColumn?: number;
      readonly rowData?: readonly { readonly values?: readonly NativeCell[] }[] }[];
  }[];
}

export function captureDprNativeSource(grid: NativeDprGrid, extractionDate: string): NativeDprSnapshot {
  return { spreadsheetId: grid.spreadsheetId, spreadsheetTitle: grid.properties.title, extractionDate,
    scanMethod: 'NATIVE_SHEETS_FULL_GRID', sheets: grid.sheets.map(sheet => {
      const p = sheet.properties;
      const cells = new Map<string,NativeCell>();
      for (const block of sheet.data ?? []) for (const [ri,r] of (block.rowData ?? []).entries())
        for (const [ci,c] of (r.values ?? []).entries())
          cells.set((ri+(block.startRow??0))+','+(ci+(block.startColumn??0)),c);
      const headers: { row: number; column: number; label: string }[] = [];
      for (const [key,c] of cells) {
        const label = c.effectiveValue?.stringValue ?? c.formattedValue;
        if (label && /^(General Stat Recommendation|Stats used for Calcs)$/i.test(label.trim())) {
          const [row,column] = key.split(',').map(Number);
          headers.push({row:row!,column:column!,label});
        }
      }
      const sections = headers.sort((a,b)=>a.row-b.row||a.column-b.column).map(header => {
        let end = header.row + 2;
        while (end < p.gridProperties.rowCount) {
          const cell = cells.get(end+','+header.column);
          const text = cell?.effectiveValue?.stringValue ?? cell?.formattedValue;
          if (!text || /^(General Stat Recommendation|Stats used for Calcs)$/i.test(text.trim())) break;
          end++;
        }
        return { header, rows: Array.from({length:end-header.row},(_,i)=>({
          row:header.row+i, label:cells.get((header.row+i)+','+header.column)??{},
          value:cells.get((header.row+i)+','+(header.column+1))??{},
        })) };
      });
      // Standard A1 column notation also covers future tabs wider than Z.
      let lastColumn=''; for(let n=p.gridProperties.columnCount;n>0;n=Math.floor((n-1)/26))
        lastColumn=String.fromCharCode(65+(n-1)%26)+lastColumn;
      return {sheetId:p.sheetId,sheetTitle:p.title,hidden:p.hidden??false,
        scanRange:'A1:'+lastColumn+p.gridProperties.rowCount,sections,
        origin:sections.length ? cells.get('0,0')??{} : null};
    }) };
}
