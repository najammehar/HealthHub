$(document).ready(function() {
    function fetchServices(serviceType) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/fetch_services',
            data: { serviceType: serviceType },
            success:  function(services) {
                if (services.length > 0) {
                    displayServices(services);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#serviceList').empty(); // Clear service list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching services:', error);
                alert('Error fetching services. Please try again.');
            }
        });
    }
    
    // Function to display services
    function displayServices(services) {
        // Clear previous service list
        $('#serviceList').empty();
    
        // Create a table to display services
        const table = $('<table>').appendTo('#serviceList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('ID').appendTo(header);
        $('<th>').text('Full Name').appendTo(header);
        $('<th>').text('Cost Per Day').appendTo(header);
        $('<th>').text('Type').appendTo(header);

        // Add rows for each service
        services.forEach(function(service) {
            const row = $('<tr>').appendTo(table);
            $('<td>').text(service.serviceid).appendTo(row);
            $('<td>').text(service.fullname).appendTo(row);
            $('<td>').text(service.cost_per_day).appendTo(row);
            $('<td>').text(service.serviceType).appendTo(row);
        });
    }
    
    function searchServices(query) {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:4000/searchServices',
            data: { query: query },
            success: function(services) {
                if (services.length > 0) {
                    displayServices(services);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#serviceList').empty(); // Clear service list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching services:', error);
                alert('Error searching services. Please try again.');
            }
        });
    }
    
    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        searchServices(query);
    });
    
    // Event listener for buttons
    $('#buttons button').click(function() {
        // Remove the 'active' class from all buttons
        $('#buttons button').removeClass('active');
        
        // Add the 'active' class to the clicked button
        $(this).addClass('active');
    
        // Fetch services based on the clicked button
        const serviceType = $(this).text();
        if (serviceType === 'All') {
            fetchServices();
        } else {
            fetchServices(serviceType);
        }
    });
    fetchServices();


    // Event listener for form submission
    $('#addServiceForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        const formData = {
            serviceid: $('#serviceID').val(),
            fullname: $('#fullname').val(),
            cost_per_day: parseFloat($('#costPerDay').val()),
            serviceType: $('#serviceType').val()
        };

        // Send AJAX POST request to add service
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/add_Service',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Service added successfully');
                // Clear form fields after successful submission
                $('#addServiceForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error adding Service:', error);
                alert('Error adding Service. Please try again.');
            }
        });
    });

    $('#serviceID').keyup(function() {
        const serviceid = $(this).val();
        if (serviceid.trim() !== '') {
            // Send AJAX request to check if the serviceid already exists
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/checkServiceID',
                data: JSON.stringify({ serviceid: serviceid }),
                contentType: 'application/json',
                success: function(response) {
                    // Response will be true if the serviceid exists, false otherwise
                    if (response.exists) {
                        $('#serviceIDError').addClass('error'); // Add a CSS class to indicate error
                        $('#serviceIDError').text('Service ID already exists');
                        $('#addButton').prop('disabled', true);
                    } else {
                        $('#serviceIDError').removeClass('error'); // Remove the CSS class if serviceid is valid
                        $('#serviceIDError').text('');
                        $('#addButton').prop('disabled', false);
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    console.error('Error checking Service ID:', errorThrown);
                }
            });
        }
    });
    // Update
    $('#uFullname').prop('disabled', true);
    $('#uCostPerDay').prop('disabled', true);
    $('#uServiceType').prop('disabled', true);
    // Event listener for service ID input field change
    $('#uServiceID').on('input', function() {
        var serviceId = $(this).val();
        if (serviceId) {
            $.ajax({
                type: 'GET',
                url: `http://localhost:4000/ser_c&p/${serviceId}`,
                success: function(response) {
                    $('#uFullname').val(response.fullname);
                    $('#uCostPerDay').val(response.cost_per_day);
                    $('#uServiceType').val(response.serviceType);
                    $('#uServiceIDError').removeClass('error');
                    $('#uServiceIDError').text(''); // Clear any previous error message
                    $('#updateButton').prop('disabled', false);
                    $('#uFullname').prop('disabled', false);
                    $('#uCostPerDay').prop('disabled', false);
                    $('#uServiceType').prop('disabled', false);
                    
                },
                error: function(xhr) {
                    if (xhr.status === 404) {
                        $('#uServiceIDError').addClass('error');
                        $('#uServiceIDError').text('Service ID not found');
                        $('#updateButton').prop('disabled', true);
                        $('#uFullname').prop('disabled', true);
                        $('#uCostPerDay').prop('disabled', true);
                        $('#uServiceType').prop('disabled', true);
                        $('#uFullname').val('');
                        $('#uCostPerDay').val('');
                        $('#uServiceType').val('');
                    } else {
                        console.error('Error fetching service:', xhr);
                        $('#idError').text('Error fetching service. Please try again.');
                    }
                }
            });
        } else {
            $('#uFullname').val('');
            $('#uCostPerDay').val('');
            $('#uServiceType').val('');
            $('#uFullname').prop('disabled', true);
            $('#uCostPerDay').prop('disabled', true);
            $('#uServiceType').prop('disabled', true);
            $('#uServiceIDError').removeClass('error');
            $('#uServiceIDError').text('');
            $('#addButton').prop('disabled', false);
        }
    });

    // Event listener for form submission
    $('#updateServiceForm').submit(function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Get form data
        var formData = {
            serviceid: $('#uServiceID').val(),
            fullname: $('#uFullname').val(),
            cost_per_day: $('#uCostPerDay').val(),
            serviceType: $('#uServiceType').val()
        };

        // Send AJAX PUT request to update a service
        $.ajax({
            type: 'PUT',
            url: `http://localhost:4000/services/${formData.serviceid}`, // Update the URL to include the service ID
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Service updated successfully');
                // Clear form fields after successful submission
                $('#updateServiceForm')[0].reset();
            },
            error: function(xhr, status, error) {
                console.error('Error updating service:', error);
                alert('Error updating service. Please try again.');
            }
        });
    });
});
