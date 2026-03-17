const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({ hostname: 'localhost', port: 4000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function authPost(path, data, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request({ hostname: 'localhost', port: 4000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length, 'Authorization': 'Bearer ' + token } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const members = [
  { firstName: 'Kwame', lastName: 'Asante', phone: '+233501234567', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1985-03-12', city: 'Accra' },
  { firstName: 'Ama', lastName: 'Mensah', phone: '+233502345678', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1990-07-25', city: 'Tema' },
  { firstName: 'Kofi', lastName: 'Boateng', phone: '+233503456789', gender: 'MALE', status: 'LEADER', dateOfBirth: '1982-11-08', city: 'Accra' },
  { firstName: 'Abena', lastName: 'Owusu', phone: '+233504567890', gender: 'FEMALE', status: 'WORKER', dateOfBirth: '1995-01-30', city: 'Kumasi' },
  { firstName: 'Yaw', lastName: 'Adjei', phone: '+233505678901', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1988-06-17', city: 'Accra' },
  { firstName: 'Efua', lastName: 'Darko', phone: '+233506789012', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1992-09-04', city: 'Takoradi' },
  { firstName: 'Kwesi', lastName: 'Appiah', phone: '+233507890123', gender: 'MALE', status: 'NEW_CONVERT', dateOfBirth: '2000-12-22', city: 'Accra' },
  { firstName: 'Akua', lastName: 'Frimpong', phone: '+233508901234', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1987-04-15', city: 'Cape Coast' },
  { firstName: 'Kojo', lastName: 'Tetteh', phone: '+233509012345', gender: 'MALE', status: 'WORKER', dateOfBirth: '1993-08-28', city: 'Accra' },
  { firstName: 'Adwoa', lastName: 'Ankrah', phone: '+233500123456', gender: 'FEMALE', status: 'VISITOR', dateOfBirth: '1998-02-10', city: 'Tema' },
  { firstName: 'Fiifi', lastName: 'Quaye', phone: '+233511234567', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1984-10-03', city: 'Accra' },
  { firstName: 'Maame', lastName: 'Serwaa', phone: '+233512345678', gender: 'FEMALE', status: 'LEADER', dateOfBirth: '1989-05-19', city: 'Kumasi' },
  { firstName: 'Nana', lastName: 'Osei', phone: '+233513456789', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1991-07-07', city: 'Accra' },
  { firstName: 'Akosua', lastName: 'Badu', phone: '+233514567890', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1996-11-14', city: 'Sunyani' },
  { firstName: 'Papa', lastName: 'Edusei', phone: '+233515678901', gender: 'MALE', status: 'NEW_CONVERT', dateOfBirth: '2001-03-26', city: 'Accra' },
  { firstName: 'Serwah', lastName: 'Agyemang', phone: '+233516789012', gender: 'FEMALE', status: 'WORKER', dateOfBirth: '1994-08-01', city: 'Accra' },
  { firstName: 'Kweku', lastName: 'Mensah', phone: '+233517890123', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1986-01-18', city: 'Tema' },
  { firstName: 'Afia', lastName: 'Pokua', phone: '+233518901234', gender: 'FEMALE', status: 'VISITOR', dateOfBirth: '1999-06-30', city: 'Accra' },
  { firstName: 'Yaw', lastName: 'Boakye', phone: '+233519012345', gender: 'MALE', status: 'MEMBER', dateOfBirth: '1983-12-05', city: 'Koforidua' },
  { firstName: 'Esi', lastName: 'Nyarko', phone: '+233510123456', gender: 'FEMALE', status: 'MEMBER', dateOfBirth: '1997-04-22', city: 'Accra' },
];

async function run() {
  console.log('Logging in...');
  const login = await post('/api/v1/auth/login', { email: 'kenneth@charischurch.com', password: 'timeismoney' });

  if (!login.success) {
    console.log('Login failed. Trying to register...');
    console.log('Please use the email and password you registered with.');
    console.log('Or register at http://localhost:3000/auth/register first.');
    return;
  }

  const token = login.data.accessToken;
  console.log('Logged in! Adding 20 members...\n');

  for (const m of members) {
    try {
      const res = await authPost('/api/v1/members', { ...m, country: 'Ghana' }, token);
      if (res.success) {
        console.log('  Added: ' + m.firstName + ' ' + m.lastName);
      } else {
        console.log('  Failed: ' + m.firstName + ' - ' + (res.message || 'error'));
      }
    } catch (e) {
      console.log('  Error: ' + m.firstName);
    }
  }

  console.log('\nDone! Refresh your browser to see the members.');
}

run();