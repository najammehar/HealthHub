$(document).ready(function() {
    function fetchStaffMembers(status) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/staffMembers',
            data: { status: status },
            success: function(staffMembers) {
                if (staffMembers.length > 0) {
                    displayStaffMembers(staffMembers);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#staffMemberList').empty(); // Clear staff member list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching staff members:', error);
                alert('Error fetching staff members. Please try again.');
            }
        });
    }
    
    // Function to display staff members
    function displayStaffMembers(staffMembers) {
        // Clear previous staff member list
        $('#staffMemberList').empty();
    
        // Create a table to display staff members
        const table = $('<table>').appendTo('#staffMemberList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('ID').appendTo(header);
        $('<th>').text('First Name').appendTo(header);
        $('<th>').text('Last Name').appendTo(header);
        $('<th>').text('Designation').appendTo(header);
        $('<th>').text('Gender').appendTo(header);
        $('<th>').text('Salary').appendTo(header);
        $('<th>').text('Status').appendTo(header);
    
        // Add rows for each staff member
        staffMembers.forEach(function(staffMember) {
            const row = $('<tr>').appendTo(table);
            $('<td>').text(staffMember.staff_id).appendTo(row);
            $('<td>').text(staffMember.fname).appendTo(row);
            $('<td>').text(staffMember.lname).appendTo(row);
            $('<td>').text(staffMember.designation).appendTo(row);
            $('<td>').text(staffMember.gender).appendTo(row);
            $('<td>').text(staffMember.salary).appendTo(row);
            $('<td>').text(staffMember.status).appendTo(row);
        });
    }
    
    function searchStaffMembers(query) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/searchStaffMembers',
            data: { query: query },
            success: function(staffMembers) {
                if (staffMembers.length > 0) {
                    displayStaffMembers(staffMembers);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#staffMemberList').empty(); // Clear staff member list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching staff members:', error);
                alert('Error searching staff members. Please try again.');
            }
        });
    }
    
    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        searchStaffMembers(query);
    });
    
    // Event listener for buttons
    $('#buttons button').click(function() {
        // Remove the 'active' class from all buttons
        $('#buttons button').removeClass('active');
        
        // Add the 'active' class to the clicked button
        $(this).addClass('active');
    
        // Fetch staff members based on the clicked button
        const status = $(this).text();
        if (status === 'All') {
            fetchStaffMembers();
        } else {
            fetchStaffMembers(status);
        }
    });
    fetchStaffMembers();    

    $('#addStaffMemberForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission
    
        // Get form data
        const formData = {
            staff_id: $('#staff_id').val(),
            fname: $('#fname').val(),
            lname: $('#lname').val(),
            designation: $('#designation').val(),
            gender: $('#gender').val(),
            salary: parseFloat($('#salary').val()),
            status: $('#status').val()
        };
    
        // Send AJAX POST request to add a staff member
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/add_staff_member',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Staff member added successfully');
                // Clear form fields after successful submission
                $('#addStaffMemberForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error adding staff member:', error);
                alert('Error adding staff member. Please try again.');
            }
        });
    });
    
    // Event listener for checking if staff ID already exists
    $('#staff_id').keyup(function() {
        const staff_id = $(this).val();
        if (staff_id.trim() !== '') {
            // Send AJAX request to check if the staff ID already exists
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/check_staff_id',
                data: JSON.stringify({ staff_id: staff_id }),
                contentType: 'application/json',
                success: function(response) {
                    // Response will be true if the staff ID exists, false otherwise
                    if (response.exists) {
                        $('#StaffIDError').addClass('error'); // Add a CSS class to indicate error
                        $('#StaffIDError').text('Staff ID already exists');
                        $('#addButton').prop('disabled', true);
                    } else {
                        $('#StaffIDError').removeClass('error'); // Remove the CSS class if staff ID is valid
                        $('#StaffIDError').text('');
                        $('#addButton').prop('disabled', false);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error('Error checking staff ID:', errorThrown);
                }
            });
        }
    });
    
    // Event listener for staff ID input field change
    $('#uStaffID').on('input', function() {
        var staffId = $(this).val();
        if (staffId) {
            $.ajax({
                type: 'GET',
                url: `http://localhost:4000/staff/${staffId}`,
                success: function(response) {
                    $('#uFname').val(response.fname);
                    $('#uLname').val(response.lname);
                    $('#uDesignation').val(response.designation);
                    $('#uGender').val(response.gender);
                    $('#uSalary').val(response.salary);
                    $('#uStatus').val(response.status);
                    $('#uStaffIDError').removeClass('error');
                    $('#uStaffIDError').text(''); // Clear any previous error message
                    $('#updateButton').prop('disabled', false);
                    $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').prop('disabled', false);
                },
                error: function(xhr) {
                    if (xhr.status === 404) {
                        $('#uStaffIDError').addClass('error');
                        $('#uStaffIDError').text('Staff ID not found');
                        $('#updateButton').prop('disabled', true);
                        $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').prop('disabled', true);
                        $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').val('');
                    } else {
                        console.error('Error fetching staff member:', xhr);
                        $('#uStaffIDError').text('Error fetching staff member. Please try again.');
                    }
                }
            });
        } else {
            $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').val('');
            $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').prop('disabled', true);
            $('#uStaffIDError').removeClass('error');
            $('#uStaffIDError').text('');
            $('#updateButton').prop('disabled', true);
        }
    });

    // Event listener for form submission
    $('#updateStaffMemberForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        var formData = {
            staffid: $('#uStaffID').val(),
            fname: $('#uFname').val(),
            lname: $('#uLname').val(),
            designation: $('#uDesignation').val(),
            gender: $('#uGender').val(),
            salary: $('#uSalary').val(),
            status: $('#uStatus').val()
        };

        // Send AJAX PUT request to update a staff member
        $.ajax({
            type: 'PUT',
            url: `http://localhost:4000/staff/${formData.staffid}`, // Update the URL to include the staff ID
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Staff member updated successfully');
                // Clear form fields after successful submission
                $('#updateStaffMemberForm')[0].reset();
                $('#uFname, #uLname, #uDesignation, #uGender, #uSalary, #uStatus').prop('disabled', true);
                $('#updateButton').prop('disabled', true);
            },
            error: function(xhr, status, error) {
                console.error('Error updating staff member:', error);
                alert('Error updating staff member. Please try again.');
            }
        });
    });

});