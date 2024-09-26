const express = require('express');
const cors = require('cors');
const pool = require('./model.js');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(cors());

app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));
// Serve static files without file extensions
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'] // Serve HTML files without extension
}));

// Redirect requests with .html extension to the same URL without extension
app.use((req, res, next) => {
  if (req.path.slice(-5) === '.html') {
    const newPath = req.path.slice(0, -5); // Remove .html extension
    return res.redirect(newPath); // Redirect to the URL without .html extension
  }
  next();
});

app.post('/login', (req, res) => {
  const { username, password, type } = req.body;
  if (type === 'admin' && username === 'admin' && password === 'admin123.') {
    req.session.user = 'admin';
    res.json({ success: true });
  } else if (type === 'staff' && username === 'staff' && password === 'staff123.') {
    req.session.user = 'staff';
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/admin', (req, res) => {
  if (req.session.user === 'admin') {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.redirect('/home');
  }
});
// Middleware to check if the user is logged in as admin
function isAdmin(req, res, next) {
  if (req.session.user === 'admin') {
    next();
  } else {
    res.redirect('/home');
  }
}
app.get('/add_update_docotor', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Doctor.html'));
});
app.get('/add_update_services', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});
app.get('/add_update_ward', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ward.html'));
});
app.get('/add_update_staff', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'staff.html'));
});
app.get('/add_update_medicine', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'medicine.html'));
});
app.get('/docotor_record', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewdoctor.html'));
});
app.get('/services_record', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewservices.html'));
});
app.get('/ward_record', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewward.html'));
});
app.get('/staff_record', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewstaff.html'));
});
app.get('/medicine_record', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewmedicine.html'));
});

app.get('/staff', (req, res) => {
  if (req.session.user === 'staff') {
    res.sendFile(path.join(__dirname, 'public', 'staffhms.html'));
  } else {
    res.redirect('/home');
  }
});

// Middleware to check if the user is logged in as staff
const requireStaffLogin = (req, res, next) => {
  if (req.session.user === 'staff') {
    // User is logged in as staff, allow access
    next();
  } else {
    // User is not logged in as staff, redirect to home page
    res.redirect('/home');
  }
};

app.get('/generate_bills', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bill.html'));
});

app.get('/inpatient', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inpatient.html'));
});

app.get('/outpatient', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'outpatient.html'));
});

app.get('/Bills_record', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewBills.html'));
});

app.get('/inpatient_record', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewInPatient.html'));
});

app.get('/outpatient_record', requireStaffLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewOutPatient.html'));
});


app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});














// For Doctors List
app.get('/doctors', async (req, res) => {
  try {
    let query = 'SELECT * FROM Doctor';

    // Check if status query parameter is provided
    if (req.query.status) {
      const status = req.query.status;
      query += ` WHERE status = '${status}'`;
    }

    const result = await pool.query(query);
    const doctors = result.recordset;
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// For Search Doctor
app.get('/searchDoctors', async (req, res) => {
  try {
      const { query } = req.query; // Get the search query from request query parameters

      // Execute a query to search for doctors based on ID or first name
      const result = await pool.query(`SELECT * FROM Doctor WHERE doctorid LIKE '%${query}%' OR fname LIKE '%${query}%' OR lname LIKE '%${query}%'`);
      const doctors = result.recordset;
      
      res.json(doctors);
  } catch (error) {
      console.error('Error searching doctors:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// To add a new Doctor
app.post('/add_Doctor', async (req, res) => {
  try {
    const { doctorid, fname, lname, specialization, gender, salary, status } = req.body;

    // Execute a query to insert a new record into the Branch table
    await pool.query(`INSERT INTO Doctor (doctorid, fname, lname, specialization, gender, salary, status) 
    VALUES ('${doctorid}', '${fname}', '${lname}', '${specialization}', '${gender}', '${salary}', '${status}')`);

    res.status(201).json({ message: 'Doctor added successfully' });
  } catch (error) {
    if (error.code === 'EREQUEST' && error.originalError && error.originalError.number === 2601) {
      return res.status(400).json({ error: 'Doctor with the same ID already exists' });
    }
    console.error('Error adding Doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//Check Doctor ID if it exists or not
app.post('/checkDoctorID', async (req, res) => {
  try {
      const { doctorid } = req.body;
      // Execute a query to check if the doctorid exists
      const result = await pool.query(`SELECT COUNT(*) AS count FROM Doctor WHERE doctorid = '${doctorid}'`);
      const exists = result.recordset[0].count > 0;
      res.json({ exists: exists });
  } catch (error) {
      console.error('Error checking Doctor ID:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
// Update doctor details
app.put('/doctors/:id', async (req, res) => {
  const doctorId = req.params.id;
  const { fname, lname, specialization, gender, salary, status } = req.body;

  try {
    await pool.query(`UPDATE Doctor SET fname = '${fname}', lname = '${lname}', specialization = '${specialization}', gender = '${gender}', salary = ${salary}, status = '${status}' WHERE doctorid = '${doctorId}'`);
    res.status(200).json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch doctor details
app.get('/doctors/:id', async (req, res) => {
  const doctorId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM Doctor WHERE doctorid = '${doctorId}'`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Doctor ID not found' });
    }
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Related Programming End Here

// List Of Medicine
// For Medicine List
app.get('/medicines', async (req, res) => {
  try {
    let query = 'SELECT * FROM Medicine';

    // Check if status query parameter is provided
    if (req.query.status) {
      const status = req.query.status;
      query += ` WHERE status = '${status}'`;
    }

    const result = await pool.query(query);
    const medicines = result.recordset;
    res.json(medicines);
  } catch (error) {
    console.error('Error fetching medicines data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Search Medicine
app.get('/searchMedicines', async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from request query parameters

    // Execute a query to search for medicines based on ID, name, or manufacturer
    const result = await pool.query(`SELECT * FROM Medicine WHERE medicineid LIKE '%${query}%' OR medicineName LIKE '%${query}%' OR manufacturer LIKE '%${query}%'`);
    const medicines = result.recordset;
    
    res.json(medicines);
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// To Add Medicine
app.post('/add_Medicine', async (req, res) => {
  try {
    const { medicineid, medicineName, manufacturer, costPerUnit, status} = req.body;
    // Execute a query to insert a new record into the Branch table
    await pool.query(`INSERT INTO Medicine (medicineid, medicineName, manufacturer, costPerUnit, status) 
    VALUES ('${medicineid}', '${medicineName}', '${manufacturer}', '${costPerUnit}', '${status}')`);
    res.status(201).json({ message: 'Medicine added successfully' });
  } catch (error) {
    console.error('Error adding Medicicne:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Check Medicine ID Exist Or Not
app.post('/checkMedicineID', async (req, res) => {
  try {
    const { medicineid } = req.body;

    // Execute a query to check if the medicineid exists
    const result = await pool.query(`SELECT COUNT(*) AS count FROM Medicine WHERE medicineid = '${medicineid}'`);
    const exists = result.recordset[0].count > 0;

    res.json({ exists: exists });
  } catch (error) {
    console.error('Error checking Medicine ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/medicines/:id', async (req, res) => {
  const medicineId = req.params.id;
  const { medicineName, manufacturer, costPerUnit, status } = req.body;

  try {
    await pool.query(`UPDATE Medicine SET medicineName = '${medicineName}', manufacturer = '${manufacturer}', costPerUnit = ${costPerUnit}, status = '${status}' WHERE medicineid = '${medicineId}'`);
    res.status(200).json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch medicine details
app.get('/medicines/:id', async (req, res) => {
  const medicineId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM Medicine WHERE medicineid = '${medicineId}'`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Medicine ID not found' });
    }
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Services routes
// List For Services
// For Services List
app.get('/fetch_services', async (req, res) => {
  try {
    let query = 'SELECT * FROM Services';

    // Check if serviceType query parameter is provided
    if (req.query.serviceType) {
      const serviceType = req.query.serviceType;
      query += ` WHERE serviceType = '${serviceType}'`;
    }

    const result = await pool.query(query);
    const services = result.recordset;
    res.json(services);
  } catch (error) {
    console.error('Error fetching services data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// For Search Services
app.get('/searchServices', async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from request query parameters

    // Execute a query to search for services based on ID, name, or manufacturer
    const result = await pool.query(`SELECT * FROM Services WHERE serviceid LIKE '%${query}%' OR fullname LIKE '%${query}%'`);
    const services = result.recordset;
    
    res.json(services);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Check Service ID Exist Or Not
app.post('/checkServiceID', async (req, res) => {
  try {
    const { serviceid } = req.body;
    // Execute a query to check if the serviceid exists
    const result = await pool.query(`SELECT COUNT(*) AS count FROM Services WHERE serviceid = '${serviceid}'`);
    const exists = result.recordset[0].count > 0;
    res.json({ exists: exists });
  } catch (error) {
    console.error('Error checking Service ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// To Add Services
app.post('/add_Service', async (req, res) => {
  try {
    const { serviceid,fullname, cost_per_day, serviceType} = req.body;

    // Execute a query to insert a new record into the Branch table
    await pool.query(`INSERT INTO Services(serviceid, fullname, cost_per_day, serviceType) 
    VALUES ('${serviceid}', '${fullname}', '${cost_per_day}', '${serviceType}')`);

    res.status(201).json({ message: 'Service added successfully' });
  } catch (error) {
    console.error('Error adding Service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View Ward
// Endpoint to get all wards with optional sorting
app.get('/wards', async (req, res) => {
  try {
    // Get the sort criterion from the query parameters
    const { sortBy } = req.query;

    // Base query to select all wards
    let query = 'SELECT * FROM Ward';

    // Append the ORDER BY clause if the sortBy parameter is provided
    if (sortBy === 'wardno') {
      query += ' ORDER BY wardno';
    } else if (sortBy === 'capacity') {
      query += ' ORDER BY capacity';
    }

    // Execute the query
    const result = await pool.query(query);
    const wards = result.recordset;

    // Send the result as JSON
    res.json(wards);
  } catch (error) {
    console.error('Error fetching wards data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Endpoint to search for wards by ward number or ward type
app.get('/searchWards', async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from request query parameters

    // Execute a query to search for wards based on ward number or ward type
    const result = await pool.query(`SELECT * FROM Ward WHERE wardno LIKE '%${query}%' OR wardtype LIKE '%${query}%'`);
    const wards = result.recordset;

    // Send the result as JSON
    res.json(wards);
  } catch (error) {
    console.error('Error searching wards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// To Add Ward
app.post('/add_Ward', async (req, res) => {
  try {
    const { wardno, wardtype, capacity } = req.body;

    // Execute a query to insert a new record into the Ward table
    await pool.query(`INSERT INTO Ward (wardno, wardtype, capacity) 
    VALUES ('${wardno}', '${wardtype}', '${capacity}')`);

    res.status(201).json({ message: 'Ward added successfully' });
  } catch (error) {
    if (error.code === 'EREQUEST' && error.originalError && error.originalError.number === 2601) {
      return res.status(400).json({ error: 'Ward with the same number already exists' });
    }
    console.error('Error adding Ward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// To Check If WardNO exists or not
app.post('/checkWardNo', async (req, res) => {
  try {
      const { wardno } = req.body;
      // Execute a query to check if the wardno exists
      const result = await pool.query(`SELECT COUNT(*) AS count FROM Ward WHERE wardno = '${wardno}'`);
      const exists = result.recordset[0].count > 0;
      res.json({ exists: exists });
  } catch (error) {
      console.error('Error checking Ward number:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.put('/wards/:id', async (req, res) => {
  const wardId = req.params.id;
  const { capacity, wardtype } = req.body;

  try {
    await pool.query(`UPDATE Ward SET wardtype = '${wardtype}', capacity = ${capacity} WHERE wardno = '${wardId}'`);
    res.status(200).json({ message: 'Ward updated successfully' });
  } catch (error) {
    console.error('Error updating ward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/ward/:id', async (req, res) => {
  const wardId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM Ward WHERE wardno = '${wardId}'`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Ward ID not found' });
    }
  } catch (error) {
    console.error('Error fetching ward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Staff Members List
app.get('/staffMembers', async (req, res) => {
  try {
    let status;
    let add;
    if (req.query.status) {
      status = req.query.status;
       if(status === 'Active'){
        query = `SELECT * FROM ActiveStaffMembers`;
       }
       else if(status === 'Resigned'){
        query = `SELECT * FROM ResignedStaffMembers`;
       }
       else if(status === 'Retired'){
        query = `SELECT * FROM RetiredStaffMembers`;
       }
       else if(status === 'Deceased'){
        query = `SELECT * FROM DeceasedStaffMembers`;
       }

    } else{
      query = `SELECT * FROM AllStaffMembers`
    }
    // let query = `
    //   SELECT staffid  AS staff_id, fname, lname, designation, gender, salary, status FROM RegisterartionStaff
    //   ${add}
    //   UNION ALL
    //   SELECT cashierid  AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status FROM Cashier
    //   ${add}`;

    const result = await pool.query(query);
    const staffMembers = result.recordset;
    res.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff members data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// For Search Staff Member
app.get('/searchStaffMembers', async (req, res) => {
  try {
    const { query } = req.query; // Get the search query from request query parameters

    // Execute a query to search for staff members based on ID or first name
    const result = await pool.query(`
      SELECT staffid AS staff_id, fname, lname, designation, gender, salary, status 
      FROM RegisterartionStaff
      WHERE (staffid LIKE '%${query}%' OR fname LIKE '%${query}%' OR lname LIKE '%${query}%')
      UNION ALL
      SELECT cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status 
      FROM Cashier 
      WHERE (cashierid LIKE '%${query}%' OR fname LIKE '%${query}%' OR lname LIKE '%${query}%')`);
      
    const staffMembers = result.recordset;
    res.json(staffMembers);
  } catch (error) {
    console.error('Error searching staff members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Add Staff Member
// Endpoint to add a staff member
app.post('/add_staff_member', async (req, res) => {
  try {
    const { staff_id, fname, lname, designation, gender, salary, status } = req.body;

    // Execute the stored procedure to add the staff member
    await pool.query(`EXEC AddStaffMember @staff_id='${staff_id}', @fname='${fname}', @lname='${lname}', @designation='${designation}', @gender='${gender}', @salary=${salary}, @status='${status}'`);

    res.status(201).json({ message: 'Staff member added successfully' });
  } catch (error) {
    console.error('Error adding staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to check if staff ID exists
app.post('/check_staff_id', async (req, res) => {
  try {
    const { staff_id } = req.body;

    // Execute a query to check if the staff ID exists
    const result = await pool.query`SELECT COUNT(*) AS count FROM Cashier WHERE cashierid = ${staff_id} UNION ALL SELECT COUNT(*) FROM RegisterartionStaff WHERE staffid = ${staff_id}`;

    const exists = result.recordset.reduce((total, current) => total + current.count, 0) > 0;
    
    res.json({ exists: exists });
  } catch (error) {
    console.error('Error checking staff ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/staff/:id', async (req, res) => {
  const staffId = req.params.id;
  const { fname, lname, designation, gender, salary, status } = req.body;

  try {
    await pool.query(`EXEC UpdateStaffMember @staff_id = '${staffId}', @fname = '${fname}', @lname = '${lname}', @designation = '${designation}', @gender = '${gender}', @salary = ${salary}, @status = '${status}'`);
    res.status(200).json({ message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/staff/:id', async (req, res) => {
  const staffId = req.params.id;

  try {
    const result = await pool.query( `
    SELECT staffid  AS staff_id, fname, lname, designation, gender, salary, status FROM RegisterartionStaff
    where staffid = '${staffId}'
    UNION ALL
    SELECT cashierid  AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status FROM Cashier
    where cashierid = '${staffId}'`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Staff ID not found' });
    }
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/services/:id', async (req, res) => {
  const serviceId = req.params.id;
  const { fullname, cost_per_day, serviceType } = req.body;

  try {
    await pool.query(`UPDATE Services SET fullname = '${fullname}', cost_per_day = ${cost_per_day}, serviceType = ${serviceType} WHERE serviceid = '${serviceId}'`);
    res.status(200).json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/ser_c&p/:id', async (req, res) => {
  const serviceId = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM Services WHERE serviceid = '${serviceId}'`);
    if (result.recordset.length > 0) {
      res.status(200).json(result.recordset[0]);
    } else {
      res.status(404).json({ error: 'Service ID not found' });
    }
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/add_patient', async (req, res) => {
  const { admissionno, fname, lname, cnic_no, gender, phone, age, wardno, doctorid, staffid, services, medicalInfo } = req.body;

  try {
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      // Insert into InPatient table
      await request.query(`
        INSERT INTO dbo.InPatient (admissionno, fname, lname, cnic_no, gender, phone, age, wardno, doctorid, staffid)
        VALUES ('${admissionno}', '${fname}', '${lname}', '${cnic_no}', '${gender}', '${phone}', ${age}, '${wardno}', '${doctorid}', '${staffid}')
      `);

      // Insert into InPatientServices table if services are provided
      if (services && services.length > 0) {
        for (const service of services) {
          const { serviceid, no_of_days } = service;
          await request.query(`
            INSERT INTO dbo.InPatientServices (admissionno, serviceid, no_of_days)
            VALUES ('${admissionno}', '${serviceid}', ${no_of_days})
          `);
        }
      }

      // Insert into InPatientMedicalInfo table if medical info is provided
      if (medicalInfo && medicalInfo.length > 0) {
        for (const medInfo of medicalInfo) {
          const { medicineid, quantity } = medInfo;
          await request.query(`
            INSERT INTO dbo.InPaitentMedicalInfo (admissionno, medicineid, quantity)
            VALUES ('${admissionno}', '${medicineid}', ${quantity})
          `);
        }
      }

      await transaction.commit();
      res.status(201).json({ message: 'Patient and related info added successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error during transaction, rolling back:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Transaction setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/add_outpatient', async (req, res) => {
  const { patientid, fname, lname, cnic_no, age, gender, phone, doctorid, staffid, medicalInfo } = req.body;

  try {
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction);

      // Insert into OutPatient table
      await request.query(`
        INSERT INTO dbo.OutPatient (patientid, fname, lname, cnic_no, age, gender, phone, doctorid, staffid)
        VALUES ('${patientid}', '${fname}', '${lname}', '${cnic_no}', ${age}, '${gender}', '${phone}', '${doctorid}', '${staffid}')
      `);

      // Insert into OutPatientMedicalInfo table if medical info is provided
      if (medicalInfo && medicalInfo.length > 0) {
        for (const medInfo of medicalInfo) {
          const { medicineid, quantity } = medInfo;
          await request.query(`
            INSERT INTO dbo.OutPaitentMedicalInfo (patientid, medicineid, quantity)
            VALUES ('${patientid}', '${medicineid}', ${quantity})
          `);
        }
      }
      await request.query(`
      EXEC CalculateOutpatientBill @patientid = '${patientid}'
      `);
      await transaction.commit();
      res.status(201).json({ message: 'Outpatient and related info added successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error during transaction, rolling back:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Transaction setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/checkPatientID', async (req, res) => {
  try {
    const { patientid } = req.body;
    const result = await pool.query(`SELECT COUNT(*) AS count FROM OutPatient WHERE patientid = '${patientid}'`);
    const exists = result.recordset[0].count > 0;
    res.json({ exists: exists });
  } catch (error) {
    console.error('Error checking patient ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/activeDoctors', async (req, res) => {
  try {
      const result = await pool.query`SELECT doctorid, fname, lname, specialization FROM Doctor WHERE status = 'Active'`;
      res.json(result.recordset);
  } catch (err) {
      console.error('Error fetching active doctors:', err);
      res.status(500).send('Error fetching active doctors');
  }
});

app.get('/activeStaff', async (req, res) => {
  try {
      const result = await pool.query(`SELECT staffid, fname, lname, designation FROM RegisterartionStaff WHERE status = 'Active' and designation = 'Registrar'`);
      res.json(result.recordset);
  } catch (err) {
      console.error('Error fetching active staff:', err);
      res.status(500).send('Error fetching active staff');
  }
});

app.get('/activeMedicines', async (req, res) => {
  try {
      const result = await pool.query(`SELECT medicineid, medicineName, manufacturer FROM Medicine WHERE status = 'Available'`);
      res.json(result.recordset);
  } catch (err) {
      console.error('Error fetching active medicines:', err);
      res.status(500).send('Error fetching active medicines');
  }
});

// For Outpatients List
app.get('/outpatients', async (req, res) => {
  try {
    let query = 'SELECT patientid, fname, lname, cnic_no, gender, age, phone FROM Outpatient';

    // Check if gender query parameter is provided
    if (req.query.gender) {
      const gender = req.query.gender;
      query += ` WHERE gender = '${gender}'`;
    }

    const result = await pool.query(query);
    const outpatients = result.recordset;
    res.json(outpatients);
  } catch (error) {
    console.error('Error fetching outpatients data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Search Outpatient
app.get('/searchOutpatients', async (req, res) => {
  try {
      const { query } = req.query; // Get the search query from request query parameters

      // Execute a query to search for outpatients based on ID or first name
      const result = await pool.query(`SELECT patientid, fname, lname, cnic_no, gender, age, phone FROM Outpatient WHERE patientid LIKE '%${query}%' OR fname LIKE '%${query}%' OR lname LIKE '%${query}%'`);
      const outpatients = result.recordset;
      
      res.json(outpatients);
  } catch (error) {
      console.error('Error searching outpatients:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// For Inpatients List
app.get('/inpatients', async (req, res) => {
  try {
    let query = 'SELECT admissionno, fname, lname, cnic_no, gender, age, phone, status FROM Inpatient';

    // Check if status query parameter is provided
    if (req.query.status) {
      const status = req.query.status;
      query += ` WHERE status = '${status}'`;
    }

    const result = await pool.query(query);
    const inpatients = result.recordset;
    res.json(inpatients);
  } catch (error) {
    console.error('Error fetching inpatients data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For Search Inpatient
app.get('/searchInpatients', async (req, res) => {
  try {
      const { query } = req.query; // Get the search query from request query parameters

      // Execute a query to search for inpatients based on ID, first name, or last name
      const result = await pool.query(`SELECT admissionno, fname, lname, cnic_no, gender, age, phone, status FROM Inpatient WHERE admissionno LIKE '%${query}%' OR fname LIKE '%${query}%' OR lname LIKE '%${query}%'`);
      const inpatients = result.recordset;
      
      res.json(inpatients);
  } catch (error) {
      console.error('Error searching inpatients:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Check InPatient ID
app.post('/checkInPatientID', async (req, res) => {
  const { admissionno } = req.body;
  try {
    const result = await pool.query(`SELECT COUNT(*) AS count FROM Inpatient WHERE admissionno = '${admissionno}'`);
    const exists = result.recordset[0].count > 0;
    res.json({ exists });
  } catch (err) {
    console.error('Error checking patient ID:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
// to Add inpatient
app.post('/add_inpatient', async (req, res) => {
  const {
    admissionno, fname, lname, cnic_no, age, gender, phone, doctorid, staffid, wardno, medicalInfo, serviceInfo, status
  } = req.body;

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const request = new sql.Request(transaction);
    await request.query(`
      INSERT INTO Inpatient (admissionno, fname, lname, cnic_no, age, gender, phone, doctorid, staffid, wardno, status)
      VALUES ('${admissionno}', '${fname}', '${lname}', '${cnic_no}', ${age}, '${gender}', '${phone}', '${doctorid}', '${staffid}', '${wardno}', '${status}')
    `);

    for (const medicine of medicalInfo) {
      await request.query(`
        INSERT INTO InPaitentMedicalInfo (admissionno, medicineid, quantity)
        VALUES ('${admissionno}', '${medicine.medicineid}', ${medicine.quantity})
      `);
    }

    for (const service of serviceInfo) {
      await request.query(`
        INSERT INTO InpatientServices (admissionno, serviceid, no_of_days)
        VALUES ('${admissionno}', '${service.serviceid}', ${service.no_of_days})
      `);
    }
    await request.query(`EXEC CalculateInpatientBill @admissionno = '${admissionno}'`);

    await transaction.commit();
    res.status(200).json({ message: 'Inpatient and related info added successfully' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error adding inpatient:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
// to fetch wards
app.get('/wards', async (req, res) => {
  try {
    const result = await pool.query`SELECT wardno, wardtype, capacity FROM Ward`;
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching wards:', err);
    res.status(500).json({ error: 'Database error' });
  }
});
app.get('/activeServices', async (req, res) => {
  try {
    const result = await pool.query`SELECT serviceid, fullname, serviceType FROM Services`;
    const service = result.recordset;
    res.json(service);
  } catch (err) {
    console.error('Error fetching service information:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.get('/check_patient/:admissionno', async (req, res) => {
  const { admissionno } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM Inpatient WHERE admissionno = '${admissionno}'`);

      if (result.recordset.length > 0) {
          const patient = result.recordset[0];

          // Fetch medicines
          const medicines = await pool.query(`SELECT * FROM InPaitentMedicalInfo WHERE admissionno = '${admissionno}'`);
          patient.medicalInfo = medicines.recordset;

          // Fetch services
          const services = await pool.query(`SELECT * FROM InpatientServices WHERE admissionno = '${admissionno}'`);
          patient.serviceInfo = services.recordset;
          res.json({ exists: true, patient });
      } else {
          res.json({ exists: false });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.post('/update_patient', async (req, res) => {
  const { admissionno, patientData, umedicines, services } = req.body;
  console.log('Received Data:');
  console.log('Admission No:', admissionno);
  console.log('Patient Data:', patientData);
  console.log('Medicines:', umedicines);
  console.log('Services:', services);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Update patient data
    const updatePatientQuery = `
      UPDATE Inpatient
      SET fname = '${patientData.fname}', lname = '${patientData.lname}', cnic_no = '${patientData.cnic_no}',
          gender = '${patientData.gender}', age = ${patientData.age}, phone = '${patientData.phone}',
          doctorid = '${patientData.doctorid}', staffid = '${patientData.staffid}', wardno = '${patientData.wardno}',
          status = '${patientData.status}'
      WHERE admissionno = '${admissionno}'
    `;
    await transaction.request().query(updatePatientQuery);

    // Delete existing medicines and services
    const deleteMedicinesQuery = `DELETE FROM InPaitentMedicalInfo WHERE admissionno = '${admissionno}'`;
    const deleteServicesQuery = `DELETE FROM InpatientServices WHERE admissionno = '${admissionno}'`;

    console.log(`Executing delete query for medicines: ${deleteMedicinesQuery}`);
    await transaction.request().query(deleteMedicinesQuery);

    console.log(`Executing delete query for services: ${deleteServicesQuery}`);
    await transaction.request().query(deleteServicesQuery);

    // Insert new medicines
    for (const med of umedicines) {
      const insertMedicineQuery = `
        INSERT INTO InPaitentMedicalInfo (admissionno, medicineid, quantity)
        VALUES ('${admissionno}', '${med.medicineid}', ${med.quantity})
      `;
      console.log(`Executing insert query for medicine: ${insertMedicineQuery}`);
      await transaction.request().query(insertMedicineQuery);
    }

    // Insert new services
    for (const serv of services) {
      const insertServiceQuery = `
        INSERT INTO InpatientServices (admissionno, serviceid, no_of_days)
        VALUES ('${admissionno}', '${serv.serviceid}', ${serv.no_of_days})
      `;
      console.log(`Executing insert query for service: ${insertServiceQuery}`);
      await transaction.request().query(insertServiceQuery);
    }
    const deleteInpatientBillQuery = `DELETE FROM InpatientBill WHERE admissionno = '${admissionno}'`;
    await transaction.request().query(deleteInpatientBillQuery);

    await transaction.request().query(`EXEC CalculateInpatientBill @admissionno = '${admissionno}'`);

    await transaction.commit();
    res.send('Patient data updated successfully');
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/check_outpatient/:admissionno', async (req, res) => {
  const { admissionno } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM Outpatient WHERE patientid = '${admissionno}'`);

      if (result.recordset.length > 0) {
          const patient = result.recordset[0];

          // Fetch medicines
          const medicines = await pool.query(`SELECT * FROM OutpaitentMedicalInfo WHERE patientid = '${admissionno}'`);
          patient.medicalInfo = medicines.recordset;

          res.json({ exists: true, patient });
      } else {
          res.json({ exists: false });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
app.post('/update_outpatient', async (req, res) => {
  const { admissionno, patientData, umedicines } = req.body;
  console.log('Received Data:');
  console.log('Admission No:', admissionno);
  console.log('Patient Data:', patientData);
  console.log('Medicines:', umedicines);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Update patient data
    const updatePatientQuery = `
      UPDATE Outpatient
      SET fname = '${patientData.fname}', lname = '${patientData.lname}', cnic_no = '${patientData.cnic_no}',
          gender = '${patientData.gender}', age = ${patientData.age}, phone = '${patientData.phone}',
          doctorid = '${patientData.doctorid}', staffid = '${patientData.staffid}'
      WHERE patientid = '${admissionno}'
    `;
    await transaction.request().query(updatePatientQuery);

    // Delete existing medicines
    const deleteMedicinesQuery = `DELETE FROM OutpaitentMedicalInfo WHERE patientid = '${admissionno}'`;
    console.log(`Executing delete query for medicines: ${deleteMedicinesQuery}`);
    await transaction.request().query(deleteMedicinesQuery);

    // Insert new medicines
    for (const med of umedicines) {
      const insertMedicineQuery = `
        INSERT INTO OutpaitentMedicalInfo (patientid, medicineid, quantity)
        VALUES ('${admissionno}', '${med.medicineid}', ${med.quantity})
      `;
      console.log(`Executing insert query for medicine: ${insertMedicineQuery}`);
      await transaction.request().query(insertMedicineQuery);
    }

    const deleteOutPatientBillQuery = `DELETE FROM OutpatientBill WHERE patientid = '${admissionno}'`;
    await transaction.request().query(deleteOutPatientBillQuery);

    await transaction.request().query(`EXEC CalculateOutpatientBill @patientid = '${admissionno}'`);

    await transaction.commit();
    res.send('Outpatient data updated successfully');
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.get('/checkinpatient/:patientid', async (req, res) => {
  const { patientid } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM Inpatient WHERE admissionno = '${patientid}'`);
      res.json({ exists: result.recordset.length > 0 });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.get('/checkoutpatient/:patientid', async (req, res) => {
  const { patientid } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM OutPatient WHERE patientid = '${patientid}'`);
      res.json({ exists: result.recordset.length > 0 });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
app.get('/checkinpatientbill/:patientid', async (req, res) => {
  const { patientid } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM InpatientBill WHERE admissionno = '${patientid}'`);
      if (result.recordset.length === 0) {
          res.json({ status: 'not_paid' }); // Bill not found
      } else {
          const billStatus = result.recordset[0].status;
          res.json({ status: billStatus });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.get('/checkoutpatientbill/:patientid', async (req, res) => {
  const { patientid } = req.params;
  try {
      const result = await pool.query(`SELECT * FROM OutpatientBill WHERE patientid = '${patientid}'`);
      if (result.recordset.length === 0) {
          res.json({ status: 'not_paid' }); // Bill not found
      } else {
          const billStatus = result.recordset[0].status;
          console.log(billStatus)
          res.json({ status: billStatus });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.post('/generate_inpatient_bill', async (req, res) => {
  const { patientid } = req.body;
  try {
    const bill = await pool.query(`SELECT * FROM InpatientBill WHERE admissionno = '${patientid}'`);
    if (bill.recordset.length === 0) {
      return res.status(404).json({ error: 'No bill found for the given patient ID' });
    }
    const { service_fee, medical_fee, tax, total_amount } = bill.recordset[0];
    res.json({ service_fee, medical_fee, tax, total_amount });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
app.post('/generate_outpatient_bill', async (req, res) => {
  const { patientid } = req.body;
  try {
    const bill = await pool.query(`SELECT * FROM OutpatientBill WHERE patientid = '${patientid}'`);
    if (bill.recordset.length === 0) {
      return res.status(404).json({ error: 'No bill found for the given patient ID' });
    }
    const { basicfee, medical_fee, tax, total_amount } = bill.recordset[0];
    res.json({ basicfee, medical_fee, tax, total_amount });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/pay_inpatient_bill', async (req, res) => {
  const { patientid, amountPaid, cashierid, patientStatus } = req.body;
  try {
    await pool.query(`UPDATE InpatientBill SET status = 'Paid', cashierid = '${cashierid}' WHERE admissionno = '${patientid}'`);
    await pool.query(`UPDATE Inpatient SET status = '${patientStatus}' WHERE admissionno = '${patientid}'`);
    res.send('Payment successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/pay_outpatient_bill', async (req, res) => {
  const { patientid, amountPaid, cashierid } = req.body;
  try {
    await pool.query(`UPDATE OutpatientBill SET status = 'Paid', cashierid = '${cashierid}' WHERE patientid = '${patientid}'`);
    res.send('Payment successful');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
app.get('/inpatientbills', async (req, res) => {
  const { status } = req.query;
  let query = `SELECT * FROM InpatientBill`;
  if (status) {
      query += ` WHERE status = '${status}'`;
  }
  try {
      const result = await pool.query(query);
      res.json(result.recordset);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.get('/searchInpatientBills', async (req, res) => {
  const { query } = req.query;
  let sqlQuery = `SELECT * FROM InpatientBill WHERE admissionno LIKE '%${query}%'`;
  try {
      const result = await pool.query(sqlQuery);
      res.json(result.recordset);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
app.get('/outpatientbills', async (req, res) => {
  const { status } = req.query;
  let query = `SELECT * FROM OutpatientBill`;
  if (status) {
      query += ` WHERE status = '${status}'`;
  }
  try {
      const result = await pool.query(query);
      res.json(result.recordset);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});
app.get('/searchOutpatientBills', async (req, res) => {
  const { query } = req.query;
  let sqlQuery = `SELECT * FROM OutpatientBill WHERE patientid LIKE '%${query}%'`;
  try {
      const result = await pool.query(sqlQuery);
      res.json(result.recordset);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
