$(document).ready(function() {
    // Function to fetch and display doctors
    function fetchDoctors(status) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/doctors',
            data: { status: status },
            success: function(doctors) {
                if (doctors.length > 0) {
                    displayDoctors(doctors);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#doctorList').empty(); // Clear doctor list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching doctors:', error);
                alert('Error fetching doctors. Please try again.');
            }
        });
    }

    // Function to display doctors
    function displayDoctors(doctors) {
        // Clear previous doctor list
        $('#doctorList').empty();

        // Create a table to display doctors
        const table = $('<table>').appendTo('#doctorList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('ID').appendTo(header);
        $('<th>').text('First Name').appendTo(header);
        $('<th>').text('Last Name').appendTo(header);
        $('<th>').text('Specialization').appendTo(header);
        $('<th>').text('Gender').appendTo(header);
        $('<th>').text('Salary').appendTo(header);
        $('<th>').text('Status').appendTo(header);

        // Add rows for each doctor
        doctors.forEach(function(doctor) {
            const row = $('<tr>').appendTo(table);
            $('<td>').text(doctor.doctorid).appendTo(row);
            $('<td>').text(doctor.fname).appendTo(row);
            $('<td>').text(doctor.lname).appendTo(row);
            $('<td>').text(doctor.specialization).appendTo(row);
            $('<td>').text(doctor.gender).appendTo(row);
            $('<td>').text(doctor.salary).appendTo(row);
            $('<td>').text(doctor.status).appendTo(row);
        });
    }




    function searchDoctors(query) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/searchDoctors',
            data: { query: query },
            success: function(doctors) {
                if (doctors.length > 0) {
                    displayDoctors(doctors);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#doctorList').empty(); // Clear doctor list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching doctors:', error);
                alert('Error searching doctors. Please try again.');
            }
        });
    }

    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        searchDoctors(query);
    });




    // Event listener for buttons
    $('#buttons button').click(function() {
        // Remove the 'active' class from all buttons
        $('#buttons button').removeClass('active');
        
        // Add the 'active' class to the clicked button
        $(this).addClass('active');

        // Fetch doctors based on the clicked button
        const status = $(this).text();
        if (status === 'All') {
            fetchDoctors();
        } else {
            fetchDoctors(status);
        }
    });

    // Function to add a new doctor
    $('#addDoctorForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const strSalary = $('#salary').val();
        const formData = {
            doctorid: $('#DoctorID').val(),
            fname: $('#fname').val(),
            lname: $('#lname').val(),
            specialization: $('#specialization').val(),
            gender: $('#gender').val(),
            salary: parseFloat(strSalary),
            status: $('#status').val()
        };

        // Send AJAX POST request to add a doctor
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/add_Doctor',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Doctor added successfully');
                // Clear form fields after successful submission
                $('#addDoctorForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error adding Doctor:', error);
                alert('Error adding Doctor. Please try again.');
            }
        });
    });

    // Event listener for checking if doctor ID already exists
    $('#DoctorID').keyup(function() {
        const doctorid = $(this).val();
        if (doctorid.trim() !== '') {
            // Send AJAX request to check if the doctorid already exists
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkDoctorID',
                data: JSON.stringify({ doctorid: doctorid }),
                contentType: 'application/json',
                success: function(response) {
                    // Response will be true if the doctorid exists, false otherwise
                    if (response.exists) {
                        $('#DoctorIDError').addClass('error'); // Add a CSS class to indicate error
                        $('#DoctorIDError').text('Doctor ID already exists');
                        $('#addButton').prop('disabled', true);
                    } else {
                        $('#DoctorIDError').removeClass('error'); // Remove the CSS class if doctorid is valid
                        $('#DoctorIDError').text('');
                        $('#addButton').prop('disabled', false);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error('Error checking Doctor ID:', errorThrown);
                }
            });
        }
    });

    // Fetch and display doctors when the page loads
    fetchDoctors();

    // Update
$('#uFname').prop('disabled', true);
$('#uLname').prop('disabled', true);
$('#uSpecialization').prop('disabled', true);
$('#uGender').prop('disabled', true);
$('#uSalary').prop('disabled', true);
$('#uStatus').prop('disabled', true);

// Event listener for doctor ID input field change
$('#uDoctorID').on('input', function() {
    var doctorId = $(this).val();
    if (doctorId) {
        $.ajax({
            type: 'GET',
            url: `http://localhost:4000/doctors/${doctorId}`,
            success: function(response) {
                $('#uFname').val(response.fname);
                $('#uLname').val(response.lname);
                $('#uSpecialization').val(response.specialization);
                $('#uGender').val(response.gender);
                $('#uSalary').val(response.salary);
                $('#uStatus').val(response.status);
                $('#uDoctorIDError').removeClass('error');
                $('#uDoctorIDError').text(''); // Clear any previous error message
                $('#updateButton').prop('disabled', false);
                $('#uFname').prop('disabled', false);
                $('#uLname').prop('disabled', false);
                $('#uSpecialization').prop('disabled', false);
                $('#uGender').prop('disabled', false);
                $('#uSalary').prop('disabled', false);
                $('#uStatus').prop('disabled', false);
            },
            error: function(xhr) {
                if (xhr.status === 404) {
                    $('#uDoctorIDError').addClass('error');
                    $('#uDoctorIDError').text('Doctor ID not found');
                    $('#updateButton').prop('disabled', true);
                    $('#uFname').prop('disabled', true);
                    $('#uLname').prop('disabled', true);
                    $('#uSpecialization').prop('disabled', true);
                    $('#uGender').prop('disabled', true);
                    $('#uSalary').prop('disabled', true);
                    $('#uStatus').prop('disabled', true);
                    $('#uFname').val('');
                    $('#uLname').val('');
                    $('#uSpecialization').val('');
                    $('#uGender').val('');
                    $('#uSalary').val('');
                    $('#uStatus').val('');
                } else {
                    console.error('Error fetching doctor:', xhr);
                    $('#uDoctorIDError').text('Error fetching doctor. Please try again.');
                }
            }
        });
    } else {
        $('#uFname').val('');
        $('#uLname').val('');
        $('#uSpecialization').val('');
        $('#uGender').val('');
        $('#uSalary').val('');
        $('#uStatus').val('');
        $('#uFname').prop('disabled', true);
        $('#uLname').prop('disabled', true);
        $('#uSpecialization').prop('disabled', true);
        $('#uGender').prop('disabled', true);
        $('#uSalary').prop('disabled', true);
        $('#uStatus').prop('disabled', true);
        $('#uDoctorIDError').removeClass('error');
        $('#uDoctorIDError').text('');
        $('#updateButton').prop('disabled', true);
    }
});

// Event listener for form submission
$('#updateDoctorForm').submit(function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    var formData = {
        doctorid: $('#uDoctorID').val(),
        fname: $('#uFname').val(),
        lname: $('#uLname').val(),
        specialization: $('#uSpecialization').val(),
        gender: $('#uGender').val(),
        salary: $('#uSalary').val(),
        status: $('#uStatus').val()
    };

    // Send AJAX PUT request to update a doctor
    $.ajax({
        type: 'PUT',
        url: `http://localhost:4000/doctors/${formData.doctorid}`, // Update the URL to include the doctor ID
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(response) {
            alert('Doctor updated successfully');
            // Clear form fields after successful submission
            $('#updateDoctorForm')[0].reset();
        },
        error: function(xhr, status, error) {
            console.error('Error updating doctor:', error);
            alert('Error updating doctor. Please try again.');
        }
    });
});
});
