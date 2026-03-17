/**
 * Export data as CSV file (opens in Excel, Google Sheets)
 */
export function exportCSV(filename: string, headers: string[], rows: string[][]) {
  var csv = headers.join(',') + '\n';
  rows.forEach(function(row) {
    csv += row.map(function(cell) {
      // Escape commas and quotes
      var val = String(cell || '');
      if (val.indexOf(',') >= 0 || val.indexOf('"') >= 0 || val.indexOf('\n') >= 0) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',') + '\n';
  });

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename + '.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Print current page section as PDF (uses browser print dialog)
 */
export function exportPDF(title: string) {
  var printWindow = window.open('', '_blank');
  if (!printWindow) { alert('Please allow popups to export PDF'); return; }

  // Get the main content area
  var content = document.querySelector('main');
  if (!content) return;

  printWindow.document.write('<!DOCTYPE html><html><head><title>' + title + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #333; }');
  printWindow.document.write('h1 { font-size: 22px; margin-bottom: 8px; }');
  printWindow.document.write('h2 { font-size: 16px; margin-top: 24px; margin-bottom: 8px; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 12px; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }');
  printWindow.document.write('th { background: #f5f5f5; font-weight: 600; }');
  printWindow.document.write('.metric { display: inline-block; margin-right: 24px; margin-bottom: 12px; }');
  printWindow.document.write('.metric-label { font-size: 11px; color: #666; text-transform: uppercase; }');
  printWindow.document.write('.metric-value { font-size: 20px; font-weight: 600; }');
  printWindow.document.write('.header { border-bottom: 2px solid #2E75B6; padding-bottom: 8px; margin-bottom: 16px; }');
  printWindow.document.write('.footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }');
  printWindow.document.write('@media print { body { padding: 0; } }');
  printWindow.document.write('</style></head><body>');
  printWindow.document.write('<div class="header"><h1>' + title + '</h1>');
  printWindow.document.write('<p style="color:#666;font-size:12px;">Generated on ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</p></div>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('<div class="footer">Qahal Church Management &mdash; Report generated ' + new Date().toLocaleString() + '</div>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();

  setTimeout(function() { if (printWindow) printWindow.print(); }, 500);
}

/**
 * Export members list as CSV
 */
export function exportMembersCSV(members: any[]) {
  exportCSV('members-export', 
    ['First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Gender', 'Date of Birth', 'City', 'Country', 'Address', 'Marital Status', 'Joined Date'],
    members.map(function(m) {
      return [m.firstName, m.lastName, m.email || '', m.phone || '', m.status, m.gender || '', m.dateOfBirth || '', m.city || '', m.country || '', m.address || '', m.maritalStatus || '', m.joinedDate || ''];
    })
  );
}

/**
 * Export giving records as CSV
 */
export function exportGivingCSV(records: any[]) {
  exportCSV('giving-export',
    ['Date', 'Member', 'Amount', 'Currency', 'Category', 'Payment Method', 'Transaction Ref', 'Notes'],
    records.map(function(r) {
      var name = r.member ? r.member.firstName + ' ' + r.member.lastName : 'Anonymous';
      return [r.date, name, String(r.amount), r.currency || 'GHS', r.category, r.paymentMethod, r.transactionRef || '', r.notes || ''];
    })
  );
}

/**
 * Export attendance as CSV
 */
export function exportAttendanceCSV(eventName: string, records: any[]) {
  exportCSV('attendance-' + eventName.replace(/\s+/g, '-').toLowerCase(),
    ['Member', 'Phone', 'Check-in Time', 'Method', 'First Timer'],
    records.map(function(r) {
      return [r.member.firstName + ' ' + r.member.lastName, r.member.phone || '', r.checkedInAt || '', r.checkInMethod || '', r.isFirstTime ? 'Yes' : 'No'];
    })
  );
}

/**
 * Export weekly giving summary as CSV
 */
export function exportWeeklyGivingCSV(weeks: any[]) {
  exportCSV('weekly-giving-summary',
    ['Week Start', 'Week End', 'Total', 'Tithes', 'Offerings', 'Other', 'Transactions'],
    weeks.map(function(w) {
      var tithes = w.byCategory?.TITHE || 0;
      var offerings = w.byCategory?.OFFERING || 0;
      return [w.weekStart, w.weekEnd, String(w.total), String(tithes), String(offerings), String(w.total - tithes - offerings), String(w.count)];
    })
  );
}

/**
 * Export monthly income as CSV
 */
export function exportMonthlyIncomeCSV(data: any) {
  exportCSV('monthly-income-' + data.year,
    ['Month', 'Total', 'Tithes', 'Offerings', 'Transactions'],
    data.months.map(function(m: any) {
      return [m.monthName, String(m.total), String(m.byCategory?.TITHE || 0), String(m.byCategory?.OFFERING || 0), String(m.count)];
    })
  );
}

/**
 * Export assets as CSV
 */
export function exportAssetsCSV(assets: any[]) {
  exportCSV('assets-inventory',
    ['Name', 'Description', 'Category', 'Condition', 'Value', 'Source', 'Location', 'Serial Number', 'Date Acquired'],
    assets.map(function(a) {
      return [a.name, a.description || '', a.category, a.condition, String(a.value || ''), a.source || '', a.location || '', a.serialNumber || '', a.acquiredDate || ''];
    })
  );
}

/**
 * Export member attendance rates as CSV
 */
export function exportAttendanceRatesCSV(members: any[], period: string) {
  exportCSV('attendance-rates-' + period.replace(/\s+/g, '-').toLowerCase(),
    ['Member', 'Phone', 'Attended', 'Total Events', 'Rate (%)'],
    members.map(function(m) {
      return [m.firstName + ' ' + m.lastName, m.phone || '', String(m.attended), String(m.total), String(m.rate)];
    })
  );
}

/**
 * Export pledges as CSV
 */
export function exportPledgesCSV(pledges: any[]) {
  exportCSV('pledge-report',
    ['Pledge Name', 'Member', 'Target Amount', 'Paid Amount', 'Remaining', 'Progress (%)', 'Status', 'Start Date', 'End Date'],
    pledges.map(function(p) {
      return [p.name, p.member, String(p.targetAmount), String(p.paidAmount), String(p.remaining), String(p.progress), p.status, p.startDate || '', p.endDate || ''];
    })
  );
}
