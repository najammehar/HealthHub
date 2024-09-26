$(document).ready(function() {
    function fetchMedicines(status) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/medicines',
            data: { status: status },
            success: function(medicines) {
                if (medicines.length > 0) {
                    displayMedicines(medicines);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#medicineList').empty(); // Clear medicine list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching medicines:', error);
                alert('Error fetching medicines. Please try again.');
            }
        });
    }
    
    // Function to display medicines
    function displayMedicines(medicines) {
        // Clear previous medicine list
        $('#medicineList').empty();
    
        // Create a table to display medicines
        const table = $('<table>').appendTo('#medicineList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('ID').appendTo(header);
        $('<th>').text('Medicine Name').appendTo(header);
        $('<th>').text('Manufacturer').appendTo(header);
        $('<th>').text('Cost Per Unit').appendTo(header);
        $('<th>').text('Status').appendTo(header);
    
        // Add rows for each medicine
        medicines.forEach(function(medicine) {
            const row = $('<tr>').appendTo(table);
            $('<td>').text(medicine.medicineid).appendTo(row);
            $('<td>').text(medicine.medicineName).appendTo(row);
            $('<td>').text(medicine.manufacturer).appendTo(row);
            $('<td>').text(medicine.costPerUnit).appendTo(row);
            $('<td>').text(medicine.status).appendTo(row);
        });
    }
    
    function searchMedicines(query) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/searchMedicines',
            data: { query: query },
            success: function(medicines) {
                if (medicines.length > 0) {
                    displayMedicines(medicines);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#medicineList').empty(); // Clear medicine list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching medicines:', error);
                alert('Error searching medicines. Please try again.');
            }
        });
    }
    
    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        searchMedicines(query);
    });
    
    // Event listener for buttons
    $('#buttons button').click(function() {
        // Remove the 'active' class from all buttons
        $('#buttons button').removeClass('active');
        
        // Add the 'active' class to the clicked button
        $(this).addClass('active');
    
        // Fetch medicines based on the clicked button
        const status = $(this).text();
        if (status === 'All') {
            fetchMedicines();
        } else {
            fetchMedicines(status);
        }
    });
    fetchMedicines();

    // Event listener for form submission
    $('#addMedicineForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const formData = {
            medicineid: $('#medicineID').val(),
            medicineName: $('#medicineName').val(),
            manufacturer: $('#manufacturer').val(),
            costPerUnit: parseFloat($('#costPerUnit').val()),
            status: $('#status').val()
        };

        // Send AJAX POST request to add medicine
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/add_Medicine',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Medicine added successfully');
                // Clear form fields after successful submission
                $('#addMedicineForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error adding Medicine:', error);
                alert('Error adding Medicine. Please try again.');
            }
        });
    });


    $('#medicineID').keyup(function() {
        const medicineid = $(this).val();
        if (medicineid.trim() !== '') {
            // Send AJAX request to check if the medicineid already exists
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkMedicineID',
                data: JSON.stringify({ medicineid: medicineid }),
                contentType: 'application/json',
                success: function(response) {
                    // Response will be true if the medicineid exists, false otherwise
                    if (response.exists) {
                        $('#medicineIDError').addClass('error'); // Add a CSS class to indicate error
                        $('#medicineIDError').text('Medicine ID already exists');
                        $('#addButton').prop('disabled', true);
                    } else {
                        $('#medicineIDError').removeClass('error'); // Remove the CSS class if medicineid is valid
                        $('#medicineIDError').text('');
                        $('#addButton').prop('disabled', false);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error('Error checking Medicine ID:', errorThrown);
                }
            });
        }
    });

    // Disable input fields initially
$('#uMedicineName').prop('disabled', true);
$('#uManufacturer').prop('disabled', true);
$('#uCostPerUnit').prop('disabled', true);
$('#uStatus').prop('disabled', true);

// Event listener for medicine ID input field change
$('#uMedicineID').on('input', function() {
    var medicineId = $(this).val();
    if (medicineId) {
        $.ajax({
            type: 'GET',
            url: `http://localhost:4000/medicines/${medicineId}`,
            success: function(response) {
                $('#uMedicineName').val(response.medicineName);
                $('#uManufacturer').val(response.manufacturer);
                $('#uCostPerUnit').val(response.costPerUnit);
                $('#uStatus').val(response.status);
                $('#uMedicineIDError').removeClass('error');
                $('#uMedicineIDError').text(''); // Clear any previous error message
                $('#updateButton').prop('disabled', false);
                $('#uMedicineName').prop('disabled', false);
                $('#uManufacturer').prop('disabled', false);
                $('#uCostPerUnit').prop('disabled', false);
                $('#uStatus').prop('disabled', false);
            },
            error: function(xhr) {
                if (xhr.status === 404) {
                    $('#uMedicineIDError').addClass('error');
                    $('#uMedicineIDError').text('Medicine ID not found');
                    $('#updateButton').prop('disabled', true);
                    $('#uMedicineName').prop('disabled', true);
                    $('#uManufacturer').prop('disabled', true);
                    $('#uCostPerUnit').prop('disabled', true);
                    $('#uStatus').prop('disabled', true);
                    $('#uMedicineName').val('');
                    $('#uManufacturer').val('');
                    $('#uCostPerUnit').val('');
                    $('#uStatus').val('');
                } else {
                    console.error('Error fetching medicine:', xhr);
                    $('#uMedicineIDError').text('Error fetching medicine. Please try again.');
                }
            }
        });
    } else {
        $('#uMedicineName').val('');
        $('#uManufacturer').val('');
        $('#uCostPerUnit').val('');
        $('#uStatus').val('');
        $('#uMedicineName').prop('disabled', true);
        $('#uManufacturer').prop('disabled', true);
        $('#uCostPerUnit').prop('disabled', true);
        $('#uStatus').prop('disabled', true);
        $('#uMedicineIDError').removeClass('error');
        $('#uMedicineIDError').text('');
        $('#addButton').prop('disabled', false);
    }
});

// Event listener for form submission
$('#updateMedicineForm').submit(function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    var formData = {
        medicineID: $('#uMedicineID').val(),
        medicineName: $('#uMedicineName').val(),
        manufacturer: $('#uManufacturer').val(),
        costPerUnit: $('#uCostPerUnit').val(),
        status: $('#uStatus').val()
    };

    // Send AJAX PUT request to update a medicine
    $.ajax({
        type: 'PUT',
        url: `http://localhost:4000/medicines/${formData.medicineID}`, // Update the URL to include the medicine ID
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function(response) {
            alert('Medicine updated successfully');
            // Clear form fields after successful submission
            $('#updateMedicineForm')[0].reset();
        },
        error: function(xhr, status, error) {
            console.error('Error updating medicine:', error);
            alert('Error updating medicine. Please try again.');
        }
    });
});


});
