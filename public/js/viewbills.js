$(document).ready(function() {
    function fetchBills(type, status) {
        const url = type === 'inpatient' ? 'http://localhost:4000/inpatientbills' : 'http://localhost:4000/outpatientbills';
        $.ajax({
            type: 'GET',
            url: url,
            data: { status: status },
            success: function(bills) {
                if (bills.length > 0) {
                    displayBills(bills,type);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#billList').empty(); // Clear bill list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching bills:', error);
                alert('Error fetching bills. Please try again.');
            }
        });
    }
    function displayBills(bills, type) {
        // Clear previous bill list
        $('#billList').empty();
    
        // Create a table to display bills
        const table = $('<table>').appendTo('#billList');
        const header = $('<tr>').appendTo(table);
        $('<th>').text('Patient ID').appendTo(header);
        if (type === 'inpatient') {
            $('<th>').text('Service Fee').appendTo(header);
        } else {
            $('<th>').text('Basic Fee').appendTo(header);
        }
        $('<th>').text('Medical Fee').appendTo(header);
        $('<th>').text('Tax').appendTo(header);
        $('<th>').text('Total Amount').appendTo(header);
        $('<th>').text('Status').appendTo(header);
    
        // Add rows for each bill
        bills.forEach(function(bill) {
            const row = $('<tr>').appendTo(table);
            if (type === 'inpatient') {
                $('<td>').text(bill.admissionno).appendTo(row);
            } else {
                $('<td>').text(bill.patientid).appendTo(row);
            }
            
            if (type === 'inpatient') {
                $('<td>').text(bill.service_fee).appendTo(row);
            } else {
                $('<td>').text(bill.basicfee).appendTo(row);
            }
            $('<td>').text(bill.medical_fee).appendTo(row);
            $('<td>').text(bill.tax).appendTo(row);
            $('<td>').text(bill.total_amount).appendTo(row);
            $('<td>').text(bill.status).appendTo(row);
        });
    }

    function searchBills(query, type) {
        const url = type === 'inpatient' ? 'http://localhost:4000/searchInpatientBills' : 'http://localhost:4000/searchOutpatientBills';
        $.ajax({
            type: 'GET',
            url: url,
            data: { query: query },
            success: function(bills) {
                if (bills.length > 0) {
                    displayBills(bills,type);
                    $('#errorDisplay').hide(); // Hide error message if data is available
                } else {
                    $('#billList').empty(); // Clear bill list
                    $('#errorDisplay').show(); // Show error message
                }
            },
            error: function(xhr, status, error) {
                console.error('Error searching bills:', error);
                alert('Error searching bills. Please try again.');
            }
        });
    }

    // Event listener for search input
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        const type = $('#billType').val();
        searchBills(query, type);
    });

    // Event listener for filter buttons
    $('#buttons button').click(function() {
        $('#buttons button').removeClass('active'); // Remove the 'active' class from all buttons
        $(this).addClass('active'); // Add the 'active' class to the clicked button

        const status = $(this).text();
        const type = $('#billType').val();
        if (status === 'All') {
            fetchBills(type);
        } else {
            fetchBills(type, status);
        }
    });

    // Event listener for bill type selection
    $('#billType').change(function() {
        $('#searchInput').val(''); // Reset search input
        $('#buttons button').removeClass('active'); // Remove 'active' class from all buttons
        $('#allBills').addClass('active'); // Set 'All' button as active

        const type = $(this).val();
        fetchBills(type); // Fetch bills based on the selected type
    });

    // Initial fetch for all inpatient bills
    fetchBills('inpatient');
});
