create database HMS
use HMS
-------------------------------------------------Tables----------------------------------------------------------------
create table RegisterartionStaff(
staffid varchar(4) primary key,
fname varchar(30),
lname varchar(30),
designation varchar(30),
gender varchar(10) NOT NULL CHECK (Gender in('Male', 'Female', 'Other')),
salary DECIMAL(10, 2) CHECK (salary >= 0),
status varchar(30) NOT NULL CHECK (Status in('Active', 'Resigned', 'Retired', 'Deceased'))
);

create table Doctor(
doctorid varchar(4) primary key,
fname varchar(20),
lname varchar(20),
specialization varchar(30),
gender varchar(10) NOT NULL CHECK (Gender in('Male', 'Female', 'Other')),
salary DECIMAL(10, 2) CHECK (salary >= 0),
status varchar(30) NOT NULL CHECK (Status in('Active', 'Resigned', 'Retired', 'Deceased'))
);

create table Ward(
wardno varchar(4) primary key,
wardtype varchar(100),
capacity int
);

create table Services(
serviceid varchar(4) primary key,
fullname varchar(50),
cost_per_day DECIMAL(10, 2) CHECK (cost_per_day >= 0),
serviceType varchar(50)  NOT NULL CHECK (serviceType in('Clinical', 'Emergency', 'Support'))
);

create table Medicine(
medicineid varchar(4) primary key,
medicineName varchar(100) NOT NULL,
manufacturer varchar(100),
costPerUnit DECIMAL(10, 2) CHECK (costPerUnit >= 0),
status varchar(30) NOT NULL CHECK (Status in('Available', 'Not Available', 'Discontinued'))
);

create table Cashier(
cashierid varchar(4) primary key,
fname varchar(20),
lname varchar(20),
salary DECIMAL(10, 2) CHECK (salary >= 0),
gender varchar(10) NOT NULL CHECK (Gender in('Male', 'Female', 'Other')),
status varchar(30) NOT NULL CHECK (Status in('Active', 'Resigned', 'Retired', 'Deceased'))
);

create table InPatient(
admissionno varchar(4) primary key,
fname varchar(20),
lname varchar(20),
cnic_no varchar(13),
gender varchar(10) NOT NULL CHECK (Gender in('Male', 'Female', 'Other')),
phone varchar (15),
age int CHECK (age > 0),
wardno VARCHAR(4) Foreign key References Ward(wardno),
doctorid varchar(4) Foreign key References Doctor(doctorid),
staffid varchar(4) Foreign key References RegisterartionStaff(staffid)
);

create table OutPatient(
patientid varchar(4) primary key,
fname varchar(20),
lname varchar(20),
cnic_no varchar(13),
age int CHECK (age > 0),
gender varchar(10) NOT NULL CHECK (Gender in('Male', 'Female', 'Other')),
phone varchar (15),
doctorid varchar(4) Foreign key References Doctor(doctorid),
staffid varchar(4) Foreign key References RegisterartionStaff(staffid),
status varchar(30) NOT NULL CHECK (Status in('Admited', 'Discharged', 'Deceased'))
);
	
create table InPaitentMedicalInfo(
admissionno varchar(4) FOREIGN KEY REFERENCES InPatient(admissionno),
medicineid varchar(4) FOREIGN KEY REFERENCES Medicine(medicineid),
primary key(admissionno,medicineid),
quantity int
);

create table OutPaitentMedicalInfo(
patientid varchar(4) FOREIGN KEY REFERENCES OutPatient(patientid),
medicineid varchar(4) FOREIGN KEY REFERENCES Medicine(medicineid),
primary key(patientid,medicineid),
quantity int
);

create table InpatientServices(
admissionno varchar(4) FOREIGN KEY REFERENCES InPatient(admissionno) , 
serviceid varchar(4) FOREIGN KEY REFERENCES Services(serviceid),
primary key(admissionno,serviceid),
no_of_days int
);

create table InpatientBill(
medical_fee DECIMAL(10, 2) CHECK (medical_fee >= 0),
service_fee DECIMAL(10, 2) CHECK (service_fee >= 0),
tax DECIMAL(10, 2) CHECK (tax >= 0),
total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
admissionno varchar(4) FOREIGN KEY REFERENCES InPatient(admissionno),
primary key(admissionno),
cashierid varchar(4) FOREIGN KEY REFERENCES Cashier(cashierid),
status varchar(20) CHECK (status in('Paid', 'Pending'))
);
patientid, basicfee, medical_fee, tax, total_amount, cashierid, status

create table OutpatientBill(
basicfee int,
medical_fee DECIMAL(10, 2) CHECK (medical_fee >= 0),
tax DECIMAL(10, 2) CHECK (tax >= 0),
total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
patientid varchar(4) FOREIGN KEY REFERENCES OutPatient(patientid),
primary key (patientid),
cashierid varchar(4) FOREIGN KEY REFERENCES Cashier(cashierid),
status varchar(20) CHECK (status in('Paid', 'Pending'))
);
----------------------------------------------------Procedures-----------------------------------------------------------
CREATE PROCEDURE AddStaffMember
	@staff_id varchar(4),
    @fname VARCHAR(20),
    @lname VARCHAR(20),
    @designation VARCHAR(20),
    @gender VARCHAR(10),
    @salary DECIMAL(10, 2),
	@status varchar(30)
AS
BEGIN
    SET NOCOUNT ON;  
	IF @designation = 'Cashier'
    BEGIN
        INSERT INTO Cashier (cashierid,fname, lname, salary, gender, status)
        VALUES (@staff_id,@fname, @lname, @salary, @gender, @status);
    END
    ELSE
	BEGIN
        INSERT INTO RegisterartionStaff (staffid ,fname, lname, designation, gender, salary, status)
        VALUES (@staff_id,@fname, @lname, @designation, @gender, @salary, @status);
    END
END;


CREATE PROCEDURE UpdateStaffMember
    @staff_id VARCHAR(4),
    @fname VARCHAR(20),
    @lname VARCHAR(20),
    @designation VARCHAR(20),
    @gender VARCHAR(10),
    @salary DECIMAL(10, 2),
    @status VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    IF @designation = 'Cashier'
    BEGIN
        UPDATE Cashier
        SET fname = @fname, 
            lname = @lname, 
            salary = @salary, 
            gender = @gender, 
            status = @status
        WHERE cashierid = @staff_id;
    END
    ELSE
    BEGIN
        UPDATE RegisterartionStaff
        SET fname = @fname, 
            lname = @lname, 
            designation = @designation, 
            gender = @gender, 
            salary = @salary, 
            status = @status
        WHERE staffid = @staff_id;
    END
END;

CREATE PROCEDURE CalculateInpatientBill
    @admissionno varchar(4);
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @service_fee DECIMAL(18, 2) = 0;
    DECLARE @medical_fee DECIMAL(18, 2) = 0;
    DECLARE @tax DECIMAL(18, 2);
    DECLARE @total_amount DECIMAL(18, 2);
    
    -- Calculate service fee
    SELECT @service_fee = isnull(SUM(s.costPerDay * isv.no_of_days),0)
    FROM InpatientServices isv
    JOIN Services s ON isv.serviceid = s.serviceid
    WHERE isv.admissionno = @admissionno;
    
    -- Calculate medical fee
    SELECT @medical_fee = isnull(SUM(m.costPerUnit * imi.quantity),0)
    FROM InPaitentMedicalInfo imi
    JOIN Medicine m ON imi.medicineid = m.medicineid
    WHERE imi.admissionno = @admissionno;
    
    -- Calculate tax
    SET @tax = 0.025 * (@service_fee + @medical_fee);
    
    -- Calculate total amount
    SET @total_amount = @service_fee + @medical_fee + @tax;
    
    -- Insert into InpatientBill table
    INSERT INTO InpatientBill (admissionno, service_fee, medical_fee, tax, total_amount, cashierid, status)
    VALUES (@admissionno, @service_fee, @medical_fee, @tax, @total_amount, NULL, 'Pending');
END;


CREATE PROCEDURE CalculateOutpatientBill
    @patientid VARCHAR(50)
AS
BEGIN
    DECLARE @basicfee DECIMAL(10, 2) = 500;
    DECLARE @medical_fee DECIMAL(10, 2) = 0;
    DECLARE @tax DECIMAL(10, 2);
    DECLARE @total_amount DECIMAL(10, 2);

    -- Calculate medical fee
    SELECT @medical_fee = ISNULL(SUM(m.costPerUnit * omi.quantity),0)
    FROM dbo.OutPaitentMedicalInfo omi
    JOIN dbo.Medicine m ON omi.medicineid = m.medicineid
    WHERE omi.patientid = @patientid;

    -- Calculate tax
    SET @tax = (@basicfee + @medical_fee) * 0.025;

    -- Calculate total amount
    SET @total_amount = @basicfee + @medical_fee + @tax;

    -- Insert into OutpatientBill table
    INSERT INTO dbo.OutpatientBill (patientid, basicfee, medical_fee, tax, total_amount, cashierid, status)
    VALUES (@patientid, @basicfee, @medical_fee, @tax, @total_amount, NULL, 'Pending');
END;

--------------------------------------------------------Views-------------------------------------------------------------
CREATE VIEW ActiveStaffMembers AS
SELECT 
    staffid AS staff_id, fname, lname, designation, gender, salary, status
FROM 
    RegisterartionStaff
WHERE 
    status = 'Active'
UNION
SELECT 
    cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status
FROM 
    Cashier
WHERE 
    status = 'Active';


CREATE VIEW ResignedStaffMembers AS
SELECT 
    staffid AS staff_id, fname, lname, designation, gender, salary, status
FROM 
    RegisterartionStaff
WHERE 
    status = 'Resigned'
UNION
SELECT 
    cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status
FROM 
    Cashier
WHERE 
    status = 'Resigned';


CREATE VIEW RetiredStaffMembers AS
SELECT 
    staffid AS staff_id, fname, lname, designation, gender, salary, status
FROM 
    RegisterartionStaff
WHERE 
    status = 'Retired'
UNION
SELECT 
    cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status
FROM 
    Cashier
WHERE 
    status = 'Retired';


CREATE VIEW DeceasedStaffMembers AS
SELECT 
    staffid AS staff_id, fname, lname, designation, gender, salary, status
FROM 
    RegisterartionStaff
WHERE 
    status = 'Deceased'
UNION
SELECT 
    cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status
FROM 
    Cashier
WHERE 
    status = 'Deceased';


CREATE VIEW AllStaffMembers AS
SELECT 
    staffid AS staff_id, fname, lname, designation, gender, salary, status
FROM 
    RegisterartionStaff
UNION
SELECT 
    cashierid AS staff_id, fname, lname, 'Cashier' AS designation, gender, salary, status
FROM 
    Cashier


------------------------------------------------Triggers---------------------------------------------------------
CREATE TRIGGER trg_check_gender_RegisterartionStaff
ON RegisterartionStaff
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE Gender NOT IN ('Male', 'Female', 'Other'))
    BEGIN
        RAISERROR ('Gender must be Male, Female, or Other', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;

CREATE TRIGGER trg_check_status_Doctor
ON Doctor
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE Status NOT IN ('Active', 'Resigned', 'Retired', 'Deceased'))
    BEGIN
        RAISERROR ('Status must be Active, Resigned, Retired, or Deceased', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;




