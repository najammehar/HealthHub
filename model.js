const sql = require('mssql/msnodesqlv8');

const connectionString = 'Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-R9AR0VH\\SQLEXPRESS,1433;Database=HMS;UID=sa;PWD=123456;Encrypt=no;';

// Create a pool
const pool = new sql.ConnectionPool({ connectionString: connectionString });

// Connect to the database
pool.connect().then(() => {
    console.log('Connected to SQL Server');
}).catch(err => {
    console.error('Error connecting to database:', err);
});
module.exports = pool;