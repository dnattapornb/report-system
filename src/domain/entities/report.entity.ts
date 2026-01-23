export interface ReportItem {
  id: string;
  category: string;
  amount: number;
  date: string;
  status: 'active' | 'pending' | 'completed';
}

/**
 * Class for handling report data transformation logic
 */
export class ReportDomain {
  static transformRawToEntity(rows: any[][]): ReportItem[] {
    if (!rows || rows.length < 2) return [];

    const [headers, ...data] = rows;

    return data.map((row) => ({
      id: String(row[0] ?? ''),
      category: String(row[1] ?? 'General'),
      amount: parseFloat(row[2]) || 0,
      date: String(row[3] ?? ''),
      status: (row[4] as ReportItem['status']) || 'pending',
    }));
  }
}
