$(document).ready(function() {
    function fetchWards(sortBy) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/wards',
            data: { sortBy: sortBy },
            success: function(wards) {
                if (wards.length > 0) {
                    displayWards(wards);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#wardList').empty(); // Clear ward list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching wards:', error);
                alert('Error fetching wards. Please try again.');
            }
        });
    }

    // Function to display wards
    function displayWards(wards) {
        // Clear previous ward list
        $('#wardList').empty();

        // Create a table to display wards
        const table = $('<table>').appendTo('#wardList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('Ward No').appendTo(header);
        $('<th>').text('Type').appendTo(header);
        $('<th>').text('Capacity').appendTo(header);

        // Add rows for each ward
        wards.forEach(function(ward) {
            const row = $('<tr>').appendTo(table);
            $('<td>').text(ward.wardno).appendTo(row);
            $('<td>').text(ward.wardtype).appendTo(row);
            $('<td>').text(ward.capacity).appendTo(row);
        });
    }

    function searchWards(query) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/searchWards',
            data: { query: query },
            success: function(wards) {
                if (wards.length > 0) {
                    displayWards(wards);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#wardList').empty(); // Clear ward list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching wards:', error);
                alert('Error searching wards. Please try again.');
            }
        });
    }

    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        searchWards(query);
    });

    // Event listener for buttons
    $('#buttons button').click(function() {
        // Remove the 'active' class from all buttons
        $('#buttons button').removeClass('active');
        
        // Add the 'active' class to the clicked button
        $(this).addClass('active');

        // Fetch wards based on the clicked button
        const sortBy = $(this).val();
        fetchWards(sortBy);
    });

    // Initial fetch of all wards
    fetchWards();



    $('#addWardForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const strCapacity = $('#capacity').val();
        const formData = {
            wardno: $('#wardno').val(),
            wardtype: $('#wardtype').val(),
            capacity: parseInt(strCapacity, 10)
        };

        // Send AJAX POST request to add a ward
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/add_Ward',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Ward added successfully');
                // Clear form fields after successful submission
                $('#addWardForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error adding Ward:', error);
                alert('Error adding Ward. Please try again.');
            }
        });
    });

    // Event listener for checking if ward number already exists
    $('#wardno').keyup(function() {
        const wardno = $(this).val();
        if (wardno.trim() !== '') {
            // Send AJAX request to check if the ward number already exists
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkWardNo',
                data: JSON.stringify({ wardno: wardno }),
                contentType: 'application/json',
                success: function(response) {
                    // Response will be true if the ward number exists, false otherwise
                    if (response.exists) {
                        $('#WardNoError').addClass('error'); // Add a CSS class to indicate error
                        $('#WardNoError').text('Ward number already exists');
                        $('#addButton').prop('disabled', true);
                    } else {
                        $('#WardNoError').removeClass('error'); // Remove the CSS class if ward number is valid
                        $('#WardNoError').text('');
                        $('#addButton').prop('disabled', false);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error('Error checking Ward number:', errorThrown);
                }
            });
        }
    });
// Initially disable input fields
$('#uCapacity').prop('disabled', true);
$('#uWardType').prop('disabled', true);

// Event listener for ward ID input field change
$('#uWardNo').on('input', function() {
    var wardId = $(this).val();
    if (wardId) {
        $.ajax({
            type: 'GET',
            url: `http://localhost:4000/ward/${wardId}`,
            success: function(response) {
                $('#uCapacity').val(response.capacity);
                $('#uWardType').val(response.wardtype);
                $('#uWardNoError').removeClass('error');
                $('#uWardNoError').text(''); // Clear any previous error message
                $('#updateButton').prop('disabled', false);
                $('#uCapacity').prop('disabled', false);
                $('#uWardType').prop('disabled', false);
            },
            error: function(xhr) {
                if (xhr.status === 404) {
                    $('#uWardNoError').addClass('error');
                    $('#uWardNoError').text('Ward ID not found');
                    $('#updateButton').prop('disabled', true);
                    $('#uCapacity').prop('disabled', true);
                    $('#uWardType').prop('disabled', true);
                    $('#uCapacity').val('');
                    $('#uWardType').val('');
                } else {
                    console.error('Error fetching ward:', xhr);
                    $('#uWardNoError').text('Error fetching ward. Please try again.');
                }
            }
        });
    } else {
        $('#uCapacity').val('');
        $('#uWardType').val('');
        $('#uCapacity').prop('disabled', true);
        $('#uWardType').prop('disabled', true);
        $('#uWardNoError').removeClass('error');
        $('#uWardNoError').text('');
        $('#updateButton').prop('disabled', true);
    }
});

// Event listener for form submission
$('#updateWardForm').submit(function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    var formData = {
        wardno: $('#uWardNo').val(),
        capacity: parseInt($('#uCapacity').val()),
        wardtype: $('#uWardType').val()
    };

    // Send AJAX PUT request to update a ward
    $.ajax({
        type: 'PUT',
        url: `http://localhost:4000/wards/${formData.wardid}`, // Update the URL to include the ward ID
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(response) {
            alert('Ward updated successfully');
            // Clear form fields after successful submission
            $('#updateWardForm')[0].reset();
        },
        error: function(xhr, status, error) {
            console.error('Error updating ward:', error);
            alert('Error updating ward. Please try again.');
        }
    });
});

});
