const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: 'localhost', port: 4000, path, method: 'POST', headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ success: false, raw: d }); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 4000, path, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ success: false }); } });
    });
    req.on('error', reject);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════

const members = [
  { firstName: 'Kwame', lastName: 'Asante', phone: '+233501234567', email: 'kwame.asante@gmail.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1985-03-12', city: 'Accra', maritalStatus: 'Married', address: '15 Independence Ave, East Legon' },
  { firstName: 'Ama', lastName: 'Mensah', phone: '+233502345678', email: 'ama.mensah@yahoo.com', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1990-07-25', city: 'Tema', maritalStatus: 'Single', address: 'Community 7, Tema' },
  { firstName: 'Kofi', lastName: 'Boateng', phone: '+233503456789', email: 'kofi.boat@gmail.com', gender: 'MALE', status: 'LEADER', dateOfBirth: '1982-11-08', city: 'Accra', maritalStatus: 'Married', address: '23 Spintex Road' },
  { firstName: 'Abena', lastName: 'Owusu', phone: '+233504567890', email: 'abena.owusu@gmail.com', gender: 'FEMALE', status: 'WORKER', dateOfBirth: '1995-01-30', city: 'Kumasi', maritalStatus: 'Single', address: 'Ahodwo, Kumasi' },
  { firstName: 'Yaw', lastName: 'Adjei', phone: '+233505678901', email: 'yaw.adjei@outlook.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1988-06-17', city: 'Accra', maritalStatus: 'Married', address: '8 Cantonments Rd' },
  { firstName: 'Efua', lastName: 'Darko', phone: '+233506789012', email: 'efua.darko@gmail.com', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1992-09-04', city: 'Takoradi', maritalStatus: 'Single', address: 'Beach Road, Takoradi' },
  { firstName: 'Kwesi', lastName: 'Appiah', phone: '+233507890123', email: 'kwesi.appiah@gmail.com', gender: 'MALE', status: 'NEW_CONVERT', dateOfBirth: '2000-12-22', city: 'Accra', maritalStatus: 'Single', address: 'Madina, Accra' },
  { firstName: 'Akua', lastName: 'Frimpong', phone: '+233508901234', email: 'akua.frimp@yahoo.com', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1987-04-15', city: 'Cape Coast', maritalStatus: 'Married', address: 'Pedu, Cape Coast' },
  { firstName: 'Kojo', lastName: 'Tetteh', phone: '+233509012345', email: 'kojo.tetteh@gmail.com', gender: 'MALE', status: 'WORKER', dateOfBirth: '1993-08-28', city: 'Accra', maritalStatus: 'Single', address: 'Osu, Oxford Street' },
  { firstName: 'Adwoa', lastName: 'Ankrah', phone: '+233500123456', email: 'adwoa.ankrah@gmail.com', gender: 'FEMALE', status: 'VISITOR', dateOfBirth: '1998-02-10', city: 'Tema', maritalStatus: 'Single', address: 'Community 25, Tema' },
  { firstName: 'Fiifi', lastName: 'Quaye', phone: '+233511234567', email: 'fiifi.quaye@gmail.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1984-10-03', city: 'Accra', maritalStatus: 'Married', address: 'Airport Residential' },
  { firstName: 'Maame', lastName: 'Serwaa', phone: '+233512345678', email: 'maame.serwaa@gmail.com', gender: 'FEMALE', status: 'LEADER', dateOfBirth: '1989-05-19', city: 'Kumasi', maritalStatus: 'Married', address: 'Bantama, Kumasi' },
  { firstName: 'Nana', lastName: 'Osei', phone: '+233513456789', email: 'nana.osei@outlook.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1991-07-07', city: 'Accra', maritalStatus: 'Single', address: 'Dansoman, Accra' },
  { firstName: 'Akosua', lastName: 'Badu', phone: '+233514567890', email: 'akosua.badu@gmail.com', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1996-11-14', city: 'Sunyani', maritalStatus: 'Single', address: 'New Town, Sunyani' },
  { firstName: 'Papa', lastName: 'Edusei', phone: '+233515678901', email: 'papa.edusei@gmail.com', gender: 'MALE', status: 'NEW_CONVERT', dateOfBirth: '2001-03-26', city: 'Accra', maritalStatus: 'Single', address: 'Achimota, Accra' },
  { firstName: 'Serwah', lastName: 'Agyemang', phone: '+233516789012', email: 'serwah.agy@yahoo.com', gender: 'FEMALE', status: 'WORKER', dateOfBirth: '1994-08-01', city: 'Accra', maritalStatus: 'Married', address: 'Dzorwulu, Accra' },
  { firstName: 'Kweku', lastName: 'Mensah', phone: '+233517890123', email: 'kweku.mensah@gmail.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1986-01-18', city: 'Tema', maritalStatus: 'Married', address: 'Community 11, Tema' },
  { firstName: 'Afia', lastName: 'Pokua', phone: '+233518901234', email: 'afia.pokua@gmail.com', gender: 'FEMALE', status: 'VISITOR', dateOfBirth: '1999-06-30', city: 'Accra', maritalStatus: 'Single', address: 'Labadi, Accra' },
  { firstName: 'Yaw', lastName: 'Boakye', phone: '+233519012345', email: 'yaw.boakye@outlook.com', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1983-12-05', city: 'Koforidua', maritalStatus: 'Married', address: 'Old Estate, Koforidua' },
  { firstName: 'Esi', lastName: 'Nyarko', phone: '+233510123456', email: 'esi.nyarko@gmail.com', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1997-04-22', city: 'Accra', maritalStatus: 'Single', address: 'Labone, Accra' },
];

const events = [
  { name: 'Sunday Service', type: 'SUNDAY_SERVICE', date: '2026-03-01T09:00:00Z', location: 'Main Auditorium' },
  { name: 'Sunday Service', type: 'SUNDAY_SERVICE', date: '2026-03-08T09:00:00Z', location: 'Main Auditorium' },
  { name: 'Sunday Service', type: 'SUNDAY_SERVICE', date: '2026-03-15T09:00:00Z', location: 'Main Auditorium' },
  { name: 'Midweek Service', type: 'MIDWEEK_SERVICE', date: '2026-03-04T18:30:00Z', location: 'Fellowship Hall' },
  { name: 'Midweek Service', type: 'MIDWEEK_SERVICE', date: '2026-03-11T18:30:00Z', location: 'Fellowship Hall' },
  { name: 'Prayer Meeting', type: 'PRAYER_MEETING', date: '2026-03-06T06:00:00Z', location: 'Prayer Room' },
  { name: 'Prayer Meeting', type: 'PRAYER_MEETING', date: '2026-03-13T06:00:00Z', location: 'Prayer Room' },
  { name: 'Youth Conference', type: 'CONFERENCE', date: '2026-03-10T10:00:00Z', location: 'Main Auditorium' },
  { name: 'Marriage Seminar', type: 'SPECIAL_EVENT', date: '2026-03-14T14:00:00Z', location: 'Conference Room' },
  { name: 'Choir Rehearsal', type: 'OTHER', date: '2026-03-07T16:00:00Z', location: 'Music Room' },
];

const groups = [
  { name: 'Zone A', type: 'ZONE', description: 'Accra East Zone', meetingDay: 'Wednesday', meetingTime: '6:30 PM', location: 'Various' },
  { name: 'Zone B', type: 'ZONE', description: 'Tema Zone', meetingDay: 'Thursday', meetingTime: '7:00 PM', location: 'Various' },
  { name: 'Cell 1 - East Legon', type: 'CELL', description: 'East Legon home cell', meetingDay: 'Wednesday', meetingTime: '6:30 PM', location: '15 Independence Ave' },
  { name: 'Cell 2 - Spintex', type: 'CELL', description: 'Spintex home cell', meetingDay: 'Wednesday', meetingTime: '7:00 PM', location: '23 Spintex Road' },
  { name: 'Cell 3 - Tema', type: 'CELL', description: 'Tema community cell', meetingDay: 'Thursday', meetingTime: '7:00 PM', location: 'Community 7' },
  { name: 'Worship Ministry', type: 'MINISTRY', description: 'Music and worship team', meetingDay: 'Saturday', meetingTime: '3:00 PM', location: 'Music Room' },
  { name: 'Ushering Department', type: 'DEPARTMENT', description: 'Sunday ushers and protocol', meetingDay: 'Saturday', meetingTime: '4:00 PM', location: 'Main Auditorium' },
  { name: 'Children Ministry', type: 'MINISTRY', description: 'Sunday school and kids church', meetingDay: 'Sunday', meetingTime: '8:00 AM', location: 'Children Hall' },
  { name: 'Youth Ministry', type: 'MINISTRY', description: 'Young adults 18-35', meetingDay: 'Friday', meetingTime: '6:00 PM', location: 'Fellowship Hall' },
  { name: 'Prayer Warriors', type: 'TEAM', description: 'Intercessory prayer team', meetingDay: 'Friday', meetingTime: '5:00 AM', location: 'Prayer Room' },
];

const givingRecords = [
  { amount: 500, category: 'TITHE', paymentMethod: 'MOBILE_MONEY', date: '2026-03-01' },
  { amount: 300, category: 'TITHE', paymentMethod: 'CASH', date: '2026-03-01' },
  { amount: 1000, category: 'TITHE', paymentMethod: 'BANK_TRANSFER', date: '2026-03-01' },
  { amount: 200, category: 'OFFERING', paymentMethod: 'CASH', date: '2026-03-01' },
  { amount: 150, category: 'OFFERING', paymentMethod: 'MOBILE_MONEY', date: '2026-03-01' },
  { amount: 750, category: 'TITHE', paymentMethod: 'MOBILE_MONEY', date: '2026-03-08' },
  { amount: 400, category: 'TITHE', paymentMethod: 'CASH', date: '2026-03-08' },
  { amount: 100, category: 'OFFERING', paymentMethod: 'CASH', date: '2026-03-08' },
  { amount: 250, category: 'OFFERING', paymentMethod: 'MOBILE_MONEY', date: '2026-03-08' },
  { amount: 2000, category: 'SPECIAL_SEED', paymentMethod: 'BANK_TRANSFER', date: '2026-03-08' },
  { amount: 600, category: 'TITHE', paymentMethod: 'CASH', date: '2026-03-15' },
  { amount: 350, category: 'TITHE', paymentMethod: 'MOBILE_MONEY', date: '2026-03-15' },
  { amount: 500, category: 'BUILDING_FUND', paymentMethod: 'BANK_TRANSFER', date: '2026-03-15' },
  { amount: 200, category: 'MISSIONS', paymentMethod: 'CASH', date: '2026-03-15' },
  { amount: 100, category: 'WELFARE', paymentMethod: 'MOBILE_MONEY', date: '2026-03-15' },
  { amount: 800, category: 'TITHE', paymentMethod: 'MOBILE_MONEY', date: '2026-02-23' },
  { amount: 450, category: 'TITHE', paymentMethod: 'CASH', date: '2026-02-23' },
  { amount: 300, category: 'OFFERING', paymentMethod: 'CASH', date: '2026-02-16' },
  { amount: 1500, category: 'SPECIAL_SEED', paymentMethod: 'BANK_TRANSFER', date: '2026-02-16' },
  { amount: 250, category: 'OFFERING', paymentMethod: 'MOBILE_MONEY', date: '2026-02-09' },
];

const assets = [
  { name: 'Yamaha PSR-E373 Keyboard', description: '61-key portable keyboard for worship', category: 'INSTRUMENT', condition: 'GOOD', value: 2500, source: 'Donated by Bro. Kwame Asante', location: 'Music Room', serialNumber: 'YAM-PSR-2024-001' },
  { name: 'JBL PRX915 PA Speaker (Pair)', description: '15-inch powered speakers for main auditorium', category: 'EQUIPMENT', condition: 'NEW', value: 12000, source: 'Purchased from church funds', location: 'Main Auditorium', serialNumber: 'JBL-PRX-2025-002' },
  { name: 'Shure SM58 Microphone (x4)', description: 'Dynamic vocal microphones', category: 'EQUIPMENT', condition: 'GOOD', value: 1600, source: 'Purchased', location: 'Music Room', serialNumber: 'SHR-SM58-SET' },
  { name: 'Behringer X32 Mixing Console', description: '32-channel digital mixer', category: 'EQUIPMENT', condition: 'GOOD', value: 8000, source: 'Donated by Sis. Maame Serwaa', location: 'Sound Booth', serialNumber: 'BEH-X32-2024' },
  { name: 'Epson EB-FH52 Projector', description: 'Full HD projector for presentations', category: 'ELECTRONICS', condition: 'GOOD', value: 3500, source: 'Purchased', location: 'Main Auditorium', serialNumber: 'EPS-FH52-2025' },
  { name: 'Plastic Chairs (200 units)', description: 'White stackable chairs for main auditorium', category: 'FURNITURE', condition: 'GOOD', value: 6000, source: 'Purchased in bulk', location: 'Main Auditorium' },
  { name: 'Wooden Pulpit', description: 'Custom-built mahogany pulpit', category: 'FURNITURE', condition: 'GOOD', value: 1500, source: 'Donated by Elder Fiifi Quaye', location: 'Main Auditorium' },
  { name: 'Toyota HiAce Bus (2020)', description: '15-seater church bus for member transport', category: 'VEHICLE', condition: 'FAIR', value: 85000, source: 'Donated by Bro. Nana Osei', location: 'Church Parking', serialNumber: 'GR-2456-20' },
  { name: 'Honda Generator 5kVA', description: 'Backup power generator', category: 'EQUIPMENT', condition: 'GOOD', value: 4500, source: 'Purchased', location: 'Generator House', serialNumber: 'HON-5KVA-2024' },
  { name: 'Church Land - Spintex', description: '2-acre plot for new church building project', category: 'PROPERTY', condition: 'NEW', value: 350000, source: 'Purchased from church building fund', location: 'Spintex Road, Accra' },
  { name: 'Samsung 65" Smart TV', description: 'Display screen for announcements', category: 'ELECTRONICS', condition: 'NEW', value: 4000, source: 'Purchased', location: 'Fellowship Hall', serialNumber: 'SAM-65-2025' },
  { name: 'Drum Kit - Pearl Export', description: 'Full drum set for worship team', category: 'INSTRUMENT', condition: 'GOOD', value: 3000, source: 'Donated by Youth Ministry', location: 'Music Room', serialNumber: 'PRL-EXP-2023' },
  { name: 'Bass Guitar - Fender', description: 'Electric bass guitar', category: 'INSTRUMENT', condition: 'GOOD', value: 2000, source: 'Donated by Bro. Kojo Tetteh', location: 'Music Room', serialNumber: 'FND-BASS-2024' },
  { name: 'Office Desk & Chair Set', description: 'Pastor office furniture', category: 'FURNITURE', condition: 'GOOD', value: 2500, source: 'Purchased', location: 'Pastor Office' },
  { name: 'Air Conditioners (x3)', description: '2HP split AC units', category: 'EQUIPMENT', condition: 'GOOD', value: 9000, source: 'Purchased and installed', location: 'Main Auditorium' },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function run() {
  console.log('\n========================================');
  console.log('  QAHAL - Seeding Everything');
  console.log('========================================\n');

  // Login
  console.log('[1/8] Logging in...');
  const login = await post('/api/v1/auth/login', { email: 'kenneth@charischurch.com', password: 'timeismoney' });
  if (!login.success) {
    console.log('  Login failed. Register at http://localhost:3000/auth/register first.');
    console.log('  Then update the email/password in this script.');
    return;
  }
  const token = login.data.accessToken;
  console.log('  Logged in as ' + login.data.user.firstName + ' ' + login.data.user.lastName + '\n');

  // Add members
  console.log('[2/8] Adding 20 members...');
  const memberIds = [];
  for (const m of members) {
    const res = await post('/api/v1/members', { ...m, country: 'Ghana' }, token);
    if (res.success) {
      memberIds.push(res.data.id);
      console.log('  + ' + m.firstName + ' ' + m.lastName + ' (' + m.status + ')');
    } else {
      console.log('  - SKIP: ' + m.firstName + ' ' + m.lastName + ' (may already exist)');
    }
  }
  console.log('  Total: ' + memberIds.length + ' members added\n');

  // If no members were added (already exist), fetch them
  if (memberIds.length === 0) {
    console.log('  Fetching existing members...');
    const existing = await get('/api/v1/members?limit=100', token);
    if (existing.success && existing.data) {
      existing.data.forEach(m => memberIds.push(m.id));
      console.log('  Found ' + memberIds.length + ' existing members\n');
    }
  }

  // Add events
  console.log('[3/8] Creating 10 events...');
  const eventIds = [];
  for (const e of events) {
    const res = await post('/api/v1/events', e, token);
    if (res.success) {
      eventIds.push(res.data.id);
      console.log('  + ' + e.name + ' (' + e.type + ') - ' + e.date.slice(0, 10));
    } else {
      console.log('  - SKIP: ' + e.name);
    }
  }
  console.log('  Total: ' + eventIds.length + ' events created\n');

  // Add attendance (random members for each event)
  console.log('[4/8] Recording attendance...');
  let totalCheckins = 0;
  for (let i = 0; i < eventIds.length; i++) {
    // Random 60-90% attendance for services, 30-60% for others
    const isService = events[i].type.includes('SERVICE') || events[i].type === 'PRAYER_MEETING';
    const attendRate = isService ? 0.6 + Math.random() * 0.3 : 0.3 + Math.random() * 0.3;
    const attendees = memberIds.filter(() => Math.random() < attendRate);

    if (attendees.length > 0) {
      const res = await post('/api/v1/attendance/batch-check-in', {
        eventId: eventIds[i],
        memberIds: attendees,
      }, token);
      if (res.success) {
        totalCheckins += res.data.checkedIn;
        console.log('  + ' + events[i].name + ' (' + events[i].date.slice(0, 10) + '): ' + res.data.checkedIn + ' checked in');
      }
    }
  }
  console.log('  Total: ' + totalCheckins + ' check-ins recorded\n');

  // Add groups
  console.log('[5/8] Creating 10 groups...');
  const groupIds = [];
  for (const g of groups) {
    const res = await post('/api/v1/groups', g, token);
    if (res.success) {
      groupIds.push(res.data.id);
      console.log('  + ' + g.name + ' (' + g.type + ')');
    }
  }

  // Assign members to groups
  if (groupIds.length > 0 && memberIds.length > 0) {
    console.log('  Assigning members to groups...');
    let assigned = 0;
    for (let i = 0; i < memberIds.length; i++) {
      // Each member in 1-2 groups
      const g1 = groupIds[i % groupIds.length];
      const res = await post('/api/v1/groups/' + g1 + '/members', { memberId: memberIds[i] }, token);
      if (res.success) assigned++;

      // Some members in a second group (ministry/team)
      if (i % 3 === 0 && groupIds.length > 5) {
        const g2 = groupIds[5 + (i % (groupIds.length - 5))];
        await post('/api/v1/groups/' + g2 + '/members', { memberId: memberIds[i] }, token);
      }
    }
    console.log('  ' + assigned + ' members assigned to groups');
  }
  console.log('');

  // Add giving records
  console.log('[6/8] Recording 20 giving transactions...');
  let totalGiving = 0;
  for (let i = 0; i < givingRecords.length; i++) {
    const g = givingRecords[i];
    const memberId = memberIds[i % memberIds.length];
    const res = await post('/api/v1/giving', {
      ...g,
      memberId: i < 18 ? memberId : undefined, // Last 2 are anonymous
      currency: 'GHS',
    }, token);
    if (res.success) {
      totalGiving += g.amount;
      const who = i < 18 ? members[i % members.length].firstName : 'Anonymous';
      console.log('  + GHS ' + g.amount.toFixed(2) + ' ' + g.category + ' from ' + who + ' (' + g.date + ')');
    }
  }
  console.log('  Total: GHS ' + totalGiving.toFixed(2) + ' recorded\n');

  // Add assets
  console.log('[7/8] Adding 15 assets to inventory...');
  let totalAssetValue = 0;
  for (const a of assets) {
    const res = await post('/api/v1/assets', {
      ...a,
      acquiredDate: '2025-06-15',
    }, token);
    if (res.success) {
      totalAssetValue += a.value;
      console.log('  + ' + a.name + ' (GHS ' + a.value.toLocaleString() + ') - ' + a.category);
    } else {
      console.log('  - FAIL: ' + a.name + ' - ' + (res.message || JSON.stringify(res)));
    }
  }
  console.log('  Total asset value: GHS ' + totalAssetValue.toLocaleString() + '\n');

  // Summary
  console.log('[8/8] Done!\n');
  console.log('========================================');
  console.log('  SEED SUMMARY');
  console.log('========================================');
  console.log('  Members:      20');
  console.log('  Events:       10 (3 Sunday, 2 Midweek, 2 Prayer, 3 Other)');
  console.log('  Check-ins:    ' + totalCheckins);
  console.log('  Groups:       10 (2 Zones, 3 Cells, 4 Ministries, 1 Team)');
  console.log('  Giving:       GHS ' + totalGiving.toFixed(2) + ' across 20 transactions');
  console.log('  Assets:       15 items worth GHS ' + totalAssetValue.toLocaleString());
  console.log('========================================');
  console.log('\nRefresh your browser to see everything!');
  console.log('Go to: http://localhost:3000/dashboard\n');
}

run().catch(err => console.error('Error:', err.message));
